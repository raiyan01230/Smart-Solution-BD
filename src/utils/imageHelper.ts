import { supabase, IS_SUPABASE_CONFIGURED } from '../lib/supabase';

/**
 * Resizes and compresses an image file on the client using HTML5 Canvas.
 * Generates an optimized Blob for uploading to Supabase Storage and a Base64 data URL.
 */
export async function compressImageToBlob(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ blob: file, dataUrl: e.target?.result as string });
          return;
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => {
            resolve({ blob: blob || file, dataUrl });
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file directly to Supabase Storage bucket ('product-images').
 * Returns the public CDN URL from Supabase Storage, or null if upload fails.
 */
export async function uploadToSupabaseStorage(file: File): Promise<string | null> {
  if (!IS_SUPABASE_CONFIGURED || !supabase) return null;

  try {
    const { blob } = await compressImageToBlob(file);
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
    const filePath = `products/${cleanFileName}`;

    // Target bucket for product images
    let targetBucket = 'product-images';
    let { error: uploadError } = await supabase.storage
      .from(targetBucket)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '31536000',
        upsert: true,
      });

    // If bucket doesn't exist yet, attempt to create it with public access enabled
    if (uploadError) {
      console.warn(`Initial upload to bucket "${targetBucket}" failed:`, uploadError.message);
      try {
        await supabase.storage.createBucket('product-images', { public: true });
        const retry = await supabase.storage.from(targetBucket).upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000',
          upsert: true,
        });
        uploadError = retry.error;
      } catch (err) {
        console.warn('Failed to auto-create bucket:', err);
      }

      // If still error, try fallback bucket 'products'
      if (uploadError) {
        targetBucket = 'products';
        const fallback = await supabase.storage.from(targetBucket).upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000',
          upsert: true,
        });
        uploadError = fallback.error;
      }
    }

    if (!uploadError) {
      const { data } = supabase.storage.from(targetBucket).getPublicUrl(filePath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } else {
      console.error('Supabase Storage upload returned error:', uploadError);
    }
  } catch (err) {
    console.error('Supabase Storage upload exception:', err);
  }

  return null;
}

/**
 * Processes an image from the computer:
 * 1. If Supabase is connected, uploads directly to Supabase Storage and returns the public CDN URL.
 * 2. If Supabase is not connected, safely falls back to optimized Base64 so nothing breaks.
 */
export async function processComputerImage(file: File): Promise<string> {
  if (IS_SUPABASE_CONFIGURED && supabase) {
    const supabaseUrl = await uploadToSupabaseStorage(file);
    if (supabaseUrl) {
      return supabaseUrl;
    }
  }

  // Fallback to optimized data URL so process never breaks
  const { dataUrl } = await compressImageToBlob(file);
  return dataUrl;
}

/**
 * Processes multiple images selected from the computer at once.
 */
export async function processMultipleComputerImages(files: FileList | File[]): Promise<string[]> {
  const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
  const uploadPromises = fileArray.slice(0, 10).map((file) => processComputerImage(file));
  return Promise.all(uploadPromises);
}

/**
 * Checks if an image URL is hosted on Supabase Storage.
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('supabase.co/storage') || url.includes('/storage/v1/object/public/');
}

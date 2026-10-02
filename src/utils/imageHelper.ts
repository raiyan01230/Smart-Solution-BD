import { supabase, IS_SUPABASE_CONFIGURED } from '../lib/supabase';

/**
 * Resizes and compresses an image file on the client using HTML5 Canvas.
 * Generates an optimized JPEG/WebP Base64 data URL.
 */
export async function compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Failed to load image data'));
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
          resolve(e.target?.result as string);
          return;
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file from the user's computer.
 * If Supabase Storage is configured and accessible, uploads to cloud bucket.
 * Otherwise, seamlessly falls back to the compressed base64 data URL so upload never fails.
 */
export async function processComputerImage(file: File): Promise<string> {
  const compressedDataUrl = await compressImageFile(file);

  // If Supabase is configured, attempt cloud bucket upload
  if (IS_SUPABASE_CONFIGURED && supabase) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      }
    } catch {
      // Fallback silently to compressed data URL
    }
  }

  // Returns compressed Data URL (reliable, works everywhere including GitHub Pages)
  return compressedDataUrl;
}

/**
 * Processes multiple images selected from the computer at once.
 */
export async function processMultipleComputerImages(files: FileList | File[]): Promise<string[]> {
  const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
  const uploadPromises = fileArray.slice(0, 10).map((file) => processComputerImage(file));
  return Promise.all(uploadPromises);
}

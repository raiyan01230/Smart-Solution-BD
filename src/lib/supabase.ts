import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or localStorage override with defensive checking
const getSupabaseConfig = () => {
  try {
    const envUrl = import.meta.env?.VITE_SUPABASE_URL;
    const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
    const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('ssbd_supabase_url') : null;
    const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('ssbd_supabase_key') : null;

    const url = (localUrl || envUrl || '').trim();
    const key = (localKey || envKey || '').trim();

    // Verify URL validity
    let isValidUrl = false;
    if (url && key) {
      try {
        new URL(url);
        isValidUrl = true;
      } catch {
        isValidUrl = false;
      }
    }

    return { url, key, isConfigured: isValidUrl };
  } catch (err) {
    console.warn('Error reading Supabase configuration:', err);
    return { url: '', key: '', isConfigured: false };
  }
};

export const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, isConfigured: IS_SUPABASE_CONFIGURED } = getSupabaseConfig();

export const supabase: SupabaseClient | null = (() => {
  if (!IS_SUPABASE_CONFIGURED) return null;
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    });
  } catch (e) {
    console.warn('Supabase client failed to initialize, running offline:', e);
    return null;
  }
})();

export const updateSupabaseCredentials = (url: string, key: string) => {
  try {
    localStorage.setItem('ssbd_supabase_url', url.trim());
    localStorage.setItem('ssbd_supabase_key', key.trim());
    window.location.reload();
  } catch (e) {
    console.error('Failed to update credentials:', e);
  }
};

export const clearSupabaseCredentials = () => {
  try {
    localStorage.removeItem('ssbd_supabase_url');
    localStorage.removeItem('ssbd_supabase_key');
    window.location.reload();
  } catch (e) {
    console.error('Failed to clear credentials:', e);
  }
};

export const testSupabaseConnection = async (testUrl: string, testKey: string): Promise<{ success: boolean; message: string }> => {
  try {
    const cleanUrl = testUrl.trim();
    const cleanKey = testKey.trim();
    new URL(cleanUrl);
    const testClient = createClient(cleanUrl, cleanKey);
    const { error } = await testClient.from('products').select('id').limit(1);
    if (error) {
      // Table doesn't exist yet, but credentials are valid!
      if (error.code === '42P01' || error.message?.includes('relation "products" does not exist')) {
        return {
          success: true,
          message: 'Connection successful! (Table "products" needs to be created. Use the 1-click SQL schema below).',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connection established and "products" table verified!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Invalid Supabase URL or network connection failed' };
  }
};

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or localStorage override with defensive checking
const getSupabaseConfig = () => {
  try {
    const envUrl = import.meta.env?.VITE_SUPABASE_URL;
    const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
    const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('ssbd_supabase_url') : null;
    const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('ssbd_supabase_key') : null;

    const url = localUrl || envUrl || '';
    const key = localKey || envKey || '';

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
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn('Supabase client failed to initialize, running offline:', e);
    return null;
  }
})();

export const updateSupabaseCredentials = (url: string, key: string) => {
  try {
    localStorage.setItem('ssbd_supabase_url', url);
    localStorage.setItem('ssbd_supabase_key', key);
    window.location.reload();
  } catch (e) {
    console.error('Failed to update credentials:', e);
  }
};

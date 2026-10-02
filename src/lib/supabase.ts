import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or localStorage override
const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('ssbd_supabase_url');
  const localKey = localStorage.getItem('ssbd_supabase_key');

  const url = localUrl || envUrl || '';
  const key = localKey || envKey || '';

  return { url, key, isConfigured: Boolean(url && key) };
};

export const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY, isConfigured: IS_SUPABASE_CONFIGURED } = getSupabaseConfig();

export const supabase: SupabaseClient | null = IS_SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const updateSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('ssbd_supabase_url', url);
  localStorage.setItem('ssbd_supabase_key', key);
  window.location.reload();
};

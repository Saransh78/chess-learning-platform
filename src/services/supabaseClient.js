import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || "";
const SUPABASE_ANON_KEY =
  (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Single shared client. Supabase persists the session in localStorage and
// refreshes it automatically. No service-role keys are used here.
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

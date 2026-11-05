import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Cash Security Warning]: Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing. Check .env configuration.'
  );
}

/**
 * Cash Supabase Client
 * 
 * SECURITY NOTE:
 * - This client uses the standard Publishable/Anon Key.
 * - It is completely safe for public browser exposure because PostgreSQL
 *   Row Level Security (RLS) restricts queries to the currently authenticated user's data.
 * - The `service_role` key MUST NEVER be placed here or in any client-facing source code!
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

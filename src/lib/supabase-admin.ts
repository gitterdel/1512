import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Cliente de Supabase con privilegios de admin para operaciones del servidor
export const supabaseAdmin = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const initSupabase = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
};

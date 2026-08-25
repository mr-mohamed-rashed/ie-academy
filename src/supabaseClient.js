import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://luhaxtokriahwqruaymr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ofzb67GhUvtuPpHXRrLT5w_o4t3laqY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

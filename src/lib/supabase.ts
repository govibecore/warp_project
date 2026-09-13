import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || process.env?.VITE_SUPABASE_URL || 'https://uanqjksfodudwkakyglt.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || process.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_T8BWgvUCR4w5cO_l3iO0HA_VM9ygNjX';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

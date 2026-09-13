import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL);
const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = envUrl || 'https://uanqjksfodudwkakyglt.supabase.co';
const supabaseAnonKey = envKey || 'sb_publishable_T8BWgvUCR4w5cO_l3iO0HA_VM9ygNjX';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

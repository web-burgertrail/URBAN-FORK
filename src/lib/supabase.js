import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://corxomdhrtfrguoguatx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcnhvbWRocnRmcmd1b2d1YXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MTQ2MDgsImV4cCI6MjEwNTM5MDYwOH0.Ch8ZBIrAMODA4llV0syXZmQgivYwsdGmuG6ntmhO5Ag';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

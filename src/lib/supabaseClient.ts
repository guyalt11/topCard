import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nhmrdnczfxomarpncyot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obXJkbmN6ZnhvbWFycG5jeW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MjkxMDAsImV4cCI6MjA2MzQwNTEwMH0.-dSIBlkOHATZ6IXr_dQZIY6GEI98UeoP7JJHyFH1880';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'YOUR_SUPABASE_URL',  //https://aujqawtopislkkvayrlf.supabase.co/rest/v1/
  'YOUR_SUPABASE_KEY'   //sb_secret_IZSCPhJVpIzDo51a1PNbQA_b0IfqiBD
);
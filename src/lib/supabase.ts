// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Prevent multiple instances in development (HMR safe)
let supabaseInstance: ReturnType<typeof createClient>;

export const supabase =
  supabaseInstance ??
  (supabaseInstance = createClient(supabaseUrl, supabaseAnonKey));


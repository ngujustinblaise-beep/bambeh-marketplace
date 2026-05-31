import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env variables. Check your .env file.");
}

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;

export type ProductRow = any;
export type ShopRow = any;
export type OrderRow = any;
export type OrderItemRow = any;
export type UserRow = any;
export type MessageRow = any;
export type ReviewRow = any;
export type WishlistRow = any;
export type NotificationLogRow = any;
export type CategoryRow = any;
export type PaymentRow = any;
export type PaymentMethod = any;

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Using 'any' generic removes "never" type errors on all table operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
export default supabase;

// Row type aliases for supabaseService imports
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

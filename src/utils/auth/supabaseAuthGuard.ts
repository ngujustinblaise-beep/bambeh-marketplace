/**
 * supabaseAuthGuard.ts â€” Bambeh Marketplace
 * ============================================================
 * REPLACES: isAdminAuthenticated(), isUserLoggedIn(),
 *           isVendorAuthenticated(), isUserSubscribed()
 *
 * WHY: Those functions read from localStorage which any user
 * can manipulate in 5 seconds with browser DevTools.
 * These functions call Supabase's server â€” the JWT is
 * cryptographically signed and CANNOT be faked client-side.
 * ============================================================
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export { supabase };

// â”€â”€â”€ TYPE DEFINITIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
}

export interface SubscriptionStatus {
  active: boolean;
  tier: "free" | "basic" | "premium" | "enterprise";
  expiresAt?: string;
}

export interface VendorStatus {
  isVendor: boolean;
  vendorId?: string;
  verified?: boolean;
}

// â”€â”€â”€ 1. USER AUTH â€” Calls Supabase server, cannot be faked â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns the currently authenticated user, verified by Supabase JWT.
 * Returns null if not authenticated or token is expired/invalid.
 *
 * @example
 * const user = await getVerifiedUser();
 * if (!user) return <Navigate to="/login" />;
 */
export async function getVerifiedUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return { id: user.id, email: user.email, phone: user.phone };
  } catch {
    return null;
  }
}

// â”€â”€â”€ 2. SUBSCRIPTION CHECK â€” Reads Supabase DB, not localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns subscription status for a verified user.
 * Reads from the 'profiles' table in Supabase â€” server-enforced.
 * RLS policies ensure a user can ONLY read their own row.
 *
 * @example
 * const sub = await getVerifiedSubscription(user.id);
 * if (!sub.active) return <Navigate to="/subscription" />;
 */
export async function getVerifiedSubscription(
  userId: string
): Promise<SubscriptionStatus> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("subscription_active, subscription_tier, subscription_expires_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return { active: false, tier: "free" };
    }

    // Check expiry
    const isExpired =
      data.subscription_expires_at &&
      new Date(data.subscription_expires_at) < new Date();

    return {
      active: data.subscription_active === true && !isExpired,
      tier: data.subscription_tier ?? "free",
      expiresAt: data.subscription_expires_at,
    };
  } catch {
    return { active: false, tier: "free" };
  }
}

// â”€â”€â”€ 3. ADMIN ROLE CHECK â€” Reads user_roles table, not localStorage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns true ONLY if user has role='admin' in the user_roles table.
 * This table has RLS: only service_role can write to it.
 * A user CANNOT grant themselves admin via browser DevTools.
 *
 * @example
 * const isAdmin = await getVerifiedAdmin(user.id);
 * if (!isAdmin) return <Navigate to="/" />;
 */
export async function getVerifiedAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    return !error && data?.role === "admin";
  } catch {
    return false;
  }
}

// â”€â”€â”€ 4. VENDOR ROLE CHECK â€” Reads user_roles table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Returns vendor status for a verified user.
 *
 * @example
 * const vendor = await getVerifiedVendor(user.id);
 * if (!vendor.isVendor) return <Navigate to="/vendor/signin" />;
 */
export async function getVerifiedVendor(
  userId: string
): Promise<VendorStatus> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "vendor")
      .single();

    if (error || !data) return { isVendor: false };

    // Also check vendor profile for verification status
    const { data: vendorData } = await supabase
      .from("vendors")
      .select("id, verified")
      .eq("user_id", userId)
      .single();

    return {
      isVendor: true,
      vendorId: vendorData?.id,
      verified: vendorData?.verified ?? false,
    };
  } catch {
    return { isVendor: false };
  }
}

// â”€â”€â”€ 5. SIGN OUT â€” Clears Supabase session (not just localStorage) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Signs out the user from Supabase Auth.
 * This invalidates the JWT on the server side.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  // Clear any legacy localStorage keys from old auth system
  const legacyKeys = [
    "Bambeh_user",
    "Bambeh_vendor",
    "Bambeh_subscription",
    "Bambeh_admin",
  ];
  legacyKeys.forEach((k) => localStorage.removeItem(k));
}

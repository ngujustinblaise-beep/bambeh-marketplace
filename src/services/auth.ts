import { supabase } from "@/lib/supabase";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username?: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  tier: string;
  isVerified: boolean;
  region?: string;
  city?: string;
  zermCoins: number;
  subscriptionStatus: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

class AuthService {
  async signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });
    if (error) return { user: null, error: error.message };
    if (authData.user) {
      await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          username: data.username || data.email.split("@")[0],
          phone: data.phone || null,
        })
        .eq("id", authData.user.id);
    }
    return { user: authData.user, error: null };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) return { user: null, session: null, error: error.message };
    return { user: data.user, session: data.session, error: null };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message || null };
  }

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name || "",
      username: data.username || "",
      phone: data.phone,
      avatarUrl: data.avatar_url,
      role: data.role || "user",
      tier: data.tier || "basic",
      isVerified: data.is_verified || false,
      region: data.region,
      city: data.city,
      zermCoins: data.zerm_coins || 0,
      subscriptionStatus: data.subscription_status || "inactive",
      subscriptionExpiresAt: data.subscription_expires_at,
      createdAt: data.created_at,
    };
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.fullName,
        username: updates.username,
        phone: updates.phone,
        avatar_url: updates.avatarUrl,
        region: updates.region,
        city: updates.city,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    return { error: error?.message || null };
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message || null };
  }

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message || null };
  }

  async uploadAvatar(userId: string, file: File) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) return { url: null, error: error.message };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", userId);
    return { url: data.publicUrl, error: null };
  }

  async updatePushToken(userId: string, token: string) {
    await supabase
      .from("profiles")
      .update({ push_token: token })
      .eq("id", userId);
  }

  validateSignUp(data: SignUpData): string | null {
    if (!data.email?.includes("@")) return "Valid email required";
    if (!data.password || data.password.length < 6)
      return "Password must be at least 6 characters";
    if (!data.fullName || data.fullName.trim().length < 2)
      return "Full name required";
    return null;
  }
}

export const authService = new AuthService();
export default authService;

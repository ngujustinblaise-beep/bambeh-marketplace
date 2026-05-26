// FCM token service — stores device tokens in Supabase
import { supabase } from "@/lib/supabase";

export const saveFCMToken = async (userId: string, token: string): Promise<void> => {
  const { error } = await supabase
    .from("fcm_tokens")
    .upsert({ user_id: userId, token, updated_at: new Date().toISOString() });
  if (error) console.error("[FCM] Failed to save token:", error.message);
};

export const deleteFCMToken = async (userId: string, token: string): Promise<void> => {
  await supabase.from("fcm_tokens").delete().eq("user_id", userId).eq("token", token);
};

export const getUserTokens = async (userId: string): Promise<string[]> => {
  const { data } = await supabase.from("fcm_tokens").select("token").eq("user_id", userId);
  return (data ?? []).map((r: { token: string }) => r.token);
};

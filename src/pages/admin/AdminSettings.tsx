import { useLang, t } from "@/hooks/useAppLang";

export default function AdminSettings() {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="bg-white rounded-xl shadow p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">AdminSettings</h1>
      <p className="text-gray-500">Connect to Supabase to load live data.</p>
    </div>
  );
}





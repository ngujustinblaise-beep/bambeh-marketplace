import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Bell, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

interface NotifSettings { new_order:boolean; order_status_change:boolean; new_message:boolean; new_review:boolean; low_stock:boolean; payment_received:boolean; promotion_alerts:boolean; platform_updates:boolean; email_notifications:boolean; sms_notifications:boolean; push_notifications:boolean; }
const defaultSettings: NotifSettings = { new_order:true, order_status_change:true, new_message:true, new_review:true, low_stock:true, payment_received:true, promotion_alerts:false, platform_updates:false, email_notifications:true, sms_notifications:false, push_notifications:true };

function Toggle({label,desc,value,onChange}:{label:string;desc?:string;value:boolean;onChange:(v:boolean)=>void}) {
  const lang = useLang();
  const isRtl = lang === "ar";
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 mr-4"><p className="text-sm font-medium text-gray-800">{label}</p>{desc&&<p className="text-xs text-gray-500 mt-0.5">{desc}</p>}</div>
      <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value?"bg-green-500":"bg-gray-300"}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value?"translate-x-6":"translate-x-1"}`}/></button>
    </div>
  );
}

export default function VendorSettingsNotification() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<NotifSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle"|"success"|"error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase.from("vendor_profiles").select("notification_settings").eq("user_id", user.id).single();
        if (error) throw error;
        if (data?.notification_settings) setSettings({ ...defaultSettings, ...data.notification_settings });
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    load();
  }, [user?.id]);

  const toggle = (field: keyof NotifSettings, value: boolean) => { setSettings(p => ({...p,[field]:value})); setSaveStatus("idle"); };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true); setSaveStatus("idle"); setErrorMessage("");
    try {
      const { error } = await supabase.from("vendor_profiles").update({ notification_settings:settings, updated_at:new Date().toISOString() }).eq("user_id", user.id);
      if (error) throw error;
      setSaveStatus("success"); setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err:any) { setErrorMessage(err.message||"Failed to save."); setSaveStatus("error"); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600"/></button>
            <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-green-600"/><h1 className="text-lg font-semibold text-gray-900">Notification Settings</h1></div>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
            {isSaving?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}
            {isSaving?"Saving...":"Save"}
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {saveStatus==="success"&&<div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"><CheckCircle className="w-5 h-5"/><span>Saved!</span></div>}
        {saveStatus==="error"&&<div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><AlertCircle className="w-5 h-5"/><span>{errorMessage}</span></div>}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Delivery Channels</h2>
          <Toggle label="Push Notifications" desc="Alerts on your device" value={settings.push_notifications} onChange={v=>toggle("push_notifications",v)}/>
          <Toggle label="Email Notifications" desc="Alerts via email" value={settings.email_notifications} onChange={v=>toggle("email_notifications",v)}/>
          <Toggle label="SMS Notifications" desc="Alerts via SMS" value={settings.sms_notifications} onChange={v=>toggle("sms_notifications",v)}/>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Orders</h2>
          <Toggle label="New Order" value={settings.new_order} onChange={v=>toggle("new_order",v)}/>
          <Toggle label="Order Status Change" value={settings.order_status_change} onChange={v=>toggle("order_status_change",v)}/>
          <Toggle label="Payment Received" value={settings.payment_received} onChange={v=>toggle("payment_received",v)}/>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Customer Activity</h2>
          <Toggle label="New Message" value={settings.new_message} onChange={v=>toggle("new_message",v)}/>
          <Toggle label="New Review" value={settings.new_review} onChange={v=>toggle("new_review",v)}/>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Inventory & Platform</h2>
          <Toggle label="Low Stock Alert" value={settings.low_stock} onChange={v=>toggle("low_stock",v)}/>
          <Toggle label="Promotion Alerts" value={settings.promotion_alerts} onChange={v=>toggle("promotion_alerts",v)}/>
          <Toggle label="Platform Updates" value={settings.platform_updates} onChange={v=>toggle("platform_updates",v)}/>
        </div>
        <div className="pb-8"><button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">{isSaving?<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-5 h-5"/>}{isSaving?"Saving...":"Save Notification Settings"}</button></div>
      </div>
    </div>
  );
}





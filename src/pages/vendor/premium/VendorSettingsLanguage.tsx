import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

interface LangSettings { preferred_language:string; secondary_language:string; currency_display:string; date_format:string; number_format:string; }
const defaultSettings: LangSettings = { preferred_language:"fr", secondary_language:"en", currency_display:"FCFA", date_format:"DD/MM/YYYY", number_format:"1.000,00" };
const LANGUAGES = [{code:"fr",label:"Français",flag:"????"},{code:"en",label:"English",flag:"????"},{code:"fuf",label:"Fulfulde",flag:"????"},{code:"ewo",label:"Ewondo",flag:"????"},{code:"bum",label:"Bulu",flag:"????"},{code:"ybb",label:"Yemba",flag:"????"}];
const CURRENCIES = [{code:"FCFA",label:"FCFA — Franc CFA"},{code:"XAF",label:"XAF — Central African Franc"},{code:"USD",label:"USD — US Dollar"},{code:"EUR",label:"EUR — Euro"}];
const DATE_FORMATS = [{value:"DD/MM/YYYY",label:"DD/MM/YYYY (e.g. 23/03/2026)"},{value:"MM/DD/YYYY",label:"MM/DD/YYYY (e.g. 03/23/2026)"},{value:"YYYY-MM-DD",label:"YYYY-MM-DD (e.g. 2026-03-23)"}];
const NUMBER_FORMATS = [{value:"1.000,00",label:"1.000,00 (European)"},{value:"1,000.00",label:"1,000.00 (US/UK)"},{value:"1 000,00",label:"1 000,00 (French/CFA)"}];

export default function VendorSettingsLanguage() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<LangSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle"|"success"|"error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const {data,error} = await supabase.from("vendor_profiles").select("language_settings").eq("user_id",user.id).single();
        if (error) throw error;
        if (data?.language_settings) setSettings({...defaultSettings,...data.language_settings});
      } catch(err){console.error(err);} finally{setIsLoading(false);}
    };
    load();
  }, [user?.id]);

  const handleChange = (field:keyof LangSettings, value:string) => { setSettings(p=>({...p,[field]:value})); setSaveStatus("idle"); };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true); setSaveStatus("idle"); setErrorMessage("");
    try {
      const {error} = await supabase.from("vendor_profiles").update({language_settings:settings,updated_at:new Date().toISOString()}).eq("user_id",user.id);
      if (error) throw error;
      setSaveStatus("success"); setTimeout(()=>setSaveStatus("idle"),3000);
    } catch(err:any){setErrorMessage(err.message||"Failed to save.");setSaveStatus("error");}
    finally{setIsSaving(false);}
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600"/></button>
            <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-600"/><h1 className="text-lg font-semibold text-gray-900">Language & Region</h1></div>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
            {isSaving?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}
            {isSaving?"Saving...":"Save"}
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {saveStatus==="success"&&<div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"><CheckCircle className="w-5 h-5"/><span>Language settings saved!</span></div>}
        {saveStatus==="error"&&<div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><AlertCircle className="w-5 h-5"/><span>{errorMessage}</span></div>}
        {[{title:"Preferred Language",field:"preferred_language" as const},{title:"Secondary Language",field:"secondary_language" as const}].map(({title,field})=>(
          <div key={field} className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map(lang=>(
                <button key={lang.code} onClick={()=>handleChange(field,lang.code)} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${settings[field]===lang.code?"border-indigo-600 bg-indigo-50":"border-gray-200 hover:border-gray-300"}`}>
                  <span className="text-xl">{lang.flag}</span>
                  <span className={`text-sm font-medium ${settings[field]===lang.code?"text-indigo-700":"text-gray-700"}`}>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Currency</h2>
          <select value={settings.currency_display} onChange={e=>handleChange("currency_display",e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Date Format</h2>
          <div className="space-y-2">{DATE_FORMATS.map(f=><button key={f.value} onClick={()=>handleChange("date_format",f.value)} className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${settings.date_format===f.value?"border-indigo-600 bg-indigo-50 text-indigo-700":"border-gray-200 text-gray-700 hover:border-gray-300"}`}><span className="text-sm font-medium">{f.label}</span>{settings.date_format===f.value&&<CheckCircle className="w-4 h-4 text-indigo-600"/>}</button>)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Number Format</h2>
          <div className="space-y-2">{NUMBER_FORMATS.map(f=><button key={f.value} onClick={()=>handleChange("number_format",f.value)} className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${settings.number_format===f.value?"border-indigo-600 bg-indigo-50 text-indigo-700":"border-gray-200 text-gray-700 hover:border-gray-300"}`}><span className="text-sm font-medium">{f.label}</span>{settings.number_format===f.value&&<CheckCircle className="w-4 h-4 text-indigo-600"/>}</button>)}</div>
        </div>
        <div className="pb-8"><button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">{isSaving?<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-5 h-5"/>}{isSaving?"Saving...":"Save Language Settings"}</button></div>
      </div>
    </div>
  );
}





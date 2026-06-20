import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

const DAYS = [{key:"monday",label:"Monday"},{key:"tuesday",label:"Tuesday"},{key:"wednesday",label:"Wednesday"},{key:"thursday",label:"Thursday"},{key:"friday",label:"Friday"},{key:"saturday",label:"Saturday"},{key:"sunday",label:"Sunday"}] as const;
type DayKey = typeof DAYS[number]["key"];
interface DaySchedule { open:boolean; from:string; to:string; }
type BusinessHours = Record<DayKey, DaySchedule>;
const defaultHours = (): BusinessHours => ({ monday:{open:true,from:"08:00",to:"18:00"}, tuesday:{open:true,from:"08:00",to:"18:00"}, wednesday:{open:true,from:"08:00",to:"18:00"}, thursday:{open:true,from:"08:00",to:"18:00"}, friday:{open:true,from:"08:00",to:"18:00"}, saturday:{open:true,from:"09:00",to:"15:00"}, sunday:{open:false,from:"09:00",to:"15:00"} });
const TIMES: string[] = [];
for (let h=0;h<24;h++) for (const m of ["00","30"]) TIMES.push(`${String(h).padStart(2,"0")}:${m}`);
const fmt = (t:string) => { const [h,m]=t.split(":"); const n=parseInt(h); return `${n%12||12}:${m} ${n>=12?"PM":"AM"}`; };

export default function VendorSettingsBusinessHours() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [hours, setHours] = useState<BusinessHours>(defaultHours());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle"|"success"|"error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const {data,error} = await supabase.from("vendor_profiles").select("business_hours").eq("user_id",user.id).single();
        if (error) throw error;
        if (data?.business_hours) setHours({...defaultHours(),...data.business_hours});
      } catch(err){console.error(err);} finally{setIsLoading(false);}
    };
    load();
  }, [user?.id]);

  const toggleDay = (day:DayKey) => { setHours(p => ({...p,[day]:{...p[day],open:!p[day].open}})); setSaveStatus("idle"); };
  const updateTime = (day:DayKey, field:"from"|"to", value:string) => { setHours(p => ({...p,[day]:{...p[day],[field]:value}})); setSaveStatus("idle"); };
  const applyToAll = (day:DayKey) => { const src=hours[day]; setHours(p => { const u={...p}; DAYS.forEach(d => { u[d.key]={...u[d.key],from:src.from,to:src.to}; }); return u; }); };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true); setSaveStatus("idle"); setErrorMessage("");
    try {
      const {error} = await supabase.from("vendor_profiles").update({business_hours:hours,updated_at:new Date().toISOString()}).eq("user_id",user.id);
      if (error) throw error;
      setSaveStatus("success"); setTimeout(()=>setSaveStatus("idle"),3000);
    } catch(err:any){setErrorMessage(err.message||"Failed to save.");setSaveStatus("error");}
    finally{setIsSaving(false);}
  };

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600"/></button>
            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500"/><h1 className="text-lg font-semibold text-gray-900">Business Hours</h1></div>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
            {isSaving?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-4 h-4"/>}
            {isSaving?"Saving...":"Save"}
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {saveStatus==="success"&&<div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"><CheckCircle className="w-5 h-5"/><span>Business hours saved!</span></div>}
        {saveStatus==="error"&&<div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><AlertCircle className="w-5 h-5"/><span>{errorMessage}</span></div>}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {DAYS.map(({key,label}) => {
            const day = hours[key];
            return (
              <div key={key} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-semibold ${day.open?"text-gray-900":"text-gray-400"}`}>{label}</span>
                  <div className="flex items-center gap-3">
                    {day.open&&<button onClick={()=>applyToAll(key)} className="text-xs text-orange-500 hover:text-orange-600 font-medium">Apply to all</button>}
                    <button onClick={()=>toggleDay(key)} className={`relative w-11 h-6 rounded-full transition-colors ${day.open?"bg-orange-500":"bg-gray-300"}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${day.open?"translate-x-6":"translate-x-1"}`}/></button>
                  </div>
                </div>
                {day.open ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Opens</label><select value={day.from} onChange={e=>updateTime(key,"from",e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">{TIMES.map(t=><option key={t} value={t}>{fmt(t)}</option>)}</select></div>
                    <div className="text-gray-400 text-sm mt-4">—</div>
                    <div className="flex-1"><label className="block text-xs text-gray-500 mb-1">Closes</label><select value={day.to} onChange={e=>updateTime(key,"to",e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">{TIMES.map(t=><option key={t} value={t}>{fmt(t)}</option>)}</select></div>
                  </div>
                ) : <p className="text-xs text-gray-400 italic">Closed</p>}
              </div>
            );
          })}
        </div>
        <div className="pb-8"><button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">{isSaving?<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-5 h-5"/>}{isSaving?"Saving...":"Save Business Hours"}</button></div>
      </div>
    </div>
  );
}



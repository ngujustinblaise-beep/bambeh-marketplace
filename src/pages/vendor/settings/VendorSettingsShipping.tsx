import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Truck, CheckCircle, AlertCircle, Plus, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

interface ShippingZone { id:string; name:string; enabled:boolean; price:number; freeAbove:number|null; estimatedDays:string; }
interface ShippingSettings { offersDelivery:boolean; offersPickup:boolean; pickupAddress:string; processingDays:number; zones:ShippingZone[]; }

const DEFAULT_ZONES: ShippingZone[] = [
  { id:"yaounde",      name:"Yaoundé",     enabled:true,  price:500,  freeAbove:10000, estimatedDays:"1-2" },
  { id:"douala",       name:"Douala",       enabled:true,  price:1500, freeAbove:20000, estimatedDays:"2-3" },
  { id:"other_cities", name:"Other Cities", enabled:false, price:3000, freeAbove:null,  estimatedDays:"3-5" },
  { id:"nationwide",   name:"Nationwide",   enabled:false, price:5000, freeAbove:null,  estimatedDays:"5-7" },
];
const defaultSettings = (): ShippingSettings => ({ offersDelivery:true, offersPickup:false, pickupAddress:"", processingDays:1, zones:DEFAULT_ZONES });

export default function VendorSettingsShipping() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [shipping, setShipping] = useState<ShippingSettings>(defaultSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle"|"success"|"error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase.from("vendor_profiles").select("shipping_settings").eq("user_id", user.id).single();
        if (error) throw error;
        if (data?.shipping_settings) setShipping({ ...defaultSettings(), ...data.shipping_settings });
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    load();
  }, [user?.id]);

  const updateZone = (id:string, field:keyof ShippingZone, value:unknown) =>
    setShipping(p => ({ ...p, zones: p.zones.map(z => z.id===id ? {...z,[field]:value} : z) }));
  const removeZone = (id:string) => setShipping(p => ({ ...p, zones: p.zones.filter(z => z.id!==id) }));
  const addZone = () => setShipping(p => ({ ...p, zones:[...p.zones,{id:`zone_${Date.now()}`,name:"New Zone",enabled:false,price:1000,freeAbove:null,estimatedDays:"3-5"}] }));

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true); setSaveStatus("idle"); setErrorMessage("");
    try {
      const { error } = await supabase.from("vendor_profiles").update({ shipping_settings:shipping, updated_at:new Date().toISOString() }).eq("user_id",user.id);
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
            <div className="flex items-center gap-2"><Truck className="w-5 h-5 text-green-600"/><h1 className="text-lg font-semibold text-gray-900">Shipping Settings</h1></div>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors">
            {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save className="w-4 h-4"/>}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {saveStatus==="success" && <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"><CheckCircle className="w-5 h-5"/><span>Saved!</span></div>}
        {saveStatus==="error" && <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><AlertCircle className="w-5 h-5"/><span>{errorMessage}</span></div>}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Fulfilment Options</h2>
          {[{key:"offersDelivery" as const,label:"Offer Delivery",desc:"Ship orders to customers"},{key:"offersPickup" as const,label:"Offer Pickup",desc:"Allow customers to collect"}].map(({key,label,desc}) => (
            <div key={key} className="flex items-center justify-between mb-3">
              <div><p className="text-sm font-medium text-gray-800">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
              <button onClick={() => setShipping(p => ({...p,[key]:!p[key]}))} className={`relative w-11 h-6 rounded-full transition-colors ${shipping[key]?"bg-green-500":"bg-gray-300"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${shipping[key]?"translate-x-6":"translate-x-1"}`}/>
              </button>
            </div>
          ))}
          {shipping.offersPickup && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1"><span className="flex items-center gap-1"><MapPin className="w-4 h-4"/>Pickup Address</span></label>
              <textarea value={shipping.pickupAddress} onChange={e => setShipping(p => ({...p,pickupAddress:e.target.value}))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"/>
            </div>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time (days)</label>
            <select value={shipping.processingDays} onChange={e => setShipping(p => ({...p,processingDays:Number(e.target.value)}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500">
              {[1,2,3,5,7].map(d => <option key={d} value={d}>{d} {d===1?"day":"days"}</option>)}
            </select>
          </div>
        </div>
        {shipping.offersDelivery && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Delivery Zones</h2>
              <button onClick={addZone} className="flex items-center gap-1 text-sm text-green-600 font-medium"><Plus className="w-4 h-4"/>Add Zone</button>
            </div>
            {shipping.zones.map(zone => (
              <div key={zone.id} className="border border-gray-200 rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <input type="text" value={zone.name} onChange={e => updateZone(zone.id,"name",e.target.value)} className="text-sm font-semibold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:outline-none w-40"/>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateZone(zone.id,"enabled",!zone.enabled)} className={`relative w-10 h-5 rounded-full transition-colors ${zone.enabled?"bg-green-500":"bg-gray-300"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${zone.enabled?"translate-x-5":"translate-x-0.5"}`}/>
                    </button>
                    <button onClick={() => removeZone(zone.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
                {zone.enabled && (
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs text-gray-500 mb-1">Fee (FCFA)</label><input type="number" value={zone.price} min={0} onChange={e => updateZone(zone.id,"price",Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
                      <div><label className="block text-xs text-gray-500 mb-1">Est. Days</label><input type="text" value={zone.estimatedDays} onChange={e => updateZone(zone.id,"estimatedDays",e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
                    </div>
                    <div><label className="block text-xs text-gray-500 mb-1">Free above (FCFA)</label><input type="number" value={zone.freeAbove??""} min={0} onChange={e => updateZone(zone.id,"freeAbove",e.target.value===""?null:Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"/></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="pb-8"><button onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors">{isSaving?<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save className="w-5 h-5"/>}{isSaving?"Saving...":"Save Shipping Settings"}</button></div>
      </div>
    </div>
  );
}





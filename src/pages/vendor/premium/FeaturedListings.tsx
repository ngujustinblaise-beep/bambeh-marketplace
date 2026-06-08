import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, TrendingUp, Eye, Clock, Plus, AlertCircle, CheckCircle, Package, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { useLang, t } from "@/hooks/useAppLang";

interface FeaturedListing{id:string;product_id:string;product_name:string;product_image:string;featured_since:string;featured_until:string;impressions:number;clicks:number;plan:"basic"|"standard"|"premium";status:"active"|"expired"|"pending";}
interface AvailableProduct{id:string;name:string;image_url:string;price:number;category:string;}
const PLANS={basic:{label:"Basic",price:2500,duration:7,color:"text-blue-400",bg:"bg-blue-500/10",border:"border-blue-500/20",badge:"bg-blue-500/20"},standard:{label:"Standard",price:5000,duration:14,color:"text-purple-400",bg:"bg-purple-500/10",border:"border-purple-500/20",badge:"bg-purple-500/20"},premium:{label:"Premium",price:10000,duration:30,color:"text-yellow-400",bg:"bg-yellow-500/10",border:"border-yellow-500/20",badge:"bg-yellow-500/20"}};

export default function FeaturedListings(){
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate=useNavigate();
  const{user}=useAuthStore();
  const[featured,setFeatured]=useState<FeaturedListing[]>([]);
  const[products,setProducts]=useState<AvailableProduct[]>([]);
  const[isLoading,setIsLoading]=useState(true);
  const[showModal,setShowModal]=useState(false);
  const[selectedProduct,setSelectedProduct]=useState("");
  const[selectedPlan,setSelectedPlan]=useState<"basic"|"standard"|"premium">("basic");
  const[isSubmitting,setIsSubmitting]=useState(false);
  const[status,setStatus]=useState<{type:"success"|"error";text:string}|null>(null);

  useEffect(()=>{loadData();},[user?.id]);
  const loadData=async()=>{
    if(!user?.id)return;setIsLoading(true);
    try{const[fr,pr]=await Promise.all([supabase.from("featured_listings").select("*").eq("vendor_id",user.id).order("featured_since",{ascending:false}),supabase.from("products").select("id,name,image_url,price,category").eq("vendor_id",user.id).eq("status","active")]);
    if(fr.data)setFeatured(fr.data);if(pr.data)setProducts(pr.data);}
    catch(err){console.error(err);}finally{setIsLoading(false);}
  };

  const handleFeature=async()=>{
    if(!user?.id||!selectedProduct)return;setIsSubmitting(true);setStatus(null);
    try{const plan=PLANS[selectedPlan];const now=new Date();const until=new Date(now.getTime()+plan.duration*86400000);
    const{error}=await supabase.from("featured_listings").insert({vendor_id:user.id,product_id:selectedProduct,plan:selectedPlan,featured_since:now.toISOString(),featured_until:until.toISOString(),impressions:0,clicks:0,status:"pending"});
    if(error)throw error;setStatus({type:"success",text:"Listing featured!"});setShowModal(false);setSelectedProduct("");setSelectedPlan("basic");await loadData();}
    catch(err:any){setStatus({type:"error",text:err.message||"Failed to feature."});}
    finally{setIsSubmitting(false);}
  };

  const handleStop=async(id:string)=>{
    try{const{error}=await supabase.from("featured_listings").update({status:"expired",updated_at:new Date().toISOString()}).eq("id",id);if(error)throw error;setFeatured(p=>p.map(l=>l.id===id?{...l,status:"expired" as const}:l));setStatus({type:"success",text:"Stopped."});}
    catch(err:any){setStatus({type:"error",text:err.message});}
  };

  const daysLeft=(until:string)=>Math.max(0,Math.ceil((new Date(until).getTime()-Date.now())/86400000));
  const active=featured.filter(l=>l.status==="active");
  const expired=featured.filter(l=>l.status!=="active");

  if(isLoading)return<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"/></div>;

  return(
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10"><div className="flex items-center justify-between px-4 py-3"><div className="flex items-center gap-3"><button onClick={()=>navigate(-1)} className="p-2 hover:bg-gray-700 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-400"/></button><div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400"/><h1 className="text-lg font-semibold">Featured Listings</h1></div></div><button onClick={()=>setShowModal(true)} className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-medium text-sm"><Plus className="w-4 h-4"/>Feature a Listing</button></div></header>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {status&&<div className={`flex items-center gap-2 p-4 rounded-lg border ${status.type==="success"?"bg-green-500/10 border-green-500/20 text-green-400":"bg-red-500/10 border-red-500/20 text-red-400"}`}>{status.type==="success"?<CheckCircle className="w-5 h-5"/>:<AlertCircle className="w-5 h-5"/>}<span className="text-sm">{status.text}</span></div>}
        <div className="grid grid-cols-3 gap-3"><div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center"><p className="text-2xl font-bold text-yellow-400">{active.length}</p><p className="text-xs text-gray-400 mt-1">Active</p></div><div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center"><p className="text-2xl font-bold text-blue-400">{featured.reduce((s,l)=>s+(l.impressions||0),0).toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Impressions</p></div><div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center"><p className="text-2xl font-bold text-green-400">{featured.reduce((s,l)=>s+(l.clicks||0),0).toLocaleString()}</p><p className="text-xs text-gray-400 mt-1">Clicks</p></div></div>
        {active.length>0&&<div><h2 className="text-base font-semibold text-gray-100 mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/>Active</h2><div className="space-y-3">{active.map(l=>{const plan=PLANS[l.plan];return(<div key={l.id} className={`bg-gray-800 rounded-xl border ${plan.border} p-4`}><div className="flex items-start gap-3">{l.product_image?<img src={l.product_image} alt={l.product_name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0"/>:<div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0"><Package className="w-6 h-6 text-gray-500"/></div>}<div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><p className="text-sm font-semibold text-white truncate">{l.product_name}</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${plan.badge} ${plan.color}`}>{plan.label}</span></div><div className="grid grid-cols-3 gap-2 mt-2"><div className="flex items-center gap-1 text-xs text-gray-400"><Eye className="w-3 h-3"/><span>{(l.impressions||0).toLocaleString()}</span></div><div className="flex items-center gap-1 text-xs text-gray-400"><TrendingUp className="w-3 h-3"/><span>{(l.clicks||0).toLocaleString()}</span></div><div className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3"/><span>{daysLeft(l.featured_until)}d left</span></div></div></div></div><button onClick={()=>handleStop(l.id)} className="mt-4 w-full py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30">Stop Featuring</button></div>);})}</div></div>}
        {active.length===0&&<div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center"><Star className="w-12 h-12 text-gray-600 mx-auto mb-3"/><p className="text-gray-300 font-medium mb-1">No active featured listings</p><p className="text-gray-500 text-sm mb-4">Feature your products for more visibility</p><button onClick={()=>setShowModal(true)} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-medium text-sm">Feature a Listing</button></div>}
        {expired.length>0&&<div><h2 className="text-base font-semibold text-gray-400 mb-3">Past</h2><div className="space-y-2">{expired.map(l=>{const plan=PLANS[l.plan];return(<div key={l.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 opacity-60"><div className="flex items-center gap-3">{l.product_image?<img src={l.product_image} alt={l.product_name} className="w-12 h-12 rounded-lg object-cover grayscale flex-shrink-0"/>:<div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-gray-600"/></div>}<div className="flex-1 min-w-0"><p className="text-sm text-gray-400 truncate">{l.product_name}</p><span className={`text-xs ${plan.color}`}>{plan.label}</span></div><span className="text-xs text-gray-600 bg-gray-700/50 px-2 py-1 rounded-full">Expired</span></div></div>);})}</div></div>}
      </div>
      {showModal&&<div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 px-4 pb-4"><div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto"><div className="p-5"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold">Feature a Listing</h2><button onClick={()=>setShowModal(false)} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400">✕</button></div>
        <div className="mb-5"><label className="block text-sm font-medium text-gray-300 mb-2">Select Product</label>{products.length===0?<p className="text-sm text-gray-500 py-3 text-center">No active products found.</p>:<div className="space-y-2 max-h-48 overflow-y-auto">{products.map(p=><button key={p.id} onClick={()=>setSelectedProduct(p.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${selectedProduct===p.id?"border-yellow-500/50 bg-yellow-500/10":"border-gray-700 hover:border-gray-600"}`}>{p.image_url?<img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0"/>:<div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0"><Package className="w-4 h-4 text-gray-500"/></div>}<div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{p.name}</p><p className="text-xs text-gray-400">{p.price?.toLocaleString()} FCFA</p></div>{selectedProduct===p.id&&<CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0"/>}</button>)}</div>}</div>
        <div className="mb-6"><label className="block text-sm font-medium text-gray-300 mb-2">Select Plan</label><div className="space-y-2">{(Object.entries(PLANS) as [keyof typeof PLANS,typeof PLANS[keyof typeof PLANS]][]).map(([key,plan])=><button key={key} onClick={()=>setSelectedPlan(key)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${selectedPlan===key?`${plan.border} ${plan.bg}`:"border-gray-700 hover:border-gray-600"}`}><div className="text-left"><p className={`text-sm font-semibold ${selectedPlan===key?plan.color:"text-gray-300"}`}>{plan.label}</p><p className="text-xs text-gray-500">{plan.duration} days</p></div><p className={`text-sm font-bold ${selectedPlan===key?plan.color:"text-gray-400"}`}>{plan.price.toLocaleString()} FCFA</p></button>)}</div></div>
        <button onClick={handleFeature} disabled={!selectedProduct||isSubmitting} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 rounded-xl font-semibold flex items-center justify-center gap-2">{isSubmitting?<span className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"/>:<Star className="w-5 h-5"/>}{isSubmitting?"Processing...":"Feature This Listing"}</button>
      </div></div></div>}
    </div>
  );
}

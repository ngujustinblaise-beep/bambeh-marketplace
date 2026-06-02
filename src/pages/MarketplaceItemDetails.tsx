/**
 * src/pages/MarketplaceItemDetails.tsx — Bambeh Marketplace  DEFINITIVE VERSION
 * Handles demo-1..demo-6 inline. Real UUIDs → Supabase. Full detail with contact/share/report/cart/favorites.
 */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingCart, MessageCircle, Phone, MapPin, Tag, Share2, Flag, Shield, CheckCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

function isUUID(s:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);}
const fmt=(n:number)=>n.toLocaleString("fr-CM");
const FAV_KEY="bambeh_favorites";
const CART_KEY="bambeh_cart";

interface Listing { id:string;title:string;description:string;price:number;category:string;condition:string;location:string;phone?:string;negotiable?:boolean;images:string[];sellerId?:string;sellerName:string;postedAt?:string;isDemo?:boolean; }

const DEMOS: Record<string,Listing> = {
  "demo-1":{id:"demo-1",title:"iPhone 15 Pro Max 256GB",price:620000,category:"Electronics",condition:"Like New",location:"Bastos, Yaoundé",negotiable:true,sellerName:"Christophe M.",phone:"+237671234567",images:["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&q=85","https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=85"],description:"Barely used iPhone 15 Pro Max, 256GB, Natural Titanium. Battery health 99%. All original accessories and sealed box. No scratches. Purchased 2 months ago from France.\n\n✅ Original box, USB-C cable, AppleCare documentation\n✅ iCloud unlocked, no prior damage\n✅ Available for inspection in Bastos",isDemo:true},
  "demo-2":{id:"demo-2",title:"Toyota Camry 2020 Automatic",price:12500000,category:"Vehicles",condition:"Good",location:"Bonanjo, Douala",negotiable:true,sellerName:"Ngange Auto",phone:"+237682345678",images:["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&q=85","https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=85"],description:"Toyota Camry 2020, 2.5L automatic, metallic grey. 48,000 km. Climate control, leather seats, reverse camera, Bluetooth.\n\n✅ One owner, full service history\n✅ Carte grise, assurance, visite technique — all current\n✅ Available for test drive in Douala\n✅ Delivery can be arranged",isDemo:true},
  "demo-3":{id:"demo-3",title:"3-Bedroom Apartment — Bastos",price:250000,category:"Rentals",condition:"New",location:"Bastos, Yaoundé",negotiable:false,sellerName:"Bastos Prestige Realty",phone:"+237693456789",images:["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=85","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=85"],description:"Fully furnished modern apartment in prestigious Bastos residence. 3 bedrooms, 2 bathrooms, panoramic city views.\n\n✅ Fully furnished (beds, sofas, kitchen appliances, AC in every room)\n✅ 24h security guards + CCTV\n✅ Backup generator — no power cut issues\n✅ Covered parking for 2 vehicles\n✅ Swimming pool & gym\n✅ Close to embassies and international schools\n\nRent: 250,000 XAF/month. 3 months deposit required.",isDemo:true},
  "demo-4":{id:"demo-4",title:'Samsung 65" 4K QLED Smart TV',price:285000,category:"Electronics",condition:"Like New",location:"Akwa, Douala",negotiable:true,sellerName:"ElectroCam",phone:"+237654567890",images:["https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=85"],description:"Samsung 65\" UHD 4K QLED Smart TV. Tizen OS, 4 HDMI ports, WiFi/Bluetooth.\n\n✅ Used only 6 months\n✅ Original remote and table stand included\n✅ All cables included\n✅ Reason for selling: upgrading to OLED\n\nPrice negotiable. Delivery in Douala available.",isDemo:true},
  "demo-5":{id:"demo-5",title:'MacBook Pro 14" M2 Pro 16GB',price:980000,category:"Electronics",condition:"Good",location:"Biyem-Assi, Yaoundé",negotiable:false,sellerName:"TechCorner CM",phone:"+237665678901",images:["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=85","https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=85"],description:"MacBook Pro 14\" with M2 Pro chip, 16GB RAM, 512GB SSD. Space Grey.\n\n✅ AppleCare+ valid until December 2026\n✅ No scratches on screen or body\n✅ macOS Sonoma (latest)\n✅ MagSafe charger + USB-C cable included\n✅ Ideal for developers, designers, video editors\n\nPrice firm. Proof of purchase available.",isDemo:true},
  "demo-6":{id:"demo-6",title:"L-Shaped Executive Sofa Set",price:320000,category:"Furniture",condition:"Good",location:"Nkolndongo, Yaoundé",negotiable:true,sellerName:"LuxHome CM",phone:"+237676789012",images:["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=85"],description:"Premium brown leather L-shaped sofa set — 5-seater sectional plus 2 matching armchairs.\n\n✅ High-quality leather upholstery (minor wear on one armrest)\n✅ Cushions firm and comfortable\n✅ Purchased from Mobilier Plus in 2022\n✅ Moving abroad — must sell urgently\n✅ Delivery in Yaoundé: 15,000 XAF\n\nViewings welcome in Nkolndongo. Serious buyers only.",isDemo:true},
};

function isFavd(id:string){try{return(JSON.parse(localStorage.getItem(FAV_KEY)||"[]") as any[]).some((f:any)=>f.id===id);}catch{return false;}}
function toggleFavStorage(l:Listing){try{const s:any[]=JSON.parse(localStorage.getItem(FAV_KEY)||"[]");const i=s.findIndex((f:any)=>f.id===l.id);if(i>=0)s.splice(i,1);else s.unshift({id:l.id,title:l.title,price:`${fmt(l.price)} XAF`,image:l.images[0],category:l.category,type:"marketplace",location:l.location,savedAt:new Date().toISOString()});localStorage.setItem(FAV_KEY,JSON.stringify(s));return i<0;}catch{return false;}}
function addToCartStorage(l:Listing,qty:number){try{const c:any[]=JSON.parse(localStorage.getItem(CART_KEY)||"[]");const i=c.findIndex((x:any)=>x.id===l.id);if(i>=0)c[i].quantity=(c[i].quantity||1)+qty;else c.push({id:l.id,title:l.title,price:l.price,quantity:qty,image:l.images[0],sellerId:l.sellerId});localStorage.setItem(CART_KEY,JSON.stringify(c));}catch{}}

export default function MarketplaceItemDetails(){
  const{id}=useParams<{id:string}>();
  const navigate=useNavigate();
  const[listing,  setListing]  =useState<Listing|null>(null);
  const[loading,  setLoading]  =useState(true);
  const[error,    setError]    =useState<string|null>(null);
  const[imgIndex, setImgIndex] =useState(0);
  const[favorited,setFavorited]=useState(()=>isFavd(id??""));
  const[added,    setAdded]    =useState(false);
  const[qty,      setQty]      =useState(1);

  const load=useCallback(async()=>{
    if(!id)return;
    setLoading(true);setError(null);
    if(DEMOS[id]){setListing(DEMOS[id]);setLoading(false);return;}
    if(!isUUID(id)){setError("Listing not found");setLoading(false);return;}
    try{
      const{data,error:dbErr}=await supabase.from("listings").select(`id,title,description,price,category,condition,location,phone,negotiable,images,status,created_at,seller_id,profiles(id,full_name,avatar_url)`).eq("id",id).single();
      if(dbErr||!data){setError("Listing not found");return;}
      const pr=(data as any).profiles;
      setListing({id:data.id,title:data.title,description:data.description??"",price:data.price??0,category:data.category??"",condition:data.condition??"",location:data.location??"",phone:data.phone,negotiable:data.negotiable??false,images:data.images??[],sellerId:data.seller_id,sellerName:pr?.full_name??"Seller",postedAt:data.created_at,isDemo:false});
    }catch(e){setError(e instanceof Error?e.message:"Error loading listing");}
    finally{setLoading(false);}
  },[id]);

  useEffect(()=>{void load();},[load]);

  const handleFavorite=()=>{if(!listing)return;setFavorited(toggleFavStorage(listing));};
  const handleShare=async()=>{
    if(!listing)return;
    const url=`https://bambeh.com/#/marketplace/${listing.id}`;
    if(navigator.share){try{await navigator.share({title:listing.title,text:`${listing.title} — ${fmt(listing.price)} XAF on Bambeh`,url});return;}catch{}}
    navigator.clipboard.writeText(url).catch(()=>{});
  };
  const handleAddToCart=()=>{if(!listing)return;addToCartStorage(listing,qty);setAdded(true);setTimeout(()=>setAdded(false),2500);};

  if(loading)return<div className="min-h-screen flex items-center justify-center"><RefreshCw className="w-6 h-6 text-teal-500 animate-spin"/></div>;
  if(error||!listing)return(
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
      <AlertCircle className="w-16 h-16 text-gray-300 mb-4"/>
      <p className="font-bold text-gray-700 mb-2">Listing not found</p>
      <p className="text-sm text-gray-500 mb-6">{error??"This item may have been removed."}</p>
      <button onClick={()=>navigate("/marketplace")} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">Back to Marketplace</button>
    </div>
  );

  const waMsg=encodeURIComponent(`Hi ${listing.sellerName}, I saw your listing on Bambeh: ${listing.title} — ${fmt(listing.price)} XAF. Is it still available?`);

  return(
    <div className="max-w-lg mx-auto pb-28 bg-white min-h-screen">
      {/* Image carousel */}
      <div className="relative h-72 bg-gray-100 overflow-hidden">
        <button onClick={()=>navigate(-1)} className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><ArrowLeft className="w-4 h-4 text-gray-700"/></button>
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button onClick={handleShare} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><Share2 className="w-4 h-4 text-gray-600"/></button>
          <button onClick={handleFavorite} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><Heart className={`w-4 h-4 ${favorited?"text-red-500 fill-red-500":"text-gray-500"}`}/></button>
        </div>
        {listing.images.length>0
          ?<img src={listing.images[imgIndex]} alt={listing.title} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          :<div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🛍️</div>
        }
        {listing.images.length>1&&(
          <>
            <button onClick={()=>setImgIndex(i=>Math.max(0,i-1))} disabled={imgIndex===0} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30"><ChevronLeft className="w-4 h-4 text-gray-600"/></button>
            <button onClick={()=>setImgIndex(i=>Math.min(listing.images.length-1,i+1))} disabled={imgIndex===listing.images.length-1} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30"><ChevronRight className="w-4 h-4 text-gray-600"/></button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {listing.images.map((_,i)=><div key={i} className={`w-1.5 h-1.5 rounded-full ${i===imgIndex?"bg-white":"bg-white/50"}`}/>)}
            </div>
          </>
        )}
        {listing.isDemo&&<div className="absolute bottom-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">DEMO — Sample Item</div>}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900 flex-1 leading-tight">{listing.title}</h1>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${listing.condition==="New"?"bg-green-100 text-green-700":listing.condition==="Like New"?"bg-teal-100 text-teal-700":listing.condition==="Good"?"bg-blue-100 text-blue-700":"bg-amber-100 text-amber-700"}`}>{listing.condition}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/>{listing.location}</span>
            <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5"/>{listing.category}</span>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-teal-700">{fmt(listing.price*qty)} XAF</p>
            {qty>1&&<p className="text-sm text-teal-500 mt-0.5">{fmt(listing.price)} XAF each</p>}
            {listing.negotiable&&<p className="text-xs text-green-600 font-semibold mt-1">✓ Price negotiable</p>}
          </div>
          <div className="flex items-center gap-0 border border-gray-300 rounded-xl overflow-hidden">
            <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-9 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-lg">−</button>
            <span className="w-8 text-center text-sm font-semibold">{qty}</span>
            <button onClick={()=>setQty(q=>q+1)} className="w-9 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-lg">+</button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Seller</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg">{listing.sellerName.charAt(0)}</div>
            <div><p className="font-semibold text-gray-900">{listing.sellerName}</p><p className="text-xs text-gray-400">Verified Bambeh Seller · {listing.location}</p></div>
          </div>
          <div className="flex gap-2">
            <a href={`https://wa.me/${(listing.phone||"+237600000000").replace(/\s/g,"")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition"><MessageCircle className="w-4 h-4"/>WhatsApp</a>
            <a href={`tel:${listing.phone||"+237600000000"}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"><Phone className="w-4 h-4"/>Call</a>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-amber-700"><strong>Safety tip:</strong> Always use Bambeh Escrow. Never send money before seeing the item. <button onClick={()=>navigate("/meet-safely")} className="underline">Meet Safely →</button></p>
        </div>

        <button onClick={()=>navigate(`/report-issue?item=${listing.id}&type=marketplace`)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition mx-auto"><Flag className="w-3.5 h-3.5"/>Report this listing</button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 max-w-lg mx-auto">
        <button onClick={handleFavorite} className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${favorited?"bg-red-50 border-red-200":"border-gray-200 hover:bg-gray-50"}`}>
          <Heart className={`w-5 h-5 ${favorited?"text-red-500 fill-red-500":"text-gray-500"}`}/>
        </button>
        <button onClick={handleAddToCart} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${added?"bg-green-100 text-green-700 border border-green-300":"bg-teal-600 text-white hover:bg-teal-700 shadow-md"}`}>
          {added?<><CheckCircle className="w-5 h-5"/>Added to Cart!</>:<><ShoppingCart className="w-5 h-5"/>Add to Cart — {fmt(listing.price*qty)} XAF</>}
        </button>
      </div>
    </div>
  );
}

/**
 * src/pages/FarmFreshDetail.tsx — Bambeh Marketplace  DEFINITIVE VERSION
 * Handles s1-s8 demo IDs inline (no DB call). Real UUIDs → Supabase.
 * No BambehImage import — uses plain <img> tag.
 */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, MapPin, Star, Leaf, RefreshCw, AlertCircle, Plus, Minus, CheckCircle, Heart, Share2, MessageCircle, Phone, Flag, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";

function isUUID(s: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }

interface FarmProduct {
  id: string; sellerId?: string; sellerName: string; sellerCity: string;
  sellerRating: number; sellerPhone?: string; title: string; description: string;
  pricePerUnitXAF: number; unit: string; stockQuantity: number; images: string[];
  isOrganic: boolean; harvestDate?: string; category: string;
  availableForDelivery: boolean; isDemo?: boolean;
}

const DEMO: Record<string, FarmProduct> = {
  s1: { id:"s1", title:"Fresh Tomatoes", category:"Vegetables", unit:"kg", pricePerUnitXAF:500, stockQuantity:50, isOrganic:true, availableForDelivery:true, sellerName:"Fon's Farm", sellerCity:"Bafoussam, West", sellerRating:4.8, sellerPhone:"+237671234567", images:["https://images.unsplash.com/photo-1546470427-e212876f0173?w=600&q=85"], description:"Sun-ripened tomatoes harvested fresh from highland farms in Bafoussam. Perfect for cooking, sauces, and salads. No pesticides — 100% organic. Delivery available within Bafoussam and surroundings.", isDemo:true },
  s2: { id:"s2", title:"Plantains (1 bunch)", category:"Fruits", unit:"bunch", pricePerUnitXAF:1500, stockQuantity:30, isOrganic:false, availableForDelivery:true, sellerName:"Mama Ngo's Produce", sellerCity:"Yaoundé, Centre", sellerRating:4.6, sellerPhone:"+237682345678", images:["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=85"], description:"Fresh ripe plantains, 12–15 fingers per bunch. Sourced from farms in the Centre region. Best consumed within 3 days of purchase.", isDemo:true },
  s3: { id:"s3", title:"Cocoyams (Macabo)", category:"Tubers", unit:"kg", pricePerUnitXAF:800, stockQuantity:100, isOrganic:true, availableForDelivery:false, sellerName:"Douala Fresh", sellerCity:"Douala, Littoral", sellerRating:4.5, sellerPhone:"+237693456789", images:["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=85"], description:"Fresh macabo cocoyams, firm and starchy. Ideal for Eru and Ndolé. Organically grown without chemicals. Pick up in Douala (no delivery).", isDemo:true },
  s4: { id:"s4", title:"Fresh Maize (Corn)", category:"Grains", unit:"cob", pricePerUnitXAF:300, stockQuantity:200, isOrganic:false, availableForDelivery:true, sellerName:"NW Farm Co-op", sellerCity:"Bamenda, NW Region", sellerRating:4.7, sellerPhone:"+237654567890", images:["https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=85"], description:"Sweet juicy corn from Bamenda highlands. Ready to grill or boil. Available by cob or bulk at discounted rates.", isDemo:true },
  s5: { id:"s5", title:"Groundnuts (1kg bag)", category:"Legumes", unit:"kg", pricePerUnitXAF:1200, stockQuantity:80, isOrganic:false, availableForDelivery:true, sellerName:"Adamaoua Nuts", sellerCity:"Ngaoundéré, Adamaoua", sellerRating:4.9, sellerPhone:"+237665678901", images:["https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&q=85"], description:"Premium shelled groundnuts from the Adamaoua savannah. Great for peanut paste, groundnut soup, or snacking. Clean, dried and ready to use.", isDemo:true },
  s6: { id:"s6", title:"Bitter Leaf (Ndolé)", category:"Vegetables", unit:"bunch", pricePerUnitXAF:200, stockQuantity:40, isOrganic:true, availableForDelivery:false, sellerName:"Centre Fresh Greens", sellerCity:"Yaoundé, Centre", sellerRating:4.4, sellerPhone:"+237676789012", images:["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=85"], description:"Fresh bitter leaf (vernonia amygdalina) for authentic Ndolé. Already washed and ready to cook. One bunch makes a full pot for 6 people.", isDemo:true },
  s7: { id:"s7", title:"Fresh Avocados", category:"Fruits", unit:"kg", pricePerUnitXAF:800, stockQuantity:60, isOrganic:true, availableForDelivery:true, sellerName:"Highlands Harvest", sellerCity:"Dschang, West", sellerRating:4.8, sellerPhone:"+237687890123", images:["https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=85"], description:"Hand-picked avocados from highland farms in Dschang. Perfectly ripe, creamy and nutritious. Sold by the kilogram.", isDemo:true },
  s8: { id:"s8", title:"Pineapples (Large)", category:"Fruits", unit:"piece", pricePerUnitXAF:600, stockQuantity:25, isOrganic:false, availableForDelivery:true, sellerName:"Littoral Tropicals", sellerCity:"Edea, Littoral", sellerRating:4.6, sellerPhone:"+237698901234", images:["https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&q=85"], description:"Sweet, juicy pineapples from coastal farms near Edea. Extra large size. Delivery available in Douala and surroundings.", isDemo:true },
};

const fmtXAF = (n: number) => new Intl.NumberFormat("fr-CM", { maximumFractionDigits:0 }).format(n) + " FCFA";
const FAV_KEY = "bambeh_favorites";
function isFavd(id: string) { try { return (JSON.parse(localStorage.getItem(FAV_KEY)||"[]") as any[]).some((f:any)=>f.id===id); } catch { return false; } }
function toggleFavStorage(p: FarmProduct) {
  try {
    const s: any[] = JSON.parse(localStorage.getItem(FAV_KEY)||"[]");
    const i = s.findIndex((f:any)=>f.id===p.id);
    if (i>=0) s.splice(i,1);
    else s.unshift({ id:p.id, title:p.title, price:`${fmtXAF(p.pricePerUnitXAF)}/${p.unit}`, image:p.images[0], category:p.category, type:"farm-fresh", location:p.sellerCity, savedAt:new Date().toISOString() });
    localStorage.setItem(FAV_KEY, JSON.stringify(s));
    return i<0;
  } catch { return false; }
}

const FarmFreshDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product,   setProduct]   = useState<FarmProduct|null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string|null>(null);
  const [quantity,  setQuantity]  = useState(1);
  const [imgIdx,    setImgIdx]    = useState(0);
  const [favorited, setFavorited] = useState(() => isFavd(id??"")); 
  const [copied,    setCopied]    = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError(null);
    if (DEMO[id]) { setProduct(DEMO[id]); setLoading(false); return; }
    if (!isUUID(id)) { setError("Product not found"); setLoading(false); return; }
    try {
      const { data, error: dbErr } = await supabase
        .from("farm_products").select("*, profiles:seller_id(display_name, city, rating, phone)").eq("id",id).single();
      if (dbErr||!data) { setError("Product not found"); return; }
      const pr = Array.isArray(data.profiles)?data.profiles[0]:data.profiles;
      setProduct({ id:data.id, sellerId:data.seller_id, sellerName:pr?.display_name??"Seller", sellerCity:pr?.city??"—", sellerRating:pr?.rating??0, sellerPhone:pr?.phone, title:data.title, description:data.description??"", pricePerUnitXAF:data.price_per_unit_xaf??0, unit:data.unit??"kg", stockQuantity:data.stock_quantity??0, images:data.images??[], isOrganic:Boolean(data.is_organic), harvestDate:data.harvest_date, category:data.category??"", availableForDelivery:Boolean(data.available_for_delivery), isDemo:false });
    } catch(e) { setError(e instanceof Error?e.message:"Error loading"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const handleFavorite = () => { if(!product)return; setFavorited(toggleFavStorage(product)); };
  const handleShare = async () => {
    if(!product)return;
    const url=`https://bambeh.com/#/farm-fresh/${product.id}`;
    if(navigator.share){try{await navigator.share({title:product.title,text:`${product.title} on Bambeh Farm Fresh`,url});return;}catch{}}
    navigator.clipboard.writeText(url).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };
  const handleOrder = () => { if(!product)return; navigate(`/farm-fresh/order/${product.id}?quantity=${quantity}`); };

  if(loading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="w-6 h-6 text-green-500 animate-spin"/></div>;
  if(error||!product) return (
    <div className="p-4 space-y-4">
      <button onClick={()=>navigate(-1)} className="flex items-center gap-1 text-gray-600"><ArrowLeft className="w-4 h-4"/>Back</button>
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500"/>
        <p className="text-sm text-red-600">{error??"Product not found"}</p>
      </div>
      <button onClick={()=>navigate("/farm-fresh")} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Browse Farm Fresh</button>
    </div>
  );

  const totalXAF = product.pricePerUnitXAF * quantity;
  const waMsg = encodeURIComponent(`Hi ${product.sellerName}, I saw your listing on Bambeh: ${product.title} — ${fmtXAF(product.pricePerUnitXAF)}/${product.unit}. Is it still available?`);

  return (
    <div className="max-w-lg mx-auto pb-28 bg-white min-h-screen">
      {copied && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg">Link copied!</div>}

      {/* Image */}
      <div className="relative">
        <button onClick={()=>navigate(-1)} className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><ArrowLeft className="w-4 h-4 text-gray-700"/></button>
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button onClick={handleShare} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><Share2 className="w-4 h-4 text-gray-600"/></button>
          <button onClick={handleFavorite} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><Heart className={`w-4 h-4 ${favorited?"text-red-500 fill-red-500":"text-gray-600"}`}/></button>
        </div>
        <div className="h-72 bg-gray-100 overflow-hidden">
          {product.images.length>0
            ? <img src={product.images[imgIdx]} alt={product.title} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">🌿</div>
          }
        </div>
        {product.images.length>1 && (
          <div className="flex gap-1.5 justify-center mt-2">
            {product.images.map((_,i)=>(
              <button key={i} onClick={()=>setImgIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i===imgIdx?"bg-green-600":"bg-gray-300"}`}/>
            ))}
          </div>
        )}
        {product.isDemo && <div className="absolute bottom-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">DEMO — Sample Item</div>}
        {product.isOrganic && <div className="absolute top-16 right-4 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Leaf className="w-3 h-3"/>Organic</div>}
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">{product.category}</p>
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          {product.harvestDate && <p className="text-xs text-gray-400 mt-1">Harvested: {new Date(product.harvestDate).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</p>}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-3xl font-black text-green-800">{fmtXAF(product.pricePerUnitXAF)}</p>
            <p className="text-green-600 font-medium">/ {product.unit}</p>
          </div>
          <p className="text-sm text-green-600">Stock: {product.stockQuantity} {product.unit} available</p>
          {product.availableForDelivery && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0"/>Delivery available in your area
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Seller</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">{product.sellerName.charAt(0)}</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{product.sellerName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <MapPin className="w-3 h-3"/>{product.sellerCity}
                {product.sellerRating>0&&<><span>·</span><Star className="w-3 h-3 text-yellow-400 fill-yellow-400"/><span>{product.sellerRating.toFixed(1)}</span></>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`https://wa.me/${(product.sellerPhone||"+237600000000").replace(/\s/g,"")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition">
              <MessageCircle className="w-4 h-4"/>WhatsApp
            </a>
            <a href={`tel:${product.sellerPhone||"+237600000000"}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
              <Phone className="w-4 h-4"/>Call
            </a>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">About this Produce</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-amber-700"><strong>Safety tip:</strong> Always use Bambeh Escrow for payments. Meet in a safe, public place for pickup.</p>
        </div>

        <button onClick={()=>navigate(`/report-issue?item=${product.id}&type=farm-fresh`)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition mx-auto">
          <Flag className="w-3.5 h-3.5"/>Report this listing
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 max-w-lg mx-auto">
        <div className="flex items-center gap-0 border border-gray-300 rounded-xl overflow-hidden flex-shrink-0">
          <button onClick={()=>setQuantity(q=>Math.max(1,q-1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-100 transition"><Minus className="w-4 h-4 text-gray-600"/></button>
          <span className="w-9 text-center text-sm font-bold text-gray-900">{quantity}</span>
          <button onClick={()=>setQuantity(q=>Math.min(product.stockQuantity,q+1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-100 transition"><Plus className="w-4 h-4 text-gray-600"/></button>
        </div>
        <button onClick={handleOrder} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition">
          <ShoppingCart className="w-4 h-4"/>Order — {fmtXAF(totalXAF)}
        </button>
      </div>
    </div>
  );
};
export default FarmFreshDetail;

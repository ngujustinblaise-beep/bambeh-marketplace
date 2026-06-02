/**
 * src/pages/Marketplace.tsx — Bambeh Marketplace  DEFINITIVE VERSION
 * No LocationFilter/DemoBadge imports. Heart saves to localStorage for Favorites page.
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, MapPin, Plus, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Item { id:string; title:string; price:number; category:string; location:string; image?:string; condition:string; description:string; postedAt:string; isDemo?:boolean; sellerName?:string; sellerPhone?:string; negotiable?:boolean; }

const SAMPLES: Item[] = [
  { id:"demo-1", title:"iPhone 15 Pro Max 256GB",    price:620000,   category:"Electronics", location:"Bastos, Yaoundé",    condition:"Like New", negotiable:true,  image:"https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&q=80",  postedAt:new Date().toISOString(), isDemo:true, sellerName:"Christophe M.",        sellerPhone:"+237671234567", description:"Barely used iPhone 15 Pro Max, 256GB, Natural Titanium. Battery health 99%. All original accessories and sealed box. Purchased 2 months ago from France." },
  { id:"demo-2", title:"Toyota Camry 2020 Automatic", price:12500000, category:"Vehicles",    location:"Bonanjo, Douala",    condition:"Good",     negotiable:true,  image:"https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&q=80",  postedAt:new Date().toISOString(), isDemo:true, sellerName:"Ngange Auto",           sellerPhone:"+237682345678", description:"Toyota Camry 2020, 2.5L automatic, metallic grey. 48,000 km. Climate control, leather seats, reverse camera. One owner, full service history. Papers complete." },
  { id:"demo-3", title:"3-Bedroom Apartment — Bastos",price:250000,   category:"Rentals",     location:"Bastos, Yaoundé",    condition:"New",      negotiable:false, image:"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",  postedAt:new Date().toISOString(), isDemo:true, sellerName:"Bastos Prestige Realty",sellerPhone:"+237693456789", description:"Fully furnished modern apartment in prestigious Bastos residence. 3 bedrooms, 2 bathrooms. 24h security, generator, parking, swimming pool. Monthly rent 250,000 XAF." },
  { id:"demo-4", title:'Samsung 65" 4K QLED Smart TV', price:285000,  category:"Electronics", location:"Akwa, Douala",       condition:"Like New", negotiable:true,  image:"https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&q=80",  postedAt:new Date().toISOString(), isDemo:true, sellerName:"ElectroCam",            sellerPhone:"+237654567890", description:"Samsung 65\" UHD 4K QLED Smart TV. Tizen OS, 4 HDMI ports, WiFi/Bluetooth. Used only 6 months, comes with original remote and stand." },
  { id:"demo-5", title:'MacBook Pro 14" M2 Pro 16GB', price:980000,   category:"Electronics", location:"Biyem-Assi, Yaoundé",condition:"Good",     negotiable:false, image:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80",  postedAt:new Date().toISOString(), isDemo:true, sellerName:"TechCorner CM",         sellerPhone:"+237665678901", description:"MacBook Pro 14\" M2 Pro, 16GB RAM, 512GB SSD. AppleCare+ until Dec 2026. Minor use — no scratches. All cables included." },
  { id:"demo-6", title:"L-Shaped Executive Sofa Set", price:320000,   category:"Furniture",   location:"Nkolndongo, Yaoundé",condition:"Good",     negotiable:true,  image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",  postedAt:new Date().toISOString(), isDemo:true, sellerName:"LuxHome CM",            sellerPhone:"+237676789012", description:"Premium brown leather L-shaped sofa set (5-seater + 2 armchairs). Minor wear on one armrest. Moving abroad — must sell urgently." },
];

const CATEGORIES = ["All","Electronics","Fashion","Appliances","Books","Furniture","Vehicles","Rentals","Other"];
const FAV_KEY = "bambeh_favorites";
function readFavIds(): Set<string> { try{return new Set((JSON.parse(localStorage.getItem(FAV_KEY)||"[]") as any[]).map((f:any)=>f.id));}catch{return new Set();} }
function saveFav(item: Item, add: boolean) {
  try{
    const s:any[]=JSON.parse(localStorage.getItem(FAV_KEY)||"[]");
    const i=s.findIndex((f:any)=>f.id===item.id);
    if(add&&i<0) s.unshift({id:item.id,title:item.title,price:`${item.price.toLocaleString("fr-CM")} XAF`,image:item.image,category:item.category,type:"marketplace",location:item.location,savedAt:new Date().toISOString()});
    else if(!add&&i>=0) s.splice(i,1);
    localStorage.setItem(FAV_KEY,JSON.stringify(s));
  }catch{}
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [items,   setItems]   = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [cat,     setCat]     = useState("All");
  const [favs,    setFavs]    = useState<Set<string>>(readFavIds);
  const [userId,  setUserId]  = useState<string|null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data:{session} } = await supabase.auth.getSession();
      setUserId(session?.user?.id??null);
      const { data, error } = await supabase.from("listings").select("id,title,price,category,location,description,extra,created_at,status").eq("type","marketplace").eq("status","active").order("created_at",{ascending:false}).limit(60);
      if(!error&&data&&data.length>0){
        setItems([...data.map((d:any)=>({id:d.id,title:d.title,price:d.price||0,category:d.category||"Other",location:d.location||"",image:d.extra?.image_url,condition:d.extra?.condition||"Used",description:d.description||"",postedAt:d.created_at,isDemo:false})),...SAMPLES]);
      } else { setItems(SAMPLES); }
    } catch { setItems(SAMPLES); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    void fetchItems();
    const ch = supabase.channel("mp_feed").on("postgres_changes",{event:"INSERT",schema:"public",table:"listings"},()=>void fetchItems()).subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [fetchItems]);

  function toggleFav(e: React.MouseEvent, item: Item) {
    e.stopPropagation();
    const adding = !favs.has(item.id);
    setFavs(prev=>{ const n=new Set(prev); adding?n.add(item.id):n.delete(item.id); return n; });
    saveFav(item, adding);
  }

  const filtered = items.filter(i=>{
    const ms=!search||i.title.toLowerCase().includes(search.toLowerCase())||i.location.toLowerCase().includes(search.toLowerCase());
    const mc=cat==="All"||i.category===cat;
    return ms&&mc;
  }).sort((a,b)=>{ if(a.isDemo!==b.isDemo)return a.isDemo?1:-1; return new Date(b.postedAt).getTime()-new Date(a.postedAt).getTime(); });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-teal-600"/>Marketplace</h1>
          <div className="flex gap-2">
            <button onClick={()=>void fetchItems()} className="p-2 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-gray-100"><RefreshCw className="w-4 h-4"/></button>
            <button onClick={()=>navigate("/marketplace/sell")} className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-teal-700 transition"><Plus className="w-4 h-4"/>Sell</button>
          </div>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items, location..." className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)} className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${cat===c?"bg-teal-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3"><Loader2 className="w-8 h-8 animate-spin text-teal-600"/><p className="text-sm text-gray-500">Loading items...</p></div>
        ) : filtered.length===0 ? (
          <div className="text-center py-16 text-gray-500">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300"/>
            <p className="font-medium">No items found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
            <button onClick={()=>navigate("/marketplace/sell")} className="mt-4 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Be the first to sell!</button>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">{filtered.length} item{filtered.length!==1?"s":""}</p>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(item=>(
                <div key={item.id} onClick={()=>navigate("/marketplace/"+item.id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">
                  <div className="h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
                    {item.image
                      ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                      : <ShoppingBag className="w-10 h-10 text-teal-200"/>
                    }
                    {item.isDemo && <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">DEMO</div>}
                    <button onClick={e=>toggleFav(e,item)} className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform" aria-label="Favourite">
                      <Heart className={`w-3.5 h-3.5 ${favs.has(item.id)?"fill-red-500 text-red-500":"text-gray-400"}`}/>
                    </button>
                    <span className="absolute bottom-2 left-2 text-xs bg-white/90 text-gray-700 px-1.5 py-0.5 rounded-full">{item.condition}</span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">{item.category}</p>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{item.title}</h3>
                    <p className="text-teal-600 font-bold text-sm">{item.price.toLocaleString()} XAF</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1"><MapPin className="w-3 h-3"/>{item.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

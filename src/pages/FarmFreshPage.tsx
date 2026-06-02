/**
 * src/pages/FarmFreshPage.tsx — Bambeh Marketplace
 * DEFINITIVE VERSION — no external component imports that may be missing
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Search, Plus, MapPin, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FarmProduct {
  id: string; name: string; price: number; unit: string;
  category: string; location: string; image_url?: string;
  is_organic: boolean; is_available: boolean; farmer_id: string;
  created_at: string; isDemo?: boolean; description?: string;
  sellerName?: string; sellerPhone?: string;
}

const SAMPLE_PRODUCTS: FarmProduct[] = [
  { id:"s1", name:"Fresh Tomatoes",       price:500,  unit:"kg",    category:"Vegetables", location:"Bafoussam, West",      is_organic:true,  is_available:true, farmer_id:"demo", created_at:new Date().toISOString(), isDemo:true, image_url:"https://images.unsplash.com/photo-1546470427-e212876f0173?w=400&q=80",  sellerName:"Fon's Farm",          sellerPhone:"+237671234567", description:"Sun-ripened organic tomatoes from highland farms. Perfect for cooking and salads." },
  { id:"s2", name:"Plantains (1 bunch)",  price:1500, unit:"bunch", category:"Fruits",     location:"Yaoundé, Centre",      is_organic:false, is_available:true, farmer_id:"demo", created_at:new Date().toISOString(), isDemo:true, image_url:"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80",  sellerName:"Mama Ngo's Produce",  sellerPhone:"+237682345678", description:"Fresh ripe plantains, 12–15 fingers per bunch. Ready for frying or boiling." },
  { id:"s3", name:"Cocoyams (Macabo)",    price:800,  unit:"kg",    category:"Tubers",     location:"Douala, Littoral",     is_organic:true,  is_available:true, farmer_id:"demo", created_at:new Date().toISOString(), isDemo:true, image_url:"https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80",  sellerName:"Douala Fresh",        sellerPhone:"+237693456789", description:"Fresh macabo cocoyams for Eru and Ndolé. Organically grown without chemicals." },
  { id:"s4", name:"Fresh Maize (Corn)",   price:300,  unit:"cob",   category:"Grains",     location:"Bamenda, NW Region",   is_organic:false, is_available:true, farmer_id:"demo", created_at:new Date().toISOString(), isDemo:true, image_url:"https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80",  sellerName:"NW Farm Co-op",       sellerPhone:"+237654567890", description:"Sweet, juicy corn on the cob from Bamenda highlands. Ready to grill or boil." },
  { id:"s5", name:"Groundnuts (1kg bag)", price:1200, unit:"kg",    category:"Legumes",    location:"Ngaoundéré, Adamaoua", is_organic:false, is_available:true, farmer_id:"demo", created_at:new Date().toISOString(), isDemo:true, image_url:"https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80", sellerName:"Adamaoua Nuts",       sellerPhone:"+237665678901", description:"Premium shelled groundnuts from the Adamaoua savannah. Clean, dried and ready." },
  { id:"s6", name:"Bitter Leaf (Ndolé)",  price:200,  unit:"bunch", category:"Vegetables", location:"Yaoundé, Centre",      is_organic:true,  is_available:true, farmer_id:"demo", created_at:new Date().toISOString(), isDemo:true, image_url:"https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",  sellerName:"Centre Fresh Greens", sellerPhone:"+237676789012", description:"Fresh bitter leaf (vernonia) for authentic Ndolé. Washed and ready to cook." },
  { id:"s7", name:"Fresh Avocados",       price:800,  unit:"kg",    category:"Fruits",     location:"Dschang, West",        is_organic:true,  is_available:true, farmer_id:"demo", created_at:new Date().toISOString(), isDemo:true, image_url:"https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80",  sellerName:"Highlands Harvest",   sellerPhone:"+237687890123", description:"Hand-picked highland avocados, creamy and nutritious. Delivery available." },
  { id:"s8", name:"Pineapples (Large)",   price:600,  unit:"piece", category:"Fruits",     location:"Edea, Littoral",       is_organic:false, is_available:true, farmer_id:"demo", created_at:new Date().toISOString(), isDemo:true, image_url:"https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400&q=80",  sellerName:"Littoral Tropicals",  sellerPhone:"+237698901234", description:"Sweet, extra-large pineapples from coastal farms near Edea." },
];

const CATEGORIES = ["All","Vegetables","Fruits","Tubers","Grains","Legumes","Herbs","Dairy"];

export default function FarmFreshPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<FarmProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("farm_products").select("*").eq("is_available", true)
        .order("created_at", { ascending: false }).limit(40);
      const realItems = (!error && data && data.length > 0)
        ? data.map((d: any) => ({ ...d, isDemo: false })) : [];
      setProducts([...realItems, ...SAMPLE_PRODUCTS]);
    } catch { setProducts(SAMPLE_PRODUCTS); }
    finally  { setLoading(false); }
  }

  useEffect(() => {
    void fetchProducts();
    const ch = supabase.channel("farm_live")
      .on("postgres_changes", { event:"*", schema:"public", table:"farm_products" }, () => void fetchProducts())
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, []);

  const filtered = products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const mc = category === "All" || p.category === category;
    return ms && mc;
  }).sort((a,b) => {
    if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-green-50">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" /> Farm Fresh
          </h1>
          <div className="flex gap-2">
            <button onClick={() => void fetchProducts()} className="p-2 text-gray-500 hover:text-green-600 rounded-xl hover:bg-gray-100">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/farm-fresh/sell")}
              className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Sell Produce
            </button>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search produce, location..."
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${category===c ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-4 mt-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4 text-white mb-4">
        <h2 className="font-bold text-lg mb-1">🌿 Buy Direct from Farmers</h2>
        <p className="text-green-100 text-sm">Fresh produce, fair prices. Support local agriculture in Cameroon.</p>
      </div>

      <div className="px-4 pb-8">
        {!loading && (
          <p className="mb-3 text-xs text-gray-500">
            {filtered.filter(p=>!p.isDemo).length > 0
              ? `${filtered.filter(p=>!p.isDemo).length} real listings + sample items`
              : `Showing ${SAMPLE_PRODUCTS.length} sample items — be the first to list real produce!`}
          </p>
        )}
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">Loading fresh produce...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No produce found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or category.</p>
            <button onClick={() => navigate("/farm-fresh/sell")}
              className="mt-4 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              List Your Produce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <div key={product.id} onClick={() => navigate("/farm-fresh/" + product.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
                <div className="h-36 bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center overflow-hidden relative">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} loading="lazy" className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display="none"; }} />
                    : <span className="text-4xl">🌿</span>
                  }
                  {product.isDemo && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">DEMO</div>
                  )}
                  {product.is_organic && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">Bio</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{product.name}</h3>
                  <p className="text-green-600 font-bold text-sm">{product.price.toLocaleString("fr-CM")} FCFA/{product.unit}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />{product.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

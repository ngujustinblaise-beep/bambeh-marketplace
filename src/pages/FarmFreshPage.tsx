/**
 * src/pages/FarmFreshPage.tsx — Bambeh Marketplace
 * ✅ ADDED: view_count shown on each product card (below the Add to Cart button)
 * All original logic preserved exactly.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf, Search, Plus, MapPin, Loader2, RefreshCw,
  ShoppingBag, ShoppingCart, Users, Tag, Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";

interface FarmProduct {
  id: string;
  title: string;
  price_per_unit_xaf: number;
  unit: string;
  category: string;
  location: string;
  image_url?: string;
  images?: string[];
  is_organic: boolean;
  is_available: boolean;
  seller_id: string;
  created_at: string;
  isDemo?: boolean;
  description?: string;
  sellerName?: string;
  sellerPhone?: string;
  view_count?: number; // ✅ NEW
}

interface AdSlot {
  id: string; isAd: true; title: string; subtitle: string; cta: string; route: string; emoji: string;
}

const DEMO_PRODUCTS: FarmProduct[] = [
  { id: "s1", title: "Fresh Tomatoes", price_per_unit_xaf: 500, unit: "kg", category: "Vegetables", location: "Bafoussam, West", is_organic: true, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1546470427-e212876f0173?w=400&q=80", sellerName: "Fon's Farm", sellerPhone: "+237671234567", description: "Sun-ripened organic tomatoes from highland farms." },
  { id: "s2", title: "Plantains (1 bunch)", price_per_unit_xaf: 1500, unit: "bunch", category: "Fruits", location: "Yaoundé, Centre", is_organic: false, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80", sellerName: "Mama Ngo's Produce", sellerPhone: "+237682345678", description: "Fresh ripe plantains, 12–15 fingers per bunch." },
  { id: "s3", title: "Cocoyams (Macabo)", price_per_unit_xaf: 800, unit: "kg", category: "Tubers", location: "Douala, Littoral", is_organic: true, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80", sellerName: "Douala Fresh", sellerPhone: "+237693456789", description: "Fresh macabo cocoyams for Eru and Ndolé." },
  { id: "s4", title: "Fresh Maize (Corn)", price_per_unit_xaf: 300, unit: "cob", category: "Grains", location: "Bamenda, NW Region", is_organic: false, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80", sellerName: "NW Farm Co-op", sellerPhone: "+237654567890", description: "Sweet, juicy corn on the cob from Bamenda highlands." },
  { id: "s5", title: "Groundnuts (1kg bag)", price_per_unit_xaf: 1200, unit: "kg", category: "Legumes", location: "Ngaoundéré, Adamaoua", is_organic: false, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80", sellerName: "Adamaoua Nuts", sellerPhone: "+237665678901", description: "Premium shelled groundnuts from the Adamaoua savannah." },
  { id: "s6", title: "Bitter Leaf (Ndolé)", price_per_unit_xaf: 200, unit: "bunch", category: "Vegetables", location: "Yaoundé, Centre", is_organic: true, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80", sellerName: "Centre Fresh Greens", sellerPhone: "+237676789012", description: "Fresh bitter leaf for authentic Ndolé." },
  { id: "s7", title: "Fresh Avocados", price_per_unit_xaf: 800, unit: "kg", category: "Fruits", location: "Dschang, West", is_organic: true, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80", sellerName: "Highlands Harvest", sellerPhone: "+237687890123", description: "Hand-picked highland avocados, creamy and nutritious." },
  { id: "s8", title: "Pineapples (Large)", price_per_unit_xaf: 600, unit: "piece", category: "Fruits", location: "Edea, Littoral", is_organic: false, is_available: true, seller_id: "demo", created_at: new Date().toISOString(), isDemo: true, image_url: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400&q=80", sellerName: "Littoral Tropicals", sellerPhone: "+237698901234", description: "Sweet, extra-large pineapples from coastal farms." },
];

const AD_SLOTS: AdSlot[] = [
  { id: "ad1", isAd: true, title: "Group Buying", subtitle: "Buy together, save more", cta: "Join a Group", route: "/group-buying", emoji: "🤝" },
  { id: "ad2", isAd: true, title: "Sell Your Produce", subtitle: "Reach buyers across Cameroon", cta: "List Now", route: "/farm-fresh/sell", emoji: "🌿" },
];

const CATEGORIES = ["All", "Vegetables", "Fruits", "Tubers", "Grains", "Legumes", "Herbs", "Dairy"];

function hasImage(p: FarmProduct): boolean {
  if (p.image_url && p.image_url.trim() !== "") return true;
  if (p.images && p.images.length > 0 && p.images[0].trim() !== "") return true;
  return false;
}
function getImage(p: FarmProduct): string { return (p.image_url || p.images?.[0] || ""); }

export default function FarmFreshPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<FarmProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [addedId,  setAddedId]  = useState<string | null>(null);

  async function fetchProducts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("farm_products")
        .select("*, view_count") // ✅ includes view_count
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(80);

      const realItems: FarmProduct[] = (!error && data && data.length > 0)
        ? data.map((d: any) => ({
            id: d.id,
            title: d.title || d.name || "Untitled",
            price_per_unit_xaf: d.price_per_unit_xaf ?? d.price ?? 0,
            unit: d.unit || "unit",
            category: d.category || "Other",
            location: d.location || "",
            image_url: d.image_url || d.images?.[0],
            images: d.images,
            is_organic: d.is_organic ?? false,
            is_available: d.is_available ?? true,
            seller_id: d.seller_id || "",
            created_at: d.created_at,
            isDemo: false,
            description: d.description,
            sellerName: d.seller_name,
            sellerPhone: d.seller_phone,
            view_count: d.view_count ?? 0, // ✅ NEW
          }))
        : [];

      const realWithPhotos  = realItems.filter(hasImage);
      const realWithoutPhoto = realItems.filter(p => !hasImage(p));
      const demoWithPhotos   = DEMO_PRODUCTS.filter(hasImage);

      setProducts([...realWithPhotos, ...realWithoutPhoto, ...demoWithPhotos]);
    } catch {
      setProducts(DEMO_PRODUCTS.filter(hasImage));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel("farm_products_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "farm_products" }, fetchProducts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function handleAddToCart(e: React.MouseEvent, p: FarmProduct) {
    e.stopPropagation();
    addToCart({ id: p.id, name: p.title, price: p.price_per_unit_xaf, unit: p.unit, image: getImage(p) || "", farmerId: p.seller_id, farmerName: p.sellerName || "Farmer", category: p.category, isOrganic: p.is_organic });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  const realCount = products.filter(p => !p.isDemo).length;
  const filtered  = products.filter(p => {
    const matchSearch   = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.location || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || p.category === category;
    return matchSearch && matchCategory;
  });

  // Insert ad slots every 8 cards
  const gridItems: (FarmProduct | AdSlot)[] = [];
  let adIdx = 0;
  filtered.forEach((p, i) => {
    gridItems.push(p);
    if ((i + 1) % 8 === 0 && adIdx < AD_SLOTS.length) { gridItems.push(AD_SLOTS[adIdx++]); }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600" /> Farm Fresh
          </h1>
          <div className="flex gap-2">
            <button onClick={fetchProducts} className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-gray-100"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={() => navigate("/farm-fresh/sell")} className="bg-green-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1"><Plus className="w-4 h-4" /> Sell</button>
          </div>
        </div>
        <div className="relative px-4 pb-3">
          <Search className="absolute left-7 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search produce, location..."
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === c ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Hero banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4 text-white mb-3">
        <h2 className="font-bold text-lg mb-1">🌿 Buy Direct from Farmers</h2>
        <p className="text-green-100 text-sm mb-3">Fresh produce, fair prices. Visible to buyers worldwide.</p>
        <button onClick={() => navigate("/group-buying")} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl text-sm font-semibold transition">
          <Users className="w-4 h-4" /> Join Group Buying — Save More
        </button>
      </div>

      {/* Product grid */}
      <div className="px-4 pb-24">
        {!loading && <p className="mb-3 text-xs text-gray-500">{realCount > 0 ? `${realCount} real listing${realCount !== 1 ? "s" : ""} + sample items` : `Showing ${DEMO_PRODUCTS.length} sample items — be the first to list real produce!`}</p>}
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3"><Loader2 className="w-8 h-8 animate-spin text-green-600" /><p className="text-sm text-gray-500">Loading fresh produce…</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No produce found</p>
            <button onClick={() => navigate("/farm-fresh/sell")} className="mt-4 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">List Your Produce</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gridItems.map((item) => {
              if ("isAd" in item) {
                return (
                  <div key={item.id} onClick={() => navigate(item.route)}
                    className="col-span-2 bg-gradient-to-r from-teal-500 to-green-600 rounded-2xl p-4 text-white cursor-pointer hover:shadow-md active:scale-[0.98] transition flex items-center gap-4">
                    <span className="text-4xl">{item.emoji}</span>
                    <div className="flex-1"><p className="font-bold text-base">{item.title}</p><p className="text-green-100 text-xs mt-0.5">{item.subtitle}</p></div>
                    <div className="bg-white/20 px-3 py-1.5 rounded-xl text-sm font-semibold flex-shrink-0">{item.cta}</div>
                  </div>
                );
              }
              const p = item as FarmProduct;
              const img = getImage(p);
              const noPhoto = !img;
              const isAdded = addedId === p.id;
              return (
                <div key={p.id} onClick={() => navigate("/farm-fresh/" + p.id)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]">
                  <div className="h-36 bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center overflow-hidden relative">
                    {noPhoto ? (
                      <div className="flex flex-col items-center gap-1 px-2 text-center"><span className="text-4xl">🌿</span>{!p.isDemo && <span className="text-xs text-gray-400 leading-tight">No photo yet</span>}</div>
                    ) : (
                      <img src={img} alt={p.title} loading="lazy" className="w-full h-full object-cover"
                        onError={e => { const el = e.target as HTMLImageElement; el.style.display = "none"; }} />
                    )}
                    {p.isDemo && <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">DEMO</div>}
                    {noPhoto && !p.isDemo && <div className="absolute top-2 left-2 bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">📷 No photo</div>}
                    {p.is_organic && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">Bio</div>}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">{p.title}</h3>
                    <p className="text-green-600 font-bold text-sm">{p.price_per_unit_xaf.toLocaleString("fr-CM")} FCFA/{p.unit}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 mb-2">
                      <MapPin className="w-3 h-3" /><span className="truncate">{p.location}</span>
                    </div>
                    <button onClick={e => handleAddToCart(e, p)}
                      className={`w-full py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${isAdded ? "bg-green-100 text-green-700" : "bg-green-600 hover:bg-green-700 text-white active:scale-95"}`}>
                      <ShoppingCart className="w-3.5 h-3.5" />{isAdded ? "Added ✓" : "Add to Cart"}
                    </button>
                    {/* ✅ NEW: View count */}
                    {!p.isDemo && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                        <Eye className="w-3 h-3" />{p.view_count ?? 0} views
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <CartFloater />
    </div>
  );
}

function CartFloater() {
  const navigate = useNavigate();
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);
  if (count === 0) return null;
  return (
    <button onClick={() => navigate("/cart")} className="fixed bottom-24 right-4 z-40 bg-green-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-semibold text-sm active:scale-95 transition">
      <ShoppingCart className="w-4 h-4" /> Cart ({count})
    </button>
  );
}

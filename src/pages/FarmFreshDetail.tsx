/**
 * src/pages/FarmFreshDetail.tsx â€” Bambeh Marketplace
 *
 * FIXED & REWRITTEN:
 *  âœ… Loads real product from Supabase (was only showing hardcoded mock data)
 *  âœ… Falls back gracefully to demo products if no DB match
 *  âœ… i18n â€” reacts instantly when user changes language (useLang / t)
 *  âœ… "Buy via app" â†’ navigates to /farm-fresh/order/:id
 *  âœ… "Contact Seller via WhatsApp" â€” if seller_phone is available
 *  âœ… Add to cart uses CartContext
 *  âœ… Increments view_count in Supabase on mount
 *  âœ… Handles s1-s8 demo IDs as well as UUID real products
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, ShoppingCart, Heart, Share2,
  Copy, MessageCircle, CheckCircle, Truck, Leaf,
  Loader2, AlertCircle, Eye, Package,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useLang, t } from "@/hooks/useAppLang";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface RealProduct {
  id: string;
  title: string;
  description?: string;
  price_per_unit_xaf: number;
  unit: string;
  category: string;
  location: string;
  image_url?: string;
  images?: string[];
  is_organic: boolean;
  is_available: boolean;
  seller_id?: string;
  farmer_id?: string;
  seller_name?: string;
  seller_phone?: string;
  available_for_delivery?: boolean;
  stock_quantity?: number;
  view_count?: number;
  created_at?: string;
}

// â”€â”€ Demo products (s1-s8 fallback) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DEMO_PRODUCTS: Record<string, RealProduct> = {
  s1: { id: "s1", title: "Fresh Tomatoes",      description: "Sun-ripened organic tomatoes from highland farms.", price_per_unit_xaf: 500,  unit: "kg",    category: "Vegetables", location: "Bafoussam, West",      is_organic: true,  is_available: true, image_url: "https://images.unsplash.com/photo-1546470427-e212876f0173?w=400&q=80", seller_name: "Fon's Farm",           seller_phone: "+237671234567" },
  s2: { id: "s2", title: "Plantains (1 bunch)",  description: "Fresh ripe plantains, 12â€“15 fingers per bunch.",    price_per_unit_xaf: 1500, unit: "bunch", category: "Fruits",     location: "YaoundÃ©, Centre",      is_organic: false, is_available: true, image_url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80", seller_name: "Mama Ngo's Produce",   seller_phone: "+237682345678" },
  s3: { id: "s3", title: "Cocoyams (Macabo)",    description: "Fresh macabo cocoyams for Eru and NdolÃ©.",          price_per_unit_xaf: 800,  unit: "kg",    category: "Tubers",     location: "Douala, Littoral",     is_organic: true,  is_available: true, image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&q=80", seller_name: "Douala Fresh",         seller_phone: "+237693456789" },
  s4: { id: "s4", title: "Fresh Maize (Corn)",   description: "Sweet, juicy corn on the cob from Bamenda.",        price_per_unit_xaf: 300,  unit: "cob",   category: "Grains",     location: "Bamenda, NW Region",   is_organic: false, is_available: true, image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80", seller_name: "NW Farm Co-op",        seller_phone: "+237654567890" },
  s5: { id: "s5", title: "Groundnuts (1kg bag)", description: "Premium shelled groundnuts from the Adamaoua.",     price_per_unit_xaf: 1200, unit: "kg",    category: "Legumes",    location: "NgaoundÃ©rÃ©, Adamaoua", is_organic: false, is_available: true, image_url: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80", seller_name: "Adamaoua Nuts",        seller_phone: "+237665678901" },
  s6: { id: "s6", title: "Bitter Leaf (NdolÃ©)",  description: "Fresh bitter leaf for authentic NdolÃ©.",            price_per_unit_xaf: 200,  unit: "bunch", category: "Vegetables", location: "YaoundÃ©, Centre",      is_organic: true,  is_available: true, image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80", seller_name: "Centre Fresh Greens",  seller_phone: "+237676789012" },
  s7: { id: "s7", title: "Fresh Avocados",        description: "Hand-picked highland avocados, creamy and nutritious.", price_per_unit_xaf: 800, unit: "kg", category: "Fruits",     location: "Dschang, West",        is_organic: true,  is_available: true, image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80", seller_name: "Highlands Harvest",    seller_phone: "+237687890123" },
  s8: { id: "s8", title: "Pineapples (Large)",    description: "Sweet, extra-large pineapples from coastal farms.", price_per_unit_xaf: 600, unit: "piece", category: "Fruits",     location: "Edea, Littoral",       is_organic: false, is_available: true, image_url: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400&q=80", seller_name: "Littoral Tropicals",   seller_phone: "+237698901234" },
};

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

const fmtXAF = (n: number) => new Intl.NumberFormat("fr-CM").format(Math.round(n)) + " FCFA";

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FarmFreshDetail: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { addToCart } = useCart();
  const lang      = useLang();

  const [product,      setProduct]      = useState<RealProduct | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [isDemo,       setIsDemo]       = useState(false);
  const [qty,          setQty]          = useState(1);
  const [addedToCart,  setAddedToCart]  = useState(false);
  const [wishlisted,   setWishlisted]   = useState(false);
  const [shareOpen,    setShareOpen]    = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [relatedItems, setRelatedItems] = useState<RealProduct[]>([]);

  useEffect(() => {
    if (!id) return;
    loadProduct(id);
    const wl: string[] = JSON.parse(localStorage.getItem("Bambeh_wishlist") || "[]");
    setWishlisted(wl.includes(id));
  }, [id]);

  async function loadProduct(pid: string) {
    setLoading(true);

    // 1. Check demo map first (s1â€“s8)
    if (DEMO_PRODUCTS[pid]) {
      setProduct(DEMO_PRODUCTS[pid]);
      setIsDemo(true);
      setLoading(false);
      // Load related demo products
      const others = Object.values(DEMO_PRODUCTS).filter(p => p.id !== pid).slice(0, 3);
      setRelatedItems(others);
      return;
    }

    // 2. Try Supabase DB
    if (isUUID(pid)) {
      try {
        const { data, error } = await supabase
          .from("farm_products")
          .select("*")
          .eq("id", pid)
          .single();

        if (!error && data) {
          const p: RealProduct = {
            id:                     data.id,
            title:                  data.title || data.name || "Untitled",
            description:            data.description,
            price_per_unit_xaf:     data.price_per_unit_xaf ?? data.price ?? 0,
            unit:                   data.unit || "unit",
            category:               data.category || "Other",
            location:               data.location || "",
            image_url:              data.image_url || data.images?.[0],
            images:                 data.images,
            is_organic:             data.is_organic ?? false,
            is_available:           data.is_available ?? true,
            seller_id:              data.seller_id || data.farmer_id,
            farmer_id:              data.farmer_id || data.seller_id,
            seller_name:            data.seller_name,
            seller_phone:           data.seller_phone,
            available_for_delivery: data.available_for_delivery ?? false,
            stock_quantity:         data.stock_quantity,
            view_count:             data.view_count ?? 0,
            created_at:             data.created_at,
          };
          setProduct(p);
          setIsDemo(false);
          setLoading(false);

          // Increment view_count (fire and forget)
          supabase.from("farm_products").update({ view_count: (data.view_count ?? 0) + 1 }).eq("id", pid).then(() => {});

          // Load related products from same category
          supabase
            .from("farm_products")
            .select("id, title, price_per_unit_xaf, unit, category, location, image_url, images")
            .eq("category", data.category)
            .eq("is_available", true)
            .neq("id", pid)
            .limit(3)
            .then(({ data: rel }) => {
              if (rel && rel.length > 0) {
                setRelatedItems(rel.map((r: any) => ({
                  id: r.id, title: r.title || r.name || "Product",
                  price_per_unit_xaf: r.price_per_unit_xaf ?? r.price ?? 0,
                  unit: r.unit, category: r.category, location: r.location || "",
                  image_url: r.image_url || r.images?.[0],
                  is_organic: false, is_available: true,
                })));
              } else {
                // Fall back to demo related
                setRelatedItems(Object.values(DEMO_PRODUCTS).slice(0, 3));
              }
            });
          return;
        }
      } catch { /* fall through */ }
    }

    // 3. Nothing found
    setProduct(null);
    setLoading(false);
  }

  function toggleWishlist() {
    if (!id) return;
    const wl: string[] = JSON.parse(localStorage.getItem("Bambeh_wishlist") || "[]");
    const next = wishlisted ? wl.filter(x => x !== id) : [...wl, id];
    localStorage.setItem("Bambeh_wishlist", JSON.stringify(next));
    setWishlisted(!wishlisted);
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart({
      id:           product.id,
      title:        product.title,
      priceXAF:     product.price_per_unit_xaf,
      quantity:     qty,
      unit:         product.unit,
      imageUrl:     product.image_url || "",
      listingType:  "farm-fresh",
      sellerName:   product.seller_name || "Farmer",
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  const shareUrl = `https://bambeh.cm/farm-fresh/${id}`;

  // â”€â”€ Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-green-600" />
          <p className="text-sm text-gray-500">{t("loading", lang)}</p>
        </div>
      </div>
    );
  }

  // â”€â”€ Not found â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <AlertCircle className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("productNotFound", lang)}</h2>
          <p className="text-gray-500 text-sm mb-6">{t("productNotFoundSub", lang) || "This product may be unavailable or removed."}</p>
          <Link to="/farm-fresh" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">
            {t("backToFarmFresh", lang)}
          </Link>
        </div>
      </div>
    );
  }

  const mainImage = product.image_url || (product.images?.[0]) || "";
  const allImages = product.images?.length ? product.images : mainImage ? [mainImage] : [];
  const totalPrice = product.price_per_unit_xaf * qty;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">{t("back", lang) || "Back"}</span>
          </button>
          <div className="flex gap-2">
            <button onClick={toggleWishlist} className={`p-2.5 rounded-xl border ${wishlisted ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
              <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
            </button>
            <button onClick={() => setShareOpen(true)} className="p-2.5 rounded-xl border border-gray-200">
              <Share2 className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Hero image / header */}
        <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-3xl text-white overflow-hidden">
          {mainImage ? (
            <div className="h-56 overflow-hidden">
              <img src={mainImage} alt={product.title} className="w-full h-full object-cover opacity-90" />
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <span className="text-8xl">ðŸŒ¿</span>
            </div>
          )}
          <div className="p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              {product.is_organic && (
                <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <Leaf className="w-3 h-3" />{t("organic", lang)}
                </span>
              )}
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{product.category}</span>
              {isDemo && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">DEMO</span>}
            </div>
            <h1 className="text-xl font-black leading-snug">{product.title}</h1>
            {product.description && <p className="text-green-100 text-sm mt-1 line-clamp-2">{product.description}</p>}
            <div className="flex items-center gap-3 mt-3">
              <div className="text-2xl font-black">{fmtXAF(product.price_per_unit_xaf)}</div>
              <div className="text-green-200 text-sm">/ {product.unit}</div>
            </div>
            <div className="flex items-center gap-1 text-green-200 text-xs mt-2">
              <MapPin className="w-3 h-3" />{product.location}
            </div>
          </div>
        </div>

        {/* Extra images gallery */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <img key={i} src={img} alt={`${product.title} ${i + 1}`}
                className="h-20 w-20 flex-shrink-0 object-cover rounded-xl border-2 border-gray-100" />
            ))}
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-2">{t("aboutProduct", lang) || "About This Product"}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Info grid */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">{t("unit", lang) || "Unit"}</p>
                <p className="font-semibold text-gray-900 text-sm">{product.unit}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">{t("locationKey", lang) || "Location"}</p>
                <p className="font-semibold text-gray-900 text-sm">{product.location}</p>
              </div>
            </div>
            {product.available_for_delivery !== undefined && (
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{t("deliveryKey", lang) || "Delivery"}</p>
                  <p className="font-semibold text-gray-900 text-sm">
                    {product.available_for_delivery ? (t("delivAvail", lang) || "Available") : (t("pickupOnly", lang) || "Pickup only")}
                  </p>
                </div>
              </div>
            )}
            {product.stock_quantity != null && (
              <div className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{t("stockKey", lang) || "In Stock"}</p>
                  <p className="font-semibold text-gray-900 text-sm">{product.stock_quantity} {product.unit}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seller / farmer info */}
        {(product.seller_name || product.seller_phone) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">{t("yourFarmer", lang) || "Your Farmer"}</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">ðŸŒ¾</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{product.seller_name || "Farmer"}</p>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                  <MapPin className="w-3 h-3" />{product.location}
                </div>
              </div>
            </div>
            {product.seller_phone && (
              <a
                href={`https://wa.me/${product.seller_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I saw your listing for ${product.title} on Bambeh. I'm interested!`)}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#1da851] transition-colors">
                <MessageCircle className="w-4 h-4" />{t("whatsappSeller", lang) || "WhatsApp Farmer"}
              </a>
            )}
          </div>
        )}

        {/* Related products */}
        {relatedItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">{t("moreFarm", lang) || "More Farm Products"}</h2>
              <Link to="/farm-fresh" className="text-green-600 text-sm font-semibold">{t("seeAll", lang) || "See all"} â†’</Link>
            </div>
            <div className="space-y-3">
              {relatedItems.map(rp => (
                <Link key={rp.id} to={`/farm-fresh/${rp.id}`}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-green-50 flex-shrink-0">
                    {rp.image_url
                      ? <img src={rp.image_url} alt={rp.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">ðŸŒ¿</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{rp.title}</p>
                    <p className="text-gray-500 text-xs">{rp.location}</p>
                    <p className="text-green-600 font-bold text-sm mt-1">{fmtXAF(rp.price_per_unit_xaf)} / {rp.unit}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Freshness guarantee */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">{t("freshnessGuarantee", lang) || "Freshness Guarantee"}</p>
            <p className="text-green-700 text-xs mt-0.5">
              {t("freshnessDesc", lang) || "If your produce arrives below standard, report within 24 hours and we will arrange a replacement or full refund."}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">{t("quantity", lang) || "Qty"}</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded-lg">âˆ’</button>
                <span className="w-10 text-center font-bold text-sm">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded-lg">+</button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-gray-900">{fmtXAF(totalPrice)}</div>
              <div className="text-xs text-gray-400">{qty} Ã— {product.unit}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddToCart}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                ${addedToCart ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-900 text-white hover:bg-gray-800"}`}>
              {addedToCart
                ? <><CheckCircle className="w-4 h-4" />{t("added", lang) || "Added!"}</>
                : <><ShoppingCart className="w-4 h-4" />{t("addToCart", lang) || "Add to Cart"}</>
              }
            </button>
            <button onClick={() => navigate(`/farm-fresh/order/${product.id}?quantity=${qty}`)}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 transition-all shadow-md">
              ðŸŒ¿ {t("orderNow", lang) || "Order Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Share sheet */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end px-4 pb-6" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md mx-auto p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-4">{t("shareProduct", lang) || "Share This Product"}</h3>
            <div className="space-y-3">
              <a href={`https://wa.me/?text=${encodeURIComponent(`ðŸŒ¿ Check this on Bambeh FarmFresh! ${product.title} â€” ${fmtXAF(product.price_per_unit_xaf)}/${product.unit}. Fresh from Cameroon! ${shareUrl}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl text-[#128C7E] font-semibold">
                <MessageCircle className="w-5 h-5" />{t("shareWhatsApp", lang) || "Share on WhatsApp"}
              </a>
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 font-semibold">
                <Copy className="w-5 h-5 text-gray-400" />{copied ? "âœ“ Copied!" : (t("copyLink", lang) || "Copy Link")}
              </button>
            </div>
            <button onClick={() => setShareOpen(false)} className="w-full mt-3 py-3 text-gray-500 text-sm">{t("cancel", lang) || "Cancel"}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmFreshDetail;



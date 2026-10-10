// BAMBEH_DEPLOY_TOKEN__FARMFRESHDETAIL_FIX695_CLEAN
// FIX695 (10 Oct 2026) - built on FIX342 / FIX105:
//   - "WhatsApp Farmer" (it showed the farmer's phone number) is now "Chat with the farmer":
//     Bambeh chat only, so every sale stays inside Bambeh Secured Pay (Big, 8 Oct 2026).
//   - The freshness note no longer promises a "full refund": a refund is the item price,
//     after Bambeh staff check the report (the refund rule of FIX634-638).
//   - Share links use the real address (was bambeh.cm), and the pictures that an old
//     encoding accident turned into "??" are back. Words for the new lines in 5 languages.
/**
 * FarmFreshDetail.tsx - Bambeh Marketplace
 *
 * FIXED & REWRITTEN:
 *  - Loads real product from Supabase (was only showing hardcoded mock data)
 *  - Falls back gracefully to demo products if no DB match
 *  - i18n - reacts instantly when user changes language (useLang / t)
 *  - "Buy via app" - navigates to /farm-fresh/order/:id
 *  - Contact: Bambeh chat with the farmer (FIX695; was WhatsApp)
 *  - Add to cart uses CartContext
 *  - Increments view_count in Supabase on mount
 *  - Handles s1-s8 demo IDs as well as UUID real products
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, MapPin, ShoppingCart, Heart, Share2,
  Copy, MessageCircle, CheckCircle, Truck, Leaf,
  Loader2, AlertCircle, Eye, Package,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import SellerReviews from "@/components/reviews/SellerReviews";  // FIX342
import { useCart } from "@/contexts/CartContext";
import { useLang, t } from "@/hooks/useAppLang";
import { publicShareUrl } from "@/config/storeMode"; // FIX695

// FIX695 - the new words on this page, in the five app languages.
type FarmLang = "en" | "fr" | "pidgin" | "ar" | "ff";
function farmLang(v: unknown): FarmLang {
  const l = String(v || "en").toLowerCase();
  if (l.indexOf("fr") === 0) return "fr";
  if (l === "pcm" || l.indexOf("pid") === 0) return "pidgin";
  if (l.indexOf("ar") === 0) return "ar";
  if (l === "ff" || l === "ful" || l === "fulfulde") return "ff";
  return "en";
}
const FARM_T: Record<FarmLang, { chatFarmer: string; freshness: string; copied: string; shareText: string }> = {
  en: {
    chatFarmer: "Chat with the farmer",
    freshness: "If your produce arrives below standard, report it within 24 hours in My Orders. Bambeh checks it and arranges a replacement or a refund of the item price.",
    copied: "Copied!",
    shareText: "Fresh on Bambeh Farm Fresh: {title}, {price} / {unit}.",
  },
  fr: {
    chatFarmer: "Discuter avec le producteur",
    freshness: "Si vos produits arrivent en mauvais \u00e9tat, signalez-le sous 24 heures dans Mes commandes. Bambeh v\u00e9rifie et organise un remplacement ou le remboursement du prix de l\u2019article.",
    copied: "Copi\u00e9 !",
    shareText: "Frais sur Bambeh Farm Fresh : {title}, {price} / {unit}.",
  },
  pidgin: {
    chatFarmer: "Chat with the farmer",
    freshness: "If your produce reach and e no good, report am inside 24 hours for My Orders. Bambeh go check am and arrange another one or refund the price of the thing.",
    copied: "E don copy!",
    shareText: "Fresh for Bambeh Farm Fresh: {title}, {price} / {unit}.",
  },
  ar: {
    chatFarmer: "\u062a\u062d\u062f\u0651\u062b \u0645\u0639 \u0627\u0644\u0645\u0632\u0627\u0631\u0639",
    freshness: "\u0625\u0630\u0627 \u0648\u0635\u0644\u062a \u0645\u0646\u062a\u062c\u0627\u062a\u0643 \u0628\u062c\u0648\u062f\u0629 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u060c \u0623\u0628\u0644\u063a \u0639\u0646 \u0630\u0644\u0643 \u062e\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629 \u0641\u064a \u0637\u0644\u0628\u0627\u062a\u064a. \u062a\u062a\u062d\u0642\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0645\u0646 \u0627\u0644\u0623\u0645\u0631 \u0648\u062a\u0631\u062a\u0651\u0628 \u0627\u0633\u062a\u0628\u062f\u0627\u0644\u0647\u0627 \u0623\u0648 \u0627\u0633\u062a\u0631\u062f\u0627\u062f \u0633\u0639\u0631 \u0627\u0644\u0645\u0646\u062a\u062c.",
    copied: "\u062a\u0645 \u0627\u0644\u0646\u0633\u062e!",
    shareText: "\u0637\u0627\u0632\u062c \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647 \u0641\u0627\u0631\u0645 \u0641\u0631\u064a\u0634: {title}\u060c {price} / {unit}.",
  },
  ff: {
    chatFarmer: "Haal e ndemoowo",
    freshness: "So ko ndemaa ngal yottii ko mo\u01b4\u01b4aani, habru e nder saa\u2019aaji 24 e Yamiroore am. Bambeh \u01b4eewtan, wa\u0257a lomtugol walla artirde coggu huunde nde.",
    copied: "Nattaama!",
    shareText: "Kesum e Bambeh Farm Fresh: {title}, {price} / {unit}.",
  },
};

// -- Types ---------------------------------------------------------------------
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
  available_for_delivery?: boolean;
  stock_quantity?: number;
  view_count?: number;
  created_at?: string;
}

// FIX105: demo products removed - detail loads real DB rows only.

function isUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

const fmtXAF = (n: number) => new Intl.NumberFormat("fr-CM").format(Math.round(n)) + " FCFA";

// -- Main Component -------------------------------------------------------------
const FarmFreshDetail: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { addToCart } = useCart();
  const lang      = useLang();
  const ft        = FARM_T[farmLang(lang)]; // FIX695

  const [product,      setProduct]      = useState<RealProduct | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [,             setIsDemo]       = useState(false); // FIX695: the old demo flag is never shown
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
                setRelatedItems([]);
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
      
      imageUrl:     product.image_url || "",
      listingType:  "farm-fresh",
      sellerName:   product.seller_name || "Farmer",
      sellerId:     (product as any).seller_id || "",
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  const shareUrl = publicShareUrl(); // FIX695: the real address (was bambeh.cm)

  // -- Loading --------------------------------------------------------------
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

  // -- Not found ------------------------------------------------------------
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
              <span className="text-8xl">{'\ud83e\udd6c'}</span>
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
        {(product.seller_name || product.seller_id) && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">{t("yourFarmer", lang) || "Your Farmer"}</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">{'\ud83e\uddd1\u200d\ud83c\udf3e'}</div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{product.seller_name || "Farmer"}</p>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                  <MapPin className="w-3 h-3" />{product.location}
                </div>
              </div>
            </div>
            {product.seller_id && (
              <button
                type="button"
                onClick={() => navigate(`/chat?userId=${encodeURIComponent(product.seller_id || "")}&listingTitle=${encodeURIComponent(product.title)}${mainImage ? "&listingImage=" + encodeURIComponent(mainImage) : ""}`)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors">
                <MessageCircle className="w-4 h-4" />{ft.chatFarmer}
              </button>
            )}
          </div>
        )}

        {/* FIX342 - the same review screen the marketplace item page got.
            Farmers are sellers too, and reviews are stored on target_id. */}
        {product.seller_id ? <SellerReviews sellerId={product.seller_id} /> : null}

        {/* Related products */}
        {relatedItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">{t("moreFarm", lang) || "More Farm Products"}</h2>
              <Link to="/farm-fresh" className="text-green-600 text-sm font-semibold">{t("seeAll", lang) || "See all"} {'\u2192'}</Link>
            </div>
            <div className="space-y-3">
              {relatedItems.map(rp => (
                <Link key={rp.id} to={`/farm-fresh/${rp.id}`}
                  className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-green-50 flex-shrink-0">
                    {rp.image_url
                      ? <img src={rp.image_url} alt={rp.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">{'\ud83e\udd6c'}</div>
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
              {ft.freshness}
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
                  className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded-lg">-</button>
                <span className="w-10 text-center font-bold text-sm">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded-lg">+</button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-gray-900">{fmtXAF(totalPrice)}</div>
              <div className="text-xs text-gray-400">{qty} {'\u00d7'} {product.unit}</div>
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
              {'\u26a1'} {t("orderNow", lang) || "Order Now"}
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
              <a href={`https://wa.me/?text=${encodeURIComponent(ft.shareText.split("{title}").join(product.title).split("{price}").join(fmtXAF(product.price_per_unit_xaf)).split("{unit}").join(product.unit) + " " + shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl text-[#128C7E] font-semibold">
                <MessageCircle className="w-5 h-5" />{t("shareWhatsApp", lang) || "Share on WhatsApp"}
              </a>
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 font-semibold">
                <Copy className="w-5 h-5 text-gray-400" />{copied ? "\u2713 " + ft.copied : (t("copyLink", lang) || "Copy Link")}
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









// BAMBEH_END_TOKEN__FARMFRESHDETAIL_FIX695__COMPLETE

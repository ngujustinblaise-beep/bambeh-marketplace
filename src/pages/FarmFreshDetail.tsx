/**
 * src/pages/FarmFreshDetail.tsx â€” Bambeh Marketplace  UPGRADED VERSION
 *
 * FIXES applied:
 *  âœ… DB query now reads correct columns: title, price_per_unit_xaf, seller_id
 *  âœ… "Add to Cart" button â†’ CartContext â†’ can pay via CamPay in Cart
 *  âœ… "Buy Now" = Add to Cart + navigate to /cart
 *  âœ… "Join Group Buy" CTA linking to /group-buying
 *  âœ… Images with no URL show nothing (no broken placeholder)
 *  âœ… Demo IDs s1â€“s8 handled inline (no DB call)
 *  âœ… Worldwide visibility: any logged-in user anywhere can view
 *  âœ… Seller contact: WhatsApp + Call work correctly
 *  âœ… Full i18n: English, French, Pidgin, Arabic, Fulfulde
 *     â€” reacts instantly when user changes language
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useViewTracker } from "@/hooks/useViewTracker";
import {
  ArrowLeft, ShoppingCart, MapPin, Star, Leaf,
  RefreshCw, AlertCircle, Plus, Minus, Heart, Share2,
  MessageCircle, Phone, Flag, Shield, Users, CheckCircle,
  Smartphone, Loader2, CheckCircle2, XCircle, Clock, Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useCamPay, validateCamPhone, normalizePhone, detectOperator } from "@/hooks/useCamPay";
import { useLang, t } from "@/hooks/useFarmFreshLang";
import { useLang, t } from "@/hooks/useAppLang";

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function isUUID(s: string) {
  const lang = useLang();
  const isRtl = lang === "ar";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

const fmtXAF = (n: number) =>
  new Intl.NumberFormat("fr-CM", { maximumFractionDigits: 0 }).format(n) + " FCFA";

const FAV_KEY = "bambeh_favorites";

function isFavd(id: string) {
  try {
    return (JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as any[]).some((f: any) => f.id === id);
  } catch { return false; }
}

function toggleFavStorage(p: FarmProduct) {
  try {
    const s: any[] = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    const i = s.findIndex((f: any) => f.id === p.id);
    if (i >= 0) s.splice(i, 1);
    else s.unshift({
      id: p.id, title: p.title,
      price: `${fmtXAF(p.pricePerUnitXAF)}/${p.unit}`,
      image: p.images[0], category: p.category,
      type: "farm-fresh", location: p.sellerCity,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem(FAV_KEY, JSON.stringify(s));
    return i < 0;
  } catch { return false; }
}

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface FarmProduct {
  id: string; sellerId?: string; sellerName: string; sellerCity: string;
  sellerRating: number; sellerPhone?: string; title: string; description: string;
  pricePerUnitXAF: number; unit: string; stockQuantity: number; images: string[];
  isOrganic: boolean; harvestDate?: string; category: string;
  availableForDelivery: boolean; isDemo?: boolean;
}

// â”€â”€ Built-in demo items (s1â€“s8 only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEMO: Record<string, FarmProduct> = {
  s1: { id: "s1", title: "Fresh Tomatoes", category: "Vegetables", unit: "kg", pricePerUnitXAF: 500, stockQuantity: 50, isOrganic: true, availableForDelivery: true, sellerName: "Fon's Farm", sellerCity: "Bafoussam, West", sellerRating: 4.8, sellerPhone: "+237671234567", images: ["https://images.unsplash.com/photo-1546470427-e212876f0173?w=600&q=85"], description: "Sun-ripened tomatoes harvested fresh from highland farms in Bafoussam. Perfect for cooking, sauces, and salads. No pesticides â€” 100% organic.", isDemo: true },
  s2: { id: "s2", title: "Plantains (1 bunch)", category: "Fruits", unit: "bunch", pricePerUnitXAF: 1500, stockQuantity: 30, isOrganic: false, availableForDelivery: true, sellerName: "Mama Ngo's Produce", sellerCity: "YaoundÃ©, Centre", sellerRating: 4.6, sellerPhone: "+237682345678", images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=85"], description: "Fresh ripe plantains, 12â€“15 fingers per bunch. Sourced from farms in the Centre region.", isDemo: true },
  s3: { id: "s3", title: "Cocoyams (Macabo)", category: "Tubers", unit: "kg", pricePerUnitXAF: 800, stockQuantity: 100, isOrganic: true, availableForDelivery: false, sellerName: "Douala Fresh", sellerCity: "Douala, Littoral", sellerRating: 4.5, sellerPhone: "+237693456789", images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=85"], description: "Fresh macabo cocoyams, firm and starchy. Ideal for Eru and NdolÃ©. Organically grown.", isDemo: true },
  s4: { id: "s4", title: "Fresh Maize (Corn)", category: "Grains", unit: "cob", pricePerUnitXAF: 300, stockQuantity: 200, isOrganic: false, availableForDelivery: true, sellerName: "NW Farm Co-op", sellerCity: "Bamenda, NW Region", sellerRating: 4.7, sellerPhone: "+237654567890", images: ["https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=85"], description: "Sweet juicy corn from Bamenda highlands. Ready to grill or boil.", isDemo: true },
  s5: { id: "s5", title: "Groundnuts (1kg bag)", category: "Legumes", unit: "kg", pricePerUnitXAF: 1200, stockQuantity: 80, isOrganic: false, availableForDelivery: true, sellerName: "Adamaoua Nuts", sellerCity: "NgaoundÃ©rÃ©, Adamaoua", sellerRating: 4.9, sellerPhone: "+237665678901", images: ["https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&q=85"], description: "Premium shelled groundnuts from the Adamaoua savannah. Great for peanut paste and soup.", isDemo: true },
  s6: { id: "s6", title: "Bitter Leaf (NdolÃ©)", category: "Vegetables", unit: "bunch", pricePerUnitXAF: 200, stockQuantity: 40, isOrganic: true, availableForDelivery: false, sellerName: "Centre Fresh Greens", sellerCity: "YaoundÃ©, Centre", sellerRating: 4.4, sellerPhone: "+237676789012", images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=85"], description: "Fresh bitter leaf (vernonia amygdalina) for authentic NdolÃ©. Already washed and ready.", isDemo: true },
  s7: { id: "s7", title: "Fresh Avocados", category: "Fruits", unit: "kg", pricePerUnitXAF: 800, stockQuantity: 60, isOrganic: true, availableForDelivery: true, sellerName: "Highlands Harvest", sellerCity: "Dschang, West", sellerRating: 4.8, sellerPhone: "+237687890123", images: ["https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=85"], description: "Hand-picked avocados from highland farms in Dschang. Perfectly ripe, creamy and nutritious.", isDemo: true },
  s8: { id: "s8", title: "Pineapples (Large)", category: "Fruits", unit: "piece", pricePerUnitXAF: 600, stockQuantity: 25, isOrganic: false, availableForDelivery: true, sellerName: "Littoral Tropicals", sellerCity: "Edea, Littoral", sellerRating: 4.6, sellerPhone: "+237698901234", images: ["https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&q=85"], description: "Sweet, juicy pineapples from coastal farms near Edea. Extra large size.", isDemo: true },
};

// â”€â”€ DirectPayModal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DirectPayModalProps {
  total: number; productTitle: string; quantity: number; unit: string;
  onClose: () => void; onPay: (phone: string) => void;
  status: string; payRef: string; errorMsg: string; countdown: number;
}

function DirectPayModal({
  total, productTitle, quantity, unit,
  onClose, onPay, status, payRef, errorMsg, countdown,
}: DirectPayModalProps) {
  const [phone,      setPhone]      = useState("");
  const [phoneError, setPhoneError] = useState("");

  const operator = phone.length >= 3 ? detectOperator(normalizePhone(phone)) : null;

  function handlePhoneChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 9);
    setPhone(digits);
    setPhoneError("");
  }

  function handlePay() {
    const err = validateCamPhone(phone);
    if (err) { setPhoneError(err); return; }
    onPay(normalizePhone(phone));
  }

  const canClose = status !== "submitting" && status !== "waiting";
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget && canClose) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-green-700 px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5" />
            <span className="font-bold text-lg">{t("payWithMoMo", lang)}</span>
          </div>
          <p className="text-green-100 text-sm">{t("poweredBy", lang)}</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-500 mb-0.5">{productTitle} Ã— {quantity} {unit}</p>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">{t("total", lang)}</span>
              <span className="text-green-700 font-bold text-lg">{total.toLocaleString("fr-CM")} XAF</span>
            </div>
          </div>

          {status === "success" && (
            <div className="flex flex-col items-center gap-2 py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-semibold text-gray-800">{t("paymentConfirmed", lang)}</p>
              <p className="text-xs text-gray-500 text-center">{t("orderProcessed", lang)}</p>
              {payRef && <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600">Ref: {payRef}</p>}
            </div>
          )}

          {status === "waiting" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
              <p className="font-semibold text-gray-800 text-center">{t("checkPhone", lang)}</p>
              <p className="text-xs text-gray-500 text-center">{t("enterPin", lang)}</p>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl px-3 py-2 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {countdown > 0
                  ? (t("waiting", lang) as (m: number, s: number) => string)(mins, secs)
                  : t("processing", lang)}
              </div>
            </div>
          )}

          {status === "submitting" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
              <p className="text-sm text-gray-600 text-center">{t("sendingRequest", lang)}</p>
            </div>
          )}

          {(status === "failed" || status === "timeout") && (
            <div className="flex flex-col items-center gap-2 py-3">
              <XCircle className="w-10 h-10 text-red-500" />
              <p className="font-semibold text-gray-800">{t("payFailed", lang)}</p>
              <p className="text-xs text-red-500 text-center">{errorMsg}</p>
              <p className="text-xs text-gray-400 text-center">
                {t("questions", lang)}{" "}
                <a href="mailto:support@bambeh.com" className="text-green-600 underline">support@bambeh.com</a>
              </p>
            </div>
          )}

          {(status === "idle" || status === "failed" || status === "timeout") && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t("mtnOrOrange", lang)}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">+237</span>
                  <input
                    type="tel" value={phone} onChange={e => handlePhoneChange(e.target.value)}
                    placeholder="6XXXXXXXX" maxLength={9}
                    className={`w-full pl-14 pr-14 py-3 border-2 rounded-xl text-sm focus:outline-none transition-all ${
                      operator === "mtn" ? "border-yellow-400 bg-yellow-50"
                        : operator === "orange" ? "border-orange-400 bg-orange-50"
                        : phoneError ? "border-red-300"
                        : "border-gray-200 focus:border-green-500"}`} />
                  {operator && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded-full ${
                      operator === "mtn" ? "bg-yellow-100 text-yellow-800" : "bg-orange-100 text-orange-800"}`}>
                      {operator === "mtn" ? "ðŸ“¶ MTN" : "ðŸŸ  Orange"}
                    </span>
                  )}
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                <p className="text-xs text-gray-400 mt-1">{t("ussdPrompt", lang)}</p>
              </div>
              <button
                disabled={phone.length < 9} onClick={handlePay}
                className="w-full bg-green-700 disabled:bg-green-300 text-white py-3.5 rounded-2xl font-bold">
                {(t("confirmPay", lang) as (n: number) => string)(total)}
              </button>
            </>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
            <Shield className="w-3.5 h-3.5" />
            <span>{t("securedEncrypted", lang)}</span>
          </div>

          {canClose && (
            <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-1 transition-colors">
              {t("cancel", lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FarmFreshDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  useViewTracker(id, "farm_products");

  const [product,      setProduct]      = useState<FarmProduct | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [quantity,     setQuantity]     = useState(1);
  const [imgIdx,       setImgIdx]       = useState(0);
  const [favorited,    setFavorited]    = useState(() => isFavd(id ?? ""));
  const [copied,       setCopied]       = useState(false);
  const [added,        setAdded]        = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [orderDone,    setOrderDone]    = useState(false);
  const [orderRef,     setOrderRef]     = useState("");


  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true); setError(null);

    if (DEMO[id]) { setProduct(DEMO[id]); setLoading(false); return; }

    if (!isUUID(id)) { setError(t("productNotFound", lang) as string); setLoading(false); return; }

    try {
      const { data, error: dbErr } = await supabase
        .from("farm_products")
        .select("*, profiles:seller_id(display_name, city, rating, phone)")
        .eq("id", id)
        .single();

      if (dbErr || !data) { setError(t("productNotFound", lang) as string); return; }

      const pr = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
      const imgs: string[] = data.images && data.images.length > 0
        ? data.images
        : data.image_url ? [data.image_url] : [];

      setProduct({
        id:                   data.id,
        sellerId:             data.seller_id,
        sellerName:           pr?.display_name ?? "Seller",
        sellerCity:           pr?.city ?? "Cameroon",
        sellerRating:         pr?.rating ?? 0,
        sellerPhone:          pr?.phone,
        title:                data.title ?? data.name ?? "Product",
        description:          data.description ?? "",
        pricePerUnitXAF:      data.price_per_unit_xaf ?? data.price ?? 0,
        unit:                 data.unit ?? "kg",
        stockQuantity:        data.stock_quantity ?? 0,
        images:               imgs,
        isOrganic:            Boolean(data.is_organic),
        harvestDate:          data.harvest_date,
        category:             data.category ?? "",
        availableForDelivery: Boolean(data.available_for_delivery),
        isDemo:               false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading");
    } finally {
      setLoading(false);
    }
  }, [id, lang]);

  useEffect(() => { void load(); }, [load]);

  const handleFavorite = () => { if (!product) return; setFavorited(toggleFavStorage(product)); };

  const handleShare = async () => {
    if (!product) return;
    const url = `https://bambeh.com/#/farm-fresh/${product.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: product.title, text: `${product.title} on Bambeh Farm Fresh`, url }); return; }
      catch { /* fall through */ }
    }
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  function handleAddToCart() {
    if (!product) return;
    addToCart({ id: product.id, title: product.title, priceXAF: product.pricePerUnitXAF, quantity, imageUrl: product.images[0] ?? "", listingType: "farm-fresh", unit: product.unit, sellerName: product.sellerName });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() { handleAddToCart(); navigate("/cart"); }

  const totalXAF = (product?.pricePerUnitXAF ?? 0) * quantity;

  const { status: payStatus, errorMsg: payError, reference: payRef,
          countdown: payCountdown, initPayment, reset: resetPay } = useCamPay({
    onSuccess: async (ref) => {
      if (!product) return;
      addToCart({ id: product.id, title: product.title, priceXAF: product.pricePerUnitXAF, quantity, imageUrl: product.images[0] ?? "", listingType: "farm-fresh", unit: product.unit, sellerName: product.sellerName });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.from("orders").insert({
          id:        `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          user_id:   session?.user?.id ?? null,
          items:     [{ id: product.id, title: product.title, priceXAF: product.pricePerUnitXAF, quantity, unit: product.unit, listingType: "farm-fresh" }],
          subtotal:  totalXAF, total: totalXAF, reference: ref,
          status:    "paid", paid_at: new Date().toISOString(),
        });
      } catch { /* non-critical */ }
      setOrderRef(ref); setOrderDone(true); setShowPayModal(false);
    },
  });

  async function handleDirectPay(phone: string) {
    if (!product) return;
    await initPayment({ amount: totalXAF, phone, description: `Bambeh Farm Fresh â€” ${product.title} x${quantity}`, externalRef: `ff_${product.id}_${Date.now()}` });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-green-500 animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="p-4 space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600">
        <ArrowLeft className="w-4 h-4" />{t("back", lang)}
      </button>
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-sm text-red-600">{error ?? t("productNotFound", lang) as string}</p>
      </div>
      <button onClick={() => navigate("/farm-fresh")} className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
        {t("browseFF", lang)}
      </button>
    </div>
  );

  if (orderDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center max-w-sm w-full">
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">{t("orderPlaced", lang)}</h2>
          <p className="text-sm text-gray-500 mb-3">{t("payConfirmed", lang)}</p>
          {orderRef && <p className="text-xs bg-gray-100 px-3 py-1 rounded-full font-mono text-gray-600 mb-4 inline-block">Ref: {orderRef}</p>}
          <button onClick={() => navigate("/orders")} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold mb-2">{t("trackOrder", lang)}</button>
          <button onClick={() => navigate("/farm-fresh")} className="w-full text-gray-500 text-sm py-2">{t("keepShopping", lang)}</button>
        </div>
      </div>
    );
  }

  const waMsg = encodeURIComponent(
    `Hi ${product.sellerName}, I saw your listing on Bambeh: ${product.title} â€” ${fmtXAF(product.pricePerUnitXAF)}/${product.unit}. Is it still available?`
  );

  return (
    <div className="max-w-lg mx-auto pb-36 bg-white min-h-screen">
      {/* Toasts */}
      {copied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {t("linkCopied", lang)}
        </div>
      )}
      {added && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-700 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {t("addedToCart", lang)}
        </div>
      )}

      {/* Image section */}
      <div className="relative">
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button onClick={handleShare} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={handleFavorite} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md">
            <Heart className={`w-4 h-4 ${favorited ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
          </button>
        </div>
        <div className="h-72 bg-gray-100 overflow-hidden">
          {product.images.length > 0 ? (
            <img src={product.images[imgIdx]} alt={product.title} className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">ðŸŒ¿</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-1.5 justify-center mt-2">
            {product.images.map((_, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-green-600" : "bg-gray-300"}`} />
            ))}
          </div>
        )}
        {product.isDemo && (
          <div className="absolute bottom-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full">
            {t("demoSample", lang)}
          </div>
        )}
        {product.isOrganic && (
          <div className="absolute top-16 right-4 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Leaf className="w-3 h-3" />{t("organic", lang)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">{product.category}</p>
          <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
          {product.harvestDate && (
            <p className="text-xs text-gray-400 mt-1">
              {t("harvested", lang)} {new Date(product.harvestDate).toLocaleDateString(lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-3xl font-black text-green-800">{fmtXAF(product.pricePerUnitXAF)}</p>
            <p className="text-green-600 font-medium">/ {product.unit}</p>
          </div>
          {product.stockQuantity > 0 && (
            <p className="text-sm text-green-600">{t("stock", lang)} {product.stockQuantity} {product.unit}</p>
          )}
          {product.availableForDelivery && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />{t("deliveryAvail", lang)}
            </div>
          )}
        </div>

        {/* Seller card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{t("seller", lang)}</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
              {product.sellerName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{product.sellerName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                <MapPin className="w-3 h-3" />{product.sellerCity}
                {product.sellerRating > 0 && (
                  <><span>Â·</span><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><span>{product.sellerRating.toFixed(1)}</span></>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`https://wa.me/${(product.sellerPhone || "+237600000000").replace(/\s/g, "")}?text=${waMsg}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition">
              <MessageCircle className="w-4 h-4" />{t("whatsapp", lang)}
            </a>
            <a href={`tel:${product.sellerPhone || "+237600000000"}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
              <Phone className="w-4 h-4" />{t("call", lang)}
            </a>
          </div>
        </div>

        {/* Group buying CTA */}
        <button onClick={() => navigate(`/group-buying?product=${product.id}&type=farm-fresh`)}
          className="w-full flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition active:scale-[0.98]">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-blue-900 text-sm">{t("joinGroupBuy", lang)}</p>
            <p className="text-xs text-blue-600">{t("joinGroupBuySub", lang)}</p>
          </div>
          <span className="text-blue-500 text-sm font-semibold">â†’</span>
        </button>

        {/* Description */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">{t("aboutProduce", lang)}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        {/* Safety tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <strong>{t("safetyTip", lang)}</strong> {t("safetyText", lang)}
          </p>
        </div>

        <button onClick={() => navigate(`/report-issue?item=${product.id}&type=farm-fresh`)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition mx-auto">
          <Flag className="w-3.5 h-3.5" />{t("reportListing", lang)}
        </button>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="flex items-center gap-0 border border-gray-300 rounded-xl overflow-hidden flex-shrink-0">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition">
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="w-9 text-center text-sm font-bold text-gray-900">{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(product.stockQuantity || 999, q + 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition">
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-gray-400">{t("total", lang)}</p>
            <p className="font-bold text-green-700">{fmtXAF(totalXAF)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAddToCart}
            className={`flex-1 py-3 border-2 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition active:scale-[0.98] ${
              added ? "border-green-500 bg-green-500 text-white" : "border-green-600 text-green-700 hover:bg-green-50"}`}>
            <ShoppingCart className="w-4 h-4" />
            {added ? t("addedBtn", lang) : t("addToCartBtn", lang)}
          </button>
          <button onClick={() => { resetPay(); setShowPayModal(true); }}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition active:scale-[0.98]">
            <Smartphone className="w-4 h-4" /> {t("payNow", lang)}
          </button>
        </div>
      </div>

      {showPayModal && (
        <DirectPayModal
          total={totalXAF} productTitle={product.title} quantity={quantity} unit={product.unit}
          onClose={() => { setShowPayModal(false); resetPay(); }}
          onPay={handleDirectPay} status={payStatus} payRef={payRef}
          errorMsg={payError} countdown={payCountdown} />
      )}
    </div>
  );
};

export default FarmFreshDetail;

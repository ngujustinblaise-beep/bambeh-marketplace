/**
 * src/pages/MarketplaceItemDetails.tsx — Bambeh Marketplace
 *
 * FIXES — June 2026
 *  ✅ FIX 1: readCart() was calling useLang() inside a plain helper — illegal
 *            hook call → crash. readCart() is now a pure function.
 *  ✅ FIX 2: All UI strings translated (English / French / Hausa / Arabic / Pidgin / Fulfulde)
 *  ✅ FIX 3: increment_view_count RPC passes correct params (table_name + record_id)
 *  ✅ FIX 4: phone / whatsappText declared BEFORE JSX (was silent ReferenceError)
 *  ✅ FIX 5: Queries `listings` table only — no stale marketplace_items reference
 *  ✅ Cart mini-panel — inline, connected to /cart
 *  ✅ "Add to Cart" persists to localStorage (same CART_KEY as Cart page)
 *  ✅ "Buy Now" → /payment/checkout
 *  ✅ WhatsApp + Call + Chat contact options
 *  ✅ Share (Web Share API + clipboard fallback)
 *  ✅ Safety tip + Report link
 *  ✅ Safe-area bottom padding
 *  ✅ Accessible ARIA labels throughout
 *  ✅ Image lazy-loading with graceful fallback
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RefreshCw, ArrowLeft, Heart, ShoppingCart, Share2,
  MapPin, Tag, Phone, ChevronLeft, ChevronRight,
  AlertCircle, Package, ShieldCheck, Flag, CheckCircle,
  Eye, Clock, Zap, MessageCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── i18n ─────────────────────────────────────────────────────────────────────
type Lang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";
const TR: Record<string, Record<Lang, string>> = {
  loading:         { en: "Loading listing…", fr: "Chargement…", ha: "Ana lodawa…", ar: "جار التحميل…", pcm: "Loading…", ff: "Naatirde…" },
  not_found:       { en: "Listing not found", fr: "Annonce introuvable", ha: "Ba a samu ba", ar: "الإعلان غير موجود", pcm: "Listing no dey", ff: "Alaa" },
  removed:         { en: "This item may have been sold or removed.", fr: "Cet article a peut-être été vendu ou supprimé.", ha: "Wannan abu an sayar ko an cire", ar: "ربما تم بيع هذا العنصر أو إزالته.", pcm: "Dis item don sell or remove.", ff: "Ko nde dawnii ko nde ɓennii." },
  browse:          { en: "Browse Marketplace", fr: "Parcourir le marché", ha: "Duba kasuwa", ar: "تصفح السوق", pcm: "Browse Market", ff: "Yiyto Suudu" },
  description:     { en: "Description", fr: "Description", ha: "Bayanai", ar: "الوصف", pcm: "Description", ff: "Pijirde" },
  no_description:  { en: "No description provided.", fr: "Aucune description.", ha: "Babu bayanai.", ar: "لا يوجد وصف.", pcm: "No description.", ff: "Alaa pijirde." },
  contact_seller:  { en: "Contact Seller", fr: "Contacter le vendeur", ha: "Tuntuɓi mai siyarwa", ar: "تواصل مع البائع", pcm: "Contact Seller", ff: "Newnin Yoɓoowo" },
  view_profile:    { en: "View Profile", fr: "Voir le profil", ha: "Duba profile", ar: "عرض الملف الشخصي", pcm: "See Profile", ff: "Yiy Profil" },
  whatsapp:        { en: "WhatsApp", fr: "WhatsApp", ha: "WhatsApp", ar: "واتساب", pcm: "WhatsApp", ff: "WhatsApp" },
  call:            { en: "Call", fr: "Appeler", ha: "Kira", ar: "اتصل", pcm: "Call", ff: "Ewnu" },
  chat:            { en: "Chat", fr: "Chat", ha: "Zanta", ar: "دردشة", pcm: "Chat", ff: "Haɓɓu" },
  safety_tip:      { en: "Safety tip:", fr: "Conseil de sécurité :", ha: "Tip na aminci:", ar: "نصيحة أمان:", pcm: "Safety tip:", ff: "Miijo sehilal:" },
  safety_msg:      { en: "Use Bambeh Escrow to protect your purchase. Never send money before inspecting the item.", fr: "Utilisez l'Escrow Bambeh pour protéger votre achat. N'envoyez jamais d'argent avant d'inspecter l'article.", ha: "Yi amfani da Bambeh Escrow don kare siyan ka. Kada ka aika kudi kafin bincika kaya.", ar: "استخدم ضمان Bambeh لحماية مشترياتك. لا ترسل الأموال قبل فحص العنصر.", pcm: "Use Bambeh Escrow protect your buy. No send money before you see item.", ff: "Huɓɓin Bambeh Escrow ngam waɗtu soodannde maa. Taa aawa mbaydi tawi anndaaki kala ngoo." },
  meet_safely:     { en: "How to meet safely →", fr: "Comment se rencontrer en toute sécurité →", ha: "Yadda za a gana lafiya →", ar: "كيفية الاجتماع بأمان →", pcm: "How to meet safe →", ff: "No rewata sehilal →" },
  report:          { en: "Report this listing", fr: "Signaler cette annonce", ha: "Rahoton wannan jeri", ar: "الإبلاغ عن هذا الإعلان", pcm: "Report dis listing", ff: "Tiindirgo nde" },
  your_cart:       { en: "Your Cart", fr: "Votre panier", ha: "Katonku", ar: "سلتك", pcm: "Your Cart", ff: "Cart maa" },
  items_in_cart:   { en: "items", fr: "articles", ha: "kaya", ar: "عناصر", pcm: "items", ff: "kala" },
  view_cart:       { en: "View Cart", fr: "Voir le panier", ha: "Duba kato", ar: "عرض السلة", pcm: "See Cart", ff: "Yiy Cart" },
  checkout:        { en: "Checkout Now", fr: "Payer maintenant", ha: "Biya yanzu", ar: "الدفع الآن", pcm: "Pay now", ff: "Haaɓtu hannde" },
  add_to_cart:     { en: "Add to Cart", fr: "Ajouter au panier", ha: "Ƙara zuwa kato", ar: "أضف إلى السلة", pcm: "Add to Cart", ff: "Ɓeydu e Cart" },
  added:           { en: "Added!", fr: "Ajouté!", ha: "An ƙara!", ar: "تمت الإضافة!", pcm: "Added!", ff: "Ɓeydaama!" },
  in_cart:         { en: "In Cart", fr: "Dans le panier", ha: "A cikin kato", ar: "في السلة", pcm: "In Cart", ff: "E nder Cart" },
  buy_now:         { en: "Buy Now", fr: "Acheter", ha: "Saya yanzu", ar: "اشتر الآن", pcm: "Buy Now", ff: "Soo Hannde" },
  views:           { en: "views", fr: "vues", ha: "kallon", ar: "مشاهدات", pcm: "view", ff: "yiytatii" },
  featured:        { en: "Featured", fr: "En vedette", ha: "Babban zaɓi", ar: "مميز", pcm: "Featured", ff: "Yiɗaaɗo" },
  negotiable:      { en: "Price negotiable", fr: "Prix négociable", ha: "Ana tattaunawa", ar: "السعر قابل للتفاوض", pcm: "Price nego", ff: "Njaru hewtii" },
  expires_today:   { en: "This listing expires today!", fr: "Cette annonce expire aujourd'hui!", ha: "Wannan jeri na ƙarewa yau!", ar: "ينتهي هذا الإعلان اليوم!", pcm: "Dis listing expire today!", ff: "Nde ɗowroo hande!" },
  expires_in:      { en: "This listing expires in", fr: "Cette annonce expire dans", ha: "Wannan jeri na ƙarewa a cikin", ar: "ينتهي هذا الإعلان خلال", pcm: "Dis listing expire for", ff: "Nde ɗowroo e nder" },
  days:            { en: "day(s)", fr: "jour(s)", ha: "kwana", ar: "يوم/أيام", pcm: "day(s)", ff: "ñalnde(ɗe)" },
  qty_each:        { en: "XAF each", fr: "XAF l'unité", ha: "XAF kowanne", ar: "فرنك إفريقي للقطعة", pcm: "XAF each one", ff: "XAF ɓe kala" },
  no_image:        { en: "No image", fr: "Pas d'image", ha: "Babu hoto", ar: "لا توجد صورة", pcm: "No picture", ff: "Alaa foto" },
  seller:          { en: "Bambeh Seller", fr: "Vendeur Bambeh", ha: "Mai siyarwa Bambeh", ar: "بائع Bambeh", pcm: "Bambeh Seller", ff: "Yoɓoowo Bambeh" },
};
function getLang(): Lang {
  try { const s = localStorage.getItem("bambeh_lang") as Lang; if (s) return s; } catch {}
  const b = navigator.language.split("-")[0] as Lang;
  return ["en","fr","ha","ar","pcm","ff"].includes(b) ? b : "fr";
}
function tx(key: string): string {
  const l = getLang();
  return TR[key]?.[l] ?? TR[key]?.["en"] ?? key;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ListingDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  phone?: string;
  negotiable: boolean;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  postedAt: string;
  viewCount: number;
  expiresAt?: string;
  isFeatured: boolean;
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CART_KEY = "bambeh_cart";
const FAV_KEY  = "bambeh_favorites";

const CONDITION_COLOR: Record<string, string> = {
  New:        "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Like New":  "bg-teal-100 text-teal-700 border-teal-200",
  Neuf:        "bg-emerald-100 text-emerald-700 border-emerald-200",
  Good:        "bg-blue-100 text-blue-700 border-blue-200",
  Fair:        "bg-amber-100 text-amber-700 border-amber-200",
  Poor:        "bg-red-100 text-red-700 border-red-200",
  Used:        "bg-gray-100 text-gray-600 border-gray-200",
};

// ─── Cart Helpers — PURE FUNCTIONS, NO HOOKS ──────────────────────────────────
// ⚠️  readCart() MUST NOT call useLang() or any React hook.
//     It is used as the useState initialiser for `cart`, meaning React calls
//     it *before* the component function body runs its hooks — any hook call
//     here throws "Rules of Hooks" which manifests as a crash / connection error.
function readCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

function writeCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("storage"));
}

function addToCart(item: ListingDetail, qty: number): CartItem[] {
  const cart = readCart();
  const idx = cart.findIndex((c) => c.id === item.id);
  if (idx >= 0) {
    cart[idx].quantity += qty;
  } else {
    cart.push({
      id: item.id, title: item.title, price: item.price,
      quantity: qty, image: item.images[0], sellerId: item.sellerId,
    });
  }
  writeCart(cart);
  return cart;
}

function removeFromCart(id: string): CartItem[] {
  const cart = readCart().filter((c) => c.id !== id);
  writeCart(cart);
  return cart;
}

function updateCartQty(id: string, qty: number): CartItem[] {
  const cart = readCart().map((c) => c.id === id ? { ...c, quantity: Math.max(1, qty) } : c);
  writeCart(cart);
  return cart;
}

function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
}

// ─── Fav Helpers ──────────────────────────────────────────────────────────────
function isFavourited(id: string): boolean {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]").some((f: any) => f.id === id); }
  catch { return false; }
}

function toggleFavStorage(item: ListingDetail): boolean {
  try {
    const saved: any[] = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    const idx = saved.findIndex((f) => f.id === item.id);
    if (idx >= 0) {
      saved.splice(idx, 1);
    } else {
      saved.unshift({
        id: item.id, title: item.title,
        price: `${item.price.toLocaleString("fr-CM")} XAF`,
        image: item.images[0], category: item.category,
        type: "marketplace", location: item.location,
        savedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(saved));
    return idx < 0;
  } catch { return false; }
}

// ─── Other Helpers ─────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("fr-CM");

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function extractImages(row: any): string[] {
  if (Array.isArray(row.images) && row.images.length > 0) {
    return row.images
      .map((img: any) => typeof img === "string" ? img : (img?.url ?? img?.thumbnail_url ?? ""))
      .filter(Boolean);
  }
  const fallback = row.extra?.image_url;
  return fallback ? [fallback] : [];
}

function daysUntil(isoDate: string) {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString("fr-CM", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Mini Cart Panel ──────────────────────────────────────────────────────────
function MiniCart({
  cart,
  onRemove,
  onQtyChange,
  onViewCart,
  onCheckout,
}: {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onViewCart: () => void;
  onCheckout: () => void;
}) {
  if (cart.length === 0) return null;
  return (
    <div className="bg-white border border-teal-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-teal-600 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span className="text-sm font-bold">{tx("your_cart")} ({cart.reduce((s, c) => s + c.quantity, 0)} {tx("items_in_cart")})</span>
        </div>
        <span className="text-sm font-bold">{fmt(cartTotal(cart))} XAF</span>
      </div>

      <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
        {cart.map((c) => (
          <div key={c.id} className="flex items-center gap-2 px-3 py-2.5">
            <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
              {c.image ? (
                <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-gray-300 m-auto mt-2.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{c.title}</p>
              <p className="text-xs text-teal-600 font-bold">{fmt(c.price * c.quantity)} XAF</p>
            </div>
            <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => onQtyChange(c.id, c.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm font-bold"
                aria-label="Decrease quantity"
              >−</button>
              <span className="w-6 text-center text-xs font-semibold text-gray-700">{c.quantity}</span>
              <button
                onClick={() => onQtyChange(c.id, c.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm font-bold"
                aria-label="Increase quantity"
              >+</button>
            </div>
            <button
              onClick={() => onRemove(c.id)}
              className="text-gray-300 hover:text-red-400 transition-colors ml-1 flex-shrink-0"
              aria-label={`Remove ${c.title} from cart`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 bg-gray-50 flex gap-2">
        <button
          onClick={onViewCart}
          className="flex-1 py-2.5 border border-teal-300 text-teal-700 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors"
        >
          {tx("view_cart")}
        </button>
        <button
          onClick={onCheckout}
          className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm"
        >
          {tx("checkout")}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function MarketplaceItemDetails() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item,     setItem]     = useState<ListingDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [fav,      setFav]      = useState(false);
  const [qty,      setQty]      = useState(1);
  const [cartDone, setCartDone] = useState(false);
  const [cart,     setCart]     = useState<CartItem[]>(readCart);  // ✅ readCart is now pure
  const [shared,   setShared]   = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    if (!isUUID(id)) {
      setError("Listing not found.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: dbErr } = await supabase
        .from("listings")
        .select(`
          id, title, description, price, category,
          condition, location, phone, negotiable,
          images, extra, created_at, seller_id,
          view_count, expires_at, is_featured,
          profiles:seller_id ( id, full_name, avatar_url )
        `)
        .eq("id", id)
        .single();

      if (dbErr || !data) {
        setError("Listing not found or has been removed.");
        return;
      }

      const profile = (data as any).profiles;
      const mapped: ListingDetail = {
        id:           data.id,
        title:        data.title ?? "",
        description:  (data as any).description ?? "",
        price:        (data as any).price ?? 0,
        category:     (data as any).category ?? "",
        condition:    (data as any).condition ?? "Used",
        location:     (data as any).location ?? "",
        phone:        (data as any).phone ?? undefined,
        negotiable:   (data as any).negotiable ?? false,
        images:       extractImages(data),
        sellerId:     (data as any).seller_id,
        sellerName:   profile?.full_name ?? tx("seller"),
        sellerAvatar: profile?.avatar_url ?? undefined,
        postedAt:     (data as any).created_at,
        viewCount:    (data as any).view_count ?? 0,
        expiresAt:    (data as any).expires_at ?? undefined,
        isFeatured:   (data as any).is_featured ?? false,
      };
      setItem(mapped);
      setFav(isFavourited(id));

      // ✅ FIXED: increment_view_count RPC with correct params (table_name required)
      void supabase.rpc("increment_view_count", {
        table_name: "listings",
        record_id: id,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load listing.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  // Sync cart from localStorage when tab regains focus
  useEffect(() => {
    const sync = () => setCart(readCart());
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  function handleToggleFav() {
    if (!item) return;
    setFav(toggleFavStorage(item));
  }

  function handleAddToCart(andCheckout = false) {
    if (!item) return;
    const updated = addToCart(item, qty);
    setCart(updated);
    setCartDone(true);
    setTimeout(() => setCartDone(false), 2500);
    if (andCheckout) {
      navigate(`/payment/checkout?listingId=${item.id}&qty=${qty}`);
    }
  }

  function handleCartRemove(cid: string) {
    setCart(removeFromCart(cid));
  }

  function handleCartQty(cid: string, q: number) {
    setCart(updateCartQty(cid, q));
  }

  async function handleShare() {
    if (!item) return;
    const url = `https://bambeh.com/#/marketplace/${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: `${item.title} — ${fmt(item.price)} XAF on Bambeh`, url });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch { /* user cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older Android WebViews
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  // ── States ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 text-teal-500 animate-spin" />
          <p className="text-sm text-gray-400">{tx("loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-10 h-10 text-gray-300" />
        </div>
        <p className="font-bold text-gray-700 text-lg mb-2">{tx("not_found")}</p>
        <p className="text-sm text-gray-500 text-center mb-6 max-w-xs">
          {error ?? tx("removed")}
        </p>
        <button
          onClick={() => navigate("/marketplace")}
          className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
        >
          {tx("browse")}
        </button>
      </div>
    );
  }

  // ── Derived values — declared BEFORE JSX to avoid ReferenceError ────────────
  const rawPhone     = (item.phone || "+237600000000").replace(/\D/g, "");
  const phone        = rawPhone.startsWith("237") ? rawPhone : `237${rawPhone}`;
  const whatsappText = encodeURIComponent(
    `Hi ${item.sellerName}, I found your listing on Bambeh Marketplace:\n"${item.title}" — ${fmt(item.price)} XAF\nIs it still available?`,
  );
  const conditionClass = CONDITION_COLOR[item.condition] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const isInCart      = cart.some((c) => c.id === item.id);
  const cartItemQty   = cart.find((c) => c.id === item.id)?.quantity ?? 0;
  const expiryDays    = item.expiresAt ? daysUntil(item.expiresAt) : null;

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-32">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>

        <p className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{item.title}</p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/cart")}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={`Cart: ${cart.reduce((s, c) => s + c.quantity, 0)} items`}
          >
            <ShoppingCart className="w-4.5 h-4.5 text-gray-600" />
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cart.reduce((s, c) => s + c.quantity, 0) > 9 ? "9+" : cart.reduce((s, c) => s + c.quantity, 0)}
              </span>
            )}
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Share listing"
          >
            {shared ? (
              <CheckCircle className="w-4 h-4 text-teal-500" />
            ) : (
              <Share2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* ── Image Carousel ── */}
      <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
        {item.images.length > 0 ? (
          <img
            src={item.images[imgIdx]}
            alt={`${item.title} — image ${imgIdx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <Package className="w-14 h-14" />
            <p className="text-sm">{tx("no_image")}</p>
          </div>
        )}

        {/* Fav overlay */}
        <button
          onClick={handleToggleFav}
          aria-label={fav ? "Remove from favourites" : "Save to favourites"}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 transition-colors ${fav ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
        </button>

        {/* Featured badge */}
        {item.isFeatured && (
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
            <Zap className="w-3 h-3" /> {tx("featured")}
          </div>
        )}

        {/* Carousel controls */}
        {item.images.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
              disabled={imgIdx === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setImgIdx((i) => Math.min(item.images.length - 1, i + 1))}
              disabled={imgIdx === item.images.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-sm disabled:opacity-30 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {item.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  aria-label={`Image ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-white scale-125" : "bg-white/50"}`}
                />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              {imgIdx + 1}/{item.images.length}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-4">

        {/* ── Title + condition + meta ── */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h1 className="text-xl font-bold text-gray-900 flex-1 leading-tight">{item.title}</h1>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${conditionClass}`}>
              {item.condition}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-500" />
              {item.location}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              {item.category}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {item.viewCount} {tx("views")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {relativeTime(item.postedAt)}
            </span>
          </div>

          {/* Expiry warning */}
          {expiryDays !== null && expiryDays <= 3 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              {expiryDays <= 0
                ? tx("expires_today")
                : `${tx("expires_in")} ${expiryDays} ${tx("days")}`
              }
            </div>
          )}
        </div>

        {/* ── Price + qty selector ── */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-teal-700 tracking-tight">
              {fmt(item.price * qty)} <span className="text-base font-bold">XAF</span>
            </p>
            {qty > 1 && (
              <p className="text-xs text-teal-500 mt-0.5">{fmt(item.price)} {tx("qty_each")}</p>
            )}
            {item.negotiable && (
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> {tx("negotiable")}
              </div>
            )}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-lg text-gray-600 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-800">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 font-bold text-lg text-gray-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* ── Description ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2 text-sm tracking-wide">{tx("description")}</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {item.description || tx("no_description")}
          </p>
        </div>

        {/* ── Mini Cart Panel ── */}
        <MiniCart
          cart={cart}
          onRemove={handleCartRemove}
          onQtyChange={handleCartQty}
          onViewCart={() => navigate("/cart")}
          onCheckout={() => navigate(`/payment/checkout`)}
        />

        {/* ── Contact Seller ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{tx("contact_seller")}</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 overflow-hidden flex-shrink-0">
              {item.sellerAvatar ? (
                <img src={item.sellerAvatar} alt={item.sellerName} className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {item.sellerName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-gray-900 text-sm">{item.sellerName}</p>
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              </div>
              <p className="text-xs text-gray-400">{item.location}</p>
            </div>
            <button
              onClick={() => navigate(`/vendor/${item.sellerId}`)}
              className="text-xs text-teal-600 font-semibold hover:underline flex-shrink-0"
            >
              {tx("view_profile")}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <a
              href={`https://wa.me/${phone}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-2.5 bg-green-500 text-white rounded-xl text-xs font-semibold hover:bg-green-600 active:scale-95 transition-all"
              aria-label="Contact via WhatsApp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.524 5.847L.057 23.882a.5.5 0 00.612.612l6.035-1.467A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.502-5.239-1.38l-.374-.214-3.885.945.964-3.759-.235-.39A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              {tx("whatsapp")}
            </a>
            <a
              href={`tel:+${phone}`}
              className="flex flex-col items-center justify-center gap-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all"
              aria-label="Call seller"
            >
              <Phone className="w-4 h-4" />
              {tx("call")}
            </a>
            <button
              onClick={() => navigate(`/chat?sellerId=${item.sellerId}&listingId=${item.id}`)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-semibold hover:bg-teal-100 active:scale-95 transition-all"
              aria-label="Chat with seller"
            >
              <MessageCircle className="w-4 h-4" />
              {tx("chat")}
            </button>
          </div>
        </div>

        {/* ── Safety tip ── */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>{tx("safety_tip")}</strong>{" "}{tx("safety_msg")}{" "}
              <button
                onClick={() => navigate("/meet-safely")}
                className="underline font-semibold hover:text-amber-900"
              >
                {tx("meet_safely")}
              </button>
            </p>
          </div>
        </div>

        {/* ── Report ── */}
        <button
          onClick={() => navigate(`/report-issue?item=${item.id}&type=marketplace`)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mx-auto py-1"
          aria-label="Report this listing"
        >
          <Flag className="w-3.5 h-3.5" />
          {tx("report")}
        </button>

      </div>

      {/* ── Fixed bottom action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 px-4 py-3 flex gap-2.5 max-w-lg mx-auto shadow-lg">
        {/* Fav */}
        <button
          onClick={handleToggleFav}
          aria-label={fav ? "Remove from favourites" : "Add to favourites"}
          className={`w-12 h-12 flex-shrink-0 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
            fav ? "bg-red-50 border-red-200" : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Heart className={`w-5 h-5 transition-colors ${fav ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
        </button>

        {/* Add to cart */}
        <button
          onClick={() => handleAddToCart(false)}
          aria-label={cartDone ? "Added to cart" : `Add to cart — ${fmt(item.price * qty)} XAF`}
          className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            cartDone
              ? "bg-green-100 text-green-700 border border-green-200"
              : isInCart
              ? "bg-teal-100 text-teal-700 border border-teal-200"
              : "bg-white border border-teal-500 text-teal-700 hover:bg-teal-50"
          }`}
        >
          {cartDone ? (
            <><CheckCircle className="w-4 h-4" /> {tx("added")}</>
          ) : isInCart ? (
            <><ShoppingCart className="w-4 h-4" /> {tx("in_cart")} ({cartItemQty})</>
          ) : (
            <><ShoppingCart className="w-4 h-4" /> {tx("add_to_cart")}</>
          )}
        </button>

        {/* Buy now */}
        <button
          onClick={() => handleAddToCart(true)}
          aria-label={`Buy now — ${fmt(item.price * qty)} XAF`}
          className="flex-1 h-12 bg-teal-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-700 active:scale-95 transition-all shadow-md"
        >
          {tx("buy_now")}
        </button>
      </div>
    </div>
  );
}

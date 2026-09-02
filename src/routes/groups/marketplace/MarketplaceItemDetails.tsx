// BAMBEH_DEPLOY_TOKEN__MARKETPLACEITEMDETAILS_FIX345_CLEAN
// BAMBEH_DEPLOY_TOKEN__MARKETPLACEITEMDETAILS_FIX336_CLEAN
// BAMBEH_DEPLOY_TOKEN__MARKETPLACEITEMDETAILS_FIX82_CLEAN
/**
 * src/pages/MarketplaceItemDetails.tsx — Bambeh Marketplace
 *
 * FIXES — June 2026
 *  ✅ FIX 1: readCart() is a pure function — no illegal hook call
 *  ✅ FIX 2: Full i18n — English / French / Hausa / Arabic / Pidgin / Fulfulde
 *  ✅ FIX 3: Language switches INSTANTLY via "langChange" event (useLangState hook)
 *  ✅ FIX 4: increment_view_count RPC passes correct params (table_name + record_id)
 *  ✅ FIX 5: phone / whatsappText declared BEFORE JSX
 *  ✅ FIX 6: Queries `listings` table only
 *  ✅ FIX 7: Voice control aria-labels on all interactive elements
 *  ✅ Cart mini-panel — inline, connected to /cart
 *  ✅ "Add to Cart" persists to localStorage
 *  ✅ "Buy Now" → /payment/checkout with CamPay data
 *  ✅ WhatsApp + Call + Chat contact options
 *  ✅ Share (Web Share API + clipboard fallback)
 *  ✅ Safety tip + Report link
 *  ✅ Safe-area bottom padding
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useCallback } from "react";
import { usePlanLimits } from "@/hooks/usePlanLimits";

/* FIX431 - the location split, in all five languages.
 * "Yaounde, Bastos"  ->  free sees "Yaounde", premium sees the whole thing.
 * A location with no comma is already just a city, so it shows unchanged. */
const LOC_T: Record<string, Record<string, string>> = {
  en: { unlock: "See exact location", hint: "Premium members see the neighbourhood and meeting point" },
  fr: { unlock: "Voir le lieu exact", hint: "Les membres premium voient le quartier et le point de rencontre" },
  pidgin: { unlock: "See the exact place", hint: "Premium member dey see the quarter and where una go meet" },
  ar: { unlock: "\u0639\u0631\u0636 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u062f\u0642\u064a\u0642", hint: "\u064a\u0631\u0649 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u0645\u0645\u064a\u0632\u0648\u0646 \u0627\u0644\u062d\u064a \u0648\u0646\u0642\u0637\u0629 \u0627\u0644\u0644\u0642\u0627\u0621" },
  ff: { unlock: "Yiy nokku laa\u0253\u0257o", hint: "Ter\u0253e premium ina njiya leydi e nokku fottirde" },
};

/** Everything before the first comma. Trimmed, and safe on null. */
function cityOnly(full: string | null | undefined): string {
  const s = String(full ?? "").trim();
  if (!s) return "";
  const i = s.indexOf(",");
  return i > 0 ? s.slice(0, i).trim() : s;
}
import { useParams, useNavigate } from "react-router-dom";
import {
  RefreshCw, ArrowLeft, Heart, ShoppingCart, Share2,
  MapPin, Tag, Phone, ChevronLeft, ChevronRight,
  AlertCircle, Package, ShieldCheck, Flag, CheckCircle,
  Eye, Clock, Zap, MessageCircle, Star, Lock, Boxes,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";           // FIX345
import { useSubscription } from "@/hooks/useSubscription";  // FIX345
import SellerReviews from "@/components/reviews/SellerReviews";  // FIX341

// ─── i18n ─────────────────────────────────────────────────────────────────────
type Lang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";

const TR: Record<string, Record<Lang, string>> = {
  loading:         { en: "Loading listing…",        fr: "Chargement…",                ha: "Ana lodawa…",            ar: "جار التحميل…",                pcm: "Loading…",               ff: "Naatirde…" },
  not_found:       { en: "Listing not found",       fr: "Annonce introuvable",        ha: "Ba a samu ba",           ar: "الإعلان غير موجود",            pcm: "Listing no dey",          ff: "Alaa" },
  expired_title:   { en: "This listing has expired",  fr: "Cette annonce a expiré",   ha: "Wannan talla ta ƙare",   ar: "انتهت صلاحية هذا الإعلان",  pcm: "Dis listing don expire",  ff: "Jeeyngal ngal timmii" },  // FIX336
  expired_msg:     { en: "The seller's posting period is over. Ask them to renew it, or browse other listings.", fr: "La période de publication du vendeur est terminée. Demandez-lui de la renouveler ou parcourez d'autres annonces.", ha: "Lokacin tallar mai siyarwa ya ƙare. Ka nemi ya sabunta ta, ko ka duba wasu tallace-tallace.", ar: "انتهت فترة نشر البائع. اطلب منه تجديدها أو تصفح إعلانات أخرى.", pcm: "Di seller time don finish. Tell am make e renew am, or check other listings.", ff: "Sahaa jeeyngal yoɓoowo timmii. Naamno mo yo o hesɗitin ngal, walla ndaaru goɗɗe." },  // FIX336
  removed:         { en: "This item may have been sold or removed.", fr: "Cet article a peut-être été vendu ou supprimé.", ha: "An sayar ko an cire.", ar: "ربما تم بيع العنصر أو إزالته.", pcm: "Dis item don sell or remove.", ff: "Ko nde dawnii ko nde ɓennii." },
  browse:          { en: "Browse Marketplace",      fr: "Parcourir le marché",        ha: "Duba kasuwa",            ar: "تصفح السوق",                   pcm: "Browse Market",           ff: "Yiyto Suudu" },
  description:     { en: "Description",             fr: "Description",                ha: "Bayanai",                ar: "الوصف",                        pcm: "Description",             ff: "Pijirde" },
  no_description:  { en: "No description provided.", fr: "Aucune description.",       ha: "Babu bayanai.",          ar: "لا يوجد وصف.",                 pcm: "No description.",         ff: "Alaa pijirde." },
  contact_seller:  { en: "Contact Seller",          fr: "Contacter le vendeur",       ha: "Tuntuɓi mai siyarwa",   ar: "تواصل مع البائع",              pcm: "Contact Seller",          ff: "Newnin Yoɓoowo" },
  view_profile:    { en: "Rate Seller",             fr: "Noter le vendeur",         ha: "Kimanta mai siyarwa",   ar: "\u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0628\u0627\u0626\u0639", pcm: "Rate the Seller",       ff: "Hokku njeeygu" },  // FIX325
  rating_none:     { en: "No ratings yet",            fr: "Pas encore de note",       ha: "Babu kima tukuna",      ar: "\u0644\u0627 \u062a\u0648\u062c\u062f \u062a\u0642\u064a\u064a\u0645\u0627\u062a \u0628\u0639\u062f", pcm: "No rating yet",         ff: "Njeeygu alaa tawo" },  // FIX326
  rating_more:     { en: "See what buyers said",      fr: "Voir les avis des acheteurs", ha: "Duba ra'ayin masu saye", ar: "\u0627\u0642\u0631\u0623 \u0622\u0631\u0627\u0621 \u0627\u0644\u0645\u0634\u062a\u0631\u064a\u0646", pcm: "See wetin buyers talk",  ff: "Ndaaru haala soodoo\u0253e" },  // FIX326
  whatsapp:        { en: "WhatsApp",                fr: "WhatsApp",                   ha: "WhatsApp",               ar: "واتساب",                       pcm: "WhatsApp",                ff: "WhatsApp" },
  call:            { en: "Call",                    fr: "Appeler",                    ha: "Kira",                   ar: "اتصل",                         pcm: "Call",                    ff: "Ewnu" },
  chat:            { en: "Chat",                    fr: "Chat",                       ha: "Zanta",                  ar: "دردشة",                        pcm: "Chat",                    ff: "Haɓɓu" },
  safety_tip:      { en: "Safety tip:",             fr: "Conseil de sécurité :",      ha: "Tip na aminci:",         ar: "نصيحة أمان:",                  pcm: "Safety tip:",             ff: "Miijo sehilal:" },
  safety_msg:      { en: "Use Bambeh Escrow to protect your purchase. Never send money before inspecting the item.", fr: "Utilisez l'Escrow Bambeh pour protéger votre achat. N'envoyez jamais d'argent avant d'inspecter l'article.", ha: "Yi amfani da Bambeh Escrow. Kada ka aika kudi kafin bincika kaya.", ar: "استخدم ضمان Bambeh. لا ترسل المال قبل الفحص.", pcm: "Use Bambeh Escrow protect your buy. No send money before you see item.", ff: "Huɓɓin Bambeh Escrow. Taa aawa mbaydi tawi anndaaki kala ngoo." },
  meet_safely:     { en: "How to meet safely →",   fr: "Comment se rencontrer en sécurité →", ha: "Yadda za a gana lafiya →", ar: "كيفية الاجتماع بأمان →",  pcm: "How to meet safe →",      ff: "No rewata sehilal →" },
  report:          { en: "Report this listing",     fr: "Signaler cette annonce",     ha: "Rahoton wannan jeri",    ar: "الإبلاغ عن هذا الإعلان",       pcm: "Report dis listing",      ff: "Tiindirgo nde" },
  your_cart:       { en: "Your Cart",               fr: "Votre panier",               ha: "Katonku",                ar: "سلتك",                         pcm: "Your Cart",               ff: "Cart maa" },
  items_in_cart:   { en: "items",                   fr: "articles",                   ha: "kaya",                   ar: "عناصر",                        pcm: "items",                   ff: "kala" },
  view_cart:       { en: "View Cart",               fr: "Voir le panier",             ha: "Duba kato",              ar: "عرض السلة",                    pcm: "See Cart",                ff: "Yiy Cart" },
  checkout:        { en: "Checkout Now",            fr: "Payer maintenant",           ha: "Biya yanzu",             ar: "الدفع الآن",                   pcm: "Pay now",                 ff: "Haaɓtu hannde" },
  add_to_cart:     { en: "Add to Cart",             fr: "Ajouter au panier",          ha: "Ƙara zuwa kato",         ar: "أضف إلى السلة",                pcm: "Add to Cart",             ff: "Ɓeydu e Cart" },
  added:           { en: "Added!",                  fr: "Ajouté!",                    ha: "An ƙara!",               ar: "تمت الإضافة!",                 pcm: "Added!",                  ff: "Ɓeydaama!" },
  in_cart:         { en: "In Cart",                 fr: "Dans le panier",             ha: "A cikin kato",           ar: "في السلة",                     pcm: "In Cart",                 ff: "E nder Cart" },
  buy_now:         { en: "Buy Now",                 fr: "Acheter",                    ha: "Saya yanzu",             ar: "اشتر الآن",                    pcm: "Buy Now",                 ff: "Soo Hannde" },
  views:           { en: "views",                   fr: "vues",                       ha: "kallon",                 ar: "مشاهدات",                      pcm: "view",                    ff: "yiytatii" },
  featured:        { en: "Featured",                fr: "En vedette",                 ha: "Babban zaɓi",            ar: "مميز",                         pcm: "Featured",                ff: "Yiɗaaɗo" },
  negotiable:      { en: "Price negotiable",        fr: "Prix négociable",            ha: "Ana tattaunawa",         ar: "السعر قابل للتفاوض",           pcm: "Price nego",              ff: "Njaru hewtii" },
  avail_title:     { en: "Availability",            fr: "Disponibilité",              ha: "Samuwa",                 ar: "التوفر",                        pcm: "Wetin dey",               ff: "Ko woodi" },  // FIX345
  units_available: { en: "available",               fr: "disponibles",                ha: "akwai",                  ar: "متوفر",                         pcm: "dey",                     ff: "woodi" },     // FIX345
  only_left:       { en: "Only",                    fr: "Plus que",                   ha: "Sai",                    ar: "بقي فقط",                       pcm: "Na only",                 ff: "Tan" },       // FIX345
  left_word:       { en: "left",                    fr: "restant(s)",                 ha: "ya rage",                ar: "متبقٍ",                         pcm: "remain",                  ff: "heddii" },    // FIX345
  colors_avail:    { en: "Colours available",       fr: "Couleurs disponibles",       ha: "Launukan da ake da su",  ar: "الألوان المتوفرة",              pcm: "Colour wey dey",          ff: "Nooneeji goodɗi" },  // FIX345
  locked_msg:      { en: "Subscribe to see how many are left and which colours.", fr: "Abonnez-vous pour voir la quantité restante et les couleurs.", ha: "Ka biya kuɗin shiga don ganin adadin da ya rage da launuka.", ar: "اشترك لمعرفة الكمية المتبقية والألوان المتاحة.", pcm: "Subscribe make you see how many remain and which colour dey.", ff: "Naatnu ngam yiyde ko heddii e nooneeji." },  // FIX345
  see_plans:       { en: "See plans",               fr: "Voir les offres",            ha: "Duba tsare-tsare",       ar: "عرض الباقات",                   pcm: "See di plans",            ff: "Ndaaru paketaaji" },  // FIX345
  expires_today:   { en: "This listing expires today!", fr: "Cette annonce expire aujourd'hui!", ha: "Wannan jeri na ƙarewa yau!", ar: "ينتهي هذا الإعلان اليوم!", pcm: "Dis listing expire today!", ff: "Nde ɗowroo hande!" },
  expires_in:      { en: "This listing expires in", fr: "Cette annonce expire dans",  ha: "Wannan jeri na ƙarewa a cikin", ar: "ينتهي هذا الإعلان خلال", pcm: "Dis listing expire for",  ff: "Nde ɗowroo e nder" },
  days:            { en: "day(s)",                  fr: "jour(s)",                    ha: "kwana",                  ar: "يوم/أيام",                     pcm: "day(s)",                  ff: "ñalnde(ɗe)" },
  no_image:        { en: "No image",                fr: "Pas d'image",                ha: "Babu hoto",              ar: "لا توجد صورة",                 pcm: "No picture",              ff: "Alaa foto" },
  seller:          { en: "Bambeh Seller",           fr: "Vendeur Bambeh",             ha: "Mai siyarwa Bambeh",     ar: "بائع Bambeh",                  pcm: "Bambeh Seller",           ff: "Yoɓoowo Bambeh" },
  qty_each:        { en: "XAF each",                fr: "XAF l'unité",                ha: "XAF kowanne",            ar: "فرنك إفريقي للقطعة",           pcm: "XAF each one",            ff: "XAF ɓe kala" },
  retry:           { en: "Retry",                   fr: "Réessayer",                  ha: "Sake",                   ar: "أعد المحاولة",                 pcm: "Try again",               ff: "Artu jeer" },
  go_back:         { en: "Go back",                 fr: "Retour",                     ha: "Koma baya",              ar: "الرجوع",                       pcm: "Go back",                 ff: "Yah artu" },
  shared:          { en: "Link copied!",            fr: "Lien copié!",                ha: "An kwafi hanyar!",       ar: "تم نسخ الرابط!",               pcm: "Link don copy!",          ff: "Lien nanngi!" },
  condition:       { en: "Condition",               fr: "État",                       ha: "Yanayi",                 ar: "الحالة",                       pcm: "Condition",               ff: "Damal" },
  posted:          { en: "Posted",                  fr: "Publié",                     ha: "An buga",                ar: "نُشر",                         pcm: "Posted",                  ff: "Yeesaama" },
  qty:             { en: "Qty",                     fr: "Qté",                        ha: "Adadi",                  ar: "الكمية",                       pcm: "Qty",                     ff: "Tonngol" },
};

function getLang(): Lang {
  try {
    const s = localStorage.getItem("bambeh_lang") as Lang;
    if (s && ["en","fr","ha","ar","pcm","ff"].includes(s)) return s;
  } catch { /* ignore */ }
  const b = navigator.language.split("-")[0] as Lang;
  return ["en","fr","ha","ar","pcm","ff"].includes(b) ? b : "fr";
}

// ─── Hook: reactive language ───────────────────────────────────────────────────
function useLangState(): Lang {
  const [lang, setLang] = useState<Lang>(getLang);
  useEffect(() => {
    const update = () => setLang(getLang());
    window.addEventListener("langChange", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("langChange", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return lang;
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
  stockQuantity?: number | null;   // FIX345
  colors?: string[] | null;        // FIX345
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
// FIX345 - swatch colours, keyed by the English value stored in colors_available.
const COLOR_HEX: Record<string, string> = {
  Black: "#111827", White: "#ffffff", Red: "#dc2626", Blue: "#2563eb",
  Green: "#16a34a", Yellow: "#eab308", Grey: "#9ca3af", Brown: "#92400e",
  Pink: "#ec4899", Orange: "#ea580c", Purple: "#7c3aed", Gold: "#d4af37",
};

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
    cart.push({ id: item.id, title: item.title, price: item.price, quantity: qty, image: item.images[0], sellerId: item.sellerId });
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
      saved.unshift({ id: item.id, title: item.title, price: `${item.price.toLocaleString("fr-CM")} XAF`, image: item.images[0], category: item.category, type: "marketplace", location: item.location, savedAt: new Date().toISOString() });
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function MarketplaceItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lang = useLangState();   // ✅ hook at top level — lang switches instantly
  const t = (key: string) => TR[key]?.[lang] ?? TR[key]?.["en"] ?? key;
  const isRtl = lang === "ar";

  const [listing,   setListing]   = useState<ListingDetail | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [imgIdx,    setImgIdx]    = useState(0);
  const [qty,       setQty]       = useState(1);
  const [cart,      setCart]      = useState<CartItem[]>(readCart);   // ✅ pure fn initialiser
  const [justAdded, setJustAdded] = useState(false);
  const [showCart,  setShowCart]  = useState(false);
  const [fav,       setFav]       = useState(false);
  const [shared,    setShared]    = useState(false);
  const [daysLeft,  setDaysLeft]  = useState<number | null>(null);

  const inCart = cart.some((c) => c.id === id);

  // Load listing
  const load = useCallback(async () => {
    if (!id) { setError("no-id"); setLoading(false); return; }
    setLoading(true);
    setError(null);

    try {
      // Build query — accept UUID or slug
      let query = supabase
        .from("listings")
        .select("id, title, description, price, category, condition, location, phone, negotiable, images, extra, seller_id, created_at, view_count, expires_at, is_featured, status, type, stock_quantity, colors_available")
        .eq("type", "marketplace");

      if (isUUID(id)) {
        query = query.eq("id", id);
      } else {
        query = query.ilike("title", id.replace(/-/g, " "));
      }

      const { data, error: dbErr } = await query.maybeSingle();

      if (dbErr) { setError(dbErr.message); return; }
      if (!data) { setError("not_found"); return; }

      // Extract images
      let images: string[] = [];
      if (Array.isArray(data.images) && data.images.length > 0) {
        images = data.images.map((img: any) =>
          typeof img === "string" ? img : (img?.url ?? img?.thumbnail_url ?? "")
        ).filter(Boolean);
      } else if (data.extra?.image_url) {
        images = [data.extra.image_url];
      }

      // Fetch seller profile
      let sellerName = t("seller");
      let sellerAvatar: string | undefined;
      if (data.seller_id) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url, full_name")
            .eq("id", data.seller_id)
            .maybeSingle();
          if (profile) {
            sellerName = profile.display_name ?? profile.full_name ?? t("seller");
            sellerAvatar = profile.avatar_url ?? undefined;
          }
        } catch { /* non-critical */ }
      }

      const detail: ListingDetail = {
        id: data.id,
        title: data.title ?? "",
        description: data.description ?? "",
        price: data.price ?? 0,
        category: data.category ?? "Other",
        condition: data.condition ?? "Used",
        location: data.location ?? "",
        phone: data.phone ?? data.extra?.phone ?? undefined,
        negotiable: data.negotiable ?? false,
        images,
        sellerId: data.seller_id ?? "",
        sellerName,
        sellerAvatar,
        postedAt: data.created_at,
        viewCount: data.view_count ?? 0,
        expiresAt: data.expires_at ?? undefined,
        isFeatured: data.is_featured ?? false,
        stockQuantity: data.stock_quantity ?? null,                                  // FIX345
        colors: Array.isArray(data.colors_available) ? data.colors_available : null, // FIX345
      };

      setListing(detail);
      setFav(isFavourited(data.id));

      // Calculate days left
      if (data.expires_at) {
        const left = Math.ceil((new Date(data.expires_at).getTime() - Date.now()) / 86400000);
        setDaysLeft(left);
      }

      // Increment view count (non-blocking)
      supabase.rpc("increment_view_count", { table_name: "listings", record_id: data.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "unexpected");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  // FIX326 - the seller's average rating, shown beside their name.
  // Reviews are stored polymorphically (target_id + target_type), so we
  // match on target_id alone: a seller's user id can never collide with a
  // listing id, and that keeps this working whatever target_type is called.
  // FIX345 - the stock + colour reveal is a SUBSCRIBER benefit, so we need to
  // know who is looking. useAuth() never throws; useSubscription verifies
  // against Supabase and is the same hook the access gates use.
  const { user } = useAuth();
  const { isActive: isSubscribed } = useSubscription(user?.id ?? null);

  // FIX449: usePlanLimits was called inside the JSX, AFTER the loading /
  // error / expired early returns. React counts hooks per render, so the
  // short first render and the long second render disagreed -> error #310.
  // A hook must live at the top level. Same value, no crash.
  const plan = usePlanLimits();

  const [sellerRating, setSellerRating] = useState<{ avg: number; count: number } | null>(null);
  useEffect(() => {
    const sid = listing?.sellerId;
    if (!sid) { setSellerRating(null); return; }
    let alive = true;
    (async () => {
      const { data, error: revErr } = await supabase
        .from("reviews")
        .select("rating")
        .eq("target_id", sid);
      if (!alive || revErr || !data) return;
      const scores = (data as { rating: number | null }[])
        .map((r) => Number(r.rating))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
      if (scores.length === 0) { setSellerRating(null); return; }
      const total = scores.reduce((sum, n) => sum + n, 0);
      setSellerRating({ avg: total / scores.length, count: scores.length });
    })();
    return () => { alive = false; };
  }, [listing?.sellerId]);

  // Cart sync
  useEffect(() => {
    const sync = () => setCart(readCart());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function handleAddToCart() {
    if (!listing) return;
    const updated = addToCart(listing, qty);
    setCart(updated);
    setJustAdded(true);
    setShowCart(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!listing) return;
    const updated = addToCart(listing, qty);
    setCart(updated);
    // Navigate to checkout with item context for CamPay
    navigate("/payment/checkout", {
      state: {
        items: [{ id: listing.id, title: listing.title, price: listing.price, quantity: qty, image: listing.images[0] }],
        total: listing.price * qty,
        platformFee: Math.round(listing.price * qty * 0.01), // 1% Bambeh fee
        sellerId: listing.sellerId,
      }
    });
  }

  function handleToggleFav() {
    if (!listing) return;
    const added = toggleFavStorage(listing);
    setFav(added);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.title, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  const conditionColor = CONDITION_COLOR[listing?.condition ?? ""] ?? CONDITION_COLOR["Used"];
  const phone = listing?.phone;
  const whatsappText = encodeURIComponent(
    `Hi! I'm interested in your listing on Bambeh: ${listing?.title} — ${fmt(listing?.price ?? 0)} XAF`
  );

  // ─── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 pb-24">
        <div className="w-10 h-10 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  // ─── Error / Not found ───────────────────────────────────────────────────
  if (error || !listing) {
    const isNotFound = error === "not_found" || error === "no-id";
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 pb-24" dir={isRtl ? "rtl" : "ltr"}>
        <Package className="w-16 h-16 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-800">{t("not_found")}</h1>
        <p className="text-sm text-gray-500 text-center">{t("removed")}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
          >
            {t("go_back")}
          </button>
          {!isNotFound && (
            <button
              onClick={() => void load()}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
            >
              {t("retry")}
            </button>
          )}
          <button
            onClick={() => navigate("/marketplace")}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
          >
            {t("browse")}
          </button>
        </div>
      </div>
    );
  }

  // ─── FIX336: expired listing — never render an ad past its expiry ────────
  // Compares the RAW timestamp, not daysLeft. daysLeft is Math.ceil(), so an ad
  // that expired two hours ago comes out as -0, which is not < 0 and would slip
  // straight through this guard. Before FIX336 the page showed a red
  // "Expires today" banner on an ad dead for days and left it fully buyable.
  const expiryMs = listing.expiresAt ? new Date(listing.expiresAt).getTime() : null;
  if (expiryMs !== null && expiryMs < Date.now()) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 pb-24" dir={isRtl ? "rtl" : "ltr"}>
        <Clock className="w-16 h-16 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-800">{t("expired_title")}</h1>
        <p className="text-sm text-gray-500 text-center max-w-sm">{t("expired_msg")}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
          >
            {t("go_back")}
          </button>
          <button
            onClick={() => navigate("/marketplace")}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition"
          >
            {t("browse")}
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 pb-36"
      dir={isRtl ? "rtl" : "ltr"}
      aria-label={listing.title}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          aria-label={t("go_back")}
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <h1 className="flex-1 text-sm font-semibold text-gray-900 truncate">{listing.title}</h1>
        <button
          onClick={handleToggleFav}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          aria-label={fav ? "Remove from favourites" : "Save to favourites"}
          aria-pressed={fav}
        >
          <Heart className={`w-4.5 h-4.5 transition-colors ${fav ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
        </button>
        <button
          onClick={handleShare}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Share this listing"
        >
          <Share2 className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={() => navigate("/cart")}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          aria-label={`${t("your_cart")}: ${cart.reduce((s,c)=>s+c.quantity,0)} ${t("items_in_cart")}`}
        >
          <ShoppingCart className="w-4 h-4 text-gray-600" />
          {cart.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {cart.reduce((s, c) => s + c.quantity, 0) > 9 ? "9+" : cart.reduce((s, c) => s + c.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Copied toast */}
      {shared && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
          {t("shared")}
        </div>
      )}

      {/* Expiry banner */}
      {daysLeft !== null && daysLeft <= 3 && (
        <div className={`mx-4 mt-3 p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
          daysLeft <= 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-200 text-amber-700"
        }`}>
          <Clock className="w-4 h-4 flex-shrink-0" />
          {daysLeft <= 0 ? t("expires_today") : `${t("expires_in")} ${daysLeft} ${t("days")}`}
        </div>
      )}

      {/* Images */}
      <div className="relative w-full bg-gray-100 overflow-hidden" style={{ height: "300px" }}>
        {listing.images.length > 0 ? (
          <>
            <img
              src={listing.images[imgIdx]}
              alt={`${listing.title} — photo ${imgIdx + 1}`}
              className="w-full h-full object-contain bg-white"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
            />
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                  disabled={imgIdx === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow disabled:opacity-30"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => Math.min(listing.images.length - 1, i + 1))}
                  disabled={imgIdx === listing.images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow disabled:opacity-30"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {listing.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? "bg-teal-600" : "bg-white/70"}`}
                      aria-label={`Photo ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <Package className="w-12 h-12" />
            <p className="text-xs">{t("no_image")}</p>
          </div>
        )}

        {/* Badges */}
        {listing.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold shadow">
            <Zap className="w-3 h-3" />{t("featured")}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {listing.images.length > 1 && (
        <div className="flex gap-2 px-4 pt-2 pb-1 overflow-x-auto scrollbar-hide">
          {listing.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-teal-500" : "border-transparent"}`}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Main Info */}
      <div className="px-4 pt-4 space-y-4">
        {/* Title + price */}
        <div>
          <div className="flex items-start gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${conditionColor}`}>
              {listing.condition}
            </span>
            {listing.negotiable && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 font-medium">
                {t("negotiable")}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-2 leading-tight">{listing.title}</h2>
          <p className="text-2xl font-extrabold text-teal-700 mt-1">
            {fmt(listing.price)} <span className="text-base font-semibold">XAF</span>
          </p>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {/* FIX431 - free members see the city, premium sees the rest */}
          {(() => {
            const lang = (() => {
              try {
                const l = String(window.localStorage.getItem("bambeh_lang") ?? "en").toLowerCase();
                if (l === "fulfulde" || l === "ful") return "ff";
                if (l === "pcm") return "pidgin";
                return LOC_T[l] ? l : "en";
              } catch { return "en"; }
            })();
            const lt = LOC_T[lang] ?? LOC_T.en;
            const full = String(listing.location ?? "");
            const city = cityOnly(full);
            const hasMore = full.length > city.length;

            if (plan.canSeeExactLocation || !hasMore) {
              return (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />{full || city}
                </div>
              );
            }
            return (
              <button
                type="button"
                onClick={() => { window.location.hash = "#/subscription"; }}
                className="flex items-center gap-1 text-teal-700 hover:underline"
                title={lt.hint}
              >
                <MapPin className="w-3.5 h-3.5" />
                {city}
                <Lock className="w-3 h-3 ml-0.5" />
                <span className="text-[11px] font-semibold">{lt.unlock}</span>
              </button>
            );
          })()}
          <div className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{listing.category}</div>
          <div className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{listing.viewCount} {t("views")}</div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(listing.postedAt).toLocaleDateString("fr-CM", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        {/* FIX345 - units left and colours. Shown ONLY when the seller actually
            told us something: teasing a lock over empty data would be a lie.
            Subscribers see the numbers; everyone else sees why to subscribe. */}
        {(listing.stockQuantity != null || (listing.colors && listing.colors.length > 0)) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Boxes className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-gray-900">{t("avail_title")}</h3>
            </div>

            {isSubscribed ? (
              <div className="space-y-2">
                {listing.stockQuantity != null && (
                  listing.stockQuantity <= 5 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                      {t("only_left")} {listing.stockQuantity} {t("left_word")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      {listing.stockQuantity} {t("units_available")}
                    </span>
                  )
                )}

                {listing.colors && listing.colors.length > 0 && (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">{t("colors_avail")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {listing.colors.map((cname) => (
                        <span key={cname}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-200 bg-white text-[11px] text-gray-700">
                          <span className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: COLOR_HEX[cname] ?? "#d1d5db" }} />
                          {cname}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">{t("locked_msg")}</p>
                  <button
                    onClick={() => navigate("/subscription")}
                    className="mt-1.5 text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    {t("see_plans")} →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cart mini-panel */}
        {showCart && cart.length > 0 && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-teal-800">{t("your_cart")}</p>
              <button onClick={() => setShowCart(false)} className="text-teal-500 text-xs">&times;</button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cart.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  {c.image && <img src={c.image} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{c.title}</p>
                    <p className="text-xs text-teal-600 font-semibold">{fmt(c.price)} XAF</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCart(updateCartQty(c.id, c.quantity - 1))} className="w-5 h-5 bg-white rounded border text-xs flex items-center justify-center hover:bg-gray-50">−</button>
                    <span className="text-xs w-4 text-center">{c.quantity}</span>
                    <button onClick={() => setCart(updateCartQty(c.id, c.quantity + 1))} className="w-5 h-5 bg-white rounded border text-xs flex items-center justify-center hover:bg-gray-50">+</button>
                    <button onClick={() => setCart(removeFromCart(c.id))} className="ml-1 text-red-400 text-xs hover:text-red-600">×</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-teal-200">
              <p className="text-xs font-bold text-gray-700">{fmt(cartTotal(cart))} XAF</p>
              <button onClick={() => navigate("/cart")} className="text-xs font-bold text-teal-600 hover:text-teal-800">{t("view_cart")} →</button>
            </div>
          </div>
        )}

        {/* Qty selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{t("qty")}:</span>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-7 h-7 bg-white rounded-lg text-lg font-bold flex items-center justify-center hover:bg-gray-50" aria-label="Decrease quantity">−</button>
            <span className="w-6 text-center text-sm font-bold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-7 h-7 bg-white rounded-lg text-lg font-bold flex items-center justify-center hover:bg-gray-50" aria-label="Increase quantity">+</button>
          </div>
          <span className="text-xs text-gray-400">{fmt(listing.price * qty)} XAF</span>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-1.5">{t("description")}</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {listing.description || t("no_description")}
          </p>
        </div>

        {/* Seller card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-teal-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {listing.sellerAvatar ? (
                <img src={listing.sellerAvatar} alt={listing.sellerName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-teal-600 text-lg font-bold">{listing.sellerName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{listing.sellerName}</p>
              <p className="text-xs text-gray-400">{t("contact_seller")}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <button
                onClick={() => navigate(`/seller/${listing.sellerId}/rating`)}
                className="text-xs text-teal-600 font-semibold hover:text-teal-800 transition"
                aria-label={`${t("view_profile")} ${listing.sellerName}`}
              >
                {t("view_profile")}
              </button>

              {/* FIX326 - the average of every star this seller has been given.
                  Rounding, exactly as agreed: a decimal of .5 or more rounds UP,
                  .4 or less rounds DOWN. 4+4+4+5 = 17 / 4 = 4.25 shows 4 stars. */}
              {sellerRating ? (
                <>
                  <div className="flex items-center gap-0.5"
                    aria-label={`${Math.floor(sellerRating.avg + 0.5)} / 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n}
                        className={`w-3.5 h-3.5 ${n <= Math.floor(sellerRating.avg + 0.5)
                          ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">({sellerRating.count})</span>
                  </div>
                  <button
                    onClick={() => navigate(`/seller/${listing.sellerId}/rating`)}
                    className="text-[10px] text-gray-400 hover:text-teal-600 transition text-right leading-tight max-w-[9rem]"
                  >
                    {t("rating_more")}
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-gray-400">{t("rating_none")}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/chat?userId=${listing.sellerId}&listingId=${listing.id}&listingTitle=${encodeURIComponent(listing.title)}&listingImage=${encodeURIComponent(listing.images?.[0] ?? '')}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 active:scale-95 transition"
              aria-label={`Chat with seller: ${listing.sellerName}`}
            >
              <MessageCircle className="w-4 h-4" />{t("chat")}
            </button>
          </div>
        </div>

        {/* FIX341 - what buyers actually said. The words were being written to
            `reviews` all along and displayed nowhere; this is the missing screen. */}
        {listing.sellerId ? <SellerReviews sellerId={listing.sellerId} /> : null}

        {/* Safety tip */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-800">{t("safety_tip")}</p>
              <p className="text-xs text-blue-700 mt-0.5">{t("safety_msg")}</p>
              <button
                onClick={() => navigate("/meet-safely")}
                className="text-xs font-semibold text-blue-600 mt-1 hover:text-blue-800"
                aria-label="How to meet safely"
              >
                {t("meet_safely")}
              </button>
            </div>
          </div>
        </div>

        {/* Report */}
        <div className="flex justify-center pb-4">
          <button
            onClick={() => navigate(`/report-issue?listing=${listing.id}`)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
            aria-label={t("report")}
          >
            <Flag className="w-3.5 h-3.5" />{t("report")}
          </button>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg px-4 py-3 flex gap-3 safe-area-inset-bottom">
        <button
          onClick={handleAddToCart}
          disabled={justAdded}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            inCart
              ? "bg-gray-100 text-gray-600 border border-gray-200"
              : justAdded
              ? "bg-teal-100 text-teal-700 border border-teal-200"
              : "bg-teal-50 text-teal-700 border border-teal-300 hover:bg-teal-100"
          }`}
          aria-label={justAdded ? t("added") : inCart ? t("in_cart") : t("add_to_cart")}
        >
          {justAdded ? (
            <><CheckCircle className="w-4 h-4" />{t("added")}</>
          ) : inCart ? (
            <><ShoppingCart className="w-4 h-4" />{t("in_cart")}</>
          ) : (
            <><ShoppingCart className="w-4 h-4" />{t("add_to_cart")}</>
          )}
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 active:scale-95 transition shadow-sm"
          aria-label={`${t("buy_now")} — ${fmt(listing.price * qty)} XAF`}
        >
          {t("buy_now")} — {fmt(listing.price * qty)} XAF
        </button>
      </div>
    </div>
  );
}

// BAMBEH_END_TOKEN__MARKETPLACEITEMDETAILS_FIX82__COMPLETE
// BAMBEH_END_TOKEN__MARKETPLACEITEMDETAILS_FIX345__COMPLETE

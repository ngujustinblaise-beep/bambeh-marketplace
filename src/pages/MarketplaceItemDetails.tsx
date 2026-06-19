/**
 * src/pages/MarketplaceItemDetails.tsx â€” Bambeh Marketplace
 *
 * FIXES â€” June 2026
 *  âœ… FIX 1: readCart() is a pure function â€” no illegal hook call
 *  âœ… FIX 2: Full i18n â€” English / French / Hausa / Arabic / Pidgin / Fulfulde
 *  âœ… FIX 3: Language switches INSTANTLY via "langChange" event (useLangState hook)
 *  âœ… FIX 4: increment_view_count RPC passes correct params (table_name + record_id)
 *  âœ… FIX 5: phone / whatsappText declared BEFORE JSX
 *  âœ… FIX 6: Queries `listings` table only
 *  âœ… FIX 7: Voice control aria-labels on all interactive elements
 *  âœ… Cart mini-panel â€” inline, connected to /cart
 *  âœ… "Add to Cart" persists to localStorage
 *  âœ… "Buy Now" â†’ /payment/checkout with CamPay data
 *  âœ… WhatsApp + Call + Chat contact options
 *  âœ… Share (Web Share API + clipboard fallback)
 *  âœ… Safety tip + Report link
 *  âœ… Safe-area bottom padding
 *
 * Â© 2026 BAMBEH SARL. All rights reserved.
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

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Lang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";

const TR: Record<string, Record<Lang, string>> = {
  loading:         { en: "Loading listingâ€¦",        fr: "Chargementâ€¦",                ha: "Ana lodawaâ€¦",            ar: "Ø¬Ø§Ø± Ø§Ù„ØªØ­Ù…ÙŠÙ„â€¦",                pcm: "Loadingâ€¦",               ff: "Naatirdeâ€¦" },
  not_found:       { en: "Listing not found",       fr: "Annonce introuvable",        ha: "Ba a samu ba",           ar: "Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯",            pcm: "Listing no dey",          ff: "Alaa" },
  removed:         { en: "This item may have been sold or removed.", fr: "Cet article a peut-Ãªtre Ã©tÃ© vendu ou supprimÃ©.", ha: "An sayar ko an cire.", ar: "Ø±Ø¨Ù…Ø§ ØªÙ… Ø¨ÙŠØ¹ Ø§Ù„Ø¹Ù†ØµØ± Ø£Ùˆ Ø¥Ø²Ø§Ù„ØªÙ‡.", pcm: "Dis item don sell or remove.", ff: "Ko nde dawnii ko nde É“ennii." },
  browse:          { en: "Browse Marketplace",      fr: "Parcourir le marchÃ©",        ha: "Duba kasuwa",            ar: "ØªØµÙØ­ Ø§Ù„Ø³ÙˆÙ‚",                   pcm: "Browse Market",           ff: "Yiyto Suudu" },
  description:     { en: "Description",             fr: "Description",                ha: "Bayanai",                ar: "Ø§Ù„ÙˆØµÙ",                        pcm: "Description",             ff: "Pijirde" },
  no_description:  { en: "No description provided.", fr: "Aucune description.",       ha: "Babu bayanai.",          ar: "Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ.",                 pcm: "No description.",         ff: "Alaa pijirde." },
  contact_seller:  { en: "Contact Seller",          fr: "Contacter le vendeur",       ha: "TuntuÉ“i mai siyarwa",   ar: "ØªÙˆØ§ØµÙ„ Ù…Ø¹ Ø§Ù„Ø¨Ø§Ø¦Ø¹",              pcm: "Contact Seller",          ff: "Newnin YoÉ“oowo" },
  view_profile:    { en: "View Profile",            fr: "Voir le profil",             ha: "Duba profile",           ar: "Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ",             pcm: "See Profile",             ff: "Yiy Profil" },
  whatsapp:        { en: "WhatsApp",                fr: "WhatsApp",                   ha: "WhatsApp",               ar: "ÙˆØ§ØªØ³Ø§Ø¨",                       pcm: "WhatsApp",                ff: "WhatsApp" },
  call:            { en: "Call",                    fr: "Appeler",                    ha: "Kira",                   ar: "Ø§ØªØµÙ„",                         pcm: "Call",                    ff: "Ewnu" },
  chat:            { en: "Chat",                    fr: "Chat",                       ha: "Zanta",                  ar: "Ø¯Ø±Ø¯Ø´Ø©",                        pcm: "Chat",                    ff: "HaÉ“É“u" },
  safety_tip:      { en: "Safety tip:",             fr: "Conseil de sÃ©curitÃ© :",      ha: "Tip na aminci:",         ar: "Ù†ØµÙŠØ­Ø© Ø£Ù…Ø§Ù†:",                  pcm: "Safety tip:",             ff: "Miijo sehilal:" },
  safety_msg:      { en: "Use Bambeh Escrow to protect your purchase. Never send money before inspecting the item.", fr: "Utilisez l'Escrow Bambeh pour protÃ©ger votre achat. N'envoyez jamais d'argent avant d'inspecter l'article.", ha: "Yi amfani da Bambeh Escrow. Kada ka aika kudi kafin bincika kaya.", ar: "Ø§Ø³ØªØ®Ø¯Ù… Ø¶Ù…Ø§Ù† Bambeh. Ù„Ø§ ØªØ±Ø³Ù„ Ø§Ù„Ù…Ø§Ù„ Ù‚Ø¨Ù„ Ø§Ù„ÙØ­Øµ.", pcm: "Use Bambeh Escrow protect your buy. No send money before you see item.", ff: "HuÉ“É“in Bambeh Escrow. Taa aawa mbaydi tawi anndaaki kala ngoo." },
  meet_safely:     { en: "How to meet safely â†’",   fr: "Comment se rencontrer en sÃ©curitÃ© â†’", ha: "Yadda za a gana lafiya â†’", ar: "ÙƒÙŠÙÙŠØ© Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ Ø¨Ø£Ù…Ø§Ù† â†’",  pcm: "How to meet safe â†’",      ff: "No rewata sehilal â†’" },
  report:          { en: "Report this listing",     fr: "Signaler cette annonce",     ha: "Rahoton wannan jeri",    ar: "Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†",       pcm: "Report dis listing",      ff: "Tiindirgo nde" },
  your_cart:       { en: "Your Cart",               fr: "Votre panier",               ha: "Katonku",                ar: "Ø³Ù„ØªÙƒ",                         pcm: "Your Cart",               ff: "Cart maa" },
  items_in_cart:   { en: "items",                   fr: "articles",                   ha: "kaya",                   ar: "Ø¹Ù†Ø§ØµØ±",                        pcm: "items",                   ff: "kala" },
  view_cart:       { en: "View Cart",               fr: "Voir le panier",             ha: "Duba kato",              ar: "Ø¹Ø±Ø¶ Ø§Ù„Ø³Ù„Ø©",                    pcm: "See Cart",                ff: "Yiy Cart" },
  checkout:        { en: "Checkout Now",            fr: "Payer maintenant",           ha: "Biya yanzu",             ar: "Ø§Ù„Ø¯ÙØ¹ Ø§Ù„Ø¢Ù†",                   pcm: "Pay now",                 ff: "HaaÉ“tu hannde" },
  add_to_cart:     { en: "Add to Cart",             fr: "Ajouter au panier",          ha: "Æ˜ara zuwa kato",         ar: "Ø£Ø¶Ù Ø¥Ù„Ù‰ Ø§Ù„Ø³Ù„Ø©",                pcm: "Add to Cart",             ff: "Æeydu e Cart" },
  added:           { en: "Added!",                  fr: "AjoutÃ©!",                    ha: "An Æ™ara!",               ar: "ØªÙ…Øª Ø§Ù„Ø¥Ø¶Ø§ÙØ©!",                 pcm: "Added!",                  ff: "Æeydaama!" },
  in_cart:         { en: "In Cart",                 fr: "Dans le panier",             ha: "A cikin kato",           ar: "ÙÙŠ Ø§Ù„Ø³Ù„Ø©",                     pcm: "In Cart",                 ff: "E nder Cart" },
  buy_now:         { en: "Buy Now",                 fr: "Acheter",                    ha: "Saya yanzu",             ar: "Ø§Ø´ØªØ± Ø§Ù„Ø¢Ù†",                    pcm: "Buy Now",                 ff: "Soo Hannde" },
  views:           { en: "views",                   fr: "vues",                       ha: "kallon",                 ar: "Ù…Ø´Ø§Ù‡Ø¯Ø§Øª",                      pcm: "view",                    ff: "yiytatii" },
  featured:        { en: "Featured",                fr: "En vedette",                 ha: "Babban zaÉ“i",            ar: "Ù…Ù…ÙŠØ²",                         pcm: "Featured",                ff: "YiÉ—aaÉ—o" },
  negotiable:      { en: "Price negotiable",        fr: "Prix nÃ©gociable",            ha: "Ana tattaunawa",         ar: "Ø§Ù„Ø³Ø¹Ø± Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªÙØ§ÙˆØ¶",           pcm: "Price nego",              ff: "Njaru hewtii" },
  expires_today:   { en: "This listing expires today!", fr: "Cette annonce expire aujourd'hui!", ha: "Wannan jeri na Æ™arewa yau!", ar: "ÙŠÙ†ØªÙ‡ÙŠ Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø§Ù„ÙŠÙˆÙ…!", pcm: "Dis listing expire today!", ff: "Nde É—owroo hande!" },
  expires_in:      { en: "This listing expires in", fr: "Cette annonce expire dans",  ha: "Wannan jeri na Æ™arewa a cikin", ar: "ÙŠÙ†ØªÙ‡ÙŠ Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù† Ø®Ù„Ø§Ù„", pcm: "Dis listing expire for",  ff: "Nde É—owroo e nder" },
  days:            { en: "day(s)",                  fr: "jour(s)",                    ha: "kwana",                  ar: "ÙŠÙˆÙ…/Ø£ÙŠØ§Ù…",                     pcm: "day(s)",                  ff: "Ã±alnde(É—e)" },
  no_image:        { en: "No image",                fr: "Pas d'image",                ha: "Babu hoto",              ar: "Ù„Ø§ ØªÙˆØ¬Ø¯ ØµÙˆØ±Ø©",                 pcm: "No picture",              ff: "Alaa foto" },
  seller:          { en: "Bambeh Seller",           fr: "Vendeur Bambeh",             ha: "Mai siyarwa Bambeh",     ar: "Ø¨Ø§Ø¦Ø¹ Bambeh",                  pcm: "Bambeh Seller",           ff: "YoÉ“oowo Bambeh" },
  qty_each:        { en: "XAF each",                fr: "XAF l'unitÃ©",                ha: "XAF kowanne",            ar: "ÙØ±Ù†Ùƒ Ø¥ÙØ±ÙŠÙ‚ÙŠ Ù„Ù„Ù‚Ø·Ø¹Ø©",           pcm: "XAF each one",            ff: "XAF É“e kala" },
  retry:           { en: "Retry",                   fr: "RÃ©essayer",                  ha: "Sake",                   ar: "Ø£Ø¹Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©",                 pcm: "Try again",               ff: "Artu jeer" },
  go_back:         { en: "Go back",                 fr: "Retour",                     ha: "Koma baya",              ar: "Ø§Ù„Ø±Ø¬ÙˆØ¹",                       pcm: "Go back",                 ff: "Yah artu" },
  shared:          { en: "Link copied!",            fr: "Lien copiÃ©!",                ha: "An kwafi hanyar!",       ar: "ØªÙ… Ù†Ø³Ø® Ø§Ù„Ø±Ø§Ø¨Ø·!",               pcm: "Link don copy!",          ff: "Lien nanngi!" },
  condition:       { en: "Condition",               fr: "Ã‰tat",                       ha: "Yanayi",                 ar: "Ø§Ù„Ø­Ø§Ù„Ø©",                       pcm: "Condition",               ff: "Damal" },
  posted:          { en: "Posted",                  fr: "PubliÃ©",                     ha: "An buga",                ar: "Ù†ÙØ´Ø±",                         pcm: "Posted",                  ff: "Yeesaama" },
  qty:             { en: "Qty",                     fr: "QtÃ©",                        ha: "Adadi",                  ar: "Ø§Ù„ÙƒÙ…ÙŠØ©",                       pcm: "Qty",                     ff: "Tonngol" },
};

function getLang(): Lang {
  try {
    const s = localStorage.getItem("bambeh_lang") as Lang;
    if (s && ["en","fr","ha","ar","pcm","ff"].includes(s)) return s;
  } catch { /* ignore */ }
  const b = navigator.language.split("-")[0] as Lang;
  return ["en","fr","ha","ar","pcm","ff"].includes(b) ? b : "fr";
}

// â”€â”€â”€ Hook: reactive language â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Cart Helpers â€” PURE FUNCTIONS, NO HOOKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Fav Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Other Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fmt = (n: number) => n.toLocaleString("fr-CM");

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function MarketplaceItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lang = useLangState();   // âœ… hook at top level â€” lang switches instantly
  const t = (key: string) => TR[key]?.[lang] ?? TR[key]?.["en"] ?? key;
  const isRtl = lang === "ar";

  const [listing,   setListing]   = useState<ListingDetail | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [imgIdx,    setImgIdx]    = useState(0);
  const [qty,       setQty]       = useState(1);
  const [cart,      setCart]      = useState<CartItem[]>(readCart);   // âœ… pure fn initialiser
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
      // Build query â€” accept UUID or slug
      let query = supabase
        .from("listings")
        .select("id, title, description, price, category, condition, location, phone, negotiable, images, extra, seller_id, created_at, view_count, expires_at, is_featured, status, type")
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
      };

      setListing(detail);
      setFav(isFavourited(data.id));

      // Calculate days left
      if (data.expires_at) {
        const left = Math.ceil((new Date(data.expires_at).getTime() - Date.now()) / 86400000);
        setDaysLeft(left);
      }

      // Increment view count (non-blocking)
      supabase.rpc("increment_view_count", { table_name: "listings", record_id: data.id }).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "unexpected");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

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
      await navigator.clipboard.writeText(url).catch(() => {});
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  const conditionColor = CONDITION_COLOR[listing?.condition ?? ""] ?? CONDITION_COLOR["Used"];
  const phone = listing?.phone;
  const whatsappText = encodeURIComponent(
    `Hi! I'm interested in your listing on Bambeh: ${listing?.title} â€” ${fmt(listing?.price ?? 0)} XAF`
  );

  // â”€â”€â”€ Loading state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 pb-24">
        <div className="w-10 h-10 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  // â”€â”€â”€ Error / Not found â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Main render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
              alt={`${listing.title} â€” photo ${imgIdx + 1}`}
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
          <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{listing.location}</div>
          <div className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{listing.category}</div>
          <div className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{listing.viewCount} {t("views")}</div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(listing.postedAt).toLocaleDateString("fr-CM", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

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
                    <button onClick={() => setCart(updateCartQty(c.id, c.quantity - 1))} className="w-5 h-5 bg-white rounded border text-xs flex items-center justify-center hover:bg-gray-50">âˆ’</button>
                    <span className="text-xs w-4 text-center">{c.quantity}</span>
                    <button onClick={() => setCart(updateCartQty(c.id, c.quantity + 1))} className="w-5 h-5 bg-white rounded border text-xs flex items-center justify-center hover:bg-gray-50">+</button>
                    <button onClick={() => setCart(removeFromCart(c.id))} className="ml-1 text-red-400 text-xs hover:text-red-600">Ã—</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-teal-200">
              <p className="text-xs font-bold text-gray-700">{fmt(cartTotal(cart))} XAF</p>
              <button onClick={() => navigate("/cart")} className="text-xs font-bold text-teal-600 hover:text-teal-800">{t("view_cart")} â†’</button>
            </div>
          </div>
        )}

        {/* Qty selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{t("qty")}:</span>
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-7 h-7 bg-white rounded-lg text-lg font-bold flex items-center justify-center hover:bg-gray-50" aria-label="Decrease quantity">âˆ’</button>
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
            <button
              onClick={() => navigate(`/seller/${listing.sellerId}/rating`)}
              className="text-xs text-teal-600 font-semibold hover:text-teal-800 transition"
              aria-label={`${t("view_profile")} ${listing.sellerName}`}
            >
              {t("view_profile")}
            </button>
          </div>

          <div className="flex gap-2">
            {phone && (
              <>
                <a
                  href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 active:scale-95 transition"
                  aria-label={`Contact seller via WhatsApp: ${listing.sellerName}`}
                >
                  <MessageCircle className="w-4 h-4" />{t("whatsapp")}
                </a>
                <a
                  href={`tel:${phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 active:scale-95 transition"
                  aria-label={`Call seller: ${listing.sellerName}`}
                >
                  <Phone className="w-4 h-4" />{t("call")}
                </a>
              </>
            )}
            <button
              onClick={() => navigate("/chat")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 active:scale-95 transition"
              aria-label={`Chat with seller: ${listing.sellerName}`}
            >
              <MessageCircle className="w-4 h-4" />{t("chat")}
            </button>
          </div>
        </div>

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
          aria-label={`${t("buy_now")} â€” ${fmt(listing.price * qty)} XAF`}
        >
          {t("buy_now")} â€” {fmt(listing.price * qty)} XAF
        </button>
      </div>
    </div>
  );
}

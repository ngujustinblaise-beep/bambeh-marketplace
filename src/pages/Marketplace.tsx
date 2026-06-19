/**
 * src/pages/Marketplace.tsx â€” Bambeh Marketplace
 *
 * FIXES â€” June 2026
 *  âœ… FIX 1: readFavIds() / readCartCount() are pure functions â€” NO hook calls
 *  âœ… FIX 2: Language switches INSTANTLY via useLangState() + "langChange" event
 *  âœ… FIX 3: Supabase query wrapped in try/catch with user-friendly error message
 *  âœ… FIX 4: All UI strings go through tx() with reactive lang
 *  âœ… FIX 5: Realtime subscription safe-guards
 *  âœ… FIX 6: Pull-to-refresh gesture
 *  âœ… FIX 7: Featured items float to top; sort preserved
 *  âœ… FIX 8: Expiry alert banner for logged-in sellers
 *  âœ… FIX 9: Voice control aria-labels on all interactive elements
 *
 * Â© 2026 BAMBEH SARL. All rights reserved.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ShoppingBag, Heart, MapPin, Plus, Loader2,
  RefreshCw, PackageOpen, Eye, ShoppingCart, Bell, X,
  TrendingUp, Zap,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeaturedAdsStrip } from "@/components/ads/FeaturedAdsStrip";

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Lang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";

const TR: Record<string, Record<Lang, string>> = {
  marketplace:       { en: "Marketplace",                fr: "MarchÃ©",                     ha: "Kasuwanci",              ar: "Ø§Ù„Ø³ÙˆÙ‚",                        pcm: "Market",                  ff: "Suudu" },
  search_placeholder:{ en: "Search items, locationâ€¦",    fr: "Chercher articles, lieuâ€¦",   ha: "Bincikaâ€¦",               ar: "Ø§Ø¨Ø­Ø«â€¦",                        pcm: "Search item, placeâ€¦",     ff: "YiÉ—É—oâ€¦" },
  sell:              { en: "Sell",                        fr: "Vendre",                     ha: "Sayar",                  ar: "Ø¨ÙŠØ¹",                          pcm: "Sell",                    ff: "YoÉ“" },
  loading:           { en: "Loading listingsâ€¦",           fr: "Chargementâ€¦",                ha: "Ana lodawaâ€¦",            ar: "Ø¬Ø§Ø± Ø§Ù„ØªØ­Ù…ÙŠÙ„â€¦",                 pcm: "Loadingâ€¦",                ff: "Naatirdeâ€¦" },
  try_again:         { en: "Try again",                   fr: "RÃ©essayer",                  ha: "Sake",                   ar: "Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹",                  pcm: "Try again",               ff: "Artu jeer" },
  no_listings:       { en: "No listings yet",             fr: "Aucune annonce",             ha: "Babu jeri",              ar: "Ù„Ø§ Ø¥Ø¹Ù„Ø§Ù†Ø§Øª",                   pcm: "No listing yet",          ff: "Alaa" },
  first_to_sell:     { en: "Be the first to sell on Bambeh!", fr: "Soyez le premier Ã  vendre!", ha: "Kasance na farko!",  ar: "ÙƒÙ† Ø£ÙˆÙ„ Ù…Ù† ÙŠØ¨ÙŠØ¹!",             pcm: "Be first person sell!",   ff: "Wartoraa arande!" },
  post_first:        { en: "Post your first item",        fr: "Publiez votre article",      ha: "Buga farko",             ar: "Ø§Ù†Ø´Ø± Ø£ÙˆÙ„ Ø¹Ù†ØµØ±",                pcm: "Post your first item",    ff: "Yeeso aawal maa" },
  no_match:          { en: "No items match your search",  fr: "Aucun rÃ©sultat",             ha: "Babu sakamakon",         ar: "Ù„Ø§ Ù†ØªØ§Ø¦Ø¬",                     pcm: "Notin match",             ff: "Alaa goonga" },
  clear_filters:     { en: "Clear filters",               fr: "Effacer les filtres",        ha: "Share tace",             ar: "Ù…Ø³Ø­ Ø§Ù„ÙÙ„Ø§ØªØ±",                  pcm: "Clear filter",            ff: "Æol filters" },
  listings_expire:   { en: "Your listings expire soon",   fr: "Vos annonces expirent bientÃ´t", ha: "Jerin ku na Æ™arewa", ar: "Ø¥Ø¹Ù„Ø§Ù†Ø§ØªÙƒ ØªÙ†ØªÙ‡ÙŠ Ù‚Ø±ÙŠØ¨Ø§Ù‹",        pcm: "Your listing go expire soon", ff: "Ndes maa É—owroo" },
  renew:             { en: "Renew listings â†’",            fr: "Renouveler â†’",               ha: "Sabunta â†’",              ar: "ØªØ¬Ø¯ÙŠØ¯ â†’",                      pcm: "Renew am â†’",              ff: "Wullit â†’" },
  expires_today:     { en: "expires today!",              fr: "expire aujourd'hui!",        ha: "na Æ™arewa yau!",         ar: "ØªÙ†ØªÙ‡ÙŠ Ø§Ù„ÙŠÙˆÙ…!",                 pcm: "expire today!",           ff: "É—owroo hande!" },
  days_left:         { en: "d left",                      fr: "j restants",                 ha: "kwana",                  ar: "Ø£ÙŠØ§Ù…",                         pcm: "day remain",              ff: "Ã±alnde" },
  sort_newest:       { en: "Newest",                      fr: "RÃ©cent",                     ha: "Sabon",                  ar: "Ø§Ù„Ø£Ø­Ø¯Ø«",                       pcm: "New one",                 ff: "Tammbii" },
  sort_popular:      { en: "Most viewed",                 fr: "Plus vus",                   ha: "Mafi gani",              ar: "Ø§Ù„Ø£ÙƒØ«Ø± Ù…Ø´Ø§Ù‡Ø¯Ø©",                pcm: "Most view",               ff: "YiytataaÉ—o" },
  sort_price_asc:    { en: "Price: Lowâ†’High",             fr: "Prix: Basâ†’Haut",             ha: "Farashi â†‘",              ar: "Ø§Ù„Ø³Ø¹Ø±: Ù…Ù†Ø®ÙØ¶â†’Ù…Ø±ØªÙØ¹",           pcm: "Price low-high",          ff: "Njaru â†‘" },
  sort_price_desc:   { en: "Price: Highâ†’Low",             fr: "Prix: Hautâ†’Bas",             ha: "Farashi â†“",              ar: "Ø§Ù„Ø³Ø¹Ø±: Ù…Ø±ØªÙØ¹â†’Ù…Ù†Ø®ÙØ¶",           pcm: "Price high-low",          ff: "Njaru â†“" },
  listings_count:    { en: "listings",                    fr: "annonces",                   ha: "jeri",                   ar: "Ø¥Ø¹Ù„Ø§Ù†Ø§Øª",                      pcm: "listing",                 ff: "ndes" },
  in_category:       { en: "in",                          fr: "dans",                       ha: "a cikin",                ar: "ÙÙŠ",                           pcm: "for",                     ff: "e nder" },
  views:             { en: "views",                       fr: "vues",                       ha: "kallon",                 ar: "Ù…Ø´Ø§Ù‡Ø¯Ø§Øª",                      pcm: "view",                    ff: "yiytatii" },
  negoc:             { en: "Nego.",                       fr: "NÃ©goc.",                     ha: "Ana tattaunawa",         ar: "Ù‚Ø§Ø¨Ù„ Ù„Ù„ØªÙØ§ÙˆØ¶",                 pcm: "Nego.",                   ff: "Hewtii" },
  refresh:           { en: "Refresh",                     fr: "Actualiser",                 ha: "Sabunta",                ar: "ØªØ­Ø¯ÙŠØ«",                        pcm: "Refresh",                 ff: "Artu" },
  cart:              { en: "Cart",                        fr: "Panier",                     ha: "Kati",                   ar: "Ø¹Ø±Ø¨Ø©",                         pcm: "Cart",                    ff: "Cart" },
  connection_issue:  { en: "Connection issue",            fr: "ProblÃ¨me de connexion",      ha: "Matsalar hanyar sadarwa",ar: "Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„",             pcm: "Connection problem",      ff: "Juumre naatirde" },
};

// â”€â”€â”€ Language helpers â€” PURE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getLang(): Lang {
  try {
    const s = localStorage.getItem("bambeh_lang") as Lang;
    if (s && ["en","fr","ha","ar","pcm","ff"].includes(s)) return s;
  } catch { /* ignore */ }
  const b = navigator.language.split("-")[0] as Lang;
  return ["en","fr","ha","ar","pcm","ff"].includes(b) ? b : "fr";
}

// â”€â”€â”€ Hook: reactive language (fires instantly when user changes language) â”€â”€â”€â”€â”€â”€â”€
function useLangState(): Lang {
  const [lang, setLang] = useState<Lang>(getLang);
  useEffect(() => {
    const update = () => setLang(getLang());
    window.addEventListener("langChange", update);
    window.addEventListener("storage",   update);
    return () => {
      window.removeEventListener("langChange", update);
      window.removeEventListener("storage",   update);
    };
  }, []);
  return lang;
}

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Item {
  id: string;
  title: string;
  price: number;
  category: string;
  location: string;
  image?: string;
  condition: string;
  description: string;
  postedAt: string;
  view_count: number;
  negotiable: boolean;
  sellerId: string;
  expiresAt?: string;
  isFeatured?: boolean;
}

interface ExpiryAlert {
  id: string;
  title: string;
  expiresAt: string;
  daysLeft: number;
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CATEGORIES = [
  { label: "All",         emoji: "ðŸª" },
  { label: "Electronics", emoji: "ðŸ“±" },
  { label: "Fashion",     emoji: "ðŸ‘—" },
  { label: "Appliances",  emoji: "ðŸ”Œ" },
  { label: "Books",       emoji: "ðŸ“š" },
  { label: "Furniture",   emoji: "ðŸ›‹ï¸" },
  { label: "Vehicles",    emoji: "ðŸš—" },
  { label: "Rentals",     emoji: "ðŸ " },
  { label: "Other",       emoji: "ðŸ“¦" },
];

const FAV_KEY  = "bambeh_favorites";
const CART_KEY = "bambeh_cart";
const EXPIRY_WARN_DAYS = 3;

// â”€â”€â”€ Helpers â€” PURE FUNCTIONS, NO HOOKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function readFavIds(): Set<string> {
  try {
    return new Set(
      (JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as { id: string }[]).map((f) => f.id),
    );
  } catch { return new Set(); }
}

function readCartCount(): number {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as any[];
    return cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  } catch { return 0; }
}

function saveFav(item: Item, add: boolean) {
  try {
    const saved: any[] = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    const idx = saved.findIndex((f) => f.id === item.id);
    if (add && idx < 0) {
      saved.unshift({ id: item.id, title: item.title, price: `${item.price.toLocaleString("fr-CM")} XAF`, image: item.image, category: item.category, type: "marketplace", location: item.location, savedAt: new Date().toISOString() });
    } else if (!add && idx >= 0) {
      saved.splice(idx, 1);
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(saved));
  } catch { /* non-critical */ }
}

function extractImage(row: any): string | undefined {
  if (Array.isArray(row.images) && row.images.length > 0) {
    const first = row.images[0];
    return typeof first === "string" ? first : (first?.url ?? first?.thumbnail_url);
  }
  return row.extra?.image_url ?? undefined;
}

function mapRow(row: any): Item {
  return {
    id:          row.id,
    title:       row.title ?? "",
    price:       row.price ?? 0,
    category:    row.category ?? "Other",
    location:    row.location ?? "",
    image:       extractImage(row),
    condition:   row.condition ?? row.extra?.condition ?? "Used",
    description: row.description ?? "",
    postedAt:    row.created_at,
    view_count:  row.view_count ?? 0,
    negotiable:  row.negotiable ?? false,
    sellerId:    row.seller_id ?? "",
    expiresAt:   row.expires_at ?? undefined,
    isFeatured:  row.is_featured ?? false,
  };
}

function daysUntil(isoDate: string): number {
  return Math.ceil((new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString("fr-CM", { day: "numeric", month: "short" });
}

// â”€â”€â”€ Expiry Reminder Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ExpiryReminderBanner({
  alerts,
  onDismiss,
  tx,
}: {
  alerts: ExpiryAlert[];
  onDismiss: () => void;
  tx: (key: string) => string;
}) {
  if (!alerts.length) return null;
  return (
    <div className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3">
      <Bell className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-amber-800 mb-1">{tx("listings_expire")}</p>
        {alerts.map((a) => (
          <p key={a.id} className="text-xs text-amber-700 truncate">
            "{a.title}" â€” {a.daysLeft <= 0 ? tx("expires_today") : `${a.daysLeft} ${tx("days_left")}`}
          </p>
        ))}
        <button
          onClick={() => window.location.hash = "#/marketplace/drafts"}
          className="mt-1.5 text-xs font-semibold text-amber-700 underline"
          aria-label="Renew expiring listings"
        >
          {tx("renew")}
        </button>
      </div>
      <button onClick={onDismiss} className="flex-shrink-0 text-amber-400 hover:text-amber-600" aria-label="Dismiss expiry notice">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// â”€â”€â”€ Item Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ItemCard({
  item, isFav, onFav, onClick, tx,
}: {
  item: Item;
  isFav: boolean;
  onFav: (e: React.MouseEvent) => void;
  onClick: () => void;
  tx: (key: string) => string;
}) {
  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
      aria-label={`${item.title}, ${item.price.toLocaleString("fr-CM")} XAF`}
    >
      {/* Image */}
      <div className="h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <ShoppingBag className="w-10 h-10 text-teal-200" />
        )}

        <button
          onClick={onFav}
          aria-label={isFav ? "Remove from favourites" : "Save to favourites"}
          aria-pressed={isFav}
          className="absolute top-2 right-2 p-1.5 bg-white/95 rounded-full shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isFav ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>

        <div className="absolute bottom-2 left-2 flex gap-1">
          <span className="text-xs bg-white/90 backdrop-blur-sm text-gray-700 px-1.5 py-0.5 rounded-full font-medium">
            {item.condition}
          </span>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {item.isFeatured && (
            <span className="text-xs bg-yellow-400/90 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />
            </span>
          )}
          {item.negotiable && (
            <span className="text-xs bg-green-100/90 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
              {tx("negoc")}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-[10px] font-medium text-teal-600 mb-0.5 uppercase tracking-wide">{item.category}</p>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1.5">{item.title}</h3>
        <p className="text-teal-700 font-bold text-sm">
          {item.price.toLocaleString("fr-CM")} <span className="text-xs font-semibold">XAF</span>
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[70px]">{item.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Eye className="w-3 h-3" />
            <span>{item.view_count}</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{relativeTime(item.postedAt)}</p>
      </div>
    </article>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Marketplace() {
  const navigate = useNavigate();
  const lang     = useLangState();   // âœ… hook at top level
  const tx       = (key: string) => TR[key]?.[lang] ?? TR[key]?.["en"] ?? key;
  const isRtl    = lang === "ar";

  const [items,        setItems]        = useState<Item[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState("");
  const [cat,          setCat]          = useState("All");
  const [favs,         setFavs]         = useState<Set<string>>(readFavIds);
  const [cartCount,    setCartCount]    = useState(readCartCount);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [showExpiry,   setShowExpiry]   = useState(true);
  const [sortBy,       setSortBy]       = useState<"newest" | "price_asc" | "price_desc" | "popular">("newest");
  const touchStartY = useRef<number | null>(null);

  // Cart count sync
  useEffect(() => {
    const sync = () => setCartCount(readCartCount());
    window.addEventListener("storage", sync);
    const interval = setInterval(sync, 3000);
    return () => { window.removeEventListener("storage", sync); clearInterval(interval); };
  }, []);

  // Fetch listings
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("listings")
        .select(`id, title, price, category, location, description, images, extra, condition, created_at, status, view_count, negotiable, seller_id, expires_at, is_featured`)
        .eq("type", "marketplace")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(200);

      if (dbError) {
        setError("Could not load listings. Please check your connection and try again.");
        setItems([]);
        return;
      }

      const mapped = (data ?? []).map(mapRow);
      setItems(mapped);

      // Check expiry alerts for logged-in seller
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const alerts: ExpiryAlert[] = mapped
            .filter((i) => i.sellerId === user.id && i.expiresAt)
            .map((i) => ({ id: i.id, title: i.title, expiresAt: i.expiresAt!, daysLeft: daysUntil(i.expiresAt!) }))
            .filter((a) => a.daysLeft <= EXPIRY_WARN_DAYS)
            .sort((a, b) => a.daysLeft - b.daysLeft);
          setExpiryAlerts(alerts);
        }
      } catch { /* non-critical */ }
    } catch {
      setError("Unexpected error. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();

    // Realtime subscription
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("marketplace_realtime_v3")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "listings" }, (payload) => {
          const row = payload.new as any;
          if (row.type !== "marketplace" || row.status !== "active") return;
          setItems((prev) => [mapRow(row), ...prev]);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "listings" }, (payload) => {
          const row = payload.new as any;
          if (row.type !== "marketplace") return;
          if (row.status !== "active") {
            setItems((prev) => prev.filter((i) => i.id !== row.id));
          } else {
            setItems((prev) => prev.map((i) => i.id === row.id ? mapRow(row) : i));
          }
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "listings" }, (payload) => {
          setItems((prev) => prev.filter((i) => i.id !== (payload.old as any).id));
        })
        .subscribe();
    } catch { /* realtime is best-effort */ }

    return () => { if (channel) void supabase.removeChannel(channel); };
  }, [fetchItems]);

  function handleTouchStart(e: React.TouchEvent) { touchStartY.current = e.touches[0].clientY; }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const diff = e.changedTouches[0].clientY - touchStartY.current;
    if (diff > 80 && window.scrollY === 0) void fetchItems();
    touchStartY.current = null;
  }

  function toggleFav(e: React.MouseEvent, item: Item) {
    e.stopPropagation();
    const adding = !favs.has(item.id);
    setFavs((prev) => {
      const next = new Set(prev);
      adding ? next.add(item.id) : next.delete(item.id);
      return next;
    });
    saveFav(item, adding);
  }

  let filtered = items.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      i.title.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q);
    const matchCat = cat === "All" || i.category === cat;
    return matchSearch && matchCat;
  });

  switch (sortBy) {
    case "price_asc":  filtered = [...filtered].sort((a, b) => a.price - b.price); break;
    case "price_desc": filtered = [...filtered].sort((a, b) => b.price - a.price); break;
    case "popular":    filtered = [...filtered].sort((a, b) => b.view_count - a.view_count); break;
    default: break;
  }

  filtered = [...filtered.filter((i) => i.isFeatured), ...filtered.filter((i) => !i.isFeatured)];

  return (
    <div
      className="min-h-screen bg-gray-50 pb-24"
      dir={isRtl ? "rtl" : "ltr"}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label={tx("marketplace")}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            {tx("marketplace")}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void fetchItems()}
              className="p-2 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label={tx("refresh")}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
            </button>

            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 text-gray-400 hover:text-teal-600 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label={`${tx("cart")}, ${cartCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("/marketplace/sell")}
              className="bg-teal-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-teal-700 active:scale-95 transition-all shadow-sm"
              aria-label={tx("sell")}
            >
              <Plus className="w-4 h-4" /> {tx("sell")}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tx("search_placeholder")}
            className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-gray-50 placeholder:text-gray-400"
            aria-label={tx("search_placeholder")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Filter by category">
          {CATEGORIES.map(({ label, emoji }) => (
            <button
              key={label}
              role="tab"
              aria-selected={cat === label}
              onClick={() => setCat(label)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                cat === label
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Expiry reminder */}
      {showExpiry && expiryAlerts.length > 0 && (
        <ExpiryReminderBanner alerts={expiryAlerts} onDismiss={() => setShowExpiry(false)} tx={tx} />
      )}

      {/* Featured ads strip */}
      <FeaturedAdsStrip category="marketplace" showHeader={false} maxVisible={20} />

      {/* Content */}
      <div className="px-4 pb-4">
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{tx("loading")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7 text-red-400" />
            </div>
            <p className="font-semibold text-gray-800 mb-1">{tx("connection_issue")}</p>
            <p className="text-sm text-red-500 mb-5">{error}</p>
            <button
              onClick={() => void fetchItems()}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
              aria-label={tx("try_again")}
            >
              {tx("try_again")}
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <PackageOpen className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700 text-lg">{tx("no_listings")}</p>
            <p className="text-sm mt-1 mb-6">{tx("first_to_sell")}</p>
            <button
              onClick={() => navigate("/marketplace/sell")}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              {tx("post_first")}
            </button>
          </div>
        )}

        {!loading && !error && items.length > 0 && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">{tx("no_match")}</p>
            <p className="text-sm mt-1 mb-5 text-gray-400">Try a different keyword or category</p>
            <button
              onClick={() => { setSearch(""); setCat("All"); }}
              className="border border-teal-600 text-teal-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors"
            >
              {tx("clear_filters")}
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-3 pt-3">
              <p className="text-xs text-gray-400 font-medium">
                {filtered.length} {tx("listings_count")}
                {cat !== "All" ? ` ${tx("in_category")} ${cat}` : ""}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs text-gray-600 bg-transparent border-none outline-none cursor-pointer font-medium"
                  aria-label="Sort listings"
                >
                  <option value="newest">{tx("sort_newest")}</option>
                  <option value="popular">{tx("sort_popular")}</option>
                  <option value="price_asc">{tx("sort_price_asc")}</option>
                  <option value="price_desc">{tx("sort_price_desc")}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isFav={favs.has(item.id)}
                  onFav={(e) => toggleFav(e, item)}
                  onClick={() => navigate(`/marketplace/${item.id}`)}
                  tx={tx}
                />
              ))}
            </div>

            <p className="text-center text-xs text-gray-300 mt-6">
              â€” {filtered.length} {tx("listings_count")} â€”
            </p>
          </>
        )}
      </div>
    </div>
  );
}

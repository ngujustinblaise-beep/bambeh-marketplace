/**
 * src/pages/MyListings.tsx — Bambeh Marketplace
 *
 * Seller's personal dashboard showing ALL their listings across every category.
 * Shows:
 *  - View count (how many times each ad was seen)
 *  - Notification count badge
 *  - Status (active / pending / expired)
 *  - Quick links to edit / delete
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye, Package, Loader2, RefreshCw, ArrowLeft,
  Leaf, Home, Car, Briefcase, Wrench, ArrowLeftRight,
  TrendingUp, Clock, CheckCircle, XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/App";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MyListing {
  id: string;
  title: string;
  type: string;       // 'marketplace' | 'service' | 'vehicle' | 'rental' | 'job'
  category: string;
  status: string;     // 'active' | 'pending' | 'expired' | 'sold'
  view_count: number;
  created_at: string;
  price?: number;
  location?: string;
  table: string;      // which DB table this came from
}

// ── Icon helper ────────────────────────────────────────────────────────────────

function ListingIcon({ type }: { type: string }) {
  const cls = "w-5 h-5";
  if (type === "farm")        return <Leaf       className={`${cls} text-green-600`} />;
  if (type === "rental")      return <Home       className={`${cls} text-orange-500`} />;
  if (type === "vehicle")     return <Car        className={`${cls} text-green-700`} />;
  if (type === "job")         return <Briefcase  className={`${cls} text-teal-600`} />;
  if (type === "service")     return <Wrench     className={`${cls} text-purple-600`} />;
  if (type === "exchange")    return <ArrowLeftRight className={`${cls} text-blue-600`} />;
  return <Package className={`${cls} text-gray-500`} />;
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const map: Record<string, string> = {
    active:  "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    expired: "bg-red-100 text-red-600",
    sold:    "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {statusLabel(status, t)}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

function filterLabel(f: string, t: (k: string) => string) {
  return t("myListings.filter." + f);
}

function statusLabel(status: string, t: (k: string) => string) {
  const known = ["active", "pending", "expired", "sold"];
  return known.includes(status) ? t("myListings.status." + status) : status;
}
export default function MyListings() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [listings,    setListings]    = useState<MyListing[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeFilter,setActiveFilter]= useState<string>("all");
  const [userId,      setUserId]      = useState<string | null>(null);

  // ── Fetch all listings from all tables ──────────────────────────────────────

  async function fetchAll() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const all: MyListing[] = [];

    // 1. Main listings table (marketplace, service, vehicle, rental, job)
    const { data: mainRows } = await supabase
      .from("listings")
      .select("id, title, type, category, status, view_count, created_at, price, location")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    (mainRows || []).forEach(r => all.push({
      id:         r.id,
      title:      r.title,
      type:       r.type ?? "marketplace",
      category:   r.category ?? "",
      status:     r.status ?? "active",
      view_count: r.view_count ?? 0,
      created_at: r.created_at,
      price:      r.price,
      location:   r.location,
      table:      "listings",
    }));

    // 2. Farm products table
    const { data: farmRows } = await supabase
      .from("farm_products")
      .select("id, title, category, is_available, view_count, created_at, price_per_unit_xaf, location")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    (farmRows || []).forEach(r => all.push({
      id:         r.id,
      title:      r.title,
      type:       "farm",
      category:   r.category ?? "Produce",
      status:     r.is_available ? "active" : "expired",
      view_count: r.view_count ?? 0,
      created_at: r.created_at,
      price:      r.price_per_unit_xaf,
      location:   r.location,
      table:      "farm_products",
    }));

    // 3. Exchange items table
    const { data: exchangeRows } = await supabase
      .from("exchange_items")
      .select("id, title, category, status, view_count, created_at, location")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    (exchangeRows || []).forEach(r => all.push({
      id:         r.id,
      title:      r.title,
      type:       "exchange",
      category:   r.category ?? "Exchange",
      status:     r.status ?? "active",
      view_count: r.view_count ?? 0,
      created_at: r.created_at,
      location:   r.location,
      table:      "exchange_items",
    }));

    setListings(all);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  // ── Derived stats ────────────────────────────────────────────────────────────

  const totalViews  = listings.reduce((sum, l) => sum + (l.view_count ?? 0), 0);
  const activeCount = listings.filter(l => l.status === "active").length;
  const filters     = ["all", "active", "marketplace", "farm", "vehicle", "rental", "job", "service", "exchange"];

  const filtered = listings.filter(l => {
    if (activeFilter === "all")    return true;
    if (activeFilter === "active") return l.status === "active";
    return l.type === activeFilter;
  });

  // ── Navigate to correct detail page ─────────────────────────────────────────

  function goToListing(l: MyListing) {
    const routes: Record<string, string> = {
      marketplace: "/marketplace/",
      farm:        "/farm-fresh/",
      vehicle:     "/vehicles/",
      rental:      "/rentals/",
      job:         "/jobs/",
      service:     "/services/",
      exchange:    "/exchange/",
    };
    navigate((routes[l.type] ?? "/marketplace/") + l.id);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t("myListings.title")}</h1>
          <button onClick={fetchAll} className="ml-auto p-2 rounded-xl hover:bg-gray-100">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-teal-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-teal-700">{listings.length}</p>
            <p className="text-xs text-teal-600">{t("myListings.totalAds")}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{activeCount}</p>
            <p className="text-xs text-green-600">{t("myListings.active")}</p>
          </div>
          {/* ✅ Total ad views — the big number */}
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-blue-600">{t("myListings.totalViews")}</p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors
                ${activeFilter === f ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {filterLabel(f, t)}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">

        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{t("myListings.loading")}</p>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">{t("myListings.noneYet")}</p>
            <p className="text-sm mt-1">{t("myListings.startSelling")}</p>
            <button onClick={() => navigate("/marketplace/sell")}
              className="mt-5 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
              {t("myListings.postFirst")}
            </button>
          </div>
        )}

        {!loading && filtered.length === 0 && listings.length > 0 && (
          <p className="text-center text-sm text-gray-500 py-8">{t("myListings.noneInCategory")}</p>
        )}

        {!loading && filtered.map(l => (
          <div key={`${l.table}-${l.id}`} onClick={() => goToListing(l)}
            className="bg-white rounded-2xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-50 border flex items-center justify-center flex-shrink-0">
                <ListingIcon type={l.type} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">{l.title}</h3>
                  <StatusBadge status={l.status} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{l.type} · {l.category}</p>
                {l.price && <p className="text-xs text-teal-600 font-semibold mt-0.5">{l.price.toLocaleString()} XAF</p>}
                {l.location && <p className="text-xs text-gray-400 mt-0.5">📍 {l.location}</p>}
              </div>
            </div>

            {/* ✅ View count — prominent green display for seller */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-1.5">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-700">{l.view_count ?? 0}</span>
                <span className="text-gray-500 text-xs">{t("myListings.adViews")}</span>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

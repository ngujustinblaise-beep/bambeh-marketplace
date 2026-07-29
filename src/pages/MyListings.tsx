// BAMBEH_DEPLOY_TOKEN__MYLISTINGS_FIX116_CLEAN
/**
 * src/pages/MyListings.tsx — Bambeh Marketplace
 *
 * Seller's personal dashboard showing ALL their listings across every category.
 * Shows:
 *  - View count (how many times each ad was seen)
 *  - Notification count badge
 *  - Status (active / pending / expired)
 *  - Quick links to edit / delete
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Package,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Leaf,
  Home,
  Car,
  Briefcase,
  Wrench,
  ArrowLeftRight,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import DeleteListingButton, { type ListingType } from "@/components/listings/DeleteListingButton";
import { useLanguage } from "@/contexts/LanguageContext";

interface MyListing {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  view_count: number;
  created_at: string;
  price?: number;
  location?: string;
  table: string;
}

function ListingIcon({ type }: { type: string }) {
  const cls = "w-5 h-5";
  if (type === "farm") return <Leaf className={`${cls} text-green-600`} />;
  if (type === "rental") return <Home className={`${cls} text-orange-500`} />;
  if (type === "vehicle") return <Car className={`${cls} text-green-700`} />;
  if (type === "job") return <Briefcase className={`${cls} text-teal-600`} />;
  if (type === "service") return <Wrench className={`${cls} text-purple-600`} />;
  if (type === "exchange") return <ArrowLeftRight className={`${cls} text-blue-600`} />;
  return <Package className={`${cls} text-gray-500`} />;
}

function statusLabel(status: string, t: (k: string) => string) {
  const known = ["active", "pending", "expired", "sold"];
  return known.includes(status) ? t("myListings.status." + status) : status;
}

function filterLabel(f: string, t: (k: string) => string) {
  return t("myListings.filter." + f);
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    expired: "bg-red-100 text-red-600",
    sold: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {statusLabel(status, t)}
    </span>
  );
}

export default function MyListings() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  async function fetchAll() {
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const user = authData?.user;
      if (!user) {
        setListings([]);
        return;
      }

      const all: MyListing[] = [];

      const { data: mainRows, error: mainError } = await supabase
        .from("listings")
        .select("id, title, type, category, status, view_count, created_at, price, location")
        .eq("user_id", user.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (mainError) throw mainError;

      (mainRows || []).forEach((r: any) =>
        all.push({
          id: r.id,
          title: r.title,
          type: r.type ?? "marketplace",
          category: r.category ?? "",
          status: r.status ?? "active",
          view_count: r.view_count ?? 0,
          created_at: r.created_at,
          price: r.price,
          location: r.location,
          table: "listings",
        })
      );

      // FIX226 - hide produce the farmer has already deleted. Tries the new
      // `status` column first and falls back to the old shape if the migration
      // has not been run, so this can never blank out the farm section.
      let farmRows: any[] | null = null;
      const farmTry = await supabase
        .from("farm_products")
        .select("id, title, category, is_available, view_count, created_at, price_per_unit_xaf, location, status")
        .eq("seller_id", user.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });
      if (farmTry.error) {
        console.warn("[MyListings] farm_products status column missing, using legacy query:", farmTry.error.message);
        const farmLegacy = await supabase
          .from("farm_products")
          .select("id, title, category, is_available, view_count, created_at, price_per_unit_xaf, location")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });
        if (farmLegacy.error) throw farmLegacy.error;
        farmRows = farmLegacy.data;
      } else {
        farmRows = farmTry.data;
      }

      (farmRows || []).forEach((r: any) =>
        all.push({
          id: r.id,
          title: r.title,
          type: "farm",
          category: r.category ?? "Produce",
          status: r.is_available ? "active" : "expired",
          view_count: r.view_count ?? 0,
          created_at: r.created_at,
          price: r.price_per_unit_xaf,
          location: r.location,
          table: "farm_products",
        })
      );

      const { data: exchangeRows, error: exchangeError } = await supabase
        .from("exchange_items")
        .select("id, title, category, status, view_count, created_at, location")
        .eq("user_id", user.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (exchangeError) throw exchangeError;

      (exchangeRows || []).forEach((r: any) =>
        all.push({
          id: r.id,
          title: r.title,
          type: "exchange",
          category: r.category ?? "Exchange",
          status: r.status ?? "active",
          view_count: r.view_count ?? 0,
          created_at: r.created_at,
          location: r.location,
          table: "exchange_items",
        })
      );

      setListings(all);
    } catch (err: any) {
      setListings([]);
      setError(err?.message || "Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const totalViews = listings.reduce((sum, l) => sum + (l.view_count ?? 0), 0);
  const activeCount = listings.filter(l => l.status === "active").length;
  const filters = ["all", "active", "marketplace", "farm", "vehicle", "rental", "job", "service", "exchange"];

  const filtered = listings.filter(l => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return l.status === "active";
    return l.type === activeFilter;
  });

  function goToListing(l: MyListing) {
    const routes: Record<string, string> = {
      marketplace: "/marketplace/",
      farm: "/farm-fresh/",
      vehicle: "/vehicles/",
      rental: "/rentals/",
      job: "/jobs/",
      service: "/services/",
      exchange: "/exchange/",
    };
    navigate((routes[l.type] ?? "/marketplace/") + l.id);
  }

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{t("myListings.title")}</h1>
          <button onClick={fetchAll} className="ml-auto p-2 rounded-xl hover:bg-gray-100" aria-label="Refresh listings">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-teal-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-teal-700">{listings.length}</p>
            <p className="text-xs text-teal-600">{t("myListings.totalAds")}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{activeCount}</p>
            <p className="text-xs text-green-600">{t("myListings.active")}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-blue-600">{t("myListings.totalViews")}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                activeFilter === f ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filterLabel(f, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3" role="status" aria-live="polite">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{t("myListings.loading")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-4 text-center" role="alert">
            <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-2" />
            <p className="font-semibold text-gray-800">{t("myListings.errorTitle")}</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <button
              onClick={fetchAll}
              className="mt-4 inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              {t("myListings.retry")}
            </button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">{t("myListings.noneYet")}</p>
            <p className="text-sm mt-1">{t("myListings.startSelling")}</p>
            <button
              onClick={() => navigate("/marketplace/sell")}
              className="mt-5 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              {t("myListings.postFirst")}
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && listings.length > 0 && (
          <p className="text-center text-sm text-gray-500 py-8">{t("myListings.noneInCategory")}</p>
        )}

        {!loading && !error && (
          <div className="flex justify-end mb-1">
            <Link to="/trash" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" /> Trash
            </Link>
          </div>
        )}
        {!loading && !error && filtered.map(l => (
          <div
            key={`${l.table}-${l.id}`}
            onClick={() => goToListing(l)}
            className="bg-white rounded-2xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border flex items-center justify-center flex-shrink-0">
                <ListingIcon type={l.type} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">{l.title}</h3>
                  <StatusBadge status={l.status} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{l.type} · {l.category}</p>
                {l.price !== undefined && <p className="text-xs text-teal-600 font-semibold mt-0.5">{l.price.toLocaleString()} XAF</p>}
                {l.location && <p className="text-xs text-gray-400 mt-0.5">📍 {l.location}</p>}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-1.5">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="font-bold text-green-700">{l.view_count ?? 0}</span>
                <span className="text-gray-500 text-xs">{t("myListings.adViews")}</span>
              </div>
              <p className="text-xs text-gray-400">
                {new Date(l.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* FIX226 - farm produce used to be excluded here. It no longer is. */}
            {true && (
              <div className="mt-2 flex justify-end" onClick={(e) => e.stopPropagation()}>
                <DeleteListingButton
                  id={l.id}
                  type={l.type as ListingType}
                  variant="button"
                  onDeleted={(delId) => setListings((xs) => xs.filter((x) => x.id !== delId))}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
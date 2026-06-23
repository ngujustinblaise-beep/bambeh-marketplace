import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

interface CachedListing {
  id: string;
  title: string;
  price: number;
  category: string;
  cachedAt: number;
}

const CACHE_KEY = "Bambeh_offline_listings";
const SYNCED_KEY = "Bambeh_offline_lastSynced";

function loadCache(): { listings: CachedListing[]; lastSynced: number | null } {
  const lang = useLang();
  const isRtl = lang === "ar";
  try {
    return {
      listings: JSON.parse(localStorage.getItem(CACHE_KEY) || "[]") as CachedListing[],
      lastSynced: Number(localStorage.getItem(SYNCED_KEY)) || null,
    };
  } catch (e) {
    return { listings: [], lastSynced: null };
  }
}

function timeAgo(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  return Math.floor(m / 60) + " hr ago";
}

const OfflineModePage: React.FC = () => {
  const [cache, setCache] = useState(loadCache);
  const [isOnline, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(SYNCED_KEY);
    setCache({ listings: [], lastSynced: null });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div
        className={
          "flex items-center gap-3 p-4 rounded-xl mb-6 " +
          (isOnline
            ? "bg-green-50 border border-green-200"
            : "bg-orange-50 border border-orange-200")
        }>
        <div className="flex-1">
          <p
            className={
              "font-semibold text-sm " +
              (isOnline ? "text-green-800" : "text-orange-800")
            }
          >
            {isOnline ? "You are back online!" : "You are offline"}
          </p>
          <p
            className={
              "text-xs " + (isOnline ? "text-green-700" : "text-orange-700")
            }
          >
            {isOnline ? "All features available." : "Showing cached data only."}
          </p>
        </div>
        {isOnline && (
          <Link
            to="/"
      className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-full font-medium"
          >
            Go Home
          </Link>
        )}
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Offline Mode</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {cache.lastSynced
              ? "Last synced: " + timeAgo(cache.lastSynced)
              : "No cached data yet"}
          </p>
        </div>
        {isOnline && cache.listings.length > 0 && (
          <button
            onClick={clearCache}
            className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            Clear Cache
          </button>
        )}
      </div>
      {cache.listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium text-gray-600 text-sm">
            No cached listings
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Browse the marketplace online to cache listings here
          </p>
          {isOnline && (
            <Link
              to="/marketplace"
      className="mt-4 inline-block text-sm text-teal-600 font-medium hover:underline"
            >
              Go to Marketplace
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {cache.listings.map((listing: CachedListing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">
                  {listing.title}
                </p>
                <p className="text-xs text-gray-400">{listing.category}</p>
                <p className="text-sm font-bold text-teal-600 mt-1">
                  {listing.price.toLocaleString()} XAF
                </p>
              </div>
              <p className="text-xs text-gray-300 shrink-0">
                {timeAgo(listing.cachedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 text-sm mb-2">
          How Offline Mode Works
        </h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          Browse Bambeh while online to cache listings automatically. When you
          lose internet, visit this page to see your saved data. Posting,
          paying, and messaging require an internet connection.
        </p>
      </div>
    </div>
  );

}
export default OfflineModePage;





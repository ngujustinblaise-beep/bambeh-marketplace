/**
 * src/components/FeaturedAdsBar.tsx � Bambeh Featured Listings Strip
 *
 * Drop this inside your MainLayout (above the tab bar or below the header).
 * It pulls is_featured=true listings from Supabase and scrolls horizontally.
 *
 * Usage in MainLayout.tsx (or equivalent):
 *   import FeaturedAdsBar from "@/components/FeaturedAdsBar";
 *   ...
 *   <FeaturedAdsBar />
 *
 * To mark a listing as featured, run in Supabase SQL editor:
 *   UPDATE listings SET is_featured = true WHERE id = '<listing-uuid>';
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FeaturedItem {
  id: string;
  title: string;
  price: number;
  location: string;
  image?: string;
  category: string;
}

function extractImage(row: any): string | undefined {
  if (Array.isArray(row.images) && row.images.length > 0) {
    const first = row.images[0];
    return typeof first === "string" ? first : first?.url;
  }
  return row.extra?.image_url;
}

export default function FeaturedAdsBar() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FeaturedItem[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, location, images, extra, category")
        .eq("type", "marketplace")
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setItems(
          data.map((row) => ({
            id:       row.id,
            title:    row.title,
            price:    row.price ?? 0,
            location: row.location ?? "",
            image:    extractImage(row),
            category: row.category ?? "",
          }))
        );
      }
    }
    void fetchFeatured();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          Featured
        </span>
      </div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/marketplace/${item.id}`)}
            className="flex-shrink-0 w-28 text-left group"
          >
            <div className="w-28 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center mb-1 relative border border-gray-100 group-hover:border-teal-300 transition-colors">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <ShoppingBag className="w-6 h-6 text-teal-200" />
              )}
              <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1 py-0.5 rounded-full flex items-center gap-0.5">
                <Zap className="w-2 h-2" /> AD
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-teal-600 transition-colors">
              {item.title}
            </p>
            <p className="text-xs text-teal-600 font-bold">
              {item.price.toLocaleString("fr-CM")} XAF
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}






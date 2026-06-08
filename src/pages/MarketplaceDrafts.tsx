/**
 * src/pages/MarketplaceDrafts.tsx — Bambeh Marketplace
 *
 * REWRITE — June 2026
 *  ✅ Fetches real draft listings from Supabase for the logged-in seller
 *  ✅ Allows editing and activating drafts
 *  ✅ No stub "loading..." placeholder
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, CheckCircle, Loader2, PackageOpen, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLang, t } from "@/hooks/useAppLang";

interface Draft {
  id: string;
  title: string;
  price: number;
  category: string;
  image?: string;
  createdAt: string;
}

export default function MarketplaceDrafts() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate = useNavigate();
  const [drafts,  setDrafts]  = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please log in to view drafts."); setLoading(false); return; }

      const { data, error: dbErr } = await supabase
        .from("listings")
        .select("id, title, price, category, images, extra, created_at")
        .eq("type", "marketplace")
        .eq("seller_id", user.id)
        .eq("status", "draft")
        .order("created_at", { ascending: false });

      if (dbErr) { setError("Failed to load drafts."); return; }

      setDrafts((data ?? []).map((row: any) => {
        let image: string | undefined;
        if (Array.isArray(row.images) && row.images.length > 0) {
          const f = row.images[0];
          image = typeof f === "string" ? f : (f?.url ?? f?.thumbnail_url);
        } else { image = row.extra?.image_url; }
        return { id: row.id, title: row.title ?? "(Untitled)", price: row.price ?? 0, category: row.category ?? "Other", image, createdAt: row.created_at };
      }));
    } catch {
      setError("Unexpected error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function publishDraft(id: string) {
    const { error: err } = await supabase
      .from("listings")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (!err) setDrafts((d) => d.filter((i) => i.id !== id));
  }

  async function deleteDraft(id: string) {
    setDeleting(id);
    const { error: err } = await supabase.from("listings").delete().eq("id", id);
    if (!err) setDrafts((d) => d.filter((i) => i.id !== id));
    setDeleting(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors" aria-label="Go back">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Drafts</h1>
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">Loading drafts…</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={() => void load()} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Retry</button>
          </div>
        )}

        {!loading && !error && drafts.length === 0 && (
          <div className="text-center py-20">
            <PackageOpen className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">No drafts saved</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Items you save as drafts will appear here</p>
            <button onClick={() => navigate("/marketplace/sell")} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Create a listing</button>
          </div>
        )}

        {!loading && !error && drafts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium">{drafts.length} draft{drafts.length !== 1 ? "s" : ""}</p>
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {draft.image ? (
                    <img src={draft.image} alt={draft.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🛍️</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{draft.title}</p>
                  <p className="text-xs text-teal-600 font-bold">{draft.price.toLocaleString("fr-CM")} XAF</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(draft.createdAt).toLocaleDateString("fr-CM")}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/marketplace/edit/${draft.id}`)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    aria-label="Edit draft"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => void publishDraft(draft.id)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
                    aria-label="Publish draft"
                  >
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                  </button>
                  <button
                    onClick={() => void deleteDraft(draft.id)}
                    disabled={deleting === draft.id}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-50"
                    aria-label="Delete draft"
                  >
                    {deleting === draft.id
                      ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                      : <Trash2 className="w-4 h-4 text-red-400" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

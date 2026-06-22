/**
 * src/pages/MarketplaceDrafts.tsx â€” Bambeh Marketplace
 *
 * FIXES â€” June 2026
 *  âœ… FIX 1: useLang() / isRtl were declared but never used â€” removed to prevent
 *            potential hook ordering issues if the file is hot-reloaded.
 *  âœ… FIX 2: All UI strings translated via inline TR map
 *  âœ… FIX 3: publishDraft now sets expires_at when activating a draft
 *  âœ… Fetches real draft listings from Supabase for the logged-in seller
 *  âœ… Allows editing and activating drafts
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Trash2, CheckCircle, Loader2, PackageOpen, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

// â”€â”€â”€ i18n â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Lang = "en" | "fr" | "ha" | "ar" | "pcm" | "ff";
const TR: Record<string, Record<Lang, string>> = {
  my_drafts:      { en: "My Drafts", fr: "Mes brouillons", ha: "Daftarena", ar: "Ù…Ø³ÙˆØ¯Ø§ØªÙŠ", pcm: "My Drafts", ff: "Draftji am" },
  loading:        { en: "Loading draftsâ€¦", fr: "Chargementâ€¦", ha: "Ana lodawaâ€¦", ar: "Ø¬Ø§Ø± Ø§Ù„ØªØ­Ù…ÙŠÙ„â€¦", pcm: "Loadingâ€¦", ff: "Naatirdeâ€¦" },
  retry:          { en: "Retry", fr: "RÃ©essayer", ha: "Sake", ar: "Ø£Ø¹Ø¯ Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø©", pcm: "Try again", ff: "Artu jeer" },
  no_drafts:      { en: "No drafts saved", fr: "Aucun brouillon", ha: "Babu daftar", ar: "Ù„Ø§ Ù…Ø³ÙˆØ¯Ø§Øª", pcm: "No draft dey", ff: "Alaa draftji" },
  drafts_hint:    { en: "Items you save as drafts will appear here", fr: "Les articles sauvegardÃ©s en brouillon apparaÃ®tront ici", ha: "Abubuwan da kuka adana a matsayin daftari za su bayyana anan", ar: "Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø§Ù„Ø¹Ù†Ø§ØµØ± Ø§Ù„ØªÙŠ ØªØ­Ã™ÂØ¸Ù‡Ø§ ÙƒÙ…Ø³ÙˆØ¯Ø§Øª", pcm: "Item wey you save as draft go show here", ff: "Kala ndema e draft ngo jeyaa wa" },
  create:         { en: "Create a listing", fr: "CrÃ©er une annonce", ha: "Æ˜irÆ™iri jeri", ar: "Ø¥Ù†Ø´Ø§Ø¡ Ø¥Ø¹Ù„Ø§Ù†", pcm: "Create listing", ff: "Newnin nde" },
  drafts_count:   { en: "drafts", fr: "brouillons", ha: "daftar", ar: "Ù…Ø³ÙˆØ¯Ø§Øª", pcm: "draft", ff: "draftji" },
  draft_one:      { en: "draft", fr: "brouillon", ha: "daftar É—aya", ar: "Ù…Ø³ÙˆØ¯Ø©", pcm: "draft", ff: "draft" },
  login_required: { en: "Please log in to view drafts.", fr: "Connectez-vous pour voir les brouillons.", ha: "Da fatan a shiga don ganin daftari.", ar: "Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù„Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø³ÙˆØ¯Ø§Øª.", pcm: "Please login to see drafts.", ff: "Newnin e nder ngam yiyde draftji." },
  failed:         { en: "Failed to load drafts.", fr: "Ã‰chec du chargement.", ha: "An kasa lodawa.", ar: "Ã™ÂØ´Ù„ Ø§Ù„ØªØ­Ù…ÙŠÙ„.", pcm: "Loading fail.", ff: "Naatirde waÉ—aani." },
  unexpected:     { en: "Unexpected error.", fr: "Erreur inattendue.", ha: "Kuskure da ba a tsammani.", ar: "Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹.", pcm: "Unexpected error.", ff: "Juumre anndaande." },
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

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Draft {
  id: string;
  title: string;
  price: number;
  category: string;
  image?: string;
  createdAt: string;
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function MarketplaceDrafts() {
  const navigate = useNavigate();
  const [drafts,   setDrafts]   = useState<Draft[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError(tx("login_required")); setLoading(false); return; }

      const { data, error: dbErr } = await supabase
        .from("listings")
        .select("id, title, price, category, images, extra, created_at")
        .eq("type", "marketplace")
        .eq("seller_id", user.id)
        .eq("status", "draft")
        .order("created_at", { ascending: false });

      if (dbErr) { setError(tx("failed")); return; }

      setDrafts((data ?? []).map((row: any) => {
        let image: string | undefined;
        if (Array.isArray(row.images) && row.images.length > 0) {
          const f = row.images[0];
          image = typeof f === "string" ? f : (f?.url ?? f?.thumbnail_url);
        } else { image = row.extra?.image_url; }
        return { id: row.id, title: row.title ?? "(Untitled)", price: row.price ?? 0, category: row.category ?? "Other", image, createdAt: row.created_at };
      }));
    } catch {
      setError(tx("unexpected"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function publishDraft(id: string) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: err } = await supabase
      .from("listings")
      .update({ status: "active", updated_at: new Date().toISOString(), expires_at: expiresAt })
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
          <h1 className="text-lg font-bold text-gray-900">{tx("my_drafts")}</h1>
        </div>
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-teal-600" />
            <p className="text-sm text-gray-500">{tx("loading")}</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button onClick={() => void load()} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">{tx("retry")}</button>
          </div>
        )}

        {!loading && !error && drafts.length === 0 && (
          <div className="text-center py-20">
            <PackageOpen className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">{tx("no_drafts")}</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">{tx("drafts_hint")}</p>
            <button onClick={() => navigate("/marketplace/sell")} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">{tx("create")}</button>
          </div>
        )}

        {!loading && !error && drafts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium">
              {drafts.length} {drafts.length !== 1 ? tx("drafts_count") : tx("draft_one")}
            </p>
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {draft.image ? (
                    <img src={draft.image} alt={draft.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">ðŸ›ï¸</div>
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





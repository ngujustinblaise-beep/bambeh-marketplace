/**
 * PostFeaturedAdForm.tsx â€â€ Bambeh Marketplace
 * FILE LOCATION: src/components/ads/PostFeaturedAdForm.tsx
 *
 * Vendor-facing form to post a new featured ad to the `featured_ads` table.
 * Can be embedded in any vendor page or modal.
 *
 * FEATURES:
 *  - Multilingual title + description fields (all 6 Bambeh languages)
 *  - Category selector matching the routing categories
 *  - Optional price, image URL, listing path
 *  - Live preview card before submission
 *  - Supabase insert with vendor_id from AuthContext
 *
 * USAGE:
 *   <PostFeaturedAdForm onSuccess={() => setModalOpen(false)} />
 *
 * © 2026 BAMBEH SARL. All rights reserved.
 */

import React, { useState } from "react";
import { useLanguage } from "@/App";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import type { AdCategory } from "@/hooks/useFeaturedAds";

// ââ€€ââ€€ââ€€ Constants ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€

const CATEGORIES: { value: AdCategory; label: string }[] = [
  { value: "marketplace",   label: "Marketplace"   },
  { value: "jobs",          label: "Jobs"           },
  { value: "services",      label: "Services"       },
  { value: "rentals",       label: "Rentals"        },
  { value: "vehicles",      label: "Vehicles"       },
  { value: "exchange",      label: "Exchange"       },
  { value: "farm-fresh",    label: "Farm Fresh"     },
  { value: "flash-deals",   label: "Flash Deals"    },
  { value: "group-buying",  label: "Group Buying"   },
  { value: "general",       label: "General"        },
];

const LANGUAGES = [
  { code: "en",  label: "English"   },
  { code: "fr",  label: "Français"  },
  { code: "ha",  label: "Hausa"     },
  { code: "ar",  label: "العربية"  },
  { code: "pcm", label: "Pidgin"    },
  { code: "ful", label: "Fulfulde"  },
];

// ââ€€ââ€€ââ€€ Form state type ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€

interface FormState {
  category:     AdCategory;
  title:        Record<string, string>;
  description:  Record<string, string>;
  price:        string;
  image_url:    string;
  listing_path: string;
}

const EMPTY_FORM: FormState = {
  category:     "general",
  title:        {},
  description:  {},
  price:        "",
  image_url:    "",
  listing_path: "",
};

// ââ€€ââ€€ââ€€ Component ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€ââ€€

interface PostFeaturedAdFormProps {
  onSuccess?: () => void;
  onCancel?:  () => void;
}

export const PostFeaturedAdForm: React.FC<PostFeaturedAdFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const { language }    = useLanguage() as { language: string; t: (k: string) => string };

  const [form,       setForm]       = useState<FormState>(EMPTY_FORM);
  const [activeLang, setActiveLang] = useState<string>(language ?? "en");
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const setTitle = (lang: string, value: string) =>
    setForm((f) => ({ ...f, title: { ...f.title, [lang]: value } }));

  const setDesc = (lang: string, value: string) =>
    setForm((f) => ({ ...f, description: { ...f.description, [lang]: value } }));

  const handleSubmit = async () => {
    if (!currentUser) { setError("Please log in first."); return; }

    const enTitle = form.title["en"] || Object.values(form.title).find(Boolean);
    if (!enTitle) { setError("Please enter at least an English title."); return; }

    setLoading(true);
    setError(null);

    try {
      const vendorName: string =
        (currentUser as { displayName?: string; username?: string; email?: string })
          .displayName ||
        (currentUser as { username?: string }).username ||
        (currentUser as { email?: string }).email ||
        "Vendor";

      const { error: sbErr } = await supabase.from("featured_ads").insert({
        vendor_id:    currentUser.id,
        vendor_name:  vendorName,
        category:     form.category,
        title:        form.title,
        description:  form.description,
        price:        form.price ? parseFloat(form.price) : null,
        image_url:    form.image_url  || null,
        listing_path: form.listing_path || null,
        is_active:    true,
        is_promoted:  false,
      });

      if (sbErr) throw sbErr;

      setSuccess(true);
      setForm(EMPTY_FORM);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post ad.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 max-w-lg mx-auto">
      <h2 className="text-base font-bold text-gray-800 mb-4">Post a Featured Ad</h2>

      {/* Category */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as AdCategory }))}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Language tabs */}
      <div className="flex gap-1 flex-wrap mb-3">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setActiveLang(l.code)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
              activeLang === l.code
                ? "bg-teal-600 text-white border-teal-600"
                : "border-gray-200 text-gray-600 hover:border-teal-300"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Title */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">
          Title ({LANGUAGES.find((l) => l.code === activeLang)?.label})
        </label>
        <input
          type="text"
          value={form.title[activeLang] ?? ""}
          onChange={(e) => setTitle(activeLang, e.target.value)}
          placeholder={`Ad title in ${LANGUAGES.find((l) => l.code === activeLang)?.label}…`}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">
          Description ({LANGUAGES.find((l) => l.code === activeLang)?.label})
        </label>
        <textarea
          rows={3}
          value={form.description[activeLang] ?? ""}
          onChange={(e) => setDesc(activeLang, e.target.value)}
          placeholder="Short description of the ad…"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />
      </div>

      {/* Price */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Price (FCFA, optional)</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="e.g. 5000"
          min="0"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Image URL */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Image URL (optional)</label>
        <input
          type="url"
          value={form.image_url}
          onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
          placeholder="https://…"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Listing path */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-600 mb-1 block">Link to listing (optional)</label>
        <input
          type="text"
          value={form.listing_path}
          onChange={(e) => setForm((f) => ({ ...f, listing_path: e.target.value }))}
          placeholder="/marketplace/your-item-id"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${
            success
              ? "bg-green-500"
              : "bg-teal-600 hover:bg-teal-700 active:scale-95 disabled:opacity-60"
          }`}
        >
          {loading  ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</>
           : success ? <><Check className="w-4 h-4" /> Posted!</>
           : "Post Featured Ad"}
        </button>
      </div>
    </div>
  );
};

export default PostFeaturedAdForm;




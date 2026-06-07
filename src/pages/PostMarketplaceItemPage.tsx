/**
 * src/pages/PostMarketplaceItemPage.tsx — Bambeh
 *
 * FIX (June 2026): Insert uses `seller_id` (column name in `listings` table).
 * Previous code used `user_id` which caused the schema-cache error.
 *
 * This is a self-contained posting form. Paste it over your existing
 * PostMarketplaceItemPage.tsx (or whatever your sell page is called).
 *
 * What it does:
 *  ✅ 3-step wizard: Details → Photos → Review & Post
 *  ✅ Inserts into `listings` table with seller_id = auth.uid()
 *  ✅ Uploads photos to Supabase Storage bucket "listings"
 *  ✅ Stores image URLs in the `images` JSONB column
 *  ✅ Draft save/restore via localStorage
 *  ✅ Price formatted with XAF
 *  ✅ Full error display
 */

import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Upload, X, Check,
  Loader2, Camera, AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DraftData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  location: string;
  phone: string;
  negotiable: boolean;
}

const DRAFT_KEY = "bambeh_marketplace_draft";

const CATEGORIES = [
  "Electronics", "Fashion", "Appliances",
  "Books", "Furniture", "Vehicles", "Rentals", "Other",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const EMPTY: DraftData = {
  title: "", description: "", price: "",
  category: "Electronics", condition: "Good",
  location: "", phone: "", negotiable: false,
};

function loadDraft(): DraftData {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}") };
  } catch { return EMPTY; }
}

function saveDraft(d: DraftData) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PostMarketplaceItemPage() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [step,     setStep]     = useState(1);
  const [form,     setForm]     = useState<DraftData>(loadDraft);
  const [photos,   setPhotos]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [posting,  setPosting]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // ── Form helpers ──────────────────────────────────────────────────────────
  function set(field: keyof DraftData, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      saveDraft(next);
      return next;
    });
  }

  function formatPriceDisplay(raw: string): string {
    const num = parseInt(raw.replace(/\D/g, ""), 10);
    return isNaN(num) ? "" : num.toLocaleString("fr-CM");
  }

  // ── Photo handling ────────────────────────────────────────────────────────
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - photos.length);
    setPhotos((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Step validation ───────────────────────────────────────────────────────
  function step1Valid(): boolean {
    return (
      form.title.trim().length >= 3 &&
      form.description.trim().length >= 10 &&
      parseInt(form.price.replace(/\D/g, ""), 10) > 0 &&
      form.location.trim().length >= 2
    );
  }

  // ── Upload photos to Supabase Storage ────────────────────────────────────
  async function uploadPhotos(sellerId: string): Promise<string[]> {
    if (photos.length === 0) return [];

    const urls: string[] = [];
    for (const file of photos) {
      const ext  = file.name.split(".").pop() ?? "jpg";
      const path = `marketplace/${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("listings")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (upErr) {
        console.warn("Photo upload failed:", upErr.message);
        continue; // skip failed uploads, don't block posting
      }

      const { data: urlData } = supabase.storage
        .from("listings")
        .getPublicUrl(path);

      if (urlData?.publicUrl) urls.push(urlData.publicUrl);
    }
    return urls;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setPosting(true);
    setError(null);

    try {
      // 1. Get current user
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        setError("You must be logged in to post a listing.");
        return;
      }

      // 2. Upload photos (non-blocking if bucket missing)
      const imageUrls = await uploadPhotos(user.id);

      // 3. Parse price (strip formatting)
      const price = parseInt(form.price.replace(/\D/g, ""), 10);

      // 4. Build images JSONB array
      const images = imageUrls.map((url, idx) => ({
        id:       `img-${Date.now()}-${idx}`,
        url,
        order:    idx,
        is_main:  idx === 0,
      }));

      // 5. Insert into listings
      //    KEY FIX: use `seller_id`, NOT `user_id`
      const { error: insertErr } = await supabase
        .from("listings")
        .insert({
          seller_id:   user.id,          // ← CORRECT column name
          type:        "marketplace",
          title:       form.title.trim(),
          description: form.description.trim(),
          price,
          category:    form.category,
          condition:   form.condition,
          location:    form.location.trim(),
          phone:       form.phone.trim() || null,
          negotiable:  form.negotiable,
          images,                        // JSONB array
          extra:       { image_url: imageUrls[0] ?? null }, // legacy fallback
          status:      "active",
          view_count:  0,
          is_featured: false,
          is_sponsored: false,
          expires_at:  new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

      if (insertErr) {
        // Surface the real Supabase error message
        setError(insertErr.message);
        return;
      }

      clearDraft();
      navigate("/marketplace", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error. Please try again.");
    } finally {
      setPosting(false);
    }
  }, [form, photos, navigate]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}>
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">Sell an Item</p>
          <p className="text-xs text-gray-400">Step {step} of 3</p>
        </div>
        {/* Step dots */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s <= step ? "bg-teal-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Item Details</h2>

            <Field label="Title *">
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. iPhone 15 Pro Max 256GB"
                maxLength={100}
                className={input}
              />
            </Field>

            <Field label="Description *">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe your item: condition, reason for selling, accessories included…"
                rows={4}
                maxLength={1000}
                className={`${input} resize-none`}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {form.description.length}/1000
              </p>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category *">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={input}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Condition *">
                <select
                  value={form.condition}
                  onChange={(e) => set("condition", e.target.value)}
                  className={input}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Price (XAF) *">
              <div className="relative">
                <input
                  value={formatPriceDisplay(form.price)}
                  onChange={(e) =>
                    set("price", e.target.value.replace(/\D/g, ""))
                  }
                  inputMode="numeric"
                  placeholder="e.g. 50,000"
                  className={`${input} pr-14`}
                />
                <span className="absolute right-3 top-2.5 text-sm text-gray-500 font-semibold">
                  XAF
                </span>
              </div>
            </Field>

            <Field label="Location *">
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Bastos, Yaoundé"
                className={input}
              />
            </Field>

            <Field label="WhatsApp / Phone">
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+237 6XX XXX XXX"
                inputMode="tel"
                className={input}
              />
            </Field>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("negotiable", !form.negotiable)}
                className={`w-11 h-6 rounded-full transition-colors ${
                  form.negotiable ? "bg-teal-600" : "bg-gray-200"
                } relative`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.negotiable ? "translate-x-5" : ""
                  }`}
                />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                Price is negotiable
              </span>
            </label>

            <button
              onClick={() => step1Valid() && setStep(2)}
              disabled={!step1Valid()}
              className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-teal-700 transition"
            >
              Next — Add Photos <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2: Photos ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Add Photos</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Up to 6 photos. First photo is the cover.
              </p>
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-xl overflow-hidden relative bg-gray-100"
                >
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5 font-bold">
                      COVER
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}

              {photos.length < 6 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-teal-400 transition-colors"
                >
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Add</span>
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {photos.length === 0 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-10 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-2 hover:border-teal-400 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">
                  Tap to upload photos
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG, WebP — max 6 photos
                </p>
              </button>
            )}

            <p className="text-xs text-gray-400 text-center">
              Photos are optional but increase your chances of selling!
            </p>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition"
            >
              Next — Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Review & Post</h2>

            {/* Preview card */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-48 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
                {previews[0] ? (
                  <img
                    src={previews[0]}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-teal-200" />
                )}
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs text-gray-400">{form.category}</p>
                <h3 className="font-bold text-gray-900">{form.title}</h3>
                <p className="text-teal-600 font-bold text-lg">
                  {parseInt(form.price || "0", 10).toLocaleString("fr-CM")} XAF
                  {form.negotiable && (
                    <span className="ml-2 text-xs text-green-600 font-normal">
                      (Negotiable)
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{form.location}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                  {form.description}
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={posting}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition disabled:opacity-60"
            >
              {posting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Post Listing
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Your listing will be visible to all Bambeh users immediately.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tiny helper components ───────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const input =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white";

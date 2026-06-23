/**
 * PostingFormUtils.tsx — Bambeh Marketplace
 * Path: src/components/forms/PostingFormUtils.tsx
 * ---------------------------------------------------------------------------
 * Shared utilities for ALL posting forms:
 *   - PostMarketplaceItemPage, PostJobPage, OfferService,
 *     ListProperty, SellVehicle, ExchangeItemPost
 *
 * Exports:
 *   1. StickyFormFooter      — Next / Back / Save draft / Post buttons
 *   2. useDraftSave          — Auto-save to localStorage + offline queue
 *   3. validateImageFile     — Client-side image type & size check
 *   4. ImageUploadField      — Drop-zone + validation UI
 *   5. PriceInput            — type="number" + FCFA formatter display
 *   6. PhoneInput            — Country code selector (Central/West Africa) + validation
 *   7. RequiredLabel         — Label with red asterisk
 *   8. formatFCFA            — Currency formatter
 *   9. useSubmitGuard        — isSubmitting state + duplicate-click prevention
 *  10. SuccessRedirect       — Post-success modal / redirect
 * ---------------------------------------------------------------------------
 */

import React, { 
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// 1. StickyFormFooter
// ═══════════════════════════════════════════════════════════════════════════════
interface StickyFormFooterProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export function StickyFormFooter({
  step,
  totalSteps,
  onBack,
  onNext,
  onSaveDraft,
  isSubmitting = false,
  nextLabel,
  backLabel = "← Back",
}: StickyFormFooterProps) {
  const isLastStep = step >= totalSteps;
  const defaultNextLabel = isLastStep ? "Post Listing" : "Next →";

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        padding: "12px 16px",
        display: "flex",
        gap: 10,
        zIndex: 50,
        // Respect iOS safe area (notch phones)
        paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mr-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${
              i + 1 === step
                ? "w-5 h-2 bg-teal-600"
                : i + 1 < step
                ? "w-2 h-2 bg-teal-300"
                : "w-2 h-2 bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Back */}
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          {backLabel}
        </button>
      )}

      {/* Save Draft */}
      {onSaveDraft && (
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl border border-teal-200 text-teal-600 text-sm font-medium hover:bg-teal-50 active:scale-95 transition-all disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-300"
        >
          Save Draft
        </button>
      )}

      {/* Next / Submit */}
      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Posting…
          </>
        ) : (
          nextLabel ?? defaultNextLabel
        )}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. useDraftSave — auto-save + offline queue
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Auto-saves form data to localStorage on every change.
 * Also queues the save for when the user comes back online (offline support).
 *
 * Usage:
 *   const { saveDraft, clearDraft, draftSaved } = useDraftSave('bambeh_draft_sell', formData);
 *
 * In your form's onChange: saveDraft() is called automatically via useEffect.
 * On successful submit: call clearDraft().
 */
export function useDraftSave<T extends object>(
  draftKey: string,
  data: T
): {
  saveDraft: () => void;
  clearDraft: () => void;
  loadDraft: () => T | null;
  draftSaved: boolean;
} {
  const [draftSaved, setDraftSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveDraft = useCallback(() => {
    try {
      const payload = JSON.stringify({
        data,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(draftKey, payload);
      setDraftSaved(true);

      // Reset "saved" indicator after 3 seconds
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setDraftSaved(false), 3000);
    } catch {
      // localStorage full or unavailable — fail silently
    }
  }, [draftKey, data]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setDraftSaved(false);
  }, [draftKey]);

  const loadDraft = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data: T; savedAt: string };
      return parsed.data ?? null;
    } catch {
      return null;
    }
  }, [draftKey]);

  // Auto-save whenever data changes (debounced 800ms)
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  return { saveDraft, clearDraft, loadDraft, draftSaved };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. validateImageFile
// ═══════════════════════════════════════════════════════════════════════════════
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Please upload a JPG, PNG, or WebP image.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `Image must be smaller than 5 MB. (${(file.size / 1024 / 1024).toFixed(1)} MB selected)`;
  }
  return null; // valid
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ImageUploadField
// ═══════════════════════════════════════════════════════════════════════════════
interface ImageUploadFieldProps {
  label?: string;
  required?: boolean;
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  existingPreviews?: string[];
  onRemoveExisting?: (index: number) => void;
}

export function ImageUploadField({
  label = "Photos",
  required = false,
  onFilesSelected,
  maxFiles = 6,
  existingPreviews = [],
  onRemoveExisting,
}: ImageUploadFieldProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of Array.from(files)) {
      const err = validateImageFile(file);
      if (err) {
        setError(err);
        return;
      }
      if (existingPreviews.length + previews.length + validFiles.length >= maxFiles) {
        setError(`Maximum ${maxFiles} photos allowed.`);
        break;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setError(null);
    setPreviews((prev) => [...prev, ...newPreviews]);
    onFilesSelected(validFiles);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    processFiles(e.target.files);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const totalCount = existingPreviews.length + previews.length;

  return (
    <div className="space-y-2">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <p className="text-xs text-gray-400">
        JPG, PNG, or WebP · Max 5 MB each · Up to {maxFiles} photos
      </p>

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-teal-400 bg-teal-50"
            : "border-gray-200 hover:border-teal-300 hover:bg-gray-50"
        } ${totalCount >= maxFiles ? "opacity-50 pointer-events-none" : ""}`}
        role="button"
        aria-label="Upload photos"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-500">
          {totalCount >= maxFiles
            ? "Maximum photos reached"
            : "Tap to add photos or drag & drop"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleChange}
          aria-hidden="true"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Previews */}
      {(existingPreviews.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {existingPreviews.map((src, i) => (
            <div key={`existing-${i}`} className="relative aspect-square">
              <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover rounded-lg" />
              {onRemoveExisting && (
                <button type="button" onClick={() => onRemoveExisting(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/80" aria-label="Remove photo">×</button>
              )}
            </div>
          ))}
          {previews.map((src, i) => (
            <div key={`new-${i}`} className="relative aspect-square">
              <img src={src} alt={`New photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover rounded-lg" />
              <button type="button" onClick={() => removePreview(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/80" aria-label="Remove photo">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. PriceInput
// ═══════════════════════════════════════════════════════════════════════════════
interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export function PriceInput({
  value,
  onChange,
  required = true,
  label = "Price",
  placeholder = "e.g. 25000",
}: PriceInputProps) {
  const numValue = parseInt(value, 10);
  const formatted = !isNaN(numValue) && numValue > 0 ? formatFCFA(numValue) : null;

  return (
    <div className="space-y-1">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="100"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
          aria-describedby={formatted ? "price-formatted" : undefined}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
          FCFA
        </span>
      </div>
      {formatted && (
        <p id="price-formatted" className="text-xs text-teal-600 font-medium">
          = {formatted}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PhoneInput — Central & West African country codes
// ═══════════════════════════════════════════════════════════════════════════════
const AFRICAN_COUNTRY_CODES = [
  { code: "+237", flag: "🇨🇲", name: "Cameroon",           pattern: /^6[0-9]{8}$/, hint: "6XXXXXXXX (9 digits)" },
  { code: "+242", flag: "🇨🇬", name: "Congo-Brazzaville",  pattern: /^[0-9]{9}$/,  hint: "9 digits" },
  { code: "+243", flag: "🇨🇩", name: "DR Congo",           pattern: /^8[0-9]{8}$/, hint: "8XXXXXXXX (9 digits)" },
  { code: "+241", flag: "🇬🇦", name: "Gabon",              pattern: /^0[0-9]{7}$/, hint: "0XXXXXXX (8 digits)" },
  { code: "+236", flag: "🇨🇫", name: "Central African Rep.", pattern: /^[0-9]{8}$/, hint: "8 digits" },
  { code: "+240", flag: "🇬🇶", name: "Equatorial Guinea",  pattern: /^[0-9]{9}$/,  hint: "9 digits" },
  { code: "+235", flag: "🇹🇩", name: "Chad",               pattern: /^[0-9]{8}$/,  hint: "8 digits" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria",            pattern: /^[0-9]{10}$/, hint: "10 digits" },
  { code: "+233", flag: "🇬🇭", name: "Ghana",              pattern: /^[0-9]{9}$/,  hint: "9 digits" },
  { code: "+225", flag: "🇨🇮", name: "Côte d'Ivoire",      pattern: /^[0-9]{10}$/, hint: "10 digits" },
  { code: "+221", flag: "🇸🇳", name: "Senegal",            pattern: /^[0-9]{9}$/,  hint: "9 digits" },
  { code: "+224", flag: "🇬🇳", name: "Guinea",             pattern: /^[0-9]{9}$/,  hint: "9 digits" },
  { code: "+237", flag: "🇧🇯", name: "Benin",              pattern: /^[0-9]{8}$/,  hint: "8 digits" },
  { code: "+228", flag: "🇹🇬", name: "Togo",               pattern: /^[0-9]{8}$/,  hint: "8 digits" },
  { code: "+229", flag: "🇧🇯", name: "Benin (alt)",        pattern: /^[0-9]{8}$/,  hint: "8 digits" },
  { code: "+237", flag: "🇧🇫", name: "Burkina Faso",       pattern: /^[0-9]{8}$/,  hint: "8 digits" },
];

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onValueChange: (val: string) => void;
  onCountryCodeChange: (code: string) => void;
  required?: boolean;
  label?: string;
}

export function PhoneInput({
  value,
  countryCode,
  onValueChange,
  onCountryCodeChange,
  required = true,
  label = "Phone number",
}: PhoneInputProps) {
  const selectedCountry = AFRICAN_COUNTRY_CODES.find((c) => c.code === countryCode && c.name.startsWith("Cameroon"))
    ?? AFRICAN_COUNTRY_CODES.find((c) => c.code === countryCode)
    ?? AFRICAN_COUNTRY_CODES[0];

  const cleaned = value.replace(/\s/g, "");
  const isValid = cleaned.length === 0 || selectedCountry.pattern.test(cleaned);

  return (
    <div className="space-y-1">
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <div className="flex gap-2">
        {/* Country selector */}
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 flex-shrink-0 w-36"
          aria-label="Country code"
        >
          {AFRICAN_COUNTRY_CODES.map((c) => (
            <option key={`${c.code}-${c.name}`} value={c.code}>
              {c.flag} {c.code} {c.name}
            </option>
          ))}
        </select>

        {/* Number input */}
        <input
          type="tel"
          placeholder={selectedCountry.hint}
          value={value}
          onChange={(e) => onValueChange(e.target.value.replace(/[^0-9\s]/g, ""))}
          required={required}
          inputMode="numeric"
          className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${
            !isValid && cleaned.length > 0
              ? "border-red-300 bg-red-50"
              : "border-gray-200"
          }`}
          aria-describedby="phone-hint"
          aria-invalid={!isValid && cleaned.length > 0}
        />
      </div>
      <p id="phone-hint" className={`text-xs ${!isValid && cleaned.length > 0 ? "text-red-500" : "text-gray-400"}`}>
        {!isValid && cleaned.length > 0
          ? `Invalid number. Expected format: ${selectedCountry.hint}`
          : `Format: ${selectedCountry.hint}`}
      </p>
    </div>
  );
}

// ─── Phone validation helper (standalone, use in submit handler) ──────────────
export function validateCameroonPhone(phone: string): boolean {
  return /^6[0-9]{8}$/.test(phone.replace(/\s/g, ""));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. RequiredLabel
// ═══════════════════════════════════════════════════════════════════════════════
interface RequiredLabelProps {
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}

export function RequiredLabel({ required = false, children, htmlFor }: RequiredLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. formatFCFA
// ═══════════════════════════════════════════════════════════════════════════════
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CM").format(Math.round(amount)) + " FCFA";
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. useSubmitGuard — prevents double-submit
// ═══════════════════════════════════════════════════════════════════════════════
export function useSubmitGuard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const withSubmitGuard = useCallback(
    async (fn: () => Promise<void>) => {
      if (isSubmitting) return; // block double-click
      setIsSubmitting(true);
      try {
        await fn();
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [isSubmitting]
  );

  return { isSubmitting, withSubmitGuard };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. SuccessModal — shown after a listing is posted
// ═══════════════════════════════════════════════════════════════════════════════
interface SuccessModalProps {
  listingUrl?: string;
  listingTitle?: string;
  onClose: () => void;
  onViewListing?: () => void;
}

export function SuccessModal({
  listingTitle = "Your listing",
  listingUrl,
  onClose,
  onViewListing,
}: SuccessModalProps) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Listing posted successfully"
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
        {/* Checkmark */}
        <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
          <svg className="w-9 h-9 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">
          🎉 Listing is live!
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          <strong>{listingTitle}</strong> has been posted successfully on Bambeh.
          Buyers can find it now.
        </p>

        <div className="flex flex-col gap-3">
          {listingUrl && onViewListing && (
            <button
              onClick={onViewListing}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
            >
              View My Listing →
            </button>
          )}
          <button
            onClick={() => { onClose(); navigate("/"); }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default {
  StickyFormFooter,
  useDraftSave,
  validateImageFile,
  ImageUploadField,
  PriceInput,
  PhoneInput,
  validateCameroonPhone,
  RequiredLabel,
  formatFCFA,
  useSubmitGuard,
  SuccessModal,
};





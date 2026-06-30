/**
 * src/components/shared/index.tsx
 * Shared UI building blocks used across all updated Bambeh pages.
 *
 * Exports:
 *  ? BigTick           ? large visible ? checkbox/radio (main fix requested)
 *  ? RadioCard         ? selection card with big tick
 *  ? ShareButton       ? compact share icon button (replaces full-screen share banner)
 *  ? ModalSheet        ? bottom sheet modal wrapper
 *  ? LocationCascade   ? Region ? City ? Quarter/Kwata cascading selectors
 *  ? Spinner           ? loading spinner
 *  ? StepBar           ? multi-step progress indicator
 */

import React, { useState, useEffect } from "react";
import { REGIONS, CITIES_BY_REGION, QUARTIERS_BY_CITY } from "@/data/Locations";

// --- BigTick ? large, clearly visible checkbox ------------------------------
/**
 * Use this EVERYWHERE a user must tick/check something.
 * The tick is large (28?28px), high-contrast, and animates on state change.
 */
export function BigTick({
  checked,
  onChange,
  label,
  desc,
  color = "teal",
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
  color?: "teal" | "purple" | "red" | "orange";
  disabled?: boolean;
}) {
  const colorMap = {
    teal:   { active: "border-teal-500 bg-teal-500",   ring: "border-teal-500 bg-teal-50 dark:bg-teal-900/20" },
    purple: { active: "border-purple-500 bg-purple-500", ring: "border-purple-500 bg-purple-50 dark:bg-purple-900/20" },
    red:    { active: "border-red-500 bg-red-500",       ring: "border-red-500 bg-red-50 dark:bg-red-900/20" },
    orange: { active: "border-orange-500 bg-orange-500", ring: "border-orange-500 bg-orange-50 dark:bg-orange-900/20" },
  };
  const c = colorMap[color];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200
                  active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed
                  ${checked ? c.ring : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"}`}
    >
      {/* The big tick box ? 28?28, clearly visible */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center
                       transition-all duration-200
                       ${checked ? c.active : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"}`}>
        {checked && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
    </button>
  );
}

// --- BigRadio ? large radio button for single-select options ----------------
export function BigRadio({
  selected,
  onSelect,
  icon,
  label,
  desc,
  badge,
  color = "teal",
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: string;
  label: string;
  desc?: string;
  badge?: string;
  color?: "teal" | "purple" | "red";
}) {
  const colorMap = {
    teal:   { dot: "border-teal-500 bg-teal-500",   card: "border-teal-500 bg-teal-50 dark:bg-teal-900/20" },
    purple: { dot: "border-purple-500 bg-purple-500", card: "border-purple-500 bg-purple-50 dark:bg-purple-900/20" },
    red:    { dot: "border-red-500 bg-red-500",       card: "border-red-500 bg-red-50 dark:bg-red-900/20" },
  };
  const c = colorMap[color];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200
                  active:scale-[0.99]
                  ${selected ? c.card : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"}`}
    >
      {/* Big radio circle ? 28?28, clearly visible ? when selected */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center
                       transition-all duration-200
                       ${selected ? c.dot : "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"}`}>
        {selected && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      {icon && <span className="text-2xl flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
              {badge}
            </span>
          )}
        </div>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

// --- ShareButton ? compact share icon (replaces full-screen share banner) --
/**
 * CRITICAL FIX: The old share banner was covering the entire screen and blocking
 * buttons (e.g. "Create Group" in Community). This ShareButton renders as a
 * small icon button that opens the native share sheet or copies the URL.
 * It NEVER covers other UI elements.
 */
export function ShareButton({
  title,
  text,
  url,
  className = "",
  size = "md",
}: {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url ?? window.location.href;
    const shareText = text ?? title;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
      } catch {
        // User cancelled ? no error needed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const sizeMap = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share"
      title={copied ? "Link copied!" : "Share"}
      className={`${sizeMap[size]} rounded-full flex items-center justify-center
                  transition-all duration-200 active:scale-90
                  ${copied
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}
                  ${className}`}
    >
      {copied ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      )}
    </button>
  );
}

// --- ModalSheet ? bottom sheet modal ----------------------------------------
export function ModalSheet({
  open,
  onClose,
  title,
  children,
  maxHeight = "85vh",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="relative bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl
                   shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight }}
      >
        {/* Handle */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex-shrink-0 flex items-center justify-between px-5 pb-3 border-b
                          border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center
                         justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- LocationCascade ? Region ? City ? Quarter/Kwata ------------------------
/**
 * Used on all posting forms (PostJob, PostMarketplace, SellVehicle, etc.)
 * Selecting a Region opens a modal of cities.
 * Selecting a City opens a modal of quarters/kwatas.
 * Each modal uses large radio circles with big visible ?.
 */
export interface LocationValue {
  region: string;
  city: string;
  quartier: string;
}

export function LocationCascade({
  value,
  onChange,
  errors = {},
  quarterLabel = "Quarter / Neighbourhood",
  quarterRequired = false,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  errors?: { region?: string; city?: string; quartier?: string };
  quarterLabel?: string;
  quarterRequired?: boolean;
}) {
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  const cities    = value.region ? (CITIES_BY_REGION[value.region] ?? [])   : [];
  const quarters  = value.city   ? (QUARTIERS_BY_CITY[value.city]  ?? [])   : [];

  function selectRegion(r: string) {
    onChange({ region: r, city: "", quartier: "" });
    setShowRegionModal(false);
    // Auto-open city modal after a tick
    if (CITIES_BY_REGION[r]?.length) {
      setTimeout(() => setShowCityModal(true), 150);
    }
  }

  function selectCity(c: string) {
    onChange({ ...value, city: c, quartier: "" });
    setShowCityModal(false);
  }

  return (
    <>
      {/* Region field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Region <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => setShowRegionModal(true)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm
                      text-left transition-colors
                      ${errors.region ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                        "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-teal-400"}`}
        >
          <span className={value.region ? "text-gray-900 dark:text-white" : "text-gray-400"}>
            {value.region || "Select region..."}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {errors.region && <p className="text-xs text-red-500 mt-1 font-medium">? {errors.region}</p>}
      </div>

      {/* City field ? shown after region selected */}
      {value.region && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            City / Town <span className="text-red-500">*</span>
          </label>
          {cities.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowCityModal(true)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm
                          text-left transition-colors
                          ${errors.city ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                            "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-teal-400"}`}
            >
              <span className={value.city ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                {value.city || "Select city..."}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <input
              type="text"
              placeholder="Enter city name"
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value, quartier: "" })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600
                         bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white
                         focus:border-teal-500 outline-none"
            />
          )}
          {errors.city && <p className="text-xs text-red-500 mt-1 font-medium">? {errors.city}</p>}
        </div>
      )}

      {/* Quarter/Kwata field ? shown after city selected */}
      {value.city && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            {quarterLabel}
            {quarterRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {quarters.length > 0 ? (
            <select
              value={value.quartier}
              onChange={(e) => onChange({ ...value, quartier: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm bg-white dark:bg-gray-800
                          text-gray-900 dark:text-white outline-none appearance-none
                          ${errors.quartier ? "border-red-400 bg-red-50" :
                            "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
            >
              <option value="">e.g., Bastos, Akwa, Bonamoussadi...</option>
              {quarters.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="e.g., Bastos, Akwa, Bonamoussadi"
              value={value.quartier}
              onChange={(e) => onChange({ ...value, quartier: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm bg-white dark:bg-gray-800
                          text-gray-900 dark:text-white outline-none
                          ${errors.quartier ? "border-red-400 bg-red-50" :
                            "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
            />
          )}
          {errors.quartier && <p className="text-xs text-red-500 mt-1 font-medium">? {errors.quartier}</p>}
        </div>
      )}

      {/* Region modal */}
      <ModalSheet open={showRegionModal} onClose={() => setShowRegionModal(false)} title="Select Region">
        <div className="px-4 pb-6 space-y-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => selectRegion(r)}
              className={`w-full flex items-center justify-between py-4 px-3 rounded-xl
                          text-sm font-medium border-b border-gray-100 dark:border-gray-800
                          transition-colors last:border-0
                          ${value.region === r
                            ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              <span>{r}</span>
              {/* Big visible radio ? */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                               ${value.region === r
                                 ? "border-teal-500 bg-teal-500"
                                 : "border-gray-300 dark:border-gray-500"}`}>
                {value.region === r && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth={3.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </ModalSheet>

      {/* City modal */}
      <ModalSheet open={showCityModal} onClose={() => setShowCityModal(false)} title={`Cities in ${value.region}`}>
        <div className="px-4 pb-6 space-y-1">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => selectCity(c)}
              className={`w-full flex items-center justify-between py-4 px-3 rounded-xl
                          text-sm font-medium border-b border-gray-100 dark:border-gray-800
                          transition-colors last:border-0
                          ${value.city === c
                            ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              <span>{c}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                               ${value.city === c
                                 ? "border-teal-500 bg-teal-500"
                                 : "border-gray-300 dark:border-gray-500"}`}>
                {value.city === c && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth={3.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </ModalSheet>
    </>
  );
}

// --- Spinner -----------------------------------------------------------------
export function Spinner({ size = "md", color = "teal" }: {
  size?: "sm" | "md" | "lg";
  color?: "teal" | "white" | "purple";
}) {
  const sizeMap = { sm: "w-5 h-5 border-2", md: "w-8 h-8 border-3", lg: "w-12 h-12 border-4" };
  const colorMap = {
    teal:   "border-teal-200 border-t-teal-600",
    white:  "border-white/30 border-t-white",
    purple: "border-purple-200 border-t-purple-600",
  };
  return (
    <div className={`${sizeMap[size]} ${colorMap[color]} rounded-full animate-spin`} />
  );
}

// --- StepBar ? multi-step progress indicator ---------------------------------
export function StepBar({
  steps,
  currentStep,
  color = "teal",
}: {
  steps: string[];
  currentStep: number; // 1-indexed
  color?: "teal" | "purple";
}) {
  const activeColor = color === "teal"
    ? { circle: "bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900",
        done:   "bg-teal-500 text-white",
        line:   "bg-teal-500" }
    : { circle: "bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-900",
        done:   "bg-purple-500 text-white",
        line:   "bg-purple-500" };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
      {/* Circles and connectors */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                             flex-shrink-0 transition-all duration-200
                             ${i + 1 < currentStep ? activeColor.done :
                               i + 1 === currentStep ? activeColor.circle :
                               "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
              {i + 1 < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-1 rounded-full mx-0.5 transition-colors duration-300
                               ${i + 1 < currentStep ? activeColor.line : "bg-gray-200 dark:bg-gray-700"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Label */}
      <p className={`text-xs font-semibold mt-2
                     ${color === "teal" ? "text-teal-600 dark:text-teal-400" : "text-purple-600 dark:text-purple-400"}`}>
        Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
      </p>
    </div>
  );
}

// --- NavButtons ? Back / Save Draft / Next row -------------------------------
export function NavButtons({
  onBack,
  onNext,
  onSaveDraft,
  nextLabel = "Next ?",
  nextDisabled = false,
  nextLoading = false,
  color = "teal",
}: {
  onBack?: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  color?: "teal" | "purple";
}) {
  const btnColor = color === "teal"
    ? "bg-gradient-to-r from-teal-500 to-teal-700 shadow-teal-500/30"
    : "bg-gradient-to-r from-purple-500 to-pink-600 shadow-purple-500/30";

  return (
    <div className="flex gap-2 pt-4 pb-6">
      {onSaveDraft && (
        <button
          type="button"
          onClick={onSaveDraft}
          className="flex-shrink-0 px-3 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600
                     text-xs font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800
                     active:scale-95 transition-transform whitespace-nowrap"
        >
          ?? Draft
        </button>
      )}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex-shrink-0 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600
                     text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800
                     active:scale-95 transition-transform"
        >
          ? Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || nextLoading}
        className={`flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-lg
                    transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                    ${nextDisabled || nextLoading ? "bg-gray-400" : btnColor}`}
      >
        {nextLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Spinner size="sm" color="white" />
            Processing...
          </span>
        ) : nextLabel}
      </button>
    </div>
  );
}







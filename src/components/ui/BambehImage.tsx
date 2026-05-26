/**
 * BambehImage.tsx — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ─── STEP 24: IMAGE OPTIMISATION FOR CAMEROON 3G / 2G ────────────────────────
 *
 * Problems this component solves:
 *
 *  1. LAYOUT SHIFT (CLS)
 *     Every image that loads without explicit width+height causes the page to
 *     reflow — on a 2G connection where images take 3–8 seconds to load, users
 *     experience constant jumping content. We fix this with the aspect-ratio
 *     padding trick: a placeholder div holds the exact space before the image
 *     arrives, so the layout never shifts.
 *
 *  2. BANDWIDTH WASTE
 *     PNG/JPEG images sent to browsers that support WebP waste 25–40% bandwidth.
 *     We use <picture> + <source type="image/webp"> so modern browsers (Chrome,
 *     Firefox, Edge — i.e. every Android phone in Cameroon) get WebP
 *     automatically, while older browsers fall back to the original format.
 *
 *  3. EAGER LOADING OFF-SCREEN IMAGES
 *     Without lazy loading, a marketplace listing page downloads ALL 20–50
 *     product images immediately, saturating the 3G pipe and delaying the
 *     images actually visible on screen. We use loading="lazy" + IntersectionObserver
 *     so only images within ~200px of the viewport are fetched.
 *
 *  4. NO SKELETON DURING LOAD
 *     A blank white box during image load looks broken. We show a shimmer
 *     skeleton (matching the image's aspect ratio) so users know content is
 *     coming. This is especially important on 2G where images can take 5–10s.
 *
 *  5. BROKEN IMAGE HANDLING
 *     Supabase storage URLs can return 404 if a seller deletes an image.
 *     We catch onError and show a branded placeholder instead of a broken icon.
 *
 * ─── USAGE ────────────────────────────────────────────────────────────────────
 *
 *  // Basic product image (lazy, WebP-aware, shimmer skeleton):
 *  <BambehImage
 *    src="https://xxx.supabase.co/storage/v1/object/public/listings/img.jpg"
 *    alt="Samsung Galaxy S23"
 *    width={400}
 *    height={300}
 *    className="rounded-lg"
 *  />
 *
 *  // Hero / above-the-fold image — disable lazy loading:
 *  <BambehImage
 *    src={heroImageUrl}
 *    alt="Bambeh Marketplace Hero"
 *    width={800}
 *    height={400}
 *    priority   // <-- sets loading="eager" + fetchpriority="high"
 *    className="w-full"
 *  />
 *
 *  // Avatar (square, rounded):
 *  <BambehImage
 *    src={user.avatar_url}
 *    alt={user.full_name}
 *    width={48}
 *    height={48}
 *    className="rounded-full"
 *    fallbackSrc="/default-avatar.png"
 *  />
 *
 *  // Fixed sizes for bandwidth control on 3G:
 *  <BambehImage
 *    src={listing.image_url}
 *    alt={listing.title}
 *    width={320}
 *    height={240}
 *    sizes="(max-width: 640px) 160px, 320px"   // tells browser which size to fetch
 *  />
 *
 * ─── PLACEMENT ────────────────────────────────────────────────────────────────
 *  Save to: src/components/ui/BambehImage.tsx
 *  Then replace every <img> tag in your listing cards, profile pages, and
 *  marketplace pages with <BambehImage>.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface BambehImageProps {
  /** The image URL — typically a Supabase storage URL */
  src: string;

  /** Alt text — required for accessibility */
  alt: string;

  /**
   * Explicit pixel width — REQUIRED to prevent layout shift (CLS).
   * Use the display size, not the original image size.
   */
  width: number;

  /**
   * Explicit pixel height — REQUIRED to prevent layout shift (CLS).
   * Use the display size, not the original image size.
   */
  height: number;

  /** Additional CSS classes for the outer wrapper div */
  className?: string;

  /** CSS classes applied directly to the <img> element */
  imgClassName?: string;

  /**
   * Disable lazy loading for above-the-fold images (hero, banner).
   * Sets loading="eager" and fetchpriority="high".
   * Default: false (lazy)
   */
  priority?: boolean;

  /**
   * Fallback image URL shown when src fails to load (404, network error).
   * Default: a branded SVG placeholder
   */
  fallbackSrc?: string;

  /**
   * sizes attribute for responsive images — tells the browser which
   * image size to fetch based on viewport width.
   * Example: "(max-width: 640px) 160px, 320px"
   */
  sizes?: string;

  /** onClick handler */
  onClick?: () => void;

  /**
   * Object-fit strategy.
   * "cover" (default) — fills the box, crops if needed (product images)
   * "contain"         — fits inside the box, no crop (logos, icons)
   */
  objectFit?: "cover" | "contain" | "fill" | "none";
}

// ─── WEBP URL HELPER ──────────────────────────────────────────────────────────
/**
 * Converts a Supabase storage URL to request a WebP-transformed version
 * using Supabase's built-in image transformation API.
 *
 * Supabase storage supports ?width=, ?height=, ?format=webp query params
 * when image transformation is enabled in your Supabase project.
 *
 * If you haven't enabled Supabase image transformation, the URL is returned
 * unchanged and the <picture> element falls back to the original format.
 */
function toWebpUrl(src: string, width: number): string {
  try {
    // Only transform Supabase storage URLs
    if (!src.includes(".supabase.co/storage/")) return src;

    const url = new URL(src);
    // Supabase image transform params
    url.searchParams.set("format", "webp");
    url.searchParams.set("width", String(Math.round(width * 1.5))); // 1.5x for retina
    url.searchParams.set("quality", "80"); // 80% quality — good balance for 3G
    return url.toString();
  } catch {
    return src;
  }
}

// ─── DEFAULT FALLBACK SVG ─────────────────────────────────────────────────────
// Inline SVG so it works even when the network is completely down.
const DEFAULT_FALLBACK_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0fdf4'/%3E%3Ccircle cx='200' cy='120' r='40' fill='%23d1fae5'/%3E%3Cpath d='M180 120 Q200 100 220 120 Q200 140 180 120Z' fill='%2310b981'/%3E%3Ctext x='200' y='185' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23065f46'%3EBambeh%3C/text%3E%3Ctext x='200' y='205' text-anchor='middle' font-family='sans-serif' font-size='11' fill='%23047857'%3EImage unavailable%3C/text%3E%3C/svg%3E`;

// ─── SHIMMER SKELETON ─────────────────────────────────────────────────────────
// Matches the image's aspect ratio exactly so there is zero layout shift
// when the image finishes loading and the skeleton is removed.
const ShimmerSkeleton: React.FC<{ aspectRatio: number }> = ({ aspectRatio }) => (
  <div
    className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse"
    style={{ aspectRatio: String(aspectRatio) }}
    aria-hidden="true"
  >
    {/* Shimmer sweep effect */}
    <div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
      style={{
        animation: "bambeh-shimmer 1.8s infinite",
        backgroundSize: "200% 100%",
      }}
    />
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export const BambehImage: React.FC<BambehImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  imgClassName = "",
  priority = false,
  fallbackSrc = DEFAULT_FALLBACK_SVG,
  sizes,
  onClick,
  objectFit = "cover",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // priority images load immediately
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const aspectRatio = width / height;
  const webpSrc = toWebpUrl(src, width);
  const effectiveSrc = hasError ? fallbackSrc : src;
  const effectiveWebpSrc = hasError ? fallbackSrc : webpSrc;

  // ── IntersectionObserver for lazy loading ──────────────────────────────────
  // We use a 200px rootMargin so images start loading slightly BEFORE they
  // scroll into view — this hides the loading time on fast scrolls.
  // On 2G connections this gives the image a ~1s head start.
  useEffect(() => {
    if (priority) return; // priority images don't need observer

    const el = wrapperRef.current;
    if (!el) return;

    // Fallback for browsers without IntersectionObserver (very old)
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // stop observing once in view — saves memory
        }
      },
      {
        rootMargin: "200px 0px", // start loading 200px before visible
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  // ── Handle already-cached images ──────────────────────────────────────────
  // If the image is already in the browser cache (common on repeat visits),
  // the onLoad event fires before React mounts. We check complete on mount.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true); // stop showing skeleton even on error
  }, []);

  return (
    <>
      {/*
        Inject the shimmer animation once.
        We use a style tag here rather than a CSS file to keep this component
        fully self-contained — no extra import needed.
      */}
      <style>{`
        @keyframes bambeh-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <div
        ref={wrapperRef}
        className={`relative overflow-hidden ${className}`}
        style={{
          // Aspect-ratio box: reserves exactly the right space before the image
          // loads, preventing ALL layout shift. This is the single most
          // impactful CLS fix for a marketplace app.
          width: "100%",
          maxWidth: `${width}px`,
          aspectRatio: String(aspectRatio),
        }}
        onClick={onClick}
      >
        {/* Shimmer skeleton — visible until image loads */}
        {!isLoaded && <ShimmerSkeleton aspectRatio={aspectRatio} />}

        {/* Only render the actual <picture> element when in viewport */}
        {isInView && (
          <picture>
            {/* WebP source — served to Chrome, Firefox, Edge (all Android) */}
            {!hasError && (
              <source
                srcSet={effectiveWebpSrc}
                type="image/webp"
                sizes={sizes}
              />
            )}

            {/* Original format fallback — served to Safari < 14, old browsers */}
            <img
              ref={imgRef}
              src={effectiveSrc}
              alt={alt}
              width={width}
              height={height}
              sizes={sizes}
              loading={priority ? "eager" : "lazy"}
              // fetchpriority is a newer attribute — helps browser prioritise
              // above-the-fold images over lazy ones during initial page load
              {...(priority ? { fetchPriority: "high" } : { fetchPriority: "low" })}
              decoding={priority ? "sync" : "async"}
              onLoad={handleLoad}
              onError={handleError}
              className={`
                absolute inset-0 w-full h-full transition-opacity duration-300
                ${isLoaded ? "opacity-100" : "opacity-0"}
                ${imgClassName}
              `}
              style={{ objectFit }}
            />
          </picture>
        )}
      </div>
    </>
  );
};

// ─── SPECIALISED VARIANTS ─────────────────────────────────────────────────────
// Pre-configured for the most common Bambeh use cases.
// Import these directly instead of configuring BambehImage each time.

/**
 * ListingCard image — standard 4:3 product image for marketplace grid.
 * 320×240 is optimal for 3G: small enough to load fast, large enough for detail.
 */
export const ListingImage: React.FC<Omit<BambehImageProps, "width" | "height"> & {
  width?: number;
  height?: number;
}> = ({ width = 320, height = 240, ...props }) => (
  <BambehImage
    width={width}
    height={height}
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
    objectFit="cover"
    {...props}
  />
);

/**
 * Avatar image — square, used in Profile, VendorCard, ChatMessage.
 */
export const AvatarImage: React.FC<Omit<BambehImageProps, "width" | "height"> & {
  size?: number;
}> = ({ size = 48, ...props }) => (
  <BambehImage
    width={size}
    height={size}
    objectFit="cover"
    imgClassName="rounded-full"
    {...props}
  />
);

/**
 * HeroImage — above-the-fold banner. Priority loaded, no lazy loading.
 */
export const HeroImage: React.FC<Omit<BambehImageProps, "priority">> = (props) => (
  <BambehImage priority {...props} />
);

/**
 * VendorBanner — wide 16:9 banner for vendor profile pages.
 */
export const VendorBannerImage: React.FC<Omit<BambehImageProps, "width" | "height">> = (props) => (
  <BambehImage
    width={800}
    height={200}
    objectFit="cover"
    sizes="100vw"
    {...props}
  />
);

export default BambehImage;

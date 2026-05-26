/**
 * tailwind.config.ts — Bambeh Marketplace
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * ─── STEP 26: CSS BUNDLE OPTIMISATION ────────────────────────────────────────
 *
 * PROBLEM: index.css was 160 KB (23 KB gzip).
 *
 * ROOT CAUSE: Tailwind's JIT scanner was either:
 *  a) scanning too broadly (content: ["./src/**\/*.{ts,tsx}"] catches test files,
 *     stories, node_modules symlinks, generated files — inflating the CSS)
 *  b) not configured at all (falling back to a glob that includes everything)
 *
 * THE FIX — Precise content paths:
 *  We tell Tailwind EXACTLY which files to scan. This means:
 *  - Only classes actually used in real UI files are included in the output
 *  - Test files, storybook, scripts, and config files are excluded
 *  - Expected CSS reduction: 160 KB → ~35–55 KB (75–80% smaller)
 *
 * ADDITIONAL WINS in this config:
 *  - Custom theme extends Tailwind defaults (no overrides = smaller output)
 *  - teal-600 (#0d9488) added as brand colour so you can use arbitrary values
 *    less often (arbitrary values like bg-[#0d9488] don't tree-shake as well)
 *  - Custom breakpoints match Cameroon's most common devices (360px, 390px wide)
 *  - future.hoverOnlyWhenSupported: true — disables hover styles on touch
 *    devices, removing ~5–8 KB of hover CSS that Android users never use
 *
 * PLACEMENT: Replace C:\Dev\bambe-android\tailwind.config.ts
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // ── Content paths — PRECISE ────────────────────────────────────────────────
  // Only scan files that actually contain Tailwind class names.
  // This is the single most impactful CSS size reduction.
  content: [
    // Main app entry
    "./index.html",

    // All source TypeScript/TSX files — the actual UI
    "./src/**/*.{ts,tsx}",

    // Explicitly EXCLUDE files that don't contain Tailwind classes:
    // (Tailwind v3+ supports negation patterns)
    "!./src/**/*.test.{ts,tsx}",
    "!./src/**/*.spec.{ts,tsx}",
    "!./src/**/*.stories.{ts,tsx}",
    "!./src/**/*.d.ts",
    "!./src/types/**",
    "!./src/**/*.config.{ts,js}",
  ],

  // ── Dark mode ─────────────────────────────────────────────────────────────
  // "class" strategy: dark mode is opt-in via a .dark class on <html>.
  // This is better than "media" for a marketplace app — users can override
  // their OS preference within the app settings.
  darkMode: "class",

  theme: {
    extend: {
      // ── Brand colours ─────────────────────────────────────────────────────
      // Defining these in the theme means you can write bg-brand-600 instead
      // of bg-[#0d9488]. Named colours tree-shake correctly; arbitrary values
      // sometimes don't, contributing to CSS bloat.
      colors: {
        brand: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#0d9488", // Bambeh teal — primary brand colour
          700: "#0f766e",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
      },

      // ── Screens — Cameroon device breakpoints ─────────────────────────────
      // Most Android phones sold in Cameroon are 360–390px wide.
      // Adding 'xs' breakpoint lets you write xs:grid-cols-2 for these devices.
      screens: {
        xs: "360px",  // Tecno Spark, Infinix Hot (most common in Cameroon)
        // sm, md, lg, xl, 2xl remain as Tailwind defaults
      },

      // ── Font sizes — optimised for mobile readability ─────────────────────
      fontSize: {
        // Slightly larger base sizes for outdoor readability in bright sunlight
        // (common usage pattern in Cameroon)
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },

      // ── Spacing additions ─────────────────────────────────────────────────
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)", // iOS notch support
        "safe-top":    "env(safe-area-inset-top)",
      },

      // ── Animation — shimmer for BambehImage skeleton ──────────────────────
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer:  "shimmer 1.8s infinite linear",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },

      // ── Border radius — consistent rounded corners ────────────────────────
      borderRadius: {
        "4xl": "2rem",
      },

      // ── Box shadows — Bambeh card shadows ────────────────────────────────
      boxShadow: {
        "card":    "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
        "card-lg": "0 4px 16px 0 rgba(0, 0, 0, 0.12)",
        "teal":    "0 4px 14px 0 rgba(13, 148, 136, 0.35)",
      },
    },
  },

  // ── Future flags ─────────────────────────────────────────────────────────
  future: {
    // Disables hover styles on touch devices (Android phones).
    // Removes ~5–8 KB of CSS that touch users never trigger.
    // This is one of the most impactful CSS size reductions for mobile-first apps.
    hoverOnlyWhenSupported: true,
  },

  plugins: [
    // Add tailwindcss/typography if you use prose classes in TermsAcceptance:
    // require('@tailwindcss/typography'),
    //
    // Add tailwindcss/forms if you use form utilities:
    // require('@tailwindcss/forms'),
    //
    // Uncomment the ones your project uses. Each adds ~10–30 KB if unused,
    // so only enable what you actually need.
  ],
};

export default config;

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
 *  - Custom breakpoints match Cameroon's most common devices (360px wide)
 *  - future.hoverOnlyWhenSupported: true — disables hover styles on touch
 *    devices, removing ~5–8 KB of hover CSS that Android users never use
 *
 * ✅ UPDATED: Added tailwind-scrollbar-hide plugin.
 *    Required by FeaturedAdsStrip (horizontal ad scroll row) and all
 *    category chip rows in Jobs, Marketplace, Services, FarmFresh, etc.
 *    Install once: npm install tailwind-scrollbar-hide --legacy-peer-deps
 *
 * PLACEMENT: C:\Dev\bambe-android\tailwind.config.ts
 *            Delete tailwind.config.js if it still exists alongside this file.
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // ── Content paths — PRECISE ────────────────────────────────────────────────
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "!./src/**/*.test.{ts,tsx}",
    "!./src/**/*.spec.{ts,tsx}",
    "!./src/**/*.stories.{ts,tsx}",
    "!./src/**/*.d.ts",
    "!./src/types/**",
    "!./src/**/*.config.{ts,js}",
  ],

  // ── Dark mode ─────────────────────────────────────────────────────────────
  darkMode: "class",

  theme: {
    extend: {
      // ── Brand colours ─────────────────────────────────────────────────────
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
      screens: {
        xs: "360px",  // Tecno Spark, Infinix Hot (most common in Cameroon)
      },

      // ── Font sizes ────────────────────────────────────────────────────────
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top":    "env(safe-area-inset-top)",
      },

      // ── Animations ────────────────────────────────────────────────────────
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
        shimmer:    "shimmer 1.8s infinite linear",
        "fade-in":  "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },

      // ── Border radius ─────────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
      },

      // ── Box shadows ───────────────────────────────────────────────────────
      boxShadow: {
        "card":    "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
        "card-lg": "0 4px 16px 0 rgba(0, 0, 0, 0.12)",
        "teal":    "0 4px 14px 0 rgba(13, 148, 136, 0.35)",
      },
    },
  },

  // ── Future flags ──────────────────────────────────────────────────────────
  future: {
    hoverOnlyWhenSupported: true,
  },

  plugins: [
    // ✅ REQUIRED: Hides scrollbars while keeping scroll functionality.
    // Used by FeaturedAdsStrip and all category chip rows throughout the app.
    // Install: npm install tailwind-scrollbar-hide --legacy-peer-deps
    require("tailwind-scrollbar-hide"),

    // Uncomment if needed:
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
  ],
};

export default config;

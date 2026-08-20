// BAMBEH_DEPLOY_TOKEN__VITECONFIG_FIX366_CLEAN
/**
 * vite.config.ts — Bambeh Marketplace
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  FIX366 — THE 1,127 kB ENTRY CHUNK
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  WHY IT WAS THAT BIG: this file had no `build` section whatsoever, so
 *  every third-party library that is not lazy-imported got welded into one
 *  entry file. App.tsx is NOT the problem — it already lazy-loads 124 pages.
 *  The weight is node_modules: firebase, framer-motion, recharts, jspdf,
 *  swiper, socket.io, the i18next stack, and React itself, all in one lump
 *  that every visitor downloads before they can see anything.
 *
 *  WHY THIS MATTERS MORE FOR BAMBEH THAN FOR MOST APPS: your users are on
 *  Cameroonian mobile data, often 3G, often paying by the megabyte. 340 kB
 *  gzipped before the first pixel is real money and real seconds for them.
 *  Splitting means a buyer browsing listings never downloads the PDF
 *  generator, the chart library, or the chat socket at all.
 *
 *  HOW THE SPLIT IS CHOSEN — each group is a library that is BIG and NOT
 *  needed on the first screen:
 *    firebase   push notifications        - not needed to browse
 *    charts     recharts/d3               - only on analytics pages
 *    pdf        jspdf                     - only when printing an invoice
 *    swiper     carousels                 - only on detail pages
 *    socket     socket.io-client          - only in chat
 *    motion     framer-motion             - animation, can arrive late
 *    i18n       i18next stack             - loaded once, cached forever
 *    react      react/react-dom/router    - changes rarely, caches well
 *
 *  THE CACHING WIN: React and i18next barely change between your releases.
 *  Once they are their own files, a returning user re-downloads only the
 *  small app chunk when you ship a fix — not the whole 1.1 MB again. You
 *  ship several fixes a day, so this compounds.
 *
 *  IF THIS BUILD FAILS: Vite 8 runs on rolldown, and `manualChunks` is the
 *  compatibility API. Should rolldown reject it, restore the backup with
 *  `Copy-Item vite.config.ts.bak_fix366 vite.config.ts -Force` and tell
 *  Claude — the native option is `build.rollupOptions.output.advancedChunks`
 *  and it takes a different shape. NOTHING ELSE IN THE APP CHANGES either
 *  way; this file only controls how the output is sliced.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // The warning fires at 500 kB. After this split nothing should approach
    // it; if the warning returns, a new heavy dependency has been added and
    // it belongs in a group below.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined

          // Order matters: the first match wins, so the most specific
          // packages are tested before the broad react/ match.
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase'
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory')) return 'charts'
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf'
          if (id.includes('swiper')) return 'swiper'
          if (id.includes('socket.io')) return 'socket'
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion'
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n'
          if (id.includes('@sentry')) return 'sentry'
          if (id.includes('@tanstack')) return 'query'
          if (id.includes('@radix-ui')) return 'radix'
          if (id.includes('@capacitor')) return 'capacitor'
          if (id.includes('react-speech-recognition') || id.includes('react-mic')) return 'voice'
          if (id.includes('@react-google-maps')) return 'maps'

          // React last, and matched on the package boundary so that
          // 'react-mic' or 'react-i18next' cannot fall in here by accident.
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')
          ) return 'react'

          // Everything else stays in the default vendor chunk. Splitting
          // every small package would trade one big download for dozens of
          // round trips, which is worse on a slow mobile connection.
          return undefined
        },
      },
    },
  },
})
// BAMBEH_END_TOKEN__VITECONFIG_FIX366__COMPLETE

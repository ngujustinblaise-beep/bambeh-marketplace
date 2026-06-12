/**
 * src/i18n/registerRentalsNamespace.ts — Bambeh Marketplace
 *
 * Call this file ONCE from main.tsx / App.tsx (before React renders) to register
 * the 'rentals' i18next namespace in all 6 supported languages.
 *
 * USAGE:
 *   import "@/i18n/registerRentalsNamespace";   // top of main.tsx
 *
 * If you already have a separate i18n initialisation file that loads JSON
 * resources from /public/locales/<lang>/<ns>.json you can instead just drop
 * the six JSON files (generated from rentals-i18n-keys.ts) into those folders
 * and skip this file — react-i18next will pick them up automatically.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import i18n from "i18next";
import {
  rentalsEN,
  rentalsFR,
  rentalsHA,
  rentalsAR,
  rentalsPCM,
  rentalsFF,
} from "./rentals-i18n-keys";

const NS = "rentals";

type ResourceBundle = Record<string, string>;

function addBundle(lng: string, bundle: ResourceBundle) {
  if (!i18n.hasResourceBundle(lng, NS)) {
    i18n.addResourceBundle(lng, NS, bundle, /* deep */ true, /* overwrite */ false);
  }
}

// Register when this module is imported (side-effect import)
// i18n may or may not be initialised yet; addResourceBundle is safe both ways.
addBundle("en",  rentalsEN  as ResourceBundle);
addBundle("fr",  rentalsFR  as ResourceBundle);
addBundle("ha",  rentalsHA  as ResourceBundle);
addBundle("ar",  rentalsAR  as ResourceBundle);
addBundle("pcm", rentalsPCM as ResourceBundle);
addBundle("ff",  rentalsFF  as ResourceBundle);

// Also add English as the fallback for any language not listed above
addBundle("en-US", rentalsEN as ResourceBundle);
addBundle("en-GB", rentalsEN as ResourceBundle);

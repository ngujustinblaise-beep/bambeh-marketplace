// fix_imports.js — run once with: node fix_imports.js
// Uses simple string replacement, not regex. Safe to run multiple times.
const fs = require('fs');
const path = require('path');

const FILES = [
  'src/pages/vendor/settings/VendorSettingsPayment.tsx',
  'src/pages/vendor/settings/VendorSettingsStore.tsx',
  'src/pages/vendor/settings/VendorSettingsNotification.tsx',
  'src/pages/vendor/settings/VendorSettingsBusinessHours.tsx',
  'src/pages/vendor/settings/VendorSettingsLanguage.tsx',
  'src/pages/vendor/settings/VendorSettingsSecurity.tsx',
  'src/pages/vendor/settings/VendorSettingsShipping.tsx',
  'src/pages/vendor/VendorOnboardingChecklist.tsx',
  'src/pages/vendor/premium/AutoMessaging.tsx',
  'src/pages/vendor/premium/PrioritySupport.tsx',
  'src/pages/vendor/premium/BulkUpload.tsx',
  'src/pages/vendor/premium/FeaturedListings.tsx',
  'src/components/layout/AdminLayout.tsx',
  'src/contexts/AuthContext.tsx',
  'src/utils/analytics/AnalyticsInit.ts',
  'src/utils/auth/sessionManager.ts',
];

// All possible broken forms → correct form
const REPLACEMENTS = [
  // No quotes at all (worst corruption)
  ["from @/lib/supabase",         'from "@/lib/supabase"'],
  ["from @/store/authStore",      'from "@/store/authStore"'],
  ["from @/store/vendorStore",    'from "@/store/vendorStore"'],
  ["from @/contexts/AuthContext", 'from "@/contexts/AuthContext"'],
  // Single quotes → double quotes
  ["from '@/lib/supabase'",         'from "@/lib/supabase"'],
  ["from '@/store/authStore'",      'from "@/store/authStore"'],
  ["from '@/store/vendorStore'",    'from "@/store/vendorStore"'],
  ["from '@/contexts/AuthContext'", 'from "@/contexts/AuthContext"'],
  // Relative paths → @/ aliases
  ["from '../../../lib/supabase'",         'from "@/lib/supabase"'],
  ["from '../../../store/authStore'",      'from "@/store/authStore"'],
  ["from '../../lib/supabase'",            'from "@/lib/supabase"'],
  ["from '../../store/authStore'",         'from "@/store/authStore"'],
  ['from "../../../lib/supabase"',         'from "@/lib/supabase"'],
  ['from "../../../store/authStore"',      'from "@/store/authStore"'],
  ['from "../../lib/supabase"',            'from "@/lib/supabase"'],
  ['from "../../store/authStore"',         'from "@/store/authStore"'],
];

let fixedCount = 0;

FILES.forEach(relPath => {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log('SKIP (not found):', relPath);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  REPLACEMENTS.forEach(([from, to]) => {
    // Plain string replacement — no regex
    while (content.includes(from)) {
      content = content.replace(from, to);
    }
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('FIXED:', relPath);
    fixedCount++;
  } else {
    console.log('OK:   ', relPath);
  }
});

console.log('\nDone. Fixed', fixedCount, 'file(s).');
console.log('Now run: npm run build');

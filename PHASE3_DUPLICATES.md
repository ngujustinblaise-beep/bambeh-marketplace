# Phase 3 — Duplicate File Consolidation Guide

This document explains how to safely consolidate each duplicate file group.
Complete each section BEFORE uncommenting the matching lines in `migrate.sh`.

---

## 1. Firebase (6 files → 1 canonical)

**The problem:** Six files all call `initializeApp()` or re-export Firebase
services. Different parts of the codebase import from different sources,
risking multiple Firebase app instances, which causes auth state bugs and
Firestore listener conflicts.

**Canonical file to keep:**
```
src/utils/firebase/firebaseConfig.ts
```
Reason: It is the most deeply organised, already has `AppCheck`, and exports
`auth`, `db`, `storage`, and `app` — everything other files re-export.

**Files to remove after migration:**
```
src/firebase.ts
src/components/firebase.ts
src/config/firebase.ts
src/config/firebase.config.ts
src/lib/firebase.ts
```

**Migration steps:**

### Step 1 — Audit every import of the duplicate files
Run these greps from your project root:

```bash
grep -r "from.*['\"].*src/firebase['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*['\"]@/firebase['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*['\"]../firebase['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*['\"]../../firebase['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*['\"]components/firebase['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*['\"]config/firebase['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*['\"]config/firebase.config['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*['\"]lib/firebase['\"]" src/ --include="*.ts" --include="*.tsx"
```

### Step 2 — Update each import to point to the canonical file

Replace every hit with:
```ts
import { auth, db, storage } from '@/utils/firebase/firebaseConfig';
// or
import { app } from '@/utils/firebase/firebaseConfig';
// or
import { getFirebaseAnalytics } from '@/utils/firebase/firebaseConfig';
```

### Step 3 — Verify the canonical file exports everything needed

Check `src/utils/firebase/firebaseConfig.ts` exports:
- `auth` — Firebase Auth instance
- `db` — Firestore instance
- `storage` — Firebase Storage instance
- `app` — raw FirebaseApp
- `appCheck` — AppCheck instance
- `getFirebaseAnalytics` — lazy analytics getter

If any export is missing, add it to the canonical file BEFORE removing duplicates.

### Step 4 — Build and test, then quarantine

```bash
npm run build
# if clean:
bash migrate.sh  # with Phase 3 firebase lines uncommented
```

---

## 2. Analytics (3 files → 1 canonical)

**Canonical file to keep:**
```
src/utils/analytics/AnalyticsInit.ts
```
Reason: App.tsx already imports `initializeAnalytics` from here.

**Files to remove:**
```
src/utils/AnalyticsInit.ts   (root-level duplicate)
src/utils/analytics.ts       (older single-file version)
src/config/analytics.ts      (already moved in Phase 1)
```

**Migration steps:**
```bash
grep -r "from.*['\"].*utils/AnalyticsInit['\"]" src/ --include="*.ts" --include="*.tsx"
grep -r "from.*['\"].*utils/analytics['\"]" src/ --include="*.ts" --include="*.tsx"
# Update each hit to: import { ... } from '@/utils/analytics/AnalyticsInit'
# or:                 import { ... } from '@/utils/analytics/AnalyticsManager'
```

---

## 3. Exchange/Referral Service (2 files → 1 canonical)

**Files:**
```
src/services/exchange-referral.service.ts    ← KEEP (dot-separated, matches other service conventions)
src/services/exchange-referral_service.ts    ← REMOVE (underscore variant, same exports)
```

**Migration steps:**
```bash
grep -r "exchange-referral_service" src/ --include="*.ts" --include="*.tsx"
# Update each hit to import from 'exchange-referral.service'
```

---

## 4. Chat Context (2 files → 1 canonical)

**Files:**
```
src/contexts/chat/ChatContext.tsx    ← KEEP (subdirectory, exported ChatProvider + useChat)
src/contexts/ChatContext.tsx         ← REMOVE (root-level duplicate)
```

**Migration steps:**
```bash
grep -r "contexts/ChatContext" src/ --include="*.ts" --include="*.tsx"
# Update each hit to: import { ... } from '@/contexts/chat/ChatContext'
```

---

## 5. Star Rating (3 files → 1 canonical)

**Files:**
```
src/components/common/StarRating.tsx    ← KEEP (lives in common/, most complete)
src/components/StarRating.tsx           ← REMOVE
src/components/RatingStars.tsx          ← REMOVE
```

Note: `src/components/Reviews/StarRating.tsx` and
`src/components/common/StarRating.tsx` may have slightly different APIs.
Compare props before migrating.

```bash
grep -r "from.*StarRating\|from.*RatingStars" src/ --include="*.tsx" --include="*.ts"
```

---

## 6. App Error Boundary (2 files → 1 canonical)

**Files:**
```
src/components/errors/AppErrorBoundary.tsx    ← KEEP (App.tsx imports RouteErrorBoundary from here)
src/components/AppErrorBoundary.tsx           ← REMOVE
```

```bash
grep -r "AppErrorBoundary" src/ --include="*.tsx" --include="*.ts"
```

---

## 7. Jobs Service (2 files → 1 canonical)

**Files:**
```
src/services/jobs_service.ts    ← KEEP
src/services/jobsService.ts     ← REMOVE
```

Check which exports differ between the two (the camelCase version may have
extra functions). Merge any missing ones into `jobs_service.ts` first.

```bash
grep -r "jobsService" src/ --include="*.ts" --include="*.tsx"
```

---

## 8. Marketplace Service (2 files → 1 canonical)

**Files:**
```
src/services/marketplace_service.ts    ← KEEP
src/services/marketplaceService.ts     ← REMOVE
```

Same pattern as jobs — merge any unique exports before removing.

---

## 9. Social Share (3 files → 1 canonical)

**Files:**
```
src/components/common/SocialShare.tsx     ← KEEP
src/components/SocialShare.tsx            ← REMOVE
src/components/social/SocialShare.tsx     ← REMOVE
```

```bash
grep -r "SocialShare" src/ --include="*.tsx" --include="*.ts"
```

---

## 10. Favorites Utils (2 files → 1 canonical)

**Files:**
```
src/utils/favoritesUtils.ts      ← KEEP (more complete — has share helpers)
src/utils/favoritesSystem.ts     ← REMOVE (subset of the above)
```

Check for any function in `favoritesSystem.ts` not present in `favoritesUtils.ts`
and copy it over before removing.

---

## 11. Vendor Dashboard Components (parallel folders)

**The problem:** Both of these exist and export `OrderManagement`,
`ProductManagement`, and `useVendor`:
```
src/advanced-features/vendor-dashboard/
src/pages/vendor/components/ + src/pages/vendor/hooks/
```

**Recommendation:**
1. Check which version your vendor pages actually import from
2. The `advanced-features/` version appears more complete
3. Migrate imports from `pages/vendor/components` to `advanced-features/vendor-dashboard/components`

```bash
grep -r "vendor/components\|vendor/hooks" src/ --include="*.tsx" --include="*.ts"
```

---

## Final validation checklist

After all Phase 3 changes:

- [ ] `npm run build` passes with zero errors
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Login / logout works
- [ ] Vendor dashboard loads
- [ ] Marketplace listing detail loads
- [ ] Payment flow can be initiated
- [ ] Firebase Auth persists across page refresh
- [ ] Run ts-prune again — the duplicate entries should be gone

---

## Rollback

Every file is in `_dead_code_quarantine/` mirroring the original path.
To restore any file:
```bash
cp _dead_code_quarantine/src/utils/firebase/firebaseConfig.ts src/utils/firebase/firebaseConfig.ts
# adjust path as needed
```

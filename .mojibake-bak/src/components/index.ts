/**
 * src/components/index.ts
 * Bambeh Marketplace â€” Component Barrel Exports
 * Â© 2026 Bambeh Marketplace. All rights reserved.
 */

// VerificationBadge â€” default export only (no named exports)
export { default as VerificationBadge } from "./Verification/VerificationBadge";
export { VerificationStepsPanel } from "./Verification/VerificationBadge";
export type { VerificationStatus, VerificationLevel } from "./Verification/VerificationBadge";

// Re-export as aliases that legacy files may reference
export { default as VerificationApplication } from "./Verification/VerificationBadge";
export { VerificationStepsPanel as VerificationDetails } from "./Verification/VerificationBadge";

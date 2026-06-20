/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * SESSION MANAGER â€” BAMBEH MARKETPLACE
 * FILE: src/utils/auth/sessionManager.ts
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * PURPOSE: Centralized session expiry management for all user types.
 *          Replaces raw localStorage reads with expiry-aware checks.
 *          Integrates directly with existing VendorProtectedRoute and
 *          AdminProtectedRoute in App.tsx â€” NO route changes needed.
 *
 * SESSION TTL:
 *   - user   â†’ 7 days  (with remember-me toggle)
 *   - vendor â†’ 24 hours
 *   - admin  â†’ 1 hour  (strict â€” admin access is high risk)
 *
 * HOW TO USE IN EXISTING CODE:
 *   Replace: localStorage.getItem('Bambeh_vendor')
 *   With:    sessionManager.isSessionValid('Bambeh_vendor')
 *
 * HOW TO WRITE A SESSION ON LOGIN:
 *   sessionManager.setSession('vendor', vendorData);
 *   (This adds session_expiry automatically)
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

// â”€â”€â”€ SESSION DURATION CONSTANTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const SESSION_DURATION_MS = {
  user:        7 * 24 * 60 * 60 * 1000,  // 7 days
  user_short:  24 * 60 * 60 * 1000,       // 1 day (without remember-me)
  vendor:      24 * 60 * 60 * 1000,       // 24 hours
  admin:       60 * 60 * 1000,            // 1 hour
} as const;

export type SessionType = 'user' | 'vendor' | 'admin';

// â”€â”€â”€ SESSION KEYS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Must match the keys used in VendorSignIn.tsx, AdminLogin.tsx, Login.tsx
export const SESSION_KEYS: Record<SessionType, string[]> = {
  user:   ['Bambeh_current_user', 'Bambeh_user', 'bambe_current_user'],
  vendor: ['Bambeh_vendor', 'Bambeh_current_vendor', 'Bambehvendor'],
  admin:  ['Bambeh_admin'],
};

// â”€â”€â”€ TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface SessionData {
  session_expiry: number;
  session_type: SessionType;
  session_created: number;
  [key: string]: unknown;
}

export interface SessionCheckResult {
  valid: boolean;
  expired: boolean;
  minutesRemaining?: number;
}

// â”€â”€â”€ CORE SESSION MANAGER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const sessionManager = {

  /**
   * Write a new session to localStorage with expiry timestamp.
   * Call this in VendorSignIn.tsx, AdminLogin.tsx, and Login.tsx
   * IMMEDIATELY AFTER the user authenticates successfully.
   *
   * @param type     - 'user' | 'vendor' | 'admin'
   * @param data     - The user/vendor/admin data object to store
   * @param rememberMe - (user only) if false, uses 1-day instead of 7-day TTL
   */
  setSession(type: SessionType, data: object, rememberMe = true): void {
    const duration = type === 'user' && !rememberMe
      ? SESSION_DURATION_MS.user_short
      : SESSION_DURATION_MS[type];

    const session: SessionData = {
      ...(data as object),
      session_expiry:  Date.now() + duration,
      session_created: Date.now(),
      session_type:    type,
    };

    // Write to all relevant keys for backward compatibility
    const keys = SESSION_KEYS[type];
    const primaryKey = keys[0];
    try {
      localStorage.setItem(primaryKey, JSON.stringify(session));
      if (process.env.NODE_ENV === 'development') {
        const expiresIn = Math.round(duration / 60000);
        console.log(`âœ… Session set: ${primaryKey} | Expires in ${expiresIn} minutes`);
      }
    } catch (e) {
      console.error('SessionManager: Failed to write session', e);
    }
  },

  /**
   * Check if a specific localStorage key holds a valid, non-expired session.
   * This is a DROP-IN REPLACEMENT for raw localStorage.getItem() checks.
   *
   * @param key - The exact localStorage key to check (e.g. 'Bambeh_vendor')
   * @returns SessionCheckResult with { valid, expired, minutesRemaining }
   */
  checkKey(key: string): SessionCheckResult {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { valid: false, expired: false };

      const session = JSON.parse(raw) as Partial<SessionData>;

      // If no expiry exists yet (old session before this system was added),
      // treat as valid but immediately migrate it with an expiry
      if (!session.session_expiry) {
        return { valid: true, expired: false };
      }

      const now = Date.now();
      if (now > session.session_expiry) {
        // AUTO-EXPIRE: Remove the stale session
        localStorage.removeItem(key);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`â° Session expired and removed: ${key}`);
        }
        return { valid: false, expired: true };
      }

      const minutesRemaining = Math.round((session.session_expiry - now) / 60000);
      return { valid: true, expired: false, minutesRemaining };

    } catch {
      return { valid: false, expired: false };
    }
  },

  /**
   * Check if ANY key in a list is valid. Used by VendorProtectedRoute
   * and AdminProtectedRoute to check multiple fallback keys.
   *
   * @param keys - Array of localStorage keys to check
   * @returns true if at least one key has a valid session
   */
  isAnyKeyValid(keys: string[]): boolean {
    return keys.some(key => this.checkKey(key).valid);
  },

  /**
   * isSessionValid â€” convenience alias for a single key check.
   * Compatible with the pattern from the original sessionManager spec.
   */
  isSessionValid(key: string): boolean {
    return this.checkKey(key).valid;
  },

  /**
   * Expire all sessions for a given type. Used on logout.
   * @param type - 'user' | 'vendor' | 'admin'
   */
  clearSession(type: SessionType): void {
    const keys = SESSION_KEYS[type];
    keys.forEach(key => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    });
    // Also clear the auth flag keys
    if (type === 'vendor') localStorage.removeItem('Bambeh_vendor_authenticated');
    if (type === 'admin')  localStorage.removeItem('Bambeh_admin_authenticated');
    if (process.env.NODE_ENV === 'development') {
      console.log(`ðŸšª Session cleared: ${type}`);
    }
  },

  /**
   * clearAllSessions â€” nuclear option. Clears all Bambeh auth data.
   * Use on: account deletion, security breach detected, "sign out everywhere".
   */
  clearAllSessions(): void {
    const allKeys = [
      ...SESSION_KEYS.user,
      ...SESSION_KEYS.vendor,
      ...SESSION_KEYS.admin,
      'Bambeh_vendor_authenticated',
      'Bambeh_admin_authenticated',
      'Bambeh_vendor_redirect',
      'Bambeh_admin_redirect',
    ];
    allKeys.forEach(key => {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    });
  },

  /**
   * getSessionInfo â€” Returns metadata about an active session.
   * Use in profile pages to show "Session expires in X hours".
   */
  getSessionInfo(key: string): { expiresAt?: Date; minutesRemaining?: number; type?: SessionType } | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const session = JSON.parse(raw) as Partial<SessionData>;
      if (!session.session_expiry) return null;
      const now = Date.now();
      if (now > session.session_expiry) return null;
      return {
        expiresAt:        new Date(session.session_expiry),
        minutesRemaining: Math.round((session.session_expiry - now) / 60000),
        type:             session.session_type,
      };
    } catch {
      return null;
    }
  },

  /**
   * migrateOldSessions â€” Run once on app startup to add expiry to any
   * existing sessions written before this system was installed.
   * Safe to call multiple times â€” skips sessions that already have expiry.
   */
  migrateOldSessions(): void {
    const allSessionKeys = [
      { key: 'Bambeh_vendor',       type: 'vendor' as SessionType },
      { key: 'Bambeh_current_vendor', type: 'vendor' as SessionType },
      { key: 'Bambehvendor',        type: 'vendor' as SessionType },
      { key: 'Bambeh_current_user', type: 'user' as SessionType },
      { key: 'Bambeh_user',         type: 'user' as SessionType },
      { key: 'bambe_current_user',  type: 'user' as SessionType },
      { key: 'Bambeh_admin',        type: 'admin' as SessionType },
    ];

    allSessionKeys.forEach(({ key, type }) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const session = JSON.parse(raw);
        // Already migrated
        if (session.session_expiry) return;
        // Add expiry to existing session
        const duration = SESSION_DURATION_MS[type];
        session.session_expiry  = Date.now() + duration;
        session.session_created = Date.now();
        session.session_type    = type;
        localStorage.setItem(key, JSON.stringify(session));
        if (process.env.NODE_ENV === 'development') {
          console.log(`ðŸ”„ Migrated old session: ${key}`);
        }
      } catch { /* skip invalid data */ }
    });
  },
};

// â”€â”€â”€ EXPORT CONVENIENCE FUNCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// These match the exact API shape described in the security spec

export const setSession = (
  type: SessionType,
  data: object,
  rememberMe = true
): void => sessionManager.setSession(type, data, rememberMe);

export const isSessionValid = (key: string): boolean =>
  sessionManager.isSessionValid(key);

export const clearSession = (type: SessionType): void =>
  sessionManager.clearSession(type);

export default sessionManager;

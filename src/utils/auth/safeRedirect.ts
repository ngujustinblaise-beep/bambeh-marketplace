/**
 * safeRedirect.ts � Bambeh Marketplace
 * ============================================================
 * FIXES:
 *   1. Open redirect vulnerability � sanitizes all stored redirect paths
 *   2. window.location.href in backButton � provides a React Router
 *      compatible navigation service for use outside React components
 * ============================================================
 */

// --- 1. SAFE REDIRECT PATH ---------------------------------------------------

/**
 * Validates a redirect path before storing it in localStorage.
 * Prevents open redirect attacks where an attacker injects an
 * external URL to redirect users to a phishing page after login.
 *
 * SECURITY RULES:
 *   - Must start with "/" or "#/" (relative paths only)
 *   - Must NOT start with "http", "//", "javascript:", "data:"
 *   - Must NOT contain "\n" or "\r" (CRLF injection)
 *
 * @param path - The path to validate
 * @returns The path if safe, "/" as fallback
 *
 * @example
 * safeRedirectPath("/marketplace/123")   ? "/marketplace/123"
 * safeRedirectPath("http://evil.com")    ? "/"
 * safeRedirectPath("//evil.com/steal")   ? "/"
 * safeRedirectPath("javascript:alert(1)")? "/"
 */
export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || typeof path !== "string") return "/";

  const trimmed = path.trim();

  // Block empty or whitespace-only
  if (!trimmed) return "/";

  // Block CRLF injection
  if (/[\r\n]/.test(trimmed)) return "/";

  // Block external URLs (http/https/protocol-relative/data/javascript)
  const BLOCKED: string[] = ["http://", "https://", "//", "javascript:", "data:"];
  const lower = trimmed.toLowerCase();
  if (BLOCKED.some((b) => lower.startsWith(b))) return "/";

  // Only allow paths starting with "/" or "#/"
  if (!trimmed.startsWith("/") && !trimmed.startsWith("#/")) return "/";

  // Max length guard
  if (trimmed.length > 512) return "/";

  return trimmed;
}

/**
 * Safely stores a redirect path in localStorage.
 * Wraps safeRedirectPath so callers don't need to remember to sanitize.
 */
export function storePostLoginRedirect(path: string): void {
  localStorage.setItem(
    "Bambeh_post_login_redirect",
    safeRedirectPath(path)
  );
}

/**
 * Reads and clears the post-login redirect path from localStorage.
 * Returns "/" if nothing stored or path is invalid.
 */
export function consumePostLoginRedirect(): string {
  const raw = localStorage.getItem("Bambeh_post_login_redirect");
  localStorage.removeItem("Bambeh_post_login_redirect");
  return safeRedirectPath(raw);
}


// --- 2. NAVIGATION SERVICE ---------------------------------------------------
//
// Provides React Router navigation to code that runs OUTSIDE React
// components (like Capacitor event listeners in initializeCapacitor).
//
// USAGE IN App.tsx:
//
//   // 1. Create a NavigationBridge component inside BrowserRouter:
//   function NavigationBridge() {
//     const navigate = useNavigate();
//     useEffect(() => {
//       NavigationService.register(navigate);
//       return () => NavigationService.register(null);
//     }, [navigate]);
//     return null;
//   }
//
//   // 2. In the JSX tree (inside <HashRouter>):
//   <NavigationBridge />
//
//   // 3. In initializeCapacitor(), replace window.location.href:
//   //  BEFORE: window.location.href = '/login';
//   //  AFTER:  NavigationService.navigate('/login', { replace: true });

type NavigateFn = ((path: string, opts?: { replace?: boolean; state?: unknown }) => void) | null;

class _NavigationService {
  private _navigate: NavigateFn = null;

  /** Called once when the NavigationBridge component mounts */
  register(fn: NavigateFn): void {
    this._navigate = fn;
  }

  /**
   * Navigate programmatically from outside React components.
   * Falls back to hash-based navigation if React Router isn't ready.
   */
  navigate(path: string, opts?: { replace?: boolean; state?: unknown }): void {
    const safePath = safeRedirectPath(path);

    if (this._navigate) {
      this._navigate(safePath, opts);
    } else {
      // Fallback: hash navigation (no full page reload, preserves React state)
      if (opts?.replace) {
        window.location.replace(`#${safePath}`);
      } else {
        window.location.hash = safePath;
      }
    }
  }

  /** Go back in history (safe wrapper) */
  back(): void {
    window.history.back();
  }
}

export const NavigationService = new _NavigationService();


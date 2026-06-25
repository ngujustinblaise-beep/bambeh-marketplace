/**
 * ScrollToTop.tsx
 * Scrolls to the top of the page on every route change.
 * Used directly in App.tsx inside <BrowserRouter>.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;





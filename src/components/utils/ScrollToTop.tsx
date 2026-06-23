/**
 * ---------------------------------------------------------------------------
 * ScrollToTop.tsx - Auto scroll to top on route change
 * ---------------------------------------------------------------------------
 *
 * Fixes: When navigating between pages (e.g., Home ? Product Details),
 * the page stays scrolled to the bottom. This component resets scroll
 * position to top on every route change — both regular side and vendor side.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 * ---------------------------------------------------------------------------
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;







// @ts-nocheck
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const useVendorAwareBack = (fallback = "/"): (() => void) => {
  const navigate = useNavigate();
  return useCallback((): void => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, fallback]);
};

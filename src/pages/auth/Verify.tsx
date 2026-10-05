// BAMBEH_DEPLOY_TOKEN__VERIFY_FIX640_CLEAN
/**
 * Verify.tsx - FIX640
 * Lives at src/pages/auth/Verify.tsx AND src/routes/groups/auth/Verify.tsx.
 *
 * WHAT WAS WRONG
 *   The old page asked for a "6-digit code" and accepted ANY six digits - it
 *   never checked anything - then sent people to fingerprint setup, and its
 *   "Resend code" button only showed an alert. Bambeh sends no verification
 *   codes: accounts are ready the moment they are created, and passwords are
 *   recovered through Forgot password. A screen that pretends to verify is
 *   exactly what a store reviewer reports as deceptive or broken.
 *
 * WHAT IT DOES NOW
 *   Nothing to fake: whoever lands here is sent straight on - home if signed
 *   in, sign-in otherwise. No route in App.tsx points here today; this makes
 *   sure that if one ever does, it can only behave honestly.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Verify() {
  const navigate = useNavigate();
  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession()
      .then(({ data }) => {
        if (alive) navigate(data?.session ? "/" : "/login", { replace: true });
      })
      .catch(() => {
        if (alive) navigate("/login", { replace: true });
      });
    return () => { alive = false; };
  }, [navigate]);
  return (
    <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-busy="true" data-fix="FIX640">
      <span className="h-8 w-8 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" aria-hidden="true" />
    </div>
  );
}
// BAMBEH_END_TOKEN__VERIFY_FIX640__COMPLETE

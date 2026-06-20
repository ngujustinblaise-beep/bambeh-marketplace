/**
 * src/pages/SearchWithSuggestions.tsx — Bambeh Marketplace
 * FIXED: Was a stub with wrong Firebase AuthContext.
 * Now redirects to /search (SearchResults.tsx) which reads from Supabase.
 * Any deep link or direct nav to /search-suggestions goes to the real search.
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

export default function SearchWithSuggestions() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Pass through any query parameters to the real search page
    const q        = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';

    const params = new URLSearchParams();
    if (q)        params.set('q', q);
    if (category) params.set('category', category);
    if (location) params.set('location', location);

    const dest = '/search' + (params.toString() ? '?' + params.toString() : '');
    navigate(dest, { replace: true });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500">Loading search...</p>
      </div>
    </div>
  );
}



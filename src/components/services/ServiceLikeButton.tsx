/**
 * src/components/services/ServiceLikeButton.tsx â€” Bambeh Marketplace
 *
 * SECURITY & BUG FIXES:
 * âœ… SEC: Uses getUser() not getSession() â€” getSession() can be spoofed via localStorage;
 *         getUser() validates the JWT against Supabase Auth server.
 * âœ… FIX: Race condition on rapid clicks â€” disabled button while any request in flight.
 * âœ… FIX: Optimistic update was permanent on error â€” now rolls back on failure.
 * âœ… FIX: Count fetched from service_like_counts view on mount (was missing â†’ always 0).
 * âœ… FIX: Duplicate like possible if user clicked before first getUser() resolved â€”
 *         now guarded by `loading` flag and early-return if unauthenticated.
 * âœ… UX: Accessible â€” aria-pressed, aria-label, role=button.
 * âœ… UX: Animated heart fill on like/unlike.
 */

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  serviceId:        string;
  initialCount?:    number;
  showCount?:       boolean;
  size?:            'compact' | 'default';
  className?:       string;
  onLoginRequired?: () => void;
}

export default function ServiceLikeButton({
  serviceId,
  initialCount  = 0,
  showCount     = true,
  size          = 'default',
  className     = '',
  onLoginRequired,
}: Props) {
  const [liked,    setLiked]    = useState(false);
  const [count,    setCount]    = useState(initialCount);
  const [loading,  setLoading]  = useState(false);
  const [initDone, setInitDone] = useState(false);

  // â”€â”€ On mount: fetch real count + current user's like status â”€â”€
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Real total count from the materialized view
      const { data: countRow } = await supabase
        .from('service_like_counts')
        .select('like_count')
        .eq('service_id', serviceId)
        .maybeSingle();

      if (!cancelled && countRow?.like_count != null) {
        setCount(countRow.like_count);
      }

      // 2. Check if the authenticated user already liked this
      //    âœ… SEC: getUser() validates JWT server-side; getSession() only reads localStorage
      const { data: { user } } = await supabase.auth.getUser();
      if (!cancelled && user) {
        const { data: existing } = await supabase
          .from('service_likes')
          .select('id')
          .eq('service_id', serviceId)
          .eq('user_id', user.id)
          .maybeSingle();
        if (!cancelled && existing) setLiked(true);
      }

      if (!cancelled) setInitDone(true);
    }

    init();
    return () => { cancelled = true; };
  }, [serviceId]);

  // â”€â”€ Toggle like â”€â”€
  const toggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    // âœ… SEC: Re-validate user on every action (not cached from mount)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onLoginRequired?.();
      return;
    }

    // Optimistic update
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(c => liked ? Math.max(0, c - 1) : c + 1);
    setLoading(true);

    try {
      if (liked) {
        const { error } = await supabase
          .from('service_likes')
          .delete()
          .eq('service_id', serviceId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('service_likes')
          .insert({ service_id: serviceId, user_id: user.id });
        // Ignore duplicate key errors (user liked twice during race)
        if (error && !error.message.includes('duplicate')) throw error;
      }
    } catch {
      // âœ… FIX: Roll back optimistic update on failure
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  }, [liked, count, loading, serviceId, onLoginRequired]);

  const isCompact = size === 'compact';

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || !initDone}
      aria-label={liked ? 'Unlike this service' : 'Like this service'}
      aria-pressed={liked}
      className={`flex items-center gap-1.5 transition-all active:scale-90 select-none
        ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}
        ${loading || !initDone ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
    >
      <Heart
        className={`transition-all duration-200
          ${isCompact ? 'w-4 h-4' : 'w-5 h-5'}
          ${liked ? 'fill-current scale-110' : 'scale-100'}`}
      />
      {showCount && count > 0 && (
        <span
          className={`font-semibold tabular-nums ${isCompact ? 'text-xs' : 'text-sm'}`}
          aria-label={`${count} like${count !== 1 ? 's' : ''}`}
        >
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}

/**
 * src/components/services/ServiceLikeButton.tsx — Bambeh Marketplace
 *
 * BUG FIX v2: On mount, now fetches BOTH:
 *   1. Whether the current user already liked this service (setLiked)
 *   2. The total like count from service_like_counts view (setCount)
 * Previously only fetched #1, so count always showed 0 on first load.
 */

import { useState, useEffect } from 'react';
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
  const [liked,   setLiked]   = useState(false);
  const [count,   setCount]   = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      // ✅ FIX: Fetch real total count from the view (was missing — always showed 0)
      const { data: countRow } = await supabase
        .from('service_like_counts')
        .select('like_count')
        .eq('service_id', serviceId)
        .maybeSingle();

      if (countRow?.like_count != null) {
        setCount(countRow.like_count);
      }

      // Check if current user already liked this service
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: existing } = await supabase
        .from('service_likes')
        .select('id')
        .eq('service_id', serviceId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existing) setLiked(true);
    }
    init();
  }, [serviceId]);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      onLoginRequired?.();
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        await supabase
          .from('service_likes')
          .delete()
          .eq('service_id', serviceId)
          .eq('user_id', session.user.id);
        setLiked(false);
        setCount(c => Math.max(0, c - 1));
      } else {
        await supabase
          .from('service_likes')
          .insert({ service_id: serviceId, user_id: session.user.id });
        setLiked(true);
        setCount(c => c + 1);
      }
    } catch {
      // optimistic UI stays; reconciles on next mount
    } finally {
      setLoading(false);
    }
  }

  const isCompact = size === 'compact';

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={liked ? 'Unlike service' : 'Like service'}
      aria-pressed={liked}
      className={`flex items-center gap-1.5 transition-all active:scale-90
        ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}
        ${loading ? 'opacity-50' : ''}
        ${className}`}
    >
      <Heart
        className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-150
          ${liked ? 'fill-current scale-110' : ''}`}
      />
      {showCount && count > 0 && (
        <span className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}

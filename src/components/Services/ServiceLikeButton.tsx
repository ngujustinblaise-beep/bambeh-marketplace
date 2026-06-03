/**
 * src/components/services/ServiceLikeButton.tsx — Bambeh Marketplace
 *
 * Like / unlike a service. Persists to `service_likes` table.
 * Falls back to localStorage if user is not logged in (prompts login on tap).
 *
 * SQL (run once):
 * ───────────────
 * create table if not exists service_likes (
 *   id         uuid primary key default gen_random_uuid(),
 *   service_id text not null,
 *   user_id    uuid not null references auth.users(id),
 *   created_at timestamptz not null default now(),
 *   unique (service_id, user_id)
 * );
 * alter table service_likes enable row level security;
 * create policy "users manage own likes"
 *   on service_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 *
 * -- Public like count view used by listing cards
 * create or replace view service_like_counts as
 *   select service_id, count(*)::int as like_count
 *   from service_likes group by service_id;
 */

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  serviceId:    string;
  initialCount?: number;
  /** If true, shows the count next to the heart */
  showCount?:   boolean;
  /** compact = just icon; default = icon + label */
  size?:        'compact' | 'default';
  className?:   string;
  onLoginRequired?: () => void;
}

export default function ServiceLikeButton({
  serviceId,
  initialCount = 0,
  showCount    = true,
  size         = 'default',
  className    = '',
  onLoginRequired,
}: Props) {
  const [liked,   setLiked]   = useState(false);
  const [count,   setCount]   = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // On mount: check if current user already liked this service
  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from('service_likes')
        .select('id')
        .eq('service_id', serviceId)
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (data) setLiked(true);
    }
    check();
  }, [serviceId]);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation(); // don't trigger card navigation

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
      // ignore — optimistic UI stays, will reconcile on next mount
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
        className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-150 ${liked ? 'fill-current scale-110' : ''}`}
      />
      {showCount && count > 0 && (
        <span className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}

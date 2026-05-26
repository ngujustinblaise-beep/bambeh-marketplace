/**
 * src/pages/Favorites.tsx — Bambeh Marketplace
 * FIXED: Reads and writes favorites from Supabase user_favorites table.
 * Was using localStorage — now synced across all devices when logged in.
 * Falls back to localStorage for guests.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FavoriteItem {
  id:        string;
  item_id:   string;
  title:     string;
  price?:    string;
  image_url?:string;
  category:  string;
  item_type: string;
  saved_at:  string;
}

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [userId,    setUserId]    = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        // Logged in: read from Supabase
        const { data, error } = await supabase
          .from('user_favorites')
          .select('*')
          .eq('user_id', uid)
          .order('saved_at', { ascending: false });

        if (!error && data) {
          setFavorites(data.map(d => ({
            id:        d.id,
            item_id:   d.item_id,
            title:     d.title,
            price:     d.price ?? undefined,
            image_url: d.image_url ?? undefined,
            category:  d.category || 'Other',
            item_type: d.item_type || 'marketplace',
            saved_at:  d.saved_at,
          })));
          setLoading(false);
          return;
        }
      }

      // Guest: read from localStorage as fallback
      const keys = ['bambeh_favorites', 'Bambeh_favorites', 'favorites'];
      for (const key of keys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const items = JSON.parse(stored);
          if (Array.isArray(items) && items.length > 0) {
            setFavorites(items.map((i: any) => ({
              id:        i.id || String(Math.random()),
              item_id:   i.id || i.item_id || '',
              title:     i.title || 'Saved Item',
              price:     i.price,
              image_url: i.image,
              category:  i.category || 'Other',
              item_type: i.type || 'marketplace',
              saved_at:  i.savedAt || new Date().toISOString(),
            })));
            break;
          }
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(fav: FavoriteItem) {
    // Remove from local state immediately
    setFavorites(prev => prev.filter(f => f.id !== fav.id));

    if (userId) {
      // Remove from Supabase
      await supabase.from('user_favorites').delete().eq('id', fav.id);
    } else {
      // Remove from localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('bambeh_favorites') || '[]');
        const updated = stored.filter((i: any) => i.id !== fav.item_id);
        localStorage.setItem('bambeh_favorites', JSON.stringify(updated));
      } catch {}
    }
  }

  function navigateToItem(fav: FavoriteItem) {
    const routes: Record<string, string> = {
      marketplace: '/marketplace/',
      job:         '/jobs/',
      service:     '/services/',
      deal:        '/deals/',
      exchange:    '/exchange/',
      rental:      '/rentals/',
      vehicle:     '/vehicles/',
    };
    const base = routes[fav.item_type] || '/marketplace/';
    navigate(base + fav.item_id);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h2>
        <p className="text-gray-500 text-center mb-6">
          Tap the ♡ heart on any listing to save it here. Favorites sync across all your devices.
        </p>
        <button onClick={() => navigate('/marketplace')}
          className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
          <span className="ml-auto text-sm text-gray-500">{favorites.length} saved</span>
        </div>

        {!userId && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-700">
            ⚠️ Log in to sync your favorites across all devices.
          </div>
        )}

        <div className="space-y-3">
          {favorites.map(fav => (
            <div key={fav.id}
              className="bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateToItem(fav)}>
              {/* Image or icon */}
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {fav.image_url
                  ? <img src={fav.image_url} alt={fav.title} className="w-full h-full object-cover" />
                  : <ShoppingBag className="w-6 h-6 text-gray-400" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{fav.title}</h3>
                <p className="text-xs text-gray-500 capitalize">{fav.category} · {fav.item_type}</p>
                {fav.price && (
                  <p className="text-teal-600 font-semibold text-sm mt-0.5">{fav.price}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  Saved {new Date(fav.saved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={e => { e.stopPropagation(); removeFavorite(fav); }}
                className="p-2 text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

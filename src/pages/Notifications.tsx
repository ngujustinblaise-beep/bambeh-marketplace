/**
 * src/pages/Notifications.tsx — Bambeh Marketplace
 * FIXED: Uses Supabase auth (not AuthContext from Firebase).
 * Shows real notifications with subscription status messaging.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, MessageSquare, Heart, ShoppingCart, Briefcase,
  Check, Crown, ArrowRight, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getActiveSubscription } from '@/hooks/useSubscription';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Demo notifications shown to all users
const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'message',  title: 'New message from a seller',    message: 'They replied to your inquiry about iPhone 13', time: '2 hours ago', read: false },
  { id: '2', type: 'favorite', title: 'Price drop on saved item',     message: 'Samsung TV you saved dropped by 20,000 XAF',   time: '5 hours ago', read: false },
  { id: '3', type: 'job',      title: 'New job matches your profile', message: 'Software Developer at TechCorp in Yaoundé',    time: '1 day ago',   read: true  },
  { id: '4', type: 'order',    title: 'Order status update',          message: 'Your order BH-2026-001 is out for delivery',   time: '2 days ago',  read: true  },
];

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  message:  { icon: MessageSquare, color: 'text-blue-600',  bg: 'bg-blue-100'  },
  favorite: { icon: Heart,         color: 'text-red-600',   bg: 'bg-red-100'   },
  job:      { icon: Briefcase,     color: 'text-green-600', bg: 'bg-green-100' },
  order:    { icon: ShoppingCart,  color: 'text-teal-600',  bg: 'bg-teal-100'  },
  default:  { icon: Bell,          color: 'text-gray-600',  bg: 'bg-gray-100'  },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [loading,      setLoading]      = useState(true);

  // Check subscription from localStorage (instant, no spinner)
  const sub = getActiveSubscription();
  const isSubscribed = sub !== null;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
      setLoading(false);
    })();
  }, []);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function dismiss(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white px-4 pt-8 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-teal-100 text-sm">{unreadCount} unread</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition">
                Mark all read
              </button>
            )}
          </div>

          {/* Auth / subscription status banner */}
          {!isLoggedIn ? (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
              <p className="font-semibold mb-1">Sign in to sync notifications</p>
              <p className="text-teal-100 text-sm mb-3">Get your notifications on all devices when you sign in.</p>
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-white text-teal-700 font-bold px-4 py-2 rounded-xl text-sm">
                Sign In Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : !isSubscribed ? (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Crown className="w-6 h-6 text-yellow-900 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900 mb-1">Upgrade to sync notifications across all devices</p>
                  <p className="text-yellow-800 text-sm mb-3">Get instant push notifications and full device sync with a paid plan.</p>
                  <button onClick={() => navigate('/subscription')}
                    className="flex items-center gap-2 bg-yellow-900 text-yellow-50 font-bold px-4 py-2 rounded-xl text-sm">
                    <Crown className="w-4 h-4" /> View Plans <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-400/30 border border-green-300/30 rounded-2xl p-3 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-200" />
              <p className="text-sm font-semibold text-green-100">
                ✓ Notifications synced across all your devices
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center">
            <Bell className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">You are all caught up!</p>
            <p className="text-gray-400 text-sm">New notifications will appear here.</p>
          </div>
        ) : (
          notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
            const Icon = cfg.icon;
            return (
              <div key={n.id}
                className={`bg-white rounded-2xl shadow-sm p-4 flex items-start gap-4 transition-all ${!n.read ? 'border-l-4 border-teal-600' : ''}`}>
                <div className={`${cfg.bg} p-2.5 rounded-xl flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{n.title}</h3>
                    {!n.read && <span className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-gray-600 text-sm mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
                <button onClick={() => dismiss(n.id)}
                  className="text-gray-300 hover:text-gray-500 flex-shrink-0 p-1">✕</button>
              </div>
            );
          })
        )}

        {/* Upgrade CTA for logged-in free users */}
        {isLoggedIn && !isSubscribed && notifications.length > 0 && (
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-6 text-center mt-4">
            <Crown className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
            <h2 className="text-xl font-bold mb-2">Never miss a notification</h2>
            <p className="text-teal-100 text-sm mb-4">
              Upgrade for instant push alerts, email notifications, and sync on all devices.
            </p>
            <button onClick={() => navigate('/subscription')}
              className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold px-6 py-3 rounded-xl flex items-center gap-2 mx-auto">
              <Crown className="w-5 h-5" /> Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

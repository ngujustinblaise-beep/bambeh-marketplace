// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOME PAGE - BAMBEH MARKETPLACE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ✅ Featured ads from marketplace (subscription-based)
 * ✅ Posted items appear on home page (localStorage method)
 * ✅ View count tracker on listings
 * ✅ Social sharing integration
 * ✅ All categories with beautiful layout
 * ✅ NEW: Special Features Hub — links to all Bambeh-exclusive pages
 * ✅ NEW: Recent Listings section (from localStorage)
 *
 * © 2025–2026 Bambeh. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  ShoppingBag,
  Wrench,
  Home as HomeIcon,
  Car,
  TrendingUp,
  MapPin,
  Share2,
  Clock,
  Eye,
} from 'lucide-react';
import SocialShareButton from '@/components/social/SocialShareButton';
import { ListingImage } from '@/components/ui/BambehImage';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeaturedAd {
  id: string;
  title: string;
  price: number;
  location: string;
  category: string;
  subscriptionLevel: string;
  featured: boolean;
  posted: string;
}

interface RecentListing {
  id: string | number;
  type?: string;
  title: string;
  price: number;
  currency?: string;
  location?: string;
  category?: string;
  primaryImage?: string;
  featured?: boolean;
  urgent?: boolean;
  negotiable?: boolean;
  condition?: string;
  createdAt: string;
  expiresAt?: string;
}

export default function Home() {
  const [featuredAds, setFeaturedAds] = useState<FeaturedAd[]>([]);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);

  // ── Categories ──────────────────────────────────────────────────────────
  const categories = [
    { name: 'Jobs',        icon: Briefcase,  link: '/jobs',        color: 'bg-blue-500',   description: 'Find your next opportunity' },
    { name: 'Marketplace', icon: ShoppingBag, link: '/marketplace', color: 'bg-green-500',  description: 'Buy & sell items' },
    { name: 'Services',    icon: Wrench,      link: '/services',    color: 'bg-purple-500', description: 'Hire professionals' },
    { name: 'Rentals',     icon: HomeIcon,    link: '/rentals',     color: 'bg-orange-500', description: 'Find your next home' },
    { name: 'Vehicles',    icon: Car,         link: '/vehicles',    color: 'bg-red-500',    description: 'Cars & motorcycles' },
    { name: 'Exchange',    icon: TrendingUp,  link: '/exchange',    color: 'bg-teal-500',   description: 'Trade items' },
  ];

  // ── Special Features tiles ───────────────────────────────────────────────
  const specialFeatures = [
    { label: 'Farm Fresh',    link: '/farm-fresh',   emoji: '🌿', bg: 'bg-green-50',   text: 'text-green-800'   },
    { label: 'Community',     link: '/community',    emoji: '🏘️', bg: 'bg-teal-50',    text: 'text-teal-800'    },
    { label: 'Group Buying',  link: '/group-buying', emoji: '👥', bg: 'bg-blue-50',    text: 'text-blue-800'    },
    { label: 'Compare Items', link: '/compare',      emoji: '⚖️', bg: 'bg-purple-50',  text: 'text-purple-800'  },
    { label: 'Bambeh AI',     link: '/ai-chat',      emoji: '🤖', bg: 'bg-indigo-50',  text: 'text-indigo-800'  },
    { label: 'Flash Deals',   link: '/deals',        emoji: '⚡', bg: 'bg-yellow-50',  text: 'text-yellow-800'  },
    { label: 'Njangi/Tontine',link: '/tontine',      emoji: '💰', bg: 'bg-amber-50',   text: 'text-amber-800'   },
    { label: 'Meet Safely',   link: '/meet-safely',  emoji: '🛡️', bg: 'bg-sky-50',     text: 'text-sky-800'     },
    { label: 'Escrow',        link: '/escrow',       emoji: '🔒', bg: 'bg-emerald-50', text: 'text-emerald-800' },
  ];

  useEffect(() => {
    // ── Featured ads (mock — replace with Supabase in production) ──────────
    setFeaturedAds([
      { id: '1', title: 'iPhone 15 Pro Max - 256GB',  price: 850000,   location: 'Bastos, Yaoundé', category: 'Electronics', subscriptionLevel: 'platinum', featured: true, posted: '2 hours ago' },
      { id: '2', title: 'Toyota Camry 2020',           price: 15000000, location: 'Douala',          category: 'Vehicles',    subscriptionLevel: 'premium',  featured: true, posted: '5 hours ago' },
      { id: '3', title: '3 Bedroom Apartment',         price: 450000,   location: 'Bastos, Yaoundé', category: 'Rentals',     subscriptionLevel: 'platinum', featured: true, posted: '1 day ago'   },
    ]);

    // ── Load recently posted listings from localStorage ─────────────────────
    try {
      const stored = localStorage.getItem('Bambeh_listings');
      if (stored) {
        const listings: RecentListing[] = JSON.parse(stored);
        const now = Date.now();
        // Only show active listings within 30-day window
        const active = listings.filter(l => {
          if (l.expiresAt && new Date(l.expiresAt).getTime() < now) return false;
          return true;
        });
        setRecentListings(active.slice(0, 10)); // 10 newest
      }
    } catch (e) {
      // silent fail — localStorage may be empty
    }
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-teal-600">Bambeh</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2">Online Marketplace</p>
          <p className="text-lg text-gray-500">
            🎉 <span className="font-bold text-green-600">Only 1% Transaction Fee!</span> — Lowest in Cameroon! 💚
          </p>

          <div className="mt-6">
            <SocialShareButton
              title="Bambeh - Online Marketplace"
              description="Join thousands buying, selling, and trading on Bambeh with only 1% transaction fee!"
              itemType="app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Share2 className="w-5 h-5" />
              Share Bambeh with Friends
            </SocialShareButton>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            ✨ SPECIAL FEATURES HUB
           ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">✨ Special Features</h2>
              <p className="text-sm text-gray-500 mt-0.5">Bambeh-exclusive tools just for you</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {specialFeatures.map((f) => (
              <Link
                key={f.link}
                to={f.link}
                className={`${f.bg} rounded-2xl p-4 text-center hover:shadow-md active:scale-95 transition-all group`}
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{f.emoji}</div>
                <p className={`font-bold ${f.text} text-xs leading-tight`}>{f.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Featured Ads ─────────────────────────────────────────────── */}
        {featuredAds.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Featured Ads</h2>
              <Link to="/marketplace" className="text-teal-600 hover:text-teal-700 font-semibold">View All →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAds.map((ad) => (
                <Link
                  key={ad.id}
                  to={`/marketplace/${ad.id}`}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 relative"
                >
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${ad.subscriptionLevel === 'platinum' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}>
                      {ad.subscriptionLevel === 'platinum' ? '⭐ PLATINUM' : '🌟 PREMIUM'}
                    </span>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <ShoppingBag className="w-20 h-20 text-blue-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{ad.title}</h3>
                    <div className="flex items-center text-gray-600 mb-3 text-sm">
                      <MapPin className="w-4 h-4 mr-1" /><span>{ad.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-teal-600">{ad.price.toLocaleString()} XAF</div>
                      <span className="text-xs text-gray-500">{ad.posted}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Listings (from localStorage) ─────────────────────── */}
        {recentListings.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🆕 Recently Posted</h2>
              <Link to="/marketplace" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">See all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={
                    listing.type === 'job'      ? `/jobs/${listing.id}` :
                    listing.type === 'vehicle'  ? `/vehicles/${listing.id}` :
                    listing.type === 'exchange' ? `/exchange/${listing.id}` :
                    listing.type === 'rental'   ? `/rentals/${listing.id}` :
                    listing.type === 'service'  ? `/services/${listing.id}` :
                    `/marketplace/${listing.id}`
                  }
                  className="bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className="relative h-36 bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center overflow-hidden">
                    {listing.primaryImage ? (
                      <ListingImage src={listing.primaryImage} alt={listing.title} width={320} height={144} imgClassName="group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <ShoppingBag className="w-14 h-14 text-teal-200 group-hover:scale-110 transition-transform" />
                    )}
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {listing.featured && (
                        <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded">⭐ Featured</span>
                      )}
                      {listing.urgent && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">🔥 Urgent</span>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className={`px-2 py-0.5 text-white text-xs font-bold rounded capitalize ${
                        listing.type === 'vehicle'  ? 'bg-green-700'  :
                        listing.type === 'exchange' ? 'bg-purple-700' :
                        listing.type === 'rental'   ? 'bg-orange-600' :
                        listing.type === 'service'  ? 'bg-blue-600'   :
                        listing.type === 'job'      ? 'bg-indigo-600' :
                        'bg-teal-600'
                      }`}>{listing.type || 'item'}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{listing.title}</h3>
                    {listing.location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" />{listing.location}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        {listing.type === 'exchange' ? (
                          <span className="font-bold text-purple-600 text-sm">🔄 Exchange / Trade</span>
                        ) : (
                          <>
                            <span className="font-bold text-teal-600 text-sm">{Number(listing.price).toLocaleString()} {listing.currency || 'XAF'}</span>
                            {listing.negotiable && <span className="ml-1 text-xs text-green-600">· Negotiable</span>}
                          </>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{timeAgo(listing.createdAt)}
                      </span>
                    </div>
                    {/* View count */}
                    <ViewCount listingId={String(listing.id)} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Categories Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.link}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
            >
              <div className="p-8">
                <div className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Why Bambeh ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Why Choose Bambeh?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1% Transaction Fee</h3>
              <p className="text-gray-600">Lowest fees in Cameroon! Only 1% per transaction.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Escrow</h3>
              <p className="text-gray-600">Your money is protected until delivery confirmation.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600">Track your orders from purchase to delivery.</p>
            </div>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of users buying, selling, and trading on Bambeh!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace" className="px-8 py-4 bg-white text-teal-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              Start Shopping
            </Link>
            <Link to="/marketplace/sell" className="px-8 py-4 bg-teal-700 text-white rounded-lg font-bold text-lg hover:bg-teal-800 transition-colors shadow-lg">
              Sell an Item
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── ViewCount Sub-Component ───────────────────────────────────────────────────
// Reads view count from localStorage and shows it on each listing card.
function ViewCount({ listingId }: { listingId: string }) {
  const key = `Bambeh_views_${listingId}`;
  const count = parseInt(localStorage.getItem(key) || '0');
  if (count === 0) return null;
  return (
    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
      <Eye className="w-3 h-3" />{count} {count === 1 ? 'view' : 'views'}
    </p>
  );
}

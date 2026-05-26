/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMMUNITY PAGE - BAMBEH MARKETPLACE
 * Communauté — Neighbourhood Groups for Group Buying, Local Deals & Services
 * 
 * Inspired by Cameroon's strong community culture (tontines, groupes d'achat).
 * Buyers can join groups by quartier and organize bulk purchases.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  city: string;
  quartier: string;
  emoji: string;
  members: number;
  recentPosts: number;
  category: 'quartier' | 'buying' | 'jobs' | 'services' | 'farming';
  description: string;
  isJoined: boolean;
}

const CATEGORY_CONFIG = {
  quartier: { label: 'Quartier Group', color: 'bg-teal-100 text-teal-800', emoji: '🏘️' },
  buying:   { label: 'Group Buying',   color: 'bg-blue-100 text-blue-800', emoji: '🛒' },
  jobs:     { label: 'Jobs & Career',  color: 'bg-purple-100 text-purple-800', emoji: '💼' },
  services: { label: 'Services',       color: 'bg-yellow-100 text-yellow-800', emoji: '🔧' },
  farming:  { label: 'Farm & Agri',    color: 'bg-green-100 text-green-800', emoji: '🌿' },
};

const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'c1', name: 'Bastos Residents', city: 'Yaoundé', quartier: 'Bastos', emoji: '🏡',
    members: 2341, recentPosts: 18, category: 'quartier',
    description: 'Community for residents of Bastos and surrounding streets. Share deals, request services, and coordinate neighbourhood purchases.',
    isJoined: true,
  },
  {
    id: 'c2', name: 'Achat Groupé Électronique YDE', city: 'Yaoundé', quartier: 'Centre-ville', emoji: '📱',
    members: 892, recentPosts: 34, category: 'buying',
    description: 'Coordinating bulk phone and electronics purchases in Yaoundé to unlock wholesale prices from vendors.',
    isJoined: false,
  },
  {
    id: 'c3', name: 'Akwa Business Network', city: 'Douala', quartier: 'Akwa', emoji: '💼',
    members: 1567, recentPosts: 22, category: 'jobs',
    description: 'Job opportunities and professional networking for Akwa business district. Post vacancies, find talent.',
    isJoined: false,
  },
  {
    id: 'c4', name: 'Fermiers du Centre', city: 'Yaoundé', quartier: 'Mvan', emoji: '🌱',
    members: 423, recentPosts: 9, category: 'farming',
    description: 'Farmers and agricultural producers of Centre Region. Share prices, coordinate city deliveries, find wholesale buyers.',
    isJoined: false,
  },
  {
    id: 'c5', name: 'Mboppi Quarter Helpers', city: 'Douala', quartier: 'Mboppi', emoji: '🤝',
    members: 1103, recentPosts: 41, category: 'services',
    description: 'Finding trusted plumbers, electricians, cleaners and artisans in Mboppi neighbourhood.',
    isJoined: false,
  },
  {
    id: 'c6', name: 'Mvog-Mbi Deals & Offers', city: 'Yaoundé', quartier: 'Mvog-Mbi', emoji: '🎯',
    members: 654, recentPosts: 15, category: 'quartier',
    description: 'Share flash deals, discount vouchers, and local promotions for Mvog-Mbi and Melen neighbourhoods.',
    isJoined: false,
  },
  {
    id: 'c7', name: 'Bépanda Achat Groupé', city: 'Douala', quartier: 'Bépanda', emoji: '🛍️',
    members: 789, recentPosts: 27, category: 'buying',
    description: 'Coordinating bulk grocery purchases every Saturday from Marché Bépanda. Save up to 30% on staples.',
    isJoined: false,
  },
  {
    id: 'c8', name: 'Bamenda Tech & Youth', city: 'Bamenda', quartier: 'Commercial Avenue', emoji: '💻',
    members: 312, recentPosts: 8, category: 'jobs',
    description: 'IT jobs, freelancing opportunities, and tech entrepreneurship for Bamenda and the North-West Region.',
    isJoined: false,
  },
];

const CommunityPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | Community['category']>('all');
  const [cityFilter, setCityFilter] = useState('All');
  const [communities, setCommunities] = useState(MOCK_COMMUNITIES);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleJoin = (id: string) => {
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, isJoined: !c.isJoined } : c));
  };

  const filtered = communities.filter(c => {
    const matchCat  = activeFilter === 'all' || c.category === activeFilter;
    const matchCity = cityFilter === 'All' || c.city === cityFilter;
    return matchCat && matchCity;
  });

  const myGroups = communities.filter(c => c.isJoined);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white pt-8 pb-14 px-4">
        <div className="max-w-xl mx-auto">
          <Link to="/" className="flex items-center gap-2 text-teal-200 hover:text-white text-sm mb-5 transition-colors">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🏘️ Communauté</h1>
              <p className="text-teal-100 text-sm mt-1">Join your neighbourhood. Buy together. Save together.</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-teal-700 font-bold px-3 py-2 rounded-xl text-sm hover:bg-teal-50 transition-colors"
            >
              + Create
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { value: communities.length, label: 'Groups', emoji: '🏘️' },
              { value: communities.reduce((s, c) => s + c.members, 0).toLocaleString(), label: 'Members', emoji: '👥' },
              { value: myGroups.length, label: 'Joined', emoji: '✅' },
            ].map(s => (
              <div key={s.label} className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <div className="font-bold">{s.emoji} {s.value}</div>
                <div className="text-teal-200 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-6 space-y-5">

        {/* ── My Groups (if any joined) ── */}
        {myGroups.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4">
            <h2 className="font-bold text-gray-900 mb-3">✅ My Groups ({myGroups.length})</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {myGroups.map(g => (
                <Link
                  key={g.id}
                  to={`/community/${g.id}`}
                  className="flex-shrink-0 flex flex-col items-center gap-1 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 min-w-[80px] hover:bg-teal-100 transition-colors"
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="text-teal-800 text-xs font-semibold text-center leading-tight">{g.name.split(' ').slice(0, 2).join(' ')}</span>
                </Link>
              ))}
            </div>
          </div>
        )},
        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-3">
            {(['all', 'quartier', 'buying', 'jobs', 'services', 'farming'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? '🌍 All Groups' : `${CATEGORY_CONFIG[f].emoji} ${CATEGORY_CONFIG[f].label}`}
              </button>
            ))}
          </div>
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {['All', 'Yaoundé', 'Douala', 'Bamenda', 'Bafoussam'].map(c => <option key={c}>{c}</option>)}
          </select>
          <p className="text-gray-400 text-xs mt-2">{filtered.length} group{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* ── Community Cards ── */}
        <div className="space-y-4">
          {filtered.map(community => {
            const cfg = CATEGORY_CONFIG[community.category];
            return (
              <div key={community.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                      {community.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{community.name}</h3>
                          <p className="text-gray-500 text-xs">📍 {community.quartier}, {community.city}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed">{community.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>👥 {community.members.toLocaleString()} members</span>
                        <span>💬 {community.recentPosts} posts today</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/community/${community.id}`}
                      className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm text-center hover:bg-gray-200 transition-colors"
                    >
                      View Group
                    </Link>
                    <button
                      onClick={() => toggleJoin(community.id)}
                      className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                        community.isJoined
                          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      {community.isJoined ? '✓ Leave Group' : '+ Join Group'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Tontine CTA ── */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl">💰</span>
            <div>
              <h3 className="font-bold text-lg">Njangi / Tontine Groups</h3>
              <p className="text-amber-100 text-sm mt-1">Pool Zerm Coins with your group to unlock bulk discounts. Cameroon's first digital tontine marketplace.</p>
              <Link
                to="/tontine"
      className="inline-block mt-3 bg-white text-amber-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-50 transition-colors"
              >
                Explore Njangi Groups →
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ── Create Group Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create a Community Group</h3>
            <p className="text-gray-600 text-sm mb-5">
              Start a group for your neighbourhood, a shared interest, or an industry.
              Groups with 10+ members unlock Bambeh's Group Buying discounts.
            </p>
            <Link
              to="/report-issue"
              onClick={() => setShowCreateModal(false)}
              className="w-full block text-center py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
            >
              Submit Group Request
            </Link>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full mt-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
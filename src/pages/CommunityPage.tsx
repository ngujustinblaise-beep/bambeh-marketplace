/**
 * src/pages/CommunityPage.tsx — Bambeh Marketplace
 *
 * FIXED:
 *  ? Create Group opens an INLINE MODAL — no page redirect
 *  ? Created groups immediately appear in the list
 *  ? Share button is compact icon, never blocks UI
 *  ? Beautiful Unsplash group cover images
 *  ? West & Central Africa country codes in create form
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Search, Plus, X, ArrowRight, Globe, Lock,
  ChevronRight, Share2, Check, MessageCircle, Copy,
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

// --- Types --------------------------------------------------------------------

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  coverUrl?: string;
  members: number;
  isJoined: boolean;
  isPublic: boolean;
  isUserCreated?: boolean;
}

// --- Demo groups with Unsplash covers -----------------------------------------

const INITIAL_GROUPS: Group[] = [
  {
    id: '1',
    name: 'Yaoundé Tech Entrepreneurs',
    description: 'A community for tech founders and developers in Yaoundé to share resources and opportunities.',
    category: 'Technology',
    emoji: '??',
    coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=80',
    members: 1240,
    isJoined: false,
    isPublic: true,
  },
  {
    id: '2',
    name: 'Women in Business Cameroon',
    description: 'Supporting and empowering women entrepreneurs across all 10 regions of Cameroon.',
    category: 'Business',
    emoji: '?????',
    coverUrl: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=400&q=80',
    members: 3456,
    isJoined: true,
    isPublic: true,
  },
  {
    id: '3',
    name: 'Douala Marketplace Buyers',
    description: 'Connect with trusted buyers and sellers in Douala. Share deals and offers daily.',
    category: 'Commerce',
    emoji: '??',
    coverUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80',
    members: 892,
    isJoined: false,
    isPublic: true,
  },
  {
    id: '4',
    name: 'Agriculture & Farming Network',
    description: 'For farmers, agro-processors, and agricultural entrepreneurs across Cameroon.',
    category: 'Agriculture',
    emoji: '??',
    coverUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80',
    members: 567,
    isJoined: false,
    isPublic: true,
  },
  {
    id: '5',
    name: 'Bambeh Flash Deal Hunters',
    description: 'Get notified first about flash deals, bulk buys, and exclusive offers on Bambeh.',
    category: 'Deals',
    emoji: '?',
    coverUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80',
    members: 2103,
    isJoined: true,
    isPublic: true,
  },
  {
    id: '6',
    name: 'Bamenda Buyers & Sellers',
    description: 'Local trade community for Bamenda and the North-West Region. Post items, find deals.',
    category: 'Commerce',
    emoji: '??',
    coverUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=80',
    members: 740,
    isJoined: false,
    isPublic: true,
  },
];

const CATEGORIES = ['All', 'Technology', 'Business', 'Commerce', 'Agriculture', 'Deals', 'Education', 'Health'];

const DIAL_CODES = [
  { code: '+237', flag: '????', name: 'Cameroun' },
  { code: '+234', flag: '????', name: 'Nigeria' },
  { code: '+233', flag: '????', name: 'Ghana' },
  { code: '+221', flag: '????', name: 'Sénégal' },
  { code: '+225', flag: '????', name: "Côte d'Ivoire" },
  { code: '+241', flag: '????', name: 'Gabon' },
  { code: '+242', flag: '????', name: 'Congo' },
  { code: '+243', flag: '????', name: 'RD Congo' },
];

// --- Share Modal --------------------------------------------------------------

function ShareModal({ group, onClose }: { group: Group; onClose: () => void }) {
  const lang = useLang();
  const isRtl = lang === "ar";
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}#/community/${group.id}`;

  const copy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const waText = `Join "${group.name}" on Bambeh Community!\n\n${group.description}\n\n?? Join here:\n${url}`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 px-5 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold">Share Group</h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-600">Invite people to join <strong>{group.name}</strong></p>
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 break-all font-mono">{url}</div>
          <button onClick={copy}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all ${
              copied ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 transition-all">
            <MessageCircle className="w-4 h-4" /> Share on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// --- Create Group Modal -------------------------------------------------------

function CreateGroupModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (group: Group) => void;
}) {
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('Business');
  const [isPublic,    setIsPublic]    = useState(true);
  const [dialCode,    setDialCode]    = useState('+237');
  const [phone,       setPhone]       = useState('');
  const [showDial,    setShowDial]    = useState(false);
  const [saving,      setSaving]      = useState(false);

  const CAT_OPTIONS = ['Business', 'Technology', 'Commerce', 'Agriculture', 'Education', 'Health', 'Arts', 'Sports', 'Finance', 'Other'];
  const CAT_EMOJIS: Record<string, string> = {
    Business: '??', Technology: '??', Commerce: '??', Agriculture: '??',
    Education: '??', Health: '??', Arts: '??', Sports: '?', Finance: '??', Other: '??',
  };

  const COVER_URLS: Record<string, string> = {
    Business:    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&q=80',
    Technology:  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
    Commerce:    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80',
    Agriculture: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80',
    Education:   'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&q=80',
    Health:      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
    Arts:        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80',
    Sports:      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
    Finance:     'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
    Other:       'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
  };

  const canCreate = name.trim().length >= 3 && description.trim().length >= 10;

  async function handleCreate() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const newGroup: Group = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      emoji: CAT_EMOJIS[category] || '??',
      coverUrl: COVER_URLS[category],
      members: 1,
      isJoined: true,
      isPublic,
      isUserCreated: true,
    };
    setSaving(false);
    onCreated(newGroup);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Create a Group</h2>
            <p className="text-teal-100 text-xs mt-0.5">Build your own community on Bambeh</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Group Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Douala Fashion Entrepreneurs"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-400 mt-1">{name.length}/60 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this group about? Who should join?"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {CAT_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                    category === c
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'border-gray-200 text-gray-600 hover:border-teal-300'
                  }`}
                >
                  {CAT_EMOJIS[c]} {c}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Privacy</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsPublic(true)}
                className={`py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
                  isPublic ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-200 text-gray-600 hover:border-teal-300'
                }`}
              >
                <Globe className="w-4 h-4" /> Public
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className={`py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
                  !isPublic ? 'bg-teal-500 text-white border-teal-500' : 'border-gray-200 text-gray-600 hover:border-teal-300'
                }`}
              >
                <Lock className="w-4 h-4" /> Private
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {isPublic ? 'Anyone can find and join this group.' : 'Only invited people can join.'}
            </p>
          </div>

          {/* WhatsApp Contact */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Admin WhatsApp (optional)</label>
            <div className="flex gap-0 relative">
              <button
                type="button"
                onClick={() => setShowDial(v => !v)}
                className="flex items-center gap-1 px-3 py-3 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm"
              >
                <span>{DIAL_CODES.find(d => d.code === dialCode)?.flag}</span>
                <span className="font-medium text-gray-700">{dialCode}</span>
                <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
              </button>
              {showDial && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDial(false)} />
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-20 max-h-48 overflow-y-auto">
                    {DIAL_CODES.map(d => (
                      <button key={d.code} type="button"
                        onClick={() => { setDialCode(d.code); setShowDial(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 ${d.code === dialCode ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}`}
                      >
                        <span>{d.flag}</span>
                        <span className="font-medium">{d.code}</span>
                        <span className="text-gray-400 text-xs truncate">{d.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <input
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="6XX XXX XXX"
                type="tel"
                className="flex-1 border border-gray-200 rounded-r-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Preview */}
          {name && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-20 relative bg-gray-100">
                <img
                  src={COVER_URLS[category]}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30"/>
                <div className="absolute bottom-2 left-3 text-white">
                  <p className="font-bold text-sm">{CAT_EMOJIS[category]} {name || 'Group Name'}</p>
                  <p className="text-xs text-white/80">{category} · {isPublic ? 'Public' : 'Private'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Create button */}
          <button
            disabled={!canCreate || saving}
            onClick={handleCreate}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Creating...</>
            ) : (
              <><Users className="w-4 h-4" /> Create Group</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- GroupCard ----------------------------------------------------------------

function GroupCard({ group, onShare }: { group: Group; onShare: (g: Group) => void }) {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(group.isJoined);
  const [count,  setCount]  = useState(group.members);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Cover image */}
      <div
        className="h-28 relative cursor-pointer overflow-hidden bg-gradient-to-br from-teal-100 to-teal-200"
        onClick={() => navigate(`/community/${group.id}`)}
      >
        {group.coverUrl && (
          <img src={group.coverUrl} alt={group.name} className="w-full h-full object-cover" loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"/>
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <div>
            <p className="text-white font-bold text-sm leading-tight line-clamp-1">{group.emoji} {group.name}</p>
            <p className="text-white/80 text-xs">{group.category}</p>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onShare(group); }}
            className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        {group.isUserCreated && (
          <div className="absolute top-2 left-2">
            <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Your Group</span>
          </div>
        )}
        {!group.isPublic && (
          <div className="absolute top-2 right-2">
            <span className="bg-gray-800/70 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Private
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-teal-600 font-medium mb-1 flex items-center gap-1">
          <Users className="w-3 h-3" /> {count.toLocaleString()} members
        </p>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{group.description}</p>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/community/${group.id}`)}
            className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => {
              setJoined(v => !v);
              setCount(c => joined ? c - 1 : c + 1);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
              joined
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200'
                : 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-sm shadow-teal-500/20'
            }`}
          >
            {joined ? '? Joined' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------

export default function CommunityPage() {
  const [groups,       setGroups]       = useState<Group[]>(INITIAL_GROUPS);
  const [search,       setSearch]       = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showCreate,   setShowCreate]   = useState(false);
  const [shareTarget,  setShareTarget]  = useState<Group | null>(null);
  const [toast,        setToast]        = useState('');

  const filtered = groups.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== 'All' && g.category !== activeCategory) return false;
    return true;
  });

  const handleGroupCreated = (newGroup: Group) => {
    setGroups(prev => [newGroup, ...prev]);
    setShowCreate(false);
    setToast(`"${newGroup.name}" created successfully! ??`);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold max-w-xs text-center">
          {toast}
        </div>
      )}

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-7">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Community ??</h1>
            <p className="text-teal-100 text-sm mt-0.5">Connect, trade, and grow together</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/95 text-gray-900 text-sm placeholder-gray-400 outline-none shadow"
            placeholder="Search groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === c ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Groups',      value: `${groups.length}+` },
            { label: 'Members',     value: '8.2K' },
            { label: 'Posts Today', value: '342' },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="font-bold text-lg text-teal-600 dark:text-teal-400">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ? CREATE GROUP BUTTON — opens modal, never redirects */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-2xl shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">?</div>
            <div className="text-left">
              <p className="font-bold text-sm">Create a Group</p>
              <p className="text-teal-100 text-xs">Build your own community on Bambeh</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70" />
        </button>

        {/* Group list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">??</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">No groups found</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="mt-3 text-sm text-teal-600 font-semibold">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(g => <GroupCard key={g.id} group={g} onShare={setShareTarget} />)}
          </div>
        )}

        {/* Group Buying link */}
        <Link to="/group-buying"
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">??</span>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">Group Buying</p>
              <p className="text-xs text-gray-500">Buy together, save more</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={handleGroupCreated} />
      )}
      {shareTarget && (
        <ShareModal group={shareTarget} onClose={() => setShareTarget(null)} />
      )}
    </div>
  );
}





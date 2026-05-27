/**
 * src/pages/CommunityPage.tsx
 *
 * KEY FIX: The share banner was a full-screen overlay covering the
 * "Create Group" button. It is now a compact ShareButton icon.
 *
 * The share functionality is preserved — it just doesn't block the UI.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShareButton } from "@/components/shared";

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_GROUPS = [
  {
    id: "1",
    name: "Yaoundé Tech Entrepreneurs",
    description: "A community for tech founders and developers in Yaoundé to share resources and opportunities.",
    category: "Technology",
    emoji: "💻",
    members: 1240,
    isJoined: false,
    isPublic: true,
  },
  {
    id: "2",
    name: "Cameroon Women in Business",
    description: "Supporting and empowering women entrepreneurs across all 10 regions of Cameroon.",
    category: "Business",
    emoji: "👩‍💼",
    members: 3456,
    isJoined: true,
    isPublic: true,
  },
  {
    id: "3",
    name: "Douala Marketplace Buyers",
    description: "Connect with trusted buyers and sellers in Douala. Share deals and offers daily.",
    category: "Commerce",
    emoji: "🛒",
    members: 892,
    isJoined: false,
    isPublic: true,
  },
  {
    id: "4",
    name: "Agriculture & Farming Network",
    description: "For farmers, agro-processors, and agricultural entrepreneurs across Cameroon.",
    category: "Agriculture",
    emoji: "🌾",
    members: 567,
    isJoined: false,
    isPublic: true,
  },
  {
    id: "5",
    name: "Bambeh Flash Deal Hunters",
    description: "Get notified first about flash deals, bulk buys, and exclusive offers on Bambeh.",
    category: "Deals",
    emoji: "⚡",
    members: 2103,
    isJoined: true,
    isPublic: true,
  },
];

const CATEGORIES = ["All", "Technology", "Business", "Commerce", "Agriculture", "Deals", "Education", "Health"];

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ group }: { group: typeof DEMO_GROUPS[0] }) {
  const navigate = useNavigate();
  const [joined, setJoined] = useState(group.isJoined);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100
                    dark:border-gray-700 overflow-hidden">
      <div
        className="p-4 cursor-pointer"
        onClick={() => navigate(`/community/${group.id}`)}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center
                          justify-center text-2xl flex-shrink-0">
            {group.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug truncate">
                  {group.name}
                </h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">
                  {group.category} · {group.members.toLocaleString()} members
                </p>
              </div>
              {/*
               * FIXED: Was a large share banner. Now a compact icon button.
               * Does NOT cover any other UI element.
               */}
              <ShareButton
                title={group.name}
                text={`Join "${group.name}" on Bambeh Community!`}
                url={`${window.location.origin}${window.location.pathname}#/community/${group.id}`}
                size="sm"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
              {group.description}
            </p>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => navigate(`/community/${group.id}`)}
          className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-xs
                     font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50
                     dark:hover:bg-gray-700 transition-colors"
        >
          View Group
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setJoined((v) => !v);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98]
                      ${joined
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600"
                        : "bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-sm shadow-teal-500/20"}`}
        >
          {joined ? "✓ Joined" : "Join Group"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = DEMO_GROUPS.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== "All" && g.category !== activeCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 px-4 pt-5 pb-7">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Community 👥</h1>
            <p className="text-teal-100 text-sm mt-0.5">Connect, trade, and grow together</p>
          </div>
          {/*
           * FIXED: The old code had a full-screen share banner here.
           * Replaced with a small compact share button that doesn't block anything.
           */}
          <ShareButton
            title="Bambeh Community"
            text="Join thousands of Cameroonians on Bambeh Community!"
            size="md"
            className="bg-white/20 text-white hover:bg-white/30"
          />
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/95 text-gray-900
                       text-sm placeholder-gray-400 outline-none shadow"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700
                      px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                          ${activeCategory === c
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Groups", value: "124+" },
            { label: "Members", value: "8.2K" },
            { label: "Posts Today", value: "342" },
          ].map((s) => (
            <div key={s.label}
                 className="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center shadow-sm
                            border border-gray-100 dark:border-gray-700">
              <p className="font-bold text-lg text-teal-600 dark:text-teal-400">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/*
         * CREATE GROUP BUTTON
         * Previously blocked by the share banner. Now always visible.
         */}
        <button
          onClick={() => navigate("/community/create")}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-teal-500
                     to-teal-700 text-white rounded-2xl shadow-lg shadow-teal-500/25
                     active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              ➕
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Create a Group</p>
              <p className="text-teal-100 text-xs">Build your own community on Bambeh</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Group list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-gray-600 dark:text-gray-400">No groups found</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-3 text-sm text-teal-600 font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((g) => <GroupCard key={g.id} group={g} />)
        )}

        {/* Group buying link */}
        <Link
          to="/group-buying"
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl
                     shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">Group Buying</p>
              <p className="text-xs text-gray-500">Buy together, save more</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

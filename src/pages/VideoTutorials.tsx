/**
 * src/pages/help/VideoTutorials.tsx — Bambeh Marketplace
 * FIXED: Was a stub (emoji + title). Now a full video tutorial index.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen, ShoppingBag, Briefcase, Home, Car, Shield, Zap } from 'lucide-react';

interface Tutorial {
  id:       string;
  title:    string;
  duration: string;
  category: string;
  emoji:    string;
  description: string;
}

const TUTORIALS: Tutorial[] = [
  { id:'1', title:'How to Post a Marketplace Listing',       duration:'3:24', category:'Selling',    emoji:'🛍️', description:'Step-by-step guide to selling items on Bambeh.' },
  { id:'2', title:'How to Find and Apply for Jobs',           duration:'2:51', category:'Jobs',       emoji:'💼', description:'Search and apply for jobs in .' },
  { id:'3', title:'How Escrow Payments Work',                 duration:'4:12', category:'Safety',     emoji:'🔒', description:'Protect your money with Bambeh escrow.' },
  { id:'4', title:'Subscribing with MTN MoMo / Orange Money', duration:'2:05', category:'Payments',   emoji:'📱', description:'Unlock all features with a daily/weekly/monthly plan.' },
  { id:'5', title:'How to Exchange Items',                    duration:'2:38', category:'Exchange',   emoji:'🔄', description:'Swap items with other Bambeh users.' },
  { id:'6', title:'Creating a Tontine Savings Group',         duration:'3:48', category:'Tontine',    emoji:'💰', description:'Start or join a digital njangi group.' },
  { id:'7', title:'Posting a Rental Property',               duration:'2:20', category:'Rentals',    emoji:'🏠', description:'List your apartment or house for rent.' },
  { id:'8', title:'Selling a Vehicle on Bambeh',             duration:'2:55', category:'Vehicles',   emoji:'🚗', description:'Post your car or motorcycle for sale.' },
  { id:'9', title:'Using Farm Fresh to Sell Produce',        duration:'3:10', category:'Farm Fresh',  emoji:'🌿', description:'Connect your farm directly to buyers.' },
  { id:'10',title:'Group Buying: Save More Together',        duration:'2:44', category:'Group Buy',   emoji:'👥', description:'Join bulk purchases and unlock lower prices.' },
  { id:'11',title:'How to Stay Safe When Meeting Buyers',    duration:'3:05', category:'Safety',     emoji:'🤝', description:'Best practices for safe in-person meetups.' },
  { id:'12',title:'Earning and Using Zerm Coins',            duration:'1:58', category:'Payments',   emoji:'⚡', description:'Earn, buy, and spend Zerm Coins.' },
];

const CATEGORIES = ['All', 'Selling', 'Jobs', 'Safety', 'Payments', 'Exchange', 'Tontine', 'Rentals', 'Vehicles', 'Farm Fresh', 'Group Buy'];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Selling:     <ShoppingBag className="w-4 h-4" />,
  Jobs:        <Briefcase   className="w-4 h-4" />,
  Safety:      <Shield      className="w-4 h-4" />,
  Payments:    <Zap         className="w-4 h-4" />,
  Exchange:    <BookOpen    className="w-4 h-4" />,
  Rentals:     <Home        className="w-4 h-4" />,
  Vehicles:    <Car         className="w-4 h-4" />,
};

export default function VideoTutorials() {
  const navigate  = useNavigate();
  const [category, setCategory] = useState('All');
  const [playing,  setPlaying]  = useState<string | null>(null);

  const filtered = TUTORIALS.filter(t => category === 'All' || t.category === category);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900">Video Tutorials</h1>
      </div>

      {/* Banner */}
      <div className="mx-4 mt-4 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white mb-4">
        <h2 className="font-bold text-lg mb-1">🎬 Learn Bambeh in Minutes</h2>
        <p className="text-teal-100 text-sm">Short video guides for every feature — no experience needed.</p>
        <p className="text-teal-200 text-xs mt-2">{TUTORIALS.length} tutorials available</p>
      </div>

      {/* Category filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                category === c ? 'bg-teal-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}>
              {CATEGORY_ICONS[c]}
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorial list */}
      <div className="px-4 space-y-3">
        {filtered.map(tutorial => (
          <div key={tutorial.id}
            className={`bg-white rounded-2xl shadow-sm border transition-all ${playing === tutorial.id ? 'ring-2 ring-teal-500' : ''}`}>
            <div className="flex items-center gap-4 p-4">
              {/* Thumbnail */}
              <div
                onClick={() => setPlaying(playing === tutorial.id ? null : tutorial.id)}
                className="w-20 h-14 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer hover:from-teal-100 transition-colors relative">
                <span className="text-2xl">{tutorial.emoji}</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`${playing === tutorial.id ? 'bg-teal-600' : 'bg-black/40 hover:bg-black/60'} text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors`}>
                    <Play className="w-3 h-3 ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{tutorial.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{tutorial.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full font-medium">{tutorial.category}</span>
                  <span className="text-xs text-gray-400">⏱ {tutorial.duration}</span>
                </div>
              </div>
            </div>

            {/* Expanded playing state */}
            {playing === tutorial.id && (
              <div className="px-4 pb-4">
                <div className="bg-gray-900 rounded-xl h-48 flex flex-col items-center justify-center text-white gap-3">
                  <span className="text-4xl">{tutorial.emoji}</span>
                  <p className="font-semibold text-sm">{tutorial.title}</p>
                  <p className="text-gray-400 text-xs text-center px-4">
                    Video tutorials will play here once connected to a streaming host.<br />
                    Visit <span className="text-teal-400">bambeh.cm/tutorials</span> for full video access.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Help link */}
      <div className="mx-4 mt-6 bg-white rounded-2xl p-4 shadow-sm border text-center">
        <p className="text-sm text-gray-600 mb-2">Prefer reading? Check our written guides.</p>
        <button onClick={() => navigate('/help/guides')}
          className="text-teal-600 font-semibold text-sm underline">
          Browse Help Guides →
        </button>
      </div>
    </div>
  );
}


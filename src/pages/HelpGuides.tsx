/**
 * src/pages/HelpGuides.tsx — Bambeh Marketplace
 * FIXED: Was a stub. Now a full help center with categories and guides.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, ShoppingBag, Briefcase, Shield,
  CreditCard, Zap, ChevronRight, Search, MessageCircle
} from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface Guide {
  id: string;
  title: string;
  summary: string;
  content: string;
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  guides: Guide[];
}

const CATEGORIES: Category[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    guides: [
      {
        id: 'gs-1', title: 'How to create an account',
        summary: 'Sign up with email or phone in under 2 minutes.',
        content: '1. Open Bambeh and tap "Sign Up"\n2. Enter your email or phone number\n3. Choose a strong password\n4. Verify your email or phone\n5. Complete your profile with your name and photo\n\nYour account is now ready to buy and sell!',
      },
      {
        id: 'gs-2', title: 'How to subscribe to a plan',
        summary: 'Unlock all features with Daily, Weekly, or Monthly plan.',
        content: '1. Tap the "Subscribe" button on any gated page\n2. Enter your MTN MoMo or Orange Money number\n3. Choose your plan:\n   • Daily — 100 XAF (24 hours)\n   • Weekly — 500 XAF (7 days)\n   • Monthly — 1500 XAF (30 days)\n4. Approve the payment prompt on your phone\n5. Access unlocks instantly!',
      },
      {
        id: 'gs-3', title: 'How to post a listing',
        summary: 'Sell items, post jobs, or offer services.',
        content: '1. Tap the + (Add) button at the bottom\n2. Choose your listing type: Sell Item, Post Job, Offer Service, or List Property\n3. Fill in the title, description, price, and location\n4. Add photos (up to 6)\n5. Tap "Post" — your listing is now live and visible to all users!',
      },
    ],
  },
  {
    id: 'buying',
    title: 'Buying',
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    guides: [
      {
        id: 'buy-1', title: 'How to contact a seller',
        summary: 'Message or call sellers directly from any listing.',
        content: '1. Open the listing you are interested in\n2. Tap "Message" to chat with the seller\n   OR tap "Call" if they have listed a phone number\n3. Negotiate the price if needed\n4. Agree on meeting point or delivery\n\nTip: Always meet in a public place for safety.',
      },
      {
        id: 'buy-2', title: 'How escrow protection works',
        summary: 'Pay safely — funds held until you confirm delivery.',
        content: '1. Request escrow when buying expensive items\n2. Pay through Bambeh — funds are held securely\n3. Seller ships or delivers the item\n4. You inspect the item\n5. If all good: tap "Release Funds" → seller gets paid\n6. If there is a problem: tap "Dispute" → our team mediates within 48 hours\n\nEscrow protects both buyers and sellers.',
      },
      {
        id: 'buy-3', title: 'How to add items to favorites',
        summary: 'Save items to compare or buy later.',
        content: '1. Open any listing\n2. Tap the heart ♡ icon at the top right\n3. The item is saved to your Favorites\n4. Find all saved items under Profile → Favorites\n\nFavorites sync across all your devices.',
      },
    ],
  },
  {
    id: 'selling',
    title: 'Selling',
    icon: <Briefcase className="w-5 h-5" />,
    color: 'bg-green-50 text-green-700 border-green-200',
    guides: [
      {
        id: 'sell-1', title: 'Tips for a great listing',
        summary: 'Get more buyers with these simple tips.',
        content: 'Title: Be specific — "Samsung Galaxy A54 128GB" not just "Phone"\n\nPhotos: Add at least 3 clear photos from different angles\n\nPrice: Research what similar items sell for. Mark as "Negotiable" if flexible.\n\nDescription: Include condition, age, reason for selling, and any flaws.\n\nLocation: Always add your city — buyers filter by location.',
      },
      {
        id: 'sell-2', title: 'How to edit or delete a listing',
        summary: 'Update your listing at any time.',
        content: '1. Go to Profile → My Listings\n2. Find the listing you want to change\n3. Tap the pencil ✏️ icon to edit\n   OR tap the trash 🗑️ icon to delete\n4. Make your changes and tap Save\n\nEdited listings update instantly on all devices.',
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & Security',
    icon: <Shield className="w-5 h-5" />,
    color: 'bg-red-50 text-red-700 border-red-200',
    guides: [
      {
        id: 'safe-1', title: 'How to meet safely',
        summary: 'Best practices for in-person transactions.',
        content: 'Always:\n✅ Meet in a public place (market, café, shopping mall)\n✅ Bring a friend or tell someone where you are going\n✅ Test electronics before paying\n✅ Count cash before handing over the item\n✅ Trust your instincts — if something feels wrong, leave\n\nNever:\n❌ Send money before seeing the item\n❌ Meet in isolated locations\n❌ Share your home address with strangers',
      },
      {
        id: 'safe-2', title: 'How to spot and report scams',
        summary: 'Protect yourself from fraudulent listings.',
        content: 'Warning signs:\n🚩 Price too good to be true\n🚩 Seller asks you to pay first before meeting\n🚩 Asks you to pay via bank transfer to unknown account\n🚩 Rushes you to decide quickly\n🚩 Refuses to meet in person\n\nIf you spot a scam:\n1. Do not pay anything\n2. Open the listing → tap ⋯ → "Report Listing"\n3. Our team reviews all reports within 24 hours',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    guides: [
      {
        id: 'pay-1', title: 'Accepted payment methods',
        summary: 'MTN MoMo, Orange Money, and more.',
        content: 'Bambeh accepts:\n📱 MTN Mobile Money\n🟠 Orange Money\n💳 Visa / Mastercard\n🏦 Express Union\n\nFor subscriptions: pay directly from the subscription page.\nFor item purchases: agree with the seller — most use mobile money.\nFor escrow: Bambeh holds funds securely via CamPay.',
      },
      {
        id: 'pay-2', title: 'What are Zerm Coins?',
        summary: 'Bambeh\'s digital rewards currency.',
        content: 'Zerm Coins (ZC) are Bambeh\'s loyalty currency.\n\nEarn coins by:\n⭐ Referring friends to Bambeh\n⭐ Daily login bonus\n⭐ Completing your profile\n⭐ Buying from verified sellers\n\nSpend coins on:\n💎 Boosting your listings\n💎 Unlocking premium features\n💎 Sending as gifts to other users\n\nFind your Zerm Coins balance under Profile → Wallet.',
      },
    ],
  },
  {
    id: 'features',
    title: 'Special Features',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    guides: [
      {
        id: 'feat-1', title: 'How group buying works',
        summary: 'More buyers = lower price for everyone.',
        content: '1. Browse Group Deals from the home screen\n2. Tap "Join Deal" on a product you want\n3. Share the deal with friends\n4. When enough people join, the deal activates\n5. Everyone pays the reduced group price\n6. Order is placed together — you all receive your items\n\nThe more people join, the bigger the discount!',
      },
      {
        id: 'feat-2', title: 'How tontine (njangi) groups work',
        summary: 'Digital version of \'s traditional savings group.',
        content: 'A tontine on Bambeh works like a traditional njangi:\n\n1. Join or create a group\n2. All members contribute an agreed amount each cycle\n3. One member receives the pot each cycle\n4. Cycle continues until everyone has received once\n\nBambeh\'s tontine is digital — contributions tracked automatically, no cash handling needed.',
      },
      {
        id: 'feat-3', title: 'How to exchange items',
        summary: 'Swap your item for someone else\'s — no money needed.',
        content: '1. Go to Exchange from the menu\n2. Browse items people want to swap\n3. Tap "Make an Offer" and describe what you\'ll offer in return\n4. The owner reviews your offer and accepts or declines\n5. If accepted, arrange the swap via chat\n\nExchange is perfect when you want something but prefer to trade instead of pay cash.',
      },
    ],
  },
];

export default function HelpGuides() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const navigate   = useNavigate();
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<Guide | null>(null);
  const [catOpen,  setCatOpen]  = useState<string | null>(null);

  const searchResults = search.trim().length > 1
    ? CATEGORIES.flatMap(c => c.guides).filter(g =>
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.summary.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // ── Guide detail view ──────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-gray-900 flex-1 text-sm leading-tight">{selected.title}</h1>
        </div>
        <div className="max-w-lg mx-auto p-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-1">{selected.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{selected.summary}</p>
            <div className="border-t pt-4">
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{selected.content}</p>
            </div>
          </div>
          <div className="mt-4 bg-teal-50 border border-teal-200 rounded-2xl p-4 flex gap-3 items-start">
            <MessageCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-teal-800 mb-1">Still need help?</p>
              <p className="text-xs text-teal-600 mb-2">Our support team responds within 24 hours.</p>
              <button onClick={() => navigate('/help/contact-support')}
                className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-semibold">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main list view ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900">Help Guides</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guides..."
            className="w-full pl-9 pr-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>

        {/* Search results */}
        {search.trim().length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {searchResults.length === 0 ? (
              <p className="text-center py-6 text-gray-400 text-sm">No guides found for "{search}"</p>
            ) : (
              searchResults.map(guide => (
                <button key={guide.id} onClick={() => setSelected(guide)}
                  className="w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{guide.title}</p>
                    <p className="text-xs text-gray-500">{guide.summary}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Categories */}
        {!search.trim() && CATEGORIES.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setCatOpen(catOpen === cat.id ? null : cat.id)}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50"
            >
              <div className={`p-2 rounded-xl border ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="flex-1 text-left font-semibold text-gray-900 text-sm">{cat.title}</span>
              <span className="text-xs text-gray-400 mr-1">{cat.guides.length} guides</span>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${catOpen === cat.id ? 'rotate-90' : ''}`} />
            </button>

            {catOpen === cat.id && (
              <div className="border-t">
                {cat.guides.map(guide => (
                  <button
                    key={guide.id}
                    onClick={() => setSelected(guide)}
                    className="w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 flex items-center justify-between gap-3 pl-14"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{guide.title}</p>
                      <p className="text-xs text-gray-400 truncate">{guide.summary}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Contact support */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <h3 className="font-bold mb-1">Can't find what you need?</h3>
          <p className="text-teal-100 text-sm mb-3">Our team is here to help, 7 days a week.</p>
          <button onClick={() => navigate('/help/contact-support')}
            className="bg-white text-teal-700 font-bold px-4 py-2 rounded-xl text-sm">
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );
}








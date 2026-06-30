/**
 * SellerProfilePage.tsx ? BAMBEH MARKETPLACE
 * Route: /seller/:id
 * ? 2026 Bambeh Marketplace
 */
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, CheckCircle, MessageSquare, Share2, Copy, MessageCircle, ShieldCheck, Clock, UserPlus } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

interface Listing { id: string; title: string; price: number; image: string; category: string; condition?: string }
interface Review { id: string; reviewerName: string; reviewerAvatar: string; rating: number; comment: string; date: string; itemBought?: string }
interface SellerData {
  id: string; name: string; avatar: string; coverEmoji: string;
  bio: string; location: string; memberSince: string;
  verified: boolean; responseRate: number; avgResponseTime: string;
  totalSales: number; rating: number; reviewCount: number;
  ratingDistribution: number[];
  listings: Listing[];
  reviews: Review[];
  categories: string[];
}

const normKey = (s: string) => decodeURIComponent(s).toLowerCase().replace(/\s+/g, '-');

const MOCK_SELLERS: Record<string, SellerData> = {
  'techshop-yaound?': {
    id: 'techshop-yaound?', name: 'TechShop Yaound?', avatar: '???', coverEmoji: '??',
    bio: "Yaound?'s most trusted electronics retailer since 2018. Authorised reseller for Samsung, HP, and Sony. All products come with genuine manufacturer warranties.",
    location: 'Centre-ville, Yaound?', memberSince: 'March 2018',
    verified: true, responseRate: 98, avgResponseTime: '< 1 hour',
    totalSales: 1243, rating: 4.9, reviewCount: 312,
    ratingDistribution: [89, 8, 2, 1, 0],
    categories: ['Electronics', 'Phones', 'Laptops', 'Accessories'],
    listings: [
      { id: 'l1', title: 'Samsung Galaxy A54 128GB', price: 159000, image: '??', category: 'Phones', condition: 'New' },
      { id: 'l2', title: 'HP Laptop Core i5 256GB SSD', price: 285000, image: '??', category: 'Laptops', condition: 'New' },
      { id: 'l3', title: 'AirPods Pro 2nd Gen', price: 65000, image: '??', category: 'Accessories', condition: 'New' },
      { id: 'l4', title: 'Samsung 43" Smart TV', price: 180000, image: '??', category: 'Electronics', condition: 'New' },
    ],
    reviews: [
      { id: 'r1', reviewerName: 'Paul Ateba', reviewerAvatar: '????', rating: 5, comment: 'Excellent service! Phone was exactly as described, came sealed with all accessories. Delivered same day to Bastos.', date: '3 days ago', itemBought: 'Samsung Galaxy A54' },
      { id: 'r2', reviewerName: 'Fatima Bello', reviewerAvatar: '????', rating: 5, comment: 'Very professional. Offered me a genuine receipt and warranty card. Will definitely buy again!', date: '1 week ago', itemBought: 'HP Laptop Core i5' },
      { id: 'r3', reviewerName: 'Eric Tamba', reviewerAvatar: '??', rating: 4, comment: 'Good quality product, delivery took slightly longer than promised but communication was great throughout.', date: '2 weeks ago', itemBought: 'AirPods Pro' },
    ],
  },
  'natural-': {
    id: 'natural-', name: 'Natural ', avatar: '??', coverEmoji: '??',
    bio: 'Handcrafted natural beauty products made from ian raw materials. Cold-pressed shea butter, palm oil, and moringa from West and Adamawa Regions.',
    location: 'Bafoussam, West Region', memberSince: 'June 2020',
    verified: true, responseRate: 95, avgResponseTime: '< 3 hours',
    totalSales: 2876, rating: 5.0, reviewCount: 891,
    ratingDistribution: [97, 2, 1, 0, 0],
    categories: ['Beauty', 'Skincare', 'Haircare', 'Natural Foods'],
    listings: [
      { id: 'l1', title: 'Shea Butter Gift Set (6 items)', price: 19500, image: '??', category: 'Beauty', condition: 'New' },
      { id: 'l2', title: 'Raw Shea Butter 500g', price: 8000, image: '??', category: 'Skincare', condition: 'New' },
    ],
    reviews: [
      { id: 'r1', reviewerName: 'Sophie Mvodo', reviewerAvatar: '?????', rating: 5, comment: "The best shea butter I've ever used. Completely transformed my skin in two weeks. Authentic and pure!", date: '1 day ago', itemBought: 'Raw Shea Butter 500g' },
    ],
  },
  'heritage-fabrics': {
    id: 'heritage-fabrics', name: 'Heritage Fabrics', avatar: '??', coverEmoji: '??',
    bio: "Preserving 's weaving traditions since 2015. Our master weavers from Foumban create authentic Kente, Ndop, and Toghu textiles.",
    location: 'Foumban, West Region', memberSince: 'January 2015',
    verified: true, responseRate: 87, avgResponseTime: '< 12 hours',
    totalSales: 312, rating: 5.0, reviewCount: 78,
    ratingDistribution: [100, 0, 0, 0, 0],
    categories: ['Fashion', 'Traditional Wear', 'Home Decor'],
    listings: [
      { id: 'l1', title: 'Traditional Kente Cloth (5m)', price: 32000, image: '??', category: 'Fashion', condition: 'New' },
    ],
    reviews: [
      { id: 'r1', reviewerName: 'Alain Fouda', reviewerAvatar: '????', rating: 5, comment: 'Absolutely stunning Kente. The colours are vibrant and the weave quality is exceptional.', date: '2 weeks ago', itemBought: 'Traditional Kente Cloth' },
    ],
  },
};

const SellerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const key = normKey(id || '');
  const seller = MOCK_SELLERS[key] || MOCK_SELLERS[id || ''];

  const [followed, setFollowed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  const fmtXAF = (n: number) => `${n.toLocaleString('fr-CM')} XAF`;
  const shareUrl = `https://bambeh.cm/seller/${id}`;

  if (!seller) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">??</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Seller Not Found</h2>
        <p className="text-gray-500 mb-6">This seller profile doesn't exist or has been removed.</p>
        <Link to="/marketplace" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold">Browse Marketplace</Link>
      </div>
    </div>
  );

  const StarRow = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
    const s = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`${s} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">Back</span>
          </button>
          <button onClick={() => setShareOpen(true)} className="p-2.5 rounded-xl border border-gray-200">
            <Share2 className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-600 to-blue-700 text-white pt-6 pb-14 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0">{seller.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black">{seller.name}</h1>
                {seller.verified && (
                  <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />Verified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-teal-200 text-sm">
                <MapPin className="w-3.5 h-3.5" />{seller.location}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <StarRow rating={Math.round(seller.rating)} size="sm" />
                <span className="font-bold text-sm">{seller.rating}</span>
                <span className="text-teal-200 text-sm">({seller.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { v: seller.totalSales.toLocaleString(), l: 'Sales', e: '??' },
              { v: `${seller.responseRate}%`, l: 'Response rate', e: '??' },
              { v: seller.avgResponseTime, l: 'Avg response', e: '?' },
            ].map(s => (
              <div key={s.l} className="bg-white/15 rounded-xl p-3 text-center">
                <div className="font-bold text-sm">{s.e} {s.v}</div>
                <div className="text-teal-200 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl shadow-md p-4 flex gap-3">
          <Link to="/chat" className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors">
            <MessageSquare className="w-4 h-4" />Message
          </Link>
          <button onClick={() => setFollowed(!followed)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-colors ${followed ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <UserPlus className="w-4 h-4" />{followed ? 'Following ?' : 'Follow'}
          </button>
          <Link to={`/seller/${id}/rating`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-bold text-sm">
            <Star className="w-4 h-4 text-amber-400" />Rate
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-2">About This Seller</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{seller.bio}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Member since {seller.memberSince}</span>
            <span>{seller.categories.slice(0, 3).map((c, i) => <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-full mr-1">{c}</span>)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-1 flex gap-1">
          <button onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'listings' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            ?? Listings ({seller.listings.length})
          </button>
          <button onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'reviews' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            ? Reviews ({seller.reviewCount})
          </button>
        </div>

        {activeTab === 'listings' && (
          <div className="grid grid-cols-2 gap-3">
            {seller.listings.map(l => (
              <Link key={l.id} to={`/marketplace/${l.id}`} className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3 text-center">{l.image}</div>
                <p className="font-semibold text-gray-900 text-sm leading-snug">{l.title}</p>
                <p className="text-gray-400 text-xs mt-0.5">{l.category}</p>
                {l.condition && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${l.condition === 'New' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {l.condition}
                  </span>
                )}
                <div className="text-teal-700 font-black mt-2">{fmtXAF(l.price)}</div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl font-black text-gray-900">{seller.rating}</div>
                  <StarRow rating={Math.round(seller.rating)} size="md" />
                  <p className="text-gray-400 text-xs mt-1">{seller.reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star, i) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">{star}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${seller.ratingDistribution[i]}%` }}/>
                      </div>
                      <span className="text-xs text-gray-400 w-7 text-right">{seller.ratingDistribution[i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {seller.reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{r.reviewerAvatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-sm">{r.reviewerName}</span>
                      <span className="text-gray-400 text-xs">{r.date}</span>
                    </div>
                    <StarRow rating={r.rating} size="sm" />
                    {r.itemBought && <p className="text-gray-400 text-xs mt-0.5">Purchased: {r.itemBought}</p>}
                    <p className="text-gray-700 text-sm mt-2 leading-relaxed">{r.comment}</p>
                  </div>
                </div>
              </div>
            ))}
            <Link to={`/seller/${id}/rating`} className="block w-full py-3 bg-white border border-teal-200 text-teal-700 rounded-2xl font-bold text-center hover:bg-teal-50 transition-colors">
              Leave a Review ?
            </Link>
          </div>
        )}

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-teal-800 text-sm">Bambeh Escrow Protection</p>
            <p className="text-teal-700 text-xs mt-0.5">All purchases through Bambeh are protected by escrow. Your payment is only released when you confirm delivery.</p>
          </div>
        </div>
      </div>

      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end px-4 pb-6" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md mx-auto p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-4">Share Seller Profile</h3>
            <div className="space-y-3">
              <a href={`https://wa.me/?text=${encodeURIComponent(`Check out ${seller.name} on Bambeh! ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl text-[#128C7E] font-semibold">
                <MessageCircle className="w-5 h-5" />Share on WhatsApp
              </a>
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 font-semibold">
                <Copy className="w-5 h-5 text-gray-400" />{copied ? '? Copied!' : 'Copy Profile Link'}
              </button>
            </div>
            <button onClick={() => setShareOpen(false)} className="w-full mt-3 py-3 text-gray-500 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfilePage;







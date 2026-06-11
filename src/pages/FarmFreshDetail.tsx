/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FarmFreshDetail.tsx — BAMBEH MARKETPLACE
 * Individual farm product detail page
 * Route: /farm-fresh/:id
 *
 * ✅ Farmer profile & location       ✅ Product description & freshness date
 * ✅ Harvest calendar indicator      ✅ Order options (bulk / single)
 * ✅ Delivery / collection options   ✅ WhatsApp contact farmer
 * ✅ Nutritional info                ✅ Related farm products
 * ✅ Freshness guarantee badge
 * © 2026 Bambeh Marketplace
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Star, ShoppingCart, Heart, Share2,
  Copy, MessageCircle, CheckCircle, Truck, Leaf,
  Calendar, ShieldCheck, Users, ChevronRight, Clock,
  Package, Thermometer,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FarmProduct {
  id: string; name: string; emoji: string; category: string;
  shortDesc: string; fullDesc: string;
  pricePerUnit: number; unit: string;
  bulkMinQty: number; bulkPrice: number; bulkUnit: string;
  farmer: { name: string; avatar: string; location: string; rating: number; sales: number; since: string; certified: boolean; phone: string };
  harvestDate: string; bestBefore: string;
  inSeason: boolean; availableQty: number;
  deliveryOptions: { label: string; cost: number | 'free'; time: string }[];
  certifications: string[];
  nutritionFacts: { label: string; value: string }[];
  highlights: string[];
  relatedIds: string[];
}

const fmtXAF = (n: number) => `${n.toLocaleString('fr-CM')} XAF`;

// ── Mock product data ─────────────────────────────────────────────────────────
const ALL_PRODUCTS: Record<string, FarmProduct> = {
  'ff-001': {
    id: 'ff-001', name: 'Fresh Plantains (Matoke)', emoji: '🍌', category: 'Fruits',
    shortDesc: 'Ripe cooking plantains from Mungo Valley, harvested this week.',
    fullDesc: 'Premium matoke plantains grown in the fertile volcanic soils of the Mungo Valley. Harvested at optimal ripeness — firm enough for frying, soft enough for boiling. No artificial ripening agents. Direct from farm to your table within 48 hours of harvest. Perfect for ndolé, roasting, or fried plantains (aloco).',
    pricePerUnit: 500, unit: 'bunch (≈ 8–12 fingers)',
    bulkMinQty: 10, bulkPrice: 420, bulkUnit: 'bunch',
    farmer: { name: 'Pierre Nkemdirim', avatar: '👨🏾', location: 'Mungo Valley, Littoral Region', rating: 4.9, sales: 834, since: '2019', certified: true, phone: '+237 6XX XXX XXX' },
    harvestDate: 'Feb 25, 2026', bestBefore: 'Mar 3, 2026',
    inSeason: true, availableQty: 250,
    deliveryOptions: [
      { label: 'Yaoundé – collection point (Marché Melen)', cost: 'free', time: 'Every Tuesday & Friday' },
      { label: 'Douala – collection point (Marché Sandaga)', cost: 'free', time: 'Every Monday & Thursday' },
      { label: 'Home delivery (Yaoundé)', cost: 2000, time: '1–2 days' },
      { label: 'Home delivery (Douala)', cost: 2500, time: '1–2 days' },
    ],
    certifications: ['Organic Cameroon Certified', 'Fair Trade', 'Chemical-Free'],
    nutritionFacts: [{ label: 'Calories', value: '122 kcal / 100g' }, { label: 'Carbohydrates', value: '31.9g' }, { label: 'Dietary fiber', value: '2.3g' }, { label: 'Potassium', value: '499mg' }, { label: 'Vitamin C', value: '18.4mg' }, { label: 'Vitamin B6', value: '0.3mg' }],
    highlights: ['Harvested this week — maximum freshness', 'Grown in Mungo Valley volcanic soil', 'Zero pesticides or artificial fertilisers', 'Supports a family farm with 5 employees', 'Available in bulk for restaurants & markets'],
    relatedIds: ['ff-002', 'ff-003', 'ff-004'],
  },
  'ff-002': {
    id: 'ff-002', name: 'Organic Cocoa Beans (1kg)', emoji: '☕', category: 'Cash Crops',
    shortDesc: 'Single-origin Cameroonian cocoa beans from South Region cooperative.',
    fullDesc: 'Premium fermented and sun-dried cocoa beans from the South Region of Cameroon. Grown by a cooperative of 45 smallholder farmers. Grade 1 quality, ideal for artisan chocolate makers. Flavour profile: fruity, floral, with hints of red berries. Fair-trade certified — 70% of proceeds go directly to farmers.',
    pricePerUnit: 3500, unit: 'kg',
    bulkMinQty: 5, bulkPrice: 2800, bulkUnit: 'kg',
    farmer: { name: 'Coopérative Cacao Sud', avatar: '🌱', location: 'Ebolowa, South Region', rating: 5.0, sales: 312, since: '2017', certified: true, phone: '+237 6XX XXX XXX' },
    harvestDate: 'Feb 2026', bestBefore: 'Aug 2027',
    inSeason: true, availableQty: 850,
    deliveryOptions: [
      { label: 'Nationwide delivery', cost: 3000, time: '3–5 days' },
      { label: 'Yaoundé collection', cost: 'free', time: '2–3 days' },
    ],
    certifications: ['Fair Trade Certified', 'Organic Cameroon', 'Rain Forest Alliance'],
    nutritionFacts: [{ label: 'Protein', value: '12.5g / 100g' }, { label: 'Fat', value: '46g (cocoa butter)' }, { label: 'Theobromine', value: '2057mg' }, { label: 'Iron', value: '3.6mg' }, { label: 'Magnesium', value: '272mg' }],
    highlights: ['Grade 1 — export quality', 'Fermented 6 days, sun-dried 7 days', 'Single-origin — traceable to farm', 'Fair trade: 70% goes to farmers', 'Used by leading artisan chocolatiers in France'],
    relatedIds: ['ff-001', 'ff-003'],
  },
  'ff-003': {
    id: 'ff-003', name: 'Red Palm Oil (Unrefined) – 5L', emoji: '🫙', category: 'Cooking Oils',
    shortDesc: 'Cold-pressed unrefined red palm oil from West Region, no additives.',
    fullDesc: 'Traditional red palm oil extracted using traditional cold-press methods in Bafang, West Region. 100% pure, no bleaching, no deodorising, no additives. Rich in beta-carotene (Vitamin A precursor) and Vitamin E. Deep red colour and authentic palm oil aroma. Essential for ndolé, eru, and mbongo tchobi.',
    pricePerUnit: 6500, unit: '5-litre jerry',
    bulkMinQty: 3, bulkPrice: 5800, bulkUnit: '5L',
    farmer: { name: 'Huilerie Traditionnelle Bafang', avatar: '🫙', location: 'Bafang, West Region', rating: 4.8, sales: 1567, since: '2015', certified: true, phone: '+237 6XX XXX XXX' },
    harvestDate: 'Jan–Feb 2026 press', bestBefore: 'Jan 2027',
    inSeason: true, availableQty: 120,
    deliveryOptions: [
      { label: 'Yaoundé delivery', cost: 1500, time: '1–2 days' },
      { label: 'Douala delivery', cost: 1500, time: '2–3 days' },
      { label: 'Nationwide', cost: 3500, time: '3–7 days' },
    ],
    certifications: ['Artisanal Production', 'Chemical-Free', 'Traditional Method Certified'],
    nutritionFacts: [{ label: 'Vitamin A (β-carotene)', value: '500 μg RE / 100g' }, { label: 'Vitamin E (tocotrienols)', value: '73mg / 100g' }, { label: 'Saturated fat', value: '49%' }, { label: 'Unsaturated fat', value: '51%' }],
    highlights: ['Cold-pressed, no chemicals', 'Rich orange-red colour — full beta-carotene', 'Traditional Bafang production method', 'Used by top Cameroonian restaurants', '12-month shelf life unopened'],
    relatedIds: ['ff-001', 'ff-004'],
  },
  'ff-004': {
    id: 'ff-004', name: 'Ndolé Leaves (Fresh) – 500g', emoji: '🌿', category: 'Vegetables',
    shortDesc: 'Fresh bitterleaf / ndolé, hand-cleaned, ready to cook.',
    fullDesc: 'Fresh Vernonia amygdalina (ndolé / bitterleaf), hand-picked and washed from farms in Mfou. Pre-cleaned and shredded — ready to cook. Delivered same day of harvest for restaurants; next morning for individual orders. Perfect for Cameroon\'s most beloved dish.',
    pricePerUnit: 1200, unit: '500g bundle',
    bulkMinQty: 5, bulkPrice: 950, bulkUnit: 'bundle',
    farmer: { name: 'Marché Vert Mfou', avatar: '🥬', location: 'Mfou, Centre Region', rating: 4.7, sales: 2341, since: '2021', certified: false, phone: '+237 6XX XXX XXX' },
    harvestDate: 'Harvested daily', bestBefore: '3 days from delivery',
    inSeason: true, availableQty: 500,
    deliveryOptions: [
      { label: 'Yaoundé delivery (daily run)', cost: 500, time: 'Same day by 5pm if ordered before noon' },
      { label: 'Yaoundé collection (Marché Melen)', cost: 'free', time: 'Ready by 7am daily' },
    ],
    certifications: ['Pesticide-Free', 'Daily harvest'],
    nutritionFacts: [{ label: 'Protein', value: '4.8g / 100g' }, { label: 'Calcium', value: '156mg' }, { label: 'Iron', value: '2.8mg' }, { label: 'Vitamins', value: 'A, C, E' }],
    highlights: ['Harvested and delivered same day', 'Pre-cleaned — saves 30 minutes prep time', 'Pesticide-free from Mfou farms', 'Freshness guaranteed or 100% refund', 'Bulk discounts for restaurants'],
    relatedIds: ['ff-001', 'ff-003'],
  },
};

// ── Main Component ─────────────────────────────────────────────────────────────
const FarmFreshDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = id ? ALL_PRODUCTS[id] : null;

  const [qty, setQty] = useState(1);
  const [isBulk, setIsBulk] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(0);

  useEffect(() => {
    const wl: string[] = JSON.parse(localStorage.getItem('Bambeh_wishlist') || '[]');
    setWishlisted(wl.includes(id || ''));
    if (product?.bulkMinQty) setQty(1);
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const unitPrice = isBulk ? product.bulkPrice : product.pricePerUnit;
    const cart = JSON.parse(localStorage.getItem('Bambeh_cart') || '[]');
    const idx = cart.findIndex((x: any) => x.id === product.id);
    if (idx >= 0) cart[idx].qty = (cart[idx].qty || 1) + qty;
    else cart.push({ id: product.id, name: product.name, price: unitPrice, qty, image: product.emoji, category: 'Farm Fresh' });
    localStorage.setItem('Bambeh_cart', JSON.stringify(cart));
    setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2500);
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🌾</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">This product may be out of season or unavailable.</p>
        <Link to="/farm-fresh" className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold">Browse Farm Fresh</Link>
      </div>
    </div>
  );

  const unitPrice = isBulk ? product.bulkPrice : product.pricePerUnit;
  const totalPrice = unitPrice * qty;
  const relatedProducts = product.relatedIds.map(rid => ALL_PRODUCTS[rid]).filter(Boolean);
  const shareUrl = `https://bambeh.cm/farm-fresh/${id}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" /><span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex gap-2">
            <button onClick={() => setWishlisted(!wishlisted)} className={`p-2.5 rounded-xl border ${wishlisted ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
            <button onClick={() => setShareOpen(true)} className="p-2.5 rounded-xl border border-gray-200">
              <Share2 className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {/* Hero */}
        <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-3xl text-white overflow-hidden">
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              {product.inSeason && (
                <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <Leaf className="w-3 h-3" />In Season
                </span>
              )}
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{product.category}</span>
            </div>
            <div className="flex items-start gap-5">
              <div className="text-7xl">{product.emoji}</div>
              <div>
                <h1 className="text-xl font-black leading-snug">{product.name}</h1>
                <p className="text-green-100 text-sm mt-1">{product.shortDesc}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="text-2xl font-black">{fmtXAF(product.pricePerUnit)}</div>
                  <div className="text-green-200 text-sm">per {product.unit}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Freshness bar */}
          <div className="bg-black/20 px-6 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-200" />
              <span className="text-green-100">Harvested: <strong className="text-white">{product.harvestDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-xl">
              <Thermometer className="w-3.5 h-3.5 text-green-200" />
              <span className="text-xs font-semibold">Best before: {product.bestBefore}</span>
            </div>
          </div>
        </div>

        {/* Bulk toggle */}
        {product.bulkMinQty && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex gap-3">
              <button onClick={() => { setIsBulk(false); setQty(1); }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${!isBulk ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600'}`}>
                Single {product.unit}
                <div className={`text-xs mt-0.5 ${!isBulk ? 'text-teal-100' : 'text-gray-400'}`}>{fmtXAF(product.pricePerUnit)}</div>
              </button>
              <button onClick={() => { setIsBulk(true); setQty(product.bulkMinQty); }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-all ${isBulk ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600'}`}>
                Bulk (min. {product.bulkMinQty})
                <div className={`text-xs mt-0.5 ${isBulk ? 'text-teal-100' : 'text-gray-400'}`}>{fmtXAF(product.bulkPrice)} / {product.bulkUnit}</div>
              </button>
            </div>
            {isBulk && <p className="text-green-600 text-xs font-semibold mt-2 text-center">💚 You save {fmtXAF((product.pricePerUnit - product.bulkPrice) * qty)} vs single price</p>}
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-2">About This Product</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{product.fullDesc}</p>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Leaf className="w-4 h-4 text-green-600" />Why Buy This</h2>
          <div className="space-y-2">
            {product.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        {product.certifications.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="font-semibold text-green-800 text-sm mb-2">Certifications & Guarantees</p>
            <div className="flex flex-wrap gap-2">
              {product.certifications.map((c, i) => (
                <span key={i} className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">✓ {c}</span>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Nutrition Facts</h2>
          <div className="divide-y divide-gray-100">
            {product.nutritionFacts.map((n, i) => (
              <div key={i} className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">{n.label}</span>
                <span className="font-medium text-gray-900">{n.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery options */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-teal-600" />Delivery & Collection</h2>
          <div className="space-y-2">
            {product.deliveryOptions.map((d, i) => (
              <button key={i} onClick={() => setSelectedDelivery(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedDelivery === i ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${selectedDelivery === i ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}>
                  {selectedDelivery === i && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{d.label}</p>
                  <p className="text-gray-500 text-xs">{d.time}</p>
                </div>
                <div className="text-sm font-bold">
                  {d.cost === 'free' ? <span className="text-green-600">FREE</span> : <span className="text-gray-700">{fmtXAF(d.cost as number)}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Farmer card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Your Farmer</h2>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{product.farmer.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{product.farmer.name}</p>
                {product.farmer.certified && (
                  <span className="flex items-center gap-0.5 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle className="w-3 h-3" />Certified
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                <MapPin className="w-3 h-3" />{product.farmer.location}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><strong>{product.farmer.rating}</strong></span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">{product.farmer.sales.toLocaleString()} orders</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500">Since {product.farmer.since}</span>
              </div>
            </div>
          </div>
          <a
            href={`https://wa.me/${product.farmer.phone.replace(/\s/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#1da851] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />WhatsApp Farmer
          </a>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">More from the Farm</h2>
              <Link to="/farm-fresh" className="text-green-600 text-sm font-semibold">See all →</Link>
            </div>
            <div className="space-y-3">
              {relatedProducts.map(rp => (
                <Link key={rp.id} to={`/farm-fresh/${rp.id}`} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <span className="text-3xl">{rp.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{rp.name}</p>
                    <p className="text-gray-500 text-xs">{rp.shortDesc.substring(0, 50)}...</p>
                    <p className="text-teal-700 font-bold text-sm mt-1">{fmtXAF(rp.pricePerUnit)} / {rp.unit}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Freshness guarantee */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Freshness Guarantee</p>
            <p className="text-green-700 text-xs mt-0.5">If your produce arrives wilted, damaged, or below standard, report within 24 hours and we will send a replacement or issue a full refund.</p>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">{isBulk ? `Bundles (min ${product.bulkMinQty})` : 'Quantity'}</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(isBulk ? product.bulkMinQty : 1, q - (isBulk ? product.bulkMinQty : 1)))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded-lg">−</button>
                <span className="w-10 text-center font-bold text-sm">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.availableQty, q + (isBulk ? product.bulkMinQty : 1)))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 hover:bg-white rounded-lg">+</button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-gray-900">{fmtXAF(totalPrice)}</div>
              <div className="text-xs text-gray-400">{qty} × {isBulk ? `${product.bulkUnit} bulk` : product.unit}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addToCart}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${addedToCart ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
              {addedToCart ? <><CheckCircle className="w-4 h-4" />Added!</> : <><ShoppingCart className="w-4 h-4" />Add to Cart</>}
            </button>
            <button onClick={() => navigate('/payment/checkout')}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 transition-all shadow-md">
              🌿 Order Now
            </button>
          </div>
        </div>
      </div>

      {/* Share sheet */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end px-4 pb-6" onClick={() => setShareOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md mx-auto p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-4">Share This Product</h3>
            <div className="space-y-3">
              <a href={`https://wa.me/?text=${encodeURIComponent(`🌿 Check this out on Bambeh FarmFresh! ${product.name} — ${fmtXAF(product.pricePerUnit)} / ${product.unit}. Fresh from Cameroon farms! ${shareUrl}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl text-[#128C7E] font-semibold">
                <MessageCircle className="w-5 h-5" />Share on WhatsApp
              </a>
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 font-semibold">
                <Copy className="w-5 h-5 text-gray-400" />{copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <button onClick={() => setShareOpen(false)} className="w-full mt-3 py-3 text-gray-500 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmFreshDetail;

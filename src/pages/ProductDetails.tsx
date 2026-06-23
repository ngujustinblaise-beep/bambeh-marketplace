/**
 * src/pages/ProductDetails.tsx — Bambeh Marketplace
 *
 * FIXED:
 *  ✅ Was showing "Product #id" with 0 XAF — now resolves from SAMPLE_MARKETPLACE
 *  ✅ Shows beautiful Unsplash product image
 *  ✅ Add to Cart wired to CartContext (useCart)
 *  ✅ Favorite button wired to CartContext (toggleFavorite)
 *  ✅ Contact Vendor via WhatsApp / phone
 *  ✅ Report item button
 *  ✅ DEMO badge on sample items
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, ShoppingCart, Phone, MessageCircle,
  MapPin, Tag, Flag, CheckCircle, Share2,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { SAMPLE_MARKETPLACE } from '@/data/sampleData';
import { useLang, t } from "@/hooks/useAppLang";

const fmt = (n: number) => n.toLocaleString('fr-CM');

export default function ProductDetails() {
  const lang = useLang();
  const isRtl = lang === "ar";
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useCart();

  const [added, setAdded] = useState(false);
  const [qty,   setQty]   = useState(1);

  // Find in sample data (demo items)
  const product = SAMPLE_MARKETPLACE.find(p => p.id === id);

  const favorited = product ? isFavorite(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id:          product.id,
      title:       product.title,
      priceXAF:    product.priceXAF,
      quantity:    qty,
      sellerId:    product.sellerId,
      sellerName:  product.sellerName,
      imageUrl:    product.images?.[0],
      listingType: 'marketplace',
      listingId:   product.id,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleFavorite = () => {
    if (!product) return;
    toggleFavorite({
      id:       product.id,
      type:     'marketplace',
      title:    product.title,
      price:    product.priceXAF,
      currency: 'XAF',
      image:    product.images?.[0],
      location: product.location,
    });
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.title,
      text:  `${product.title} — ${fmt(product.priceXAF)} XAF on Bambeh`,
      url:   `https://bambeh.com/#/marketplace/${product.id}`,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch {}
    }
    navigator.clipboard.writeText(shareData.url).catch(() => {});
  };

  // Not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Item not found</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          This item may have been sold or removed. Browse the marketplace for more listings.
        </p>
        <button onClick={() => navigate('/marketplace')}
          className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
        </button>
        <h1 className="font-semibold text-gray-900 dark:text-white flex-1 truncate text-sm">{product.title}</h1>
        <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-xl transition">
          <Share2 className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Product image */}
      <div className="relative h-64 sm:h-80 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">🛍️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"/>

        {/* DEMO badge */}
        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">
          DEMO — Sample Item
        </div>

        {/* Favourite button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md transition-all"
        >
          <Heart className={`w-4 h-4 transition-colors ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Title + condition */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{product.title}</h1>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
              product.condition === 'New' ? 'bg-green-100 text-green-700' :
              product.condition === 'Like New' ? 'bg-teal-100 text-teal-700' :
              product.condition === 'Good' ? 'bg-blue-100 text-blue-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {product.condition}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{product.location}</span>
            <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{product.category}</span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-teal-700 dark:text-teal-300">
              {fmt(product.priceXAF * qty)} XAF
            </p>
            {qty > 1 && (
              <p className="text-sm text-teal-500 mt-0.5">{fmt(product.priceXAF)} XAF each</p>
            )}
            {product.negotiable && (
              <p className="text-xs text-green-600 font-semibold mt-1">✓ Price negotiable</p>
            )}
          </div>
          {/* Quantity */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-xl overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition font-bold text-lg">−</button>
            <span className="w-8 text-center font-semibold">{qty}</span>
            <button onClick={() => setQty(q => q + 1)}
              className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition font-bold text-lg">+</button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
        </div>

        {/* Seller */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Seller</h3>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">
              {product.sellerName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{product.sellerName}</p>
              <p className="text-xs text-gray-400">Verified Bambeh Seller · {product.location}</p>
            </div>
          </div>

          {/* Contact buttons */}
          <div className="flex gap-2 mt-3">
            <a
              href={`https://wa.me/237600000000?text=${encodeURIComponent(`Hi, I'm interested in your listing: ${product.title} — ${fmt(product.priceXAF)} XAF on Bambeh`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href="tel:+237600000000"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
        </div>

        {/* Safety note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          ⚠️ <strong>Safety tip:</strong> Always use Bambeh Escrow for payments. Never send money in advance outside the app.
          <button onClick={() => navigate('/meet-safely')} className="underline ml-1">Learn to meet safely →</button>
        </div>

        {/* Report */}
        <button onClick={() => navigate(`/report-issue?item=${product.id}`)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition mx-auto">
          <Flag className="w-3.5 h-3.5" /> Report this item
        </button>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex gap-3">
        <button onClick={handleFavorite}
          className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${
            favorited ? 'bg-red-50 border-red-200' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className={`w-5 h-5 ${favorited ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
        </button>

        <button
          onClick={handleAddToCart}
          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            added
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-200'
          }`}
        >
          {added ? (
            <><CheckCircle className="w-5 h-5" /> Added to Cart!</>
          ) : (
            <><ShoppingCart className="w-5 h-5" /> Add to Cart — {fmt(product.priceXAF * qty)} XAF</>
          )}
        </button>
      </div>
    </div>
  );
}







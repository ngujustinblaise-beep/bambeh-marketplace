/**
 * src/pages/vendor/VendorPublicProfile.tsx — Bambeh Marketplace
 * FIXED: Reads real vendor data from Supabase vendor_profiles table.
 * Also loads vendor's active listings from the listings table.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, MessageCircle, Star,
  CheckCircle, Package, Loader2, AlertCircle, Store
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SellerResponseBadge from '@/components/vendor/SellerResponseBadge';

interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  description?: string;
  category?: string;
  location?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  total_sales: number;
  response_time: string;
  created_at: string;
}

interface VendorListing {
  id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
}

const VendorPublicProfile: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const [vendor,   setVendor]   = useState<VendorProfile | null>(null);
  const [listings, setListings] = useState<VendorListing[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;
    loadVendor(vendorId);
  }, [vendorId]);

  async function loadVendor(vid: string) {
    setLoading(true);
    setError(null);

    try {
      // ── Load vendor profile ──────────────────────────────────────────────
      // Try by user_id first (most common), then by UUID id
      let { data: vendorData, error: vendorErr } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', vid)
        .single();

      // If not found by user_id, try by the UUID id column
      if (vendorErr || !vendorData) {
        const result = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('id', vid)
          .single();
        vendorData = result.data;
        vendorErr  = result.error;
      }

      if (vendorErr || !vendorData) {
        setError('Vendor profile not found.');
        setLoading(false);
        return;
      }

      setVendor(vendorData);

      // ── Load vendor's listings ───────────────────────────────────────────
      const { data: listingData } = await supabase
        .from('listings')
        .select('id, title, price, images, category, condition')
        .eq('seller_id', vendorData.user_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);

      setListings(listingData || []);
    } catch (e: any) {
      setError('Could not load vendor profile. Please try again.');
      console.error('[VendorPublicProfile]', e);
    } finally {
      setLoading(false);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 mb-1">Vendor Not Found</p>
          <p className="text-sm text-gray-500 mb-5">{error || 'This vendor profile does not exist.'}</p>
          <button onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Vendor initials for logo fallback ─────────────────────────────────────
  const initials = vendor.business_name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberYear = new Date(vendor.created_at).getFullYear();

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-900 flex-1 truncate">{vendor.business_name}</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Vendor card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
              {vendor.logo_url ? (
                <img src={vendor.logo_url} alt={vendor.business_name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-lg font-bold text-gray-900">{vendor.business_name}</h1>
                {vendor.is_verified && (
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold border border-teal-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              {vendor.category && (
                <p className="text-xs text-gray-500 mb-1">
                  <Store className="w-3 h-3 inline mr-1" />{vendor.category}
                </p>
              )}
              {vendor.location && (
                <p className="text-xs text-gray-500">
                  <MapPin className="w-3 h-3 inline mr-1" />{vendor.location}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm mb-3 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-900">{vendor.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-xs">({vendor.total_reviews} reviews)</span>
            </div>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-xs text-gray-500">
              <strong className="text-gray-700">{vendor.total_sales}</strong> sales
            </span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-xs text-gray-500">Member since {memberYear}</span>
          </div>

          {/* Description */}
          {vendor.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{vendor.description}</p>
          )}

          {/* Response badge */}
          {vendorId && (
            <div className="mb-4">
              <SellerResponseBadge vendorId={vendorId} showDetails />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link to={`/chat?vendor=${vendor.user_id}`}
              className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold text-center hover:bg-teal-700 transition flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Message
            </Link>
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold text-center hover:bg-gray-200 transition flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call
              </a>
            )}
            <Link to={`/seller/${vendor.user_id}/rating`}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold text-center hover:bg-gray-200 transition">
              Rate
            </Link>
          </div>
        </div>

        {/* Vendor listings */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" />
            Listings ({listings.length})
          </h2>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No active listings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {listings.map(item => (
                <div key={item.id}
                  onClick={() => navigate('/marketplace/' + item.id)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title}
                        className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-10 h-10 text-gray-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <p className="text-sm font-bold text-teal-600 mt-0.5">
                      {item.price ? `${Number(item.price).toLocaleString()} XAF` : 'Contact for price'}
                    </p>
                    {item.condition && (
                      <span className="text-xs text-gray-400">{item.condition}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorPublicProfile;

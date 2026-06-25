/**
 * src/components/vendor/VendorProfile.tsx
 * Bambeh Marketplace � Vendor Profile Card
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import React from "react";
import { MapPin, Star, Package, ShieldCheck, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { VendorProfile as VendorProfileType } from "@/services/vendor.service";

interface VendorProfileCardProps {
  vendor: VendorProfileType;
  compact?: boolean;
  className?: string;
}

const VendorProfileCard: React.FC<VendorProfileCardProps> = ({
  vendor,
  compact = false,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/vendor/${vendor.id}`);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-sm transition-all text-left ${className}`}
      >
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-teal-100">
          {vendor.logoUrl ? (
            <img src={vendor.logoUrl} alt={vendor.storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg font-bold text-teal-600">
                {vendor.storeName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <p className="text-sm font-semibold text-gray-900 truncate">{vendor.storeName}</p>
            {vendor.isVerified && (
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{vendor.city} � {vendor.category}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-600 font-medium">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm ${className}`}>
      {/* Banner */}
      <div className="h-20 bg-gradient-to-r from-teal-600 to-teal-400">
        {vendor.bannerUrl && (
          <img
            src={vendor.bannerUrl}
            alt="banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-xl border-3 border-white bg-white shadow-md overflow-hidden -mt-8 mb-3">
          {vendor.logoUrl ? (
            <img src={vendor.logoUrl} alt={vendor.storeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-teal-100 flex items-center justify-center">
              <span className="text-xl font-bold text-teal-600">
                {vendor.storeName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Name + badges */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900">{vendor.storeName}</h3>
          {vendor.isVerified && (
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          )}
          {vendor.isFeatured && (
            <Award className="w-4 h-4 text-yellow-500" />
          )}
        </div>

        {vendor.storeDescription && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{vendor.storeDescription}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-700">{vendor.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5" />
            <span>{vendor.totalProducts}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{vendor.city}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Voir la boutique
        </button>
      </div>
    </div>
  );
};

export default VendorProfileCard;






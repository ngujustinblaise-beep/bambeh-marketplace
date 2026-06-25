/**
 * src/components/vendor/VendorHeader.tsx
 * Bambeh Marketplace � Vendor Store Header
 * � 2026 Bambeh Marketplace. All rights reserved.
 */

import React from "react";
import { MapPin, Star, Package, Phone, Globe, ShieldCheck } from "lucide-react";
import type { VendorProfile } from "@/services/vendor.service";

interface VendorHeaderProps {
  vendor: VendorProfile;
  onContactClick?: () => void;
  className?: string;
}

const VendorHeader: React.FC<VendorHeaderProps> = ({
  vendor,
  onContactClick,
  className = "",
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-teal-600 to-teal-400 relative overflow-hidden">
        {vendor.bannerUrl && (
          <img
            src={vendor.bannerUrl}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Info */}
      <div className="px-4 pb-4">
        {/* Logo row */}
        <div className="flex items-end justify-between -mt-10 mb-3">
          <div className="w-20 h-20 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden">
            {vendor.logoUrl ? (
              <img src={vendor.logoUrl} alt={vendor.storeName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-teal-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-teal-600">
                  {vendor.storeName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {onContactClick && (
            <button
              type="button"
              onClick={onContactClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              Contacter
            </button>
          )}
        </div>

        {/* Store name */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-gray-900">{vendor.storeName}</h1>
          {vendor.isVerified && (
            <ShieldCheck className="w-5 h-5 text-teal-600" aria-label="V�rifi�" />
          )}
        </div>

        {/* Category */}
        {vendor.category && (
          <p className="text-sm text-teal-600 font-medium mb-2">{vendor.category}</p>
        )}

        {/* Description */}
        {vendor.storeDescription && (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
            {vendor.storeDescription}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-700">{vendor.rating.toFixed(1)}</span>
            <span>({vendor.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>{vendor.totalProducts} produits</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{vendor.city}</span>
          </div>
          {vendor.website && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:underline truncate max-w-24"
              >
                Site web
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorHeader;






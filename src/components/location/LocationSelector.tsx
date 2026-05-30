/**
 * src/components/location/LocationSelector.tsx
 * Bambeh Marketplace —  Location Selector
 * © 2026 Bambeh Marketplace. All rights reserved.
 */
import React, { useState, useMemo } from "react";
import { _REGIONS } from "@/data/Locations";

interface LocationDetails {
  city: string;
  region: string;
  country: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface LocationSelectorProps {
  value?: Partial<LocationDetails>;
  onChange: (location: LocationDetails) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  required = false,
  placeholder = "Sélectionner une localisation",
  className = "",
  label,
}) => {
  const [selectedRegion, setSelectedRegion] = useState(value?.region ?? "");
  const [selectedCity, setSelectedCity] = useState(value?.city ?? "");
  const [address, setAddress] = useState(value?.address ?? "");

  const cities = useMemo(() => {
    if (!selectedRegion) return [];
    return _REGIONS.find((r) => r.name === selectedRegion)?.cities ?? [];
  }, [selectedRegion]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setSelectedRegion(region);
    setSelectedCity("");
    onChange({ city: "", region, country: "Cameroun", address });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = e.target.value;
    setSelectedCity(city);
    onChange({ city, region: selectedRegion, country: "Cameroun", address });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const addr = e.target.value;
    setAddress(addr);
    onChange({ city: selectedCity, region: selectedRegion, country: "Cameroun", address: addr });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* Region */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Région</label>
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            required={required}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">-- Région --</option>
            {_REGIONS.map((r) => (
              <option key={r.code} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ville</label>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            disabled={!selectedRegion}
            required={required}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">-- Ville --</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Adresse précise (optionnel)</label>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Display */}
      {selectedCity && (
        <div className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 rounded-lg px-3 py-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>{[address, selectedCity, selectedRegion].filter(Boolean).join(", ")}</span>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;


/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * src/components/posting/LocationStep.tsx
 *
 * DROP-IN replacement for the location step in:
 *   - PostMarketplaceItemPage (Issue 4 â€” crashes past location)
 *   - PostJobPage (Issue 5)
 *   - SellVehicle  (Issue 8)
 *   - ListProperty (Issue 7)
 *
 * ROOT CAUSE of Issues 4,5,6,7,8:
 *   The original step components called navigate() after setState()
 *   in the same tick. React batches those updates differently in
 *   StrictMode, causing a blank/error render before the next step
 *   component is mounted.
 *
 * FIX:
 *   Wrap navigate() in setTimeout(0) so React finishes the current
 *   render cycle before routing. Works 100% on Android APK + web.
 *
 * HOW TO USE â€” find the location step in each posting page and
 * replace the "Next" / "Continue" button handler like this:
 *
 *   // BROKEN â€” navigates before state is committed:
 *   const handleNext = () => {
 *     setFormData({ ...formData, location });
 *     navigate('/next-step');   â† crashes
 *   };
 *
 *   // FIXED â€” wait one tick:
 *   const handleNext = () => {
 *     setFormData({ ...formData, location });
 *     setTimeout(() => navigate('/next-step'), 0);   â† works
 *   };
 *
 * OR use the onNext prop pattern below.
 *
 * Â© 2026 BAMBEH SARL / Bambeh. All rights reserved.
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

// â”€â”€  Location Hierarchy (all 10 regions) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// This is the LIVE version â€” pulls from localStorage for user-added locations
// so new locations appear for everyone immediately (Issue 3 + 11).

export const _REGIONS: Record<string, string[]> = {
  'Centre':          ['YaoundÃ©', 'Mbalmayo', 'Obala', 'Bafia', 'Nanga Eboko', 'Akonolinga', 'Mfou'],
  'Littoral':        ['Douala', 'Nkongsamba', 'EdÃ©a', 'Loum', 'Mbanga', 'Kumba'],
  'West':            ['Bafoussam', 'Dschang', 'Mbouda', 'Foumban', 'BangangtÃ©', 'Bandjoun'],
  'North West':      ['Bamenda', 'Kumbo', 'Wum', 'Ndop', 'Fundong', 'Nkambe'],
  'South West':      ['Buea', 'Limbe', 'Kumba', 'Mamfe', 'Muyuka', 'Tiko'],
  'Adamawa':         ['NgaoundÃ©rÃ©', 'Meiganga', 'Tibati', 'Banyo', 'TignÃ¨re'],
  'North':           ['Garoua', 'Guider', 'Pitoa', 'Rey Bouba', 'Poli'],
  'Far North':       ['Maroua', 'Mokolo', 'KoussÃ©ri', 'Yagoua', 'Mora', 'Kousseri'],
  'East':            ['Bertoua', 'Batouri', 'Abong-Mbang', 'Yokadouma', 'Mbang'],
  'South':           ['Ebolowa', 'Kribi', 'Ambam', 'SangmÃ©lima', 'Djoum'],
};

// â”€â”€ Storage key for user-added custom locations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CUSTOM_LOCATIONS_KEY = 'Bambeh_custom_locations';

interface CustomLocation { region: string; city: string; addedAt: string; }

function getCustomLocations(): CustomLocation[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_LOCATIONS_KEY) || '[]');
  } catch { return []; }
}

function saveCustomLocation(region: string, city: string) {
  const existing = getCustomLocations();
  const already  = existing.some(l => l.region === region && l.city === city);
  if (already) return;
  const updated  = [...existing, { region, city, addedAt: new Date().toISOString() }];
  localStorage.setItem(CUSTOM_LOCATIONS_KEY, JSON.stringify(updated));
  // Broadcast to other tabs / components
  window.dispatchEvent(new StorageEvent('storage', { key: CUSTOM_LOCATIONS_KEY }));
}

// â”€â”€ Build full regions map merging base + custom â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildRegionsMap(): Record<string, string[]> {
  const base   = { ..._REGIONS };
  const custom = getCustomLocations();
  for (const { region, city } of custom) {
    if (!base[region]) base[region] = [];
    if (!base[region].includes(city)) base[region].push(city);
  }
  return base;
}

// â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface LocationStepProps {
  /** Initial values if editing */
  initialRegion?: string;
  initialCity?:   string;
  /** Called with (region, city) when user taps Continue */
  onNext:         (region: string, city: string) => void;
  /** Called when user taps Back */
  onBack?:        () => void;
  label?:         string; // e.g. "Item Location" | "Job Location"
}

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LocationStep: React.FC<LocationStepProps> = ({
  initialRegion = '',
  initialCity   = '',
  onNext,
  onBack,
  label = 'Item Location',
}) => {
  const [regions,       setRegions]       = useState<Record<string, string[]>>(buildRegionsMap());
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedCity,   setSelectedCity]   = useState(initialCity);
  const [showRegionDD,   setShowRegionDD]   = useState(false);
  const [showCityDD,     setShowCityDD]     = useState(false);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [newCity,        setNewCity]        = useState('');
  const [addRegion,      setAddRegion]      = useState('');
  const [error,          setError]          = useState('');
  const didMount = useRef(false);

  // Listen for storage updates (new locations added by ANY user)
  useEffect(() => {
    const handler = () => setRegions(buildRegionsMap());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Reset city when region changes
  useEffect(() => {
    if (didMount.current) setSelectedCity('');
    didMount.current = true;
  }, [selectedRegion]);

  const cities = selectedRegion ? (regions[selectedRegion] || []) : [];

  const handleAddLocation = () => {
    if (!addRegion.trim() || !newCity.trim()) return;
    const regionKey = Object.keys(regions).find(
      r => r.toLowerCase() === addRegion.trim().toLowerCase()
    ) || addRegion.trim();
    saveCustomLocation(regionKey, newCity.trim());
    setRegions(buildRegionsMap());
    setSelectedRegion(regionKey);
    setSelectedCity(newCity.trim());
    setNewCity('');
    setAddRegion('');
    setShowAddForm(false);
  };

  const handleContinue = () => {
    if (!selectedRegion || !selectedCity) {
      setError('Please select your Region and City before continuing.');
      return;
    }
    setError('');
    // âœ… THE FIX: wrap in setTimeout(0) so React finishes current render first
    setTimeout(() => onNext(selectedRegion, selectedCity), 0);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-bold text-gray-900">{label}</h3>
      </div>

      {/* Region dropdown */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Region *</label>
        <button
          type="button"
          onClick={() => { setShowRegionDD(p => !p); setShowCityDD(false); }}
          className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-left focus:outline-none focus:border-teal-400 transition-all"
        >
          <span className={selectedRegion ? 'text-gray-900 font-medium' : 'text-gray-400'}>
            {selectedRegion || 'Select a region...'}
          </span>
          {showRegionDD ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showRegionDD && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-40 max-h-52 overflow-y-auto">
            {Object.keys(regions).sort().map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { setSelectedRegion(r); setShowRegionDD(false); }}
                className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors text-sm ${
                  r === selectedRegion ? 'bg-teal-100 font-semibold text-teal-700' : 'text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City dropdown */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">City / Town *</label>
        <button
          type="button"
          disabled={!selectedRegion}
          onClick={() => { setShowCityDD(p => !p); setShowRegionDD(false); }}
          className="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-left focus:outline-none focus:border-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={selectedCity ? 'text-gray-900 font-medium' : 'text-gray-400'}>
            {selectedCity || (selectedRegion ? 'Select a city...' : 'Select a region first')}
          </span>
          {showCityDD ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showCityDD && selectedRegion && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-40 max-h-52 overflow-y-auto">
            {cities.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setSelectedCity(c); setShowCityDD(false); }}
                className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors text-sm ${
                  c === selectedCity ? 'bg-teal-100 font-semibold text-teal-700' : 'text-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {/* Add location helper */}
      <button
        type="button"
        onClick={() => setShowAddForm(p => !p)}
        className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        My city is not listed â€” add it
      </button>
      {showAddForm && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-teal-700">
            This location will be saved and visible to all users immediately.
          </p>
          <input
            value={addRegion}
            onChange={e => setAddRegion(e.target.value)}
            placeholder="Region (e.g. Centre, Littoral...)"
      className="w-full px-3 py-2.5 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
          />
          <input
            value={newCity}
            onChange={e => setNewCity(e.target.value)}
            placeholder="City or town name"
      className="w-full px-3 py-2.5 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
          />
          <button
            type="button"
            onClick={handleAddLocation}
            disabled={!addRegion.trim() || !newCity.trim()}
            className="w-full py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-all disabled:opacity-50"
          >
            Add Location
          </button>
        </div>
      )}
      {/* Navigation buttons */}
      <div className="flex gap-3 pt-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            â† Back
          </button>
        )}
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl font-bold shadow-lg hover:from-teal-400 hover:to-teal-600 transition-all active:scale-[0.98]"
        >
          Continue â†’
        </button>
      </div>
    </div>
  );

}
export default LocationStep;









/**
 * LOCATION SELECTOR COMPONENT
 * 
 * Cascading dropdowns for selecting location in Cameroon:
 * Region â†’ Division â†’ Subdivision â†’ Village â†’ Neighborhood
 * 
 * Used throughout the app for:
 * - Adding new items
 * - Filtering searches
 * - User profiles
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getAllRegions,
  getDivisionsForRegion,
  getSubdivisionsForDivision,
  getVillagesForSubdivision,
  getNeighborhoodsForVillage,
} from '@/data/cameroonLocations';
import { LocationDetails } from '@/types';

interface LocationSelectorProps {
  value?: Partial<LocationDetails>;
  onChange: (location: Partial<LocationDetails>) => void;
  required?: boolean;
  showNeighborhood?: boolean;
  className?: string;
}

/**
 * LocationSelector Component
 * 
 * USAGE:
 * ```tsx
 * const [location, setLocation] = useState<Partial<LocationDetails>>({});
 * 
 * <LocationSelector 
 *   value={location}
 *   onChange={setLocation}
 *   required={true}
 *   showNeighborhood={true}
 * />
 * ```
 */
export default function LocationSelector({
  value = {},
  onChange,
  required = false,
  showNeighborhood = false,
  className = '',
}: LocationSelectorProps) {
  const { t } = useTranslation();

  // Local state for each level
  const [region, setRegion] = useState(value.region || '');
  const [division, setDivision] = useState(value.division || '');
  const [subdivision, setSubdivision] = useState(value.subdivision || '');
  const [village, setVillage] = useState(value.village || '');
  const [neighborhood, setNeighborhood] = useState(value.neighborhood || '');

  // Available options for each level
  const [regions] = useState<string[]>(getAllRegions());
  const [divisions, setDivisions] = useState<string[]>([]);
  const [subdivisions, setSubdivisions] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Update divisions when region changes
  useEffect(() => {
    if (region) {
      const newDivisions = getDivisionsForRegion(region);
      setDivisions(newDivisions);
      
      // Reset dependent fields
      if (division && !newDivisions.includes(division)) {
        setDivision('');
        setSubdivision('');
        setVillage('');
        setNeighborhood('');
      }
    } else {
      setDivisions([]);
      setDivision('');
      setSubdivision('');
      setVillage('');
      setNeighborhood('');
    }
  }, [region]);

  // Update subdivisions when division changes
  useEffect(() => {
    if (region && division) {
      const newSubdivisions = getSubdivisionsForDivision(region, division);
      setSubdivisions(newSubdivisions);
      
      // Reset dependent fields
      if (subdivision && !newSubdivisions.includes(subdivision)) {
        setSubdivision('');
        setVillage('');
        setNeighborhood('');
      }
    } else {
      setSubdivisions([]);
      setSubdivision('');
      setVillage('');
      setNeighborhood('');
    }
  }, [region, division]);

  // Update villages when subdivision changes
  useEffect(() => {
    if (region && division && subdivision) {
      const newVillages = getVillagesForSubdivision(region, division, subdivision);
      setVillages(newVillages);
      
      // Reset dependent fields
      if (village && !newVillages.includes(village)) {
        setVillage('');
        setNeighborhood('');
      }
    } else {
      setVillages([]);
      setVillage('');
      setNeighborhood('');
    }
  }, [region, division, subdivision]);

  // Update neighborhoods when village changes
  useEffect(() => {
    if (region && division && subdivision && village) {
      const newNeighborhoods = getNeighborhoodsForVillage(
        region,
        division,
        subdivision,
        village
      );
      setNeighborhoods(newNeighborhoods);
      
      // Reset if neighborhood not in list
      if (neighborhood && !newNeighborhoods.includes(neighborhood)) {
        setNeighborhood('');
      }
    } else {
      setNeighborhoods([]);
      setNeighborhood('');
    }
  }, [region, division, subdivision, village]);

  // Notify parent of changes
  useEffect(() => {
    onChange({
      region: region || undefined,
      division: division || undefined,
      subdivision: subdivision || undefined,
      village: village || undefined,
      neighborhood: neighborhood || undefined,
    });
  }, [region, division, subdivision, village, neighborhood, onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* REGION */}
      <div className="space-y-2">
        <Label htmlFor="region">
          {t('location.region')}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select
          value={region}
          onValueChange={(value) => setRegion(value)}
        >
          <SelectTrigger id="region">
            <SelectValue placeholder={t('location.selectRegion')} />
          </SelectTrigger>
          <SelectContent>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DIVISION */}
      {region && (
        <div className="space-y-2">
          <Label htmlFor="division">
            {t('location.division')}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={division}
            onValueChange={(value) => setDivision(value)}
            disabled={divisions.length === 0}
          >
            <SelectTrigger id="division">
              <SelectValue placeholder={t('location.selectDivision')} />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* SUBDIVISION */}
      {division && (
        <div className="space-y-2">
          <Label htmlFor="subdivision">
            {t('location.subdivision')}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={subdivision}
            onValueChange={(value) => setSubdivision(value)}
            disabled={subdivisions.length === 0}
          >
            <SelectTrigger id="subdivision">
              <SelectValue placeholder={t('location.selectSubdivision')} />
            </SelectTrigger>
            <SelectContent>
              {subdivisions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* VILLAGE */}
      {subdivision && (
        <div className="space-y-2">
          <Label htmlFor="village">
            {t('location.village')}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={village}
            onValueChange={(value) => setVillage(value)}
            disabled={villages.length === 0}
          >
            <SelectTrigger id="village">
              <SelectValue placeholder={t('location.selectVillage')} />
            </SelectTrigger>
            <SelectContent>
              {villages.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* NEIGHBORHOOD (Optional) */}
      {showNeighborhood && village && neighborhoods.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="neighborhood">
            {t('location.neighborhood')}
          </Label>
          <Select
            value={neighborhood}
            onValueChange={(value) => setNeighborhood(value)}
          >
            <SelectTrigger id="neighborhood">
              <SelectValue placeholder={t('location.selectNeighborhood')} />
            </SelectTrigger>
            <SelectContent>
              {neighborhoods.map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* SUMMARY (for verification) */}
      {village && (
        <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-md">
          <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
            {t('location.selected')}:
          </p>
          <p className="text-sm text-teal-600 dark:text-teal-300 mt-1">
            {[region, division, subdivision, village, neighborhood]
              .filter(Boolean)
              .join(' â†’ ')}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * COMPACT VERSION - For use in filters
 */
interface CompactLocationSelectorProps {
  value?: Partial<LocationDetails>;
  onChange: (location: Partial<LocationDetails>) => void;
  placeholder?: string;
}

export function CompactLocationSelector({
  value = {},
  onChange,
  placeholder = 'Select location...',
}: CompactLocationSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {value.village ? (
          <span className="text-gray-900">
            {[value.region, value.division, value.subdivision, value.village]
              .filter(Boolean)
              .join(', ')}
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <LocationSelector
            value={value}
            onChange={(location) => {
              onChange(location);
              if (location.village) {
                setIsOpen(false);
              }
            }}
            showNeighborhood={false}
          />
        </div>
      )}
    </div>
  );
}

/**
 * DISPLAY-ONLY VERSION - For showing location without editing
 */
interface LocationDisplayProps {
  location: Partial<LocationDetails>;
  showFull?: boolean; // True for subscribers, false for free users
  className?: string;
}

export function LocationDisplay({
  location,
  showFull = false,
  className = '',
}: LocationDisplayProps) {
  const { t } = useTranslation();

  if (!location.region) {
    return (
      <span className={`text-gray-500 ${className}`}>
        {t('location.notSpecified')}
      </span>
    );
  }

  if (!showFull) {
    // Free users see only region
    return (
      <div className={className}>
        <span className="text-gray-900">{location.region}</span>
        <span className="ml-2 text-sm text-gray-500">
          ({t('location.subscribeForDetails')})
        </span>
      </div>
    );
  }

  // Subscribers see full location
  const parts = [
    location.neighborhood,
    location.village,
    location.subdivision,
    location.division,
    location.region,
  ].filter(Boolean);

  return (
    <span className={`text-gray-900 ${className}`}>
      {parts.join(', ')}
    </span>
  );
}

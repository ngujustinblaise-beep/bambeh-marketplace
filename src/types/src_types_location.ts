/**
 * LOCATION TYPE DEFINITIONS
 *
 * Type definitions for  administrative divisions and location handling
 */

// ==================== LOCATION HIERARCHY ====================

export interface Village {
  name: string;
  neighborhoods?: string[];
}

export interface Subdivision {
  name: string;
  villages: Village[];
}

export interface Division {
  name: string;
  subdivisions: Subdivision[];
}

export interface RegionInfo {
  name: string;
  nameFr: string;
  capital: string;
  divisions: Division[];
}

// ==================== LOCATION DETAILS ====================

/**
 * Complete location information for an item or user
 */
export interface LocationDetails {
  region: string;
  division: string;
  subdivision: string;
  village: string;
  neighborhood?: string;
}

/**
 * Partial location for filtering (all fields optional)
 */
export interface LocationFilter extends Partial<LocationDetails> {
  searchQuery?: string;
}

// ==================== COORDINATES ====================

/**
 * GPS coordinates for mapping
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Location with GPS coordinates
 */
export interface LocationWithCoordinates extends LocationDetails {
  coordinates?: Coordinates;
}

// ==================== ADDRESS INFORMATION ====================

/**
 * Complete address information
 */
export interface Address {
  location: LocationDetails;
  streetAddress?: string;
  landmark?: string;
  postalCode?: string;
  coordinates?: Coordinates;
}

// ==================== LOCATION UTILITIES ====================

/**
 * Location display options
 */
export interface LocationDisplayOptions {
  showFull: boolean; // True for subscribers, false for free users,
  format?: "short" | "full" | "compact";
  includeNeighborhood?: boolean;
}

/**
 * Location validation result
 */
export interface LocationValidation {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// ==================== REGION INFORMATION ====================

/**
 * Extended region information with metadata
 */
export interface RegionInfo {
  population?: number;
  area?: number; // in square kilometers
  economicActivities?: string[];
  majorCities?: string[];
}

// ==================== SEARCH & FILTER ====================

/**
 * Location-based search parameters
 */
export interface LocationSearchParams {
  region?: string;
  division?: string;
  subdivision?: string;
  village?: string;
  radius?: number; // in kilometers (if coordinates available)
  center?: Coordinates;
}

/**
 * Location search result
 */
export interface LocationSearchResult {
  location: LocationDetails;
  matchScore: number; // Relevance score 0-100,
  distance?: number; // Distance in km if coordinates available
}

// ==================== TYPE GUARDS ====================

/**
 * Check if location has all required fields
 */
export const isCompleteLocation = (
  location: Partial<LocationDetails>,
): location is LocationDetails => {
  return !!(
    location.region &&
    location.division &&
    location.subdivision &&
    location.village
  );

/**
 * Check if location has coordinates
 */
}
export const hasCoordinates = (
  location: any,
): location is LocationWithCoordinates => {
  return !!(location.coordinates?.latitude && location.coordinates?.longitude);

// ==================== CONSTANTS ====================

/**
 *  regions (in English)
 */
}
export const _REGIONS = [
  "Adamawa",
  "Centre",
  "East",
  "Far North",
  "Littoral",
  "North",
  "Northwest",
  "South",
  "Southwest",
  "West",
] as const;

/**
 *  regions (in French)
 */
export const _REGIONS_FR = [
  "Adamaoua",
  "Centre",
  "Est",
  "Extrême-Nord",
  "Littoral",
  "Nord",
  "Nord-Ouest",
  "Sud",
  "Sud-Ouest",
  "Ouest",
] as const;

export type Region = (typeof _REGIONS)[number];
export type RegionFr = (typeof _REGIONS_FR)[number];

// ==================== HELPER TYPES ====================

/**
 * Location selector state
 */
export interface LocationSelectorState {
  region: string;
  division: string;
  subdivision: string;
  village: string;
  neighborhood?: string;
  isValid: boolean;
}

/**
 * Location change event
 */
export interface LocationChangeEvent {
  level: "region" | "division" | "subdivision" | "village" | "neighborhood";
  value: string;
  location: Partial<LocationDetails>;
}



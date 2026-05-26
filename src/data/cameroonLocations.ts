/**
 * src/data/cameroonLocations.ts
 * Bambeh Marketplace — Cameroon Cities & Regions
 * © 2026 Bambeh Marketplace. All rights reserved.
 *
 * FIXES: Removed duplicate export default (TS2528)
 *        cameroonLocations exported both as named and default
 */

export interface CameroonCity {
  name: string;
  region: string;
  population?: number;
  isCapital?: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface CameroonRegion {
  name: string;
  code: string;
  capital: string;
  cities: string[];
}

// ─── Regions ──────────────────────────────────────────────────────────────────
export const CAMEROON_REGIONS: CameroonRegion[] = [
  { name: "Centre",        code: "CE", capital: "Yaoundé",     cities: ["Yaoundé","Bafia","Mbalmayo","Obala","Nanga-Eboko","Monatélé","Ntui","Mfou","Akonolinga","Nkoteng"] },
  { name: "Littoral",      code: "LT", capital: "Douala",      cities: ["Douala","Nkongsamba","Edéa","Loum","Melong","Yabassi","Manjo","Mbanga","Dizangué","Penja"] },
  { name: "Adamaoua",      code: "AD", capital: "Ngaoundéré",  cities: ["Ngaoundéré","Meiganga","Tibati","Tignère","Banyo","Ngaoundal","Kontcha","Galim-Tignère"] },
  { name: "Nord",          code: "NO", capital: "Garoua",      cities: ["Garoua","Guider","Ngong","Pitoa","Rey Bouba","Touboro","Lagdo","Figuil"] },
  { name: "Extrême-Nord",  code: "EN", capital: "Maroua",      cities: ["Maroua","Kousséri","Mokolo","Yagoua","Mora","Kaélé","Mindif","Waza","Tokombéré"] },
  { name: "Nord-Ouest",    code: "NW", capital: "Bamenda",     cities: ["Bamenda","Kumbo","Wum","Ndop","Nkambe","Fundong","Bali","Mbengwi","Jakiri","Batibo"] },
  { name: "Ouest",         code: "OU", capital: "Bafoussam",   cities: ["Bafoussam","Dschang","Foumban","Bangangté","Mbouda","Foumbot","Baham","Bayangam","Bafang","Kekem"] },
  { name: "Sud-Ouest",     code: "SW", capital: "Buea",        cities: ["Buea","Kumba","Limbe","Mamfe","Mundemba","Tiko","Mutengene","Muyuka","Ekondo Titi","Idenau"] },
  { name: "Est",           code: "ES", capital: "Bertoua",     cities: ["Bertoua","Batouri","Abong-Mbang","Yokadouma","Belabo","Doumé","Ndelele","Kette","Lomié"] },
  { name: "Sud",           code: "SU", capital: "Ebolowa",     cities: ["Ebolowa","Kribi","Sangmélima","Ambam","Mvangué","Lolodorf","Djoum","Zoétélé","Bengbis","Niéte"] },
];

// ─── All cities flat list ─────────────────────────────────────────────────────
export const CAMEROON_CITIES: string[] = CAMEROON_REGIONS.flatMap((r) => r.cities);

// ─── Cities with region info ─────────────────────────────────────────────────
export const CAMEROON_CITIES_WITH_REGION: CameroonCity[] = CAMEROON_REGIONS.flatMap((region) =>
  region.cities.map((city) => ({
    name: city,
    region: region.name,
    isCapital: city === region.capital,
  }))
);

// ─── Major cities (top 20 by population) ─────────────────────────────────────
export const MAJOR_CITIES: CameroonCity[] = [
  { name: "Douala",      region: "Littoral",     population: 3500000, coordinates: { lat: 4.0511,  lng: 9.7679  } },
  { name: "Yaoundé",     region: "Centre",       population: 3500000, coordinates: { lat: 3.8480,  lng: 11.5021 } },
  { name: "Bamenda",     region: "Nord-Ouest",   population: 500000,  coordinates: { lat: 5.9597,  lng: 10.1456 } },
  { name: "Bafoussam",   region: "Ouest",        population: 400000,  coordinates: { lat: 5.4737,  lng: 10.4179 } },
  { name: "Garoua",      region: "Nord",         population: 400000,  coordinates: { lat: 9.3017,  lng: 13.3968 } },
  { name: "Maroua",      region: "Extrême-Nord", population: 350000,  coordinates: { lat: 10.5958, lng: 14.3156 } },
  { name: "Ngaoundéré",  region: "Adamaoua",     population: 250000,  coordinates: { lat: 7.3236,  lng: 13.5834 } },
  { name: "Kumba",       region: "Sud-Ouest",    population: 250000,  coordinates: { lat: 4.6363,  lng: 9.4468  } },
  { name: "Bertoua",     region: "Est",          population: 200000,  coordinates: { lat: 4.5785,  lng: 13.6838 } },
  { name: "Buea",        region: "Sud-Ouest",    population: 200000,  coordinates: { lat: 4.1554,  lng: 9.2448  } },
  { name: "Limbe",       region: "Sud-Ouest",    population: 170000,  coordinates: { lat: 4.0136,  lng: 9.2042  } },
  { name: "Ebolowa",     region: "Sud",          population: 150000,  coordinates: { lat: 2.9000,  lng: 11.1500 } },
  { name: "Mbalmayo",    region: "Centre",       population: 130000,  coordinates: { lat: 3.5165,  lng: 11.5006 } },
  { name: "Dschang",     region: "Ouest",        population: 120000,  coordinates: { lat: 5.4420,  lng: 10.0540 } },
  { name: "Kribi",       region: "Sud",          population: 120000,  coordinates: { lat: 2.9394,  lng: 9.9098  } },
  { name: "Foumban",     region: "Ouest",        population: 100000,  coordinates: { lat: 5.7247,  lng: 10.9014 } },
  { name: "Edéa",        region: "Littoral",     population: 100000,  coordinates: { lat: 3.7996,  lng: 10.1311 } },
  { name: "Nkongsamba",  region: "Littoral",     population: 100000,  coordinates: { lat: 4.9553,  lng: 9.9417  } },
  { name: "Bafia",       region: "Centre",       population: 80000,   coordinates: { lat: 4.7500,  lng: 11.2333 } },
  { name: "Sangmélima",  region: "Sud",          population: 70000,   coordinates: { lat: 2.9333,  lng: 11.9833 } },
];

// ─── Helper functions ─────────────────────────────────────────────────────────
export function getCitiesForRegion(regionName: string): string[] {
  return CAMEROON_REGIONS.find((r) => r.name === regionName)?.cities ?? [];
}

export function getRegionForCity(cityName: string): string | undefined {
  return CAMEROON_CITIES_WITH_REGION.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  )?.region;
}

export function searchCities(query: string): CameroonCity[] {
  const q = query.toLowerCase().trim();
  if (!q) return MAJOR_CITIES;
  return CAMEROON_CITIES_WITH_REGION.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q)
  );
}

export function getCityCoordinates(cityName: string): { lat: number; lng: number } | undefined {
  return MAJOR_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  )?.coordinates;
}

// ─── Named export (used by many files) ────────────────────────────────────────
export const cameroonLocations = {
  regions: CAMEROON_REGIONS,
  cities: CAMEROON_CITIES,
  citiesWithRegion: CAMEROON_CITIES_WITH_REGION,
  majorCities: MAJOR_CITIES,
  getCitiesForRegion,
  getRegionForCity,
  searchCities,
  getCityCoordinates,
};

// ─── Default export — ONE only (fixes TS2528) ─────────────────────────────────
export default cameroonLocations;

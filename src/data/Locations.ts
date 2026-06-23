/**
 * Cameroon Locations Data (Clean UTF-8 Safe Version)
 * Auto-rebuilt to remove corrupted encoding
 */

export const REGIONS: string[] = [
  "Adamawa","Centre","East","Far North","Littoral",
  "North","North West","South","South West","West",
];

export const CITIES_BY_REGION: Record<string, string[]> = {
  Adamawa: ["Ngaoundere","Meiganga","Tibati","Banyo","Tignere"],
  Centre: ["Yaounde","Mbalmayo","Bafia","Obala","Nanga Eboko","Eseka","Monatele"],
  East: ["Bertoua","Batouri","Abong-Mbang","Yokadouma","Mbang"],
  "Far North": ["Maroua","Kousseri","Mokolo","Yagoua","Kaele","Mora"],
  Littoral: ["Douala","Edea","Nkongsamba","Mbanga","Loum","Yabassi"],
  North: ["Garoua","Guider","Pitoa","Tchollire","Lagdo"],
  "North West": ["Bamenda","Kumbo","Wum","Ndop","Mbengwi","Fundong","Bali"],
  South: ["Ebolowa","Kribi","Sangmelima","Ambam","Lolodorf"],
  "South West": ["Buea","Limbe","Kumba","Mamfe","Mundemba","Tiko","Muyuka"],
  West: ["Bafoussam","Dschang","Foumban","Mbouda","Bangangte","Bafang"],
};

export const QUARTIERS_BY_CITY: Record<string, string[]> = {
  Yaounde: ["Bastos","Omnisports","Nlongkak","Mvan","Mvog-Mbi","Essos","Ekounou","Biyem-Assi"],
  Douala: ["Akwa","Bonanjo","Bassa","Bonaberi","Deido","New Bell","Makepe","Kotto"],
  Bamenda: ["Commercial Avenue","Up Station","Nkwen","Old Town","Mankon"],
  Buea: ["Molyko","Bonduma","Great Soppo","Clerks Quarter","Muea"],
  Limbe: ["Down Beach","Mile 1","Mile 2","Bota","Mabeta"],
  Bafoussam: ["Tamdja","Kamkop","Djeleng","Banengo","Ngouache"],
  Ngaoundere: ["Centre","Dang"],
  Maroua: ["Domayo","Dougoy","Palar"],
  Garoua: ["Centre","Yelwa","Roumde Adjia"],
  Ebolowa: ["Centre","Nkoemvone"],
};


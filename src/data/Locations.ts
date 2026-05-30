/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CAMEROON LOCATIONS DATA
 * ═══════════════════════════════════════════════════════════════════════════
 * Regions, cities, and quartiers for Bambeh Marketplace
 * FILE: src/data/Locations.ts
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const REGIONS: string[] = [
  "Adamawa",
  "Centre",
  "East",
  "Far North",
  "Littoral",
  "North",
  "North West",
  "South",
  "South West",
  "West",
];

export const CITIES_BY_REGION: Record<string, string[]> = {
  Adamawa: ["Ngaoundéré", "Meiganga", "Tibati", "Banyo", "Tignère"],
  Centre: ["Yaoundé", "Mbalmayo", "Bafia", "Obala", "Nanga Eboko", "Eseka", "Monatélé"],
  East: ["Bertoua", "Batouri", "Abong-Mbang", "Yokadouma", "Mbang"],
  "Far North": ["Maroua", "Kousseri", "Mokolo", "Yagoua", "Kaélé", "Mora"],
  Littoral: ["Douala", "Edéa", "Nkongsamba", "Mbanga", "Loum", "Yabassi"],
  North: ["Garoua", "Guider", "Pitoa", "Tcholliré", "Lagdo"],
  "North West": ["Bamenda", "Kumbo", "Wum", "Ndop", "Mbengwi", "Fundong", "Bali"],
  South: ["Ebolowa", "Kribi", "Sangmélima", "Ambam", "Lolodorf"],
  "South West": ["Buea", "Limbe", "Kumba", "Mamfe", "Mundemba", "Tiko", "Muyuka"],
  West: ["Bafoussam", "Dschang", "Foumban", "Mbouda", "Bangangté", "Bafang", "Nkongsamba"],
};

export const QUARTIERS_BY_CITY: Record<string, string[]> = {
  // Centre — Yaoundé
  Yaoundé: [
    "Bastos", "Omnisports", "Nlongkak", "Mvan", "Mvog-Mbi", "Essos",
    "Nkomo", "Ekounou", "Biyem-Assi", "Mendong", "Messa", "Briqueterie",
    "Mokolo", "Ngousso", "Tsinga", "Etoa-Meki", "Nkolbisson", "Olembe",
    "Simbock", "Etoudi", "Mvog-Ada", "Kondengui", "Nsimeyong", "Mimboman",
    "Emana", "Nkol-Eton", "Ahala", "Efoulan", "Djoungolo",
  ],
  Mbalmayo: ["Centre Ville", "Ngonmedzap", "Akono", "Nkolmetet"],
  Bafia: ["Centre", "Kiiki", "Bokito"],
  Obala: ["Centre", "Soa", "Evodoula"],

  // Littoral — Douala
  Douala: [
    "Akwa", "Bonanjo", "Bassa", "Bonabéri", "Deido", "New Bell",
    "Ndokotti", "Makepe", "Logpom", "Kotto", "Mboppi", "Bonapriso",
    "Bonamoussadi", "Kak", "Ndog-Bong", "Ndog-Passi", "Village",
    "Cité des Palmiers", "PK14", "PK8", "PK10", "Mbanya", "Nyalla",
    "Ndoghem", "Nylon", "Ngodi-Bakoko", "Soboum",
  ],
  Edéa: ["Centre", "Dizangué", "Mouanko"],
  Nkongsamba: ["Centre", "Melong", "Nlohé"],

  // North West — Bamenda
  Bamenda: [
    "Commercial Avenue", "Up Station", "Mile 2 Nkwen", "Mile 4 Nkwen",
    "Ntarikon", "Mankon", "Alakuma", "Cow Street", "Old Town",
    "Hospital Roundabout", "Food Market", "Bayelle", "Azire", "Mbengwi Road",
    "Nkwen", "Bamendakwe", "Chomba",
  ],
  Kumbo: ["Tobin", "Mbve", "Jakiri", "Nkar", "Nso"],
  Wum: ["Centre", "Bafumen", "Esu"],
  Ndop: ["Bafut", "Babessi", "Ngombo"],
  Mbengwi: ["Centre", "Batibo", "Widikum"],
  Fundong: ["Centre", "Njinikom", "Belo"],
  Bali: ["Centre", "Bali Nyonga", "Bali Gangsin"],

  // South West — Buea
  Buea: [
    "Molyko", "Bonduma", "Great Soppo", "Small Soppo", "Clerks Quarter",
    "Mile 16", "Mile 17", "Buea Town", "Bokwango", "Muea",
    "Federal Quarter", "Sandpit", "Bomaka",
  ],
  Limbe: [
    "Down Beach", "Mile 1", "Mile 2", "Mile 3", "Mile 4",
    "Bota", "Church Street", "Newtown", "Mabeta", "Cassava Farm",
  ],
  Kumba: ["Fiango", "Mbonge", "Nguti", "Kake", "Marumba"],
  Mamfe: ["Centre", "Ekok", "Tali"],
  Tiko: ["Centre", "Mutengene", "Ombe"],
  Muyuka: ["Centre", "Tombel", "Konye"],

  // West — Bafoussam
  Bafoussam: [
    "Tamdja", "Kamkop", "Djeleng", "Banengo", "Ndiandam",
    "Kouogouo", "Ngouache", "Famla", "Tougang", "Liberté",
  ],
  Dschang: ["Centre", "Foto", "Foréké", "Bafou", "Penka-Michel"],
  Foumban: ["Centre", "Koutaba", "Massangam", "Malantouen"],
  Mbouda: ["Centre", "Babadjou", "Galim", "Batcham"],
  Bangangté: ["Centre", "Bazou", "Tonga"],
  Bafang: ["Centre", "Bana", "Kekem", "Bandja"],

  // Adamawa — Ngaoundéré
  Ngaoundéré: ["Centre", "Burkina", "Joli-Soir", "Bamyanga", "Dang"],
  Meiganga: ["Centre", "Djohong"],
  Tibati: ["Centre"],
  Banyo: ["Centre"],
  Tignère: ["Centre"],

  // East — Bertoua
  Bertoua: ["Centre", "Nkolbikon", "Haoussa", "Mokolo II"],
  Batouri: ["Centre", "Ndelele"],
  "Abong-Mbang": ["Centre"],
  Yokadouma: ["Centre", "Moloundou"],

  // Far North — Maroua
  Maroua: ["Dougoy", "Domayo", "Kakataré", "Boudouri", "Palar", "Pont Vert"],
  Kousseri: ["Centre", "Maltam", "Fotokol"],
  Mokolo: ["Centre", "Mozogo"],
  Yagoua: ["Centre", "Kalfou"],
  Kaélé: ["Centre", "Mindif"],
  Mora: ["Centre", "Kolofata"],

  // North — Garoua
  Garoua: ["Centre", "Yelwa", "Roumdé Adjia", "Bibemi", "Demsa"],
  Guider: ["Centre", "Figuil"],
  Pitoa: ["Centre"],
  Tcholliré: ["Centre", "Rey Bouba"],
  Lagdo: ["Centre"],

  // South — Ebolowa
  Ebolowa: ["Centre", "Nkoemvone", "Djoum", "Meyomessala"],
  Kribi: ["Centre", "Akom II", "Bipindi", "Lolodorf"],
  Sangmélima: ["Centre", "Bengbis", "Dja"],
  Ambam: ["Centre", "Ma'an", "Olamze"],

  // South West — Mundemba
  Mundemba: ["Centre", "Isangele", "Toko"],
};

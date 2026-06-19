/**
 * src/data/Locations.ts
 * All 10 regions, major cities, and common quarters/kwatas of .
 * This file is imported by LocationCascade and all posting forms.
 */

export const REGIONS: string[] = [
  "Centre",
  "Littoral",
  "West",
  "South West",
  "North West",
  "Adamawa",
  "South",
  "East",
  "North",
  "Far North",
];

export const CITIES_BY_REGION: Record<string, string[]> = {
  Centre:        ["YaoundÃ©", "Obala", "Mbalmayo", "Bafia", "Nanga-Eboko", "MonatÃ©lÃ©", "Akonolinga", "Eseka"],
  Littoral:      ["Douala", "Nkongsamba", "Mbanga", "EdÃ©a", "Loum", "Manjo", "NdounguÃ©"],
  West:          ["Bafoussam", "Dschang", "Foumban", "Mbouda", "Bafang", "Baham", "BangantÃ©", "Foumbot"],
  "South West":  ["Buea", "Limbe", "Kumba", "Mamfe", "Tiko", "Muyuka", "Mundemba", "Ekondo Titi"],
  "North West":  ["Bamenda", "Kumbo", "Wum", "Ndop", "Mbengwi", "Fundong", "Nkambe", "Batibo"],
  Adamawa:       ["NgaoundÃ©rÃ©", "Meiganga", "Tibati", "TignÃ¨re", "Banyo", "Vina"],
  South:         ["Ebolowa", "Kribi", "SangmÃ©lima", "Ambam", "Lolodorf", "Meyomessala"],
  East:          ["Bertoua", "Batouri", "Yokadouma", "Abong-Mbang", "Belabo", "LomiÃ©"],
  North:         ["Garoua", "Guider", "Pitoa", "Figuil", "Lagdo", "Rey-Bouba"],
  "Far North":   ["Maroua", "Kousseri", "Mora", "Yagoua", "Moulvoudaye", "KaÃ©lÃ©", "Meri"],
};

export const QUARTIERS_BY_CITY: Record<string, string[]> = {
  // YaoundÃ©
  YaoundÃ©: [
    "Mvan", "Mimboman", "Biyem-Assi", "Ngoa-Ekele", "Bastos",
    "Emombo", "Essos", "Mendong", "Nkolbisson", "Simbock",
    "Mvog-Mbi", "Elig-Essono", "Nlongkak", "Ekoudou", "Melen",
    "Omnisport", "Etoa-Meki", "Obili", "Mfandena", "Nsimeyong",
    "Efoulan", "Mvog-Ada", "Tsinga", "Fouda", "Madagascar",
    "Briqueterie", "Nkolmesseng", "Djoungolo", "Olembe", "Nkol-Afeme",
    "Messa", "Ntougou", "Kondengui",
  ],
  // Douala
  Douala: [
    "Bonamoussadi", "Akwa", "Bassa", "Bonapriso", "Deido",
    "Makepe", "Kotto", "Logbaba", "Ndokoti", "Village",
    "BonabÃ©ri", "Yassa", "Nyalla", "PK8", "PK12", "PK14",
    "Mboppi", "New-Bell", "Brazzaville", "Ndog-Passi", "Beedi",
    "Bali", "Cite des Palmiers", "Nylon",
  ],
  // Bafoussam
  Bafoussam: ["Djeleng", "Tamdja", "Kamkop", "Tsia", "Tougang", "Banengo", "Famla", "Nkolpem"],
  // Buea
  Buea: ["Molyko", "Great Soppo", "Mile 16", "Bomaka", "Muea", "Bokova", "Tole", "Sandpit"],
  // Bamenda
  Bamenda: ["Ntarinkon", "Up Station", "Old Town", "Nkwen", "Mile 2", "Mankon", "Mulang", "Azire"],
  // Limbe
  Limbe: ["Bota", "Down Beach", "Mile 4", "New Town", "Clerks Quarter", "GRA", "Half Mile"],
  // Kumba
  Kumba: ["Fiango", "Konye", "Titi", "Mile 6", "Mbonge Road"],
  // NgaoundÃ©rÃ©
  NgaoundÃ©rÃ©: ["Ngaoundal", "Dang", "Baladji", "Socaret", "Burkina", "Mbideng"],
  // Garoua
  Garoua: ["LopÃ©rÃ©", "BibÃ©mi", "Ngong", "RoumdÃ© Adjia", "PoumpoumrÃ©"],
  // Maroua
  Maroua: ["Domayo", "KakatarÃ©", "Dougoi", "HardÃ©", "FounanguÃ©"],
  // Ebolowa
  Ebolowa: ["Nkol-Etet", "AngalÃ©", "Ntom", "Mbida-Mbi"],
  // Kribi
  Kribi: ["Centre", "Mbangue", "Afan Mabe", "LolabÃ©"],
  // Bertoua
  Bertoua: ["Centre-ville", "Haoussa", "Mokolo", "Nkolbikon", "Dangoh"],
  // Dschang
  Dschang: ["Centre", "Foto", "Toutsang", "Ngui"],
  // Foumban
  Foumban: ["Centre", "Nkoumadjap", "Njimom"],
};


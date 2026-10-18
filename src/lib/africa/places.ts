// BAMBEH_DEPLOY_TOKEN__AFRICA_PLACES_FIX769_CLEAN
/**
 * src/lib/africa/places.ts - FIX769 (new, 15 Oct 2026)
 *
 * REGIONS AND TOWNS FOR EVERY LOCATION FILTER - one list instead of five.
 * Until now each page carried its own Cameroon-only list (the location filter FIX379, Locations.ts, the posting
 * step, gas & food, women's health) and none of them could take a second country. Now:
 *  - Cameroon: the 10 regions with their towns (the towns of all the old lists put together, Kumba in the
 *    South West where it belongs) and neighbourhood suggestions for the big towns.
 *  - The 5 other CEMAC countries and the 12 ECOWAS countries: their current first-level regions with the main
 *    town of each (Congo's 15 departments of 2024, the Central African Republic's 20 prefectures of 2020,
 *    Chad's 23 provinces, Ghana's 16 regions, Nigeria's 36 states and Abuja...).
 *  - Any other African country: no list yet - the filters let people type the region and the town.
 * A region's VALUE is its English name - for Cameroon exactly what the FIX379 filter always stored
 * ('North West', 'South West'), so listings saved before keep matching. key is the short name used in the
 * database (for Cameroon the same keys as women's health: adamaoua ... sud_ouest).
 * MY TOWN: the town a person picks on one free page (Pharmacies, Hospitals, Water & lights, Fuel at night, Safety
 * alerts) opens the next free page in that town too - picked once, not five times. Kept on the phone only.
 * Plain ASCII: every accent is an escape.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { HOME, countryLang } from './countries';

export interface AfricaRegion {
  readonly key: string;
  /** the value filters store (English name) */
  readonly name: string;
  readonly fr: string;
  readonly ar?: string;
  readonly ff?: string;
  /** main town first */
  readonly towns: readonly string[];
}

const R = (key: string, name: string, fr: string, towns: string[], more?: { ar?: string; ff?: string }): AfricaRegion =>
  Object.freeze({ key, name, fr, towns: Object.freeze(towns), ar: more && more.ar, ff: more && more.ff });

export const REGIONS_BY_COUNTRY: Readonly<Record<string, readonly AfricaRegion[]>> = Object.freeze({
  CM: [
    R("adamaoua", "Adamawa", "Adamaoua", ["Ngaound\u00e9r\u00e9", "Meiganga", "Tibati", "Banyo", "Tign\u00e8re", "Ngaoundal"], { ar: "\u0623\u062f\u0627\u0645\u0627\u0648\u0627", ff: "Adamaawa" }),
    R("centre", "Centre", "Centre", ["Yaound\u00e9", "Mbalmayo", "Obala", "Mfou", "Soa", "Bafia", "Es\u00e9ka", "Nanga Eboko", "Akonolinga", "Monat\u00e9l\u00e9", "Mbandjock", "Ntui"], { ar: "\u0627\u0644\u0648\u0633\u0637" }),
    R("est", "East", "Est", ["Bertoua", "Batouri", "Abong-Mbang", "Yokadouma", "Doum\u00e9", "Belabo", "Garoua-Boula\u00ef", "Mbang", "Lomi\u00e9"], { ar: "\u0627\u0644\u0634\u0631\u0642" }),
    R("extreme_nord", "Far North", "Extr\u00eame-Nord", ["Maroua", "Kouss\u00e9ri", "Mokolo", "Mora", "Yagoua", "Ka\u00e9l\u00e9"], { ar: "\u0623\u0642\u0635\u0649 \u0627\u0644\u0634\u0645\u0627\u0644" }),
    R("littoral", "Littoral", "Littoral", ["Douala", "Nkongsamba", "Ed\u00e9a", "Loum", "Mbanga", "Manjo", "Penja", "Yabassi", "Dibombari"], { ar: "\u0627\u0644\u0633\u0627\u062d\u0644" }),
    R("nord", "North", "Nord", ["Garoua", "Guider", "Figuil", "Poli", "Tchollir\u00e9", "Pitoa", "Lagdo", "Rey Bouba", "Bibemi"], { ar: "\u0627\u0644\u0634\u0645\u0627\u0644" }),
    R("nord_ouest", "North West", "Nord-Ouest", ["Bamenda", "Kumbo", "Ndop", "Wum", "Nkambe", "Bali", "Mbengwi", "Fundong", "Santa", "Bafut"], { ar: "\u0627\u0644\u0634\u0645\u0627\u0644 \u0627\u0644\u063a\u0631\u0628\u064a" }),
    R("ouest", "West", "Ouest", ["Bafoussam", "Dschang", "Foumban", "Mbouda", "Bangangt\u00e9", "Bafang", "Foumbot", "Bandjoun", "Baham"], { ar: "\u0627\u0644\u063a\u0631\u0628" }),
    R("sud", "South", "Sud", ["Ebolowa", "Kribi", "Sangm\u00e9lima", "Ambam", "Lolodorf", "Djoum", "Campo"], { ar: "\u0627\u0644\u062c\u0646\u0648\u0628" }),
    R("sud_ouest", "South West", "Sud-Ouest", ["Buea", "Limbe", "Kumba", "Tiko", "Mutengene", "Mamfe", "Muyuka", "Mundemba", "Ekondo Titi"], { ar: "\u0627\u0644\u062c\u0646\u0648\u0628 \u0627\u0644\u063a\u0631\u0628\u064a" }),
  ],
  CF: [
    R("bangui", "Bangui", "Bangui", ["Bangui"]),
    R("bamingui_bangoran", "Bamingui-Bangoran", "Bamingui-Bangoran", ["Nd\u00e9l\u00e9"]),
    R("basse_kotto", "Basse-Kotto", "Basse-Kotto", ["Mobaye"]),
    R("haute_kotto", "Haute-Kotto", "Haute-Kotto", ["Bria"]),
    R("haut_mbomou", "Haut-Mbomou", "Haut-Mbomou", ["Obo"]),
    R("kemo", "K\u00e9mo", "K\u00e9mo", ["Sibut"]),
    R("lim_pende", "Lim-Pend\u00e9", "Lim-Pend\u00e9", ["Paoua"]),
    R("lobaye", "Lobaye", "Lobaye", ["Mba\u00efki"]),
    R("mambere", "Mamb\u00e9r\u00e9", "Mamb\u00e9r\u00e9", ["Carnot"]),
    R("mambere_kadei", "Mamb\u00e9r\u00e9-Kad\u00e9\u00ef", "Mamb\u00e9r\u00e9-Kad\u00e9\u00ef", ["Berb\u00e9rati"]),
    R("mbomou", "Mbomou", "Mbomou", ["Bangassou"]),
    R("nana_grebizi", "Nana-Gr\u00e9bizi", "Nana-Gr\u00e9bizi", ["Kaga-Bandoro"]),
    R("nana_mambere", "Nana-Mamb\u00e9r\u00e9", "Nana-Mamb\u00e9r\u00e9", ["Bouar"]),
    R("ombella_mpoko", "Ombella-M'Poko", "Ombella-M'Poko", ["Boali", "Bimbo"]),
    R("ouaka", "Ouaka", "Ouaka", ["Bambari"]),
    R("ouham", "Ouham", "Ouham", ["Bossangoa"]),
    R("ouham_fafa", "Ouham-Fafa", "Ouham-Fafa", ["Batangafo"]),
    R("ouham_pende", "Ouham-Pend\u00e9", "Ouham-Pend\u00e9", ["Bozoum"]),
    R("sangha_mbaere", "Sangha-Mba\u00e9r\u00e9", "Sangha-Mba\u00e9r\u00e9", ["Nola"]),
    R("vakaga", "Vakaga", "Vakaga", ["Birao"]),
  ],
  TD: [
    R("ndjamena", "N'Djamena", "N'Djamena", ["N'Djamena"]),
    R("barh_el_gazel", "Barh El Gazel", "Barh El Gazel", ["Moussoro"]),
    R("batha", "Batha", "Batha", ["Ati"]),
    R("borkou", "Borkou", "Borkou", ["Faya-Largeau"]),
    R("chari_baguirmi", "Chari-Baguirmi", "Chari-Baguirmi", ["Massenya"]),
    R("ennedi_est", "Ennedi-Est", "Ennedi-Est", ["Amdjarass"]),
    R("ennedi_ouest", "Ennedi-Ouest", "Ennedi-Ouest", ["Fada"]),
    R("guera", "Gu\u00e9ra", "Gu\u00e9ra", ["Mongo"]),
    R("hadjer_lamis", "Hadjer-Lamis", "Hadjer-Lamis", ["Massakory"]),
    R("kanem", "Kanem", "Kanem", ["Mao"]),
    R("lac", "Lac", "Lac", ["Bol"]),
    R("logone_occidental", "Logone Occidental", "Logone Occidental", ["Moundou"]),
    R("logone_oriental", "Logone Oriental", "Logone Oriental", ["Doba"]),
    R("mandoul", "Mandoul", "Mandoul", ["Koumra"]),
    R("mayo_kebbi_est", "Mayo-Kebbi Est", "Mayo-Kebbi Est", ["Bongor"]),
    R("mayo_kebbi_ouest", "Mayo-Kebbi Ouest", "Mayo-Kebbi Ouest", ["Pala"]),
    R("moyen_chari", "Moyen-Chari", "Moyen-Chari", ["Sarh"]),
    R("ouaddai", "Ouadda\u00ef", "Ouadda\u00ef", ["Ab\u00e9ch\u00e9"]),
    R("salamat", "Salamat", "Salamat", ["Am Timan"]),
    R("sila", "Sila", "Sila", ["Goz Be\u00efda"]),
    R("tandjile", "Tandjil\u00e9", "Tandjil\u00e9", ["La\u00ef"]),
    R("tibesti", "Tibesti", "Tibesti", ["Barda\u00ef"]),
    R("wadi_fira", "Wadi Fira", "Wadi Fira", ["Biltine"]),
  ],
  CG: [
    R("brazzaville", "Brazzaville", "Brazzaville", ["Brazzaville"]),
    R("pointe_noire", "Pointe-Noire", "Pointe-Noire", ["Pointe-Noire"]),
    R("bouenza", "Bouenza", "Bouenza", ["Madingou", "Nkayi"]),
    R("congo_oubangui", "Congo-Oubangui", "Congo-Oubangui", ["Mossaka"]),
    R("cuvette", "Cuvette", "Cuvette", ["Owando", "Oyo"]),
    R("cuvette_ouest", "Cuvette-Ouest", "Cuvette-Ouest", ["Ewo"]),
    R("djoue_lefini", "Djou\u00e9-L\u00e9fini", "Djou\u00e9-L\u00e9fini", ["Odziba"]),
    R("kouilou", "Kouilou", "Kouilou", ["Loango"]),
    R("lekoumou", "L\u00e9koumou", "L\u00e9koumou", ["Sibiti"]),
    R("likouala", "Likouala", "Likouala", ["Impfondo"]),
    R("niari", "Niari", "Niari", ["Dolisie"]),
    R("nkeni_alima", "Nk\u00e9ni-Alima", "Nk\u00e9ni-Alima", ["Gamboma"]),
    R("plateaux", "Plateaux", "Plateaux", ["Djambala"]),
    R("pool", "Pool", "Pool", ["Kinkala"]),
    R("sangha", "Sangha", "Sangha", ["Ouesso"]),
  ],
  GQ: [
    R("bioko_norte", "Bioko Norte", "Bioko Nord", ["Malabo"]),
    R("litoral", "Litoral", "Littoral", ["Bata"]),
    R("annobon", "Annob\u00f3n", "Annob\u00f3n", ["San Antonio de Pal\u00e9"]),
    R("bioko_sur", "Bioko Sur", "Bioko Sud", ["Luba"]),
    R("centro_sur", "Centro Sur", "Centre-Sud", ["Evinayong"]),
    R("djibloho", "Djibloho", "Djibloho", ["Ciudad de la Paz"]),
    R("kie_ntem", "Ki\u00e9-Ntem", "Ki\u00e9-Ntem", ["Ebebiy\u00edn"]),
    R("wele_nzas", "Wele-Nzas", "Wele-Nzas", ["Mongomo"]),
  ],
  GA: [
    R("estuaire", "Estuaire", "Estuaire", ["Libreville", "Owendo", "Akanda", "Ntoum"]),
    R("haut_ogooue", "Haut-Ogoou\u00e9", "Haut-Ogoou\u00e9", ["Franceville", "Moanda"]),
    R("moyen_ogooue", "Moyen-Ogoou\u00e9", "Moyen-Ogoou\u00e9", ["Lambar\u00e9n\u00e9"]),
    R("ngounie", "Ngouni\u00e9", "Ngouni\u00e9", ["Mouila"]),
    R("nyanga", "Nyanga", "Nyanga", ["Tchibanga"]),
    R("ogooue_ivindo", "Ogoou\u00e9-Ivindo", "Ogoou\u00e9-Ivindo", ["Makokou"]),
    R("ogooue_lolo", "Ogoou\u00e9-Lolo", "Ogoou\u00e9-Lolo", ["Koulamoutou"]),
    R("ogooue_maritime", "Ogoou\u00e9-Maritime", "Ogoou\u00e9-Maritime", ["Port-Gentil"]),
    R("woleu_ntem", "Woleu-Ntem", "Woleu-Ntem", ["Oyem", "Bitam"]),
  ],
  BJ: [
    R("littoral", "Littoral", "Littoral", ["Cotonou"]),
    R("oueme", "Ou\u00e9m\u00e9", "Ou\u00e9m\u00e9", ["Porto-Novo"]),
    R("alibori", "Alibori", "Alibori", ["Kandi"]),
    R("atacora", "Atacora", "Atacora", ["Natitingou"]),
    R("atlantique", "Atlantique", "Atlantique", ["Allada", "Abomey-Calavi", "Ouidah"]),
    R("borgou", "Borgou", "Borgou", ["Parakou"]),
    R("collines", "Collines", "Collines", ["Dassa-Zoum\u00e9"]),
    R("couffo", "Couffo", "Couffo", ["Aplahou\u00e9"]),
    R("donga", "Donga", "Donga", ["Djougou"]),
    R("mono", "Mono", "Mono", ["Lokossa"]),
    R("plateau", "Plateau", "Plateau", ["Pob\u00e8"]),
    R("zou", "Zou", "Zou", ["Abomey", "Bohicon"]),
  ],
  CV: [
    R("santiago", "Santiago", "Santiago", ["Praia", "Assomada"]),
    R("sao_vicente", "S\u00e3o Vicente", "S\u00e3o Vicente", ["Mindelo"]),
    R("sal", "Sal", "Sal", ["Espargos", "Santa Maria"]),
    R("santo_antao", "Santo Ant\u00e3o", "Santo Ant\u00e3o", ["Porto Novo"]),
    R("sao_nicolau", "S\u00e3o Nicolau", "S\u00e3o Nicolau", ["Ribeira Brava"]),
    R("boa_vista", "Boa Vista", "Boa Vista", ["Sal Rei"]),
    R("maio", "Maio", "Maio", ["Porto Ingl\u00eas"]),
    R("fogo", "Fogo", "Fogo", ["S\u00e3o Filipe"]),
    R("brava", "Brava", "Brava", ["Nova Sintra"]),
  ],
  CI: [
    R("abidjan", "Abidjan", "Abidjan", ["Abidjan"]),
    R("yamoussoukro", "Yamoussoukro", "Yamoussoukro", ["Yamoussoukro"]),
    R("bas_sassandra", "Bas-Sassandra", "Bas-Sassandra", ["San-P\u00e9dro"]),
    R("comoe", "Como\u00e9", "Como\u00e9", ["Abengourou"]),
    R("denguele", "Dengu\u00e9l\u00e9", "Dengu\u00e9l\u00e9", ["Odienn\u00e9"]),
    R("goh_djiboua", "G\u00f4h-Djiboua", "G\u00f4h-Djiboua", ["Gagnoa"]),
    R("lacs", "Lacs", "Lacs", ["Dimbokro"]),
    R("lagunes", "Lagunes", "Lagunes", ["Dabou"]),
    R("montagnes", "Montagnes", "Montagnes", ["Man"]),
    R("sassandra_marahoue", "Sassandra-Marahou\u00e9", "Sassandra-Marahou\u00e9", ["Daloa"]),
    R("savanes", "Savanes", "Savanes", ["Korhogo"]),
    R("vallee_du_bandama", "Vall\u00e9e du Bandama", "Vall\u00e9e du Bandama", ["Bouak\u00e9"]),
    R("woroba", "Woroba", "Woroba", ["S\u00e9gu\u00e9la"]),
    R("zanzan", "Zanzan", "Zanzan", ["Bondoukou"]),
  ],
  GM: [
    R("banjul", "Banjul", "Banjul", ["Banjul"]),
    R("kanifing", "Kanifing", "Kanifing", ["Kanifing", "Serrekunda", "Bakau"]),
    R("west_coast", "West Coast", "West Coast", ["Brikama"]),
    R("lower_river", "Lower River", "Lower River", ["Mansa Konko", "Soma"]),
    R("north_bank", "North Bank", "North Bank", ["Kerewan", "Farafenni"]),
    R("central_river", "Central River", "Central River", ["Janjanbureh"]),
    R("upper_river", "Upper River", "Upper River", ["Basse Santa Su"]),
  ],
  GH: [
    R("greater_accra", "Greater Accra", "Grand Accra", ["Accra", "Tema", "Madina"]),
    R("ashanti", "Ashanti", "Ashanti", ["Kumasi", "Obuasi"]),
    R("ahafo", "Ahafo", "Ahafo", ["Goaso"]),
    R("bono", "Bono", "Bono", ["Sunyani"]),
    R("bono_east", "Bono East", "Bono Est", ["Techiman"]),
    R("central", "Central", "Centre", ["Cape Coast", "Winneba", "Kasoa"]),
    R("eastern", "Eastern", "Est", ["Koforidua"]),
    R("north_east", "North East", "Nord-Est", ["Nalerigu"]),
    R("northern", "Northern", "Nord", ["Tamale"]),
    R("oti", "Oti", "Oti", ["Dambai"]),
    R("savannah", "Savannah", "Savane", ["Damongo"]),
    R("upper_east", "Upper East", "Haut-Est", ["Bolgatanga"]),
    R("upper_west", "Upper West", "Haut-Ouest", ["Wa"]),
    R("volta", "Volta", "Volta", ["Ho", "Aflao"]),
    R("western", "Western", "Ouest", ["Sekondi-Takoradi", "Tarkwa"]),
    R("western_north", "Western North", "Ouest-Nord", ["Sefwi Wiawso"]),
  ],
  GN: [
    R("conakry", "Conakry", "Conakry", ["Conakry"]),
    R("boke", "Bok\u00e9", "Bok\u00e9", ["Bok\u00e9", "Kamsar"]),
    R("faranah", "Faranah", "Faranah", ["Faranah"]),
    R("kankan", "Kankan", "Kankan", ["Kankan", "Siguiri"]),
    R("kindia", "Kindia", "Kindia", ["Kindia", "Coyah", "Dubr\u00e9ka"]),
    R("labe", "Lab\u00e9", "Lab\u00e9", ["Lab\u00e9"]),
    R("mamou", "Mamou", "Mamou", ["Mamou"]),
    R("nzerekore", "Nz\u00e9r\u00e9kor\u00e9", "Nz\u00e9r\u00e9kor\u00e9", ["Nz\u00e9r\u00e9kor\u00e9"]),
  ],
  GW: [
    R("bissau", "Bissau", "Bissau", ["Bissau"]),
    R("bafata", "Bafat\u00e1", "Bafat\u00e1", ["Bafat\u00e1"]),
    R("biombo", "Biombo", "Biombo", ["Quinh\u00e1mel"]),
    R("bolama", "Bolama", "Bolama", ["Bolama"]),
    R("cacheu", "Cacheu", "Cacheu", ["Cacheu", "Canchungo"]),
    R("gabu", "Gab\u00fa", "Gab\u00fa", ["Gab\u00fa"]),
    R("oio", "Oio", "Oio", ["Farim"]),
    R("quinara", "Quinara", "Quinara", ["Buba"]),
    R("tombali", "Tombali", "Tombali", ["Cati\u00f3"]),
  ],
  LR: [
    R("montserrado", "Montserrado", "Montserrado", ["Monrovia", "Bensonville", "Paynesville"]),
    R("bomi", "Bomi", "Bomi", ["Tubmanburg"]),
    R("bong", "Bong", "Bong", ["Gbarnga"]),
    R("gbarpolu", "Gbarpolu", "Gbarpolu", ["Bopolu"]),
    R("grand_bassa", "Grand Bassa", "Grand Bassa", ["Buchanan"]),
    R("grand_cape_mount", "Grand Cape Mount", "Grand Cape Mount", ["Robertsport"]),
    R("grand_gedeh", "Grand Gedeh", "Grand Gedeh", ["Zwedru"]),
    R("grand_kru", "Grand Kru", "Grand Kru", ["Barclayville"]),
    R("lofa", "Lofa", "Lofa", ["Voinjama"]),
    R("margibi", "Margibi", "Margibi", ["Kakata"]),
    R("maryland", "Maryland", "Maryland", ["Harper"]),
    R("nimba", "Nimba", "Nimba", ["Sanniquellie", "Ganta"]),
    R("river_cess", "River Cess", "River Cess", ["Cestos City"]),
    R("river_gee", "River Gee", "River Gee", ["Fish Town"]),
    R("sinoe", "Sinoe", "Sinoe", ["Greenville"]),
  ],
  NG: [
    R("fct", "Federal Capital Territory (Abuja)", "Territoire de la capitale f\u00e9d\u00e9rale (Abuja)", ["Abuja"]),
    R("lagos", "Lagos", "Lagos", ["Ikeja", "Lagos", "Lekki", "Ikorodu", "Badagry", "Epe"]),
    R("abia", "Abia", "Abia", ["Umuahia", "Aba"]),
    R("adamawa", "Adamawa", "Adamawa", ["Yola", "Mubi"]),
    R("akwa_ibom", "Akwa Ibom", "Akwa Ibom", ["Uyo", "Eket"]),
    R("anambra", "Anambra", "Anambra", ["Awka", "Onitsha", "Nnewi"]),
    R("bauchi", "Bauchi", "Bauchi", ["Bauchi"]),
    R("bayelsa", "Bayelsa", "Bayelsa", ["Yenagoa"]),
    R("benue", "Benue", "Benue", ["Makurdi"]),
    R("borno", "Borno", "Borno", ["Maiduguri"]),
    R("cross_river", "Cross River", "Cross River", ["Calabar", "Ikom"]),
    R("delta", "Delta", "Delta", ["Asaba", "Warri"]),
    R("ebonyi", "Ebonyi", "Ebonyi", ["Abakaliki"]),
    R("edo", "Edo", "Edo", ["Benin City"]),
    R("ekiti", "Ekiti", "Ekiti", ["Ado-Ekiti"]),
    R("enugu", "Enugu", "Enugu", ["Enugu", "Nsukka"]),
    R("gombe", "Gombe", "Gombe", ["Gombe"]),
    R("imo", "Imo", "Imo", ["Owerri"]),
    R("jigawa", "Jigawa", "Jigawa", ["Dutse"]),
    R("kaduna", "Kaduna", "Kaduna", ["Kaduna", "Zaria"]),
    R("kano", "Kano", "Kano", ["Kano"]),
    R("katsina", "Katsina", "Katsina", ["Katsina"]),
    R("kebbi", "Kebbi", "Kebbi", ["Birnin Kebbi"]),
    R("kogi", "Kogi", "Kogi", ["Lokoja"]),
    R("kwara", "Kwara", "Kwara", ["Ilorin"]),
    R("nasarawa", "Nasarawa", "Nasarawa", ["Lafia"]),
    R("niger", "Niger", "Niger", ["Minna"]),
    R("ogun", "Ogun", "Ogun", ["Abeokuta", "Sagamu", "Ota"]),
    R("ondo", "Ondo", "Ondo", ["Akure"]),
    R("osun", "Osun", "Osun", ["Osogbo", "Ile-Ife"]),
    R("oyo", "Oyo", "Oyo", ["Ibadan", "Ogbomosho"]),
    R("plateau", "Plateau", "Plateau", ["Jos"]),
    R("rivers", "Rivers", "Rivers", ["Port Harcourt"]),
    R("sokoto", "Sokoto", "Sokoto", ["Sokoto"]),
    R("taraba", "Taraba", "Taraba", ["Jalingo"]),
    R("yobe", "Yobe", "Yobe", ["Damaturu"]),
    R("zamfara", "Zamfara", "Zamfara", ["Gusau"]),
  ],
  SN: [
    R("dakar", "Dakar", "Dakar", ["Dakar", "Pikine", "Gu\u00e9diawaye", "Rufisque"]),
    R("diourbel", "Diourbel", "Diourbel", ["Diourbel", "Touba", "Mback\u00e9"]),
    R("fatick", "Fatick", "Fatick", ["Fatick"]),
    R("kaffrine", "Kaffrine", "Kaffrine", ["Kaffrine"]),
    R("kaolack", "Kaolack", "Kaolack", ["Kaolack"]),
    R("kedougou", "K\u00e9dougou", "K\u00e9dougou", ["K\u00e9dougou"]),
    R("kolda", "Kolda", "Kolda", ["Kolda"]),
    R("louga", "Louga", "Louga", ["Louga"]),
    R("matam", "Matam", "Matam", ["Matam"]),
    R("saint_louis", "Saint-Louis", "Saint-Louis", ["Saint-Louis"]),
    R("sedhiou", "S\u00e9dhiou", "S\u00e9dhiou", ["S\u00e9dhiou"]),
    R("tambacounda", "Tambacounda", "Tambacounda", ["Tambacounda"]),
    R("thies", "Thi\u00e8s", "Thi\u00e8s", ["Thi\u00e8s", "Mbour", "Tivaouane"]),
    R("ziguinchor", "Ziguinchor", "Ziguinchor", ["Ziguinchor"]),
  ],
  SL: [
    R("western_area", "Western Area", "Zone Ouest", ["Freetown", "Waterloo"]),
    R("eastern", "Eastern", "Est", ["Kenema", "Koidu"]),
    R("northern", "Northern", "Nord", ["Makeni"]),
    R("north_west", "North West", "Nord-Ouest", ["Port Loko"]),
    R("southern", "Southern", "Sud", ["Bo"]),
  ],
  TG: [
    R("maritime", "Maritime", "Maritime", ["Lom\u00e9", "Ts\u00e9vi\u00e9", "An\u00e9ho"]),
    R("plateaux", "Plateaux", "Plateaux", ["Atakpam\u00e9", "Kpalim\u00e9"]),
    R("centrale", "Centrale", "Centrale", ["Sokod\u00e9"]),
    R("kara", "Kara", "Kara", ["Kara"]),
    R("savanes", "Savanes", "Savanes", ["Dapaong"]),
  ],
});

/** Neighbourhoods of the big Cameroon towns - suggestions only, anyone can type another one. */
export const NEIGHBOURHOODS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  "Yaound\u00e9": ["Bastos", "Biyem-Assi", "Briqueterie", "Ekounou", "Emana", "Essos", "Etoudi", "Mendong", "Mimboman", "Mvan", "Mvog-Mbi", "Nkolbisson", "Nlongkak", "Nsimeyong", "Obili", "Odza", "Omnisports"],
  "Douala": ["Akwa", "Bassa", "B\u00e9panda", "Bonab\u00e9ri", "Bonamoussadi", "Bonanjo", "Bonapriso", "De\u00efdo", "Kotto", "Logbaba", "Logpom", "Makepe", "Ndokoti", "New Bell", "PK 14"],
  "Bamenda": ["Azire", "Bambili", "Commercial Avenue", "Mankon", "Nkwen", "Old Town", "Up Station"],
  "Buea": ["Bonduma", "Checkpoint", "Clerks Quarter", "Great Soppo", "Malingo", "Mile 17", "Molyko", "Muea", "Sandpit", "UB Junction"],
  "Limbe": ["Bota", "Down Beach", "Limbe Town", "Mabeta", "Mile 1", "Mile 2"],
  "Kumba": ["Fiango", "Kumba Town", "Mbonge Road"],
  "Bafoussam": ["Banengo", "Djeleng", "Kamkop", "Ngouache", "Tamdja"],
  "Ngaound\u00e9r\u00e9": ["Centre", "Dang"],
  "Maroua": ["Domayo", "Dougoy", "Palar"],
  "Garoua": ["Centre", "Roumd\u00e9 Adjia", "Yelwa"],
  "Ebolowa": ["Centre", "Nkoemvone"],
});

export function hasRegions(code: unknown): boolean {
  return Object.prototype.hasOwnProperty.call(REGIONS_BY_COUNTRY, String(code || '').toUpperCase());
}

/** The regions of a country (Cameroon when none is given); [] when Bambeh has no list for it yet. */
export function regionsOf(code: unknown = HOME): readonly AfricaRegion[] {
  const k = String(code || HOME).toUpperCase();
  return hasRegions(k) ? REGIONS_BY_COUNTRY[k] : [];
}

function fold(s: unknown): string {
  let v = String(s == null ? '' : s);
  try { v = v.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch { /* old browser: compare as written */ }
  return v.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Finds a region by its key, English or French name, accents and dashes ignored ('Nord-Ouest' = 'North West'). */
export function findRegion(code: unknown, nameOrKey: unknown): AfricaRegion | null {
  const want = fold(nameOrKey);
  if (!want) return null;
  for (const r of regionsOf(code)) {
    if (fold(r.key) === want || fold(r.name) === want || fold(r.fr) === want) return r;
  }
  return null;
}

/** The region's name for the reader (the stored value stays r.name). */
export function regionLabel(r: AfricaRegion | null, lang: unknown = 'en'): string {
  if (!r) return '';
  const l = countryLang(lang);
  if (l === 'fr') return r.fr;
  if (l === 'ff') return r.ff || r.fr;
  if (l === 'ar') return r.ar || r.fr;
  return r.name;
}

/** The towns of one region, or of the whole country A to Z when no region is chosen. */
export function townsOf(code: unknown, region?: unknown): string[] {
  if (region) {
    const r = findRegion(code, region);
    return r ? r.towns.slice() : [];
  }
  const seen: Record<string, boolean> = {};
  const all: string[] = [];
  for (const r of regionsOf(code)) for (const t of r.towns) if (!seen[t]) { seen[t] = true; all.push(t); }
  return all.sort((a, b) => a.localeCompare(b, 'fr'));
}

/** The region a town belongs to (accents ignored): 'Kumba' -> South West. */
export function regionOfTown(code: unknown, town: unknown): AfricaRegion | null {
  const want = fold(town);
  if (!want) return null;
  for (const r of regionsOf(code)) for (const t of r.towns) if (fold(t) === want) return r;
  return null;
}

export function neighbourhoodsOf(town: unknown): readonly string[] {
  const want = fold(town);
  for (const k of Object.keys(NEIGHBOURHOODS)) if (fold(k) === want) return NEIGHBOURHOODS[k];
  return [];
}

/** "Mile 17" -> "mile_17": the short key a typed name is stored under. */
export function placeKey(label: unknown): string {
  const s = fold(label).replace(/ /g, '_').slice(0, 40).replace(/_+$/g, '');
  return s.length >= 2 ? s : '';
}
/** The town picked last on any free page ('' when none). Kept on the phone only. */
export const MY_TOWN_KEY = 'bambeh_my_town';

export function myTown(): string {
  try {
    const v = window.localStorage.getItem(MY_TOWN_KEY);
    return v && v.trim().length >= 2 && v.length <= 60 ? v.trim() : '';
  } catch {
    return ''; // private window or blocked storage: no town
  }
}

export function rememberMyTown(town: unknown): void {
  const v = String(town == null ? '' : town).trim();
  if (v.length < 2 || v.length > 60) return;
  try { window.localStorage.setItem(MY_TOWN_KEY, v); } catch { /* not kept - fine */ }
}

/** Towns grouped by region in the country's order; towns Bambeh cannot place go last (region null). */
export function groupTownsByRegion(code: unknown, towns: ReadonlyArray<{ town: string; region?: string | null }>):
    Array<{ region: AfricaRegion | null; towns: string[] }> {
  const groups: Array<{ region: AfricaRegion | null; towns: string[] }> = [];
  const seen: Record<string, boolean> = {};
  const other: string[] = [];
  const byKey: Record<string, string[]> = {};
  for (const row of towns) {
    const name = String(row && row.town ? row.town : '').trim();
    const k = fold(name);
    if (!k || seen[k]) continue;
    seen[k] = true;
    const r = (row.region ? findRegion(code, row.region) : null) || regionOfTown(code, name);
    if (r) (byKey[r.key] = byKey[r.key] || []).push(name); else other.push(name);
  }
  for (const r of regionsOf(code)) {
    if (byKey[r.key]) groups.push({ region: r, towns: byKey[r.key] });
  }
  if (other.length) groups.push({ region: null, towns: other });
  return groups;
}
// BAMBEH_END_TOKEN__AFRICA_PLACES_FIX769__COMPLETE

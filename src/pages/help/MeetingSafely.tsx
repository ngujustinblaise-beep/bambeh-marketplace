import { Link } from "react-router-dom";
import { Users, MapPin, Sun, UserCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";
const T: Record<Lang, Record<string,string>> = {
  en: { title:"Meeting Safely", subtitle:"Best practices for in-person transactions",
    locTitle:"Choose Safe Locations", loc1:"Shopping malls or busy markets", loc2:"Bank lobbies", loc3:"Coffee shops or restaurants", loc4:"Police stations (many offer safe exchange zones)", loc5:"Avoid private homes or isolated areas",
    dayTitle:"Meet During Daylight", dayBody:"Schedule meetings during daytime hours when areas are well-lit and busy with other people.",
    friendTitle:"Bring a Friend", friendBody:"Consider bringing someone with you, especially for high-value transactions.",
    tipLabel:"Tip:", tip:"Let someone know where you're going and when you expect to return.",
    checkTitle:"Safety Checklist", c1:"Chosen a public, well-lit location", c2:"Meeting during daylight hours", c3:"Told someone where I'm going", c4:"Bringing my phone (fully charged)", c5:"Trust my instincts",
    warnTitle:"Warning Signs", warn:"If the other person seems aggressive, suspicious, or makes you uncomfortable in any way, leave immediately and report to Bambeh.", back:"Back to Help Center" },
  fr: { title:"Se rencontrer en s\u00E9curit\u00E9", subtitle:"Bonnes pratiques pour les transactions en personne",
    locTitle:"Choisissez des lieux s\u00FBrs", loc1:"Centres commerciaux ou march\u00E9s anim\u00E9s", loc2:"Halls de banque", loc3:"Caf\u00E9s ou restaurants", loc4:"Commissariats (beaucoup offrent des zones d'\u00E9change s\u00E9curis\u00E9es)", loc5:"\u00C9vitez les domiciles priv\u00E9s ou les endroits isol\u00E9s",
    dayTitle:"Rencontrez-vous en journ\u00E9e", dayBody:"Planifiez les rencontres en journ\u00E9e, quand les lieux sont bien \u00E9clair\u00E9s et fr\u00E9quent\u00E9s.",
    friendTitle:"Venez accompagn\u00E9", friendBody:"Envisagez de venir avec quelqu'un, surtout pour les transactions de grande valeur.",
    tipLabel:"Astuce :", tip:"Pr\u00E9venez quelqu'un de l'endroit o\u00F9 vous allez et de l'heure de votre retour.",
    checkTitle:"Liste de s\u00E9curit\u00E9", c1:"Choisi un lieu public et bien \u00E9clair\u00E9", c2:"Rencontre en pleine journ\u00E9e", c3:"Pr\u00E9venu quelqu'un de l'endroit o\u00F9 je vais", c4:"J'apporte mon t\u00E9l\u00E9phone (bien charg\u00E9)", c5:"Je fais confiance \u00E0 mon instinct",
    warnTitle:"Signes d'alerte", warn:"Si l'autre personne semble agressive, suspecte ou vous met mal \u00E0 l'aise, partez imm\u00E9diatement et signalez-le \u00E0 Bambeh.", back:"Retour au centre d'aide" },
  pidgin: { title:"Meet Safe", subtitle:"Best way to do face-to-face deal",
    locTitle:"Choose Safe Place dem", loc1:"Shopping mall or market wey get plenty people", loc2:"Bank lobby", loc3:"Coffee shop or restaurant", loc4:"Police station (plenty get safe exchange place)", loc5:"No go private house or place wey lonely",
    dayTitle:"Meet for Daytime", dayBody:"Arrange meeting for daytime wen di place get light well and people dey.",
    friendTitle:"Carry Friend Come", friendBody:"Try carry person follow you, especially for deal wey cost plenty.",
    tipLabel:"Tip:", tip:"Tell person where you dey go and wetin time you go come back.",
    checkTitle:"Safety Checklist", c1:"I don choose public place wey get light", c2:"Meeting dey for daytime", c3:"I don tell person where I dey go", c4:"I carry my phone (e full charge)", c5:"I trust my mind",
    warnTitle:"Warning Sign dem", warn:"If di person dey aggressive, suspicious, or e make you feel somehow, comot sharp sharp and report to Bambeh.", back:"Go back to Help Center" },
  ar: { title:"\u0627\u0644\u0644\u0642\u0627\u0621 \u0628\u0623\u0645\u0627\u0646", subtitle:"\u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0644\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629",
    locTitle:"\u0627\u062E\u062A\u0631 \u0623\u0645\u0627\u0643\u0646 \u0622\u0645\u0646\u0629", loc1:"\u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0623\u0648 \u0627\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0645\u0632\u062F\u062D\u0645\u0629", loc2:"\u0628\u0647\u0648 \u0627\u0644\u0628\u0646\u0648\u0643", loc3:"\u0627\u0644\u0645\u0642\u0627\u0647\u064A \u0623\u0648 \u0627\u0644\u0645\u0637\u0627\u0639\u0645", loc4:"\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0634\u0631\u0637\u0629 (\u0643\u062B\u064A\u0631 \u0645\u0646\u0647\u0627 \u064A\u0648\u0641\u0631 \u0645\u0646\u0627\u0637\u0642 \u062A\u0628\u0627\u062F\u0644 \u0622\u0645\u0646\u0629)", loc5:"\u062A\u062C\u0646\u0651\u0628 \u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0627\u0644\u062E\u0627\u0635\u0629 \u0623\u0648 \u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0645\u0639\u0632\u0648\u0644\u0629",
    dayTitle:"\u0627\u0644\u062A\u0642\u0650 \u0646\u0647\u0627\u0631\u064B\u0627", dayBody:"\u062D\u062F\u0651\u062F \u0627\u0644\u0644\u0642\u0627\u0621\u0627\u062A \u0646\u0647\u0627\u0631\u064B\u0627 \u062D\u064A\u0646 \u062A\u0643\u0648\u0646 \u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0645\u0636\u0627\u0621\u0629 \u0648\u0645\u0632\u062F\u062D\u0645\u0629.",
    friendTitle:"\u0627\u0635\u0637\u062D\u0628 \u0635\u062F\u064A\u0642\u064B\u0627", friendBody:"\u0641\u0643\u0651\u0631 \u0641\u064A \u0627\u0635\u0637\u062D\u0627\u0628 \u0634\u062E\u0635 \u0645\u0639\u0643\u060C \u062E\u0627\u0635\u0629 \u0644\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0627\u0644\u0643\u0628\u064A\u0631\u0629.",
    tipLabel:"\u0646\u0635\u064A\u062D\u0629:", tip:"\u0623\u062E\u0628\u0631 \u0634\u062E\u0635\u064B\u0627 \u0628\u0648\u062C\u0647\u062A\u0643 \u0648\u0645\u0648\u0639\u062F \u0639\u0648\u062F\u062A\u0643 \u0627\u0644\u0645\u062A\u0648\u0642\u0639.",
    checkTitle:"\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0645\u0627\u0646", c1:"\u0627\u062E\u062A\u0631\u062A \u0645\u0643\u0627\u0646\u064B\u0627 \u0639\u0627\u0645\u064B\u0627 \u0645\u0636\u0627\u0621\u064B", c2:"\u0627\u0644\u0644\u0642\u0627\u0621 \u0646\u0647\u0627\u0631\u064B\u0627", c3:"\u0623\u062E\u0628\u0631\u062A \u0634\u062E\u0635\u064B\u0627 \u0628\u0648\u062C\u0647\u062A\u064A", c4:"\u0623\u062D\u0645\u0644 \u0647\u0627\u062A\u0641\u064A (\u0645\u0634\u062D\u0648\u0646 \u0628\u0627\u0644\u0643\u0627\u0645\u0644)", c5:"\u0623\u062B\u0642 \u0628\u062D\u062F\u0633\u064A",
    warnTitle:"\u0639\u0644\u0627\u0645\u0627\u062A \u062A\u062D\u0630\u064A\u0631", warn:"\u0625\u0630\u0627 \u0628\u062F\u0627 \u0627\u0644\u0634\u062E\u0635 \u0627\u0644\u0622\u062E\u0631 \u0639\u062F\u0648\u0627\u0646\u064A\u064B\u0627 \u0623\u0648 \u0645\u0631\u064A\u0628\u064B\u0627 \u0623\u0648 \u062C\u0639\u0644\u0643 \u062A\u0634\u0639\u0631 \u0628\u0639\u062F\u0645 \u0627\u0644\u0627\u0631\u062A\u064A\u0627\u062D\u060C \u063A\u0627\u062F\u0631 \u0641\u0648\u0631\u064B\u0627 \u0648\u0623\u0628\u0644\u063A Bambeh.", back:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0645\u0631\u0643\u0632 \u0627\u0644\u0645\u0633\u0627\u0639\u062F\u0629" },
  ff: { title:"Hawrugol e kisal", subtitle:"Mbaydiiji mo\u01B4\u01B4i ngam njulaaku \u0257o yeeso e yeeso",
    locTitle:"Su\u0253o nokkuuje hi\u0253\u0257u\u0257e", loc1:"Marseeji walla luumooji keewu\u0257i yim\u0253e", loc2:"Galleeji banke", loc3:"Defirde kafe walla restoraaji", loc4:"Galleeji polis (keew\u0257i ina nje\u0257a nokkuuje waylondiral hi\u0253\u0257e)", loc5:"Wata a yah galleeji keeri\u0257i walla nokkuuje wertii\u0257e",
    dayTitle:"Hawru \u00F1alooma", dayBody:"Hebbin hawrugol \u00F1alooma so nokku ina jalbi e keew\u0257i yim\u0253e.",
    friendTitle:"Addu giƴo", friendBody:"Miijo addude neɗɗo, teŋti noon e njulaaku tedduɗo.",
    tipLabel:"Waaju:", tip:"Humpit neɗɗo to njahataa e saanga mo paɗɗintaa ruttaade.",
    checkTitle:"Doftere kisal", c1:"Mi su\u0253ii nokkuure jaltunde jalbunde", c2:"Hawrugol ko \u00F1alooma", c3:"Mi humpii neɗɗo to njahatami", c4:"Mi addan telefoŋ am (timmu\u0257o tonngol)", c5:"Mi hoolii miijo am",
    warnTitle:"Maandeeji rentingol", warn:"So nee\u0257o oya na\u0257da \u0257o\u0257u, sikkitinii\u0257o, walla na waylanmaa \u0257e\u00F1e, yaltu law tawaa \u01B4eewto\u0257aa to Bambeh.", back:"Rutto to galle ballal" },
};

export default function MeetingSafely() {
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const tr = (k:string) => T[lang][k] || T.en[k] || k;
  const isRtl = lang === "ar";
  const checks = ["c1","c2","c3","c4","c5"];
  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">{tr("title")}</h1>
              <p className="text-blue-100">{tr("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />{tr("locTitle")}
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li>{"\u2713 "}{tr("loc1")}</li>
              <li>{"\u2713 "}{tr("loc2")}</li>
              <li>{"\u2713 "}{tr("loc3")}</li>
              <li>{"\u2713 "}{tr("loc4")}</li>
              <li>{"\u2717 "}{tr("loc5")}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sun className="w-6 h-6 text-yellow-600" />{tr("dayTitle")}
            </h2>
            <p className="text-gray-700">{tr("dayBody")}</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-green-600" />{tr("friendTitle")}
            </h2>
            <p className="text-gray-700 mb-4">{tr("friendBody")}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700"><strong>{tr("tipLabel")}</strong> {tr("tip")}</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tr("checkTitle")}</h2>
            <div className="space-y-2 text-gray-700">
              {checks.map(c => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>{tr(c)}</span>
                </label>
              ))}
            </div>
          </section>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">{"\u26A0\uFE0F "}{tr("warnTitle")}</h3>
            <p className="text-gray-700">{tr("warn")}</p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/help" className="text-teal-600 hover:text-teal-700 font-semibold">{"\u2190 "}{tr("back")}</Link>
        </div>
      </div>
    </div>
  );
}


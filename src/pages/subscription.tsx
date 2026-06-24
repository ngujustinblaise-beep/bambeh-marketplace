/**
 * subscription.tsx - Bambeh regular-user subscription plans (daily/weekly/monthly)
 * Mounted at /subscription via App.tsx. Payment via CamPay.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Star, Zap, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/lib/supabase";
import CamPayWidget from "@/components/payment/CamPayWidget";
import { useLanguage } from "@/App";

type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const UI: Record<Lang, Record<string,string>> = {
  en: { heading:"Subscribe to Bambeh", subhead:"Pay with MTN MoMo or Orange Money. Access unlocks immediately after payment.",
    back:"Back", backPlans:"Back to plans", whatYouGet:"What you get:", pay:"Pay with Mobile Money",
    popular:"MOST POPULAR", select:"Select", subscribe:"Subscribe", already:"Already Subscribed",
    alreadyMsg:"Your {plan} plan is active.", goMarket:"Go to Marketplace",
    unlocked:"Access Unlocked!", unlockedMsg:"Your {plan} is active. Redirecting...",
    secured:"Secured by CamPay - BAMBEH SARL - support@bambeh.com" },
  fr: { heading:"Abonnez-vous \u00E0 Bambeh", subhead:"Payez avec MTN MoMo ou Orange Money. L'acc\u00E8s s'active imm\u00E9diatement apr\u00E8s paiement.",
    back:"Retour", backPlans:"Retour aux forfaits", whatYouGet:"Ce que vous obtenez :", pay:"Payer avec Mobile Money",
    popular:"LE PLUS POPULAIRE", select:"Choisir", subscribe:"S'abonner", already:"D\u00E9j\u00E0 abonn\u00E9",
    alreadyMsg:"Votre forfait {plan} est actif.", goMarket:"Aller au march\u00E9",
    unlocked:"Acc\u00E8s d\u00E9bloqu\u00E9 !", unlockedMsg:"Votre forfait {plan} est actif. Redirection...",
    secured:"S\u00E9curis\u00E9 par CamPay - BAMBEH SARL - support@bambeh.com" },
  pidgin: { heading:"Subscribe to Bambeh", subhead:"Pay with MTN MoMo or Orange Money. Access go open sharp sharp afta payment.",
    back:"Go back", backPlans:"Go back to plan dem", whatYouGet:"Wetin you go get:", pay:"Pay with Mobile Money",
    popular:"PEOPLE LIKE AM PASS", select:"Choose", subscribe:"Subscribe", already:"You don Subscribe already",
    alreadyMsg:"Your {plan} plan dey active.", goMarket:"Go to Marketplace",
    unlocked:"Access don Open!", unlockedMsg:"Your {plan} dey active. We dey redirect you...",
    secured:"CamPay secure am - BAMBEH SARL - support@bambeh.com" },
  ar: { heading:"\u0627\u0634\u062A\u0631\u0643 \u0641\u064A Bambeh", subhead:"\u0627\u062F\u0641\u0639 \u0639\u0628\u0631 MTN MoMo \u0623\u0648 Orange Money. \u064A\u064F\u0641\u062A\u062D \u0627\u0644\u0648\u0635\u0648\u0644 \u0641\u0648\u0631\u064B\u0627 \u0628\u0639\u062F \u0627\u0644\u062F\u0641\u0639.",
    back:"\u0631\u062C\u0648\u0639", backPlans:"\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u062E\u0637\u0637", whatYouGet:"\u0645\u0627 \u062A\u062D\u0635\u0644 \u0639\u0644\u064A\u0647:", pay:"\u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0627\u0644\u0645\u062D\u0645\u0648\u0644\u0629",
    popular:"\u0627\u0644\u0623\u0643\u062B\u0631 \u0634\u0639\u0628\u064A\u0629", select:"\u0627\u062E\u062A\u0631", subscribe:"\u0627\u0634\u062A\u0631\u0643", already:"\u0645\u0634\u062A\u0631\u0643 \u0628\u0627\u0644\u0641\u0639\u0644",
    alreadyMsg:"\u062E\u0637\u062A\u0643 {plan} \u0646\u0634\u0637\u0629.", goMarket:"\u0627\u0644\u0630\u0647\u0627\u0628 \u0625\u0644\u0649 \u0627\u0644\u0633\u0648\u0642",
    unlocked:"\u062A\u0645 \u0641\u062A\u062D \u0627\u0644\u0648\u0635\u0648\u0644!", unlockedMsg:"\u062E\u0637\u062A\u0643 {plan} \u0646\u0634\u0637\u0629. \u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0648\u064A\u0644...",
    secured:"\u0645\u0624\u0645\u0651\u0646 \u0628\u0648\u0627\u0633\u0637\u0629 CamPay - BAMBEH SARL - support@bambeh.com" },
  ff: { heading:"Abonno e Bambeh", subhead:"Yo\u0253u e MTN MoMo walla Orange Money. Naatgol ina u\u0253\u0253itoo law caggal yo\u0253gol.",
    back:"Rutto", backPlans:"Rutto to peeje", whatYouGet:"Ko ke\u0253ataa:", pay:"Yo\u0253u e Mobile Money",
    popular:"KO \u0181URI LOLLUDE", select:"Su\u0253o", subscribe:"Abonno", already:"A abonniima",
    alreadyMsg:"Peeje maa {plan} ina golla.", goMarket:"Yah to luumo",
    unlocked:"Naatgol u\u0253\u0253itii!", unlockedMsg:"Peeje maa {plan} ina golla. Ina yiltee...",
    secured:"Reenaa\u0257o e CamPay - BAMBEH SARL - support@bambeh.com" },
};

const PLAN_TEXT: Record<string, Record<Lang,{name:string;duration:string;features:string[]}>> = {
  daily: {
    en:{ name:"Daily Pass", duration:"24 hours", features:["Full marketplace access","Contact any seller","Browse all listings","Basic support"] },
    fr:{ name:"Pass Journalier", duration:"24 heures", features:["Acc\u00E8s complet au march\u00E9","Contacter n'importe quel vendeur","Parcourir toutes les annonces","Support de base"] },
    pidgin:{ name:"Daily Pass", duration:"24 hours", features:["Full marketplace access","Contact any seller","Browse all listing dem","Basic support"] },
    ar:{ name:"\u0628\u0637\u0627\u0642\u0629 \u064A\u0648\u0645\u064A\u0629", duration:"24 \u0633\u0627\u0639\u0629", features:["\u0648\u0635\u0648\u0644 \u0643\u0627\u0645\u0644 \u0644\u0644\u0633\u0648\u0642","\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0623\u064A \u0628\u0627\u0626\u0639","\u062A\u0635\u0641\u0651\u062D \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A","\u062F\u0639\u0645 \u0623\u0633\u0627\u0633\u064A"] },
    ff:{ name:"Pass \u00F1alawma", duration:"waktuuji 24", features:["Naatgol timmu\u0257o e luumo","Jokkondiral e yeeyoowo kala","\u01B4eewde jeeyngeeji fof","Ballal jaalal"] },
  },
  weekly: {
    en:{ name:"Weekly Plan", duration:"7 days", features:["All Daily features","Unlimited seller contacts","Advanced search filters","Priority support","10% discount on services"] },
    fr:{ name:"Forfait Hebdomadaire", duration:"7 jours", features:["Toutes les fonctions Journali\u00E8res","Contacts vendeurs illimit\u00E9s","Filtres de recherche avanc\u00E9s","Support prioritaire","10% de r\u00E9duction sur les services"] },
    pidgin:{ name:"Weekly Plan", duration:"7 days", features:["All Daily feature dem","Contact seller dem without limit","Advanced search filter dem","Priority support","10% discount for service dem"] },
    ar:{ name:"\u062E\u0637\u0629 \u0623\u0633\u0628\u0648\u0639\u064A\u0629", duration:"7 \u0623\u064A\u0627\u0645", features:["\u0643\u0644 \u0645\u064A\u0632\u0627\u062A \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u064A\u0648\u0645\u064A\u0629","\u0627\u062A\u0635\u0627\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629 \u0628\u0627\u0644\u0628\u0627\u0626\u0639\u064A\u0646","\u0645\u0631\u0634\u0651\u062D\u0627\u062A \u0628\u062D\u062B \u0645\u062A\u0642\u062F\u0645\u0629","\u062F\u0639\u0645 \u0630\u0648 \u0623\u0648\u0644\u0648\u064A\u0629","\u062E\u0635\u0645 10% \u0639\u0644\u0649 \u0627\u0644\u062E\u062F\u0645\u0627\u062A"] },
    ff:{ name:"Peeje yon\u0257e", duration:"balde 7", features:["Golle \u00F1alawma fof","Jokkondiral yeeyoo\u0253e ngalaa keerol","Filtaaji \u01B4eewde to\u0253\u0257e","Ballal ardii\u0257o","Ustugol 10% e golle"] },
  },
  monthly: {
    en:{ name:"Monthly Plan", duration:"30 days", features:["All Weekly features","VIP support (24/7)","Featured listings","AI-powered matching","20% discount on all services","Ad-free experience","Early access to new features"] },
    fr:{ name:"Forfait Mensuel", duration:"30 jours", features:["Toutes les fonctions Hebdomadaires","Support VIP (24/7)","Annonces mises en avant","Correspondance par IA","20% de r\u00E9duction sur tous les services","Exp\u00E9rience sans publicit\u00E9","Acc\u00E8s anticip\u00E9 aux nouveaut\u00E9s"] },
    pidgin:{ name:"Monthly Plan", duration:"30 days", features:["All Weekly feature dem","VIP support (24/7)","Featured listing dem","AI matching","20% discount for all service dem","No ads","Early access to new feature dem"] },
    ar:{ name:"\u062E\u0637\u0629 \u0634\u0647\u0631\u064A\u0629", duration:"30 \u064A\u0648\u0645\u064B\u0627", features:["\u0643\u0644 \u0645\u064A\u0632\u0627\u062A \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629","\u062F\u0639\u0645 VIP (24/7)","\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0645\u0645\u064A\u0632\u0629","\u0645\u0637\u0627\u0628\u0642\u0629 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A","\u062E\u0635\u0645 20% \u0639\u0644\u0649 \u0643\u0644 \u0627\u0644\u062E\u062F\u0645\u0627\u062A","\u062A\u062C\u0631\u0628\u0629 \u0628\u0644\u0627 \u0625\u0639\u0644\u0627\u0646\u0627\u062A","\u0648\u0635\u0648\u0644 \u0645\u0628\u0643\u0631 \u0644\u0644\u0645\u064A\u0632\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629"] },
    ff:{ name:"Peeje lewru", duration:"balde 30", features:["Golle yon\u0257e fof","Ballal VIP (24/7)","Jeeyngeeji \u0253anginaa\u0257i","Hawrindiral AI","Ustugol 20% e golle fof","Kuugal ngal alaa jeeyngal","Naatgol law e golle hesere"] },
  },
};

const PLAN_META = [
  { id:"daily",   price:100,  durationMs:24*60*60*1000,      icon:<Star className="h-7 w-7 text-white" />,  gradient:"from-amber-500 to-amber-700" },
  { id:"weekly",  price:500,  durationMs:7*24*60*60*1000,    icon:<Zap className="h-7 w-7 text-white" />,   gradient:"from-teal-500 to-blue-600", popular:true },
  { id:"monthly", price:1500, durationMs:30*24*60*60*1000,   icon:<Crown className="h-7 w-7 text-white" />, gradient:"from-purple-600 to-indigo-700" },
];

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = (user as any)?.id ?? null;
  const { isActive, planType } = useSubscription(userId);
  const { language } = useLanguage();
  const lang: Lang = (["en","fr","pidgin","ar","ff"].includes(language) ? language : "en") as Lang;
  const u = (k:string) => UI[lang][k] || UI.en[k] || k;
  const isRtl = lang === "ar";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedMeta = PLAN_META.find(p => p.id === selectedId) || null;
  const planName = (id:string) => PLAN_TEXT[id][lang].name;

  async function handlePaymentSuccess(reference: string) {
    if (!selectedMeta || !userId) return;
    const expiresAt = new Date(Date.now() + selectedMeta.durationMs).toISOString();
    await supabase.from("subscriptions").upsert({
      user_id: userId, plan_type: selectedMeta.id, status: "active",
      expires_at: expiresAt, reference, activated_at: new Date().toISOString(),
    });
    await supabase.from("subscription_payments").insert({
      user_id: userId, plan_id: selectedMeta.id, amount_xaf: selectedMeta.price, reference, status: "paid",
    });
    localStorage.setItem("Bambeh_subscription", JSON.stringify({
      tier: selectedMeta.id, startDate: new Date().toISOString(), expiresAt, status: "active",
    }));
    setSuccess(true);
    setTimeout(() => navigate("/marketplace"), 2500);
  }

  if (isActive) {
    return (
      <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{u("already")}</h2>
          <p className="text-gray-600 mb-4">{u("alreadyMsg").replace("{plan}", String(planType || ""))}</p>
          <button onClick={() => navigate("/marketplace")} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700">{u("goMarket")}</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">{u("unlocked")}{" \uD83C\uDF89"}</h2>
          <p className="text-gray-600">{u("unlockedMsg").replace("{plan}", selectedMeta ? planName(selectedMeta.id) : "")}</p>
        </div>
      </div>
    );
  }

  if (selectedMeta) {
    const txt = PLAN_TEXT[selectedMeta.id][lang];
    return (
      <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50">
        <div className={`bg-gradient-to-r ${selectedMeta.gradient} text-white p-6`}>
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100 text-sm">
            <ArrowLeft className="h-5 w-5" /> {u("backPlans")}
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">{selectedMeta.icon}</div>
            <div>
              <h1 className="text-xl font-bold">{txt.name}</h1>
              <p className="text-sm opacity-80">{txt.duration} - {selectedMeta.price.toLocaleString()} XAF</p>
            </div>
          </div>
        </div>
        <div className="p-4 max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">{u("whatYouGet")}</h3>
            <ul className="space-y-2">
              {txt.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-4">{u("pay")}</h3>
            <CamPayWidget
              amount={selectedMeta.price}
              description={`Bambeh ${txt.name} - ${txt.duration}`}
              externalRef={`sub_${selectedMeta.id}_${userId}_${Date.now()}`}
              metadata={{ user_id: userId, plan_id: selectedMeta.id }}
              onSuccess={handlePaymentSuccess}
              buttonLabel={`${u("subscribe")} - ${selectedMeta.price.toLocaleString()} XAF`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl":"ltr"} className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-blue-700 text-white p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 opacity-80 hover:opacity-100 text-sm">
          <ArrowLeft className="h-5 w-5" /> {u("back")}
        </button>
        <h1 className="text-2xl font-bold">{u("heading")}</h1>
        <p className="text-sm opacity-80 mt-1">{u("subhead")}</p>
      </div>
      <div className="p-4 max-w-lg mx-auto space-y-4 pb-10">
        {PLAN_META.map(plan => {
          const txt = PLAN_TEXT[plan.id][lang];
          return (
            <div key={plan.id} className="bg-white rounded-xl shadow overflow-hidden">
              {plan.popular && (
                <div className="bg-teal-600 text-white text-xs font-bold text-center py-1.5 tracking-wide">{"\u2726 "}{u("popular")}</div>
              )}
              <div className={`bg-gradient-to-r ${plan.gradient} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {plan.icon}
                  <div>
                    <h3 className="text-white font-bold text-lg">{txt.name}</h3>
                    <p className="text-white/75 text-sm">{txt.duration}</p>
                  </div>
                </div>
                <div className="text-white text-right">
                  <span className="text-2xl font-bold">{plan.price.toLocaleString()}</span>
                  <span className="text-sm ml-1">XAF</span>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-1.5 mb-4">
                  {txt.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { if (!user) { navigate("/login"); return; } setSelectedId(plan.id); }}
                  className={`w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 transition-opacity`}
                >
                  {u("select")} - {plan.price.toLocaleString()} XAF
                </button>
              </div>
            </div>
          );
        })}
        <p className="text-xs text-gray-400 text-center">{u("secured")}</p>
      </div>
    </div>
  );
};

export default Subscription;
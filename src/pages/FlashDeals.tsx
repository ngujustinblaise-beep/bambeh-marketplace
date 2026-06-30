/**
 * src/pages/FlashDeals.tsx
 * Bambeh Marketplace ? Flash Deals page
 *
 * Features:
 * ? Notify Me banner at top
 * ? Deal cards with countdown timer, Add to Cart, WhatsApp Chat
 * ? CamPay Mobile Money payment modal
 * ? Become a Vendor CTA at bottom
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang, t } from "@/hooks/useAppLang";

interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  currency: string;
  vendor: string;
  vendorPhone: string;
  stockTotal: number;
  stockLeft: number;
  endsAt: Date;
  category: string;
}

const COPY = {
  en: {
    flashDeals: 'Flash Deals',
    limitedTimeLimitedStock: 'Limited time ? Limited stock',
    cart: 'Cart',
    notifyMeNewDeals: 'Notify me of new deals',
    notifyMeSubtitle: 'Be the first to know when new flash deals drop',
    on: 'On',
    notifyMe: 'Notify Me',
    activeDeals: 'active deals',
    upTo: 'Up to',
    offToday: 'off today',
    buyNow: 'Buy Now',
    whatsapp: 'WhatsApp',
    addedToCart: 'Added to Cart',
    addToCart: 'Add to Cart',
    by: 'by',
    endsIn: 'Ends in:',
    stock: 'Stock',
    youPay: 'You pay',
    payWithMobileMoney: 'Pay with Mobile Money',
    enterValidPhone: 'Enter a valid phone number',
    mtmNumber: 'MTN Number',
    orangeNumber: 'Orange Number',
    pay: 'Pay',
    processingPayment: 'Processing payment...',
    checkPhone: 'Check your phone for the payment prompt',
    paymentSuccessful: 'Payment Successful!',
    youBought: 'You bought:',
    vendorContactSoon: 'The vendor will contact you shortly.',
    done: 'Done',
    becomeVendor: 'Become a Flash Deal Vendor',
    vendorPitch:
      'Reach thousands of buyers instantly. List your products as flash deals and boost sales today.',
    freeToList: 'Free to list for verified vendors',
    reachBuyers: 'Reach 10,000+ active buyers',
    paymentsMethods: 'Payments via MTN & Orange Money',
    support24h: '24-hour deal support',
    registerVendor: 'Register as a Vendor',
    savings: 'Savings:',
    expired: 'Expired',
    soldOut: 'Sold out',
    left: 'left',
    dealExpired: 'Offer expired',
    claimDeal: 'Claim',
    search: 'Search',
  },
  fr: {
    flashDeals: 'Ventes éclair',
    limitedTimeLimitedStock: 'Temps limité ? stock limité',
    cart: 'Panier',
    notifyMeNewDeals: 'M’avertir des nouvelles offres',
    notifyMeSubtitle: 'Soyez le premier informé dès qu’une nouvelle vente éclair est publiée',
    on: 'Activé',
    notifyMe: 'M’avertir',
    activeDeals: 'offres actives',
    upTo: 'Jusqu’à',
    offToday: 'de réduction aujourd’hui',
    buyNow: 'Acheter maintenant',
    whatsapp: 'WhatsApp',
    addedToCart: 'Ajouté au panier',
    addToCart: 'Ajouter au panier',
    by: 'par',
    endsIn: 'Se termine dans :',
    stock: 'Stock',
    youPay: 'Vous payez',
    payWithMobileMoney: 'Payer avec Mobile Money',
    enterValidPhone: 'Veuillez saisir un numéro de téléphone valide',
    mtmNumber: 'Numéro MTN',
    orangeNumber: 'Numéro Orange',
    pay: 'Payer',
    processingPayment: 'Paiement en cours...',
    checkPhone: 'Vérifiez votre téléphone pour la demande de paiement',
    paymentSuccessful: 'Paiement réussi !',
    youBought: 'Vous avez acheté :',
    vendorContactSoon: 'Le vendeur vous contactera sous peu.',
    done: 'Terminé',
    becomeVendor: 'Devenir vendeur de ventes éclair',
    vendorPitch:
      'Touchez instantanément des milliers d’acheteurs. Publiez vos produits en ventes éclair et augmentez vos ventes dès aujourd’hui.',
    freeToList: 'Publication gratuite pour les vendeurs vérifiés',
    reachBuyers: 'Touchez plus de 10 000 acheteurs actifs',
    paymentsMethods: 'Paiements via MTN et Orange Money',
    support24h: 'Assistance 24 h sur 24',
    registerVendor: 'S’inscrire comme vendeur',
    savings: 'Économie :',
    expired: 'Expirée',
    soldOut: 'Épuisé',
    left: 'restant(s)',
    dealExpired: 'Offre expirée',
    claimDeal: 'Réclamer',
    search: 'Rechercher',
  },
  ar: {
    flashDeals: 'عروض سريعة',
    limitedTimeLimitedStock: 'وقت محدود ? مخزون محدود',
    cart: 'السلة',
    notifyMeNewDeals: 'أعلمني بالعروض الجديدة',
    notifyMeSubtitle: 'كن أول من يعرف عند نزول العروض السريعة الجديدة',
    on: 'مفعل',
    notifyMe: 'أعلمني',
    activeDeals: 'العروض النشطة',
    upTo: 'حتى',
    offToday: 'خصم اليوم',
    buyNow: 'اشترِ الآن',
    whatsapp: 'واتساب',
    addedToCart: 'تمت الإضافة إلى السلة',
    addToCart: 'أضف إلى السلة',
    by: 'بواسطة',
    endsIn: 'ينتهي خلال:',
    stock: 'المخزون',
    youPay: 'تدفع',
    payWithMobileMoney: 'الدفع عبر Mobile Money',
    enterValidPhone: 'أدخل رقم هاتف صالحًا',
    mtmNumber: 'رقم MTN',
    orangeNumber: 'رقم Orange',
    pay: 'ادفع',
    processingPayment: 'جارٍ معالجة الدفع...',
    checkPhone: 'تحقق من هاتفك لرؤية طلب الدفع',
    paymentSuccessful: 'تم الدفع بنجاح!',
    youBought: 'اشتريت:',
    vendorContactSoon: 'سيتواصل معك البائع قريبًا.',
    done: 'تم',
    becomeVendor: 'أصبح بائع عروض سريعة',
    vendorPitch:
      'صل إلى آلاف المشترين فورًا. أدرج منتجاتك كعروض سريعة وارفَع مبيعاتك اليوم.',
    freeToList: 'الإدراج مجاني للبائعين الموثقين',
    reachBuyers: 'الوصول إلى أكثر من 10,000 مشترٍ نشط',
    paymentsMethods: 'الدفع عبر MTN و Orange Money',
    support24h: 'دعم على مدار 24 ساعة',
    registerVendor: 'التسجيل كبائع',
    savings: 'التوفير:',
    expired: 'منتهية',
    soldOut: 'نفدت',
    left: 'متبقي',
    dealExpired: 'انتهى العرض',
    claimDeal: 'المطالبة',
    search: 'بحث',
  },
  pidgin: {
    flashDeals: 'Flash Deals',
    limitedTimeLimitedStock: 'Time no long ? stock no plenty',
    cart: 'Cart',
    notifyMeNewDeals: 'Tell me when new deals land',
    notifyMeSubtitle: 'Be the first person to know when new flash deals show',
    on: 'On',
    notifyMe: 'Notify me',
    activeDeals: 'active deals',
    upTo: 'Up to',
    offToday: 'off today',
    buyNow: 'Buy now',
    whatsapp: 'WhatsApp',
    addedToCart: 'Added to cart',
    addToCart: 'Add to cart',
    by: 'by',
    endsIn: 'Ends in:',
    stock: 'Stock',
    youPay: 'You go pay',
    payWithMobileMoney: 'Pay with Mobile Money',
    enterValidPhone: 'Enter correct phone number',
    mtmNumber: 'MTN Number',
    orangeNumber: 'Orange Number',
    pay: 'Pay',
    processingPayment: 'Dey process payment...',
    checkPhone: 'Check your phone for payment prompt',
    paymentSuccessful: 'Payment don go well!',
    youBought: 'You buy:',
    vendorContactSoon: 'Vendor go contact you soon.',
    done: 'Done',
    becomeVendor: 'Become Flash Deal Vendor',
    vendorPitch:
      'Reach plenty buyers quick-quick. List your items as flash deals and push sales today.',
    freeToList: 'Free to list for verified vendors',
    reachBuyers: 'Reach 10,000+ active buyers',
    paymentsMethods: 'Payments via MTN & Orange Money',
    support24h: '24-hour deal support',
    registerVendor: 'Register as vendor',
    savings: 'Money wey you save:',
    expired: 'Don expire',
    soldOut: 'Finish',
    left: 'left',
    dealExpired: 'Offer don expire',
    claimDeal: 'Claim',
    search: 'Search',
  },
  ful: {
    flashDeals: 'Burtal heɓugol',
    limitedTimeLimitedStock: 'Mbooya ngoo ? stoock ndee no haɗi',
    cart: 'Saaɓi',
    notifyMeNewDeals: 'Hollu mi soo waawi heɓde ofaaɗe kesɗe',
    notifyMeSubtitle: 'A woodi adan wonde hoore ɓuri soo ofaɗe kesɗe naataki',
    on: 'On',
    notifyMe: 'Hollu mi',
    activeDeals: 'ofaaɗe ɓurɗe',
    upTo: 'Haa',
    offToday: 'heɓugol woni jooni',
    buyNow: 'Ɓuri naaɗi',
    whatsapp: 'WhatsApp',
    addedToCart: 'Ɓeyditaaɗo e saaɓi',
    addToCart: 'Ɓeydu e saaɓi',
    by: 'e',
    endsIn: 'Woɗa e:',
    stock: 'Stoock',
    youPay: 'A ndee fey',
    payWithMobileMoney: 'Fey e Mobile Money',
    enterValidPhone: 'Naatnu ndee numɓor telefoŋo dowol',
    mtmNumber: 'Numɓor MTN',
    orangeNumber: 'Numɓor Orange',
    pay: 'Fey',
    processingPayment: 'Dey ndenndude feyde...',
    checkPhone: 'Ƴeewto telefoŋoo maa ngam ko feyde',
    paymentSuccessful: 'Feyde woodi!',
    youBought: 'A suɓii:',
    vendorContactSoon: 'Seller o jeyaa wonde a heɓi.',
    done: 'Jooni',
    becomeVendor: 'Woorno seller ofaaɗe',
    vendorPitch:
      'Heɓu yimɓe ɗuuɓi jooni. Naatnu moodi maa no ofaaɗe burtal e ɓeydude cuɓoraaɗe.',
    freeToList: 'Ko ɗum free ngam sellerɓe ɓe laaɓii',
    reachBuyers: 'Heɓu 10,000+ yimɓe ɓurɗe ɗaaɓi',
    paymentsMethods: 'Feyde e MTN e Orange Money',
    support24h: 'Ballal 24h',
    registerVendor: 'Naatnu ngalam seller',
    savings: 'Jafinaande:',
    expired: 'Woɗii',
    soldOut: 'No ɓurti',
    left: 'heddii',
    dealExpired: 'Ofa oo woɗii',
    claimDeal: 'Ɗaɓɓito',
    search: 'Yiylo',
  },
};

interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  originalPrice: number;
  dealPrice: number;
  currency: string;
  vendor: string;
  vendorPhone: string;
  stockTotal: number;
  stockLeft: number;
  endsAt: Date;
  category: string;
}

const DEMO_DEALS: Deal[] = [
  {
    id: "1",
    title: "iPhone 15 Pro ? Open Box 128GB",
    description: "Barely used, Space Grey. Original accessories included. Battery 98%. No scratches.",
    image: "??",
    originalPrice: 750000,
    dealPrice: 480000,
    currency: "XAF",
    vendor: "TechZone ",
    vendorPhone: "+237670000001",
    stockTotal: 3,
    stockLeft: 2,
    endsAt: new Date(Date.now() + 12 * 3600 * 1000),
    category: "Electronics",
  },
  {
    id: "2",
    title: "Samsung 65\" 4K Smart TV",
    description: "Brand new sealed box. 2-year  warranty. HDMI x3, WiFi, Bluetooth.",
    image: "??",
    originalPrice: 450000,
    dealPrice: 280000,
    currency: "XAF",
    vendor: "ElectroCam Douala",
    vendorPhone: "+237680000002",
    stockTotal: 5,
    stockLeft: 4,
    endsAt: new Date(Date.now() + 24 * 3600 * 1000),
    category: "Electronics",
  },
  {
    id: "3",
    title: "Nike Air Max 270 ? Size 42",
    description: "100% original imported from France. Comes with box and receipt.",
    image: "??",
    originalPrice: 95000,
    dealPrice: 55000,
    currency: "XAF",
    vendor: "SneakerHub CM",
    vendorPhone: "+237690000003",
    stockTotal: 8,
    stockLeft: 3,
    endsAt: new Date(Date.now() + 6 * 3600 * 1000),
    category: "Fashion",
  },
  {
    id: "4",
    title: "HP Laptop 15\" ? i5 12th Gen",
    description: "New, 16GB RAM, 512GB SSD, Windows 11 Pro. Full warranty from HP .",
    image: "??",
    originalPrice: 380000,
    dealPrice: 250000,
    currency: "XAF",
    vendor: "ComputerWorld Douala",
    vendorPhone: "+237670000004",
    stockTotal: 4,
    stockLeft: 2,
    endsAt: new Date(Date.now() + 48 * 3600 * 1000),
    category: "Electronics",
  },
];

function fmtXAF(n: number) {
  return n.toLocaleString("fr-CM") + " XAF";
}

function discount(orig: number, deal: number) {
  return Math.round((1 - deal / orig) * 100);
}

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const timer = setInterval(() => setRemaining(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(timer);
  }, [target]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return { h, m, s, expired: remaining === 0 };
}

function Countdown({ endsAt }: { endsAt: Date }) {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const { h, m, s, expired } = useCountdown(endsAt);
  if (expired) return <span className="text-red-500 font-bold text-xs">{ui.expired}</span>;
  return (
    <div className="flex items-center gap-1">
      {[
        { v: h, l: "h" }, { v: m, l: "m" }, { v: s, l: "s" },
      ].map(({ v, l }) => (
        <div key={l} className="flex items-center gap-0.5">
          <span className="bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[24px] text-center">
            {String(v).padStart(2, "0")}
          </span>
          <span className="text-gray-400 text-[10px]">{l}</span>
        </div>
      ))}
    </div>
  );
}

function PaymentModal({ deal, onClose }: { deal: Deal; onClose: () => void }) {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"mtn" | "orange">("mtn");
  const [step, setStep] = useState<"form" | "processing" | "done">("form");
  const [error, setError] = useState("");

  async function pay() {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      setError(ui.enterValidPhone); return;
    }
    setError(""); setStep("processing");
    await new Promise(r => setTimeout(r, 2000));
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">{ui.payWithMobileMoney}</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{deal.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">?</button>
        </div>

        <div className="p-5">
          {step === "form" && (
            <>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 mb-4 text-center">
                <p className="text-xs text-teal-600 mb-1">{ui.youPay}</p>
                <p className="text-2xl font-bold text-teal-700 dark:text-teal-300">{fmtXAF(deal.dealPrice)}</p>
                <p className="text-xs text-gray-400 line-through mt-0.5">{fmtXAF(deal.originalPrice)}</p>
              </div>

              <div className="flex gap-3 mb-4">
                {([["mtn", "MTN MoMo ??"], ["orange", "Orange Money ??"]] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setMethod(k)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all
                                ${method === k ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700" :
                                  "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {method === "mtn" ? ui.mtmNumber : ui.orangeNumber}
                </label>
                <div className="flex">
                  <span className="border-2 border-r-0 border-gray-200 dark:border-gray-600 rounded-l-xl px-3 py-3 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600">???? +237</span>
                  <input type="tel"
                    className={`flex-1 border-2 rounded-r-xl px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none
                                ${error ? "border-red-400" : "border-gray-200 dark:border-gray-600 focus:border-teal-500"}`}
                    placeholder="6XX XXX XXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))} />
                </div>
                {error && <p className="text-xs text-red-500 mt-1">? {error}</p>}
              </div>

              <button onClick={pay}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/30 text-base">
                ?? {ui.pay} {fmtXAF(deal.dealPrice)}
              </button>
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
              <p className="font-semibold text-gray-900 dark:text-white">{ui.processingPayment}</p>
              <p className="text-sm text-gray-500 mt-1">{ui.checkPhone}</p>
            </div>
          )}

          {step === "done" && (
            <div className="text-center py-6">
              <p className="text-6xl mb-3">??</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ui.paymentSuccessful}</h3>
              <p className="text-sm text-gray-500 mb-1">{ui.youBought} <strong>{deal.title}</strong></p>
              <p className="text-sm text-gray-500 mb-6">{ui.vendorContactSoon}</p>
              <button onClick={onClose}
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold">
                {ui.done}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const [notified, setNotified] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const pct = discount(deal.originalPrice, deal.dealPrice);
  const urgency = deal.stockLeft <= 2;

  function whatsapp() {
    const msg = encodeURIComponent(
      `Hi! I saw your flash deal on Bambeh: "${deal.title}" for ${fmtXAF(deal.dealPrice)}. Is it still available?`
    );
    window.open(`https://wa.me/${deal.vendorPhone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="relative bg-gradient-to-br from-teal-50 to-gray-50 dark:from-gray-700 dark:to-gray-800 h-36 flex items-center justify-center">
          <span className="text-7xl">{deal.image}</span>
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{pct}%
          </div>
          {urgency && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              ?? {deal.stockLeft} {ui.left}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug mb-1">{deal.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">{deal.description}</p>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{fmtXAF(deal.dealPrice)}</span>
            <span className="text-xs text-gray-400 line-through">{fmtXAF(deal.originalPrice)}</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-gray-400 mb-1">{ui.endsIn}</p>
              <Countdown endsAt={deal.endsAt} />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">{ui.stock}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all"
                       style={{ width: `${(deal.stockLeft / deal.stockTotal) * 100}%` }}/>
                </div>
                <span className="text-[10px] text-gray-500">{deal.stockLeft}/{deal.stockTotal}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <button onClick={() => setShowPay(true)}
              className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-teal-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-teal-500/20 active:scale-[0.98]">
              ?? {ui.buyNow}
            </button>
            <button onClick={whatsapp}
              className="flex-1 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl active:scale-[0.98]">
              ?? {ui.whatsapp}
            </button>
          </div>

          <button
            onClick={() => setInCart(v => !v)}
            className={`w-full py-2 rounded-xl text-xs font-semibold border-2 transition-all active:scale-[0.98]
                        ${inCart ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" :
                          "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
            {inCart ? `? ${ui.addedToCart}` : `+ ${ui.addToCart}`}
          </button>

          <p className="text-[10px] text-gray-400 text-center mt-2">{ui.by} {deal.vendor}</p>
        </div>
      </div>

      {showPay && <PaymentModal deal={deal} onClose={() => setShowPay(false)} />}
    </>
  );
}

export default function FlashDeals() {
  const lang = useLang();
  const ui = COPY[lang] ?? COPY[lang === 'ff' ? 'ful' : lang] ?? COPY.en;
  const navigate = useNavigate();
  const [notifyAll, setNotifyAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(DEMO_DEALS.map(d => d.category)))];
  const filtered = activeCategory === "All" ? DEMO_DEALS : DEMO_DEALS.filter(d => d.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-4 pt-5 pb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-white font-bold text-2xl">? {ui.flashDeals}</h1>
            <p className="text-orange-100 text-sm mt-0.5">{ui.limitedTimeLimitedStock}</p>
          </div>
          <Link to="/cart"
            className="bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1">
            ?? {ui.cart}
          </Link>
        </div>

        <div className={`mt-4 rounded-2xl p-4 flex items-center justify-between transition-all
                         ${notifyAll ? "bg-white/20" : "bg-white/10 border border-white/30"}`}>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">?? {ui.notifyMeNewDeals}</p>
            <p className="text-orange-100 text-xs mt-0.5">{ui.notifyMeSubtitle}</p>
          </div>
          <button
            onClick={() => setNotifyAll(v => !v)}
            className={`ml-3 flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95
                        ${notifyAll ? "bg-white text-orange-600" : "bg-orange-600 text-white border border-white/50"}`}>
            {notifyAll ? `? ${ui.on}` : ui.notifyMe}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                          ${activeCategory === c ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <span>? <strong className="text-gray-900 dark:text-white">{filtered.length}</strong> {ui.activeDeals}</span>
        <span>?? {ui.upTo} <strong className="text-red-500">36% {ui.offToday}</strong></span>
      </div>

      <div className="px-4 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(deal => <DealCard key={deal.id} deal={deal} />)}
      </div>

      <div className="mx-4 mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
        <p className="text-2xl mb-2">??</p>
        <h2 className="font-bold text-lg mb-1">{ui.becomeVendor}</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          {ui.vendorPitch}
        </p>
        <div className="space-y-2 mb-4">
          {[ui.freeToList, ui.reachBuyers, ui.paymentsMethods, ui.support24h].map(b => (
            <div key={b} className="flex items-center gap-2 text-sm">
              <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {b}
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate("/vendor/register")}
          className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl active:scale-[0.98] transition-transform">
          {ui.registerVendor} ?
        </button>
      </div>
    </div>
  );
}
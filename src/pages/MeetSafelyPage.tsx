/**
 * src/pages/MeetSafelyPage.tsx ? Bambeh Marketplace
 * FIXED: Was a stub (emoji + title). Now a full safety guide.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, MapPin, Users, Phone, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { useLang, t } from "@/hooks/useAppLang";

const COPY = {
  en: {
    back: 'Back',
    title: 'Meet Safely',
    subtitle: 'Stay safe when buying & selling in person',
    quickSafetyChecklist: 'Quick Safety Checklist',
    meetPublicPlace: 'Meet in a public, well-lit place',
    tellSomeone: 'Tell someone where you are going',
    testItem: 'Test the item before paying',
    verifyPayment: 'Count money / verify mobile payment',
    trustInstincts: 'Trust your instincts ? if something feels wrong, leave',
    meetInPublicPlace: 'Meet in a Public Place',
    chooseBusyLocations: 'Choose busy locations: supermarkets, shopping centres, banks',
    avoidIsolatedAreas: 'Avoid isolated areas, parking lots, or your home address',
    popularSpots: 'Popular spots in : March? Central, shopping malls, hotel lobbies',
    daytimeMeeting: 'Meet during daytime hours whenever possible',
    bringSomeoneTrusted: 'Bring Someone You Trust',
    tellWhereGoing: 'Always tell someone where you are going and who you are meeting',
    bringFriendFamily: 'For high-value items, bring a friend or family member',
    shareSellerContact: "Share the seller's contact details with someone you trust",
    checkInAfter: 'Check in with someone after the transaction is complete',
    verifyItemBeforePaying: 'Verify the Item Before Paying',
    testElectronics: 'Test electronics ? power them on, check all functions',
    inspectDamage: 'Inspect items carefully for damage not shown in photos',
    vehiclesCheck: 'For vehicles, check the engine, tyres, and all documents',
    doNotPay: 'Do NOT pay until you are satisfied with the item',
    paySafely: 'Pay Safely',
    countCash: 'Count cash before handing it over',
    preferMobileMoney: 'Prefer mobile money (MTN MoMo / Orange Money) for a trail',
    useEscrow: 'Use Bambeh Escrow for expensive purchases ? funds held until delivery confirmed',
    neverWire: 'Never wire transfer to unknown bank accounts',
    redFlags: 'Red Flags ? Walk Away If...',
    flag1: '?? Seller asks you to pay before meeting or seeing the item',
    flag2: '?? Price is unbelievably low ? "too good to be true"',
    flag3: '?? Seller refuses to meet in a public place',
    flag4: '?? Seller pressures you to decide quickly',
    flag5: '?? Seller sends someone else in their place unexpectedly',
    recommendedSpots: 'Recommended Meeting Spots',
    useEscrow: 'For Expensive Items ? Use Escrow',
    escrowBody: 'Bambeh Escrow holds your payment securely until you confirm you received the item. No risk to buyer or seller.',
    learnEscrow: 'Learn About Escrow ?',
    encounteredProblem: 'Encountered a Problem?',
    reportBody: 'If you experienced fraud, violence, or a scam, report it immediately.',
    reportIncident: 'Report an Incident',
  },
  fr: {
    back: 'Retour',
    title: 'Rencontre en toute sécurité',
    subtitle: 'Restez en sécurité lors des achats et ventes en personne',
    quickSafetyChecklist: 'Liste de vérification rapide',
    meetPublicPlace: 'Rencontrez-vous dans un lieu public et bien éclairé',
    tellSomeone: 'Prévenez quelqu’un de votre destination',
    testItem: "Testez l’article avant de payer",
    verifyPayment: 'Comptez l’argent / vérifiez le paiement mobile',
    trustInstincts: 'Faites confiance à votre instinct ? si quelque chose vous paraît suspect, partez',
    meetInPublicPlace: 'Se rencontrer dans un lieu public',
    chooseBusyLocations: 'Privilégiez les lieux fréquentés : supermarchés, centres commerciaux, banques',
    avoidIsolatedAreas: 'Évitez les zones isolées, les parkings ou votre domicile',
    popularSpots: 'Lieux appréciés : March? Central, centres commerciaux, halls d’hôtel',
    daytimeMeeting: 'Privilégiez les rencontres en journée quand c’est possible',
    bringSomeoneTrusted: 'Venez avec une personne de confiance',
    tellWhereGoing: 'Informez toujours quelqu’un de votre déplacement et de la personne rencontrée',
    bringFriendFamily: 'Pour les articles de forte valeur, venez avec un ami ou un membre de la famille',
    shareSellerContact: 'Partagez les coordonnées du vendeur avec une personne de confiance',
    checkInAfter: 'Donnez des nouvelles à quelqu’un une fois la transaction terminée',
    verifyItemBeforePaying: 'Vérifiez l’article avant de payer',
    testElectronics: 'Testez les appareils électroniques ? allumez-les, vérifiez toutes les fonctions',
    inspectDamage: 'Examinez soigneusement les articles pour repérer les dommages non visibles sur les photos',
    vehiclesCheck: 'Pour les véhicules, vérifiez le moteur, les pneus et tous les documents',
    doNotPay: 'Ne payez PAS tant que l’article ne vous satisfait pas pleinement',
    paySafely: 'Payez en toute sécurité',
    countCash: 'Comptez l’argent avant de le remettre',
    preferMobileMoney: 'Préférez le mobile money (MTN MoMo / Orange Money) pour conserver une trace',
    useEscrow: 'Utilisez Bambeh Escrow pour les achats coûteux ? les fonds sont conservés jusqu’à confirmation de la livraison',
    neverWire: "N’effectuez jamais de virement vers un compte bancaire inconnu",
    redFlags: 'Signaux d’alerte ? Partez si...',
    flag1: '?? Le vendeur vous demande de payer avant la rencontre ou avant de voir l’article',
    flag2: '?? Le prix est incroyablement bas ? « trop beau pour être vrai »',
    flag3: '?? Le vendeur refuse de se rencontrer dans un lieu public',
    flag4: '?? Le vendeur vous pousse à décider très vite',
    flag5: '?? Le vendeur envoie quelqu’un d’autre à sa place sans prévenir',
    recommendedSpots: 'Lieux de rencontre recommandés',
    useEscrow: 'Pour les articles coûteux ? utilisez le séquestre',
    escrowBody: 'Bambeh Escrow conserve votre paiement en sécurité jusqu’à ce que vous confirmiez la réception de l’article. Aucun risque pour l’acheteur ni pour le vendeur.',
    learnEscrow: 'En savoir plus sur le séquestre ?',
    encounteredProblem: 'Vous avez rencontré un problème ?',
    reportBody: 'Si vous avez subi une fraude, des violences ou une arnaque, signalez-le immédiatement.',
    reportIncident: 'Signaler un incident',
  },
  ar: {
    back: 'رجوع',
    title: 'التقِ بأمان',
    subtitle: 'ابقَ آمنًا عند الشراء والبيع وجهًا لوجه',
    quickSafetyChecklist: 'قائمة سريعة للسلامة',
    meetPublicPlace: 'التقِ في مكان عام ومضاء جيدًا',
    tellSomeone: 'أخبر شخصًا إلى أين تذهب',
    testItem: 'اختبر السلعة قبل الدفع',
    verifyPayment: 'عدّ المال / تحقّق من الدفع عبر الهاتف',
    trustInstincts: 'ثق بحدسك ? إذا شعرت أن هناك شيئًا غير صحيح، غادر',
    meetInPublicPlace: 'الالتقاء في مكان عام',
    chooseBusyLocations: 'اختر أماكن مزدحمة: السوبرماركت، مراكز التسوق، البنوك',
    avoidIsolatedAreas: 'تجنب الأماكن المعزولة، مواقف السيارات، أو عنوان منزلك',
    popularSpots: 'أماكن شائعة: March? Central، المولات، بهوات الفنادق',
    daytimeMeeting: 'التقِ نهارًا كلما أمكن',
    bringSomeoneTrusted: 'اصطحب شخصًا تثق به',
    tellWhereGoing: 'أخبر دائمًا شخصًا إلى أين تذهب ومع من ستلتقي',
    bringFriendFamily: 'للأغراض مرتفعة القيمة، اصطحب صديقًا أو أحد أفراد العائلة',
    shareSellerContact: 'شارك بيانات البائع مع شخص تثق به',
    checkInAfter: 'اطمئن على شخص ما بعد اكتمال العملية',
    verifyItemBeforePaying: 'تحقق من السلعة قبل الدفع',
    testElectronics: 'اختبر الأجهزة الإلكترونية ? شغّلها وتحقق من جميع الوظائف',
    inspectDamage: 'افحص السلع بعناية بحثًا عن أي ضرر غير ظاهر في الصور',
    vehiclesCheck: 'بالنسبة للمركبات، افحص المحرك والإطارات وكل المستندات',
    doNotPay: 'لا تدفع حتى تكون راضيًا عن السلعة',
    paySafely: 'ادفع بأمان',
    countCash: 'عدّ النقود قبل تسليمها',
    preferMobileMoney: 'فضّل الدفع عبر الهاتف (MTN MoMo / Orange Money) لوجود أثر للمعاملة',
    useEscrow: 'استخدم Bambeh Escrow للمشتريات الغالية ? تُحتجز الأموال حتى تأكيد التسليم',
    neverWire: 'لا تحوّل أموالًا إلى حسابات بنكية مجهولة',
    redFlags: 'علامات خطر ? غادر إذا...',
    flag1: '?? طلب منك البائع الدفع قبل اللقاء أو قبل رؤية السلعة',
    flag2: '?? السعر منخفض بشكل لا يُصدّق ? "أكبر من أن يكون حقيقيًا"',
    flag3: '?? رفض البائع اللقاء في مكان عام',
    flag4: '?? ضغط عليك البائع لاتخاذ القرار بسرعة',
    flag5: '?? أرسل البائع شخصًا آخر بدلًا منه بشكل مفاجئ',
    recommendedSpots: 'أماكن لقاء موصى بها',
    useEscrow: 'للأغراض الغالية ? استخدم الضمان',
    escrowBody: 'يحتفظ Bambeh Escrow بدفعتك بأمان حتى تؤكد استلام السلعة. لا خطر على المشتري أو البائع.',
    learnEscrow: 'تعرّف على الضمان ?',
    encounteredProblem: 'هل واجهت مشكلة؟',
    reportBody: 'إذا تعرضت للاحتيال أو العنف أو خدعة، فأبلغ فورًا.',
    reportIncident: 'الإبلاغ عن حادثة',
  },
  pidgin: {
    back: 'Back',
    title: 'Meet safely',
    subtitle: 'Stay safe when you dey buy and sell face to face',
    quickSafetyChecklist: 'Quick safety checklist',
    meetPublicPlace: 'Meet for public place wey get light',
    tellSomeone: 'Tell person where you dey go',
    testItem: 'Test the item before you pay',
    verifyPayment: 'Count money / confirm mobile payment',
    trustInstincts: 'Trust your instinct ? if something no feel right, waka comot',
    meetInPublicPlace: 'Meet for public place',
    chooseBusyLocations: 'Choose busy places: supermarket, shopping centres, banks',
    avoidIsolatedAreas: 'Avoid isolated places, parking space, or your house address',
    popularSpots: 'Popular spots: March? Central, shopping malls, hotel lobbies',
    daytimeMeeting: 'Meet for daytime anytime you fit',
    bringSomeoneTrusted: 'Carry person wey you trust come',
    tellWhereGoing: 'Always tell somebody where you dey go and who you wan meet',
    bringFriendFamily: 'For expensive items, carry friend or family member come',
    shareSellerContact: 'Share seller contact details with person wey you trust',
    checkInAfter: 'Check in with somebody after transaction don finish',
    verifyItemBeforePaying: 'Verify the item before you pay',
    testElectronics: 'Test electronics ? switch am on, check all functions',
    inspectDamage: 'Inspect items well for damage wey no show for photo',
    vehiclesCheck: 'For vehicles, check engine, tyres, and all documents',
    doNotPay: 'No pay until you dey satisfied with the item',
    paySafely: 'Pay safely',
    countCash: 'Count cash before you hand am over',
    preferMobileMoney: 'Prefer mobile money (MTN MoMo / Orange Money) so you get record',
    useEscrow: 'Use Bambeh Escrow for expensive buys ? money go stay till delivery confirmed',
    neverWire: 'No wire money go unknown bank account',
    redFlags: 'Red flags ? waka comot if...',
    flag1: '?? Seller ask you make you pay before meeting or before you see the item',
    flag2: '?? Price too cheap ? "too good to be true"',
    flag3: '?? Seller refuse meet for public place',
    flag4: '?? Seller dey rush you make you decide fast',
    flag5: '?? Seller send another person come unexpectedly',
    recommendedSpots: 'Recommended meeting spots',
    useEscrow: 'For expensive items ? use Escrow',
    escrowBody: 'Bambeh Escrow go hold your money well until you confirm say you receive the item. No risk for buyer or seller.',
    learnEscrow: 'Learn about Escrow ?',
    encounteredProblem: 'You run into problem?',
    reportBody: 'If fraud, violence, or scam happen, report am immediately.',
    reportIncident: 'Report an incident',
  },
  ful: {
    back: 'Rutto',
    title: 'Naatnu e jam',
    subtitle: 'Woodu jam so aɗa heɓa e jaɓde e yaarde',
    quickSafetyChecklist: 'Laawol jam ko little',
    meetPublicPlace: 'Naatnu e nokkuure publice e laabi',
    tellSomeone: 'Hollu wonde wonde a ɗoo yahata',
    testItem: 'Ƴeewto huunde nde ɓuri ɓeydude',
    verifyPayment: 'Ɓaŋa kaɗɗe / ƴeewto feyde mobile',
    trustInstincts: 'Laawol maa ? so ɗum no jiiɗi, waɗtu ɗum',
    meetInPublicPlace: 'Naatnu e nokkuure publice',
    chooseBusyLocations: 'Suɓo nokkuure ɓurɗe jaɓɓude: supermarket, shopping centres, banke',
    avoidIsolatedAreas: 'Warii nokkuure ɗi no ɓeydi, parking, walla adrees maa',
    popularSpots: 'Nokkuure ɓurɗe: March? Central, shopping malls, hotel lobbies',
    daytimeMeeting: 'Naatnu e nder nyalngu nde ɗuum on',
    bringSomeoneTrusted: 'Hokku ɓiɗo maa weeyo nde a ɗaɓɓitii',
    tellWhereGoing: 'Njiinu kala wonde a yahata e mo a hoore waawi naatde',
    bringFriendFamily: 'So huunde ndii ɗoɓɓi, heɓu sarɗo walla ɓiɗo gorko maɓɓe',
    shareSellerContact: 'Hollu contact seller e wonde ɗoo aɗa waawi ɗaɓɓitde',
    checkInAfter: 'Njiinu e ndiyam maɓɓe so transaction oii yahrata',
    verifyItemBeforePaying: 'Ƴeewto huunde nde nde a feyata',
    testElectronics: 'Ƴeewto electronics ? onno, ƴeewto huunde fota kala',
    inspectDamage: 'Ƴeewto huunde ndee ndiyan ɓeydaande ndee no waɗi foto',
    vehiclesCheck: 'So ɗum ko vehicle, ƴeewto engine, tyres, e documents kala',
    doNotPay: 'Alaa feyde haa so a waawi noddu huunde ndee',
    paySafely: 'Fey e jam',
    countCash: 'Ɓaŋa kaɗɗe ɗee haa so a hooti',
    preferMobileMoney: 'Suɓo mobile money (MTN MoMo / Orange Money) ngam ɗee aɗa heɓa laawol',
    useEscrow: 'Huutoro Bambeh Escrow so huunde ndii ɗoɓɓi ? njaɓɓi goongɗi haa delivery tabiti',
    neverWire: 'Alaa feyde e bank unknown',
    redFlags: 'Njoɓdi ɗiɗi ? yahru so...',
    flag1: '?? Seller ɗaɓɓiti a fey haa laawol e nde a yiyataa huunde ndee',
    flag2: '?? Leel oo no ɓuri no feewi ? "too good to be true"',
    flag3: '?? Seller wonataa naatde e nokkuure publice',
    flag4: '?? Seller no ɓeyda maɗa ngam a waawi suɓde ɗo',
    flag5: '?? Seller njaɓti ɓiɗo goɗɗo e dow mum haala kala',
    recommendedSpots: 'Nokkuure naatde ɗiɗi',
    useEscrow: 'So huunde ndii ɗoɓɓi ? huutoro Escrow',
    escrowBody: 'Bambeh Escrow go hold njaɓɓi maa e jam haa so a tabitii nde a heɓii huunde ndee. Alaa risk e ɗo buyer walla seller.',
    learnEscrow: 'Ɓeydu e Escrow ?',
    encounteredProblem: 'A heɓii laawol hakkunde?',
    reportBody: 'So fraud, violence, walla scam heɓii, hollu ɗum fota fota.',
    reportIncident: 'Hollu incident',
  },
};

const TIPS = [
  {
    icon: <MapPin className="w-5 h-5 text-teal-600" />,
    title: 'Meet in a Public Place',
    color: 'bg-teal-50 border-teal-200',
    points: [
      'Choose busy locations: supermarkets, shopping centres, banks',
      'Avoid isolated areas, parking lots, or your home address',
      'Popular spots in : March? Central, shopping malls, hotel lobbies',
      'Meet during daytime hours whenever possible',
    ],
  },
  {
    icon: <Users className="w-5 h-5 text-blue-600" />,
    title: 'Bring Someone You Trust',
    color: 'bg-blue-50 border-blue-200',
    points: [
      'Always tell someone where you are going and who you are meeting',
      'For high-value items, bring a friend or family member',
      'Share the seller\'s contact details with someone you trust',
      'Check in with someone after the transaction is complete',
    ],
  },
  {
    icon: <Camera className="w-5 h-5 text-purple-600" />,
    title: 'Verify the Item Before Paying',
    color: 'bg-purple-50 border-purple-200',
    points: [
      'Test electronics ? power them on, check all functions',
      'Inspect items carefully for damage not shown in photos',
      'For vehicles, check the engine, tyres, and all documents',
      'Do NOT pay until you are satisfied with the item',
    ],
  },
  {
    icon: <Phone className="w-5 h-5 text-green-600" />,
    title: 'Pay Safely',
    color: 'bg-green-50 border-green-200',
    points: [
      'Count cash before handing it over',
      'Prefer mobile money (MTN MoMo / Orange Money) for a trail',
      'Use Bambeh Escrow for expensive purchases ? funds held until delivery confirmed',
      'Never wire transfer to unknown bank accounts',
    ],
  },
  {
    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
    title: 'Red Flags ? Walk Away If...',
    color: 'bg-red-50 border-red-200',
    points: [
      '?? Seller asks you to pay before meeting or seeing the item',
      '?? Price is unbelievably low ? "too good to be true"',
      '?? Seller refuses to meet in a public place',
      '?? Seller pressures you to decide quickly',
      '?? Seller sends someone else in their place unexpectedly',
    ],
  },
];

const SAFE_SPOTS = [
  { name: 'March? Central, Yaound?', type: 'Market' },
  { name: 'Auchan, Yaound?', type: 'Supermarket' },
  { name: 'Akwa Business District, Douala', type: 'Business Area' },
  { name: 'Hotel lobbies (any city)', type: 'Hotel' },
  { name: 'Police stations', type: 'Official' },
  { name: 'Banks and ATM areas', type: 'Financial' },
];

export default function MeetSafelyPage() {
  const lang = useLang();
  const ui = COPY[(lang === 'fr' || lang === 'ar' || lang === 'pidgin' || lang === 'ful') ? lang : 'en'];
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 pt-6 pb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-teal-100 hover:text-white mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> {ui.back}
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-2xl">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{ui.title}</h1>
            <p className="text-teal-100 text-sm">{ui.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" /> {ui.quickSafetyChecklist}
          </h2>
          <div className="space-y-2">
            {[
              ui.meetPublicPlace,
              ui.tellSomeone,
              ui.testItem,
              ui.verifyPayment,
              ui.trustInstincts,
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                </div>
                {tip}
              </div>
            ))}
          </div>
        </div>

        {TIPS.map((tip, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${tip.color}`}>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              {tip.icon} {tip.title}
            </h3>
            <ul className="space-y-1.5">
              {tip.points.map((point, j) => (
                <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" /> {ui.recommendedSpots}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {SAFE_SPOTS.map((spot, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{spot.name}</p>
                <p className="text-xs text-teal-600 mt-0.5">{spot.type}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-3">
            <Shield className="w-8 h-8 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg mb-1">{ui.useEscrow}</h3>
              <p className="text-teal-100 text-sm mb-3">{ui.escrowBody}</p>
              <button onClick={() => navigate('/escrow')} className="bg-white text-teal-700 font-bold px-4 py-2 rounded-xl text-sm">
                {ui.learnEscrow}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="font-bold text-red-800 mb-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> {ui.encounteredProblem}
          </h3>
          <p className="text-sm text-red-700 mb-3">{ui.reportBody}</p>
          <button onClick={() => navigate('/report-issue')} className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold">
            {ui.reportIncident}
          </button>
        </div>
      </div>
    </div>
  );
}
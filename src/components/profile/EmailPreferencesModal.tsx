/**
 * EmailPreferencesModal.tsx — Bambeh Marketplace
 * FILE LOCATION: src/components/profile/EmailPreferencesModal.tsx
 *
 * Comprehensive multi-lingual configuration supporting LTR / RTL mechanics
 * across English, French, Pidgin English, Arabic, and Fulfulde.
 *
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { X, Mail, Bell, Save, Info } from 'lucide-react';
import { useLanguage } from '@/App';

interface EmailPreferencesModalProps { onClose: () => void; }
type Lang = "en" | "fr" | "pidgin" | "ar" | "ff";

const S: Record<Lang, {
  title: string;
  subtitle: string;
  infoBanner: string;
  requiredBadge: string;
  saveSuccessAlert: string;
  saveErrorAlert: string;
  unsubConfirm: string;
  unsubButton: string;
  unsubFooter: string;
  cancel: string;
  saving: string;
  saveBtn: string;
  frequencyLabel: string;
  freqOptions: Record<string, string>;
  sections: {
    marketing: string;
    transaction: string;
    activity: string;
    social: string;
    frequency: string;
  };
  items: Record<string, { label: string; desc: string }>;
}> = {
  en: {
    title: "Email Preferences",
    subtitle: "Manage what emails you receive",
    infoBanner: "Your preferences are saved immediately. Changes may take up to 24 hours to take effect. Critical security emails cannot be disabled.",
    requiredBadge: "Required",
    saveSuccessAlert: "✅ Email preferences saved successfully!",
    saveErrorAlert: "❌ Failed to save preferences. Please try again.",
    unsubConfirm: "Are you sure you want to unsubscribe from all emails? You will still receive critical account and security notifications.",
    unsubButton: "Unsubscribe from all marketing emails",
    unsubFooter: "You will still receive important account and transaction emails",
    cancel: "Cancel",
    saving: "Saving...",
    saveBtn: "Save Preferences",
    frequencyLabel: "How often would you like to receive email digests?",
    freqOptions: { instant: "Instant (as they happen)", daily: "Daily Digest", weekly: "Weekly Digest", monthly: "Monthly Digest" },
    sections: { marketing: "Marketing & Promotions", transaction: "Transaction & Account", activity: "Activity & Engagement", social: "Social & Community", frequency: "Email Frequency" },
    items: {
      marketingEmails: { label: "Marketing Emails", desc: "Receive promotional emails about Bambeh services and features" },
      weeklyDeals: { label: "Weekly Deals", desc: "Get notified about special deals and discounts every week" },
      newFeatures: { label: "New Features", desc: "Be the first to know about new Bambeh features and updates" },
      specialOffers: { label: "Special Offers", desc: "Exclusive offers and promotions tailored for you" },
      orderConfirmations: { label: "Order Confirmations", desc: "Confirmation emails when you place an order" },
      paymentReceipts: { label: "Payment Receipts", desc: "Receipts for all your transactions and payments" },
      deliveryUpdates: { label: "Delivery Updates", desc: "Track your orders with delivery status updates" },
      accountChanges: { label: "Account Changes", desc: "Notifications about profile and account updates" },
      securityAlerts: { label: "Security Alerts", desc: "Important security notifications for your account" },
      newMessages: { label: "New Messages", desc: "Get notified when you receive a new message" },
      offerReceived: { label: "Offer Received", desc: "Alerts when someone makes an offer on your item" },
      itemSold: { label: "Item Sold", desc: "Confirmation when your item is sold" },
      itemExpiring: { label: "Item Expiring", desc: "Reminder when your listings are about to expire" },
      priceDrops: { label: "Price Drops", desc: "Notify me when saved items drop in price" },
      followersUpdates: { label: "Followers Updates", desc: "Notifications about new followers and profile views" },
      reviewRequests: { label: "Review Requests", desc: "Reminders to leave reviews for completed transactions" },
      communityNews: { label: "Community News", desc: "Updates about the Bambeh community and events" }
    }
  },
  fr: {
    title: "Préférences e-mail",
    subtitle: "Gérez les e-mails que vous recevez",
    infoBanner: "Vos préférences sont enregistrées immédiatement. Les modifications peuvent prendre jusqu'à 24 heures pour prendre effet. Les e-mails de sécurité critiques ne peuvent pas être désactivés.",
    requiredBadge: "Obligatoire",
    saveSuccessAlert: "✅ Préférences e-mail enregistrées avec succès !",
    saveErrorAlert: "❌ Échec de l'enregistrement des préférences. Veuillez réessayer.",
    unsubConfirm: "Êtes-vous sûr de vouloir vous désabonner de tous les e-mails ? Vous continuerez à recevoir les notifications de compte et de sécurité critiques.",
    unsubButton: "Se désabonner de tous les e-mails marketing",
    unsubFooter: "Vous continuerez à recevoir les e-mails importants relatifs à votre compte et à vos transactions",
    cancel: "Annuler",
    saving: "Sauvegarde...",
    saveBtn: "Enregistrer les préférences",
    frequencyLabel: "À quelle fréquence souhaitez-vous recevoir les résumés par e-mail ?",
    freqOptions: { instant: "Instantané (au fur et à mesure)", daily: "Résumé quotidien", weekly: "Résumé hebdomadaire", monthly: "Résumé mensuel" },
    sections: { marketing: "Marketing & Promotions", transaction: "Transaction & Compte", activity: "Activité & Engagement", social: "Social & Communauté", frequency: "Fréquence des e-mails" },
    items: {
      marketingEmails: { label: "E-mails marketing", desc: "Recevoir des e-mails promotionnels sur les services et fonctionnalités de Bambeh" },
      weeklyDeals: { label: "Offres hebdomadaires", desc: "Être informé des offres spéciales et des réductions chaque semaine" },
      newFeatures: { label: "Nouvelles fonctionnalités", desc: "Être le premier informé des nouvelles fonctionnalités et mises à jour de Bambeh" },
      specialOffers: { label: "Offres spéciales", desc: "Offres exclusives et promotions adaptées à vos besoins" },
      orderConfirmations: { label: "Confirmations de commande", desc: "E-mails de confirmation lorsque vous passez une commande" },
      paymentReceipts: { label: "Reçus de paiement", desc: "Reçus pour toutes vos transactions et paiements" },
      deliveryUpdates: { label: "Suivi de livraison", desc: "Suivez vos commandes grâce aux mises à jour du statut de livraison" },
      accountChanges: { label: "Modifications du compte", desc: "Notifications sur les mises à jour du profil et du compte" },
      securityAlerts: { label: "Alertes de sécurité", desc: "Notifications de sécurité importantes pour votre compte" },
      newMessages: { label: "Nouveaux messages", desc: "Être averti lorsque vous recevez un nouveau message" },
      offerReceived: { label: "Offre reçue", desc: "Alertes lorsque quelqu'un fait une offre sur votre article" },
      itemSold: { label: "Article vendu", desc: "Confirmation lorsque votre article est vendu" },
      itemExpiring: { label: "Expiration de l'article", desc: "Rappel lorsque vos annonces sont sur le point d'expirer" },
      priceDrops: { label: "Baisses de prix", desc: "M'avertir lorsque le prix des articles enregistrés baisse" },
      followersUpdates: { label: "Abonnés", desc: "Notifications sur les nouveaux abonnés et les vues de profil" },
      reviewRequests: { label: "Demandes d'avis", desc: "Rappels pour laisser des avis sur les transactions terminées" },
      communityNews: { label: "Actualités de la communauté", desc: "Mises à jour sur la communauté Bambeh et les événements" }
    }
  },
  pidgin: {
    title: "Email Settings",
    subtitle: "Choose how you want make Bambeh send you message for email",
    infoBanner: "Your preferences dey save sharp sharp. E fit take reach 24 hours before changes apply fully. Strong security email updates no fit scale out.",
    requiredBadge: "Must Stay",
    saveSuccessAlert: "✅ Email updates don save fine fine!",
    saveErrorAlert: "❌ Wahala dey, we no fit save am. Try again.",
    unsubConfirm: "You dey sure say you want comot your hand for all marketing updates? Alert for account hacking and money updates go still dey follow you come.",
    unsubButton: "Comot my hand for all marketing messages",
    unsubFooter: "Better account details and payment receipts go still dey ring for your box",
    cancel: "Cancel",
    saving: "E dey lock am...",
    saveBtn: "Save Profile Preferences",
    frequencyLabel: "How many times you want make we dey summarize matters send give you?",
    freqOptions: { instant: "Chop-Chop (as e dey drop)", daily: "Every Single Day", weekly: "Every Weekend", monthly: "Once Every Month" },
    sections: { marketing: "Promos & Cheap Market updates", transaction: "Money & Account Matters", activity: "App Movement & Chatting", social: "Community & People updates", frequency: "How Messages Dey Flow" },
    items: {
      marketingEmails: { label: "Bambeh Feature Updates", desc: "Receive direct notes about sweet tools wey we dey build" },
      weeklyDeals: { label: "Weekly low-budget deals", desc: "Get low-price configurations inside your box every single week" },
      newFeatures: { label: "Fresh features alerts", desc: "Be the front-line person to try new options on top the app" },
      specialOffers: { label: "Special Direct Promos", desc: "Exclusive matching bonus wey we align custom-style for you" },
      orderConfirmations: { label: "Order Confirmations", desc: "Receipt layout when you complete choice for marketplace" },
      paymentReceipts: { label: "Payment & Cash Receipts", desc: "Clean verification papers for your financial mobile money layouts" },
      deliveryUpdates: { label: "Delivery and Tracker updates", desc: "Follow how delivery person dey pack your market waka come" },
      accountChanges: { label: "Profile and Access edits", desc: "Quick info when phone or passcode configurations change" },
      securityAlerts: { label: "Security & Hack Protections", desc: "Heavy security verification tags to check strange entries" },
      newMessages: { label: "New Chat Text alerts", desc: "Get notification once customer or seller drop text line" },
      offerReceived: { label: "New Price Offers", desc: "Hear sharp sharp when buyer give you alternative amount for items" },
      itemSold: { label: "Market Item Sold", desc: "Celebration update when your upload don chop buyer money" },
      itemExpiring: { label: "Item Listing Expiry", desc: "Reminder notes when your public market post dey close down" },
      priceDrops: { label: "Price Drop Discounts", desc: "Alerts when seller drop amount for items wey you save" },
      followersUpdates: { label: "Followers & Viewers growth", desc: "See matching metrics when fresh traders look your page" },
      reviewRequests: { label: "Ratings and Review asks", desc: "Soft reminders to drop stars after transaction close fine" },
      communityNews: { label: "Bambeh Street Community News", desc: "Gather details about events wey dey pop for Cameroon street" }
    }
  },
  ar: {
    title: "تفضيلات البريد الإلكتروني",
    subtitle: "إدارة الرسائل البريدية التي تتلقاها",
    infoBanner: "يتم حفظ تفضيلاتك على الفور. قد تستغرق التغييرات ما يصل إلى 24 ساعة لتصبح سارية المفعول. لا يمكن تعطيل رسائل الأمان الهامة.",
    requiredBadge: "إلزامي",
    saveSuccessAlert: "✅ تم حفظ تفضيلات البريد الإلكتروني بنجاح!",
    saveErrorAlert: "❌ فشل حفظ التفضيلات. يرجى المحاولة مرة أخرى.",
    unsubConfirm: "هل أنت متأكد من رغبتك في إلغاء الاشتراك في جميع رسائل البريد الإلكتروني التسويقية؟ ستستمر في تلقي إشعارات الحساب والأمان الهامة.",
    unsubButton: "إلغاء الاشتراك في جميع رسائل البريد التسويقية",
    unsubFooter: "ستستمر في تلقي رسائل الحساب والمعاملات المالية الهامة",
    cancel: "إلغاء",
    saving: "جاري الحفظ...",
    saveBtn: "حفظ التفضيلات",
    frequencyLabel: "كم مرة تود تلقي ملخصات البريد الإلكتروني؟",
    freqOptions: { instant: "فوري (فور حدوثها)", daily: "ملخص يومي", weekly: "ملخص أسبوعي", monthly: "ملخص شهري" },
    sections: { marketing: "التسويق والعروض الترويجية", transaction: "المعاملات والحساب", activity: "النشاط والتفاعل", social: "التواصل والمجتمع", frequency: "وتيرة البريد الإلكتروني" },
    items: {
      marketingEmails: { label: "رسائل التسويق", desc: "تلقي رسائل ترويجية حول خدمات وميزات منصة بامبه" },
      weeklyDeals: { label: "العروض الأسبوعية", desc: "احصل على إشعارات حول الصفقات والخصومات الخاصة كل أسبوع" },
      newFeatures: { label: "الميزات الجديدة", desc: "كن أول من يعلم بالميزات والتحديثات الجديدة في التطبيق" },
      specialOffers: { label: "عروض خاصة", desc: "عروض ترويجية حصرية مخصصة لك خصيصاً" },
      orderConfirmations: { label: "تأكيد الطلبات", desc: "رسائل تأكيد فورية عند إتمام تقديم طلبك" },
      paymentReceipts: { label: "إيصالات الدفع", desc: "إيصالات مالية لجميع معاملاتك ومدفوعاتك" },
      deliveryUpdates: { label: "تحديثات التوصيل", desc: "تتبع شحناتك وطلباتك مع تحديثات حالة التوصيل" },
      accountChanges: { label: "تغييرات الحساب", desc: "إشعارات فورية حول تحديثات ملفك الشخصي وبيانات حسابك" },
      securityAlerts: { label: "التنبيهات الأمنية", desc: "إشعارات أمنية هامة جداً لحماية حسابك" },
      newMessages: { label: "الرسائل الجديدة", desc: "تلقي تنبيهات فورية عند وصول رسالة دردشة جديدة" },
      offerReceived: { label: "العروض المستلمة", desc: "تنبيهات عندما يقدم شخص ما سعراً مختلفاً لسلعتك" },
      itemSold: { label: "بيع السلعة", desc: "تأكيد فوري عند إتمام بيع سلعتك بنجاح" },
      itemExpiring: { label: "انتهاء صلاحية الإعلان", desc: "تذكير عندما تشرف إعلاناتك المعروضة على الانتهاء" },
      priceDrops: { label: "انخفاض الأسعار", desc: "إعلامي عندما تنخفض أسعار السلع التي قمت بحفظها" },
      followersUpdates: { label: "تحديثات المتابعين", desc: "إشعارات حول المتابعين الجدد وزيارات ملفك الشخصي" },
      reviewRequests: { label: "طلبات التقييم", desc: "تذكير لترك تقييمات ومراجعات للمعاملات المكتملة" },
      communityNews: { label: "أخبار المجتمع المحلي", desc: "تحديثات وأخبار حول مجتمع بامبه وفعالياته" }
    }
  },
  ff: {
    title: "Suftango Email",
    subtitle: "Resu no njiɗ-ɗaa heɓugo ɓataakeeji ndereeji",
    infoBanner: "Andital maa ɗon resama lawlaw. Waylagol ɗon njaara ko yotti hours 24 fof. Ɓataakeeji kisal gundo kam ɗon meemaaka sam.",
    requiredBadge: "Yo Gandal",
    saveSuccessAlert: "✅ Suftango email resama ko woodi!",
    saveErrorAlert: "❌ Ruskama resgo suftango. Tiiɗno eto kadi.",
    unsubConfirm: "A don mari tabat dow njiɗ-ɗaa fasiknugo ko meemi kabaaru yeeyugo fof? Kabaaru kisal andital bee limoore ceede maa ɗon wara bee hoolaare.",
    unsubButton: "Fasikna kabaaru yeeyugo fof",
    unsubFooter: "Kabaaru sodgo bee andital andital gollirde maa ɗon wara bee jam",
    cancel: "Fasikna",
    saving: "Ɗon resata...",
    saveBtn: "Resu Waylagol",
    frequencyLabel: "No njiɗ-ɗaa heɓugo limoore ɓataakeeji maa gundojum?",
    freqOptions: { instant: "Kik-kik (Saa'i fof)", daily: "Limoore Nyalnde fof", weekly: "Limoore Yontere fof", monthly: "Limoore Lewru fof" },
    sections: { marketing: "Yeeyugo & Promos", transaction: "Sodgo & Limoore", activity: "Gollal Bee Chatting", social: "Lirde & Jama'are", frequency: "No Limoore Heɓata" },
    items: {
      marketingEmails: { label: "Emails Yeeyugo", desc: "Heɓu kabaaru ustagol limoore dow gollirɗe Bambeh" },
      weeklyDeals: { label: "Ustagol Yontere fof", desc: "Heɓu andital dow ustagol sirlu bee gundo ustagol yontere fof" },
      newFeatures: { label: "Kuuje Keese andiraaɗe", desc: "Ardo anditugo kuuje keese pottuɗe nder Bambeh" },
      specialOffers: { label: "Ustagol sirlu custom", desc: "Ustagol ustagol pottuɗo ngam maa tan" },
      orderConfirmations: { label: "Tabat Sodgo", desc: "Ɓataakeeji tabat saa'i sodgo kuuje" },
      paymentReceipts: { label: "Dereji Ceede Sodgo", desc: "Dereji ceede dow gollal ceede maa fof" },
      deliveryUpdates: { label: "Hesɗitinki Jottinki Kuuje", desc: "Tokku kuuje sodaaɗe bee kabaaru jottinki mum" },
      accountChanges: { label: "Waylitande Andital", desc: "Kabaaru dow waylitande andital maa" },
      securityAlerts: { label: "Kisndam Andital", desc: "Kabaaru gundojum ngam hoolaare kisal andital maa" },
      newMessages: { label: "Nelde Keese", desc: "Heɓu kabaaru to neɗɗo neli maa winndannde" },
      offerReceived: { label: "Heɓugo Limoore Ceede", desc: "Andital to neɗɗo waɗi limoore ceede dow kuuje maa" },
      itemSold: { label: "Kuufe Sottaama", desc: "Tabat jottinki saa'i kuuje maa sottaama" },
      itemExpiring: { label: "Lalawal ɗon lanna", desc: "Andital to kuuje njaaraaɗe maa ɗon ɓadi lannugo" },
      priceDrops: { label: "Ustagol Ceede Kuuje", desc: "Anditir am to ceede kuuje resaaɗe ustama" },
      followersUpdates: { label: "Tokkooɓe Keese", desc: "Kabaaru dow tokkooɓe keese bee yiygo andital maa" },
      reviewRequests: { label: "Yamgo Anditande Stars", desc: "Soft reminders to drop stars dow gollal ngal lannitii" },
      communityNews: { label: "Kabaaru Jama'are Bambeh", desc: "Hesɗitinki kabaaru dow lirde gollal Bambeh bee kuuje caahu" }
    }
  }
};

export default function EmailPreferencesModal({ onClose }: EmailPreferencesModalProps) {
  const { language } = useLanguage();
  
  const lang: Lang = (language in S ? language : "en") as Lang;
  const s = S[lang];
  const isRtl = lang === "ar";

  const [preferences, setPreferences] = useState({
    marketingEmails: true, weeklyDeals: true, newFeatures: true, specialOffers: true,
    orderConfirmations: true, paymentReceipts: true, deliveryUpdates: true,
    accountChanges: true, securityAlerts: true, newMessages: true, offerReceived: true,
    itemSold: true, itemExpiring: true, priceDrops: true, followersUpdates: false,
    reviewRequests: true, communityNews: false, digestFrequency: 'daily',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('Bambeh_email_preferences');
    if (saved) {
      try { setPreferences(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleToggle = (key: string) => {
    setPreferences(prev => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences(prev => ({ ...prev, digestFrequency: e.target.value }));
  };

  const handleUnsubscribeAll = () => {
    if (window.confirm(s.unsubConfirm)) {
      setPreferences(prev => ({
        ...prev, marketingEmails: false, weeklyDeals: false, newFeatures: false,
        specialOffers: false, followersUpdates: false, communityNews: false,
        priceDrops: false, reviewRequests: false, itemExpiring: false,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('Bambeh_email_preferences', JSON.stringify(preferences));
      alert(s.saveSuccessAlert);
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert(s.saveErrorAlert);
    } finally {
      setIsSaving(false);
    }
  };

  const PreferenceToggle = ({
    itemKey,
    required = false,
  }: {
    itemKey: string;
    required?: boolean;
  }) => {
    const itemStrings = s.items[itemKey] || { label: itemKey, desc: "" };
    const checked = (preferences as any)[itemKey] ?? false;

    return (
      <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
        <div className={`flex-1 ${isRtl ? 'pl-4 pr-0' : 'pr-4 pl-0'}`}>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm">{itemStrings.label}</p>
            {required && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{s.requiredBadge}</span>}
          </div>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{itemStrings.desc}</p>
        </div>
        <button type="button" onClick={() => handleToggle(itemKey)} disabled={required}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-teal-600' : 'bg-gray-200'} ${required ? 'opacity-40 cursor-not-allowed' : ''}`}>
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? (isRtl ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`} />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div dir={isRtl ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 text-start overflow-hidden flex flex-col">
        
        {/* Fixed Title Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><Mail className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl font-bold">{s.title}</h2>
                <p className="text-teal-100 text-xs mt-0.5">{s.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Inner Scrollable Container */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">{s.infoBanner}</p>
            </div>
          </div>

          {/* Section: Marketing */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
              <Bell className="w-4 h-4 text-teal-600" />{s.sections.marketing}
            </h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PreferenceToggle itemKey="marketingEmails" />
              <PreferenceToggle itemKey="weeklyDeals" />
              <PreferenceToggle itemKey="newFeatures" />
              <PreferenceToggle itemKey="specialOffers" />
            </div>
          </div>

          {/* Section: Transactions */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{s.sections.transaction}</h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PreferenceToggle itemKey="orderConfirmations" required />
              <PreferenceToggle itemKey="paymentReceipts" required />
              <PreferenceToggle itemKey="deliveryUpdates" />
              <PreferenceToggle itemKey="accountChanges" required />
              <PreferenceToggle itemKey="securityAlerts" required />
            </div>
          </div>

          {/* Section: Activity */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{s.sections.activity}</h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PreferenceToggle itemKey="newMessages" />
              <PreferenceToggle itemKey="offerReceived" />
              <PreferenceToggle itemKey="itemSold" />
              <PreferenceToggle itemKey="itemExpiring" />
              <PreferenceToggle itemKey="priceDrops" />
            </div>
          </div>

          {/* Section: Social */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{s.sections.social}</h3>
            <div className="bg-gray-50 rounded-xl px-4 py-1">
              <PreferenceToggle itemKey="followersUpdates" />
              <PreferenceToggle itemKey="reviewRequests" />
              <PreferenceToggle itemKey="communityNews" />
            </div>
          </div>

          {/* Section: Frequency */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{s.sections.frequency}</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">{s.frequencyLabel}</label>
              <div className="relative">
                <select value={preferences.digestFrequency} onChange={handleFrequencyChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white text-xs font-medium focus:outline-none appearance-none">
                  <option value="instant">{s.freqOptions.instant}</option>
                  <option value="daily">{s.freqOptions.daily}</option>
                  <option value="weekly">{s.freqOptions.weekly}</option>
                  <option value="monthly">{s.freqOptions.monthly}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button type="button" onClick={handleUnsubscribeAll} className="text-xs text-red-600 hover:text-red-700 font-bold underline focus:outline-none">
              {s.unsubButton}
            </button>
            <p className="text-[11px] text-gray-400 mt-1">{s.unsubFooter}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors focus:outline-none">
              {s.cancel}
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold text-sm hover:from-teal-700 hover:to-teal-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2 focus:outline-none">
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{s.saving}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{s.saveBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
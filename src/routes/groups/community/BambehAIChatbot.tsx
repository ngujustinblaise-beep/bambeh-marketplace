// BAMBEH_DEPLOY_TOKEN__AICHATBOT_FIX97_CLEAN
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BambehAIChatbot.tsx — BAMBEH MARKETPLACE
 * AI-powered customer support chatbot using Claude API
 * Accessible as a standalone page at /ai-chat
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLang } from '@/hooks/useAppLang';
import {
  Bot, Send, User, Sparkles, RefreshCw, ThumbsUp, ThumbsDown,
  MessageSquare, Zap, X, Minimize2, Maximize2,
} from 'lucide-react';

// FIX97: chat goes through the Supabase 'ai' Edge Function, which holds the
// Anthropic key server-side (the old direct browser call had no key at all).
const AI_BACKEND =
  (import.meta as { env?: Record<string, string> }).env?.VITE_AI_BACKEND_URL ||
  'https://rbjbdxefwzvgmioearie.supabase.co/functions/v1/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  liked?: boolean;
}

type Language = 'en' | 'fr' | 'pidgin' | 'ar' | 'ful';

const TEXTS: Record<Language, {
  systemPrompt: string;
  welcome: string;
  quickQuestions: string[];
  placeholder: string;
  poweredBy: string;
  newConversation: string;
  quickLabel: string;
  genericError: string;
  fallbackDefault: string;
  fallbackMap: Record<string, string>;
  title: string;
  apiLabel: string;
}> = {
  en: {
    systemPrompt: `You are Bambeh Assistant, the friendly AI helper for Bambeh Marketplace — Cameroon's #1 online marketplace. You speak English and French (switch based on user's language).

Your personality: Warm, helpful, knowledgeable about Cameroon. Use occasional local expressions.

You help with:
- Finding products, jobs, services, rentals on Bambeh
- Understanding Zerm Coins (1 Zerm = 100 XAF, the platform's digital currency)
- Vendor registration and store setup
- Payment methods: MTN Mobile Money, Orange Money, Cash on Delivery
- Delivery, tracking, and orders
- Account issues and security
- Pricing in XAF
- Local areas: Yaoundé, Douala, Bafoussam, Garoua, Ngaoundéré, Maroua, etc.

When unsure: Say "Let me find that for you" or suggest contacting support at help.bambeh.cm
Keep responses concise (2-4 sentences) unless the user asks for detail.
Always end with a follow-up question or offer to help more.`,
    welcome: "Bonjour! Hello! 👋 I'm **Bambeh Assistant**, your AI helper for Cameroon's favorite marketplace!\n\nI can help you find products, understand Zerm Coins, set up your vendor store, track orders, and much more. What can I do for you today?",
    quickQuestions: [
      "How do Zerm Coins work?",
      "How do I become a vendor?",
      "What payment methods are accepted?",
      "How do I track my order?",
      "What are the vendor subscription plans?",
    ],
    placeholder: "Ask me anything about Bambeh...",
    poweredBy: "Powered by Claude AI — Bambeh Marketplace",
    newConversation: "New conversation",
    quickLabel: "Quick questions:",
    genericError: "I'm sorry, I couldn't generate a response. Please try again.",
    fallbackDefault: "I'm having trouble connecting right now, but I'm here to help! For immediate assistance, please visit help.bambeh.cm or call our support team. Is there anything I can help you with offline?",
    fallbackMap: {
      zerm: "Zerm Coins are Bambeh's digital currency! 1 Zerm = 100 XAF. You earn coins by selling, referring friends, and completing your profile. Use them to boost listings or pay for subscriptions. Want to learn more about earning Zerm Coins?",
      vendor: "To become a vendor, go to bambeh.cm/vendor and click 'Register as Vendor'. You'll need your business name, contact info, and a valid Cameroon ID. Verification takes 24 hours. Shall I walk you through the process?",
      payment: "Bambeh accepts MTN Mobile Money, Orange Money, and Cash on Delivery. All transactions are secured with encryption. Which payment method would you like to know more about?",
      order: "You can track your order at bambeh.cm/track-orders or in your Orders section under your profile. You'll also receive SMS updates for each status change. Do you need help tracking a specific order?",
      delivery: "Delivery is available across all 10 Cameroon regions! Delivery time varies: same-day in Yaoundé and Douala, 2-5 days for other cities. Is there anything specific about delivery you'd like to know?",
    },
    title: "Bambeh Assistant",
    apiLabel: "Powered by Claude AI",
  },
  fr: {
    systemPrompt: `Vous êtes Bambeh Assistant, l’assistant IA convivial de Bambeh Marketplace — la première place de marché en ligne du Cameroun. Vous parlez anglais et français (adaptez-vous à la langue de l’utilisateur).

Votre personnalité : chaleureuse, serviable et bien informée sur le Cameroun. Utilisez parfois des expressions locales.

Vous aidez pour :
- Trouver des produits, emplois, services et locations sur Bambeh
- Comprendre les Zerm Coins (1 Zerm = 100 XAF, la monnaie numérique de la plateforme)
- L’inscription des vendeurs et la configuration des boutiques
- Les moyens de paiement : MTN Mobile Money, Orange Money, paiement à la livraison
- La livraison, le suivi et les commandes
- Les problèmes de compte et la sécurité
- Les prix en XAF
- Les zones locales : Yaoundé, Douala, Bafoussam, Garoua, Ngaoundéré, Maroua, etc.

En cas de doute : dites « Laissez-moi vérifier cela pour vous » ou proposez de contacter l’assistance à help.bambeh.cm
Gardez des réponses concises (2 à 4 phrases) sauf si l’utilisateur demande des détails.
Terminez toujours par une question de suivi ou une proposition d’aide supplémentaire.`,
    welcome: "Bonjour ! Hello ! 👋 Je suis **Bambeh Assistant**, votre assistant IA pour la place de marché préférée du Cameroun !\n\nJe peux vous aider à trouver des produits, comprendre les Zerm Coins, créer votre boutique vendeur, suivre les commandes et bien plus encore. Que puis-je faire pour vous aujourd’hui ?",
    quickQuestions: [
      "Comment fonctionnent les Zerm Coins ?",
      "Comment devenir vendeur ?",
      "Quels moyens de paiement sont acceptés ?",
      "Comment suivre ma commande ?",
      "Quels sont les abonnements vendeurs ?",
    ],
    placeholder: "Posez-moi n’importe quelle question sur Bambeh...",
    poweredBy: "Propulsé par Claude AI — Bambeh Marketplace",
    newConversation: "Nouvelle conversation",
    quickLabel: "Questions rapides :",
    genericError: "Désolé, je n’ai pas pu générer de réponse. Veuillez réessayer.",
    fallbackDefault: "J’ai actuellement des difficultés de connexion, mais je suis là pour vous aider ! Pour une assistance immédiate, veuillez visiter help.bambeh.cm ou contacter notre équipe de support. Y a-t-il quelque chose que je peux faire hors ligne ?",
    fallbackMap: {
      zerm: "Les Zerm Coins sont la monnaie numérique de Bambeh ! 1 Zerm = 100 XAF. Vous gagnez des coins en vendant, en parrainant des amis et en complétant votre profil. Utilisez-les pour booster vos annonces ou régler vos abonnements. Voulez-vous en savoir plus sur comment en gagner ?",
      vendor: "Pour devenir vendeur, rendez-vous sur bambeh.cm/vendor et cliquez sur « Register as Vendor ». Vous aurez besoin du nom de votre entreprise, de vos coordonnées et d’une pièce d’identité camerounaise valide. La vérification prend 24 heures. Voulez-vous que je vous guide étape par étape ?",
      payment: "Bambeh accepte MTN Mobile Money, Orange Money et le paiement à la livraison. Toutes les transactions sont sécurisées par chiffrement. Quel moyen de paiement souhaitez-vous mieux comprendre ?",
      order: "Vous pouvez suivre votre commande sur bambeh.cm/track-orders ou dans la section Commandes de votre profil. Vous recevrez aussi des SMS à chaque changement de statut. Avez-vous besoin d’aide pour une commande précise ?",
      delivery: "La livraison est disponible dans les 10 régions du Cameroun ! Les délais varient : le jour même à Yaoundé et Douala, puis 2 à 5 jours pour les autres villes. Souhaitez-vous des précisions sur la livraison ?",
    },
    title: "Bambeh Assistant",
    apiLabel: "Propulsé par Claude AI",
  },
  pidgin: {
    systemPrompt: `You be Bambeh Assistant, the friendly AI helper for Bambeh Marketplace — Cameroon number 1 online market. You fit talk English and French (change based on the user language).

Your character: warm, helpful, sabi Cameroon well. Use some local expression sometimes.

You dey help with:
- Find product, work, service, rental for Bambeh
- Understand Zerm Coins (1 Zerm = 100 XAF, na the platform digital money)
- Vendor registration and store setup
- Payment methods: MTN Mobile Money, Orange Money, Cash on Delivery
- Delivery, tracking, and order matter
- Account issues and security
- Price for XAF
- Local places: Yaoundé, Douala, Bafoussam, Garoua, Ngaoundéré, Maroua, etc.

If you no sure: talk "Make I find am for you" or suggest make dem contact support for help.bambeh.cm
Keep answer short (2-4 sentences) unless user ask for details.
Always end with follow-up question or offer to help more.`,
    welcome: "Bonjour! Hello! 👋 I be **Bambeh Assistant**, your AI helper for Cameroon favorite market!\n\nI fit help you find product, understand Zerm Coins, set your vendor shop, track order, and plenty more. Wetin I fit do for you today?",
    quickQuestions: [
      "How Zerm Coins dey work?",
      "How I fit become vendor?",
      "Which payment method dem accept?",
      "How I fit track my order?",
      "Wetin be the vendor subscription plan?",
    ],
    placeholder: "Ask me anything about Bambeh...",
    poweredBy: "Powered by Claude AI — Bambeh Marketplace",
    newConversation: "New conversation",
    quickLabel: "Quick questions:",
    genericError: "Sorry, I no fit generate response. Try again please.",
    fallbackDefault: "I get trouble connecting right now, but I dey here to help! For urgent help, please visit help.bambeh.cm or call our support team. Anything I fit help you with offline?",
    fallbackMap: {
      zerm: "Zerm Coins na Bambeh digital money! 1 Zerm = 100 XAF. You fit earn am by selling, referring friends, and completing your profile. Use am boost listing or pay subscription. You wan know more about how to earn Zerm Coins?",
      vendor: "To become vendor, go bambeh.cm/vendor and click 'Register as Vendor'. You go need your business name, contact info, and valid Cameroon ID. Verification dey take 24 hours. Make I show you the process?",
      payment: "Bambeh accept MTN Mobile Money, Orange Money, and Cash on Delivery. All transaction dey secure with encryption. Which payment method you wan know more about?",
      order: "You fit track your order for bambeh.cm/track-orders or inside Orders section under your profile. You go also receive SMS for each status change. You need help track one specific order?",
      delivery: "Delivery dey available for all 10 Cameroon regions! Time dey vary: same-day for Yaoundé and Douala, 2-5 days for other towns. You wan ask anything specific about delivery?",
    },
    title: "Bambeh Assistant",
    apiLabel: "Powered by Claude AI",
  },
  ar: {
    systemPrompt: `أنت مساعد بامبيه، المساعد الذكي الودود لسوق بامبيه — السوق الإلكتروني رقم 1 في الكاميرون. تتحدث الإنجليزية والفرنسية، وتبدّل بينهما حسب لغة المستخدم.

شخصيتك: دافئة، مفيدة، وعلى دراية بالكاميرون. استخدم بعض التعابير المحلية أحيانًا.

تساعد في:
- العثور على المنتجات والوظائف والخدمات والإيجارات على بامبيه
- فهم عملات زرم (1 زرم = 100 فرنك CFA، وهي العملة الرقمية للمنصة)
- تسجيل البائعين وإعداد المتجر
- وسائل الدفع: MTN Mobile Money وOrange Money والدفع عند الاستلام
- التوصيل والتتبع والطلبات
- مشاكل الحساب والأمان
- الأسعار بالفرنك CFA
- المناطق المحلية: ياوندي، دوالا، بافوسام، غاروا، نغاونديري، ماروا، وغيرها

عند عدم التأكد: قل "دعني أتحقق من ذلك لك" أو اقترح التواصل مع الدعم عبر help.bambeh.cm
اجعل الردود موجزة (من 2 إلى 4 جمل) إلا إذا طلب المستخدم التفاصيل.
اختم دائمًا بسؤال متابعة أو عرض للمساعدة أكثر.`,
    welcome: "Bonjour! Hello! 👋 أنا **Bambeh Assistant**، مساعدك الذكي لسوق الكاميرون المفضل!\n\nأستطيع مساعدتك في العثور على المنتجات، وفهم عملات زرم، وإعداد متجر البائع، وتتبع الطلبات، وأكثر من ذلك بكثير. ماذا يمكنني أن أفعل لك اليوم؟",
    quickQuestions: [
      "كيف تعمل عملات زرم؟",
      "كيف أصبح بائعًا؟",
      "ما وسائل الدفع المقبولة؟",
      "كيف أتتبع طلبي؟",
      "ما خطط اشتراك البائعين؟",
    ],
    placeholder: "اسألني أي شيء عن Bambeh...",
    poweredBy: "مدعوم بواسطة Claude AI — Bambeh Marketplace",
    newConversation: "محادثة جديدة",
    quickLabel: "أسئلة سريعة:",
    genericError: "عذرًا، لم أستطع إنشاء رد. يرجى المحاولة مرة أخرى.",
    fallbackDefault: "أواجه مشكلة في الاتصال الآن، لكنني هنا للمساعدة! للحصول على مساعدة فورية، يرجى زيارة help.bambeh.cm أو الاتصال بفريق الدعم لدينا. هل هناك شيء يمكنني مساعدتك به دون اتصال؟",
    fallbackMap: {
      zerm: "عملات زرم هي العملة الرقمية الخاصة ببامبيه! 1 زرم = 100 فرنك CFA. يمكنك كسبها من خلال البيع، وإحالة الأصدقاء، واستكمال ملفك الشخصي. استخدمها لتقوية الإعلانات أو دفع الاشتراكات. هل تريد معرفة المزيد عن طريقة كسبها؟",
      vendor: "لكي تصبح بائعًا، انتقل إلى bambeh.cm/vendor واضغط على 'Register as Vendor'. ستحتاج إلى اسم النشاط التجاري ومعلومات الاتصال وبطاقة هوية كاميرونية سارية. تستغرق عملية التحقق 24 ساعة. هل أشرح لك الخطوات؟",
      payment: "يقبل Bambeh MTN Mobile Money وOrange Money والدفع عند الاستلام. جميع المعاملات مؤمّنة بالتشفير. أي وسيلة دفع تريد أن تعرف عنها أكثر؟",
      order: "يمكنك تتبع طلبك عبر bambeh.cm/track-orders أو من قسم الطلبات داخل ملفك الشخصي. وستصلك أيضًا رسائل SMS عند كل تغيير في الحالة. هل تحتاج إلى المساعدة في تتبع طلب محدد؟",
      delivery: "التوصيل متاح في كل المناطق العشر في الكاميرون! وتختلف المدة: في نفس اليوم داخل ياوندي ودوالا، ومن 2 إلى 5 أيام للمدن الأخرى. هل تريد معرفة شيء محدد عن التوصيل؟",
    },
    title: "Bambeh Assistant",
    apiLabel: "مدعوم بواسطة Claude AI",
  },
  ful: {
    systemPrompt: `Aɗa Bambeh Assistant, juulɓe AI gite ɗum Bambeh Marketplace — ɗemngal onlayn number 1 e Kameruun. Aɗa seedi e Engeleere e Farayse (a wallaɗo e ɗemngal hoɗuɗo rewti ɗo ngal ummii).

Miijo maa: moƴƴo, balliiɗo, kadi arde e leɗɗe Kameruun. Ɗaɓɓit kadi ɗum e kammuɗe lokol so a soodi.

Aɗa balli e:
- Yettude ɗerewol, golle, sarwiis e loumnde e Bambeh
- Gollal Zerm Coins (1 Zerm = 100 XAF, ɗum ko kere digital nde platform ngal)
- Enrolere suɓɓi e feere butik
- Fii paymɛ: MTN Mobile Money, Orange Money, Cash on Delivery
- Njaari, huutoraade e order
- Humpito konto e aadi
- Ndaari e XAF
- Darɗe lokol: Yaoundé, Douala, Bafoussam, Garoua, Ngaoundéré, Maroua, e goɗɗum

So a heɓii hesere: haal "Let me find that for you" walaa waawi waɗde hiiɗde support e help.bambeh.cm
Toppitde ɗereeji ko keƴƴi (2-4 cewtalan) so wano ɗum aski denta.
Walaa naatnu faaɗooji, walla heɓi laawol walla ballal ngam ɗuuɗi.`,
    welcome: "Bonjour! Hello! 👋 Miɗo woni **Bambeh Assistant**, ballal AI maa ngam marketplace moƴƴere Kameruun!\n\nMi waawi wallude maa e yettude ɗerewol, heɓude Zerm Coins, saslude butik maandaare maa, hulaade order, e ko ɗuuɗi goɗɗi. Hol ko mi waawi waɗde ngoon?",
    quickQuestions: [
      "Hol no Zerm Coins gollortoo?",
      "Hol no mi waawi woodude vendor?",
      "Hol ɗemngal paymɛ ɗemɗi?",
      "Hol no mi waawi hulaade order maa?",
      "Hol heɓere subscription vendor ɗi?",
    ],
    placeholder: "Ɓeɗe mi fii ko heɓa Bambeh...",
    poweredBy: "Powered by Claude AI — Bambeh Marketplace",
    newConversation: "Jokkondiral kese",
    quickLabel: "Fiiɗe ɗemɗe:",
    genericError: "Mi yewtii, mi waawi hannde janngude jaɓɓitinol. Tiɗɗoɗo seɗtugo.",
    fallbackDefault: "Mi got trouble e connect go now, kono miɗo fii ballude! Ngam wallude, yillo help.bambeh.cm walla noddu support maa. Aɗa heɓi ko mi waawi wallude maa so aalaa internet?",
    fallbackMap: {
      zerm: "Zerm Coins ko Bambeh digital money! 1 Zerm = 100 XAF. A waawi earn am e soodude, yentinde hoore, kadi kera profile maa. Huutora am ngam ɗowdude listing walla pay subscription. Aɗa yiɗi aɓɓude konngol e gollal Zerm Coins?",
      vendor: "Ngam woodude vendor, yillo bambeh.cm/vendor kadi naat 'Register as Vendor'. A sokli innde business maa, contact info, kadi valid Cameroon ID. Verification ko 24 hours. Mi waawi hollude ma laawol ɗon?",
      payment: "Bambeh ina jaɓ MTN Mobile Money, Orange Money, kadi Cash on Delivery. Kala transaction ko secure e encryption. Hol ɗemngal paymɛ njoɗɗi a yiɗi e ɗum?",
      order: "A waawi hulaade order maa e bambeh.cm/track-orders walaa e Orders section walaa profile maa. A goɗɗi SMS kala no status waawi muutude. Aɗa sokli wallude e hulaade order keɓe?",
      delivery: "Delivery ena woodi e kala 10 regions e Kameruun! Jooni ndee dewal teelaa: same-day e Yaoundé e Douala, 2-5 days e wurooji goɗɗi. Aɗa yiɗi defte keewte e delivery?",
    },
    title: "Bambeh Assistant",
    apiLabel: "Powered by Claude AI",
  },
};

const formatContent = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
};

const BambehAIChatbot: React.FC = () => {
  const appLang = useLang();
  const lang: Language = (appLang === 'ff' ? 'ful' : appLang) as Language;
  const t = TEXTS[lang];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: t.welcome,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const history = [...messages, userMsg]
        .filter(m => m.role !== 'system' && m.id !== 'welcome')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const apiMessages = history.length > 0
        ? history
        : [{ role: 'user' as const, content: text.trim() }];

      const response = await fetch(`${AI_BACKEND}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_tokens: 500,
          system: t.systemPrompt,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.text || t.genericError;

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);

      const lowerInput = text.toLowerCase();
      let fallbackContent = t.fallbackDefault;

      for (const [key, response] of Object.entries(t.fallbackMap)) {
        if (lowerInput.includes(key)) {
          fallbackContent = response;
          break;
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackContent,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const likeMessage = (id: string, liked: boolean) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked } : m));
  };

  const resetChat = () => {
    setMessages(WELCOME_MESSAGES);
    setError(null);
  };

  const WELCOME_MESSAGES: Message[] = [
    {
      id: 'welcome',
      role: 'assistant',
      content: t.welcome,
      timestamp: new Date(),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl flex flex-col transition-all duration-300 ${isMinimized ? 'h-20' : 'h-[85vh] max-h-[750px]'}`}>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">{t.title}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-100 text-xs">{t.apiLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetChat}
              title={t.newConversation}
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
            >
              {isMinimized
                ? <Maximize2 className="w-4 h-4 text-white" />
                : <Minimize2 className="w-4 h-4 text-white" />
              }
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

              {/* Quick questions (shown at start) */}
              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    {t.quickLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.quickQuestions.map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-100 border border-blue-100 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600'
                      : 'bg-gradient-to-br from-blue-600 to-purple-600'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-white" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                    />

                    <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-xs text-gray-400">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && msg.id !== 'welcome' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => likeMessage(msg.id, true)}
                            className={`w-5 h-5 flex items-center justify-center rounded transition-all ${msg.liked === true ? 'text-green-600' : 'text-gray-300 hover:text-green-500'}`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => likeMessage(msg.id, false)}
                            className={`w-5 h-5 flex items-center justify-center rounded transition-all ${msg.liked === false ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="flex gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400 px-2"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                {t.poweredBy}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BambehAIChatbot;
// BAMBEH_END_TOKEN__AICHATBOT__COMPLETE

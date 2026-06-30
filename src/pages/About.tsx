/**
 * ABOUT US PAGE - Multi-language single-file
 * Contains translations: en (English), fr (French - idiomatic), ar (Arabic - RTL),
 * pcm (Pidgin English), ff (Fulfulde - phonetic romanization).
 *
 * Notes:
 * - Do NOT translate icons/emojis.
 * - This file sets document.dir = 'rtl' when language === 'ar' to trigger RTL layout [web:19][web:20].
 * - Keep Tailwind logical utilities (text-start/text-end, ms-/me-) in your app for full RTL support [web:18].
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Target, Users, Award } from 'lucide-react';
import { useLang, setLang as setAppLang } from '@/hooks/useAppLang';

const translations = {
  en: {
    heroTitle: 'About Bambeh',
    heroSubtitle:
      "Cameroon's premier marketplace connecting buyers, sellers, job seekers, and service providers",
    missionTitle: 'Our Mission',
    missionText:
      "To empower Cameroonians by providing a safe, accessible, and efficient platform for buying, selling, finding jobs, and discovering services. We're building a stronger economy, one transaction at a time.",
    visionTitle: 'Our Vision',
    visionText:
      'To become the most trusted marketplace in Cameroon, where every citizen has equal opportunity to grow their business, find employment, and access essential services.',
    valuesTitle: 'Our Values',
    communityTitle: 'Community First',
    communityText: 'We put our users at the heart of everything we do',
    trustTitle: 'Trust & Safety',
    trustText: 'Building a secure environment for all transactions',
    innovationTitle: 'Innovation',
    innovationText: 'Constantly improving to serve you better',
    statsActiveUsers: 'Active Users',
    statsListings: 'Listings',
    statsJobs: 'Jobs Posted',
    statsMade: 'Cameroon Made',
    teamTitle: 'Our Team',
    teamText:
      'Bambeh is built by a dedicated team of Cameroonian entrepreneurs, developers, and customer service professionals who understand the local market and are committed to your success.',
    ctaTitle: 'Join the Bambeh Community',
    ctaText: 'Start buying, selling, and connecting today!',
    createAccount: 'Create Account',
    learnMore: 'Learn More',
    langLabel: 'Language',
  },

  fr: {
    heroTitle: 'À propos de Bambeh',
    heroSubtitle:
      "La principale place de marché du Cameroun, reliant acheteurs, vendeurs, chercheurs d'emploi et prestataires de services",
    missionTitle: 'Notre mission',
    missionText:
      "Donner aux Camerounais les moyens d'agir grâce à une plateforme sûre, accessible et performante pour acheter, vendre, trouver un emploi et dénicher des services. Nous contribuons à renforcer l'économie, transaction après transaction.",
    visionTitle: 'Notre vision',
    visionText:
      "Devenir la place de marché la plus fiable du Cameroun, où chaque citoyen dispose des mêmes chances pour développer son activité, trouver un emploi et accéder aux services essentiels.",
    valuesTitle: 'Nos valeurs',
    communityTitle: 'La communauté d’abord',
    communityText: "Nos utilisateurs sont au centre de chacune de nos décisions",
    trustTitle: 'Confiance et sécurité',
    trustText: 'Garantir un environnement sécurisé pour toutes les transactions',
    innovationTitle: 'Innovation',
    innovationText: 'Nous nous améliorons en continu pour mieux vous servir',
    statsActiveUsers: "Utilisateurs actifs",
    statsListings: 'Annonces',
    statsJobs: 'Offres d’emploi publiées',
    statsMade: 'Fabriqué au Cameroun',
    teamTitle: 'Notre équipe',
    teamText:
      "Bambeh est développé par une équipe engagée d'entrepreneurs, développeurs et chargés de clientèle camerounais qui maîtrisent le marché local et travaillent pour votre réussite.",
    ctaTitle: "Rejoignez la communauté Bambeh",
    ctaText: "Commencez à acheter, vendre et vous connecter dès aujourd'hui !",
    createAccount: "Créer un compte",
    learnMore: "En savoir plus",
    langLabel: 'Langue',
  },

  ar: {
    // Arabic is natural, idiomatic, and ready for RTL layout. Do not change classNames here; document.dir will be set to 'rtl'.
    heroTitle: 'عن بامبيه',
    heroSubtitle:
      'أول سوق إلكتروني في الكاميرون يربط بين المشترين والبائعين وطالبي العمل ومقدمي الخدمات',
    missionTitle: 'مهمتنا',
    missionText:
      'نهدف إلى تمكين الشعب الكاميروني من خلال توفير منصة آمنة ومتاحة وفعالة للشراء والبيع وإيجاد فرص العمل واكتشاف الخدمات. نبني اقتصادًا أقوى مع كل معاملة.',
    visionTitle: 'رؤيتنا',
    visionText:
      'أن نصبح أكثر أسواق الكاميرون مصداقية، حيث تتاح لكل مواطن فرص متساوية لتطوير أعماله والحصول على وظيفة والوصول إلى الخدمات الأساسية.',
    valuesTitle: 'قيمنا',
    communityTitle: 'المجتمع أولاً',
    communityText: 'المستخدمون في صلب كل ما نقوم به',
    trustTitle: 'الثقة والسلامة',
    trustText: 'بناء بيئة آمنة لجميع المعاملات',
    innovationTitle: 'الابتكار',
    innovationText: 'نسعى باستمرار للتحسين حتى نخدمكم أفضل',
    statsActiveUsers: 'المستخدمون النشطون',
    statsListings: 'الإعلانات',
    statsJobs: 'الوظائف المنشورة',
    statsMade: 'صُنع في الكاميرون',
    teamTitle: 'فريقنا',
    teamText:
      'انشئت بامبيه بواسطة فريق مخلص من رواد الأعمال والمطورين ومختصي خدمة العملاء الكاميرونيين الذين يفهمون السوق المحلي ويعملون لنجاحكم.',
    ctaTitle: 'انضم إلى مجتمع بامبيه',
    ctaText: 'ابدأ بالشراء والبيع والتواصل اليوم!',
    createAccount: 'إنشاء حساب',
    learnMore: 'اعرف المزيد',
    langLabel: 'اللغة',
  },

  pcm: {
    // Cameroonian Pidgin English — natural, conversational.
    heroTitle: 'About Bambeh',
    heroSubtitle:
      "Cameroon top marketplace wey join buyers, sellers, people wey dey find work and people wey dey provide service",
    missionTitle: 'Our Mission',
    missionText:
      "Make we empower Cameroonians by give dem one safe, easy and quick platform for buy, sell, find job and find service. We dey build obodo wey strong, one deal at a time.",
    visionTitle: 'Our Vision',
    visionText:
      "Make Bambeh be the market wey everybody for Cameroon trust, weh every person get same chance to grow im business, find work and get important service.",
    valuesTitle: 'Our Values',
    communityTitle: 'Community First',
    communityText: 'We put our users for heart of everything we do',
    trustTitle: 'Trust & Safety',
    trustText: 'We dey build safe place for all transactions',
    innovationTitle: 'Innovation',
    innovationText: 'We dey always improve make we serve you better',
    statsActiveUsers: 'Active Users',
    statsListings: 'Listings',
    statsJobs: 'Jobs Posted',
    statsMade: 'Cameroon Made',
    teamTitle: 'Our Team',
    teamText:
      'Bambeh na team wey get passion — Cameroonian entrepreneurs, developers and customer service people wey sabi the local market and dem dey work for your success.',
    ctaTitle: 'Join the Bambeh Community',
    ctaText: 'Start dey buy, sell and connect today!',
    createAccount: 'Create Account',
    learnMore: 'Learn More',
    langLabel: 'Language',
  },

  ff: {
    // Fulfulde - phonetic romanization (approximate, readable Latin script)
    heroTitle: 'Ko Bambeh',
    heroSubtitle:
      "Suudu-ndiyam e Cameroon ɗe waɗi e jamɓe, waɗɓe, waɗɗi-laabi e waɗi-hokki nanondiral",
    missionTitle: 'Min Jooni',
    missionText:
      "Ndeen woni ɗum waɗata Cameroonians e hakkunde: ko suudu ngam naatnude, wonaa hirna, e waɗata wondi-fayde ngam udditde, waɗde, yiɗde laabi e yiɗde nanondiral. Min naatnude ngam suɓugo jamɗo, kala jooɓirde kowre.",
    visionTitle: 'Min Ɓe',
    visionText:
      "Ndeen min fowtiima ina waɗi suudu moƴƴi e Cameroon, ko fii kala muuman ɗiɗi waɗi laawol ngam hollude jawdi, njaare e njuɓɓe nanondiral.",
    valuesTitle: 'Nde Rimmugo',
    communityTitle: 'Jom Suudu',
    communityText: "Min njiyataa yimɓe amen e goo ko min waɗi",
    trustTitle: 'Aadugo e Naatude',
    trustText: 'Naatnude leydi ɗe heɓi hirsu ngam kala jooɓirde',
    innovationTitle: 'Ɓe Njaɓɓude',
    innovationText: 'Min waɗata noon e nder rewɓe ngam yoɓɓude no moƴƴi',
    statsActiveUsers: 'Yimɓe ndenndi',
    statsListings: 'Ñaawoore',
    statsJobs: 'Laabi ɗiɗi waɗi',
    statsMade: 'Kameroon Ko waɗi',
    teamTitle: 'Golle Amen',
    teamText:
      'Bambeh waɗi e ko ɓeen waɗɓe: nderooɓe Cameroonian, developers e waɗɓe nanondiral ɗe njiyataa suudu leydi e ɗiɗi yimɓe maa.',
    ctaTitle: 'Noonde e Suudu Bambeh',
    ctaText: 'Yaha buy, sell e connect jooni!',
    createAccount: 'Hollu Kontu',
    learnMore: 'Yiyɗo Añnde',
    langLabel: 'Hollu',
  },
};

export default function About() {
  const lang = useLang();
  const t = translations[lang === 'pidgin' ? 'pcm' : lang] || translations.en;

  useEffect(() => {
    // Apply RTL when Arabic selected; LTR otherwise [web:19][web:20].
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang === 'fr' ? 'fr' : 'en');
    }
  }, [lang]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Language selector */}
        <div className="flex justify-end mb-4">
          <label className="mr-2 font-medium">{t.langLabel}:</label>
          <select
            value={lang === 'pidgin' ? 'pcm' : lang}
            onChange={(e) => setAppLang(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="pcm">Pidgin</option>
            <option value="ff">Fulfulde</option>
          </select>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-12 mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4">{t.heroTitle}</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">{t.heroSubtitle}</p>
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.missionTitle}</h2>
            <p className="text-gray-700 leading-relaxed">{t.missionText}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.visionTitle}</h2>
            <p className="text-gray-700 leading-relaxed">{t.visionText}</p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.valuesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t.communityTitle}</h3>
              <p className="text-gray-600">{t.communityText}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t.trustTitle}</h3>
              <p className="text-gray-600">{t.trustText}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{t.innovationTitle}</h3>
              <p className="text-gray-600">{t.innovationText}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-purple-100">{t.statsActiveUsers}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-purple-100">{t.statsListings}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-purple-100">{t.statsJobs}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-purple-100">{t.statsMade}</div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t.teamTitle}</h2>
          <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">{t.teamText}</p>
        </div>

        {/* CTA */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.ctaTitle}</h2>
          <p className="text-gray-700 mb-6">{t.ctaText}</p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold"
            >
              {t.createAccount}
            </Link>
            <Link
              to="/help"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold"
            >
              {t.learnMore}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
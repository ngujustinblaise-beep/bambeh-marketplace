// BAMBEH_DEPLOY_TOKEN__POST_AD_FIX830_CLEAN
/**
 * src/pages/PostAd.tsx - FIX830 - route /post-ad (also where "post", "sell", "publier", "vendre" lead from the
 * header's voice and search)
 *
 * FIX830, Big 18 Oct 2026: "Bambeh can not still submit adverts. We need to make adverts work."
 * This page used to show a form whose "Submit Ad" saved the advert ON THE PHONE ONLY (localStorage 'bambeh_ads'),
 * said "Ad Posted!" and sent the person Home: nobody else ever saw it, and nothing in the app ever read it. A promise
 * the app could not keep - so it is gone. Now the page sends people to the REAL places that post:
 *   sell an item, offer a service, post a job, rent out a house, sell a vehicle, swap, sell farm produce, list a gas or
 *   food business - each the app's own posting page;
 *   and "Advertise your business": Featured adverts are placed by Bambeh staff (Command Center > Featured ads,
 *   FIX827) for a day, a week, a month or a year - the advertiser sends the picture and the words to
 *   support@bambeh.com or gives them to a Bambeh agent. No price is printed here.
 * The old phone-only copies are cleared. Five languages.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, Briefcase, Car, ChevronRight, Flame, Home, Leaf, Mail, Megaphone, ShoppingBag, Wrench } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
function norm(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm' || s.indexOf('pid') === 0) return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

type Key = 'title' | 'sub' | 'back' | 'sell' | 'sellSub' | 'service' | 'serviceSub' | 'job' | 'jobSub' | 'rent' | 'rentSub'
  | 'vehicle' | 'vehicleSub' | 'swap' | 'swapSub' | 'farm' | 'farmSub' | 'gas' | 'gasSub'
  | 'advTitle' | 'advBody' | 'advHow' | 'advMail' | 'advSubject';

export const POST_TEXT: Record<Lang, Record<Key, string>> = {
  en: {
    title: 'What do you want to post?', sub: 'Choose, and the right form opens.', back: 'Back',
    sell: 'Sell an item', sellSub: 'Phones, clothes, furniture, electronics...',
    service: 'Offer a service', serviceSub: 'Plumber, hairdresser, tutor, mechanic...',
    job: 'Post a job', jobSub: 'Find staff for your shop or business',
    rent: 'Rent out a house or a room', rentSub: 'Studios, apartments, rooms, offices',
    vehicle: 'Sell a vehicle', vehicleSub: 'Cars, motorbikes, trucks',
    swap: 'Swap something', swapSub: 'Exchange an item for another',
    farm: 'Sell farm produce', farmSub: 'Vegetables, fruit, grains, livestock',
    gas: 'List your gas or food business', gasSub: 'Gas sellers, restaurants, grills - checked by Bambeh before they show',
    advTitle: 'Advertise your business on Bambeh',
    advBody: 'Featured adverts run on every phone - on Home and in every section - for a day, a week, a month or a year. Bambeh staff place them for you.',
    advHow: 'Send your picture, your words and the period you want to support@bambeh.com, or give them to a Bambeh agent.',
    advMail: 'Write to support@bambeh.com', advSubject: 'Advert on Bambeh',
  },
  fr: {
    title: 'Que voulez-vous publier ?', sub: 'Choisissez, et le bon formulaire s\u2019ouvre.', back: 'Retour',
    sell: 'Vendre un article', sellSub: 'T\u00e9l\u00e9phones, v\u00eatements, meubles, \u00e9lectronique...',
    service: 'Proposer un service', serviceSub: 'Plombier, coiffeuse, r\u00e9p\u00e9titeur, m\u00e9canicien...',
    job: 'Publier une offre d\u2019emploi', jobSub: 'Trouvez du personnel pour votre boutique ou entreprise',
    rent: 'Louer une maison ou une chambre', rentSub: 'Studios, appartements, chambres, bureaux',
    vehicle: 'Vendre un v\u00e9hicule', vehicleSub: 'Voitures, motos, camions',
    swap: '\u00c9changer quelque chose', swapSub: '\u00c9changez un objet contre un autre',
    farm: 'Vendre des produits de la ferme', farmSub: 'L\u00e9gumes, fruits, c\u00e9r\u00e9ales, b\u00e9tail',
    gas: 'Inscrire votre commerce de gaz ou de nourriture', gasSub: 'Vendeurs de gaz, restaurants, grillades - v\u00e9rifi\u00e9s par Bambeh avant d\u2019appara\u00eetre',
    advTitle: 'Faites la publicit\u00e9 de votre entreprise sur Bambeh',
    advBody: 'Les publicit\u00e9s en vedette passent sur tous les t\u00e9l\u00e9phones - sur l\u2019accueil et dans chaque rubrique - pour un jour, une semaine, un mois ou un an. L\u2019\u00e9quipe Bambeh les place pour vous.',
    advHow: 'Envoyez votre image, votre texte et la p\u00e9riode souhait\u00e9e \u00e0 support@bambeh.com, ou remettez-les \u00e0 un agent Bambeh.',
    advMail: '\u00c9crire \u00e0 support@bambeh.com', advSubject: 'Publicit\u00e9 sur Bambeh',
  },
  pidgin: {
    title: 'Wetin you wan post?', sub: 'Choose, and the correct form go open.', back: 'Go back',
    sell: 'Sell something', sellSub: 'Phone, clothes, furniture, electronics...',
    service: 'Offer your service', serviceSub: 'Plumber, hairdresser, teacher, mechanic...',
    job: 'Post work', jobSub: 'Find people for your shop or business',
    rent: 'Rent out house or room', rentSub: 'Studio, apartment, room, office',
    vehicle: 'Sell motor', vehicleSub: 'Car, moto, truck',
    swap: 'Swap something', swapSub: 'Change one thing for another one',
    farm: 'Sell farm things', farmSub: 'Vegetables, fruits, grains, animals',
    gas: 'Put your gas or chop business', gasSub: 'Gas sellers, chop houses, soya - Bambeh check them before they show',
    advTitle: 'Advertise your business for Bambeh',
    advBody: 'Featured adverts dey show for every phone - for Home and for every section - for one day, one week, one month or one year. Bambeh people go put am for you.',
    advHow: 'Send your picture, your words and how long you want to support@bambeh.com, or give them to one Bambeh agent.',
    advMail: 'Write to support@bambeh.com', advSubject: 'Advert for Bambeh',
  },
  ar: {
    title: '\u0645\u0627\u0630\u0627 \u062a\u0631\u064a\u062f \u0623\u0646 \u062a\u0646\u0634\u0631\u061f', sub: '\u0627\u062e\u062a\u0631\u060c \u0648\u064a\u064f\u0641\u062a\u062d \u0627\u0644\u0646\u0645\u0648\u0630\u062c \u0627\u0644\u0645\u0646\u0627\u0633\u0628.', back: '\u0631\u062c\u0648\u0639',
    sell: '\u0628\u064a\u0639 \u063a\u0631\u0636', sellSub: '\u0647\u0648\u0627\u062a\u0641\u060c \u0645\u0644\u0627\u0628\u0633\u060c \u0623\u062b\u0627\u062b\u060c \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a\u0627\u062a...',
    service: '\u0639\u0631\u0636 \u062e\u062f\u0645\u0629', serviceSub: '\u0633\u0628\u0627\u0643\u060c \u0645\u0635\u0641\u0641\u0629 \u0634\u0639\u0631\u060c \u0645\u062f\u0631\u0651\u0633\u060c \u0645\u064a\u0643\u0627\u0646\u064a\u0643\u064a...',
    job: '\u0646\u0634\u0631 \u0648\u0638\u064a\u0641\u0629', jobSub: '\u0627\u0628\u062d\u062b \u0639\u0646 \u0639\u0627\u0645\u0644\u064a\u0646 \u0644\u0645\u062a\u062c\u0631\u0643 \u0623\u0648 \u0634\u0631\u0643\u062a\u0643',
    rent: '\u062a\u0623\u062c\u064a\u0631 \u0645\u0646\u0632\u0644 \u0623\u0648 \u063a\u0631\u0641\u0629', rentSub: '\u0627\u0633\u062a\u0648\u062f\u064a\u0648\u0647\u0627\u062a\u060c \u0634\u0642\u0642\u060c \u063a\u0631\u0641\u060c \u0645\u0643\u0627\u062a\u0628',
    vehicle: '\u0628\u064a\u0639 \u0645\u0631\u0643\u0628\u0629', vehicleSub: '\u0633\u064a\u0627\u0631\u0627\u062a\u060c \u062f\u0631\u0627\u062c\u0627\u062a \u0646\u0627\u0631\u064a\u0629\u060c \u0634\u0627\u062d\u0646\u0627\u062a',
    swap: '\u0645\u0642\u0627\u064a\u0636\u0629 \u0634\u064a\u0621', swapSub: '\u0628\u062f\u0651\u0644 \u063a\u0631\u0636\u064b\u0627 \u0628\u063a\u0631\u0636 \u0622\u062e\u0631',
    farm: '\u0628\u064a\u0639 \u0645\u0646\u062a\u062c\u0627\u062a \u0627\u0644\u0645\u0632\u0631\u0639\u0629', farmSub: '\u062e\u0636\u0631\u0648\u0627\u062a\u060c \u0641\u0648\u0627\u0643\u0647\u060c \u062d\u0628\u0648\u0628\u060c \u0645\u0627\u0634\u064a\u0629',
    gas: '\u0623\u0636\u0641 \u0645\u062d\u0644\u0651 \u0627\u0644\u063a\u0627\u0632 \u0623\u0648 \u0627\u0644\u0637\u0639\u0627\u0645', gasSub: '\u0628\u0627\u0626\u0639\u0648 \u0627\u0644\u063a\u0627\u0632\u060c \u0645\u0637\u0627\u0639\u0645\u060c \u0645\u0634\u0627\u0648\u064d - \u064a\u062a\u062d\u0642\u0651\u0642 \u0645\u0646\u0647\u0627 \u0628\u0627\u0645\u0628\u064a\u0647 \u0642\u0628\u0644 \u0638\u0647\u0648\u0631\u0647\u0627',
    advTitle: '\u0623\u0639\u0644\u0650\u0646 \u0639\u0646 \u0646\u0634\u0627\u0637\u0643 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647',
    advBody: '\u062a\u0638\u0647\u0631 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0645\u064a\u0651\u0632\u0629 \u0639\u0644\u0649 \u0643\u0644 \u0627\u0644\u0647\u0648\u0627\u062a\u0641 - \u0641\u064a \u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 \u0648\u0641\u064a \u0643\u0644 \u0642\u0633\u0645 - \u0644\u064a\u0648\u0645 \u0623\u0648 \u0623\u0633\u0628\u0648\u0639 \u0623\u0648 \u0634\u0647\u0631 \u0623\u0648 \u0633\u0646\u0629. \u064a\u0636\u0639\u0647\u0627 \u0641\u0631\u064a\u0642 \u0628\u0627\u0645\u0628\u064a\u0647 \u0644\u0643.',
    advHow: '\u0623\u0631\u0633\u0644 \u0635\u0648\u0631\u062a\u0643 \u0648\u0646\u0635\u0651\u0643 \u0648\u0627\u0644\u0645\u062f\u0629 \u0627\u0644\u062a\u064a \u062a\u0631\u064a\u062f\u0647\u0627 \u0625\u0644\u0649 support@bambeh.com\u060c \u0623\u0648 \u0633\u0644\u0651\u0645\u0647\u0627 \u0644\u0648\u0643\u064a\u0644 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647.',
    advMail: '\u0627\u0643\u062a\u0628 \u0625\u0644\u0649 support@bambeh.com', advSubject: '\u0625\u0639\u0644\u0627\u0646 \u0639\u0644\u0649 \u0628\u0627\u0645\u0628\u064a\u0647',
  },
  ff: {
    title: 'Ko nji\u0257-\u0257aa yaltinde?', sub: 'Su\u0253o, fomre mo\u01b4\u01b4unde ndee udditoto.', back: 'Rutto',
    sell: 'Soottu huunde', sellSub: 'Telefonji, comci, ka\u0253ir\u0257e suudu, masi\u014baaji...',
    service: 'Hokku ballal', serviceSub: 'Tuyoowo, pe\u0257oowo, jannginoowo, mekanisiye...',
    job: 'Yaltin golle', jobSub: 'Yiylo liggotoo\u0253e ngam bitik maa',
    rent: 'Luwaasu suudu walla cuu\u0257i', rentSub: 'Studio, apartema\u014b, cuu\u0257i, biro',
    vehicle: 'Soottu oto', vehicleSub: 'Otooji, motooji, kamiyo\u014baaji',
    swap: 'Waylu huunde', swapSub: 'Waylu huunde e huunde goo',
    farm: 'Soottu ko ngesa addi', farmSub: 'Haakooji, \u0253i\u0253\u0253e le\u0257\u0257e, gawri, jawdi',
    gas: 'Winndin bitik gaas walla \u00f1amri maa', gasSub: 'Soottoo\u0253e gaas, restoraaji, ju\u0257\u0257oo\u0253e - Bambeh \u01b4eewtat \u0253e ado \u0253e fee\u00f1de',
    advTitle: 'Jeeyto golle maa e Bambeh',
    advBody: 'Jaay\u0257e \u0257uu\u0257\u0257e ena fee\u00f1oo e telefonji fof - e Hoore e nder pecce fof - \u00f1alawma, yontere, lewru walla hitaande. Goomu Bambeh wa\u0257at \u0257e ngam maa.',
    advHow: 'Neldu natal maa, konngi maa e waktu mo nji\u0257-\u0257aa to support@bambeh.com, walla hokku \u0257i aja\u014b Bambeh.',
    advMail: 'Winndan support@bambeh.com', advSubject: 'Jaayngal e Bambeh',
  },
};

const ROWS: ReadonlyArray<{ key: Key; sub: Key; to: string; icon: ComponentType<{ className?: string }>; tone: string }> = [
  { key: 'sell', sub: 'sellSub', to: '/marketplace/sell', icon: ShoppingBag, tone: 'bg-green-100 text-green-700' },
  { key: 'service', sub: 'serviceSub', to: '/services/offer', icon: Wrench, tone: 'bg-purple-100 text-purple-700' },
  { key: 'job', sub: 'jobSub', to: '/jobs/post', icon: Briefcase, tone: 'bg-amber-100 text-amber-700' },
  { key: 'rent', sub: 'rentSub', to: '/rentals/list', icon: Home, tone: 'bg-orange-100 text-orange-700' },
  { key: 'vehicle', sub: 'vehicleSub', to: '/vehicles/sell', icon: Car, tone: 'bg-red-100 text-red-700' },
  { key: 'swap', sub: 'swapSub', to: '/exchange/post', icon: ArrowLeftRight, tone: 'bg-teal-100 text-teal-700' },
  { key: 'farm', sub: 'farmSub', to: '/farm-fresh/sell', icon: Leaf, tone: 'bg-lime-100 text-lime-700' },
  { key: 'gas', sub: 'gasSub', to: '/food-gas/new', icon: Flame, tone: 'bg-rose-100 text-rose-700' },
];

export default function PostAd() {
  const lang = norm(useLang());
  const t = POST_TEXT[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const navigate = useNavigate();

  // the copies the old form kept on this phone were never seen by anybody - clear them
  useEffect(() => {
    try { window.localStorage.removeItem('bambeh_ads'); } catch { /* storage blocked */ }
  }, []);

  const mail = 'mailto:support@bambeh.com?subject=' + encodeURIComponent(t.advSubject);

  return (
    <div dir={dir} className="mx-auto min-h-screen max-w-2xl bg-gray-50 p-4 pb-24" data-fix="FIX830" data-post-chooser="1">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 font-semibold text-teal-700">
        <ArrowLeft className="h-5 w-5 rtl:rotate-180" />{t.back}
      </button>
      <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
      <p className="mb-5 mt-1 text-sm text-gray-600">{t.sub}</p>

      <div className="space-y-2">
        {ROWS.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.key} to={r.to} data-post-to={r.to}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:border-teal-300">
              <span className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ' + r.tone}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-gray-900">{t[r.key]}</span>
                <span className="block truncate text-xs text-gray-500">{t[r.sub]}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 rtl:rotate-180" />
            </Link>
          );
        })}
      </div>

      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4" data-advertise="1">
        <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><Megaphone className="h-5 w-5 text-amber-600" />{t.advTitle}</h2>
        <p className="mt-1 text-sm text-gray-700">{t.advBody}</p>
        <p className="mt-1 text-sm text-gray-700">{t.advHow}</p>
        <a href={mail} data-advertise-mail="1"
           className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white">
          <Mail className="h-4 w-4" />{t.advMail}
        </a>
      </section>
    </div>
  );
}
// BAMBEH_END_TOKEN__POST_AD_FIX830__COMPLETE

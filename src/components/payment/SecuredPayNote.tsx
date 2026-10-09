// BAMBEH_DEPLOY_TOKEN__SECURED_PAY_NOTE_FIX684_CLEAN
/**
 * src/components/payment/SecuredPayNote.tsx - FIX684 (FIX668, first installed now)
 * The message that closes every order summary - Buy Now and the cart alike -
 * now that Bambeh Secured Pay protects every purchase (FIX663):
 * "THANK YOU FOR USING BAMBEH SECURED PAY", and what it means, in the app's
 * five languages. Place it directly under the order total.
 * FIX684 - Fulfulde: "jeeyoowo" (seller), the word the rest of the app uses.
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { ShieldCheck } from 'lucide-react';
import { useLang } from '@/hooks/useAppLang';

type Lang = 'en' | 'fr' | 'pidgin' | 'ar' | 'ff';
function normLang(v: unknown): Lang {
  const s = String(v || 'en').toLowerCase();
  if (s.indexOf('fr') === 0) return 'fr';
  if (s === 'pidgin' || s === 'pcm') return 'pidgin';
  if (s.indexOf('ar') === 0) return 'ar';
  if (s === 'ff' || s === 'ful' || s === 'fulfulde') return 'ff';
  return 'en';
}

const TEXT: Record<Lang, Record<string, string>> = {
  en: {
    title: "THANK YOU FOR USING BAMBEH SECURED PAY",
    body: "Your money is held safely. The seller is paid only after you confirm you received your order. If something is wrong, report it and Bambeh reviews it within 72 hours.",
  },
  fr: {
    title: "MERCI D'UTILISER BAMBEH SECURED PAY",
    body: "Votre argent est conserv\u00e9 en s\u00e9curit\u00e9. Le vendeur n'est pay\u00e9 qu'apr\u00e8s votre confirmation de r\u00e9ception de la commande. En cas de probl\u00e8me, signalez-le : Bambeh l'examine sous 72 heures.",
  },
  pidgin: {
    title: "THANK YOU FOR USING BAMBEH SECURED PAY",
    body: "Your money dey safe. Seller go collect only after you confirm say you don receive your order. If something no correct, report am and Bambeh go check am inside 72 hours.",
  },
  ar: {
    title: "\u0634\u0643\u0631\u064b\u0627 \u0644\u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0627\u0644\u062f\u0641\u0639 \u0627\u0644\u0622\u0645\u0646 \u0645\u0646 \u0628\u0627\u0645\u0628\u064a\u0647 (BAMBEH SECURED PAY)",
    body: "\u0623\u0645\u0648\u0627\u0644\u0643 \u0645\u062d\u0641\u0648\u0638\u0629 \u0628\u0623\u0645\u0627\u0646. \u0644\u0627 \u064a\u064f\u062f\u0641\u0639 \u0644\u0644\u0628\u0627\u0626\u0639 \u0625\u0644\u0627 \u0628\u0639\u062f \u0623\u0646 \u062a\u0624\u0643\u062f \u0627\u0633\u062a\u0644\u0627\u0645 \u0637\u0644\u0628\u0643. \u0625\u0630\u0627 \u0643\u0627\u0646\u062a \u0647\u0646\u0627\u0643 \u0645\u0634\u0643\u0644\u0629\u060c \u0623\u0628\u0644\u063a \u0639\u0646\u0647\u0627 \u0648\u0633\u064a\u0631\u0627\u062c\u0639\u0647\u0627 \u0628\u0627\u0645\u0628\u064a\u0647 \u062e\u0644\u0627\u0644 72 \u0633\u0627\u0639\u0629.",
  },
  ff: {
    title: "A JAARAMA HUUTORDE BAMBEH SECURED PAY",
    body: "Kaalis maa ina reenaa. Jeeyoowo yo\u0253etee tan so a tee\u014btinii wonde a he\u0253ii ko sood\u0257aa. So ca\u0257eele ngoni, hollu \u0257um, Bambeh \u01b4eewto e nder waktuuji 72.",
  },
};

export default function SecuredPayNote({ className = '' }: { className?: string }) {
  const lang = normLang(useLang());
  const t = TEXT[lang];
  return (
    <div role="note" dir={lang === 'ar' ? 'rtl' : 'ltr'} data-fix="FIX684"
      className={'mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 ' + className}>
      <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide">
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{t.title}</span>
      </div>
      <p className="mt-1 text-xs leading-5">{t.body}</p>
    </div>
  );
}
// BAMBEH_END_TOKEN__SECURED_PAY_NOTE_FIX684__COMPLETE

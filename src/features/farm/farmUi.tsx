// BAMBEH_DEPLOY_TOKEN__FARMUI_FIX865_CLEAN
// FILE LOCATION: src/features/farm/farmUi.tsx
//
// FIX865 - the pieces both Farm Fresh pages draw: the market price tag, the photo (and the picture of a product that
// has no photo yet), the farmer's stars. Colours are the app's theme classes (teal, amber, gray): no colour is
// written here, so the coming Bambeh palette reaches these pages with one theme change.
// (c) 2026 BAMBEH SARL. All rights reserved.
import { useState } from 'react';
import { Sprout, Star } from 'lucide-react';
import { categoryLabel, fcfa, unitLabel } from '@/features/farm/farmText';
import type { FarmLang } from '@/features/farm/farmText';

/** The market price tag on a photo: an amber label with its punched hole. */
export function PriceTag({ price, unit, lang, big = false }: { price: number | null; unit: string; lang: FarmLang; big?: boolean }) {
  if (price === null) return null;
  return (
    <span
      className={'inline-flex items-center gap-1.5 rounded-md bg-amber-400 font-extrabold text-gray-900 shadow-sm tabular-nums '
        + (big ? 'py-1.5 ps-2 pe-3 text-xl' : 'py-1 ps-1.5 pe-2.5 text-[13px]')}
      data-price={price}
      dir="ltr"
    >
      <span aria-hidden="true" className={(big ? 'h-2 w-2' : 'h-1.5 w-1.5') + ' rounded-full bg-gray-50'} />
      {fcfa(price)}
      <span className={(big ? 'text-sm' : 'text-[11px]') + ' font-semibold opacity-75'}>/ {unitLabel(unit, lang)}</span>
    </span>
  );
}

/** A product without a photo still looks like produce. */
export function NoPhoto({ category, lang }: { category: string; lang: FarmLang }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-teal-50 text-teal-800" data-no-photo="1">
      <Sprout className="h-9 w-9" aria-hidden="true" />
      <span className="text-[11px] font-semibold">{categoryLabel(category, lang)}</span>
    </div>
  );
}

/** The photo, or the no-photo picture when there is none or it cannot load (a broken link never shows). */
export function FarmPhoto({ src, alt, category, lang, eager = false }: {
  src: string | null; alt: string; category: string; lang: FarmLang; eager?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <NoPhoto category={category} lang={lang} />;
  return (
    <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover"
         onError={() => setBroken(true)} />
  );
}

/** The farmer's stars. Rounded as everywhere in Bambeh (FIX326): .5 and above goes up, below goes down. */
export function Stars({ avg, count }: { avg: number; count: number }) {
  const full = Math.max(0, Math.min(5, Math.floor(avg + 0.5)));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={full + ' / 5'} data-stars={full} data-ratings={count}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden="true" className={'h-3.5 w-3.5 ' + (n <= full ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
      ))}
      <span className="ms-1 text-[11px] text-gray-500" dir="ltr">({count})</span>
    </span>
  );
}
// BAMBEH_END_TOKEN__FARMUI_FIX865__COMPLETE

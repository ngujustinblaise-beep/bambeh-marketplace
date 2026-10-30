// BAMBEH_DEPLOY_TOKEN__GAS_TODAY_FIX935_CLEAN
/**
 * src/features/foodgas/GasToday.tsx - FIX935 (new)
 *
 * THE EASY GAS SWITCH. Big, 29 Oct 2026: "to make ux easy and ease use, can we make an easy toggle in the gas
 * section to select if the gas is available or not".
 *
 *   - GasTodayCard: at the top of Cooking gas (/food-gas/gas), for a member who runs a gas depot (or the agent who
 *     added it): one big switch "Gas available today" per depot, and a small switch per bottle. No more going to
 *     My businesses first.
 *   - GasTodayPanel: the same switches, also used on My businesses and on the depot's own page.
 *   - The switch shows the truth for TODAY: green = gas today, red = no gas today, grey = not said yet today (the
 *     buyers' badge says "Gas not confirmed today" until the owner taps). With the time it was last changed.
 *   - The database is unchanged: the same two calls as before (bambeh_food_set_gas, bambeh_food_gas_stock -
 *     FIX687/FIX697), which check the member may change this depot.
 *
 * Five languages (the gas section's own words, plus three new ones here). Every non-ASCII character is a \u escape.
 *
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { brandLabel, doualaNow, fmtSince, reasonText, sizeText, useFoodText } from './foodGasText';
import type { FoodLang } from './foodGasText';
import { myPlaces, setGas, setOfferStock } from './foodGasApi';
import type { GasOffer, MyPlace } from './foodGasApi';

const MORE: Record<FoodLang, { cardTitle: string; tapOn: string; noBottleOn: string }> = {
  en: {
    cardTitle: 'Your gas depot',
    tapOn: 'Tap the switch when you have gas today - buyers see it at once.',
    noBottleOn: 'No bottle is switched on: switch on the ones you have.',
  },
  fr: {
    cardTitle: 'Votre d\u00e9p\u00f4t de gaz',
    tapOn: 'Touchez l\u2019interrupteur quand vous avez du gaz aujourd\u2019hui - les clients le voient tout de suite.',
    noBottleOn: 'Aucune bouteille n\u2019est activ\u00e9e : activez celles que vous avez.',
  },
  pidgin: {
    cardTitle: 'Your gas depot',
    tapOn: 'Touch the switch when gas dey today - buyers go see am one time.',
    noBottleOn: 'No bottle dey on: on the ones wey you get.',
  },
  ar: {
    cardTitle: '\u0645\u0633\u062a\u0648\u062f\u0639 \u063a\u0627\u0632\u0643',
    tapOn: '\u0627\u0644\u0645\u0633 \u0627\u0644\u0645\u0641\u062a\u0627\u062d \u0639\u0646\u062f\u0645\u0627 \u064a\u062a\u0648\u0641\u0631 \u0627\u0644\u063a\u0627\u0632 \u0644\u062f\u064a\u0643 \u0627\u0644\u064a\u0648\u0645 - \u064a\u0631\u0627\u0647 \u0627\u0644\u0645\u0634\u062a\u0631\u0648\u0646 \u0641\u0648\u0631\u064b\u0627.',
    noBottleOn: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0642\u0627\u0631\u0648\u0631\u0629 \u0645\u0641\u0639\u0651\u0644\u0629: \u0641\u0639\u0651\u0644 \u0627\u0644\u0642\u0648\u0627\u0631\u064a\u0631 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629 \u0644\u062f\u064a\u0643.',
  },
  ff: {
    cardTitle: 'Depoo gaas maa',
    tapOn: 'Meemu \u0257oo so a woodi gaas hannde - soodoo\u0253e ma njiy \u0257um jooni.',
    noBottleOn: 'Alaa bouteille woodi: meemu \u0257e njogi\u0257aa.',
  },
};

export interface GasPlaceState { id: string; name?: string; gas_today: boolean; gas_checked_at: string | null; offers: GasOffer[] }
export interface GasChange { gas_available: boolean; gas_today: boolean; gas_checked_at: string | null; offers: GasOffer[] }

/** The track and knob of an on/off switch: 56 x 32, green / red / grey. The whole row around it is the button. */
function Knob({ on, tone, busy }: { on: boolean; tone: 'green' | 'red' | 'grey'; busy: boolean }) {
  const track = tone === 'green' ? 'bg-green-600' : tone === 'red' ? 'bg-red-500' : 'bg-gray-300';
  return (
    <span aria-hidden="true" className={'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ' + track}>
      <span className={'inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ' + (on ? 'translate-x-7 rtl:-translate-x-7' : 'translate-x-1 rtl:-translate-x-1')} />
      {busy && <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-white" />}
    </span>
  );
}

export function GasTodayPanel({ place, onChange, withBottles = true, showName = false }: {
  place: GasPlaceState; onChange: (c: GasChange) => void; withBottles?: boolean; showName?: boolean;
}) {
  const { lang, t } = useFoodText();
  const m = MORE[lang];
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const answeredToday = !!place.gas_checked_at && doualaNow(new Date(place.gas_checked_at)).ymd === doualaNow().ymd;
  const state: 'on' | 'off' | 'unknown' = place.gas_today ? 'on' : answeredToday ? 'off' : 'unknown';
  const offers = place.offers || [];
  const anyBottle = offers.some((o) => o.in_stock);

  const master = async (v: boolean) => {
    if (busy) return;
    setBusy(place.id);
    setErr('');
    const r = await setGas(place.id, v);
    setBusy('');
    if (!r.ok) { setErr(reasonText(lang, r.reason)); return; }
    onChange({ gas_available: r.gas_available, gas_today: r.gas_available, gas_checked_at: r.gas_checked_at, offers });
  };
  const bottle = async (o: GasOffer) => {
    if (busy) return;
    setBusy(o.id);
    setErr('');
    const r = await setOfferStock(o.id, !o.in_stock);
    setBusy('');
    if (!r.ok) { setErr(reasonText(lang, r.reason)); return; }
    onChange({
      gas_available: r.gas_available, gas_today: r.gas_available, gas_checked_at: r.gas_checked_at,
      offers: offers.map((x) => (x.id === o.id ? { ...x, in_stock: r.in_stock } : x)),
    });
  };

  const words = state === 'on' ? t('gasYes') : state === 'off' ? t('gasNo') : t('gasUnknown');
  return (
    <div className="rounded-2xl border border-orange-200 bg-white p-3" data-gas-panel={place.id} data-gas-state={state}>
      {showName && place.name && <p className="mb-2 text-sm font-extrabold text-gray-900">{place.name}</p>}
      {/* the whole row is the switch: an easy target for a thumb */}
      <button type="button" role="switch" aria-checked={state === 'on'} disabled={!!busy} onClick={() => void master(state !== 'on')}
        data-gas-switch={place.id} className="flex w-full items-center gap-3 rounded-xl text-start disabled:opacity-70">
        <Knob on={state === 'on'} tone={state === 'on' ? 'green' : state === 'off' ? 'red' : 'grey'} busy={busy === place.id} />
        <span className="min-w-0 flex-1">
          <span className={'block text-base font-extrabold ' + (state === 'on' ? 'text-green-700' : state === 'off' ? 'text-red-700' : 'text-gray-700')}>{words}</span>
          {place.gas_checked_at
            ? <span className="block text-xs text-gray-600" data-gas-updated="1">{t('gasUpdated', { t: fmtSince(place.gas_checked_at, lang) })}</span>
            : null}
        </span>
      </button>
      {state === 'unknown' && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-gray-600">{m.tapOn}</p>
          <button type="button" disabled={!!busy} onClick={() => void master(false)} data-gas-none={place.id}
            className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700 disabled:opacity-60">{t('gasSwitchNo')}</button>
        </div>
      )}
      {withBottles && offers.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2" data-gas-bottles={place.id}>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">{t('stockToday')}</p>
          <ul className="space-y-1.5">
            {offers.map((o) => (
              <li key={o.id}>
                <button type="button" role="switch" aria-checked={o.in_stock} disabled={!!busy} onClick={() => void bottle(o)} data-stock={o.id}
                  className="flex w-full items-center gap-3 rounded-xl text-start disabled:opacity-70">
                  <Knob on={o.in_stock} tone={o.in_stock ? 'green' : 'grey'} busy={busy === o.id} />
                  <span className="min-w-0 flex-1 text-sm font-bold text-gray-900">
                    {brandLabel(o.brand, o.brand_other)} <span className="font-semibold text-gray-600">{sizeText(lang, o.size_kg)}</span>
                  </span>
                  <span className={'shrink-0 text-xs font-bold ' + (o.in_stock ? 'text-green-700' : 'text-gray-500')}>{o.in_stock ? t('inStock') : t('outStock')}</span>
                </button>
              </li>
            ))}
          </ul>
          {state === 'on' && !anyBottle && <p className="mt-2 text-xs font-semibold text-amber-800" data-gas-nobottle="1">{m.noBottleOn}</p>}
        </div>
      )}
      {err && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{err}</p>}
    </div>
  );
}

/** At the top of Cooking gas: the depots this member runs (or added as an agent). Nothing for anyone else. */
export default function GasTodayCard({ onChanged }: { onChanged?: () => void }) {
  const { user } = useAuth();
  const { lang, dir, t } = useFoodText();
  const navigate = useNavigate();
  const m = MORE[lang];
  const [rows, setRows] = useState<MyPlace[]>([]);

  const load = useCallback(async () => {
    const r = await myPlaces();
    if (r.ok) setRows(r.rows.filter((p) => p.kinds.indexOf('gas') >= 0 && (p.status === 'live' || p.status === 'pending')));
  }, []);
  const uid = user && user.id ? String(user.id) : '';
  useEffect(() => {
    if (!uid) { setRows([]); return; }
    void load();
  }, [uid, load]);

  if (!uid || rows.length === 0) return null;
  return (
    <section dir={dir} data-fix="FIX935" data-gas-card="1" className="mt-3 rounded-2xl border-2 border-orange-300 bg-orange-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-extrabold text-orange-900"><Flame className="h-4 w-4 text-red-600" />{m.cardTitle}</p>
        <button type="button" onClick={() => navigate('/food-gas/mine')} className="text-xs font-bold text-orange-800 underline">{t('myBusinesses')}</button>
      </div>
      <div className="space-y-2">
        {rows.map((p) => (
          <div key={p.id}>
            <GasTodayPanel showName
              place={{ id: p.id, name: p.name, gas_today: p.gas_today, gas_checked_at: p.gas_checked_at, offers: p.gas_offers || [] }}
              onChange={(c) => {
                setRows((prev) => prev.map((x) => (x.id === p.id
                  ? { ...x, gas_available: c.gas_available, gas_today: c.gas_today, gas_checked_at: c.gas_checked_at, gas_offers: c.offers }
                  : x)));
                if (onChanged) onChanged();
              }} />
            {(p.gas_offers || []).length === 0 && (
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 px-1">
                <p className="text-xs text-gray-700">{t('noGasLines')}</p>
                <button type="button" onClick={() => navigate('/food-gas/edit/' + p.id + '#gas')}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white">
                  <Flame className="h-3.5 w-3.5" />{t('listGas')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
// BAMBEH_END_TOKEN__GAS_TODAY_FIX935__COMPLETE

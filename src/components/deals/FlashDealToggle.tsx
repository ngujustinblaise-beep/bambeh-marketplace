// BAMBEH_DEPLOY_TOKEN__FLASHDEALTOGGLE_FIX184_START
/**
 * FlashDealToggle — FIX184
 * FILE LOCATION: src/components/deals/FlashDealToggle.tsx
 *
 * Drop-in "Sell this as a Flash Deal" control for ANY posting page
 * (SellVehicle, marketplace post, ListProperty). Marketplace items,
 * vehicles and houses all insert into `listings`, so one component covers
 * all three.
 *
 * Requires fix184_flash_deals.sql (adds flash_deals.listing_id + RLS +
 * server-side stock control).
 *
 * ── HOW TO WIRE IT INTO A POSTING PAGE ──────────────────────────────────
 *   import FlashDealToggle, {
 *     emptyFlashDeal, createFlashDealForListing, type FlashDealConfig,
 *   } from '@/components/deals/FlashDealToggle';
 *
 *   const [deal, setDeal] = useState<FlashDealConfig>(emptyFlashDeal);
 *
 *   // in the form, after the price field:
 *   <FlashDealToggle originalPrice={Number(form.price) || 0}
 *                    value={deal} onChange={setDeal} lang={lang} />
 *
 *   // after the listing insert succeeds:
 *   if (deal.enabled) {
 *     await createFlashDealForListing({
 *       listingId: data.id,
 *       title: form.title.trim(),
 *       description: form.description.trim(),
 *       category: form.category,
 *       imageUrl: imageUrls[0] ?? null,
 *       originalPrice: Number(form.price) || 0,
 *       config: deal,
 *       user,
 *       sellerPhone: form.phone.trim(),
 *     });
 *   }
 * ─────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/* ========================================================================
   Types
   ======================================================================== */

export type FlashDealConfig = {
  enabled: boolean;
  dealPrice: string;      // kept as string so the input stays controlled
  durationHours: number;
  stock: string;
};

export const emptyFlashDeal: FlashDealConfig = {
  enabled: false,
  dealPrice: '',
  durationHours: 24,
  stock: '',
};

type Lang = 'en' | 'fr';

const COPY: Record<Lang, Record<string, string>> = {
  en: {
    label: 'Sell this as a Flash Deal',
    blurb: 'Flash Deals appear in the Flash Deals section with a countdown. Buyers see the discount and can claim before it runs out.',
    dealPrice: 'Flash Deal price (FCFA)',
    duration: 'Runs for',
    stock: 'How many available',
    stockHint: 'Leave empty for unlimited',
    h6: '6 hours', h12: '12 hours', h24: '24 hours', h48: '2 days', h72: '3 days', h168: '7 days',
    off: 'off',
    needPrice: 'Set your normal price first.',
    mustBeLower: 'The deal price must be lower than the normal price.',
    saves: 'Buyers save',
  },
  fr: {
    label: 'Vendre en Vente Flash',
    blurb: "Les Ventes Flash apparaissent dans la section Ventes Flash avec un compte à rebours. Les acheteurs voient la réduction et peuvent réclamer avant la fin.",
    dealPrice: 'Prix Vente Flash (FCFA)',
    duration: 'Durée',
    stock: 'Quantité disponible',
    stockHint: 'Laissez vide pour illimité',
    h6: '6 heures', h12: '12 heures', h24: '24 heures', h48: '2 jours', h72: '3 jours', h168: '7 jours',
    off: 'de réduction',
    needPrice: "Indiquez d'abord votre prix normal.",
    mustBeLower: 'Le prix de la vente flash doit être inférieur au prix normal.',
    saves: 'Économie',
  },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 }).format(n);

/* ========================================================================
   Component
   ======================================================================== */

export default function FlashDealToggle({
  originalPrice,
  value,
  onChange,
  lang = 'en',
}: {
  originalPrice: number;
  value: FlashDealConfig;
  onChange: (next: FlashDealConfig) => void;
  lang?: string;
}) {
  const c = COPY[lang === 'fr' ? 'fr' : 'en'];
  const set = <K extends keyof FlashDealConfig>(k: K, v: FlashDealConfig[K]) =>
    onChange({ ...value, [k]: v });

  const deal = Number(String(value.dealPrice).replace(/\D/g, '')) || 0;
  const hasBase = originalPrice > 0;
  const tooHigh = hasBase && deal > 0 && deal >= originalPrice;
  const discount =
    hasBase && deal > 0 && deal < originalPrice
      ? Math.round(((originalPrice - deal) / originalPrice) * 100)
      : 0;

  const durations: Array<[number, string]> = [
    [6, c.h6], [12, c.h12], [24, c.h24], [48, c.h48], [72, c.h72], [168, c.h168],
  ];

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => set('enabled', e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 rounded accent-red-600"
        />
        <span className="flex-1">
          <span className="flex items-center gap-1.5 font-semibold text-gray-900">
            <Zap className="h-4 w-4 text-red-600" />
            {c.label}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-gray-600">
            {c.blurb}
          </span>
        </span>
      </label>

      {value.enabled && (
        <div className="mt-4 space-y-3 border-t border-orange-200 pt-4">
          {!hasBase && (
            <p className="flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0" /> {c.needPrice}
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {c.dealPrice}
            </label>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={value.dealPrice}
              onChange={(e) => set('dealPrice', e.target.value)}
              placeholder={hasBase ? String(Math.round(originalPrice * 0.8)) : '0'}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
            {tooHigh && (
              <p className="mt-1 text-xs font-medium text-red-600">{c.mustBeLower}</p>
            )}
            {discount > 0 && (
              <p className="mt-1 text-xs font-semibold text-green-700">
                −{discount}% {c.off} · {c.saves} {fmt(originalPrice - deal)} FCFA
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {c.duration}
            </label>
            <div className="flex flex-wrap gap-2">
              {durations.map(([h, label]) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => set('durationHours', h)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                    value.durationHours === h
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {c.stock}
            </label>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={value.stock}
              onChange={(e) => set('stock', e.target.value)}
              placeholder={c.stockHint}
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================
   Helper — call this AFTER the listing insert succeeds
   ======================================================================== */

export type CreateFlashDealArgs = {
  listingId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  originalPrice: number;
  config: FlashDealConfig;
  user: { id: string; email?: string | null; user_metadata?: Record<string, any> } | null;
  sellerPhone?: string | null;
};

/**
 * Creates the flash_deals row for a listing that was just posted.
 * Throws on failure so the caller can surface a real message — the deal is
 * never silently dropped.
 */
export async function createFlashDealForListing(
  args: CreateFlashDealArgs
): Promise<string | null> {
  const { listingId, config, originalPrice, user } = args;
  if (!config.enabled || !user) return null;

  const dealPrice = Number(String(config.dealPrice).replace(/\D/g, '')) || 0;
  if (dealPrice <= 0 || (originalPrice > 0 && dealPrice >= originalPrice)) {
    throw new Error('The Flash Deal price must be lower than the normal price.');
  }

  const stock = Number(String(config.stock).replace(/\D/g, '')) || 0;
  const hours = config.durationHours > 0 ? config.durationHours : 24;
  const now = new Date();
  const endsAt = new Date(now.getTime() + hours * 3_600_000);

  const discountPercent =
    originalPrice > 0
      ? Math.round(((originalPrice - dealPrice) / originalPrice) * 100)
      : null;

  const sellerName =
    (user.user_metadata?.full_name as string) || user.email || null;

  const { data, error } = await supabase
    .from('flash_deals')
    .insert({
      listing_id:       listingId,
      seller_id:        user.id,
      vendor_id:        user.id,
      vendor_name:      sellerName,
      vendor_phone:     args.sellerPhone ?? null,
      title:            args.title,
      description:      args.description ?? null,
      category:         args.category ?? null,
      image_url:        args.imageUrl ?? null,
      original_price:   originalPrice || null,
      deal_price:       dealPrice,
      discount_percent: discountPercent,
      currency:         'XAF',
      stock_total:      stock > 0 ? stock : null,
      stock_remaining:  stock > 0 ? stock : null,
      max_quantity:     stock > 0 ? stock : null,
      sold_count:       0,
      starts_at:        now.toISOString(),
      ends_at:          endsAt.toISOString(),
      is_active:        true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data?.id ?? null;
}

/* ========================================================================
   Helper — buyer messages the seller about a deal
   Uses the existing conversations/messages tables. Returns the
   conversation id so the caller can navigate to the chat screen.
   ======================================================================== */

export async function startDealConversation(deal: {
  id: string;
  listing_id?: string | null;
  title: string;
  image_url?: string | null;
  seller_id?: string | null;
  vendor_id?: string | null;
}): Promise<string | null> {
  const { data: auth } = await supabase.auth.getSession();
  const me = auth?.session?.user?.id;
  const sellerId = deal.seller_id ?? deal.vendor_id ?? null;

  if (!me) throw new Error('Please log in to message the seller.');
  if (!sellerId) throw new Error('This deal has no seller attached.');
  if (sellerId === me) throw new Error('This is your own deal.');

  // Reuse an existing thread for this deal if there is one.
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('product_id', deal.id)
    .eq('buyer_id', me)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const opener = `Hi, I'm interested in your Flash Deal: ${deal.title}`;
  const nowIso = new Date().toISOString();

  const { data: convo, error: convoErr } = await supabase
    .from('conversations')
    .insert({
      product_id:      deal.id,
      listing_id:      deal.listing_id ?? null,
      buyer_id:        me,
      seller_id:       sellerId,
      participant_ids: [me, sellerId],
      listing_title:   deal.title,
      listing_image:   deal.image_url ?? null,
      last_message:    opener,
      last_message_at: nowIso,
    })
    .select('id')
    .single();

  if (convoErr) throw convoErr;

  const { error: msgErr } = await supabase.from('messages').insert({
    conversation_id: convo.id,
    sender_id:       me,
    content:         opener,
    message_type:    'text',
    read:            false,
  });
  if (msgErr) throw msgErr;

  // Best-effort seller notification — never blocks the conversation.
  try {
    await supabase.from('notifications').insert({
      user_id:    sellerId,
      title:      'New Flash Deal enquiry',
      body:       opener,
      type:       'message',
      data:       { deal_id: deal.id, conversation_id: convo.id },
      is_read:    false,
    });
  } catch { /* notification is best-effort */ }

  return convo.id;
}
// BAMBEH_DEPLOY_TOKEN__FLASHDEALTOGGLE_FIX184_END

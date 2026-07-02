import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, CalendarDays, Clock3, Phone, MessageSquareText, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/App';
import { sendBookingMessage } from '@/utils/SendBookingMessage';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id?: string;
    title?: string;
    provider_id?: string;
    user_id?: string;
    owner_id?: string;
    creator_id?: string;
    listing_title?: string;
    listingImage?: string;
    listing_image?: string;
    name?: string;
  };
  onSuccess?: () => void | Promise<void>;
};

const input =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10';

export default function BookServiceModal({ isOpen, onClose, listing, onSuccess }: Props) {
  const { t, isRtl } = useLanguage();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const firstRef = useRef<HTMLInputElement | null>(null);

  const ownerId = listing.provider_id || listing.user_id || listing.owner_id || listing.creator_id || '';
  const adTitle = listing.title || listing.listing_title || listing.name || 'Service';

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    setTimeout(() => firstRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const canSubmit = useMemo(() => !!date && !!time && !!ownerId && !loading, [date, time, ownerId, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await sendBookingMessage({
        adCreatorId: ownerId,
        adTitle,
        bookingType: 'service',
        date,
        time,
        visitorNote: note,
        visitorPhone: phone,
      });
      await onSuccess?.();
      onClose();
      setDate('');
      setTime('');
      setPhone('');
      setNote('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="relative w-full overflow-hidden rounded-t-3xl bg-slate-50 shadow-2xl ring-1 ring-black/5 sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-start justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white">
          <div className="pr-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {t('book.service.badge')}
            </div>
            <h2 className="mt-3 text-xl font-bold leading-tight">{t('book.service.title')}</h2>
            <p className="mt-1 text-sm text-indigo-50">{adTitle}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition hover:bg-white/15" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t('book.date')}</span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input ref={firstRef} type="date" value={date} onChange={e => setDate(e.target.value)} className={`${input} pl-11`} />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">{t('book.time')}</span>
              <div className="relative">
                <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`${input} pl-11`} />
              </div>
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t('book.phone')}</span>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('book.phonePlaceholder')} className={`${input} pl-11`} />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t('book.note')}</span>
            <div className="relative">
              <MessageSquareText className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder={t('book.notePlaceholder')} className={`${input} min-h-28 pl-11 pt-3`} />
            </div>
          </label>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">{t('common.cancel')}</button>
            <button type="submit" disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"><Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : 'hidden'}`} />{loading ? t('common.sending') : t('book.service.submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


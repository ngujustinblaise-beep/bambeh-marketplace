/**
 * src/components/services/BookServiceModal.tsx â€” Bambeh Marketplace
 *
 * CHANGES IN THIS VERSION:
 * âœ… AfricanPhoneInput added for visitor callback number (Cameroon default,
 *    full Central + West Africa country picker)
 * âœ… sendBookingMessage called after Supabase insert â€” sends a non-repliable
 *    in-app message to the service provider so they see a booking card in Chat.
 *    The client never needs to see or dial the provider's number directly.
 *
 * SQL to create table (run once in Supabase SQL editor):
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * create table if not exists service_bookings (
 *   id           uuid primary key default gen_random_uuid(),
 *   service_id   text not null,
 *   client_id    uuid not null references auth.users(id),
 *   provider_id  uuid,
 *   booking_date date not null,
 *   booking_time text not null,
 *   message      text,
 *   client_phone text,
 *   status       text not null default 'pending',
 *   created_at   timestamptz not null default now()
 * );
 * alter table service_bookings enable row level security;
 * create policy "clients can insert own bookings"
 *   on service_bookings for insert with check (auth.uid() = client_id);
 * create policy "clients can view own bookings"
 *   on service_bookings for select using (auth.uid() = client_id or auth.uid() = provider_id);
 */

import { useState } from 'react';
import { X, CalendarDays, Clock, MessageCircle, CheckCircle, Loader2, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AfricanPhoneInput from '@/components/AfricanPhoneInput';
import { sendBookingMessage } from '@/utils/sendBookingMessage';

interface Props {
  serviceId:    string;
  serviceTitle: string;
  providerId?:  string;
  providerName: string;
  isOpen:       boolean;
  onClose:      () => void;
}

// Build next 60 days as date options
function buildDateOptions(): { label: string; value: string }[] {
  const options: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= 60; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const label = d.toLocaleDateString('en-CM', {
      weekday: 'short', day: 'numeric', month: 'long',
    });
    options.push({ label, value });
  }
  return options;
}

const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00',
];

function fmt12(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour   = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export default function BookServiceModal({
  serviceId, serviceTitle, providerId, providerName, isOpen, onClose,
}: Props) {
  const [date,         setDate]         = useState('');
  const [time,         setTime]         = useState('');
  const [message,      setMessage]      = useState('');
  const [clientPhone,  setClientPhone]  = useState('');
  const [phoneValid,   setPhoneValid]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const dateOptions = buildDateOptions();

  async function handleBook() {
    if (!date) { setError('Please select a date.'); return; }
    if (!time) { setError('Please select a time.'); return; }
    if (clientPhone && !phoneValid) {
      setError('Please enter a valid phone number.'); return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError('You must be logged in to book a service.');
        setLoading(false);
        return;
      }

      // 1Ã¯Â¸Ââƒ£ Write to service_bookings table
      const { error: dbErr } = await supabase.from('service_bookings').insert({
        service_id:   serviceId,
        client_id:    session.user.id,
        provider_id:  providerId ?? null,
        booking_date: date,
        booking_time: time,
        message:      message.trim() || null,
        client_phone: clientPhone    || null,
        status:       'pending',
      });

      if (dbErr) throw dbErr;

      // 2Ã¯Â¸Ââƒ£ Send non-repliable in-app booking message to the service provider
      //    Provider sees a formatted booking card in Chat â€” no contact exposure needed.
      if (providerId) {
        await sendBookingMessage({
          adCreatorId:  providerId,
          adTitle:      serviceTitle,
          bookingType:  'service',
          date,
          time,
          visitorNote:  message.trim()  || undefined,
          visitorPhone: clientPhone     || undefined,
        });
      }

      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Could not complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setDate(''); setTime(''); setMessage('');
    setClientPhone(''); setPhoneValid(false);
    setDone(false); setError(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog" aria-modal="true" aria-label="Book service"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Book This Service</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[240px]">{serviceTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
              <CheckCircle className="w-9 h-9 text-teal-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Booking Requested!</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Your booking request has been sent to <strong>{providerName}</strong>.
              They will contact you to confirm.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full bg-teal-600 text-white py-3 rounded-2xl font-semibold text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5 max-h-[80vh] overflow-y-auto">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <CalendarDays className="w-4 h-4 text-teal-600" /> Select Date
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {dateOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDate(opt.value)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-all
                      ${date === opt.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                        : 'border-gray-200 text-gray-700 hover:border-teal-300'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 text-teal-600" /> Select Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`py-2.5 rounded-xl border text-xs font-medium transition-all
                      ${time === slot
                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                        : 'border-gray-200 text-gray-700 hover:border-teal-300'
                      }`}
                  >
                    {fmt12(slot)}
                  </button>
                ))}
              </div>
            </div>

            {/* â”€â”€ AfricanPhoneInput â€” client's callback number â”€â”€ */}
            <div>
              <AfricanPhoneInput
                label="Your contact number"
                value={clientPhone}
                onChange={(full, valid) => { setClientPhone(full); setPhoneValid(valid); }}
              />
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                So the provider can reach you to confirm. Tap the flag to change country.
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 text-teal-600" />
                Message to Provider
                <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={`e.g. "I need help with a leaky pipe in my bathroom. The building is 3 floors with no elevator."`}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* Summary */}
            {(date || time) && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-2">Booking Summary</p>
                {date && <p>ðŸ“… {dateOptions.find(d => d.value === date)?.label}</p>}
                {time && <p>ðŸ• {fmt12(time)}</p>}
                <p>ðŸ‘¤ Provider: {providerName}</p>
                {clientPhone && <p>ðŸ“ž Your number: {clientPhone}</p>}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleBook}
              disabled={loading || !date || !time || (!!clientPhone && !phoneValid)}
              className="w-full bg-teal-600 text-white py-3.5 rounded-2xl font-bold text-sm
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2
                hover:bg-teal-700 active:scale-[0.98] transition-all"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>
                : 'ðŸ“… Confirm Booking Request'
              }
            </button>

            <p className="text-center text-xs text-gray-400">
              The provider will confirm your booking via message or call.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}







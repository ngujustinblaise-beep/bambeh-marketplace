import { supabase } from '@/lib/supabase';
import { startChat } from '@/pages/Chat';

export type BookingType = 'visit' | 'test_ride' | 'service';

export interface BookingMessageParams {
  adCreatorId: string;
  adTitle: string;
  bookingType: BookingType;
  date: string;
  time: string;
  visitorNote?: string;
  visitorPhone?: string;
}

const LABEL: Record<BookingType, string> = {
  visit: '📍 Visit Request',
  test_ride: '🚗 Test Ride Request',
  service: '🛠️ Service Booking Request',
};

function formatDisplayDate(date: string): string {
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-CM', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

function formatDisplayTime(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;

  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

export async function sendBookingMessage(params: BookingMessageParams): Promise<void> {
  const { adCreatorId, adTitle, bookingType, date, time, visitorNote, visitorPhone } = params;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[sendBookingMessage] auth session error:', error);
    return;
  }

  const visitorId = data.session?.user?.id;
  if (!visitorId || !adCreatorId) return;

  const displayDate = formatDisplayDate(date);
  const displayTime = formatDisplayTime(time);

  const lines: string[] = [
    LABEL[bookingType],
    `Listing: ${adTitle}`,
    `Date: ${displayDate}`,
    `Time: ${displayTime}`,
  ];

  if (visitorPhone?.trim()) lines.push(`Callback number: ${visitorPhone.trim()}`);
  if (visitorNote?.trim()) lines.push(`Note: ${visitorNote.trim()}`);

  const content = lines.join('\n');

  try {
    const conversationId = await startChat(visitorId, adCreatorId, adTitle);

    const { error: insertError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: visitorId,
      content,
      message_type: 'text',
      is_booking_message: true,
      read_by: [visitorId],
    });

    if (insertError) {
      throw insertError;
    }
  } catch (err) {
    console.warn('[sendBookingMessage] failed to send in-app message:', err);
  }
}
/**
 * src/utils/sendBookingMessage.ts � Bambeh Marketplace
 *
 * Shared helper called by all three booking modals:
 *   - BookVisitModal    (Rentals)   ? bookingType: 'visit'
 *   - BookServiceModal  (Services)  ? bookingType: 'service'
 *   - BookTestDrive     (Vehicles)  ? bookingType: 'test_ride'
 *
 * What it does:
 *   1. Creates or finds an existing conversation between the visitor and the ad creator.
 *   2. Inserts one message flagged `is_booking_message = true`.
 *   3. The ad creator sees a formatted notification card in Chat.
 *   4. The reply input is hidden for that message � the conversation is one-way.
 *
 * The visitor never needs to see or dial the host's contact number �
 * the form data (date, time, note, callback number) is bundled into the message.
 *
 * Prerequisites:
 *   Run this SQL once in Supabase SQL editor:
 *
 *   ALTER TABLE messages
 *     ADD COLUMN IF NOT EXISTS is_booking_message boolean NOT NULL DEFAULT false;
 *
 *   CREATE INDEX IF NOT EXISTS idx_messages_is_booking
 *     ON messages (is_booking_message)
 *     WHERE is_booking_message = true;
 */

import { supabase } from '@/lib/supabase';
import { startChat } from '@/pages/Chat';

export type BookingType = 'visit' | 'test_ride' | 'service';

export interface BookingMessageParams {
  adCreatorId:   string;        // the ad host's user ID
  adTitle:       string;        // listing title shown in the card
  bookingType:   BookingType;
  date:          string;        // YYYY-MM-DD
  time:          string;        // HH:MM
  visitorNote?:  string;        // optional message from the visitor
  visitorPhone?: string;        // callback number (full international, e.g. +237671234567)
}

/** Human-readable labels */
const LABEL: Record<BookingType, string> = {
  visit:     '?? Visit Request',
  test_ride: '?? Test Ride Request',
  service:   '?? Service Booking Request',
};

/**
 * Sends a one-way in-app booking notification to the ad creator.
 * Safe to call even if the user is not logged in � returns silently.
 */
export async function sendBookingMessage(params: BookingMessageParams): Promise<void> {
  const {
    adCreatorId, adTitle, bookingType,
    date, time, visitorNote, visitorPhone,
  } = params;

  const { data: { session } } = await supabase.auth.getSession();
  const visitorId = session?.user?.id;

  // Can't send a message without a logged-in visitor or a known host
  if (!visitorId || !adCreatorId) return;

  // Format date for display: e.g. "Wednesday, 14 January 2026"
  const displayDate = (() => {
    try {
      return new Date(date + 'T00:00').toLocaleDateString('en-CM', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
    } catch {
      return date;
    }
  })();

  // Format time for display: e.g. "10:00 AM"
  const displayTime = (() => {
    try {
      const [h, m] = time.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${period}`;
    } catch {
      return time;
    }
  })();

  // Build the message body � the host sees everything they need
  const lines: string[] = [
    LABEL[bookingType],
    `Listing: ${adTitle}`,
    `Date: ${displayDate}`,
    `Time: ${displayTime}`,
  ];
  if (visitorPhone) lines.push(`Callback number: ${visitorPhone}`);
  if (visitorNote)  lines.push(`Note: ${visitorNote}`);

  const content = lines.join('\n');

  try {
    // Create or reuse a conversation between visitor and host
    const conversationId = await startChat(
      visitorId,
      adCreatorId,
      adTitle,
    );

    // Insert the booking message � flagged so Chat.tsx renders it as a card
    // and hides the reply input
    await supabase.from('messages').insert({
      conversation_id:    conversationId,
      sender_id:          visitorId,
      content,
      message_type:       'text',
      is_booking_message: true,
      read_by:            [visitorId],
    });
  } catch (err) {
    // Log but don't crash the booking flow � the visit_request row was already saved
    console.warn('[sendBookingMessage] failed to send in-app message:', err);
  }
}


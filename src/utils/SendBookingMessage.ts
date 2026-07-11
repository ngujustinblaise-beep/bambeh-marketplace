// BAMBEH_DEPLOY_TOKEN__SENDBOOKINGMESSAGE_FIX83_CLEAN
// FILE LOCATION: src/utils/SendBookingMessage.ts
//
// Sends a booking request (site visit / test drive / service booking) into the
// real in-app chat as a BOOKING-CARD message. It:
//   1. resolves the current signed-in user,
//   2. finds-or-creates the per-item conversation with the ad owner (keyed on
//      listing_id, consistent with FIX82 per-item chats),
//   3. inserts a message flagged is_booking_message=true whose content is
//      formatted so Chat.tsx's BookingMessageCard renders it (line 0 = title,
//      remaining lines = "Key: Value"),
//   4. updates the conversation preview + bumps the owner's unread count,
//   5. inserts a notification for the owner.
//
// No stubs — this writes to the same conversations/messages/notifications
// tables the chat screen reads.

import { supabase } from '@/lib/supabase';

export type BookingType = 'visit' | 'test_ride' | 'service';

export interface SendBookingMessageArgs {
  adCreatorId: string;
  adTitle: string;
  bookingType: BookingType;
  date: string;
  time: string;
  visitorNote?: string;
  visitorPhone?: string;
  listingId?: string;
  listingImage?: string;
}

const TITLES: Record<BookingType, string> = {
  visit: 'Site Visit Request',
  test_ride: 'Test Drive Request',
  service: 'Service Booking Request',
};

/**
 * Find the existing conversation for (me, owner, listing) or create one.
 * Mirrors startChat() in Chat.tsx: keyed on listing_id so each item keeps its
 * own thread; a null listingId matches the legacy generic thread.
 */
async function findOrCreateConversation(
  meId: string,
  ownerId: string,
  listingId: string | undefined,
  listingTitle: string,
  listingImage: string | undefined
): Promise<string> {
  let findQuery = supabase
    .from('conversations')
    .select('id')
    .contains('participant_ids', [meId, ownerId]);

  findQuery = listingId
    ? findQuery.eq('listing_id', listingId)
    : findQuery.is('listing_id', null);

  const { data: existing, error: findErr } = await findQuery
    .order('last_message_at', { ascending: false })
    .limit(1);

  if (findErr) throw new Error(`Failed to find conversation: ${findErr.message}`);
  if (existing && existing.length > 0) return existing[0].id;

  const { data: created, error: createErr } = await supabase
    .from('conversations')
    .insert({
      participant_ids: [meId, ownerId],
      buyer_id: meId,
      seller_id: ownerId,
      last_message: '',
      last_message_at: new Date().toISOString(),
      listing_id: listingId ?? null,
      listing_title: listingTitle ?? null,
      listing_image: listingImage ?? null,
      unread_counts: { [meId]: 0, [ownerId]: 0 },
    })
    .select('id')
    .single();

  if (createErr) throw new Error(`Failed to create conversation: ${createErr.message}`);
  return created.id;
}

export async function sendBookingMessage(args: SendBookingMessageArgs): Promise<void> {
  const {
    adCreatorId,
    adTitle,
    bookingType,
    date,
    time,
    visitorNote,
    visitorPhone,
    listingId,
    listingImage,
  } = args;

  if (!adCreatorId) throw new Error('Missing owner id for booking.');

  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user?.id) {
    throw new Error('You must be signed in to send a booking request.');
  }
  const meId = authData.user.id;

  if (meId === adCreatorId) {
    throw new Error('You cannot book your own listing.');
  }

  const conversationId = await findOrCreateConversation(
    meId,
    adCreatorId,
    listingId,
    adTitle,
    listingImage
  );

  // Build the booking-card content: title on line 0, then "Key: Value" lines.
  const lines: string[] = [TITLES[bookingType] ?? 'Booking Request'];
  if (adTitle) lines.push(`Item: ${adTitle}`);
  if (date) lines.push(`Date: ${date}`);
  if (time) lines.push(`Time: ${time}`);
  if (visitorPhone && visitorPhone.trim()) lines.push(`Phone: ${visitorPhone.trim()}`);
  if (visitorNote && visitorNote.trim()) lines.push(`Note: ${visitorNote.trim()}`);
  const content = lines.join('\n');

  const { error: msgErr } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: meId,
    content,
    message_type: 'booking',
    read_by: [meId],
    is_booking_message: true,
  });
  if (msgErr) throw new Error(`Failed to send booking: ${msgErr.message}`);

  // Keep the conversation preview in sync and bump the owner's unread count.
  try {
    const { data: convo } = await supabase
      .from('conversations')
      .select('unread_counts')
      .eq('id', conversationId)
      .single();

    const nextUnread = { ...(convo?.unread_counts ?? {}) };
    nextUnread[adCreatorId] = (nextUnread[adCreatorId] ?? 0) + 1;

    await supabase
      .from('conversations')
      .update({
        last_message: TITLES[bookingType] ?? 'Booking Request',
        last_message_at: new Date().toISOString(),
        unread_counts: nextUnread,
      })
      .eq('id', conversationId);

    await supabase.from('notifications').insert({
      user_id: adCreatorId,
      title: TITLES[bookingType] ?? 'Booking Request',
      body: `${adTitle} — ${date} ${time}`.trim(),
      type: 'message',
      data: { conversation_id: conversationId },
      action_url: '/chat',
      is_read: false,
    });
  } catch {
    // Preview/notification are best-effort; the message itself is already sent.
  }
}

export default sendBookingMessage;
// BAMBEH_END_TOKEN__SENDBOOKINGMESSAGE_FIX83__COMPLETE

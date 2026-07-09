import { supabase } from '@/lib/supabase'

export async function getOrCreateConversation(listingId: string, buyerId: string, sellerId: string) {
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('listing_id', listingId)
    .eq('buyer_id', buyerId)
    .eq('seller_id', sellerId)
    .single()

  if (existing) return existing

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function sendMessage(conversationId: string, senderId: string, content: string, metadata?: any) {
  const { error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      metadata: metadata ?? {}
    })

  if (error) throw error
}

export function subscribeToMessages(conversationId: string, callback: (payload: any) => void) {
  return supabase
    .channel('messages:' + conversationId)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: 'conversation_id=eq.' + conversationId
      },
      callback
    )
    .subscribe()
}

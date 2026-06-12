/**
 * src/services/exchange-referral.service.ts — Bambeh Marketplace
 *
 * ✅ Pure Supabase — no axios, no localStorage, no Firebase URL calls
 * ✅ Exchange requests stored in "listings" table (type='exchange')
 * ✅ Referrals stored in "referrals" table (graceful fallback if absent)
 * ✅ All function signatures preserved — no caller changes needed
 */

import { supabase } from '@/lib/supabase';

// ─── Exchange Types ────────────────────────────────────────────────────────────
export interface ExchangeRequest {
  id:            string;
  type:          'currency' | 'item-swap';
  fromCurrency?: string;
  toCurrency?:   string;
  amount?:       number;
  itemOffered?:  string;
  itemWanted?:   string;
  description:   string;
  userId:        string;
  userName:      string;
  status:        'open' | 'in-progress' | 'completed' | 'cancelled';
  createdAt:     string;
}

function rowToExchange(row: Record<string, any>): ExchangeRequest {
  const extra = row.extra ?? {};
  return {
    id:           row.id,
    type:         extra.exchange_type ?? 'item-swap',
    fromCurrency: extra.from_currency ?? undefined,
    toCurrency:   extra.to_currency   ?? undefined,
    amount:       extra.amount        ?? undefined,
    itemOffered:  extra.item_offered  ?? row.title ?? '',
    itemWanted:   extra.item_wanted   ?? undefined,
    description:  row.description     ?? '',
    userId:       row.user_id         ?? row.seller_id ?? '',
    userName:     row.profiles?.full_name ?? 'User',
    status:       (extra.exchange_status ?? row.status ?? 'open') as ExchangeRequest['status'],
    createdAt:    row.created_at,
  };
}

// ─── Exchange Service ──────────────────────────────────────────────────────────
class ExchangeService {

  async getAllExchangeRequests(filters?: { type?: string }): Promise<ExchangeRequest[]> {
    try {
      let query = supabase
        .from('listings')
        .select('*, profiles:user_id (full_name)')
        .eq('type', 'exchange')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(60);

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('extra->exchange_type', filters.type);
      }

      const { data, error } = await query;
      if (error) { console.error('[ExchangeService]', error.message); return []; }
      return (data ?? []).map(r => rowToExchange(r as Record<string, any>));
    } catch (err) {
      console.error('[ExchangeService] exception:', err);
      return [];
    }
  }

  async createExchangeRequest(
    requestData: Omit<ExchangeRequest, 'id' | 'userId' | 'userName' | 'status' | 'createdAt'>
  ): Promise<ExchangeRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to post an exchange');

    const { data, error } = await supabase
      .from('listings')
      .insert({
        user_id:     user.id,
        type:        'exchange',
        title:       requestData.itemOffered ?? requestData.description.slice(0, 80),
        description: requestData.description,
        status:      'active',
        price:       requestData.amount ?? null,
        view_count:  0,
        is_featured: false,
        extra: {
          exchange_type:   requestData.type,
          from_currency:   requestData.fromCurrency   ?? null,
          to_currency:     requestData.toCurrency     ?? null,
          amount:          requestData.amount         ?? null,
          item_offered:    requestData.itemOffered    ?? null,
          item_wanted:     requestData.itemWanted     ?? null,
          exchange_status: 'open',
        },
      })
      .select('*, profiles:user_id (full_name)')
      .single();

    if (error) throw new Error(error.message);
    return rowToExchange(data as Record<string, any>);
  }

  async respondToExchange(exchangeId: string, message: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to respond');

    const { data: listing } = await supabase
      .from('listings')
      .select('user_id, title')
      .eq('id', exchangeId)
      .maybeSingle();

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id:    user.id,
        recipient_id: listing?.user_id ?? null,
        listing_id:   exchangeId,
        listing_type: 'exchange',
        content:      message,
        created_at:   new Date().toISOString(),
      });

    if (error) throw new Error(error.message);
  }

  async getExchangeById(id: string): Promise<ExchangeRequest | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles:user_id (full_name)')
      .eq('id', id)
      .eq('type', 'exchange')
      .maybeSingle();

    if (error || !data) return null;
    return rowToExchange(data as Record<string, any>);
  }

  async closeExchange(exchangeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', exchangeId)
      .eq('user_id', user.id);
  }
}

// ─── Referral Types ────────────────────────────────────────────────────────────
export interface Referral {
  id:                string;
  referrerId:        string;
  referredUserId?:   string;
  referredUserEmail: string;
  status:            'pending' | 'completed' | 'expired';
  rewardAmount:      number;
  rewardClaimed:     boolean;
  createdAt:         string;
  completedAt?:      string;
}

export interface ReferralStats {
  totalReferrals:      number;
  completedReferrals:  number;
  pendingReferrals:    number;
  totalRewardsEarned:  number;
  totalRewardsClaimed: number;
}

// ─── Referral Service ──────────────────────────────────────────────────────────
class ReferralService {

  async getReferralCode(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'BAMBEH-GUEST';

    const { data } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .maybeSingle();

    return data?.referral_code ?? `BAMBEH-${user.id.slice(0, 8).toUpperCase()}`;
  }

  async getMyReferrals(): Promise<Referral[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) { console.warn('[ReferralService] referrals table:', error.message); return []; }

    return (data ?? []).map((r: any) => ({
      id:                r.id,
      referrerId:        r.referrer_id,
      referredUserId:    r.referred_user_id  ?? undefined,
      referredUserEmail: r.referred_email    ?? '',
      status:            r.status            ?? 'pending',
      rewardAmount:      Number(r.reward_amount ?? 5000),
      rewardClaimed:     Boolean(r.reward_claimed),
      createdAt:         r.created_at,
      completedAt:       r.completed_at      ?? undefined,
    }));
  }

  async getReferralStats(): Promise<ReferralStats> {
    const referrals = await this.getMyReferrals();
    return {
      totalReferrals:      referrals.length,
      completedReferrals:  referrals.filter(r => r.status === 'completed').length,
      pendingReferrals:    referrals.filter(r => r.status === 'pending').length,
      totalRewardsEarned:  referrals.reduce((sum, r) => sum + r.rewardAmount, 0),
      totalRewardsClaimed: referrals.filter(r => r.rewardClaimed).reduce((sum, r) => sum + r.rewardAmount, 0),
    };
  }

  async sendReferralInvite(email: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to send referrals');

    const referralCode = await this.getReferralCode();

    const { error } = await supabase
      .from('referrals')
      .insert({
        referrer_id:    user.id,
        referred_email: email,
        referral_code:  referralCode,
        status:         'pending',
        reward_amount:  5000,
        reward_claimed: false,
        created_at:     new Date().toISOString(),
      });

    if (error) console.warn('[ReferralService] sendReferralInvite:', error.message);
    // Don't throw — referrals table may not exist yet
  }

  async claimReferralReward(referralId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('referrals')
      .update({ reward_claimed: true })
      .eq('id', referralId)
      .eq('referrer_id', user.id);

    if (error) throw new Error(error.message);
  }
}

export const exchangeService = new ExchangeService();
export const referralService = new ReferralService();

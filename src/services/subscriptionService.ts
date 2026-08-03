import { supabase } from '../lib/supabase';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export interface ClubSubscription {
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_ends_at: string | null;
  provider_product_id: string;
}

function requireClient() {
  if (!supabase) throw new Error('Supabase אינו מוגדר.');
  return supabase;
}

export const subscriptionService = {
  async getClubSubscription(clubId: string): Promise<ClubSubscription> {
    const { data, error } = await requireClient().rpc('get_club_subscription', { target_club_id: clubId });
    if (error) throw error;
    const record = (data ?? [])[0] as ClubSubscription | undefined;
    if (!record) throw new Error('לא נמצא מצב מנוי עבור המועדון.');
    return record;
  },
};

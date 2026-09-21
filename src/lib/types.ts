export type UserRole = 'public' | 'subscriber' | 'admin';

export type SubscriptionStatus =
  | 'inactive'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'lapsed';

export type PlanType = 'monthly' | 'yearly';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  subscription_status: SubscriptionStatus;
  charity_id: string | null;
  charity_contribution_pct: number;
  created_at: string;
  updated_at: string;
  charity?: Charity | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number; // 1 - 45
  date: string; // YYYY-MM-DD
  course_name?: string | null;
  created_at: string;
}

export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  goal: number;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  logo_url: string | null;
  cover_image_url: string | null;
  featured: boolean;
  total_raised: number;
  events: CharityEvent[];
  created_at: string;
}

export type DrawMode = 'random' | 'algorithmic';
export type DrawStatus = 'draft' | 'simulated' | 'published';

export interface Draw {
  id: string;
  period: string;
  mode: DrawMode;
  status: DrawStatus;
  target_numbers: number[];
  pool_total: number;
  active_subscribers_count: number;
  jackpot_rollover_in: number;
  jackpot_rollover_out: number;
  tier_5_pool: number;
  tier_4_pool: number;
  tier_3_pool: number;
  draw_date: string;
  published_at: string | null;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  entry_numbers: number[];
  weight: number;
  match_count: number;
  tier_won: 5 | 4 | 3 | null;
  created_at: string;
  profile?: Profile;
}

export type ProofStatus = 'unsubmitted' | 'submitted' | 'approved' | 'rejected';
export type PayoutStatus = 'pending' | 'paid';

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  tier: 5 | 4 | 3;
  amount: number;
  payout_status: PayoutStatus;
  proof_url: string | null;
  proof_status: ProofStatus;
  proof_rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  paid_at: string | null;
  created_at: string;
  draw?: Draw;
  profile?: Profile;
}

export interface Donation {
  id: string;
  user_id: string | null;
  charity_id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  stripe_payment_id: string | null;
  status: 'pending' | 'succeeded' | 'failed';
  created_at: string;
  charity?: Charity;
}

// ─── User & Auth ─────────────────────────────────────────────────────────────
export type UserRole = 'subscriber' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export type SubscriptionPlan = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed'

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  amount: number
  currency: string
  razorpay_subscription_id?: string
  razorpay_payment_id?: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

// ─── Golf Scores ──────────────────────────────────────────────────────────────
export interface GolfScore {
  id: string
  user_id: string
  score: number          // 1-45 Stableford
  played_at: string      // date of round
  created_at: string
}

// ─── Charity ──────────────────────────────────────────────────────────────────
export interface Charity {
  id: string
  name: string
  description: string
  image_url?: string
  website_url?: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CharityContribution {
  id: string
  user_id: string
  charity_id: string
  percentage: number     // min 10%
  amount: number
  created_at: string
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
export type DrawStatus = 'scheduled' | 'simulation' | 'published'
export type DrawMode = 'random' | 'algorithmic'

export interface Draw {
  id: string
  month: string          // e.g. "2026-03"
  mode: DrawMode
  status: DrawStatus
  winning_numbers: number[]
  jackpot_amount: number
  jackpot_rolled_over: boolean
  prize_pool_total: number
  published_at?: string
  created_at: string
  updated_at: string
}

// ─── Prize Pool ───────────────────────────────────────────────────────────────
export type MatchType = '5-match' | '4-match' | '3-match'

export interface PrizePool {
  id: string
  draw_id: string
  match_type: MatchType
  pool_share: number     // 40%, 35%, 25%
  total_amount: number
  winner_count: number
  amount_per_winner: number
}

// ─── Winner ───────────────────────────────────────────────────────────────────
export type WinnerStatus = 'pending' | 'verified' | 'rejected' | 'paid'

export interface Winner {
  id: string
  draw_id: string
  user_id: string
  match_type: MatchType
  matched_numbers: number[]
  prize_amount: number
  status: WinnerStatus
  proof_url?: string
  admin_notes?: string
  paid_at?: string
  created_at: string
  updated_at: string
}

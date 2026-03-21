import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Run all queries individually to avoid destructuring issues
    const usersRes = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const subsRes = await supabaseAdmin
      .from('subscriptions')
      .select('amount, plan, prize_pool_contribution')
      .eq('status', 'active')

    const drawsRes = await supabaseAdmin
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    const winnersRes = await supabaseAdmin
      .from('winners')
      .select('prize_amount, is_verified, match_tier')

    const contribRes = await supabaseAdmin
      .from('charity_contributions')
      .select('amount')

    const recentUsersRes = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    const subscriptions = subsRes.data || []
    const winners = winnersRes.data || []
    const contributions = contribRes.data || []

    const totalRevenue = subscriptions.reduce((s: number, sub: any) => s + (sub.amount || 0), 0)
    const totalPrizePool = subscriptions.reduce((s: number, sub: any) => s + (sub.prize_pool_contribution || 0), 0)
    const totalCharityContributions = contributions.reduce((s: number, c: any) => s + (c.amount || 0), 0)
    const totalWinnersCount = winners.length
    const pendingVerification = winners.filter((w: any) => !w.is_verified).length
    const totalPrizePaid = winners.filter((w: any) => w.is_verified).reduce((s: number, w: any) => s + (w.prize_amount || 0), 0)
    const monthlyCount = subscriptions.filter((s: any) => s.plan === 'monthly').length
    const yearlyCount = subscriptions.filter((s: any) => s.plan === 'yearly').length

    return NextResponse.json({
      stats: {
        totalUsers: usersRes.count || 0,
        activeSubscribers: subscriptions.length,
        totalRevenue,
        totalPrizePool,
        totalCharityContributions,
        totalWinnersCount,
        pendingVerification,
        totalPrizePaid,
        monthlySubscribers: monthlyCount,
        yearlySubscribers: yearlyCount,
        totalDraws: (drawsRes.data || []).length,
      },
      recentDraws: drawsRes.data || [],
      recentUsers: recentUsersRes.data || [],
    })
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/sender'
import { drawResultsEmail } from '@/lib/email/templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Prize distribution percentages
const PRIZE_TIERS = {
  5: { label: '5-Match', percentage: 0.40 },
  4: { label: '4-Match', percentage: 0.35 },
  3: { label: '3-Match', percentage: 0.25 },
}

// Generate 5 random winning Stableford scores (1–45)
function generateWinningScores(): number[] {
  const scores: number[] = []
  while (scores.length < 5) {
    const score = Math.floor(Math.random() * 45) + 1
    if (!scores.includes(score)) scores.push(score)
  }
  return scores.sort((a, b) => a - b)
}

// Count how many of a user's scores match the winning scores
function countMatches(userScores: number[], winningScores: number[]): number {
  return userScores.filter(s => winningScores.includes(s)).length
}

// POST — trigger a new draw
export async function POST(req: NextRequest) {
  try {
    const { triggeredBy, drawMonth } = await req.json()

    if (!triggeredBy) {
      return NextResponse.json({ error: 'Missing triggeredBy' }, { status: 400 })
    }

    const month = drawMonth || new Date().toISOString().slice(0, 7) // e.g. "2025-03"

    // Check if draw already exists for this month
    const { data: existingDraw } = await supabaseAdmin
      .from('draws')
      .select('id')
      .eq('month', month)
      .single()

    if (existingDraw) {
      return NextResponse.json({ error: `Draw for ${month} already exists` }, { status: 400 })
    }

    // Get all active subscribers with their scores
    const { data: subscribers, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, prize_pool_contribution')
      .eq('status', 'active')

    if (subError) throw subError
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 })
    }

    // Calculate total prize pool from all active subscribers
    const totalPrizePool = subscribers.reduce(
      (sum, s) => sum + (s.prize_pool_contribution || 0), 0
    )

    // Generate winning scores
    const winningScores = generateWinningScores()

    // Create the draw record
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .insert({
        month: month,
        winning_scores: winningScores,
        total_prize_pool: totalPrizePool,
        status: 'completed',
        triggered_by: triggeredBy,
      })
      .select()
      .single()

    if (drawError) throw drawError

    // Get scores for all subscribers
    const userIds = subscribers.map(s => s.user_id)
    const { data: allScores, error: scoresError } = await supabaseAdmin
      .from('golf_scores')
      .select('user_id, score')
      .in('user_id', userIds)

    if (scoresError) throw scoresError

    // Group scores by user
    const scoresByUser: Record<string, number[]> = {}
    for (const row of allScores || []) {
      if (!scoresByUser[row.user_id]) scoresByUser[row.user_id] = []
      scoresByUser[row.user_id].push(row.score)
    }

    // Find winners (3, 4, or 5 matches)
    const winners: { userId: string; matches: number; tier: string }[] = []
    for (const sub of subscribers) {
      const userScores = scoresByUser[sub.user_id] || []
      const matches = countMatches(userScores, winningScores)
      if (matches >= 3) {
        const tier = PRIZE_TIERS[matches as keyof typeof PRIZE_TIERS]
        if (tier) {
          winners.push({ userId: sub.user_id, matches, tier: tier.label })
        }
      }
    }

    // Group winners by tier
    const tierGroups: Record<number, string[]> = { 5: [], 4: [], 3: [] }
    for (const w of winners) {
      if (tierGroups[w.matches]) tierGroups[w.matches].push(w.userId)
    }

    // Calculate and insert prize records
    const winnerInserts: any[] = []
    for (const [matchCount, userIds] of Object.entries(tierGroups)) {
      const count = parseInt(matchCount) as 3 | 4 | 5
      const tier = PRIZE_TIERS[count]
      if (!tier || userIds.length === 0) continue

      const tierPrize = totalPrizePool * tier.percentage
      const prizePerWinner = Math.floor(tierPrize / userIds.length)

      for (const userId of userIds) {
        winnerInserts.push({
          draw_id: draw.id,
          user_id: userId,
          matched_scores: count,
          prize_amount: prizePerWinner,
          match_tier: tier.label,
          is_verified: false,
        })
      }
    }

    if (winnerInserts.length > 0) {
      const { error: winnersError } = await supabaseAdmin
        .from('winners')
        .insert(winnerInserts)

      if (winnersError) throw winnersError
    }

    // Also save prize pool record
    await supabaseAdmin.from('prize_pools').insert({
      draw_id: draw.id,
      total_amount: totalPrizePool,
      five_match_pool: Math.floor(totalPrizePool * 0.40),
      four_match_pool: Math.floor(totalPrizePool * 0.35),
      three_match_pool: Math.floor(totalPrizePool * 0.25),
      five_match_winners: tierGroups[5].length,
      four_match_winners: tierGroups[4].length,
      three_match_winners: tierGroups[3].length,
    })

    // Send draw result emails to all subscribers
    const { data: subProfiles } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email, id')
      .in('id', userIds)

    if (subProfiles) {
      for (const profile of subProfiles) {
        if (!profile.email) continue
        const userScoreNums = (scoresByUser[profile.id] || [])
        const matched = countMatches(userScoreNums, winningScores)
        const emailTpl = drawResultsEmail(
          profile.full_name || 'Golfer',
          month,
          winningScores,
          userScoreNums,
          matched
        )
        // fire and forget — don't await all
        sendEmail({ to: profile.email, ...emailTpl }).catch(console.error)
      }
    }

    return NextResponse.json({
      success: true,
      draw: {
        id: draw.id,
        month,
        winningScores,
        totalPrizePool,
        totalSubscribers: subscribers.length,
        winners: winnerInserts.length,
        tierBreakdown: {
          '5-match': tierGroups[5].length,
          '4-match': tierGroups[4].length,
          '3-match': tierGroups[3].length,
        },
      },
    })
  } catch (error: any) {
    console.error('Draw engine error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET — fetch all draws with winner counts
export async function GET(req: NextRequest) {
  try {
    const { data: draws, error } = await supabaseAdmin
      .from('draws')
      .select(`
        *,
        winners(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ draws: draws || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

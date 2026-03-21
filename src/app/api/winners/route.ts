import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/sender'
import { winnerEmail } from '@/lib/email/templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch all winners (admin) or single user's winnings
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const drawId = req.nextUrl.searchParams.get('drawId')
    const isAdmin = req.nextUrl.searchParams.get('admin') === 'true'

    // Admin: fetch all winners across all draws
    if (isAdmin) {
      let query = supabaseAdmin
        .from('winners')
        .select(`
          *,
          profiles(full_name, email),
          draws(month, winning_scores, total_prize_pool)
        `)
        .order('created_at', { ascending: false })

      if (drawId) query = query.eq('draw_id', drawId)

      const { data, error } = await query
      if (error) throw error
      return NextResponse.json({ winners: data || [] })
    }

    // User: fetch own winnings
    if (userId) {
      const { data, error } = await supabaseAdmin
        .from('winners')
        .select(`
          *,
          draws(month, winning_scores, total_prize_pool, created_at)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json({ winnings: data || [] })
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH — verify or unverify a winner
export async function PATCH(req: NextRequest) {
  try {
    const { winnerId, isVerified, verifiedBy, notes } = await req.json()

    if (!winnerId) {
      return NextResponse.json({ error: 'Missing winnerId' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({
        is_verified: isVerified,
        verified_by: verifiedBy,
        verified_at: isVerified ? new Date().toISOString() : null,
        admin_notes: notes || null,
      })
      .eq('id', winnerId)
      .select()
      .single()

    if (error) throw error

    // Send winner email when verified
    if (isVerified) {
      const { data: winnerFull } = await supabaseAdmin
        .from('winners')
        .select(`
          prize_amount, match_tier,
          profiles(full_name, email),
          draws(month)
        `)
        .eq('id', winnerId)
        .single()

      if (winnerFull) {
        const profile = winnerFull.profiles as any
        const draw = winnerFull.draws as any
        if (profile?.email) {
          const emailTpl = winnerEmail(
            profile.full_name || 'Golfer',
            winnerFull.match_tier,
            winnerFull.prize_amount,
            draw?.month || '',
            notes
          )
          await sendEmail({ to: profile.email, ...emailTpl })
        }
      }
    }

    return NextResponse.json({ success: true, winner: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch draw results for a user OR all winners of a draw
export async function GET(req: NextRequest) {
  try {
    const drawId = req.nextUrl.searchParams.get('drawId')
    const userId = req.nextUrl.searchParams.get('userId')

    // Get user's winnings across all draws
    if (userId && !drawId) {
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

    // Get all winners for a specific draw
    if (drawId) {
      const { data: draw, error: drawError } = await supabaseAdmin
        .from('draws')
        .select('*')
        .eq('id', drawId)
        .single()

      if (drawError) throw drawError

      const { data: winners, error: winnersError } = await supabaseAdmin
        .from('winners')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq('draw_id', drawId)
        .order('matched_scores', { ascending: false })

      if (winnersError) throw winnersError

      return NextResponse.json({ draw, winners: winners || [] })
    }

    return NextResponse.json({ error: 'Missing drawId or userId' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

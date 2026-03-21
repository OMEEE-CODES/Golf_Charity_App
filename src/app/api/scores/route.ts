import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch user's scores
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('golf_scores')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(5)

    if (error) throw error
    return NextResponse.json({ scores: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST — add new score
export async function POST(req: NextRequest) {
  try {
    const { userId, score, playedAt } = await req.json()

    if (!userId || !score || !playedAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (score < 1 || score > 45) {
      return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 })
    }

    // Insert new score (trigger will auto-remove oldest if > 5)
    const { data, error } = await supabaseAdmin
      .from('golf_scores')
      .insert({ user_id: userId, score, played_at: playedAt })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ score: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE — remove a score
export async function DELETE(req: NextRequest) {
  try {
    const { scoreId, userId } = await req.json()

    const { error } = await supabaseAdmin
      .from('golf_scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', userId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

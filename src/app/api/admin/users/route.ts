import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        subscriptions(plan, status, amount, created_at),
        golf_scores(score),
        charity_contributions(amount)
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error

    // Enrich each user with computed fields
    const users = (data || []).map(user => {
      const sub = user.subscriptions?.[0] || null
      const scores = user.golf_scores || []
      const contributions = user.charity_contributions || []
      const totalContributed = contributions.reduce((s: number, c: any) => s + (c.amount || 0), 0)

      return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at,
        subscription: sub ? { plan: sub.plan, status: sub.status } : null,
        scoreCount: scores.length,
        totalContributed,
      }
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — fetch all charities OR user's chosen charity
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const type = req.nextUrl.searchParams.get('type') // 'list' | 'user'

    // Return all active charities
    if (type === 'list') {
      const { data, error } = await supabaseAdmin
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return NextResponse.json({ charities: data })
    }

    // Return user's chosen charity + contribution total
    if (type === 'user' && userId) {
      // Get profile's chosen charity
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('charity_id')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // Get charity details
      let charity = null
      if (profile?.charity_id) {
        const { data: charityData } = await supabaseAdmin
          .from('charities')
          .select('*')
          .eq('id', profile.charity_id)
          .single()
        charity = charityData
      }

      // Get total contributions by this user
      const { data: contributions, error: contribError } = await supabaseAdmin
        .from('charity_contributions')
        .select('amount, created_at, charities(name, logo_url)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (contribError) throw contribError

      const totalContributed = contributions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0

      return NextResponse.json({
        chosenCharity: charity,
        charityId: profile?.charity_id,
        contributions: contributions || [],
        totalContributed,
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST — set user's chosen charity
export async function POST(req: NextRequest) {
  try {
    const { userId, charityId } = await req.json()

    if (!userId || !charityId) {
      return NextResponse.json({ error: 'Missing userId or charityId' }, { status: 400 })
    }

    // Update profile with chosen charity
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ charity_id: charityId, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

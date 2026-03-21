import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email/sender'
import { subscriptionEmail } from '@/lib/email/templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_CONFIG = {
  monthly: {
    amount: 999,
    durationDays: 30,
    prizePoolContribution: 600,
    charityContribution: 100,
  },
  yearly: {
    amount: 9999,
    durationDays: 365,
    prizePoolContribution: 7200,
    charityContribution: 1200,
  },
}

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = await req.json()

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
    const now = new Date()
    const periodEnd = new Date(now.getTime() + config.durationDays * 24 * 60 * 60 * 1000)

    // Check for existing subscription
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing
      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan,
          status: 'active',
          amount: config.amount,
          razorpay_payment_id,
          prize_pool_contribution: config.prizePoolContribution,
          charity_contribution: config.charityContribution,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('user_id', userId)
    } else {
      // Create new
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan,
          status: 'active',
          amount: config.amount,
          currency: 'INR',
          razorpay_payment_id,
          prize_pool_contribution: config.prizePoolContribution,
          charity_contribution: config.charityContribution,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
    }

    // Record charity contribution if user has chosen a charity
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('charity_id, full_name, email')
      .eq('id', userId)
      .single()

    if (profile?.charity_id) {
      await supabaseAdmin
        .from('charity_contributions')
        .insert({
          user_id: userId,
          charity_id: profile.charity_id,
          amount: config.charityContribution,
          payment_id: razorpay_payment_id,
          subscription_plan: plan,
        })
    }

    // Send subscription confirmation email
    if (profile?.email) {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextDraw = nextMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
      const emailTpl = subscriptionEmail(
        profile.full_name || 'Golfer',
        plan,
        config.amount,
        nextDraw
      )
      await sendEmail({ to: profile.email, ...emailTpl })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Subscription verify error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

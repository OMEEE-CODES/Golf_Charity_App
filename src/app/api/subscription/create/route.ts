import { NextRequest, NextResponse } from 'next/server'

const getRazorpay = () => {
  const Razorpay = require('razorpay')
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

const PLAN_AMOUNTS = {
  monthly: 99900,  // ₹999 in paise
  yearly: 999900,  // ₹9,999 in paise
}

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json()

    if (!plan || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const amount = PLAN_AMOUNTS[plan as keyof typeof PLAN_AMOUNTS]
    if (!amount) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `sub_${Date.now()}`,
      notes: { userId, plan, email },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
}

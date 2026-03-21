'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, Zap, Heart, Trophy } from 'lucide-react'

const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 999,
    displayPrice: '₹999',
    period: '/month',
    prizePool: '₹600',
    charity: '₹100',
    savings: null,
  },
  yearly: {
    name: 'Yearly',
    price: 9999,
    displayPrice: '₹9,999',
    period: '/year',
    prizePool: '₹7,200',
    charity: '₹1,200',
    savings: 'Save ₹1,989',
  },
}

const FEATURES = [
  'Enter monthly prize draws automatically',
  'Log unlimited Stableford scores',
  'Support your chosen charity',
  'Access full dashboard & history',
  'Winner verification & payouts',
  'Cancel anytime',
]

export default function SubscribePage() {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const userRef = useRef<any>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user)
        userRef.current = session.user
      }
      setUserLoading(false)
    })
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')

    try {
      const user = userRef.current || currentUser
      if (!user) {
        setLoading(false)
        router.push('/auth/login?redirect=/subscribe')
        return
      }

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user.id, email: user.email }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to create order')

      // Load Razorpay
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: 'INR',
          name: 'GolfHero',
          description: `${PLANS[plan].name} Subscription`,
          order_id: data.orderId,
          prefill: { email: user.email },
          theme: { color: '#10b981' },
          handler: async (response: any) => {
            // Payment success — verify and activate
            const verifyRes = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                plan,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              router.push('/dashboard?subscribed=true')
            } else {
              setError('Payment verification failed. Contact support.')
            }
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const selected = PLANS[plan]

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <div className="text-center pt-16 pb-8 px-4">
        <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">
          Simple Pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Every subscription enters you into monthly draws and supports a charity of your choice.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#111c30] rounded-full p-1 flex gap-1">
          {(['monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                plan === p
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
              {p === 'yearly' && (
                <span className="ml-2 text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">
                  SAVE 17%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Plan Details */}
          <div className="bg-[#111c30] rounded-2xl p-8 border border-emerald-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-bold text-xl">{selected.name} Plan</h2>
                {selected.savings && (
                  <span className="text-emerald-400 text-sm">{selected.savings}</span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <span className="text-5xl font-bold">{selected.displayPrice}</span>
              <span className="text-gray-400 ml-2">{selected.period}</span>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-6 p-4 bg-[#0a1628] rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                Where your money goes
              </p>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-300">
                  <Trophy className="w-4 h-4 text-amber-400" /> Prize Pool
                </span>
                <span className="text-amber-400 font-semibold">{selected.prizePool}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-300">
                  <Heart className="w-4 h-4 text-rose-400" /> Charity (min 10%)
                </span>
                <span className="text-rose-400 font-semibold">{selected.charity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Platform & Operations</span>
                <span className="text-gray-400">Remainder</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe CTA */}
          <div className="bg-gradient-to-br from-emerald-900/40 to-[#111c30] rounded-2xl p-8 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to start?</h3>
              <p className="text-gray-400 mb-6">
                Join thousands of golfers making every round count for charity.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 p-4 bg-[#0a1628]/60 rounded-xl">
                  <Trophy className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Monthly Prize Draw</p>
                    <p className="text-gray-400 text-xs">Current jackpot: £5,240. Match 3, 4 or 5 numbers to win.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#0a1628]/60 rounded-xl">
                  <Heart className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Charitable Impact</p>
                    <p className="text-gray-400 text-xs">Minimum 10% of every subscription goes to your chosen charity.</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading || userLoading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg transition-all"
            >
              {userLoading ? 'Loading...' : loading ? 'Processing...' : `Subscribe ${selected.name} — ${selected.displayPrice}`}
            </button>

            <p className="text-center text-gray-500 text-xs mt-4">
              Secure payment via Razorpay · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

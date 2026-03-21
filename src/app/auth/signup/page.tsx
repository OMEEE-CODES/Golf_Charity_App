import { Metadata } from 'next'
import SignupForm from '@/components/auth/SignupForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Create Account | GolfHero',
  description: 'Join GolfHero and start playing for charity',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0a0f0a] flex">

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-950 via-[#0a1a0f] to-[#0a0f0a] p-12 flex-col justify-between relative overflow-hidden">

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-700 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-white font-bold text-xl">GolfHero</span>
          </div>
        </Link>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-emerald-400 font-medium text-sm uppercase tracking-widest">Join the movement</p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Your game.<br />
              <span className="text-emerald-400">Their future.</span>
            </h2>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Subscribe, enter your scores, and watch your game contribute to causes that matter.
          </p>

          {/* How it works */}
          <div className="space-y-3 pt-2">
            {[
              { step: '01', text: 'Subscribe to a monthly or yearly plan' },
              { step: '02', text: 'Enter your Stableford scores after each round' },
              { step: '03', text: 'Get entered into monthly prize draws automatically' },
              { step: '04', text: '10%+ of your subscription goes to your chosen charity' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="text-emerald-500 font-mono text-xs font-bold mt-0.5">{item.step}</span>
                <p className="text-gray-400 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-gray-600 text-xs relative z-10">
          © 2026 GolfHero. All rights reserved.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <SignupForm />
      </div>
    </div>
  )
}

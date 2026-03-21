import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign In | GolfHero',
  description: 'Sign in to your GolfHero account',
}

export default function LoginPage() {
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
            <p className="text-emerald-400 font-medium text-sm uppercase tracking-widest">Play. Win. Give.</p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Golf that changes<br />
              <span className="text-emerald-400">lives</span>
            </h2>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Every round you play contributes to charity. Every score enters you into monthly prize draws.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: '£50K+', label: 'Raised for charity' },
              { value: '2,400+', label: 'Active golfers' },
              { value: '12', label: 'Charities supported' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-emerald-400 font-bold text-xl">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <LoginForm />
      </div>
    </div>
  )
}

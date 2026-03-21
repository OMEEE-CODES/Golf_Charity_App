'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, Heart, Dices,
  Trophy, LogOut, Menu, X, Crown, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/scores', label: 'My Scores', icon: TrendingUp },
  { href: '/dashboard/charity', label: 'My Charity', icon: Heart },
  { href: '/dashboard/draws', label: 'Draw History', icon: Dices },
  { href: '/dashboard/winnings', label: 'My Winnings', icon: Trophy },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return }
      setUser(session.user)
    })
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== '/dashboard'
      ? true : exact ? pathname === href : pathname === href

  return (
    <div className="min-h-screen bg-[#0a1628] flex">

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#0d1f35] border-r border-white/5 min-h-screen sticky top-0">

        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-bold">GolfHero</span>
          </Link>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'G'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user.user_metadata?.full_name || 'Golfer'}
                </p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-400' : ''}`} />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            href="/subscribe"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-amber-400 hover:bg-amber-500/10 transition-all"
          >
            <Crown className="w-4 h-4" />
            Upgrade Plan
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#0d1f35]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">G</span>
          </div>
          <span className="text-white font-bold text-sm">GolfHero</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-400 hover:text-white p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-20"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0d1f35] z-30 p-4 pt-16 overflow-y-auto"
            >
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 min-w-0 md:overflow-auto">
        <div className="md:hidden h-14" /> {/* spacer for mobile header */}
        {children}
      </main>
    </div>
  )
}

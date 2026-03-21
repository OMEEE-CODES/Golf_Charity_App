'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
// router kept for potential future use
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy, Heart, Dices, TrendingUp, Crown,
  ChevronRight, CheckCircle, Clock, AlertTriangle, Plus, IndianRupee
} from 'lucide-react'

interface DashboardData {
  subscription: any
  scores: any[]
  charity: any
  lastDraw: any
  winnings: any[]
  totalWon: number
  totalContributed: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return // layout handles redirect
      setUser(session.user)
      fetchDashboardData(session.user.id)
    })
  }, [])

  const fetchDashboardData = async (uid: string) => {
    try {
      const [subRes, scoresRes, charityRes, drawsRes, winningsRes] = await Promise.all([
        fetch(`/api/subscription/status?userId=${uid}`),
        fetch(`/api/scores?userId=${uid}`),
        fetch(`/api/charity?type=user&userId=${uid}`),
        fetch(`/api/draw`),
        fetch(`/api/winners?userId=${uid}`),
      ])

      const subData = await subRes.json()
      const scoresData = await scoresRes.json()
      const charityData = await charityRes.json()
      const drawsData = await drawsRes.json()
      const winningsData = await winningsRes.json()

      const winnings = winningsData.winnings || []
      const totalWon = winnings.reduce((s: number, w: any) => s + (w.prize_amount || 0), 0)

      setData({
        subscription: subData.subscription || null,
        scores: scoresData.scores || [],
        charity: charityData.chosenCharity || null,
        lastDraw: (drawsData.draws || [])[0] || null,
        winnings,
        totalWon,
        totalContributed: charityData.totalContributed || 0,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const avgScore = data?.scores?.length
    ? (data.scores.reduce((a: number, b: any) => a + b.score, 0) / data.scores.length).toFixed(1)
    : null

  const isSubscribed = data?.subscription?.status === 'active'
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Golfer'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {firstName}! {isSubscribed ? '🏌️' : '👋'}
          </h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </motion.div>

        {/* Subscription Alert (if not subscribed) */}
        {!isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-amber-300 font-medium text-sm">No active subscription</p>
                <p className="text-gray-400 text-xs">Subscribe to join monthly draws and support charities</p>
              </div>
            </div>
            <Link
              href="/subscribe"
              className="shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Subscribe Now
            </Link>
          </motion.div>
        )}

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: 'Subscription',
              value: isSubscribed ? data?.subscription?.plan?.toUpperCase() : 'Inactive',
              sub: isSubscribed ? 'Active' : 'Not subscribed',
              icon: Crown,
              color: isSubscribed ? 'text-emerald-400' : 'text-gray-500',
              iconBg: isSubscribed ? 'bg-emerald-500/20' : 'bg-gray-500/10',
            },
            {
              label: 'Avg Score',
              value: avgScore || '—',
              sub: `${data?.scores?.length || 0}/5 scores`,
              icon: TrendingUp,
              color: 'text-blue-400',
              iconBg: 'bg-blue-500/20',
            },
            {
              label: 'Total Won',
              value: data?.totalWon ? `₹${data.totalWon.toLocaleString('en-IN')}` : '₹0',
              sub: `${data?.winnings?.length || 0} wins`,
              icon: Trophy,
              color: 'text-yellow-400',
              iconBg: 'bg-yellow-500/20',
            },
            {
              label: 'Donated',
              value: data?.totalContributed ? `₹${data.totalContributed.toLocaleString('en-IN')}` : '₹0',
              sub: data?.charity?.name || 'No charity selected',
              icon: Heart,
              color: 'text-rose-400',
              iconBg: 'bg-rose-500/20',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-[#111c30] rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-gray-400 text-xs">{stat.label}</span>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-600 text-xs mt-0.5 truncate">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Scores Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111c30] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <h2 className="font-semibold">My Scores</h2>
              </div>
              <Link
                href="/dashboard/scores"
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                Manage <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.scores?.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">No scores yet</p>
                <Link
                  href="/dashboard/scores"
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add your first score
                </Link>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {data?.scores?.map((score: any, i: number) => (
                    <div
                      key={score.id}
                      className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border font-bold text-lg ${
                        score.score >= 36
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : score.score >= 25
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {score.score}
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-xs">
                  Average: <span className="text-white font-medium">{avgScore}</span>
                  &nbsp;·&nbsp;
                  {data?.scores?.length}/5 scores entered
                </p>
              </>
            )}
          </motion.div>

          {/* Charity Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[#111c30] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h2 className="font-semibold">My Charity</h2>
              </div>
              <Link
                href="/dashboard/charity"
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                Change <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.charity ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/30 to-emerald-500/30 flex items-center justify-center text-white font-bold">
                    {data.charity.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{data.charity.name}</p>
                    <p className="text-gray-500 text-xs line-clamp-1">{data.charity.description}</p>
                  </div>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Total contributed</span>
                  <span className="text-rose-400 font-semibold text-sm flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {data.totalContributed.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">No charity selected</p>
                <Link
                  href="/dashboard/charity"
                  className="inline-flex items-center gap-1.5 text-xs bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Heart className="w-3.5 h-3.5" />
                  Choose a charity
                </Link>
              </div>
            )}
          </motion.div>

          {/* Last Draw Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111c30] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 text-purple-400" />
                <h2 className="font-semibold">Latest Draw</h2>
              </div>
              <Link
                href="/dashboard/draws"
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.lastDraw ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-400 text-xs">{data.lastDraw.month}</span>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {data.lastDraw.status}
                  </span>
                </div>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {data.lastDraw.winning_scores?.map((score: number) => {
                    const userScoreNums = data.scores.map((s: any) => s.score)
                    const isMatch = userScoreNums.includes(score)
                    return (
                      <span
                        key={score}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                          isMatch
                            ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-400'
                            : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                        }`}
                      >
                        {score}
                      </span>
                    )
                  })}
                </div>
                <p className="text-gray-500 text-xs">
                  Prize pool: <span className="text-white">₹{data.lastDraw.total_prize_pool?.toLocaleString('en-IN')}</span>
                  &nbsp;·&nbsp; Your matched scores shown in{' '}
                  <span className="text-emerald-400">green</span>
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <Dices className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No draws yet</p>
              </div>
            )}
          </motion.div>

          {/* Winnings Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#111c30] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <h2 className="font-semibold">My Winnings</h2>
              </div>
              <Link
                href="/dashboard/winnings"
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.winnings?.length === 0 ? (
              <div className="text-center py-6">
                <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No winnings yet</p>
                <p className="text-gray-600 text-xs mt-1">Match 3+ scores in a draw to win</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data?.winnings?.slice(0, 3).map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-[#0a1628] rounded-xl">
                    <div>
                      <p className="text-white text-sm font-medium">{w.draws?.month} — {w.match_tier}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {w.is_verified ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 text-xs">Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-400 text-xs">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">
                      ₹{w.prize_amount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { label: 'Add Score', href: '/dashboard/scores', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
            { label: 'My Charity', href: '/dashboard/charity', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20' },
            { label: 'Draw History', href: '/dashboard/draws', icon: Dices, color: 'text-purple-400', bg: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20' },
            { label: 'My Winnings', href: '/dashboard/winnings', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/20' },
          ].map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-3 p-4 rounded-xl border ${link.bg} transition-all`}
            >
              <link.icon className={`w-5 h-5 ${link.color}`} />
              <span className="text-white text-sm font-medium">{link.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            </Link>
          ))}
        </motion.div>

        {/* Subscribe CTA if not subscribed */}
        {!isSubscribed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div>
              <p className="text-white font-semibold mb-1">Ready to play for prizes? 🏆</p>
              <p className="text-gray-400 text-sm">Subscribe from ₹999/month to join monthly draws and support charity</p>
            </div>
            <Link
              href="/subscribe"
              className="shrink-0 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all"
            >
              Subscribe Now
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

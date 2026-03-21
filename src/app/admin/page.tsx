'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, Crown, IndianRupee, Heart, Trophy,
  Dices, TrendingUp, Clock, CheckCircle,
  ChevronRight, BarChart3, Shield, ArrowUpRight
} from 'lucide-react'

interface Stats {
  totalUsers: number
  activeSubscribers: number
  totalRevenue: number
  totalPrizePool: number
  totalCharityContributions: number
  totalWinnersCount: number
  pendingVerification: number
  totalPrizePaid: number
  monthlySubscribers: number
  yearlySubscribers: number
  totalDraws: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentDraws, setRecentDraws] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setRecentDraws(data.recentDraws || [])
        setRecentUsers(data.recentUsers || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading admin data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">

      {/* Top Nav */}
      <div className="border-b border-white/5 bg-[#0a1628]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-semibold">GolfHero Admin</span>
              <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                Dashboard
              </span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
          >
            User View
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Admin Overview</h1>
          <p className="text-gray-400">Platform health at a glance</p>
        </div>

        {/* Primary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          {[
            {
              label: 'Total Users',
              value: stats?.totalUsers || 0,
              sub: `${stats?.activeSubscribers || 0} active subscribers`,
              icon: Users,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/20',
            },
            {
              label: 'Total Revenue',
              value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
              sub: `${stats?.monthlySubscribers || 0} monthly · ${stats?.yearlySubscribers || 0} yearly`,
              icon: IndianRupee,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
            },
            {
              label: 'Prize Pool',
              value: `₹${(stats?.totalPrizePool || 0).toLocaleString('en-IN')}`,
              sub: `${stats?.totalDraws || 0} draws run`,
              icon: Trophy,
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/20',
            },
            {
              label: 'Charity Donated',
              value: `₹${(stats?.totalCharityContributions || 0).toLocaleString('en-IN')}`,
              sub: 'Total contributions',
              icon: Heart,
              color: 'text-rose-400',
              bg: 'bg-rose-500/10',
              border: 'border-rose-500/20',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${stat.bg} border ${stat.border} rounded-2xl p-5`}
            >
              <div className="flex items-center gap-2 mb-3">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-gray-400 text-xs">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            {
              label: 'Total Winners',
              value: stats?.totalWinnersCount || 0,
              icon: Trophy,
              color: 'text-yellow-400',
            },
            {
              label: 'Pending Verification',
              value: stats?.pendingVerification || 0,
              icon: Clock,
              color: stats?.pendingVerification ? 'text-amber-400' : 'text-gray-400',
            },
            {
              label: 'Prize Paid Out',
              value: `₹${(stats?.totalPrizePaid || 0).toLocaleString('en-IN')}`,
              icon: CheckCircle,
              color: 'text-emerald-400',
            },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-[#111c30] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Admin Navigation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: 'Draw Engine',
              desc: 'Trigger & manage draws',
              href: '/admin/draws',
              icon: Dices,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10 hover:bg-purple-500/15 border-purple-500/20',
            },
            {
              label: 'Winner Verification',
              desc: `${stats?.pendingVerification || 0} pending`,
              href: '/admin/winners',
              icon: Trophy,
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10 hover:bg-yellow-500/15 border-yellow-500/20',
              badge: stats?.pendingVerification || 0,
            },
            {
              label: 'Users',
              desc: `${stats?.totalUsers || 0} registered`,
              href: '/admin/users',
              icon: Users,
              color: 'text-blue-400',
              bg: 'bg-blue-500/10 hover:bg-blue-500/15 border-blue-500/20',
            },
            {
              label: 'Charities',
              desc: 'Manage charity list',
              href: '/admin/charities',
              icon: Heart,
              color: 'text-rose-400',
              bg: 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20',
            },
            {
              label: 'Email Test',
              desc: 'Test all email templates',
              href: '/admin/email-test',
              icon: BarChart3,
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20',
            },
          ].map((card, i) => (
            <Link
              key={card.label}
              href={card.href}
              className={`relative p-5 rounded-2xl border ${card.bg} transition-all group`}
            >
              {card.badge ? (
                <span className="absolute top-3 right-3 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {card.badge}
                </span>
              ) : null}
              <card.icon className={`w-6 h-6 ${card.color} mb-3`} />
              <p className="text-white font-semibold text-sm">{card.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{card.desc}</p>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 mt-2 transition-colors" />
            </Link>
          ))}
        </motion.div>

        {/* Bottom Grid: Recent Draws + Recent Users */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Recent Draws */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111c30] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 text-purple-400" />
                <h2 className="font-semibold text-sm">Recent Draws</h2>
              </div>
              <Link href="/admin/draws" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {recentDraws.length === 0 ? (
              <div className="text-center py-8">
                <Dices className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No draws yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentDraws.map(draw => (
                  <div key={draw.id} className="flex items-center justify-between p-3 bg-[#0a1628] rounded-xl">
                    <div>
                      <p className="text-white text-sm font-medium">{draw.month}</p>
                      <div className="flex gap-1 mt-1">
                        {draw.winning_scores?.slice(0, 5).map((s: number, i: number) => (
                          <span key={i} className="w-5 h-5 bg-purple-500/20 rounded text-purple-300 text-xs flex items-center justify-center font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 text-sm font-semibold">
                        ₹{draw.total_prize_pool?.toLocaleString('en-IN')}
                      </p>
                      <span className="text-xs text-emerald-400/70">{draw.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#111c30] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h2 className="font-semibold text-sm">Recent Users</h2>
              </div>
              <Link href="/admin/users" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No users yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-[#0a1628] rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">
                        {user.full_name || 'Unknown'}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                    <p className="text-gray-600 text-xs shrink-0">
                      {new Date(user.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Subscription Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-[#111c30] rounded-2xl p-5 border border-white/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h2 className="font-semibold text-sm">Subscription Breakdown</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#0a1628] rounded-xl">
              <p className="text-2xl font-bold text-emerald-400">{stats?.activeSubscribers || 0}</p>
              <p className="text-gray-400 text-xs mt-1">Active</p>
            </div>
            <div className="text-center p-4 bg-[#0a1628] rounded-xl">
              <p className="text-2xl font-bold text-blue-400">{stats?.monthlySubscribers || 0}</p>
              <p className="text-gray-400 text-xs mt-1">Monthly (₹999)</p>
            </div>
            <div className="text-center p-4 bg-[#0a1628] rounded-xl">
              <p className="text-2xl font-bold text-purple-400">{stats?.yearlySubscribers || 0}</p>
              <p className="text-gray-400 text-xs mt-1">Yearly (₹9,999)</p>
            </div>
          </div>
          {stats && stats.activeSubscribers > 0 && (
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${stats.monthlySubscribers / stats.activeSubscribers * 100}%` }}
              />
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Monthly</span>
            <span>Yearly</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

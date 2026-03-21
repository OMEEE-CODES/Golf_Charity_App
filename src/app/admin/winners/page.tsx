'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, CheckCircle, Clock, IndianRupee,
  Calendar, Search, Filter, BadgeCheck, X, ChevronDown
} from 'lucide-react'

interface Winner {
  id: string
  user_id: string
  draw_id: string
  matched_scores: number
  prize_amount: number
  match_tier: string
  is_verified: boolean
  verified_at: string | null
  admin_notes: string | null
  created_at: string
  profiles: { full_name: string; email: string } | null
  draws: { month: string; winning_scores: number[]; total_prize_pool: number } | null
}

export default function AdminWinnersPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all')
  const [search, setSearch] = useState('')
  const [verifying, setVerifying] = useState<string | null>(null)
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null)
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchWinners()
      }
    })
  }, [])

  const fetchWinners = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/winners?admin=true')
      const data = await res.json()
      setWinners(data.winners || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (winner: Winner, verified: boolean) => {
    setVerifying(winner.id)
    try {
      const res = await fetch('/api/winners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId: winner.id,
          isVerified: verified,
          verifiedBy: userId,
          notes: notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setWinners(prev =>
        prev.map(w => w.id === winner.id
          ? { ...w, is_verified: verified, verified_at: verified ? new Date().toISOString() : null, admin_notes: notes || null }
          : w
        )
      )
      setSelectedWinner(null)
      setNotes('')
      setSuccess(verified ? `✅ Winner verified!` : `↩️ Verification removed`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setVerifying(null)
    }
  }

  const filteredWinners = winners.filter(w => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'verified' && w.is_verified) ||
      (filter === 'pending' && !w.is_verified)

    const matchesSearch =
      !search ||
      w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      w.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      w.draws?.month?.includes(search)

    return matchesFilter && matchesSearch
  })

  const pendingCount = winners.filter(w => !w.is_verified).length
  const verifiedCount = winners.filter(w => w.is_verified).length
  const totalPrize = winners.reduce((sum, w) => sum + (w.prize_amount || 0), 0)

  const tierColor = (tier: string) => {
    if (tier === '5-Match') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    if (tier === '4-Match') return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Winner Verification</h1>
              <p className="text-gray-400 text-sm">Admin — verify prize payouts to winners</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Winners', value: winners.length, color: 'text-white', bg: 'bg-white/5' },
            { label: 'Pending Verification', value: pendingCount, color: 'text-amber-400', bg: 'bg-amber-400/5 border-amber-400/20' },
            { label: 'Verified & Paid', value: verifiedCount, color: 'text-emerald-400', bg: 'bg-emerald-400/5 border-emerald-400/20' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border border-white/5 rounded-2xl p-4 text-center`}>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Success toast */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email or draw month..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111c30] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex bg-[#111c30] border border-white/5 rounded-xl p-1 gap-1">
            {(['all', 'pending', 'verified'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Winners Table */}
        <div className="bg-[#111c30] rounded-2xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400 animate-pulse">Loading winners...</div>
          ) : filteredWinners.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                {winners.length === 0 ? 'No winners yet — run a draw first' : 'No winners match your filter'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredWinners.map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 hover:bg-white/2 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: user + draw info */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-yellow-500/30 flex items-center justify-center text-white font-bold shrink-0">
                        {winner.profiles?.full_name?.charAt(0) || '?'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium truncate">
                            {winner.profiles?.full_name || 'Unknown User'}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${tierColor(winner.match_tier)}`}>
                            {winner.match_tier}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs truncate">{winner.profiles?.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-500 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Draw: {winner.draws?.month}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {winner.matched_scores} scores matched
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: prize + actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {winner.prize_amount?.toLocaleString('en-IN')}
                        </p>
                        {winner.is_verified ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400 flex items-center gap-1 justify-end mt-0.5">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Action button */}
                      {winner.is_verified ? (
                        <button
                          onClick={() => handleVerify(winner, false)}
                          disabled={verifying === winner.id}
                          className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Unverify
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedWinner(winner)}
                          disabled={verifying === winner.id}
                          className="px-3 py-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all flex items-center gap-1"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          Verify
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Admin notes if present */}
                  {winner.admin_notes && (
                    <div className="mt-2 ml-14 text-xs text-gray-500 italic">
                      Note: {winner.admin_notes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Total payout footer */}
        {winners.length > 0 && (
          <div className="mt-4 p-4 bg-[#111c30] rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Total Prize Payout</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              {totalPrize.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* Verify Modal */}
      <AnimatePresence>
        {selectedWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWinner(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111c30] border border-white/10 rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Verify Winner</h3>
                  <p className="text-gray-400 text-sm">{selectedWinner.profiles?.full_name}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[#0a1628] rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Draw</span>
                  <span className="text-white">{selectedWinner.draws?.month}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tier</span>
                  <span className={tierColor(selectedWinner.match_tier).split(' ')[0]}>{selectedWinner.match_tier}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Prize</span>
                  <span className="text-emerald-400 font-bold">₹{selectedWinner.prize_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-1.5 block">Admin Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Payment sent via NEFT on 20 Mar 2026"
                  rows={3}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedWinner(null); setNotes('') }}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify(selectedWinner, true)}
                  disabled={verifying === selectedWinner.id}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {verifying === selectedWinner.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm Verified
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

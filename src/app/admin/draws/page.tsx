'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dices, Trophy, Users, IndianRupee, Play,
  CheckCircle, AlertCircle, Calendar, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react'

interface Draw {
  id: string
  month: string
  winning_scores: number[]
  total_prize_pool: number
  status: string
  created_at: string
  winners: { count: number }[]
}

interface Winner {
  id: string
  user_id: string
  matched_scores: number
  prize_amount: number
  match_tier: string
  is_verified: boolean
  profiles: { full_name: string; email: string } | null
}

export default function AdminDrawsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [drawMonth, setDrawMonth] = useState(new Date().toISOString().slice(0, 7))
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [expandedDraw, setExpandedDraw] = useState<string | null>(null)
  const [drawWinners, setDrawWinners] = useState<Record<string, Winner[]>>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchDraws()
      }
    })
  }, [])

  const fetchDraws = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/draw')
      const data = await res.json()
      setDraws(data.draws || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerDraw = async () => {
    if (!userId) return
    if (!confirm(`Run draw for ${drawMonth}? This cannot be undone.`)) return

    setTriggering(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: userId, drawMonth }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult(data.draw)
      fetchDraws()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTriggering(false)
    }
  }

  const fetchDrawWinners = async (drawId: string) => {
    if (drawWinners[drawId]) {
      // toggle collapse
      setExpandedDraw(expandedDraw === drawId ? null : drawId)
      return
    }
    try {
      const res = await fetch(`/api/draw/results?drawId=${drawId}`)
      const data = await res.json()
      setDrawWinners(prev => ({ ...prev, [drawId]: data.winners || [] }))
      setExpandedDraw(drawId)
    } catch (e) {
      console.error(e)
    }
  }

  const tierColor = (tier: string) => {
    if (tier === '5-Match') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    if (tier === '4-Match') return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Dices className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Draw Engine</h1>
              <p className="text-gray-400 text-sm">Admin — trigger monthly draws & view results</p>
            </div>
          </div>
        </div>

        {/* Trigger Draw Card */}
        <div className="bg-[#111c30] rounded-2xl p-6 border border-white/5 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-400" />
            Trigger New Draw
          </h2>

          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 mb-1.5 block">Draw Month</label>
              <input
                type="month"
                value={drawMonth}
                onChange={e => setDrawMonth(e.target.value)}
                className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
            <button
              onClick={handleTriggerDraw}
              disabled={triggering}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              {triggering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Dices className="w-4 h-4" />
                  Run Draw
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Draw Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-5 bg-purple-500/10 border border-purple-500/30 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-purple-300">Draw Completed!</span>
                </div>

                {/* Winning Scores */}
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-2">🎯 Winning Scores</p>
                  <div className="flex gap-2 flex-wrap">
                    {result.winningScores.map((score: number) => (
                      <span
                        key={score}
                        className="w-10 h-10 bg-purple-500/20 border border-purple-500/40 rounded-xl flex items-center justify-center text-purple-300 font-bold text-sm"
                      >
                        {score}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Prize Pool', value: `₹${result.totalPrizePool?.toLocaleString('en-IN')}`, color: 'text-emerald-400' },
                    { label: 'Subscribers', value: result.totalSubscribers, color: 'text-blue-400' },
                    { label: 'Total Winners', value: result.winners, color: 'text-yellow-400' },
                    { label: '5-Match', value: result.tierBreakdown?.['5-match'] || 0, color: 'text-yellow-400' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#0a1628] rounded-xl p-3 text-center">
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-yellow-500/10 rounded-lg p-2">
                    <p className="text-yellow-400 font-bold">{result.tierBreakdown?.['5-match'] || 0}</p>
                    <p className="text-gray-500 text-xs">5-Match (40%)</p>
                  </div>
                  <div className="bg-blue-500/10 rounded-lg p-2">
                    <p className="text-blue-400 font-bold">{result.tierBreakdown?.['4-match'] || 0}</p>
                    <p className="text-gray-500 text-xs">4-Match (35%)</p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-2">
                    <p className="text-emerald-400 font-bold">{result.tierBreakdown?.['3-match'] || 0}</p>
                    <p className="text-gray-500 text-xs">3-Match (25%)</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Previous Draws */}
        <div className="bg-[#111c30] rounded-2xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Draw History
          </h2>

          {loading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse">Loading draws...</div>
          ) : draws.length === 0 ? (
            <div className="text-center py-12">
              <Dices className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No draws yet</p>
              <p className="text-gray-600 text-sm">Trigger your first draw above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {draws.map((draw, index) => {
                const isExpanded = expandedDraw === draw.id
                const winnerCount = draw.winners?.[0]?.count || 0

                return (
                  <motion.div
                    key={draw.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#0a1628] rounded-xl border border-white/5 overflow-hidden"
                  >
                    <button
                      onClick={() => fetchDrawWinners(draw.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-white/3 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium text-white">{draw.month}</span>
                        </div>

                        {/* Winning scores chips */}
                        <div className="hidden md:flex gap-1">
                          {draw.winning_scores?.slice(0, 5).map((score, i) => (
                            <span
                              key={i}
                              className="w-7 h-7 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-300 text-xs font-bold"
                            >
                              {score}
                            </span>
                          ))}
                        </div>

                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          draw.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        }`}>
                          {draw.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-emerald-400 font-semibold text-sm flex items-center gap-0.5">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {draw.total_prize_pool?.toLocaleString('en-IN')}
                          </p>
                          <p className="text-gray-500 text-xs">{winnerCount} winners</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded winners list */}
                    <AnimatePresence>
                      {isExpanded && drawWinners[draw.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5"
                        >
                          <div className="p-4">
                            {drawWinners[draw.id].length === 0 ? (
                              <p className="text-gray-500 text-sm text-center py-4">No winners for this draw</p>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-gray-400 text-xs mb-3">Winners</p>
                                {drawWinners[draw.id].map(winner => (
                                  <div
                                    key={winner.id}
                                    className="flex items-center justify-between p-3 bg-[#111c30] rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tierColor(winner.match_tier)}`}>
                                        {winner.match_tier}
                                      </span>
                                      <div>
                                        <p className="text-white text-sm font-medium">
                                          {winner.profiles?.full_name || 'Anonymous'}
                                        </p>
                                        <p className="text-gray-500 text-xs">{winner.profiles?.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <p className="text-emerald-400 font-semibold text-sm">
                                        ₹{winner.prize_amount?.toLocaleString('en-IN')}
                                      </p>
                                      {winner.is_verified ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">Pending</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

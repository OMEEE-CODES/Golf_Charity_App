'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
  Trophy, Dices, Calendar, IndianRupee,
  CheckCircle, Clock, ArrowLeft, Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface Winning {
  id: string
  matched_scores: number
  prize_amount: number
  match_tier: string
  is_verified: boolean
  verified_at: string | null
  admin_notes: string | null
  created_at: string
  draws: {
    month: string
    winning_scores: number[]
    total_prize_pool: number
    created_at: string
  } | null
}

export default function WinningsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userScores, setUserScores] = useState<number[]>([])
  const [winnings, setWinnings] = useState<Winning[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchData(session.user.id)
      }
    })
  }, [])

  const fetchData = async (uid: string) => {
    setLoading(true)
    try {
      const [scoresRes, winningsRes] = await Promise.all([
        fetch(`/api/scores?userId=${uid}`),
        fetch(`/api/winners?userId=${uid}`),
      ])
      const scoresData = await scoresRes.json()
      const winningsData = await winningsRes.json()
      setUserScores((scoresData.scores || []).map((s: any) => s.score))
      setWinnings(winningsData.winnings || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const totalWon = winnings.reduce((sum, w) => sum + (w.prize_amount || 0), 0)
  const verifiedWon = winnings.filter(w => w.is_verified).reduce((sum, w) => sum + (w.prize_amount || 0), 0)

  const tierColor = (tier: string) => {
    if (tier === '5-Match') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    if (tier === '4-Match') return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold">My Winnings</h1>
          </div>
          <p className="text-gray-400">Your prize history from monthly draws</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-emerald-400 animate-pulse">Loading...</div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#111c30] rounded-2xl p-5 border border-white/5">
                <p className="text-gray-400 text-sm mb-1">Total Prize Won</p>
                <p className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {totalWon.toLocaleString('en-IN')}
                </p>
                <p className="text-gray-600 text-xs mt-1">across {winnings.length} win{winnings.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="bg-[#111c30] rounded-2xl p-5 border border-white/5">
                <p className="text-gray-400 text-sm mb-1">Verified & Paid</p>
                <p className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {verifiedWon.toLocaleString('en-IN')}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {winnings.filter(w => w.is_verified).length} verified
                </p>
              </div>
            </div>

            {/* My Current Scores in draw */}
            {userScores.length > 0 && (
              <div className="bg-[#111c30] rounded-2xl p-5 border border-white/5 mb-6">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Dices className="w-4 h-4 text-purple-400" />
                  My Scores for Next Draw
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {userScores.map((score, i) => (
                    <span
                      key={i}
                      className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-300 font-bold text-sm"
                    >
                      {score}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  Match 3 or more with the winning scores to win a prize in the next draw.
                </p>
              </div>
            )}

            {/* Winnings list */}
            <div className="bg-[#111c30] rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-semibold mb-4">Prize History</h2>

              {winnings.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-1">No winnings yet</p>
                  <p className="text-gray-600 text-sm">Keep adding scores — you need to match 3+ winning numbers!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {winnings.map((winning, index) => (
                    <motion.div
                      key={winning.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border ${
                        winning.is_verified
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-[#0a1628] border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            winning.is_verified ? 'bg-emerald-500/20' : 'bg-yellow-500/10'
                          }`}>
                            {winning.is_verified
                              ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                              : <Trophy className="w-4 h-4 text-yellow-400" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-white font-semibold">
                                {winning.draws?.month} Draw
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tierColor(winning.match_tier)}`}>
                                {winning.match_tier}
                              </span>
                            </div>

                            {/* Winning scores with matches highlighted */}
                            {winning.draws?.winning_scores && (
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <span className="text-gray-500 text-xs">Winning:</span>
                                {winning.draws.winning_scores.map((score, i) => (
                                  <span
                                    key={i}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                      userScores.includes(score)
                                        ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/40'
                                        : 'bg-white/5 text-gray-400'
                                    }`}
                                  >
                                    {score}
                                  </span>
                                ))}
                              </div>
                            )}

                            <p className="text-gray-500 text-xs mt-1.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(winning.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>

                            {/* Admin notes */}
                            {winning.admin_notes && (
                              <p className="text-gray-500 text-xs mt-1 italic">
                                📝 {winning.admin_notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-emerald-400 font-bold text-lg flex items-center gap-0.5 justify-end">
                            <IndianRupee className="w-4 h-4" />
                            {winning.prize_amount?.toLocaleString('en-IN')}
                          </p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            {winning.is_verified ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-xs">
                                  {winning.verified_at
                                    ? new Date(winning.verified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                                    : 'Verified'}
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-amber-400 text-xs">Pending payment</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="mt-4 p-4 bg-white/3 border border-white/5 rounded-xl">
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                🎯 Match 3 scores → 25% of pool &nbsp;|&nbsp; Match 4 → 35% &nbsp;|&nbsp; Match 5 → 40%<br />
                Prize is split equally among all winners in each tier. Payments are processed within 7 days of verification.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

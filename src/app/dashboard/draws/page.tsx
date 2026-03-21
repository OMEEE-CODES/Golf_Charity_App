'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Trophy, Dices, Calendar, IndianRupee, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Winning {
  id: string
  matched_scores: number
  prize_amount: number
  match_tier: string
  is_verified: boolean
  created_at: string
  draws: {
    month: string
    winning_scores: number[]
    total_prize_pool: number
    created_at: string
  } | null
}

export default function UserDrawsPage() {
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
        fetch(`/api/draw/results?userId=${uid}`),
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
            <h1 className="text-3xl font-bold">My Draws & Winnings</h1>
          </div>
          <p className="text-gray-400">Your draw history and prize earnings</p>
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
                <p className="text-gray-400 text-sm mb-1">Total Won</p>
                <p className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                  <IndianRupee className="w-5 h-5" />
                  {totalWon.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-[#111c30] rounded-2xl p-5 border border-white/5">
                <p className="text-gray-400 text-sm mb-1">Times Won</p>
                <p className="text-2xl font-bold text-yellow-400">{winnings.length}</p>
              </div>
            </div>

            {/* My Current Scores */}
            {userScores.length > 0 && (
              <div className="bg-[#111c30] rounded-2xl p-5 border border-white/5 mb-6">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Dices className="w-4 h-4 text-purple-400" />
                  My Scores in Next Draw
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
                  These {userScores.length} score{userScores.length > 1 ? 's' : ''} will be matched against the winning combination in the next monthly draw.
                </p>
              </div>
            )}

            {/* Winnings History */}
            <div className="bg-[#111c30] rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-semibold mb-4">Winnings History</h2>

              {winnings.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-1">No winnings yet</p>
                  <p className="text-gray-600 text-sm">Keep adding scores to increase your chances!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {winnings.map((winning, index) => (
                    <motion.div
                      key={winning.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-[#0a1628] rounded-xl border border-white/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                            <Trophy className="w-4 h-4 text-yellow-400" />
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

                            {/* Winning scores */}
                            {winning.draws?.winning_scores && (
                              <div className="flex items-center gap-1.5 mt-2">
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

                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className="text-gray-500 text-xs">
                                {new Date(winning.created_at).toLocaleDateString('en-GB', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-emerald-400 font-bold text-lg flex items-center gap-0.5">
                            <IndianRupee className="w-4 h-4" />
                            {winning.prize_amount?.toLocaleString('en-IN')}
                          </p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            {winning.is_verified ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-xs">Verified</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-amber-400 text-xs">Pending</span>
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
                🎯 Each month, 5 winning Stableford scores are drawn. Match 3 scores → win 25% pool, match 4 → win 35%, match 5 → win 40%. Prize is split equally among all winners in each tier.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Plus, Trash2, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface Score {
  id: string
  score: number
  played_at: string
  created_at: string
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchScores(session.user.id)
      }
    })
  }, [])

  const fetchScores = async (uid: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/scores?userId=${uid}`)
      const data = await res.json()
      setScores(data.scores || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const scoreNum = parseInt(newScore)
    if (!newScore || isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45')
      return
    }
    if (!newDate) {
      setError('Please select a date')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, score: scoreNum, playedAt: newDate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess('Score added successfully!')
      setNewScore('')
      setNewDate(new Date().toISOString().split('T')[0])
      fetchScores(userId!)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (scoreId: string) => {
    if (!confirm('Remove this score?')) return
    try {
      await fetch('/api/scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreId, userId }),
      })
      fetchScores(userId!)
    } catch (err) {
      console.error(err)
    }
  }

  const average = scores.length > 0
    ? (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(1)
    : '—'

  const highest = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : '—'
  const lowest = scores.length > 0 ? Math.min(...scores.map(s => s.score)) : '—'

  const getScoreColor = (score: number) => {
    if (score >= 36) return 'text-emerald-400'
    if (score >= 25) return 'text-amber-400'
    return 'text-rose-400'
  }

  const getScoreBg = (score: number) => {
    if (score >= 36) return 'bg-emerald-500/10 border-emerald-500/30'
    if (score >= 25) return 'bg-amber-500/10 border-amber-500/30'
    return 'bg-rose-500/10 border-rose-500/30'
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">My Golf Scores</h1>
          <p className="text-gray-400">
            Track your last 5 Stableford scores. New scores automatically replace the oldest.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Average', value: average, icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Highest', value: highest, icon: Trophy, color: 'text-amber-400' },
            { label: 'Scores', value: `${scores.length}/5`, icon: Calendar, color: 'text-blue-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111c30] rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Add Score Form */}
        <div className="bg-[#111c30] rounded-2xl p-6 border border-white/5 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Add New Score
          </h2>

          <form onSubmit={handleAddScore}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Score Input */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">
                  Stableford Score <span className="text-gray-500">(1–45)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="e.g. 32"
                  className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-white text-2xl font-bold text-center focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Date Played</label>
                <input
                  type="date"
                  value={newDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Score Visual Indicator */}
            {newScore && parseInt(newScore) >= 1 && parseInt(newScore) <= 45 && (
              <div className={`mb-4 p-3 rounded-xl border text-center ${getScoreBg(parseInt(newScore))}`}>
                <span className={`text-sm font-medium ${getScoreColor(parseInt(newScore))}`}>
                  {parseInt(newScore) >= 36 ? '🏆 Excellent round!' :
                   parseInt(newScore) >= 25 ? '⛳ Good round' : '💪 Keep improving!'}
                </span>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
            >
              {submitting ? 'Adding...' : scores.length >= 5 ? 'Add Score (replaces oldest)' : 'Add Score'}
            </button>

            {scores.length >= 5 && (
              <p className="text-center text-gray-500 text-xs mt-2">
                You have 5 scores. Adding a new one will remove the oldest.
              </p>
            )}
          </form>
        </div>

        {/* Scores List */}
        <div className="bg-[#111c30] rounded-2xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold mb-4">
            Score History
            <span className="ml-2 text-sm text-gray-400 font-normal">(most recent first)</span>
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading scores...</div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-1">No scores yet</p>
              <p className="text-gray-600 text-sm">Add your first Stableford score above</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {scores.map((score, index) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-xl border ${getScoreBg(score.score)}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank badge */}
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm text-gray-400 font-medium">
                        {index + 1}
                      </div>

                      {/* Score */}
                      <div>
                        <span className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                          {score.score}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">pts</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(score.played_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>

                      {/* Latest badge */}
                      {index === 0 && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Latest
                        </span>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(score.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Draw participation info */}
        {scores.length > 0 && (
          <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-sm text-center">
              ✅ Your {scores.length} score{scores.length > 1 ? 's are' : ' is'} entered into the next monthly draw!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

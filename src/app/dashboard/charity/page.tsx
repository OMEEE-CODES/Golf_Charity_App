'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, CheckCircle, AlertCircle, IndianRupee, Calendar, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Charity {
  id: string
  name: string
  description: string
  logo_url: string | null
  website_url: string | null
  is_active: boolean
}

interface Contribution {
  amount: number
  created_at: string
  charities: { name: string; logo_url: string | null } | null
}

export default function CharityPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [charities, setCharities] = useState<Charity[]>([])
  const [chosenCharityId, setChosenCharityId] = useState<string | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [totalContributed, setTotalContributed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

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
      // Fetch all charities + user's current selection in parallel
      const [listRes, userRes] = await Promise.all([
        fetch('/api/charity?type=list'),
        fetch(`/api/charity?type=user&userId=${uid}`),
      ])

      const listData = await listRes.json()
      const userData = await userRes.json()

      setCharities(listData.charities || [])
      setChosenCharityId(userData.charityId || null)
      setSelectedId(userData.charityId || null)
      setContributions(userData.contributions || [])
      setTotalContributed(userData.totalContributed || 0)
    } catch (e) {
      console.error(e)
      setError('Failed to load charity data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedId || !userId) return
    if (selectedId === chosenCharityId) {
      setSuccess('That is already your chosen charity!')
      setTimeout(() => setSuccess(''), 3000)
      return
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/charity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, charityId: selectedId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setChosenCharityId(selectedId)
      setSuccess('Charity updated successfully! Your next subscription payment will support this cause. 🎉')
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const chosenCharity = charities.find(c => c.id === chosenCharityId)

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <h1 className="text-3xl font-bold">My Charity</h1>
          </div>
          <p className="text-gray-400">
            Choose a charity to support. 20% of every subscription goes directly to your chosen cause.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-emerald-400 animate-pulse">Loading charities...</div>
          </div>
        ) : (
          <>
            {/* Contribution Stats */}
            {totalContributed > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-rose-500/10 to-emerald-500/10 border border-rose-500/20 rounded-2xl p-5 mb-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                  <span className="font-semibold text-rose-300">Your Impact So Far</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Donated</p>
                    <p className="text-2xl font-bold text-white flex items-center gap-1">
                      <IndianRupee className="w-5 h-5 text-emerald-400" />
                      {totalContributed.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Payments Made</p>
                    <p className="text-2xl font-bold text-white">{contributions.length}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Currently Supporting Banner */}
            {chosenCharity && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-400 font-medium text-sm">Currently Supporting</p>
                  <p className="text-white font-semibold">{chosenCharity.name}</p>
                </div>
              </div>
            )}

            {/* Charity Selection */}
            <div className="bg-[#111c30] rounded-2xl p-6 border border-white/5 mb-6">
              <h2 className="text-lg font-semibold mb-1">Choose Your Charity</h2>
              <p className="text-gray-400 text-sm mb-5">
                Select one charity to receive 20% of your subscription (₹200/month or ₹2,000/year)
              </p>

              {charities.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No charities available at the moment.
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {charities.map((charity, index) => {
                      const isSelected = selectedId === charity.id
                      const isCurrent = chosenCharityId === charity.id

                      return (
                        <motion.button
                          key={charity.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedId(charity.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/50'
                              : 'bg-[#0a1628] border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Logo / Initials */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-rose-500/30 flex items-center justify-center shrink-0 text-lg font-bold text-white">
                              {charity.logo_url ? (
                                <img
                                  src={charity.logo_url}
                                  alt={charity.name}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                charity.name.charAt(0)
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-white">{charity.name}</span>
                                {isCurrent && (
                                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    Current
                                  </span>
                                )}
                              </div>
                              {charity.description && (
                                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                  {charity.description}
                                </p>
                              )}
                            </div>

                            {/* Radio indicator */}
                            <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                              isSelected ? 'border-emerald-400' : 'border-gray-600'
                            }`}>
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              )}
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}

              {/* Feedback messages */}
              {error && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  {success}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || !selectedId}
                className="mt-5 w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
              >
                {saving ? 'Saving...' : selectedId === chosenCharityId ? '✓ Charity Saved' : 'Save My Charity'}
              </button>
            </div>

            {/* Contribution History */}
            {contributions.length > 0 && (
              <div className="bg-[#111c30] rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-400" />
                  Contribution History
                </h2>

                <div className="space-y-3">
                  {contributions.map((contrib, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center justify-between p-3 bg-[#0a1628] rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                          <Heart className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {(contrib.charities as any)?.name || 'Charity'}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(contrib.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {contrib.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-gray-600 text-xs">donated</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="mt-4 p-4 bg-white/3 border border-white/5 rounded-xl">
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                💡 20% of your subscription fee goes to your chosen charity. You can change your charity anytime — the new charity will receive contributions from your next payment onwards.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

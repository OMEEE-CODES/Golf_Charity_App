'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Send, Loader } from 'lucide-react'

const EMAIL_TYPES = [
  {
    type: 'welcome',
    label: '👋 Welcome Email',
    desc: 'Sent when a user signs up',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    data: (email: string) => ({ name: 'Omkar More' }),
  },
  {
    type: 'subscription',
    label: '✅ Subscription Confirmed',
    desc: 'Sent after successful payment',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    data: (email: string) => ({
      name: 'Omkar More',
      plan: 'monthly',
      amount: 999,
      nextDraw: 'April 2026',
    }),
  },
  {
    type: 'draw_results',
    label: '🎲 Draw Results',
    desc: 'Sent after monthly draw is run',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    data: (email: string) => ({
      name: 'Omkar More',
      month: '2026-03',
      winningScores: [1, 8, 13, 17, 37],
      userScores: [6, 5, 1, 1, 3],
      matched: 1,
    }),
  },
  {
    type: 'winner',
    label: '🏆 Winner Notification',
    desc: 'Sent when admin verifies a prize',
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    data: (email: string) => ({
      name: 'Omkar More',
      tier: '4-Match',
      prize: 2100,
      month: '2026-03',
      notes: 'Payment sent via NEFT on 20 Mar 2026',
    }),
  },
]

export default function EmailTestPage() {
  const [toEmail, setToEmail] = useState('')
  const [sending, setSending] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({})

  const sendTest = async (type: string, getData: (e: string) => any) => {
    if (!toEmail) {
      alert('Please enter a recipient email first!')
      return
    }

    setSending(type)
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          to: toEmail,
          data: getData(toEmail),
        }),
      })
      const data = await res.json()

      setResults(prev => ({
        ...prev,
        [type]: {
          success: res.ok && data.success,
          message: res.ok ? `Sent! ID: ${data.messageId}` : (data.error || 'Failed'),
        },
      }))
    } catch (err: any) {
      setResults(prev => ({
        ...prev,
        [type]: { success: false, message: err.message },
      }))
    } finally {
      setSending(null)
    }
  }

  const allSent = Object.values(results).filter(r => r.success).length

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Email Test Center</h1>
              <p className="text-gray-400 text-sm">Send test emails to verify all templates</p>
            </div>
          </div>
        </div>

        {/* Recipient Input */}
        <div className="bg-[#111c30] rounded-2xl p-5 border border-white/5 mb-6">
          <label className="text-sm text-gray-400 mb-2 block">
            📬 Recipient Email (send all test emails here)
          </label>
          <input
            type="email"
            value={toEmail}
            onChange={e => setToEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full bg-[#0a1628] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
          <p className="text-gray-600 text-xs mt-2">
            ⚠️ On Resend free plan, you can only send to your own verified email address.
          </p>
        </div>

        {/* Progress */}
        {allSent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center"
          >
            ✅ {allSent}/{EMAIL_TYPES.length} emails sent successfully
          </motion.div>
        )}

        {/* Email Types */}
        <div className="space-y-3">
          {EMAIL_TYPES.map((emailType) => {
            const result = results[emailType.type]
            const isSending = sending === emailType.type

            return (
              <motion.div
                key={emailType.type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111c30] rounded-2xl p-5 border border-white/5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`px-2 py-0.5 rounded-lg text-xs font-medium border shrink-0 mt-0.5 ${emailType.color}`}>
                      {emailType.type}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm">{emailType.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{emailType.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => sendTest(emailType.type, emailType.data)}
                    disabled={isSending || !toEmail}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all"
                  >
                    {isSending ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Test
                      </>
                    )}
                  </button>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-3 flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                        result.success
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}
                    >
                      {result.success
                        ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        : <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      }
                      {result.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Send All button */}
        <button
          onClick={async () => {
            for (const et of EMAIL_TYPES) {
              await sendTest(et.type, et.data)
            }
          }}
          disabled={!!sending || !toEmail}
          className="mt-5 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send All 4 Test Emails
        </button>

        <p className="text-gray-600 text-xs text-center mt-4">
          Check your inbox at <span className="text-gray-400">{toEmail || 'your email'}</span> after sending
        </p>
      </div>
    </div>
  )
}

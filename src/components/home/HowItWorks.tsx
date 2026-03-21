'use client'

import { motion } from 'framer-motion'
import { UserPlus, ClipboardList, Trophy, Heart } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Subscribe',
    desc: 'Choose a monthly or yearly plan. A portion of every subscription goes to your chosen charity.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/20',
  },
  {
    icon: ClipboardList,
    step: '02',
    title: 'Log Your Scores',
    desc: 'Enter your last 5 Stableford scores (1–45). Your rolling scores are your draw entries.',
    color: 'from-teal-500/20 to-teal-500/5',
    border: 'border-teal-500/20',
  },
  {
    icon: Trophy,
    step: '03',
    title: 'Win Monthly Prizes',
    desc: 'Match 3, 4, or 5 numbers in our monthly draw. Jackpot rolls over if unclaimed!',
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/20',
  },
  {
    icon: Heart,
    step: '04',
    title: 'Give Back',
    desc: 'Minimum 10% of your subscription goes directly to the charity of your choice.',
    color: 'from-rose-500/20 to-rose-500/5',
    border: 'border-rose-500/20',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0a0f0a]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mb-3">Simple & Transparent</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How GolfHero Works</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Four simple steps between you and making a real difference — on and off the course.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative bg-gradient-to-b ${step.color} border ${step.border} rounded-2xl p-6 group hover:scale-[1.02] transition-transform`}
            >
              {/* Step number */}
              <span className="text-white/10 font-bold text-6xl absolute top-4 right-4 leading-none select-none">
                {step.step}
              </span>

              {/* Icon */}
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-white font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Prize breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-8"
        >
          <h3 className="text-white font-bold text-xl text-center mb-8">Prize Pool Distribution</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { match: '5-Number Match', share: '40%', rollover: true, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { match: '4-Number Match', share: '35%', rollover: false, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { match: '3-Number Match', share: '25%', rollover: false, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
            ].map((tier) => (
              <div key={tier.match} className={`${tier.bg} border rounded-xl p-5 text-center`}>
                <p className={`${tier.color} font-bold text-3xl`}>{tier.share}</p>
                <p className="text-white font-medium mt-1">{tier.match}</p>
                {tier.rollover && (
                  <span className="inline-block mt-2 bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                    Jackpot rolls over
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

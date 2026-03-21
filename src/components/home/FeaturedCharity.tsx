'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, ArrowRight, ExternalLink } from 'lucide-react'

export default function FeaturedCharity() {
  return (
    <section className="py-24 bg-[#0c120c]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mb-2">Spotlight</p>
            <h2 className="text-4xl font-bold text-white">Featured Charity</h2>
          </div>
          <Link href="/charities"
            className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            View all charities <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Featured card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-emerald-950/50 to-[#0a0f0a] border border-emerald-900/30 rounded-3xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-0">

            {/* Left — Info */}
            <div className="p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full border border-emerald-500/20">
                    ⭐ Featured Charity
                  </span>
                </div>

                <h3 className="text-3xl font-bold text-white mb-4">Cancer Research UK</h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  World-leading cancer research organisation funding life-saving work across all types of cancer.
                  Every subscription contribution helps fund cutting-edge research that saves lives.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { value: '£8,240', label: 'Raised this month' },
                    { value: '1,240', label: 'GolfHero supporters' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-4">
                      <p className="text-emerald-400 font-bold text-xl">{stat.value}</p>
                      <p className="text-gray-500 text-sm">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/charities/cancer-research-uk"
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                  <Heart className="w-4 h-4" /> Support This Charity
                </Link>
                <Link href="/charities"
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
                  Browse All <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right — Visual */}
            <div className="relative bg-gradient-to-br from-emerald-900/30 to-emerald-950/50 p-10 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-24 h-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                  <Heart className="w-12 h-12 text-emerald-400" />
                </div>
                <p className="text-white font-bold text-2xl mb-2">Every Round Counts</p>
                <p className="text-gray-400 text-sm max-w-xs">
                  10% of every subscription automatically goes to your chosen charity
                </p>

                {/* Upcoming event */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                  <p className="text-emerald-400 text-xs font-medium uppercase mb-1">Upcoming Event</p>
                  <p className="text-white font-medium text-sm">Charity Golf Day 2026</p>
                  <p className="text-gray-500 text-xs mt-0.5">15th April 2026 · St Andrews, Scotland</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other charities preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
        >
          {[
            'Golf Foundation',
            'Help for Heroes',
            'Macmillan Cancer Support',
            'British Heart Foundation',
          ].map((name) => (
            <Link key={name} href="/charities"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-center transition-colors group">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{name}</p>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="py-24 bg-[#0a0f0a]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-emerald-950 via-[#0d1a0d] to-[#0a0f0a] border border-emerald-900/40 rounded-3xl p-12 text-center overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mb-4">
              Join the Movement
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to play for<br />a cause?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join 2,400+ golfers who are making every round count.
              Subscribe today and start entering monthly prize draws.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg w-full sm:w-auto"
              >
                Get Started — Free to Join →
              </Link>
              <Link
                href="/charities"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Browse charities first
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-gray-500 text-sm">
              <span>✓ Cancel anytime</span>
              <span>✓ 10% goes to charity</span>
              <span>✓ Monthly prize draws</span>
              <span>✓ No hidden fees</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

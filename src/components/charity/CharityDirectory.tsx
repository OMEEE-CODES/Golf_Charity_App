'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Heart, Star, ExternalLink, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CharityDirectory() {
  const [charities, setCharities] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCharities = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })

      if (error) {
        console.error('Error fetching charities:', error)
      } else {
        setCharities(data || [])
      }
      setLoading(false)
    }

    fetchCharities()
  }, [])

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0f0a] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-emerald-400 text-sm font-medium uppercase tracking-widest mb-3">Make a difference</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Charity Partners</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose a charity at signup and 10% of your subscription goes directly to supporting their work.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-md mx-auto mb-12"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        )}

        {/* Charity Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((charity, i) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-6 transition-all"
              >
                {/* Charity icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <Heart className="w-7 h-7 text-emerald-400" />
                  </div>
                  {charity.is_featured && (
                    <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-medium px-2 py-1 rounded-full border border-amber-500/20">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                <h3 className="text-white font-bold text-xl mb-2 group-hover:text-emerald-400 transition-colors">
                  {charity.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
                  {charity.description}
                </p>

                <div className="flex items-center justify-between">
                  <Link
                    href={`/charities/${charity.id}`}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    Learn more <ExternalLink className="w-3 h-3" />
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Support
                  </Link>
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="col-span-3 text-center py-16">
                <p className="text-gray-500 text-lg">No charities found{search ? ` matching "${search}"` : ''}</p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-gray-400 mb-4">Ready to start supporting a charity?</p>
            <Link
              href="/auth/signup"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-block"
            >
              Subscribe & Choose Your Charity →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

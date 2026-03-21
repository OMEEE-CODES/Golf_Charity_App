'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, Search, Crown, TrendingUp,
  Heart, ArrowLeft, IndianRupee, CheckCircle, Clock
} from 'lucide-react'

interface User {
  id: string
  full_name: string
  email: string
  created_at: string
  subscription: { plan: string; status: string } | null
  scoreCount: number
  totalContributed: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    fetchUsers()
  }, [debouncedSearch])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users${debouncedSearch ? `?search=${debouncedSearch}` : ''}`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const activeCount = users.filter(u => u.subscription?.status === 'active').length

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-5xl mx-auto">

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
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Users</h1>
              <p className="text-gray-400 text-sm">{users.length} total · {activeCount} active subscribers</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111c30] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Users Table */}
        <div className="bg-[#111c30] rounded-2xl border border-white/5 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400 animate-pulse">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">User</div>
                <div className="col-span-2">Subscription</div>
                <div className="col-span-2 text-center">Scores</div>
                <div className="col-span-2 text-right">Contributed</div>
                <div className="col-span-2 text-right">Joined</div>
              </div>

              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/2 transition-colors"
                >
                  {/* User */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {user.full_name || 'Unknown'}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Subscription */}
                  <div className="col-span-2">
                    {user.subscription ? (
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          user.subscription.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        }`}>
                          {user.subscription.plan}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">No sub</span>
                    )}
                  </div>

                  {/* Scores */}
                  <div className="col-span-2 text-center">
                    <span className={`text-sm font-semibold ${user.scoreCount > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                      {user.scoreCount}/5
                    </span>
                  </div>

                  {/* Contributed */}
                  <div className="col-span-2 text-right">
                    {user.totalContributed > 0 ? (
                      <span className="text-rose-400 text-sm font-medium">
                        ₹{user.totalContributed.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-sm">—</span>
                    )}
                  </div>

                  {/* Joined */}
                  <div className="col-span-2 text-right">
                    <span className="text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: '2-digit'
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <p className="text-gray-600 text-xs text-center mt-4">
          Showing {users.length} user{users.length !== 1 ? 's' : ''}
          {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
        </p>
      </div>
    </div>
  )
}

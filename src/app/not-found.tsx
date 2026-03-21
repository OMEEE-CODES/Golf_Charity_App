import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">⛳</span>
        </div>
        <h1 className="text-6xl font-bold text-emerald-400 mb-3">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Ball in the rough!</h2>
        <p className="text-gray-400 mb-8">
          This page doesn't exist — looks like your shot went out of bounds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

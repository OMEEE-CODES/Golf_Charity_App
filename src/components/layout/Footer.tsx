import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0a0f0a] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="font-bold text-lg text-white">GolfHero</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Golf that changes lives. Play, win prizes, and support the charities you care about.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-3">
              {[
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/charities', label: 'Charities' },
                { href: '/auth/signup', label: 'Subscribe' },
                { href: '/auth/login', label: 'Sign In' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-500 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact Us' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-500 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Draw Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Monthly Draw</h4>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-emerald-400 font-bold text-lg">£5,240</p>
                <p className="text-gray-500 text-xs">Current Jackpot</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white font-medium text-sm">Next Draw</p>
                <p className="text-gray-500 text-xs">31st March 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">© 2026 GolfHero. All rights reserved.</p>
          <p className="text-gray-600 text-sm">
            Built with ❤️ for golfers who give back
          </p>
        </div>
      </div>
    </footer>
  )
}

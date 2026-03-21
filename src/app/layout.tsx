import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'GolfHero — Play. Win. Give.',
    template: '%s | GolfHero',
  },
  description: 'A subscription golf platform combining performance tracking, monthly prize draws, and charitable giving.',
  keywords: ['golf', 'charity', 'subscription', 'prize draw', 'stableford'],
  authors: [{ name: 'GolfHero' }],
  openGraph: {
    title: 'GolfHero — Play. Win. Give.',
    description: 'Golf that changes lives. Subscribe, track scores, win prizes, support charity.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0f0a] text-white antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  )
}

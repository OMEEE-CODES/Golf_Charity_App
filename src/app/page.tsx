import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import HowItWorks from '@/components/home/HowItWorks'
import FeaturedCharity from '@/components/home/FeaturedCharity'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <main className="bg-[#0a0f0a]">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturedCharity />
      <CTASection />
      <Footer />
    </main>
  )
}

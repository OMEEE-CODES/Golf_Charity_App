import CharityDirectory from '@/components/charity/CharityDirectory'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Charities | GolfHero',
  description: 'Browse and support charities through your GolfHero subscription',
}

export default function CharitiesPage() {
  return (
    <>
      <Navbar />
      <CharityDirectory />
      <Footer />
    </>
  )
}

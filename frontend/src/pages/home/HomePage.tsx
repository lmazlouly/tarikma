import { HeroSection } from './components/HeroSection'
import { CitySelection } from './components/CitySelection'
import { HowItWorks } from './components/HowItWorks'
import { TourismCompanies } from './components/TourismCompanies'
import { IndependentGuides } from './components/IndependentGuides'
import { SmartPersonalization } from './components/SmartPersonalization'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <CitySelection />
      <HowItWorks />
      <TourismCompanies />
      <IndependentGuides />
      <SmartPersonalization />
    </>
  )
}

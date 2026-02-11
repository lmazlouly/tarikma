import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Spacer for fixed desktop navbar */}
      <div className="hidden md:block h-[73px]" />

      <main>
        <Outlet />
      </main>

      <Footer />

      {/* Spacer for fixed mobile bottom bar */}
      <div className="md:hidden h-[68px]" />
    </div>
  )
}

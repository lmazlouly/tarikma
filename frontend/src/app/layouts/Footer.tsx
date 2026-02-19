import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="text-lg font-bold tracking-tight text-gray-900">
            Tarik<span className="text-brand-gold">.ma</span>
          </Link>

          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/" className="transition hover:text-gray-900">
              Home
            </Link>
            <a href="#how-it-works" className="transition hover:text-gray-900">
              How It Works
            </a>
            <a href="#companies" className="transition hover:text-gray-900">
              Companies
            </a>
            <a href="#guides" className="transition hover:text-gray-900">
              Guides
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Tarik.ma — Plan your Moroccan city trip.
        </div>
      </div>
    </footer>
  )
}

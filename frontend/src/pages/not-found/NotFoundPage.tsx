import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-zinc-300">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="text-sm font-medium text-white underline">
        Go home
      </Link>
    </div>
  )
}

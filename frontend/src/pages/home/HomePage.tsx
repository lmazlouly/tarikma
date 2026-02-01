export function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-zinc-300">
        This frontend is set up with Vite + React + Tailwind, modular routing, and Orval API generation.
      </p>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-300">
        <div className="font-medium text-zinc-100">Next steps</div>
        <div className="mt-2 space-y-1">
          <div>1) Run: pnpm install</div>
          <div>2) Run: pnpm generate:api (backend must be running)</div>
          <div>3) Run: pnpm dev</div>
        </div>
      </div>
    </div>
  )
}

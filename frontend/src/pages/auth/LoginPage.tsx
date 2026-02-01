import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../../shared/api/auth-controller/auth-controller'
import { useAuth } from '../../app/auth/AuthContext'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { setToken } = useAuth()

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token ?? null)
        navigate('/dashboard', { replace: true })
      },
    },
  })

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-zinc-300">Sign in to get a JWT.</p>
      </div>

      <form className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
        <label className="block">
          <div className="text-sm text-zinc-200">Username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </label>

        <label className="block">
          <div className="text-sm text-zinc-200">Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </label>

        {loginMutation.isError ? (
          <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            Login failed
          </div>
        ) : null}

        <button
          type="button"
          className="w-full rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
          disabled={loginMutation.isPending}
          onClick={() => loginMutation.mutate({ data: { username, password } })}
        >
          {loginMutation.isPending ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}

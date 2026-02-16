import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useLogin } from '../../shared/api/auth-controller/auth-controller'
import { useAuth } from '../../app/auth/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const navigate = useNavigate()
  const { setToken } = useAuth()

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tarikma_login_email')
      if (saved) setEmail(saved)
    } catch {}
  }, [])

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token ?? null)

        try {
          if (rememberMe) localStorage.setItem('tarikma_login_email', email)
          else localStorage.removeItem('tarikma_login_email')
        } catch {}

        navigate('/dashboard', { replace: true })
      },
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ data: { email, password } })
  }

  const errorMessage = useMemo(() => {
    if (!loginMutation.isError) return null
    return 'Invalid email or password'
  }, [loginMutation.isError])

  return (
    <div className="min-h-[100dvh] bg-white text-gray-900">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-64 w-[28rem] -translate-x-1/2 rounded-full bg-brand-ocean/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-72 w-[32rem] rounded-full bg-brand-ocean/5 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-white" />
      </div>

      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-10 pt-10 sm:justify-center sm:pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mb-6 text-center sm:mb-8"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-ocean/10 bg-brand-ocean/5 shadow-sm"
          >
            <span className="text-lg font-semibold tracking-tight text-brand-ocean">T</span>
          </motion.div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your Tarik.ma account</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <label className="block">
              <div className="mb-1.5 text-sm font-medium text-gray-700">Email</div>
              <div className="relative">
                <Icon
                  icon="lucide:mail"
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-ocean-light focus:ring-2 focus:ring-brand-ocean-light/20"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Password</span>
                <Link
                  to="/forgot-password"
                  className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-900 hover:no-underline"
                >
                  Forgot?
                </Link>
              </div>

              <div className="relative">
                <Icon
                  icon="lucide:lock"
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-ocean-light focus:ring-2 focus:ring-brand-ocean-light/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  // whileTap={{ scale: 0.98 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-ocean-light/20"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} className="h-[18px] w-[18px]" />
                </button>
              </div>
            </label>

            {/* Remember me */}
            <div className="flex items-center justify-between gap-3">
              <label className="flex select-none items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 bg-white text-brand-ocean focus:ring-2 focus:ring-brand-ocean-light/20"
                />
                Remember me
              </label>

              <div className="text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Icon icon="lucide:shield-check" className="h-[14px] w-[14px]" />
                  Secure sign in
                </span>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence initial={false}>
              {errorMessage ? (
                <motion.div
                  key="login-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
                >
                  <Icon icon="lucide:triangle-alert" className="mt-0.5 h-[18px] w-[18px] shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.99 }}
              className="group relative w-full overflow-hidden rounded-xl bg-brand-ocean px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-ocean-hover disabled:opacity-60"
              disabled={loginMutation.isPending}
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {loginMutation.isPending ? (
                  <>
                    <Icon icon="lucide:loader-circle" className="h-[18px] w-[18px] animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:log-in" className="h-[18px] w-[18px]" />
                    Sign in
                  </>
                )}
              </span>

              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="absolute -left-24 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-black/10 blur-2xl" />
                <span className="absolute -right-24 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-black/10 blur-2xl" />
              </span>
            </motion.button>

            {/* Footer */}
            <div className="pt-1">
              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-brand-ocean font-medium underline underline-offset-2 hover:text-brand-ocean-hover hover:no-underline">
                  Create one
                </Link>
              </p>

              <p className="mt-3 text-center text-xs text-gray-400">
                By signing in, you agree to our{' '}
                <Link to="/terms" className="underline underline-offset-2 hover:text-gray-700 hover:no-underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline underline-offset-2 hover:text-gray-700 hover:no-underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </form>
        </motion.div>

        {/* Small mobile helper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.2 }}
          className="mt-6 text-center text-xs text-gray-400"
        >
          Tip: On mobile, you can use your password manager for faster sign in.
        </motion.div>
      </div>
    </div>
  )
}

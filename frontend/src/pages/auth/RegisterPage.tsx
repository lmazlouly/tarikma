import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { useRegister } from '../../shared/api/auth-controller/auth-controller'
import { useAuth } from '../../app/auth/AuthContext'
import type { RegistrationUserType } from '../../shared/api/model/registerRequest'

const USER_TYPE_OPTIONS: { value: RegistrationUserType; label: string; description: string; icon: string }[] = [
  { value: 'TOURIST', label: 'Tourist', description: 'Browse and book tours and experiences', icon: 'lucide:backpack' },
  { value: 'COMPANY', label: 'Company', description: 'Manage tours and team members', icon: 'lucide:building-2' },
  { value: 'GUIDE', label: 'Individual Guide', description: 'Offer your services independently', icon: 'lucide:compass' },
]

const inputClass =
  'h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-ocean-light focus:ring-2 focus:ring-brand-ocean-light/20'

export function RegisterPage() {
  const [userType, setUserType] = useState<RegistrationUserType | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [bio, setBio] = useState('')
  const [languages, setLanguages] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { setToken } = useAuth()

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token ?? null)
        navigate('/dashboard', { replace: true })
      },
    },
  })

  const selected = useMemo(() => USER_TYPE_OPTIONS.find((o) => o.value === userType) ?? null, [userType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) return

    registerMutation.mutate({
      data: {
        userType,
        fullName,
        email,
        password,
        phone: phone.trim() || undefined,
        ...(userType === 'COMPANY' && {
          companyName: companyName.trim(),
          companyDescription: companyDescription.trim() || undefined,
        }),
        ...(userType === 'GUIDE' && {
          bio: bio.trim() || undefined,
          languages: languages.trim() || undefined,
        }),
      },
    })
  }

  const errorMessage = useMemo(() => {
    if (!registerMutation.isError) return null
    return 'Registration failed. The email may already be in use.'
  }, [registerMutation.isError])

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

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {userType ? 'Create an account' : 'Join Tarik.ma'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {userType ? (
              <>
                Registering as <span className="font-medium text-gray-900">{selected?.label}</span>
              </>
            ) : (
              'Choose how you would like to use the platform'
            )}
          </p>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {/* Step 1: Choose type */}
          {!userType ? (
            <motion.div
              key="type-step"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-6"
            >
              <div className="space-y-3">
                {USER_TYPE_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.value}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setUserType(opt.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-brand-sand-light px-4 py-4 text-left transition-colors hover:border-brand-sand-muted hover:bg-brand-sand"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-brand-ocean/10 bg-white">
                        <Icon icon={opt.icon} className="h-5 w-5 text-brand-ocean" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            Continue <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">{opt.description}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-ocean font-medium underline underline-offset-2 hover:text-brand-ocean-hover hover:no-underline">
                  Sign in
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Step 2: Form */
            <motion.div
              key="form-step"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-6"
            >
              {/* Type pill + change */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                  <Icon icon={selected?.icon ?? 'lucide:user'} className="h-4 w-4" />
                  <span>{selected?.label}</span>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setUserType(null)}
                  className="inline-flex items-center gap-1 text-xs text-brand-ocean-light underline underline-offset-2 hover:text-brand-ocean hover:no-underline"
                >
                  <Icon icon="lucide:arrow-left" className="h-4 w-4" />
                  Change type
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full name */}
                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-gray-700">Full Name</div>
                  <div className="relative">
                    <Icon
                      icon="lucide:user"
                      className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                      className={"pl-10 pr-3 " + inputClass}
                    />
                  </div>
                </label>

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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className={"pl-10 pr-3 " + inputClass}
                    />
                  </div>
                </label>

                {/* Password */}
                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-gray-700">Password</div>
                  <div className="relative">
                    <Icon
                      icon="lucide:lock"
                      className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      className={"pl-10 pr-12 " + inputClass}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      whileTap={{ scale: 0.98 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-ocean-light/20"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} className="h-[18px] w-[18px]" />
                    </motion.button>
                  </div>

                  {/* Tiny helper */}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <Icon icon="lucide:info" className="h-4 w-4" />
                    Use at least 6 characters. A stronger password is recommended.
                  </div>
                </label>

                {/* Phone */}
                <label className="block">
                  <div className="mb-1.5 text-sm font-medium text-gray-700">
                    Phone <span className="text-gray-400">(optional)</span>
                  </div>
                  <div className="relative">
                    <Icon
                      icon="lucide:phone"
                      className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+212 6XX XXX XXX"
                      autoComplete="tel"
                      className={"pl-10 pr-3 " + inputClass}
                    />
                  </div>
                </label>

                {/* COMPANY fields */}
                <AnimatePresence initial={false}>
                  {userType === 'COMPANY' ? (
                    <motion.div
                      key="company-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Icon icon="lucide:building-2" className="h-4 w-4" />
                          Company details
                        </div>

                        <div className="space-y-4">
                          <label className="block">
                            <div className="mb-1.5 text-sm font-medium text-gray-700">Company Name</div>
                            <input
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Your company name"
                              required
                              className={inputClass}
                            />
                          </label>

                          <label className="block">
                            <div className="mb-1.5 text-sm font-medium text-gray-700">
                              Company Description <span className="text-gray-400">(optional)</span>
                            </div>
                            <textarea
                              value={companyDescription}
                              onChange={(e) => setCompanyDescription(e.target.value)}
                              placeholder="Brief description of your company"
                              rows={3}
                              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-ocean-light focus:ring-2 focus:ring-brand-ocean-light/20"
                            />
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* GUIDE fields */}
                <AnimatePresence initial={false}>
                  {userType === 'GUIDE' ? (
                    <motion.div
                      key="guide-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Icon icon="lucide:compass" className="h-4 w-4" />
                          Guide profile
                        </div>

                        <div className="space-y-4">
                          <label className="block">
                            <div className="mb-1.5 text-sm font-medium text-gray-700">
                              Bio <span className="text-gray-400">(optional)</span>
                            </div>
                            <textarea
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Tell tourists about yourself"
                              rows={3}
                              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-ocean-light focus:ring-2 focus:ring-brand-ocean-light/20"
                            />
                          </label>

                          <label className="block">
                            <div className="mb-1.5 text-sm font-medium text-gray-700">
                              Languages <span className="text-gray-400">(optional)</span>
                            </div>
                            <div className="relative">
                              <Icon
                                icon="lucide:languages"
                                className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                              />
                              <input
                                value={languages}
                                onChange={(e) => setLanguages(e.target.value)}
                                placeholder="e.g. Arabic, French, English"
                                className={"pl-10 pr-3 " + inputClass}
                              />
                            </div>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence initial={false}>
                  {errorMessage ? (
                    <motion.div
                      key="register-error"
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
                  disabled={registerMutation.isPending}
                >
                  <span className="relative z-10 inline-flex items-center justify-center gap-2">
                    {registerMutation.isPending ? (
                      <>
                        <Icon icon="lucide:loader-circle" className="h-[18px] w-[18px] animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:user-plus" className="h-[18px] w-[18px]" />
                        Create account
                      </>
                    )}
                  </span>

                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="absolute -left-24 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-black/10 blur-2xl" />
                    <span className="absolute -right-24 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-black/10 blur-2xl" />
                  </span>
                </motion.button>

                {/* Footer */}
                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-sm text-gray-500 sm:text-left">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-ocean font-medium underline underline-offset-2 hover:text-brand-ocean-hover hover:no-underline">
                      Sign in
                    </Link>
                  </p>

                  <p className="text-center text-xs text-gray-400 sm:text-right">
                    By creating an account, you accept our{' '}
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
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

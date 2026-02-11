import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type JwtPayload = {
  exp?: number
  roles?: string[]
  email?: string
  fullName?: string
  sub?: string
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return atob(padded)
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const json = base64UrlDecode(parts[1])
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export type AuthContextValue = {
  token: string | null
  roles: string[]
  email: string | null
  fullName: string | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  logout: () => void
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'))

  const payload = useMemo(() => (token ? decodeJwtPayload(token) : null), [token])

  const expMs = payload?.exp ? payload.exp * 1000 : null
  const isExpired = expMs ? Date.now() >= expMs : false

  const effectiveToken = token && !isExpired ? token : null
  const roles: string[] = effectiveToken
    ? (payload?.roles ?? []).map((r) => r.toUpperCase())
    : []
  const email = effectiveToken ? payload?.email ?? payload?.sub ?? null : null
  const fullName = effectiveToken ? payload?.fullName ?? null : null

  const setToken = (next: string | null) => {
    if (next) {
      localStorage.setItem('token', next)
      setTokenState(next)
    } else {
      localStorage.removeItem('token')
      setTokenState(null)
    }
  }

  const logout = () => setToken(null)

  const hasRole = (wanted: string) => {
    const normalizedWanted = wanted.trim().toUpperCase()
    if (!effectiveToken) return false
    return roles.includes(normalizedWanted)
  }

  const value: AuthContextValue = {
    token: effectiveToken,
    roles,
    email,
    fullName,
    isAuthenticated: Boolean(effectiveToken),
    setToken,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

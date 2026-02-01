import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type JwtPayload = {
  exp?: number
  role?: string
  username?: string
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
  role: string | null
  username: string | null
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
  const role = effectiveToken ? payload?.role?.toUpperCase?.() ?? null : null
  const username = effectiveToken ? payload?.username ?? payload?.sub ?? null : null

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
    if (!role) return false
    return role === normalizedWanted
  }

  const value: AuthContextValue = {
    token: effectiveToken,
    role,
    username,
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

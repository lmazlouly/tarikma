import Axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

const baseURL = typeof __API_BASE_URL__ === 'string' && __API_BASE_URL__ ? __API_BASE_URL__ : '/api'

export const AXIOS_INSTANCE = Axios.create({ baseURL })

type JwtPayload = {
  exp?: number
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  return atob(padded)
}

function isJwtExpired(token: string): boolean {
  const parts = token.split('.')
  if (parts.length < 2) return true

  try {
    const json = base64UrlDecode(parts[1])
    const payload = JSON.parse(json) as JwtPayload
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

AXIOS_INSTANCE.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')

  if (token) {
    if (isJwtExpired(token)) {
      localStorage.removeItem('token')
    } else {
      ;(config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  return config
})

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return AXIOS_INSTANCE.request<T>({ ...config }).then((response: { data: T }) => response.data)
}

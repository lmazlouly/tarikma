import Axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'

const baseURL = typeof __API_BASE_URL__ === 'string' && __API_BASE_URL__ ? __API_BASE_URL__ : '/api'

export const AXIOS_INSTANCE = Axios.create({ baseURL })

AXIOS_INSTANCE.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    ;(config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  return config
})

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return AXIOS_INSTANCE.request<T>({ ...config }).then((response: { data: T }) => response.data)
}

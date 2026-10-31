import axios from 'axios'
import { getSessionToken } from '@/lib/session-token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = getSessionToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? ''
      const isAuthEntryPoint = /\/auth\/(login|signup|session)$/.test(requestUrl)
      if (!isAuthEntryPoint && getSessionToken()) {
        window.dispatchEvent(new CustomEvent('kurio:session-expired'))
      }
    }
    return Promise.reject(error)
  },
)

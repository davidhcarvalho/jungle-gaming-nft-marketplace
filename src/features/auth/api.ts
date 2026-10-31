import { apiClient } from '@/api/client'
import type { ApiError, AuthPayload, AuthResponse, SignupPayload, SessionResponse } from '@/types/api'
import { clearSessionToken, setSessionToken } from '@/lib/session-token'
import axios from 'axios'

export async function getCurrentSession(signal?: AbortSignal): Promise<SessionResponse> {
  try {
    const response = await apiClient.get<SessionResponse>('/auth/session', { signal })
    return response.data
  } catch (error) {
    if (axios.isAxiosError<ApiError>(error) && error.response?.status === 401) {
      clearSessionToken()
      return null
    }
    throw error
  }
}

export async function login(payload: AuthPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload)
  setSessionToken(response.data.sessionToken)
  return response.data
}

export async function signup(payload: SignupPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/signup', payload)
  setSessionToken(response.data.sessionToken)
  return response.data
}

export async function logout() {
  try {
    await apiClient.post('/auth/logout')
  } finally {
    clearSessionToken()
  }
}


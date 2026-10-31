import type { Favorite, Session } from '@/types/domain'
import type { MockScenario } from '@/mocks/scenarios/types'
import type { NFT } from '@/types/domain'

export interface ApiError {
  code: 'validation' | 'unauthorized' | 'forbidden' | 'not_found' | 'conflict' | 'availability' | 'timeout' | 'network' | 'server'
  message: string
  fields?: Record<string, string>
}

export interface FoundationHealth {
  status: 'ready'
  source: 'msw'
  scenario: MockScenario
}

export interface AuthPayload {
  email: string
  password: string
}

export interface SignupPayload extends AuthPayload {
  displayName: string
  passwordConfirmation: string
}

export interface AuthResponse {
  session: Session
  sessionToken: string
}

export type SessionResponse = Session | null

export interface FavoritesResponse {
  userId: string
  favorites: Favorite[]
}

export interface NFTListResponse {
  items: NFT[]
  featured: NFT
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  facets: {
    categories: Record<string, number>
    collections: Record<string, number>
    networks: Record<string, number>
  }
}

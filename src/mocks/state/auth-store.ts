import { mockAccountFixtures, type MockAccount } from '@/mocks/fixtures/auth'
import type { Favorite, Session, User } from '@/types/domain'

interface StoredMockSession {
  userId: string
  expiresAt: string
}

interface StoredAuthState {
  version: 1
  accounts: MockAccount[]
  sessions: Record<string, StoredMockSession>
  favorites: Record<string, Favorite[]>
}

const authStateKey = 'kurio:mock-auth-state'

export function resetAuthMockState() {
  try {
    window.localStorage.removeItem(authStateKey)
    window.localStorage.removeItem('kurio:session-token')
  } catch {
    // The next read will initialize the deterministic fixture state.
  }
}

export function findMockAccount(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  return readState().accounts.find((account) => account.email === normalizedEmail)
}

export function createMockAccount(account: MockAccount) {
  const state = readState()
  state.accounts.push(account)
  state.favorites[account.id] = []
  writeState(state)
  return toUser(account)
}

export function issueMockSession(userId: string): { session: Session; sessionToken: string } | undefined {
  const state = readState()
  const account = state.accounts.find((candidate) => candidate.id === userId)
  if (!account) return undefined

  const sessionToken = `mock.${userId}.${crypto.randomUUID()}`
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  state.sessions[sessionToken] = { userId, expiresAt }
  writeState(state)
  return { session: { user: toUser(account), expiresAt }, sessionToken }
}

export function getMockSession(sessionToken: string | null) {
  if (!sessionToken) return undefined
  const state = readState()
  const storedSession = state.sessions[sessionToken]
  if (!storedSession) return undefined
  if (Date.parse(storedSession.expiresAt) <= Date.now()) {
    delete state.sessions[sessionToken]
    writeState(state)
    return undefined
  }

  const account = state.accounts.find((candidate) => candidate.id === storedSession.userId)
  if (!account) return undefined
  return { session: { user: toUser(account), expiresAt: storedSession.expiresAt }, userId: account.id }
}

export function revokeMockSession(sessionToken: string | null) {
  if (!sessionToken) return
  const state = readState()
  delete state.sessions[sessionToken]
  writeState(state)
}

export function getMockFavorites(userId: string) {
  return readState().favorites[userId] ?? []
}

export function addMockFavorite(userId: string, nftId: string): Favorite[] {
  const state = readState()
  const favorites = state.favorites[userId] ?? []
  if (!favorites.some((favorite) => favorite.nftId === nftId)) {
    favorites.push({ userId, nftId, createdAt: new Date().toISOString() })
  }
  state.favorites[userId] = favorites
  writeState(state)
  return favorites
}

export function removeMockFavorite(userId: string, nftId: string): Favorite[] {
  const state = readState()
  const favorites = (state.favorites[userId] ?? []).filter((favorite) => favorite.nftId !== nftId)
  state.favorites[userId] = favorites
  writeState(state)
  return favorites
}

export async function digestMockPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const message = new TextEncoder().encode(`kurio-mock-v1:${normalizedEmail}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', message)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function changeMockPassword(userId: string, currentPassword: string, newPassword: string) {
  const state = readState()
  const account = state.accounts.find((candidate) => candidate.id === userId)
  if (!account || account.passwordDigest !== await digestMockPassword(account.email, currentPassword)) return false
  account.passwordDigest = await digestMockPassword(account.email, newPassword)
  writeState(state)
  return true
}

export function getMockUser(sessionToken: string | null): User | undefined {
  return getMockSession(sessionToken)?.session.user
}

function readState(): StoredAuthState {
  try {
    const serialized = window.localStorage.getItem(authStateKey)
    if (serialized) {
      const parsed: unknown = JSON.parse(serialized)
      if (isStoredAuthState(parsed)) return parsed
    }
  } catch {
    // Invalid or unavailable persistence falls back to a clean fixture state.
  }

  return {
    version: 1,
    accounts: mockAccountFixtures.map((account) => ({ ...account })),
    sessions: {},
    favorites: { 'user-ana': [], 'user-leo': [] },
  }
}

function writeState(state: StoredAuthState) {
  try {
    window.localStorage.setItem(authStateKey, JSON.stringify(state))
  } catch {
    // Mock state remains valid for the lifetime of the page.
  }
}

function isStoredAuthState(value: unknown): value is StoredAuthState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<StoredAuthState>
  return candidate.version === 1
    && Array.isArray(candidate.accounts)
    && typeof candidate.sessions === 'object'
    && candidate.sessions !== null
    && typeof candidate.favorites === 'object'
    && candidate.favorites !== null
}

function toUser(account: MockAccount): User {
  return { id: account.id, displayName: account.displayName, email: account.email }
}

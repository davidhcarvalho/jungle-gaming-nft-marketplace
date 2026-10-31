import type { CollectorProfile } from '@/types/domain'
import type { UpdateProfilePayload } from '@/types/api'

interface StoredProfiles { version: 1; profiles: Record<string, CollectorProfile> }
const storageKey = 'kurio:mock-profiles-state'

export function resetProfileMockState() { try { localStorage.removeItem(storageKey) } catch { /* fixture fallback */ } }
export function getProfile(user: { id: string; displayName: string; email: string }): CollectorProfile {
  const state = readState()
  if (!state.profiles[user.id]) {
    state.profiles[user.id] = createFixture(user)
    writeState(state)
  }
  return structuredClone(state.profiles[user.id])
}
export function updateProfile(userId: string, payload: UpdateProfilePayload) {
  const state = readState()
  const current = state.profiles[userId]
  if (!current) return undefined
  const profile = { ...current, ...payload }
  state.profiles[userId] = profile
  writeState(state)
  return structuredClone(profile)
}
export function updateAvatar(userId: string, avatarDataUrl: string) {
  const state = readState()
  const profile = state.profiles[userId]
  if (!profile) return undefined
  profile.avatarDataUrl = avatarDataUrl
  writeState(state)
  return structuredClone(profile)
}
export function removeAvatar(userId: string) {
  const state = readState(); const profile = state.profiles[userId]
  if (!profile) return undefined
  delete profile.avatarDataUrl; writeState(state); return structuredClone(profile)
}
function createFixture(user: { id: string; displayName: string; email: string }): CollectorProfile {
  const firstName = user.displayName.split(/\s+/)[0] || 'colecionador'
  return { userId: user.id, displayName: user.displayName, username: user.id === 'user-ana' ? 'ana.coleciona' : user.id === 'user-leo' ? 'leo.artista' : firstName.toLowerCase(), email: user.email, ensName: '', walletNickname: '' }
}
function readState(): StoredProfiles {
  try { const raw = localStorage.getItem(storageKey); if (raw) { const value: unknown = JSON.parse(raw); if (typeof value === 'object' && value !== null && (value as StoredProfiles).version === 1) return value as StoredProfiles } } catch { /* initialize */ }
  return { version: 1, profiles: {} }
}
function writeState(state: StoredProfiles) { try { localStorage.setItem(storageKey, JSON.stringify(state)) } catch { /* deterministic in-memory response */ } }

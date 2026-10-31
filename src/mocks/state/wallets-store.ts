import type { Network, Wallet } from '@/types/domain'
import type { WalletPayload } from '@/types/api'

interface StoredWalletState {
  version: 1
  walletsByUser: Record<string, Wallet[]>
  connectedByUser: Record<string, string>
}

const storageKey = 'kurio:mock-wallets-state'
export const walletNetworks: Network[] = [
  { id: 'ethereum', name: 'Ethereum', currency: 'ETH' },
  { id: 'polygon', name: 'Polygon', currency: 'ETH' },
]

export function resetWalletMockState() {
  try { localStorage.removeItem(storageKey); localStorage.removeItem('kurio:checkout-wallet-state') } catch { /* deterministic fixture fallback */ }
}

export function getWalletsForUser(userId: string) {
  const state = readState()
  const wallets = state.walletsByUser[userId] ?? createWalletFixtures(userId)
  if (!state.walletsByUser[userId]) {
    state.walletsByUser[userId] = wallets
    writeState(state)
  }
  return { userId, wallets: structuredClone(wallets), networks: walletNetworks, connectedWalletId: state.connectedByUser[userId] }
}

export function addWallet(userId: string, payload: WalletPayload): Wallet | undefined {
  const response = getWalletsForUser(userId)
  if (response.wallets.some((wallet) => wallet.address.toLowerCase() === payload.address.trim().toLowerCase() && wallet.networkId === payload.networkId)) return undefined
  const state = readState()
  const wallets = state.walletsByUser[userId] ?? createWalletFixtures(userId)
  const role = payload.role === 'primary' && wallets.length === 0 ? 'primary' : 'secondary'
  const wallet: Wallet = { id: `${userId}:wallet-${crypto.randomUUID()}`, address: payload.address.trim(), label: payload.label.trim(), networkId: payload.networkId, role, ...(payload.ensName?.trim() ? { ensName: payload.ensName.trim() } : {}) }
  wallets.push(wallet)
  if (!wallets.some((candidate) => candidate.role === 'primary')) wallet.role = 'primary'
  state.walletsByUser[userId] = wallets
  writeState(state)
  return structuredClone(wallet)
}

export function updateWallet(userId: string, walletId: string, payload: WalletPayload): Wallet | undefined {
  const state = readState()
  const wallets = state.walletsByUser[userId] ?? createWalletFixtures(userId)
  const wallet = wallets.find((candidate) => candidate.id === walletId)
  if (!wallet || wallets.some((candidate) => candidate.id !== walletId && candidate.address.toLowerCase() === payload.address.trim().toLowerCase() && candidate.networkId === payload.networkId)) return undefined
  wallet.address = payload.address.trim()
  wallet.label = payload.label.trim()
  wallet.networkId = payload.networkId
  wallet.ensName = payload.ensName?.trim() || undefined
  if (payload.role === 'primary') {
    for (const candidate of wallets) candidate.role = candidate.id === wallet.id ? 'primary' : 'secondary'
  }
  state.walletsByUser[userId] = wallets
  if (state.connectedByUser[userId] === walletId) state.connectedByUser[userId] = walletId
  writeState(state)
  return structuredClone(wallet)
}

export function setWalletConnection(userId: string, walletId?: string) {
  const state = readState()
  const wallets = state.walletsByUser[userId] ?? createWalletFixtures(userId)
  if (walletId && wallets.some((wallet) => wallet.id === walletId)) state.connectedByUser[userId] = walletId
  else delete state.connectedByUser[userId]
  state.walletsByUser[userId] = wallets
  writeState(state)
  return getWalletsForUser(userId)
}

function createWalletFixtures(userId: string): Wallet[] {
  return [
    { id: `${userId}:wallet-primary`, address: userId === 'user-leo' ? '0x9C8f2A4B7D1E6F305A8c2b9D4E7F1A6C3D5B8E20' : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', label: 'MetaMask · Principal', networkId: 'ethereum', role: 'primary' },
    { id: `${userId}:wallet-secondary`, address: '0x3A4f09b2C1D7E6F8A5b4C3D2E1F0a9876543210B', label: 'Coinbase · Secundária', networkId: 'polygon', role: 'secondary' },
  ]
}

function readState(): StoredWalletState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null && (parsed as StoredWalletState).version === 1) return parsed as StoredWalletState
    }
  } catch { /* initialize from stable fixtures */ }
  return { version: 1, walletsByUser: {}, connectedByUser: {} }
}
function writeState(state: StoredWalletState) { try { localStorage.setItem(storageKey, JSON.stringify(state)) } catch { /* in-memory response remains valid */ } }

import { apiClient } from '@/api/client'
import type { WalletPayload, WalletsResponse } from '@/types/api'
import type { Wallet } from '@/types/domain'

export async function getWallets(signal?: AbortSignal) { return (await apiClient.get<WalletsResponse>('/wallets', { signal })).data }
export async function createWallet(payload: WalletPayload) { return (await apiClient.post<{ wallet: Wallet } & WalletsResponse>('/wallets', payload)).data }
export async function saveWallet(walletId: string, payload: WalletPayload) { return (await apiClient.patch<{ wallet: Wallet } & WalletsResponse>(`/wallets/${encodeURIComponent(walletId)}`, payload)).data }

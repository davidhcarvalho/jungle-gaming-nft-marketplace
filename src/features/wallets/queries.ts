import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth/queries'
import { queryKeys } from '@/lib/query-keys'
import type { WalletPayload } from '@/types/api'
import { createWallet, getWallets, saveWallet } from './api'

export function useWallets() {
  const session = useSession(); const userId = session.data?.user.id ?? ''
  return useQuery({ queryKey: queryKeys.private.wallets(userId), queryFn: ({ signal }) => getWallets(signal), enabled: Boolean(userId), retry: false })
}
function useWalletMutation(mutationFn: (input: WalletPayload | { walletId: string; payload: WalletPayload }) => Promise<unknown>) {
  const client = useQueryClient(); const session = useSession(); const userId = session.data?.user.id ?? ''
  return useMutation({ mutationFn, onSuccess: async (data) => {
    client.setQueryData(queryKeys.private.wallets(userId), data)
    await client.invalidateQueries({ queryKey: queryKeys.private.checkoutWallets(userId) })
  } })
}
export function useCreateWallet() { return useWalletMutation((input) => createWallet(input as WalletPayload)) }
export function useSaveWallet() { return useWalletMutation((input) => { const value = input as { walletId: string; payload: WalletPayload }; return saveWallet(value.walletId, value.payload) }) }

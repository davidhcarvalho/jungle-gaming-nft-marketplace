import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth/queries'
import { queryKeys } from '@/lib/query-keys'
import { connectCheckoutWallet, createOrder, disconnectCheckoutWallet, getCheckoutWallets, getOrder, refreshOrder, revalidateCheckout } from './api'
import type { CreateOrderPayload } from '@/types/api'
export function useCheckoutWallets() { const session = useSession(); const userId = session.data?.user.id ?? ''; return useQuery({ queryKey: queryKeys.private.checkoutWallets(userId), queryFn: ({ signal }) => getCheckoutWallets(signal), enabled: Boolean(userId), retry: false }) }
export function useConnectWallet() { const client = useQueryClient(); const session = useSession(); const userId = session.data?.user.id ?? ''; return useMutation({ mutationFn: connectCheckoutWallet, onSuccess: (data) => client.setQueryData(queryKeys.private.checkoutWallets(userId), data) }) }
export function useDisconnectWallet() { const client = useQueryClient(); const session = useSession(); const userId = session.data?.user.id ?? ''; return useMutation({ mutationFn: disconnectCheckoutWallet, onSuccess: (data) => client.setQueryData(queryKeys.private.checkoutWallets(userId), data) }) }
export function useRevalidateCheckout() { return useMutation({ mutationFn: ({ quoteId, networkId }: { quoteId: string; networkId: string }) => revalidateCheckout(quoteId, networkId) }) }
export function useCreateOrder() { const client = useQueryClient(); const session = useSession(); const userId = session.data?.user.id ?? ''; return useMutation({ mutationFn: ({ payload, key }: { payload: CreateOrderPayload; key: string }) => createOrder(payload, key), onSuccess: ({ order }) => client.setQueryData(queryKeys.private.order(userId, order.id), { order, receipt: order.receipt }) }) }
export function useOrder(orderId: string) { const session = useSession(); const userId = session.data?.user.id ?? ''; return useQuery({ queryKey: queryKeys.private.order(userId, orderId), queryFn: ({ signal }) => getOrder(orderId, signal), enabled: Boolean(userId && orderId), retry: false, staleTime: 0 }) }
export function useRefreshOrder() { return useMutation({ mutationFn: refreshOrder }) }

import { apiClient } from '@/api/client'
import type { CheckoutRevalidationResponse, CheckoutWalletsResponse, ConnectCheckoutWalletPayload, CreateOrderPayload, OrderResponse } from '@/types/api'
export async function getCheckoutWallets(signal?: AbortSignal) { return (await apiClient.get<CheckoutWalletsResponse>('/checkout/wallets', { signal })).data }
export async function connectCheckoutWallet(payload: ConnectCheckoutWalletPayload) { return (await apiClient.post<CheckoutWalletsResponse>('/checkout/wallets/connect', payload)).data }
export async function disconnectCheckoutWallet() { return (await apiClient.post<CheckoutWalletsResponse>('/checkout/wallets/disconnect')).data }
export async function revalidateCheckout(quoteId: string, networkId: string) { return (await apiClient.post<CheckoutRevalidationResponse>('/checkout/revalidate', { quoteId, networkId })).data }
export async function createOrder(payload: CreateOrderPayload, idempotencyKey: string) { return (await apiClient.post<OrderResponse>('/orders', payload, { headers: { 'Idempotency-Key': idempotencyKey } })).data }
export async function getOrder(orderId: string, signal?: AbortSignal) { return (await apiClient.get<OrderResponse>(`/orders/${encodeURIComponent(orderId)}`, { signal })).data }
export async function refreshOrder(orderId: string) { return (await apiClient.post<OrderResponse>(`/orders/${encodeURIComponent(orderId)}/refresh`)).data }

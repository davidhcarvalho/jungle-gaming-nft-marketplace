import { apiClient } from '@/api/client'
import type { AddCartItemPayload, CartResponse, QuoteResponse, UpdateCartItemPayload } from '@/types/api'

export async function getCart(signal?: AbortSignal) {
  const response = await apiClient.get<CartResponse>('/cart', { signal })
  return response.data
}

export async function addCartItem(payload: AddCartItemPayload) {
  const response = await apiClient.post<CartResponse>('/cart/items', payload)
  return response.data
}

export async function updateCartItem(itemId: string, payload: UpdateCartItemPayload) {
  const response = await apiClient.patch<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, payload)
  return response.data
}

export async function removeCartItem(itemId: string) {
  const response = await apiClient.delete<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`)
  return response.data
}

export async function applyCartCoupon(code: string) {
  const response = await apiClient.post<CartResponse>('/cart/coupon', { code })
  return response.data
}

export async function removeCartCoupon() {
  const response = await apiClient.delete<CartResponse>('/cart/coupon')
  return response.data
}

export async function getCartQuote(signal?: AbortSignal) {
  const response = await apiClient.post<QuoteResponse>('/quote', undefined, { signal })
  return response.data
}

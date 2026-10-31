import { apiClient } from '@/api/client'
import type { FavoritesResponse } from '@/types/api'

export async function getFavorites(signal?: AbortSignal) {
  const response = await apiClient.get<FavoritesResponse>('/favorites', { signal })
  return response.data
}

export async function addFavorite(nftId: string) {
  const response = await apiClient.post<FavoritesResponse>('/favorites', { nftId })
  return response.data
}

export async function removeFavorite(nftId: string) {
  const response = await apiClient.delete<FavoritesResponse>(`/favorites/${encodeURIComponent(nftId)}`)
  return response.data
}

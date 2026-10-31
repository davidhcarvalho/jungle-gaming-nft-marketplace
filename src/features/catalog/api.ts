import { apiClient } from '@/api/client'
import type { NFTListResponse } from '@/types/api'
import type { NFT } from '@/types/domain'
import type { CatalogSearch } from '@/features/catalog/model'

export const catalogPageSize = 12

export async function getNFTs(search: CatalogSearch, signal?: AbortSignal) {
  const response = await apiClient.get<NFTListResponse>('/nfts', {
    params: { ...search, pageSize: catalogPageSize },
    signal,
  })
  return response.data
}

export async function getNFT(nftId: string, signal?: AbortSignal) {
  const response = await apiClient.get<NFT>(`/nfts/${encodeURIComponent(nftId)}`, { signal })
  return response.data
}

import { useQuery } from '@tanstack/react-query'

import { getNFT, getNFTs } from '@/features/catalog/api'
import type { CatalogSearch } from '@/features/catalog/model'
import { queryKeys } from '@/lib/query-keys'

export function useNFTCatalog(search: CatalogSearch, enabled = true) {
  return useQuery({
    queryKey: queryKeys.catalog.list({ ...search, pageSize: 12 }),
    queryFn: ({ signal }) => getNFTs(search, signal),
    placeholderData: (previousData) => previousData,
    enabled,
  })
}

export function useNFTDetail(nftId: string) {
  return useQuery({
    queryKey: queryKeys.nft.detail(nftId),
    queryFn: ({ signal }) => getNFT(nftId, signal),
  })
}

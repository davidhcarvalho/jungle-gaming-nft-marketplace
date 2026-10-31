import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Favorite } from '@/types/domain'

import { addFavorite, getFavorites, removeFavorite } from '@/features/favorites/api'
import { queryKeys } from '@/lib/query-keys'
import type { FavoritesResponse } from '@/types/api'

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? queryKeys.private.favorites(userId) : ['private', 'anonymous', 'favorites'],
    queryFn: ({ signal }) => getFavorites(signal),
    enabled: Boolean(userId),
  })
}

export function useToggleFavorite(userId: string, nftId: string) {
  const queryClient = useQueryClient()
  const queryKey = queryKeys.private.favorites(userId)

  return useMutation({
    mutationFn: (isFavorite: boolean) => isFavorite ? removeFavorite(nftId) : addFavorite(nftId),
    onMutate: async (isFavorite) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<FavoritesResponse>(queryKey)
      const nowFavorite = !isFavorite
      const nextFavorites = nowFavorite
        ? [...(previous?.favorites ?? []), { userId, nftId, createdAt: new Date().toISOString() } satisfies Favorite]
        : (previous?.favorites ?? []).filter((favorite) => favorite.nftId !== nftId)
      queryClient.setQueryData<FavoritesResponse>(queryKey, { userId, favorites: nextFavorites })
      return { previous }
    },
    onError: (_error, _isFavorite, context) => {
      if (queryClient.getQueryData<{ user: { id: string } } | null>(queryKeys.auth.session)?.user.id !== userId) return
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
      else queryClient.removeQueries({ queryKey, exact: true })
    },
    onSuccess: (response) => {
      if (queryClient.getQueryData<{ user: { id: string } } | null>(queryKeys.auth.session)?.user.id === userId) {
        queryClient.setQueryData(queryKey, response)
      }
    },
    onSettled: () => queryClient.getQueryData<{ user: { id: string } } | null>(queryKeys.auth.session)?.user.id === userId
      ? queryClient.invalidateQueries({ queryKey })
      : undefined,
  })
}

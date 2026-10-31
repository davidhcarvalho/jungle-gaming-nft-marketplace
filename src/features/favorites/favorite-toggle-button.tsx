import { useNavigate } from '@tanstack/react-router'

import { useSession } from '@/features/auth/queries'
import { useFavorites, useToggleFavorite } from '@/features/favorites/queries'

export function FavoriteToggleButton({ nftId, returnTo, compact = false }: { nftId: string; returnTo: string; compact?: boolean }) {
  const session = useSession()
  const userId = session.data?.user.id
  const favorites = useFavorites(userId)
  const isFavorite = favorites.data?.favorites.some((favorite) => favorite.nftId === nftId) ?? false
  const toggle = useToggleFavorite(userId ?? 'anonymous', nftId)
  const navigate = useNavigate()

  if (session.isPending) {
    return <button className={compact ? 'round-icon-button' : 'favorite-button'} type="button" disabled aria-label="Verificando sessão">♡</button>
  }

  if (!userId) {
    return (
      <button
        className={compact ? 'round-icon-button' : 'favorite-button'}
        type="button"
        aria-label={compact ? 'Entrar para favoritar este NFT' : 'Entrar para adicionar aos favoritos'}
        onClick={() => void navigate({ to: '/login', search: { returnTo } })}
      >
        {compact ? '♡' : <><span aria-hidden="true">♡</span> Favoritar</>}
      </button>
    )
  }

  const pending = toggle.isPending || favorites.isPending
  return (
    <button
      className={compact ? 'round-icon-button' : 'favorite-button'}
      type="button"
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={isFavorite}
      disabled={pending}
      onClick={() => toggle.mutate(isFavorite)}
    >
      {compact ? (isFavorite ? '♥' : '♡') : <><span aria-hidden="true">{isFavorite ? '♥' : '♡'}</span>{isFavorite ? ' Favoritado' : ' Favoritar'}</>}
    </button>
  )
}

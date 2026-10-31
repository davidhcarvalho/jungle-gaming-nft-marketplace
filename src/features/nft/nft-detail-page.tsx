import { Link, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { getApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { NFTArtwork } from '@/features/catalog/components/nft-artwork'
import { NFTCard } from '@/features/catalog/components/nft-card'
import { useNFTCatalog, useNFTDetail } from '@/features/catalog/queries'
import { FavoriteToggleButton } from '@/features/favorites/favorite-toggle-button'

export function NFTDetailPage() {
  const { nftId } = useParams({ from: '/nfts/$nftId' })
  const nftQuery = useNFTDetail(nftId)
  const related = useNFTCatalog({ collection: nftQuery.data?.collectionId, sort: 'popular', page: 1 }, Boolean(nftQuery.data))
  const [editionId, setEditionId] = useState<string>()
  const [quantity, setQuantity] = useState(1)
  const [galleryView, setGalleryView] = useState(0)
  const nft = nftQuery.data

  useEffect(() => {
    setEditionId(undefined)
    setQuantity(1)
    setGalleryView(0)
  }, [nftId])

  if (nftQuery.isPending) return <DetailSkeleton />
  if (nftQuery.isError) {
    const error = getApiError(nftQuery.error)
    if (error.code === 'not_found') return <NFTNotFound />
    return (
      <section className="detail-state" role="alert">
        <p className="state-kicker">ERRO DE CONEXÃO</p>
        <h1>Não foi possível carregar este NFT.</h1>
        <p>{error.message}</p>
        <Button onClick={() => void nftQuery.refetch()} disabled={nftQuery.isFetching}>Tentar novamente</Button>
      </section>
    )
  }
  if (!nft) return <NFTNotFound />

  const selectedEdition = nft.editions.find((edition) => edition.id === editionId)
    ?? nft.editions.find((edition) => edition.label === '1/50' && edition.available > 0)
    ?? nft.editions.find((edition) => edition.available > 0)
    ?? nft.editions[0]
  const available = selectedEdition?.available ?? 0
  const maxQuantity = selectedEdition ? Math.min(available, selectedEdition.maxPerOrder) : 0
  const price = selectedEdition?.priceEth ?? nft.priceEth
  const soldOut = maxQuantity === 0

  function chooseEdition(nextId: string) {
    setEditionId(nextId)
    setQuantity(1)
  }

  const relatedItems = (related.data?.items ?? []).filter((item) => item.id !== nft.id).slice(0, 5)

  return (
    <article className="nft-detail-page" data-testid="nft-detail">
      <nav className="detail-breadcrumb" aria-label="Breadcrumb"><Link to="/" search={{ page: 1, sort: 'recent' }}>Início</Link><span aria-hidden="true">/</span><a href="/#catalog">Mercado</a><span aria-hidden="true">/</span><span aria-current="page">{nft.name}</span></nav>

      <section className="detail-main" aria-labelledby="detail-title">
        <div className="detail-gallery">
          <div className="detail-mobile-actions">
            <Link className="round-icon-button" to="/" search={{ page: 1, sort: 'recent' }} aria-label="Voltar ao mercado">‹</Link>
            <FavoriteToggleButton nftId={nft.id} returnTo={`/nfts/${nft.id}`} compact />
          </div>
          <div className="detail-thumbnails" aria-label="Enquadramentos da arte">
            {[0, 1, 2, 3].map((view) => (
              <button
                className={`detail-thumbnail${galleryView === view ? ' is-selected' : ''}`}
                key={view}
                type="button"
                aria-label={`Enquadramento ${view + 1} da arte`}
                aria-pressed={galleryView === view}
                onClick={() => setGalleryView(view)}
              >
                <NFTArtwork src={nft.imageUrl} alt="" className={`artwork-view-${view}`} />
              </button>
            ))}
          </div>
          <div className="detail-main-art">
            <NFTArtwork src={nft.imageUrl} alt={`Arte digital colecionável ${nft.name}`} eager className={`artwork-view-${galleryView}`} />
            <span className="art-zoom-mark" aria-hidden="true">⌕</span>
          </div>
        </div>

        <div className="detail-information">
          <div className="detail-heading-row">
            <h1 id="detail-title">{nft.name}</h1>
            <span className="detail-rating" aria-label={`Avaliação ${nft.rating.toFixed(1)} de 5, ${nft.reviewCount} avaliações`}><span aria-hidden="true">★</span> {nft.rating.toFixed(1)} <span>({nft.reviewCount})</span></span>
          </div>
          <div className="detail-price-row"><p className="detail-price">{price} ETH</p><p className="detail-reviews"><span aria-hidden="true">★★★★★</span> {nft.reviewCount} avaliações de colecionadores</p></div>
          <div className="detail-description"><h2>Sobre este NFT:</h2><p>{nft.description}</p></div>

          <fieldset className="edition-picker">
            <legend>Edição:</legend>
            <div className="edition-options">
              {nft.editions.map((edition) => (
                <button
                  key={edition.id}
                  className={`edition-chip${selectedEdition?.id === edition.id ? ' is-selected' : ''}`}
                  type="button"
                  disabled={edition.available === 0}
                  aria-pressed={selectedEdition?.id === edition.id}
                  aria-label={`${edition.label}${edition.available === 0 ? ', esgotada' : `, ${edition.available} disponíveis`}`}
                  onClick={() => chooseEdition(edition.id)}
                >
                  {edition.label}{edition.available === 0 && <span className="sr-only"> — esgotada</span>}
                </button>
              ))}
              {selectedEdition && <span className={`edition-chip edition-open${selectedEdition.available > 0 ? ' is-selected' : ''}`}>ABERTA</span>}
            </div>
          </fieldset>

          <div className="detail-actions-row">
            <div className="quantity-control" role="group" aria-label="Quantidade de NFTs">
              <span className="quantity-label">Qtd.</span>
              <button type="button" aria-label="Diminuir quantidade" disabled={quantity <= 1 || soldOut} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
              <output aria-live="polite" data-testid="nft-quantity">{quantity}</output>
              <button type="button" aria-label="Aumentar quantidade" disabled={soldOut || quantity >= maxQuantity} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}>+</button>
            </div>
            <div className="detail-cta-row">
              <Button className="detail-buy-button" disabled={soldOut} onClick={() => { window.location.href = '/login?returnTo=%2Fcart' }}>{soldOut ? 'Edição esgotada' : 'Comprar NFT'}</Button>
              <FavoriteToggleButton nftId={nft.id} returnTo={`/nfts/${nft.id}`} />
            </div>
          </div>
          <p className={`detail-limit-note${soldOut ? ' is-sold-out' : ''}`} role="status" aria-label="Limite de compra">{soldOut ? 'Esta edição não possui unidades disponíveis.' : `${available} disponíveis · limite de ${maxQuantity} unidade${maxQuantity === 1 ? '' : 's'} por compra.`}</p>
          <p className="out-of-scope-note">Compra e favoritos serão conectados nos próximos lotes.</p>

          <dl className="detail-attributes">
            <div><dt>ID do token:</dt><dd>#{nft.tokenId}</dd></div>
            <div><dt>Coleção:</dt><dd>{nft.collectionName}</dd></div>
            <div><dt>Atributos:</dt><dd>{nft.attributes.join(', ')}</dd></div>
          </dl>
          <div className="detail-share"><span>Compartilhar este NFT:</span><button type="button" aria-label="Copiar link deste NFT" onClick={() => void navigator.clipboard?.writeText(window.location.href)}>in</button><button type="button" aria-label="Compartilhar por e-mail" onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent(nft.name)}&body=${encodeURIComponent(window.location.href)}` }}>✉</button><span aria-hidden="true">♥</span></div>
        </div>
      </section>

      <section className="detail-long-description" aria-labelledby="detail-tab-title">
        <div className="detail-tabs"><h2 id="detail-tab-title">Detalhes do NFT</h2><span>Avaliações de colecionadores ({nft.reviewCount})</span></div>
        <p>{nft.name} é uma obra digital 1/50 finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na rede Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.</p>
        <p>A propriedade inclui arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. Nova Sato recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.</p>
        <p><strong>Rede:</strong><br />Cunhado na {nft.network} com procedência imutável e metadados armazenados no IPFS.</p>
        <p><strong>Contrato:</strong><br />Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.</p>
        <p><strong>Direitos autorais:</strong><br />0x7A42...19E8 · Contrato inteligente ERC-721 verificado.</p>
      </section>

      <section className="related-section" aria-labelledby="related-heading">
        <h2 id="related-heading">Mais desta coleção</h2>
        {related.isPending ? <div className="related-skeleton shimmer" aria-label="Carregando obras da coleção" /> : <div className="related-grid">{relatedItems.map((item) => <NFTCard key={item.id} nft={item} />)}</div>}
      </section>

      <div className="mobile-purchase-bar" role="region" aria-label="Resumo da compra">
        <div className="mobile-quantity-price"><div className="quantity-control" role="group" aria-label="Quantidade de NFTs"><span className="quantity-label">Qtd.</span><button type="button" aria-label="Diminuir quantidade" disabled={quantity <= 1 || soldOut} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><output>{quantity}</output><button type="button" aria-label="Aumentar quantidade" disabled={soldOut || quantity >= maxQuantity} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}>+</button></div><span className="mobile-purchase-price">{price} ETH</span></div>
        {!soldOut && quantity >= maxQuantity && <p className="mobile-quantity-limit" role="status" aria-label="Limite de compra">Limite de {maxQuantity} unidades por compra.</p>}
        {soldOut && <p className="mobile-availability-note" role="status" aria-label="Limite de compra">Esta edição não possui unidades disponíveis.</p>}
        <div className="mobile-purchase-actions"><Button className="detail-buy-button" disabled={soldOut} onClick={() => { window.location.href = '/login?returnTo=%2Fcart' }}>{soldOut ? 'Edição esgotada' : 'Comprar NFT'}</Button><Link to="/cart" className="mobile-cart-placeholder" aria-label="Abrir carrinho">▱</Link></div>
      </div>
    </article>
  )
}

function NFTNotFound() {
  return (
    <section className="detail-state resource-not-found" role="status" data-testid="nft-not-found">
      <p className="state-kicker">NFT NÃO ENCONTRADO</p>
      <h1>Esta obra não está disponível.</h1>
      <p>O link pode estar incorreto ou a obra não faz parte do mercado atual.</p>
      <Button asChild><Link to="/" search={{ page: 1, sort: 'recent' }}>Voltar ao mercado</Link></Button>
    </section>
  )
}

function DetailSkeleton() {
  return <div className="detail-skeleton" aria-label="Carregando NFT" aria-live="polite" data-testid="detail-skeleton"><div className="shimmer" /><div className="detail-skeleton-copy"><span className="shimmer" /><span className="shimmer" /><span className="shimmer" /><span className="shimmer" /><span className="shimmer" /></div></div>
}

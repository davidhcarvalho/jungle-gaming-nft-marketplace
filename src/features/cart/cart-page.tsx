import { Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'

import { getApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { NFTCard } from '@/features/catalog/components/nft-card'
import { useNFTCatalog } from '@/features/catalog/queries'
import { isNftRealtimeUpdateForItems, useRealtimeSnapshot } from '@/realtime/realtime-provider'
import {
  useApplyCartCoupon,
  useCart,
  useCartQuote,
  useRemoveCartCoupon,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/features/cart/queries'
import type { CartItem } from '@/types/domain'

export function CartPage() {
  const cart = useCart()
  const quote = useCartQuote(cart.data, cart.isSuccess)
  const updateQuantity = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const applyCoupon = useApplyCartCoupon()
  const removeCoupon = useRemoveCartCoupon()
  const recommendations = useNFTCatalog({ sort: 'popular', page: 1 })
  const realtime = useRealtimeSnapshot()
  const [couponInput, setCouponInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const firstMutationError = [updateQuantity.error, removeItem.error, applyCoupon.error, removeCoupon.error].find(Boolean)
  const activeError = firstMutationError ? getApiError(firstMutationError) : undefined

  function handleApplyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    applyCoupon.mutate(couponInput, {
      onSuccess: (nextCart) => {
        setCouponInput('')
        setFeedback(`Cupom ${nextCart.couponCode} aplicado.`)
      },
    })
  }

  function handleRemoveCoupon() {
    removeCoupon.mutate(undefined, {
      onSuccess: () => setFeedback('Cupom removido.'),
    })
  }

  if (cart.isPending) return <CartLoading />

  if (cart.isError || !cart.data) {
    return (
      <section className="cart-page cart-load-error" data-testid="cart-error" role="alert">
        <p className="eyebrow">CARRINHO</p>
        <h1>Não foi possível carregar seu carrinho.</h1>
        <p>{cart.isError ? getApiError(cart.error).message : 'Tente novamente em instantes.'}</p>
        <Button onClick={() => void cart.refetch()} disabled={cart.isFetching}>Tentar novamente</Button>
      </section>
    )
  }

  const items = cart.data.items
  const realtimeUpdateAffectsCart = isNftRealtimeUpdateForItems(realtime, items.map((item) => item.nftId))
  const busy = updateQuantity.isPending || removeItem.isPending || applyCoupon.isPending || removeCoupon.isPending
  const recommendedItems = (recommendations.data?.items ?? []).filter((item) => !items.some((cartItem) => cartItem.nftId === item.id)).slice(0, 5)

  return (
    <div className="cart-page" data-testid="cart-page">
      <nav className="cart-breadcrumb" aria-label="Breadcrumb"><Link to="/" search={{ page: 1, sort: 'recent' }}>Início</Link><span aria-hidden="true">/</span><Link to="/" search={{ page: 1, sort: 'recent' }} hash="catalog">Mercado</Link><span aria-hidden="true">/</span><span aria-current="page">Carrinho</span></nav>
      <header className="cart-page-heading">
        <Link className="cart-back-button" to="/" search={{ page: 1, sort: 'recent' }} aria-label="Voltar ao mercado">‹</Link>
        <div><p className="eyebrow">SUA COLEÇÃO</p><h1>Carrinho de NFTs</h1></div>
      </header>

      {activeError && <p className="cart-mutation-error" role="alert">{activeError.message}</p>}
      {feedback && <p className="cart-feedback" role="status">{feedback}</p>}
      {realtimeUpdateAffectsCart && realtime.lastNftUpdate && <p className="cart-realtime-feedback" role="status" aria-label="Atualização de NFT" aria-live="polite">{realtime.lastNftUpdate.message}</p>}

      {items.length === 0 ? (
        <section className="cart-empty" data-testid="cart-empty" aria-labelledby="cart-empty-title">
          <span className="cart-empty-mark" aria-hidden="true">▱</span>
          <h2 id="cart-empty-title">Seu carrinho está vazio</h2>
          <p>Explore o mercado e encontre uma obra para chamar de sua.</p>
          <Button asChild><Link to="/" search={{ page: 1, sort: 'recent' }}>Explorar NFTs</Link></Button>
        </section>
      ) : (
        <>
          <div className="cart-layout">
            <section className="cart-items-section" aria-labelledby="cart-items-heading">
              <div className="cart-items-heading"><h2 id="cart-items-heading">NFTs</h2><span>Preço</span><span>Edições</span><span>Total</span><span className="sr-only">Ações</span></div>
              <div className="cart-items-list" role="list" aria-label="Itens no carrinho">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    busy={busy}
                    onDecrease={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                    onIncrease={() => updateQuantity.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                    onRemove={() => removeItem.mutate(item.id)}
                  />
                ))}
              </div>
            </section>

            <aside className="cart-summary" aria-labelledby="cart-summary-title" data-testid="cart-summary">
              <h2 id="cart-summary-title">Resumo da carteira</h2>
              <form className="cart-coupon-form" onSubmit={handleApplyCoupon}>
                <label htmlFor="cart-coupon">Código promocional</label>
                <div className="cart-coupon-control">
                  <input id="cart-coupon" value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="Digite o código promocional..." aria-describedby={applyCoupon.isError ? 'coupon-error' : undefined} aria-invalid={applyCoupon.isError} />
                  <Button type="submit" disabled={applyCoupon.isPending || !couponInput.trim()}>{applyCoupon.isPending ? '…' : 'Aplicar'}</Button>
                </div>
                {applyCoupon.isError && <p id="coupon-error" className="cart-field-error" role="alert">{getApiError(applyCoupon.error).message}</p>}
              </form>
              {cart.data.couponCode && (
                <div className="cart-applied-coupon"><span>Cupom <strong>{cart.data.couponCode}</strong> aplicado</span><button type="button" onClick={handleRemoveCoupon} disabled={removeCoupon.isPending} aria-label="Remover cupom">Remover</button></div>
              )}

              {quote.isPending ? <QuoteSkeleton /> : quote.isError || !quote.data ? (
                <div className="cart-quote-error" role="alert"><p>Não foi possível atualizar os valores.</p><Button variant="outline" onClick={() => void quote.refetch()} disabled={quote.isFetching}>Tentar novamente</Button></div>
              ) : (
                <dl className="cart-quote-lines" aria-live="polite">
                  <div><dt>Subtotal</dt><dd>{quote.data.subtotalEth} ETH</dd></div>
                  <div><dt>Desconto do lançamento{quote.data.coupon ? ` (${quote.data.coupon.code})` : ''}</dt><dd>− {quote.data.discountEth} ETH</dd></div>
                  <div className="cart-network-fee"><dt>Taxa de rede <span>estimada</span></dt><dd>{quote.data.networkFeeEth} ETH</dd></div>
                  <div className="cart-total"><dt>Total</dt><dd>{quote.data.totalEth} ETH</dd></div>
                </dl>
              )}

              <Link
                className={`cart-checkout-button${quote.isPending || quote.isError ? ' is-disabled' : ''}`}
                to="/checkout"
                aria-disabled={quote.isPending || quote.isError || !items.length}
                onClick={(event) => {
                  if (quote.isPending || quote.isError || !items.length) event.preventDefault()
                }}
              >Conectar e finalizar</Link>
              <Link className="cart-continue-link" to="/" search={{ page: 1, sort: 'recent' }}>Continuar explorando</Link>
            </aside>
          </div>

          {recommendedItems.length > 0 && (
            <section className="cart-recommendations" aria-labelledby="cart-recommendations-title">
              <div className="cart-recommendation-heading"><h2 id="cart-recommendations-title">Colecionadores também viram</h2></div>
              <div className="cart-recommendation-grid">{recommendedItems.map((item) => <NFTCard key={item.id} nft={item} />)}</div>
              <div className="cart-recommendation-pagination" aria-hidden="true"><span /><span className="is-active" /><span /></div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function CartItemRow({ item, busy, onDecrease, onIncrease, onRemove }: {
  item: CartItem
  busy: boolean
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
}) {
  const limitReached = item.quantity >= item.available
  return (
    <article className="cart-item" role="listitem" data-testid="cart-item">
      <img className="cart-item-art" src={item.imageUrl} alt={`Arte de ${item.nftName}`} />
      <div className="cart-item-identity"><h3>{item.nftName}</h3><p className="cart-item-token-id">ID do token: <span>#{item.tokenId}</span></p><p className="cart-item-edition">Edição: <span>{item.editionLabel}</span></p><p className="cart-mobile-unit-price">{item.lineTotalEth} ETH</p></div>
      <div className="cart-item-price"><span>Preço</span><strong>{item.unitPriceEth} ETH</strong></div>
      <div className="cart-item-quantity">
        <span className="cart-column-label">Edições</span>
        <div className="cart-quantity-control" role="group" aria-label={`Quantidade de ${item.nftName}`}>
          <button type="button" onClick={onDecrease} disabled={busy || item.quantity <= 1} aria-label={`Diminuir quantidade de ${item.nftName}`}>−</button>
          <output aria-live="polite" aria-label={`Quantidade: ${item.quantity}`}>{item.quantity}</output>
          <button type="button" onClick={onIncrease} disabled={busy || limitReached} aria-label={`Aumentar quantidade de ${item.nftName}`}>+</button>
        </div>
        {limitReached && <span className="cart-quantity-limit" role="status" aria-label="Limite de disponibilidade">Limite de {item.available} unidade(s)</span>}
      </div>
      <div className="cart-item-line-total"><span>Total</span><strong>{item.lineTotalEth} ETH</strong></div>
      <button className="cart-remove-button" type="button" onClick={onRemove} disabled={busy} aria-label={`Remover ${item.nftName}, edição ${item.editionLabel}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-.8 13H6.8L6 7m4 3v6m4-6v6" /></svg></button>
    </article>
  )
}

function CartLoading() {
  return (
    <section className="cart-page cart-loading" aria-label="Carregando carrinho" aria-busy="true" data-testid="cart-loading">
      <div className="cart-loading-heading shimmer" />
      <div className="cart-layout">
        <div className="cart-items-list">{[0, 1, 2].map((item) => <div className="cart-item-skeleton shimmer" key={item} />)}</div>
        <QuoteSkeleton />
      </div>
    </section>
  )
}

function QuoteSkeleton() {
  return <div className="cart-summary-skeleton" data-testid="cart-summary-skeleton" aria-label="Carregando resumo da cotação" aria-busy="true"><span className="shimmer" /><span className="shimmer" /><span className="shimmer" /><span className="shimmer" /><span className="shimmer" /></div>
}

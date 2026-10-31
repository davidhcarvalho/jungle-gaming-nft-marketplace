import { Link, useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import { getApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { useSession } from '@/features/auth/queries'
import { useCart, useCartQuote } from '@/features/cart/queries'
import { useConnectWallet, useCreateOrder, useDisconnectWallet, useRevalidateCheckout, useCheckoutWallets } from './queries'
import { finishAttempt, getOrCreateAttemptKey } from './model'
import type { CheckoutCollectorDetails, CreateOrderPayload } from '@/types/api'
import type { Quote } from '@/types/domain'

export function CheckoutPage() {
  const session = useSession()
  const cart = useCart()
  const quoteQuery = useCartQuote(cart.data, cart.isSuccess)
  const wallets = useCheckoutWallets()
  const connect = useConnectWallet()
  const disconnect = useDisconnectWallet()
  const revalidate = useRevalidateCheckout()
  const create = useCreateOrder()
  const navigate = useNavigate()
  const [walletId, setWalletId] = useState('')
  const [networkId, setNetworkId] = useState('ethereum')
  const [collector, setCollector] = useState<CheckoutCollectorDetails>({ displayName: session.data?.user.displayName ?? '', username: session.data?.user.email.split('@')[0] ?? '', profileName: session.data?.user.displayName ?? '', email: session.data?.user.email ?? '', ensName: '.eth', note: '' })
  const [fieldError, setFieldError] = useState('')
  const [freshQuote, setFreshQuote] = useState<Quote | undefined>()
  const [changes, setChanges] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const activeWalletId = walletId || wallets.data?.wallets[0]?.id || ''
  const activeWallet = wallets.data?.wallets.find((wallet) => wallet.id === activeWalletId)
  const selectedQuote = freshQuote ?? quoteQuery.data
  const busy = revalidate.isPending || create.isPending

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFieldError(''); setFeedback('')
    if (!collector.displayName.trim() || !collector.username?.trim() || !collector.profileName?.trim() || !/^\S+@\S+\.\S+$/.test(collector.email)) { setFieldError('Revise nome, usuário, perfil e e-mail do colecionador.'); return }
    if (!activeWallet || wallets.data?.connectedWalletId !== activeWallet.id) { setFieldError('Conecte uma carteira cadastrada para continuar.'); return }
    if (!cart.data?.items.length || !selectedQuote) { setFieldError('Seu carrinho ou cotação ainda não está disponível.'); return }
    try {
      const fresh = await revalidate.mutateAsync({ quoteId: selectedQuote.id, networkId })
      if (fresh.blocked) { setFeedback(fresh.blocked); return }
      const valuesChanged = selectedQuote.subtotalEth !== fresh.quote.subtotalEth || selectedQuote.discountEth !== fresh.quote.discountEth || selectedQuote.networkFeeEth !== fresh.quote.networkFeeEth || selectedQuote.totalEth !== fresh.quote.totalEth || JSON.stringify(selectedQuote.items) !== JSON.stringify(fresh.quote.items)
      const changeMessages = fresh.changes.length ? fresh.changes : valuesChanged ? ['Os valores do pedido foram atualizados.'] : []
      if (changeMessages.length && fresh.quote.id !== freshQuote?.id) {
        setFreshQuote(fresh.quote); setChanges(changeMessages); setFeedback('Os valores foram atualizados. Revise as alterações e confirme novamente.'); return
      }
      setFreshQuote(fresh.quote); setChanges([]); setSubmitted(true)
      const payload: CreateOrderPayload = {
        quoteId: fresh.quote.id,
        quote: fresh.quote,
        items: cart.data.items.map((item) => ({ nftId: item.nftId, editionId: item.editionId, quantity: item.quantity })),
        walletId: activeWallet.id,
        networkId,
        collector: { ...collector, displayName: collector.displayName.trim(), username: collector.username?.trim(), profileName: collector.profileName?.trim(), walletAddress: activeWallet.address, walletType: activeWallet.label, email: collector.email.trim(), note: collector.note?.trim() },
      }
      const result = await create.mutateAsync({ payload, key: getOrCreateAttemptKey() })
      finishAttempt()
      await navigate({ to: '/orders/$orderId', params: { orderId: result.order.id } })
    } catch (error) { if (axios.isAxiosError(error) && error.response?.status === 409) finishAttempt(); setFeedback(getApiError(error).message); setSubmitted(false) }
  }

  if (cart.isPending || quoteQuery.isPending || wallets.isPending) return <CheckoutLoading />
  if (cart.isError || quoteQuery.isError || wallets.isError || !cart.data || !quoteQuery.data) return <section className="checkout-page" role="alert"><h1>Não foi possível preparar o pagamento</h1><p>Revise o carrinho e tente novamente.</p><Button onClick={() => { void cart.refetch(); void quoteQuery.refetch(); void wallets.refetch() }}>Tentar novamente</Button></section>
  if (!cart.data.items.length) return <section className="checkout-page" data-testid="checkout-empty"><h1>Seu carrinho está vazio</h1><Link to="/cart">Voltar ao carrinho</Link></section>

  return <div className="checkout-page" data-testid="checkout-page">
    <nav className="checkout-breadcrumb" aria-label="Breadcrumb"><Link to="/cart">Carrinho</Link><span aria-hidden="true">/</span><span aria-current="page">Pagamento</span></nav>
      <header className="checkout-heading"><Link to="/cart" aria-label="Voltar ao carrinho">‹</Link><div><p className="eyebrow">FINALIZAR COMPRA</p><h1><span className="checkout-title-desktop">Pagamento</span><span className="checkout-title-mobile">Pagamento com carteira</span></h1></div></header>
    <form id="checkout-form" className="checkout-layout" onSubmit={handleSubmit} noValidate>
      <section className="checkout-main-column" aria-label="Dados e pagamento">
        <section className="checkout-panel collector-panel" aria-labelledby="collector-heading"><h2 id="collector-heading">Perfil do colecionador</h2><p>Confira as informações para registrar seu pedido.</p>
          <div className="checkout-fields">
            <label><span>Nome de exibição <em aria-hidden="true">*</em></span><input aria-describedby={fieldError ? 'collector-field-error' : undefined} aria-invalid={Boolean(fieldError)} autoComplete="name" value={collector.displayName} onChange={(e) => setCollector({ ...collector, displayName: e.target.value })} required /></label>
            <label><span>Nome de usuário <em aria-hidden="true">*</em></span><input aria-describedby={fieldError ? 'collector-field-error' : undefined} aria-invalid={Boolean(fieldError)} autoComplete="username" value={collector.username ?? ''} onChange={(e) => setCollector({ ...collector, username: e.target.value })} required /></label>
            <label><span>Rede <em aria-hidden="true">*</em></span><select aria-label="Rede de pagamento" value={networkId} onChange={(e) => setNetworkId(e.target.value)}>{wallets.data.networks.map((network) => <option key={network.id} value={network.id}>{network.name}</option>)}</select></label>
            <label><span>Nome do perfil <em aria-hidden="true">*</em></span><input aria-describedby={fieldError ? 'collector-field-error' : undefined} aria-invalid={Boolean(fieldError)} value={collector.profileName ?? ''} onChange={(e) => setCollector({ ...collector, profileName: e.target.value })} required /></label>
            <label><span>Endereço da carteira <em aria-hidden="true">*</em></span><input value={activeWallet?.address ?? ''} readOnly aria-label="Endereço da carteira selecionada" /></label>
            <label><span>ENS ou carteira secundária <small>(opcional)</small></span><input value={collector.secondaryWallet ?? ''} onChange={(e) => setCollector({ ...collector, secondaryWallet: e.target.value })} /></label>
            <label><span>Tipo de carteira <em aria-hidden="true">*</em></span><select aria-label="Tipo de carteira" value={activeWalletId} onChange={(e) => setWalletId(e.target.value)}>{wallets.data.wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.label}</option>)}</select></label>
            <label><span>Código de indicação <small>(opcional)</small></span><input value={collector.referralCode ?? ''} onChange={(e) => setCollector({ ...collector, referralCode: e.target.value })} /></label>
            <label><span>E-mail <em aria-hidden="true">*</em></span><input aria-describedby={fieldError ? 'collector-field-error' : undefined} aria-invalid={Boolean(fieldError)} type="email" autoComplete="email" value={collector.email} onChange={(e) => setCollector({ ...collector, email: e.target.value })} required /></label>
            <label><span>Nome ENS <small>(opcional)</small></span><select aria-label="Nome ENS" value={collector.ensName ?? '.eth'} onChange={(e) => setCollector({ ...collector, ensName: e.target.value })}><option value=".eth">.eth</option><option value=".art">.art</option><option value="none">Nenhum</option></select></label>
            <label className="checkout-secondary-wallet"><input type="checkbox" checked={Boolean(collector.secondaryWallet)} onChange={(e) => setCollector({ ...collector, secondaryWallet: e.target.checked ? '' : undefined })} /> Usar outra carteira?</label>
            <label className="checkout-note-field"><span>Observação do colecionador <small>(opcional)</small></span><textarea value={collector.note ?? ''} onChange={(e) => setCollector({ ...collector, note: e.target.value })} rows={3} /></label>
          </div>
        </section>
      </section>
      <aside className="checkout-summary" aria-labelledby="checkout-summary-heading"><h2 id="checkout-summary-heading">Seus NFTs</h2><div className="checkout-summary-items">{cart.data.items.map((item) => <div className="checkout-summary-item" key={item.id}><img src={item.imageUrl} alt="" /><div><strong>{item.nftName}</strong><span>{item.editionLabel} · {item.quantity} unidade(s)</span></div></div>)}</div>
        {cart.data.couponCode && <p className="checkout-applied-coupon">Cupom aplicado: <strong>{cart.data.couponCode}</strong></p>}
        {selectedQuote && <QuoteLines quote={selectedQuote} />}
        <section className="checkout-wallet-section" aria-labelledby="wallet-heading"><div className="checkout-section-heading"><div><h2 id="wallet-heading">Carteira e rede</h2><p>Selecione uma carteira cadastrada na sua conta.</p></div>{wallets.data.connectedWalletId === activeWalletId && <Button variant="outline" type="button" onClick={() => disconnect.mutate()}>Desconectar</Button>}</div>
          <div className="checkout-wallet-list">{wallets.data.wallets.map((wallet) => <label className={`checkout-wallet${activeWalletId === wallet.id ? ' is-selected' : ''}`} key={wallet.id}><input type="radio" name="wallet" value={wallet.id} checked={activeWalletId === wallet.id} onChange={() => setWalletId(wallet.id)} /><span className="checkout-wallet-icon" aria-hidden="true">◇</span><span><strong>{wallet.label}</strong><small>{wallet.address.slice(0, 8)}…{wallet.address.slice(-6)} · {wallet.role === 'primary' ? 'Principal' : 'Secundária'}</small></span><span className="checkout-wallet-check" aria-hidden="true">✓</span></label>)}</div>
          <label className="checkout-network" htmlFor="checkout-network">Rede<select id="checkout-network" aria-label="Rede de pagamento" value={networkId} onChange={(e) => setNetworkId(e.target.value)}>{wallets.data.networks.map((network) => <option key={network.id} value={network.id}>{network.name}</option>)}</select></label>
        {wallets.data.connectedWalletId === activeWalletId ? <p className="checkout-connected" role="status">Carteira conectada (simulação).</p> : <Button type="button" variant="outline" disabled={connect.isPending} onClick={() => connect.mutate(activeWalletId, { onError: (error) => setFeedback(getApiError(error).message) })}>{connect.isPending ? 'Conectando…' : 'Conectar carteira'}</Button>}
        </section>
        {changes.length > 0 && <div className="checkout-quote-warning" role="status" aria-label="Cotação atualizada" aria-live="polite"><strong>Cotação atualizada</strong><ul>{changes.map((change) => <li key={change}>{change}</li>)}</ul><p>Confira os novos valores e confirme novamente.</p></div>}
        {fieldError && <p id="collector-field-error" className="checkout-error" role="alert">{fieldError}</p>}{feedback && <p className="checkout-feedback" role="alert">{feedback}</p>}{create.isError && <p className="checkout-error" role="alert">A resposta não foi recebida. Tente novamente para recuperar a mesma tentativa de pedido.</p>}
        <Button className="checkout-submit" type="submit" disabled={busy || submitted || wallets.data.connectedWalletId !== activeWalletId}>{busy || submitted ? 'Processando…' : changes.length ? 'Confirmar novos valores' : 'Confirmar compra'}</Button>
        <p className="checkout-simulation-note">Pagamento simulado. Nenhuma transação real será enviada à blockchain.</p><Link className="checkout-back-link" to="/cart">Voltar ao carrinho</Link>
      </aside>
    </form>
    {createPortal(<Button className="checkout-submit-mobile" type="submit" form="checkout-form" disabled={busy || submitted || wallets.data.connectedWalletId !== activeWalletId}>{busy || submitted ? 'Processando…' : changes.length ? 'Confirmar novos valores' : 'Confirmar compra'}</Button>, document.body)}
  </div>
}
function QuoteLines({ quote }: { quote: Quote }) { return <dl className="checkout-quote-lines"><div><dt>Subtotal</dt><dd>{quote.subtotalEth} ETH</dd></div><div><dt>Desconto</dt><dd>− {quote.discountEth} ETH</dd></div><div><dt>Taxa de rede</dt><dd>{quote.networkFeeEth} ETH</dd></div><div className="checkout-grand-total"><dt>Total</dt><dd>{quote.totalEth} ETH</dd></div></dl> }
function CheckoutLoading() { return <div className="checkout-page" data-testid="checkout-skeleton" aria-busy="true"><div className="checkout-loading-main"><i /><i /><i /></div><div className="checkout-loading-summary"><i /><i /><i /><i /></div><span className="sr-only">Carregando pagamento…</span></div> }

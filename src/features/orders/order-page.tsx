import { Link, useParams } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useOrder, useRefreshOrder } from '@/features/checkout/queries'
import { getApiError } from '@/api/errors'

export function OrderPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' })
  const query = useOrder(orderId)
  const refresh = useRefreshOrder()
  const attempted = useRef(false)
  useEffect(() => {
    if (query.data?.order.status === 'pending' && !attempted.current) { attempted.current = true; refresh.mutate(orderId, { onSuccess: (result) => query.refetch().then(() => result), onError: () => undefined }) }
  }, [orderId, query.data?.order.status])
  if (query.isPending) return <section className="order-page" aria-busy="true"><p>Recuperando seu pedido…</p></section>
  if (query.isError || !query.data) return <section className="order-page order-error" role="alert"><h1>Pedido não encontrado</h1><p>{query.isError ? getApiError(query.error).message : 'Não foi possível acessar este pedido.'}</p><Link to="/cart">Voltar ao carrinho</Link></section>
  const { order, receipt } = query.data
  const confirmedReceipt = receipt ?? order.receipt
  return <div className="order-page" data-testid="order-page">
    <nav className="checkout-breadcrumb" aria-label="Breadcrumb"><Link to="/" search={{ page: 1, sort: 'recent' }}>Início</Link><span aria-hidden="true">/</span><span aria-current="page">Pedido {order.id}</span></nav>
    <article className={`order-card order-${order.status}`}>
      <div className="order-mark" aria-hidden="true">{order.status === 'confirmed' ? '✓' : order.status === 'rejected' ? '!' : '…'}</div>
      <p className="eyebrow">PEDIDO {order.status === 'confirmed' ? 'CONFIRMADO' : order.status === 'rejected' ? 'RECUSADO' : 'EM PROCESSAMENTO'}</p>
      <h1>{order.status === 'confirmed' ? 'Seus NFTs agora estão na sua carteira' : order.status === 'rejected' ? 'Não foi possível confirmar seu pedido' : 'Seu pedido está sendo processado'}</h1>
      <p className="order-status-copy" role="status" aria-live="polite">{order.status === 'confirmed' ? 'Sua compra foi confirmada. Este recibo registra os valores aprovados no momento do pedido.' : order.status === 'rejected' ? 'O pagamento simulado foi recusado. Seus itens continuam no carrinho.' : 'A confirmação ainda não chegou. Você pode consultar novamente sem criar outro pedido.'}</p>
      {order.status === 'pending' && <Button variant="outline" disabled={refresh.isPending} onClick={() => refresh.mutate(orderId, { onSuccess: () => void query.refetch() })}>{refresh.isPending ? 'Consultando…' : 'Consultar status do pedido'}</Button>}
      {order.status === 'rejected' && <p className="order-error-copy" role="alert">{refresh.isError ? getApiError(refresh.error).message : 'Nenhum valor foi removido do carrinho.'}</p>}
      {confirmedReceipt && <>
        <dl className="order-metadata"><div><dt>Referência da transação</dt><dd className="order-hash">{confirmedReceipt.transactionReference}</dd></div><div><dt>Data</dt><dd>{new Date(confirmedReceipt.confirmedAt).toLocaleString('pt-BR')}</dd></div><div><dt>Carteira</dt><dd>{confirmedReceipt.wallet.address}</dd></div><div><dt>Rede</dt><dd>{confirmedReceipt.network.name}</dd></div></dl>
        <section className="receipt-section" aria-labelledby="receipt-items-heading"><h2 id="receipt-items-heading">Itens do pedido</h2>{confirmedReceipt.items.map((item) => <article className="receipt-item" key={`${item.nftId}:${item.editionId}`}><img src={item.imageUrl} alt={`Arte de ${item.name}`} /><div><strong>{item.name}</strong><span>{item.editionLabel} · {item.quantity} unidade(s)</span></div><p>{item.subtotalEth} ETH</p></article>)}</section>
        <dl className="checkout-quote-lines receipt-amounts"><div><dt>Subtotal</dt><dd>{confirmedReceipt.quote.subtotalEth} ETH</dd></div><div><dt>Desconto</dt><dd>− {confirmedReceipt.quote.discountEth} ETH</dd></div><div><dt>Taxa de rede</dt><dd>{confirmedReceipt.quote.networkFeeEth} ETH</dd></div><div className="checkout-grand-total"><dt>Total pago</dt><dd>{confirmedReceipt.quote.totalEth} ETH</dd></div></dl>
        <p className="receipt-simulation-note">Referência de transação simulada. Nenhuma operação foi enviada a uma blockchain.</p><a className="receipt-explorer-link" href={confirmedReceipt.explorerUrl} target="_blank" rel="noreferrer">Ver referência simulada</a>
      </>}
      <div className="order-actions"><Link to="/" search={{ page: 1, sort: 'recent' }}>Voltar ao mercado</Link><Link to="/cart">Abrir carrinho</Link></div>
    </article>
  </div>
}

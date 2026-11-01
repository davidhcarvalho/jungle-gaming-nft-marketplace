import { http, HttpResponse } from 'msw'
import { ethToWei, percentageOfWei, weiToEth } from '@/lib/eth-decimal'
import { getMockScenario } from '@/mocks/scenarios/state'
import { getMockSession } from '@/mocks/state/auth-store'
import { getMockCart } from '@/mocks/state/cart-store'
import { consumeTimeout, createMockOrder, getCheckoutWallets, getOrderForUser, rememberTimeout, setConnectedManualWallet, setConnectedWallet, transitionMockOrder } from '@/mocks/state/orders-store'
import type { ApiError, CheckoutRevalidationResponse, CreateOrderPayload, OrderResponse } from '@/types/api'
import type { Quote } from '@/types/domain'

export const checkoutOrderHandlers = [
  http.get('/api/checkout/wallets', ({ request }) => {
    const user = requireUser(request); if (!user) return apiError('unauthorized', 'Entre para acessar suas carteiras.', 401)
    return HttpResponse.json(getCheckoutWallets(user.userId))
  }),
  http.post('/api/checkout/wallets/connect', async ({ request }) => {
    const user = requireUser(request); if (!user) return apiError('unauthorized', 'Entre para conectar uma carteira.', 401)
    if (getMockScenario() === 'wallet-rejected') return apiError('conflict', 'A conexão da carteira foi recusada.', 409)
    const body = await readBody(request); const wallets = getCheckoutWallets(user.userId)
    if (typeof body.walletId === 'string') {
      if (!wallets.wallets.some((wallet) => wallet.id === body.walletId)) return apiError('validation', 'Selecione uma carteira cadastrada.', 422)
      return HttpResponse.json(setConnectedWallet(user.userId, body.walletId))
    }
    if (typeof body.manualWallet === 'object' && body.manualWallet !== null) {
      const manual = body.manualWallet as Record<string, unknown>
      const providers = ['MetaMask', 'WalletConnect', 'Coinbase Wallet']
      if (typeof manual.provider !== 'string' || !providers.includes(manual.provider)
        || typeof manual.address !== 'string' || !/^0x[\da-fA-F]{40}$/.test(manual.address)
        || typeof manual.networkId !== 'string' || !wallets.networks.some((network) => network.id === manual.networkId)) {
        return apiError('validation', 'Informe um provedor, endereço e rede válidos para a carteira desta compra.', 422)
      }
      return HttpResponse.json(setConnectedManualWallet(user.userId, { provider: manual.provider, address: manual.address, networkId: manual.networkId }))
    }
    return apiError('validation', 'Selecione uma carteira salva ou informe uma carteira para esta compra.', 422)
  }),
  http.post('/api/checkout/wallets/disconnect', ({ request }) => {
    const user = requireUser(request); if (!user) return apiError('unauthorized', 'Entre para desconectar a carteira.', 401)
    return HttpResponse.json(setConnectedWallet(user.userId))
  }),
  http.post('/api/checkout/revalidate', async ({ request }) => {
    const user = requireUser(request); if (!user) return apiError('unauthorized', 'Entre para revisar a cotação.', 401)
    if (getMockScenario() === 'checkout-availability-changed') return apiError('availability', 'A disponibilidade desta edição mudou. Revise seu carrinho.', 409)
    const cart = getMockCart(`user:${user.userId}`)
    if (!cart.items.length) return apiError('validation', 'Seu carrinho está vazio.', 422)
    if (cart.items.some((item) => item.quantity > item.available)) return apiError('availability', 'A disponibilidade mudou e não cobre mais as quantidades do carrinho. Ajuste os itens antes de continuar.', 409)
    const body = await readBody(request)
    return HttpResponse.json<CheckoutRevalidationResponse>(getRevalidatedQuote(cart, typeof body.networkId === 'string' ? body.networkId : 'ethereum'))
  }),
  http.post('/api/orders', async ({ request }) => {
    const user = requireUser(request); if (!user) return apiError('unauthorized', 'Entre para criar o pedido.', 401)
    const key = request.headers.get('idempotency-key')
    if (!key || !/^[a-f0-9-]{16,64}$/i.test(key)) return apiError('validation', 'Chave de idempotência ausente ou inválida.', 422)
    const payload = await readBody(request) as unknown as CreateOrderPayload
    const wallets = getCheckoutWallets(user.userId)
    if (wallets.connectedWalletId !== payload.walletId) return apiError('conflict', 'Conecte a carteira selecionada antes de confirmar.', 409)
    const validation = validateOrderPayload(payload)
    if (validation) return apiError('validation', validation, 422)
    const currentCart = getMockCart(`user:${user.userId}`)
    const latestQuote = getRevalidatedQuote(currentCart, payload.networkId).quote
    if (!sameQuote(latestQuote, payload.quote) || payload.quote.cartVersion !== currentCart.version) return apiError('conflict', 'A cotação mudou antes da confirmação. Revise os valores atualizados.', 409)
    if (getMockScenario() === 'order-server-error') return apiError('server', 'O serviço de pagamento está temporariamente indisponível.', 503)
    const timeoutKey = `${user.userId}:${key}`
    if (getMockScenario() === 'order-timeout-after-create' && !consumeTimeout(timeoutKey)) {
      const orderWallets = wallets.connectedManualWallet ? [...wallets.wallets, wallets.connectedManualWallet] : wallets.wallets
      const created = createMockOrder(user.userId, key, payload, { status: 'pending', wallets: orderWallets, networks: wallets.networks })
      if ('conflict' in created) return apiError('conflict', 'A tentativa não corresponde ao carrinho atual.', 409)
      rememberTimeout(timeoutKey)
      return HttpResponse.error()
    }
    const orderWallets = wallets.connectedManualWallet ? [...wallets.wallets, wallets.connectedManualWallet] : wallets.wallets
    const result = createMockOrder(user.userId, key, payload, { status: 'pending', wallets: orderWallets, networks: wallets.networks })
    if ('conflict' in result) return apiError('conflict', 'Esta chave já foi usada com outros dados ou o carrinho mudou.', 409)
    return HttpResponse.json<OrderResponse>({ order: result.order }, { status: result.replayed ? 200 : 201 })
  }),
  http.get('/api/orders/:orderId', ({ request, params }) => {
    const user = requireUser(request); if (!user) return apiError('unauthorized', 'Entre para consultar o pedido.', 401)
    const order = getOrderForUser(user.userId, String(params.orderId)); if (!order) return apiError('not_found', 'Pedido não encontrado.', 404)
    return HttpResponse.json<OrderResponse>({ order, receipt: order.receipt })
  }),
  http.post('/api/orders/:orderId/refresh', ({ request, params }) => {
    const user = requireUser(request); if (!user) return apiError('unauthorized', 'Entre para consultar o pedido.', 401)
    const order = getOrderForUser(user.userId, String(params.orderId)); if (!order) return apiError('not_found', 'Pedido não encontrado.', 404)
    if (order.status === 'pending' && getMockScenario() !== 'order-pending') {
      const status = getMockScenario() === 'order-rejected' ? 'rejected' : 'confirmed'
      transitionMockOrder(order, status)
    }
    return HttpResponse.json<OrderResponse>({ order, receipt: order.receipt })
  }),
]

function quoteForCart(cart: ReturnType<typeof getMockCart>, networkId: string): Quote {
  const subtotal = cart.items.reduce((sum, item) => sum + ethToWei(item.unitPriceEth) * BigInt(item.quantity), 0n)
  const discount = cart.couponCode === 'KURIO10' ? percentageOfWei(subtotal, 10) : 0n
  const fee = cart.items.length ? ethToWei(networkId === 'polygon' ? '0.004' : '0.016') : 0n
  return { id: `checkout:${cart.ownerId}:${cart.version}:${networkId}`, cartVersion: cart.version, validUntil: new Date(Date.now() + 5 * 60_000).toISOString(), currency: 'ETH', subtotalEth: weiToEth(subtotal), discountEth: weiToEth(discount), networkFeeEth: weiToEth(fee), totalEth: weiToEth(subtotal - discount + fee), coupon: cart.couponCode ? { code: cart.couponCode } : undefined, version: cart.version, items: cart.items.map((item) => ({ nftId: item.nftId, editionId: item.editionId, quantity: item.quantity, unitPriceEth: item.unitPriceEth, subtotalEth: item.lineTotalEth })) }
}
function getRevalidatedQuote(cart: ReturnType<typeof getMockCart>, networkId: string): CheckoutRevalidationResponse {
  const quote = quoteForCart(cart, networkId); const changes: string[] = []
  if (getMockScenario() === 'checkout-price-changed') { const line = quote.items?.[0]; if (line) { line.unitPriceEth = weiToEth(ethToWei(line.unitPriceEth) + ethToWei('0.20')); line.subtotalEth = weiToEth(ethToWei(line.subtotalEth) + ethToWei('0.20')) }; quote.subtotalEth = weiToEth(ethToWei(quote.subtotalEth) + ethToWei('0.20')); quote.totalEth = weiToEth(ethToWei(quote.subtotalEth) - ethToWei(quote.discountEth) + ethToWei(quote.networkFeeEth)); quote.id += ':price-update'; changes.push('O preço de uma edição mudou.') }
  if (getMockScenario() === 'checkout-coupon-expired') { quote.discountEth = '0'; quote.totalEth = weiToEth(ethToWei(quote.subtotalEth) + ethToWei(quote.networkFeeEth)); quote.coupon = undefined; quote.id += ':coupon-expired'; changes.push('O cupom expirou e foi removido da cotação.') }
  if (getMockScenario() === 'checkout-fee-changed') { quote.networkFeeEth = '0.024'; quote.totalEth = weiToEth(ethToWei(quote.subtotalEth) - ethToWei(quote.discountEth) + ethToWei(quote.networkFeeEth)); quote.id += ':fee-update'; changes.push('A taxa de rede foi atualizada.') }
  return { quote, changes }
}
function sameQuote(a: Quote, b: Quote) { return a.id === b.id && a.subtotalEth === b.subtotalEth && a.discountEth === b.discountEth && a.networkFeeEth === b.networkFeeEth && a.totalEth === b.totalEth && JSON.stringify(a.items) === JSON.stringify(b.items) }
function validateOrderPayload(payload: CreateOrderPayload): string | undefined {
  if (!payload || typeof payload.quoteId !== 'string' || payload.quote?.id !== payload.quoteId || !Array.isArray(payload.items) || !payload.items.length || !payload.collector || !payload.collector.displayName?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.collector.email)) return 'Revise os dados do colecionador e da cotação.'
  if (!payload.items.every((item) => Number.isSafeInteger(item.quantity) && item.quantity > 0)) return 'As quantidades do pedido são inválidas.'
  return undefined
}
function requireUser(request: Request) { const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''); return getMockSession(token ?? null) }
async function readBody(request: Request): Promise<Record<string, unknown>> { try { const body: unknown = await request.json(); return typeof body === 'object' && body !== null ? body as Record<string, unknown> : {} } catch { return {} } }
function apiError(code: ApiError['code'], message: string, status: number): Response { return HttpResponse.json<ApiError>({ code, message }, { status }) }

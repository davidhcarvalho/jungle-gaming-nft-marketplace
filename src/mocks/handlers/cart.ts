import { delay, http, HttpResponse } from 'msw'

import { ethToWei, multiplyEth, percentageOfWei, weiToEth } from '@/lib/eth-decimal'
import { getMockScenario } from '@/mocks/scenarios/state'
import { getMockSession } from '@/mocks/state/auth-store'
import {
  addMockCartItem,
  CartStoreError,
  clearMockCartCoupon,
  getMockCart,
  removeMockCartItem,
  setMockCartCoupon,
  updateMockCartItem,
} from '@/mocks/state/cart-store'
import type { ApiError, CartResponse, QuoteResponse } from '@/types/api'

const networkFeeWei = ethToWei('0.016')

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    if (getMockScenario() === 'cart-error') return apiError('server', 'Não foi possível carregar o carrinho.', 503)
    if (getMockScenario() === 'slow') await delay(800)
    const owner = getCartOwner(request)
    if (!owner) return apiError('unauthorized', 'Não foi possível identificar este carrinho.', 401)
    return HttpResponse.json<CartResponse>(getMockCart(owner))
  }),

  http.post('/api/cart/items', async ({ request }) => {
    if (isCartMutationError()) return apiError('server', 'Não foi possível adicionar este NFT.', 503)
    if (getMockScenario() === 'slow') await delay(800)
    const owner = getCartOwner(request)
    if (!owner) return apiError('unauthorized', 'Não foi possível identificar este carrinho.', 401)
    const body = await readBody(request)
    if (typeof body.nftId !== 'string' || typeof body.editionId !== 'string' || !isInteger(body.quantity)) {
      return apiError('validation', 'Informe NFT, edição e quantidade válidos.', 422)
    }
    return runCartMutation(() => addMockCartItem(owner, body.nftId as string, body.editionId as string, body.quantity as number), 201)
  }),

  http.patch('/api/cart/items/:itemId', async ({ request, params }) => {
    if (isCartMutationError()) return apiError('server', 'Não foi possível atualizar a quantidade.', 503)
    const owner = getCartOwner(request)
    if (!owner) return apiError('unauthorized', 'Não foi possível identificar este carrinho.', 401)
    const body = await readBody(request)
    if (!isInteger(body.quantity)) return apiError('validation', 'A quantidade precisa ser um número inteiro.', 422)
    return runCartMutation(() => updateMockCartItem(owner, String(params.itemId), body.quantity as number))
  }),

  http.delete('/api/cart/items/:itemId', ({ request, params }) => {
    if (isCartMutationError()) return apiError('server', 'Não foi possível remover este item.', 503)
    const owner = getCartOwner(request)
    if (!owner) return apiError('unauthorized', 'Não foi possível identificar este carrinho.', 401)
    return runCartMutation(() => removeMockCartItem(owner, String(params.itemId)))
  }),

  http.post('/api/cart/coupon', async ({ request }) => {
    const owner = getCartOwner(request)
    if (!owner) return apiError('unauthorized', 'Não foi possível identificar este carrinho.', 401)
    const body = await readBody(request)
    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
    if (code === 'EXPIRED') return apiError('coupon_expired', 'Este cupom expirou.', 422)
    if (code !== 'KURIO10') return apiError('coupon_invalid', 'Este código de cupom não é válido.', 422)
    const cart = getMockCart(owner)
    if (!cart.items.length) return apiError('validation', 'Adicione um NFT antes de aplicar o cupom.', 422)
    return HttpResponse.json<CartResponse>(setMockCartCoupon(owner, code))
  }),

  http.delete('/api/cart/coupon', ({ request }) => {
    const owner = getCartOwner(request)
    if (!owner) return apiError('unauthorized', 'Não foi possível identificar este carrinho.', 401)
    return HttpResponse.json<CartResponse>(clearMockCartCoupon(owner))
  }),

  http.post('/api/quote', async ({ request }) => {
    if (getMockScenario() === 'quote-error') return apiError('server', 'Não foi possível atualizar a cotação.', 503)
    if (getMockScenario() === 'slow') await delay(800)
    const owner = getCartOwner(request)
    if (!owner) return apiError('unauthorized', 'Não foi possível identificar esta cotação.', 401)
    const cart = getMockCart(owner)
    const subtotalWei = cart.items.reduce((total, item) => total + multiplyEth(item.unitPriceEth, item.quantity), 0n)
    const discountWei = cart.couponCode === 'KURIO10' ? percentageOfWei(subtotalWei, 10) : 0n
    const feeWei = cart.items.length ? networkFeeWei : 0n
    const totalWei = subtotalWei - discountWei + feeWei
    const quoteId = `quote:${encodeURIComponent(owner)}:${cart.version}`
    const result: QuoteResponse = {
      id: quoteId,
      cartVersion: cart.version,
      validUntil: new Date(Date.now() + 5 * 60_000).toISOString(),
      currency: 'ETH',
      subtotalEth: weiToEth(subtotalWei),
      discountEth: weiToEth(discountWei),
      networkFeeEth: weiToEth(feeWei),
      totalEth: weiToEth(totalWei),
      coupon: cart.couponCode ? { code: cart.couponCode } : undefined,
      version: cart.version,
    }
    return HttpResponse.json<QuoteResponse>(result)
  }),
]

function getCartOwner(request: Request) {
  const sessionToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (sessionToken) {
    const session = getMockSession(sessionToken)
    return session ? `user:${session.userId}` : null
  }
  const guestId = request.headers.get('x-guest-cart-id')
  if (!guestId || !/^[a-zA-Z0-9_-]{8,64}$/.test(guestId)) return null
  return `guest:${guestId}`
}

function runCartMutation(operation: () => CartResponse, status = 200) {
  try {
    return HttpResponse.json<CartResponse>(operation(), { status })
  } catch (error) {
    if (error instanceof CartStoreError) {
      const statusCode = error.code === 'not_found' ? 404 : error.code === 'availability' ? 409 : 422
      return apiError(error.code, error.message, statusCode)
    }
    throw error
  }
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json()
    return typeof body === 'object' && body !== null ? body as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value)
}

function isCartMutationError() {
  const scenario = getMockScenario()
  return scenario === 'cart-mutation-error' || scenario === 'cart-existing-mutation-error'
}

function apiError(code: ApiError['code'], message: string, status: number): Response {
  return HttpResponse.json<ApiError>({ code, message }, { status })
}

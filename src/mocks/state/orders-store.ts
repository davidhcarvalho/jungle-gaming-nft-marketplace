import { getMockCart, removeMockCartItem, updateMockCartItem } from '@/mocks/state/cart-store'
import { getWalletsForUser, resetWalletMockState, setWalletConnection } from '@/mocks/state/wallets-store'
import { multiplyEth, weiToEth } from '@/lib/eth-decimal'
import type { CheckoutCollectorDetails, CreateOrderPayload } from '@/types/api'
import type { Network, Order, OrderItem, Receipt, Wallet } from '@/types/domain'

interface StoredOrders { version: 1; orders: Order[]; idempotency: Record<string, { payload: string; orderId: string }>; timedOutKeys: string[]; manualConnectionsByUser?: Record<string, Wallet> }
const storageKey = 'kurio:mock-orders-state'
export function resetOrderMockState() { try { localStorage.removeItem(storageKey) } catch { /* deterministic in-memory fallback */ }; resetWalletMockState() }
export function getCheckoutWallets(userId: string) {
  const savedWallets = getWalletsForUser(userId)
  const connectedManualWallet = readState().manualConnectionsByUser?.[userId]
  return { ...savedWallets, connectedWalletId: connectedManualWallet?.id ?? savedWallets.connectedWalletId, ...(connectedManualWallet ? { connectedManualWallet: structuredClone(connectedManualWallet) } : {}) }
}
export function setConnectedWallet(userId: string, walletId?: string) {
  const state = readState()
  if (state.manualConnectionsByUser) delete state.manualConnectionsByUser[userId]
  writeState(state)
  return setWalletConnection(userId, walletId)
}
export function setConnectedManualWallet(userId: string, input: { provider: string; address: string; networkId: string }) {
  setWalletConnection(userId)
  const state = readState()
  const wallet: Wallet = { id: `manual:${input.networkId}:${input.address.toLowerCase()}`, address: input.address, label: input.provider, networkId: input.networkId, role: 'secondary' }
  state.manualConnectionsByUser ??= {}
  state.manualConnectionsByUser[userId] = wallet
  writeState(state)
  return getCheckoutWallets(userId)
}
export function rememberTimeout(key: string) { const state = readState(); if (!state.timedOutKeys.includes(key)) state.timedOutKeys.push(key); writeState(state) }
export function consumeTimeout(key: string) { const state = readState(); if (!state.timedOutKeys.includes(key)) return false; state.timedOutKeys = state.timedOutKeys.filter((candidate) => candidate !== key); writeState(state); return true }
export function getOrderForUser(userId: string, orderId: string) { return readState().orders.find((order) => order.id === orderId && order.userId === userId) }
export function createMockOrder(userId: string, key: string, payload: CreateOrderPayload, options: { status: Order['status']; wallets: Wallet[]; networks: Network[] }) {
  const state = readState(); const serialized = canonicalPayload(payload); const scopedKey = `${userId}:${key}`; const previous = state.idempotency[scopedKey]
  if (previous) {
    if (previous.payload !== serialized) return { conflict: true as const }
    const existing = state.orders.find((order) => order.id === previous.orderId)
    return existing && existing.userId === userId ? { order: existing, replayed: true as const } : { conflict: true as const }
  }
  const wallet = options.wallets.find((candidate) => candidate.id === payload.walletId)
  const network = options.networks.find((candidate) => candidate.id === payload.networkId)
  if (!wallet || !network) return { conflict: true as const }
  const cart = getMockCart(`user:${userId}`)
  if (payload.items.some((requested) => {
    const item = cart.items.find((line) => line.nftId === requested.nftId && line.editionId === requested.editionId)
    return !item || requested.quantity < 1 || requested.quantity > item.available || requested.quantity > item.quantity
  })) return { conflict: true as const }
  const items: OrderItem[] = payload.items.map((requested) => {
    const item = cart.items.find((line) => line.nftId === requested.nftId && line.editionId === requested.editionId)!
    const quotedLine = payload.quote.items?.find((line) => line.nftId === item.nftId && line.editionId === item.editionId)
    const unitPriceEth = quotedLine?.unitPriceEth ?? item.unitPriceEth
    return { nftId: item.nftId, name: item.nftName, editionId: item.editionId, editionLabel: item.editionLabel, quantity: requested.quantity, unitPriceEth, subtotalEth: weiToEth(multiplyEth(unitPriceEth, requested.quantity)), imageUrl: item.imageUrl }
  })
  const id = `order-${crypto.randomUUID()}`
  const createdAt = new Date().toISOString()
  const order: Order = { id, userId, status: options.status, items, quote: structuredClone(payload.quote), version: 1, createdAt, wallet: structuredClone(wallet), network: structuredClone(network) }
  if (options.status === 'confirmed') order.receipt = createReceipt(order)
  state.orders.push(order); state.idempotency[scopedKey] = { payload: serialized, orderId: id }; writeState(state)
  return { order, replayed: false as const }
}
export function transitionMockOrder(order: Order, status: 'confirmed' | 'rejected') {
  const state = readState()
  const storedOrder = state.orders.find((candidate) => candidate.id === order.id && candidate.userId === order.userId)
  if (!storedOrder || storedOrder.status !== 'pending') return storedOrder ?? order
  storedOrder.status = status; storedOrder.version += 1
  if (status === 'confirmed') storedOrder.receipt = createReceipt(storedOrder)
  writeState(state)
  if (status === 'confirmed') removePurchasedQuantities(storedOrder)
  return storedOrder
}
function removePurchasedQuantities(order: Order) {
  const owner = `user:${order.userId}`; const cart = getMockCart(owner)
  for (const bought of order.items) {
    const line = cart.items.find((item) => item.nftId === bought.nftId && item.editionId === bought.editionId)
    if (!line) continue
    const remaining = line.quantity - bought.quantity
    if (remaining <= 0) { try { removeMockCartItem(owner, line.id) } catch { /* already removed */ } }
    else { try { updateMockCartItem(owner, line.id, remaining) } catch { /* keep server state consistent */ } }
  }
}
function createReceipt(order: Order): Receipt {
  return { orderId: order.id, transactionReference: `0x${order.id.replace(/[^a-f0-9]/gi, '').padEnd(64, 'a').slice(0, 64)}`, explorerUrl: `https://explorer.simulated.invalid/tx/${order.id}`, confirmedAt: new Date().toISOString(), items: structuredClone(order.items), quote: structuredClone(order.quote), wallet: structuredClone(order.wallet), network: structuredClone(order.network) }
}
function canonicalPayload(payload: CreateOrderPayload) {
  const { id, cartVersion, currency, subtotalEth, discountEth, networkFeeEth, totalEth, coupon, version, items: quoteItems } = payload.quote
  const stableQuote = { id, cartVersion, currency, subtotalEth, discountEth, networkFeeEth, totalEth, coupon, version, items: quoteItems }
  return JSON.stringify({ ...payload, quote: stableQuote, items: [...payload.items].sort((a, b) => `${a.nftId}:${a.editionId}`.localeCompare(`${b.nftId}:${b.editionId}`)) })
}
function readState(): StoredOrders {
  try { const raw = localStorage.getItem(storageKey); if (raw) { const parsed: unknown = JSON.parse(raw); if (isStored(parsed)) return parsed } } catch { /* initialize */ }
  return { version: 1, orders: [], idempotency: {}, timedOutKeys: [] }
}
function writeState(state: StoredOrders) { try { localStorage.setItem(storageKey, JSON.stringify(state)) } catch { /* memory-only is acceptable for mock fallback */ } }
function isStored(value: unknown): value is StoredOrders { return typeof value === 'object' && value !== null && (value as StoredOrders).version === 1 && Array.isArray((value as StoredOrders).orders) && typeof (value as StoredOrders).idempotency === 'object' }
export type { CheckoutCollectorDetails }

import { getMockCart, removeMockCartItem, updateMockCartItem } from '@/mocks/state/cart-store'
import { multiplyEth, weiToEth } from '@/lib/eth-decimal'
import type { CheckoutCollectorDetails, CreateOrderPayload } from '@/types/api'
import type { Network, Order, OrderItem, Receipt, Wallet } from '@/types/domain'

interface StoredOrders { version: 1; orders: Order[]; idempotency: Record<string, { payload: string; orderId: string }>; timedOutKeys: string[] }
const storageKey = 'kurio:mock-orders-state'
export function resetOrderMockState() { try { localStorage.removeItem(storageKey); localStorage.removeItem('kurio:checkout-wallet-state') } catch { /* deterministic in-memory fallback */ } }
export function getCheckoutWallets(userId: string) {
  const wallets: Wallet[] = [
    { id: `${userId}:wallet-primary`, address: userId === 'user-leo' ? '0x9C8f2A4B7D1E6F305A8c2b9D4E7F1A6C3D5B8E20' : '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', label: 'MetaMask · Principal', networkId: 'ethereum', role: 'primary' },
    { id: `${userId}:wallet-secondary`, address: '0x3A4f09b2C1D7E6F8A5b4C3D2E1F0a9876543210B', label: 'Coinbase · Secundária', networkId: 'polygon', role: 'secondary' },
  ]
  const state = readWalletState()
  return { wallets, networks: [{ id: 'ethereum', name: 'Ethereum', currency: 'ETH' as const }, { id: 'polygon', name: 'Polygon', currency: 'ETH' as const }], connectedWalletId: state[userId] }
}
export function setConnectedWallet(userId: string, walletId?: string) {
  const state = readWalletState(); if (walletId) state[userId] = walletId; else delete state[userId]
  try { localStorage.setItem('kurio:checkout-wallet-state', JSON.stringify(state)) } catch { /* no-op */ }
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
function readWalletState(): Record<string, string> { try { const raw = localStorage.getItem('kurio:checkout-wallet-state'); if (raw) return JSON.parse(raw) as Record<string, string> } catch { /* use empty */ } return {} }
function isStored(value: unknown): value is StoredOrders { return typeof value === 'object' && value !== null && (value as StoredOrders).version === 1 && Array.isArray((value as StoredOrders).orders) && typeof (value as StoredOrders).idempotency === 'object' }
export type { CheckoutCollectorDetails }

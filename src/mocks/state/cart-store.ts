import { nftFixtures } from '@/features/catalog/fixtures'
import { multiplyEth, weiToEth } from '@/lib/eth-decimal'
import type { Cart, CartItem } from '@/types/domain'

interface StoredLine {
  nftId: string
  editionId: string
  quantity: number
}

interface StoredCart {
  version: number
  lines: StoredLine[]
  couponCode?: string
}

interface StoredCartState {
  version: 1
  carts: Record<string, StoredCart>
}

export class CartStoreError extends Error {
  constructor(readonly code: 'validation' | 'not_found' | 'availability' | 'conflict', message: string) {
    super(message)
    this.name = 'CartStoreError'
  }
}

const storageKey = 'kurio:mock-cart-state'

export function resetCartMockState(seedExistingUserCart = false) {
  try {
    const initial: StoredCartState = seedExistingUserCart
      ? { version: 1, carts: { 'user:user-ana': { version: 1, lines: [{ nftId: 'emerald-ape-042', editionId: 'emerald-ape-042-1of50', quantity: 2 }] } } }
      : { version: 1, carts: {} }
    window.localStorage.setItem(storageKey, JSON.stringify(initial))
  } catch {
    // The next read starts from a clean in-memory-shaped state.
  }
}

export function getMockCart(ownerId: string): Cart {
  const stored = readState().carts[ownerId] ?? { version: 0, lines: [] }
  return {
    id: `cart:${ownerId}`,
    ownerId,
    version: stored.version,
    couponCode: stored.couponCode,
    items: stored.lines.map(toCartItem),
  }
}

export function addMockCartItem(ownerId: string, nftId: string, editionId: string, quantity: number) {
  const { edition } = findEdition(nftId, editionId)
  validateQuantity(quantity, edition.available)
  const state = readState()
  const cart = state.carts[ownerId] ?? { version: 0, lines: [] }
  const existing = cart.lines.find((line) => line.nftId === nftId && line.editionId === editionId)
  const nextQuantity = (existing?.quantity ?? 0) + quantity
  if (nextQuantity > edition.available) {
    throw new CartStoreError('availability', `Disponibilidade máxima de ${edition.available} unidade(s) para esta edição.`)
  }
  if (existing) existing.quantity = nextQuantity
  else cart.lines.push({ nftId, editionId, quantity })
  cart.version += 1
  state.carts[ownerId] = cart
  writeState(state)
  return getMockCart(ownerId)
}

export function updateMockCartItem(ownerId: string, itemId: string, quantity: number) {
  const state = readState()
  const cart = state.carts[ownerId]
  const line = cart?.lines.find((candidate) => cartItemId(candidate.nftId, candidate.editionId) === itemId)
  if (!cart || !line) throw new CartStoreError('not_found', 'Este item não está no carrinho.')
  const { edition } = findEdition(line.nftId, line.editionId)
  validateQuantity(quantity, edition.available)
  line.quantity = quantity
  cart.version += 1
  writeState(state)
  return getMockCart(ownerId)
}

export function removeMockCartItem(ownerId: string, itemId: string) {
  const state = readState()
  const cart = state.carts[ownerId]
  if (!cart) throw new CartStoreError('not_found', 'Este item não está no carrinho.')
  const nextLines = cart.lines.filter((line) => cartItemId(line.nftId, line.editionId) !== itemId)
  if (nextLines.length === cart.lines.length) throw new CartStoreError('not_found', 'Este item não está no carrinho.')
  cart.lines = nextLines
  cart.version += 1
  if (cart.lines.length === 0) delete cart.couponCode
  writeState(state)
  return getMockCart(ownerId)
}

export function setMockCartCoupon(ownerId: string, code: string) {
  const state = readState()
  const cart = state.carts[ownerId] ?? { version: 0, lines: [] }
  cart.couponCode = code
  cart.version += 1
  state.carts[ownerId] = cart
  writeState(state)
  return getMockCart(ownerId)
}

export function clearMockCartCoupon(ownerId: string) {
  const state = readState()
  const cart = state.carts[ownerId] ?? { version: 0, lines: [] }
  delete cart.couponCode
  cart.version += 1
  state.carts[ownerId] = cart
  writeState(state)
  return getMockCart(ownerId)
}

export function mergeGuestMockCart(guestId: string | null, userId: string) {
  if (!guestId) return { cart: getMockCart(`user:${userId}`), mergedItemCount: 0, limitedItems: [] as StoredLine[] }
  const state = readState()
  const guestOwnerId = `guest:${guestId}`
  const userOwnerId = `user:${userId}`
  const guest = state.carts[guestOwnerId]
  const account = state.carts[userOwnerId] ?? { version: 0, lines: [] }
  const limitedItems: StoredLine[] = []

  for (const guestLine of guest?.lines ?? []) {
    const { edition } = findEdition(guestLine.nftId, guestLine.editionId)
    const existing = account.lines.find((line) => line.nftId === guestLine.nftId && line.editionId === guestLine.editionId)
    const requested = (existing?.quantity ?? 0) + guestLine.quantity
    const capped = Math.min(requested, edition.available)
    if (capped < requested) limitedItems.push({ ...guestLine, quantity: capped })
    if (capped <= 0) continue
    if (existing) existing.quantity = capped
    else account.lines.push({ ...guestLine, quantity: capped })
  }

  if (guest?.lines.length) account.version += 1
  if (!account.couponCode && guest?.couponCode) account.couponCode = guest.couponCode
  state.carts[userOwnerId] = account
  delete state.carts[guestOwnerId]
  writeState(state)
  return { cart: getMockCart(userOwnerId), mergedItemCount: guest?.lines.length ?? 0, limitedItems }
}

export function cartItemId(nftId: string, editionId: string) {
  return `${nftId}::${editionId}`
}

function toCartItem(line: StoredLine): CartItem {
  const { nft, edition } = findEdition(line.nftId, line.editionId)
  return {
    id: cartItemId(line.nftId, line.editionId),
    nftId: nft.id,
    editionId: edition.id,
    quantity: line.quantity,
    nftName: nft.name,
    tokenId: nft.tokenId,
    editionLabel: edition.label,
    imageUrl: nft.imageUrl,
    network: nft.network,
    unitPriceEth: edition.priceEth,
    lineTotalEth: weiToEth(multiplyEth(edition.priceEth, line.quantity)),
    available: edition.available,
  }
}

function findEdition(nftId: string, editionId: string) {
  const nft = nftFixtures.find((candidate) => candidate.id === nftId)
  if (!nft) throw new CartStoreError('not_found', 'Este NFT não está disponível.')
  const edition = nft.editions.find((candidate) => candidate.id === editionId)
  if (!edition) throw new CartStoreError('not_found', 'Esta edição não está disponível.')
  if (edition.available <= 0) throw new CartStoreError('availability', 'Esta edição está esgotada.')
  return { nft, edition }
}

function validateQuantity(quantity: number, maximum: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new CartStoreError('validation', 'A quantidade precisa ser um inteiro maior que zero.')
  }
  if (quantity > maximum) {
    throw new CartStoreError('availability', `Disponibilidade máxima de ${maximum} unidade(s) para esta edição.`)
  }
}

function readState(): StoredCartState {
  try {
    const serialized = window.localStorage.getItem(storageKey)
    if (serialized) {
      const parsed: unknown = JSON.parse(serialized)
      if (isStoredCartState(parsed)) return parsed
    }
  } catch {
    // Initialize deterministic empty carts when storage is unavailable or invalid.
  }
  return { version: 1, carts: {} }
}

function writeState(state: StoredCartState) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    // The mock remains usable in this page even when persistence is unavailable.
  }
}

function isStoredCartState(value: unknown): value is StoredCartState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<StoredCartState>
  return candidate.version === 1 && typeof candidate.carts === 'object' && candidate.carts !== null
}

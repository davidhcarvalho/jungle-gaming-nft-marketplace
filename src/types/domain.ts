export type EthAmount = string

export interface User {
  id: string
  displayName: string
  email: string
}

export interface Session {
  user: User
  expiresAt: string
}

export interface CollectorProfile {
  userId: string
  displayName: string
  username: string
  email: string
  ensName: string
  walletNickname: string
  avatarDataUrl?: string
}

export interface NFTEdition {
  id: string
  label: string
  supply: number
  available: number
  maxPerOrder: number
  priceEth: EthAmount
}

export interface NFT {
  id: string
  name: string
  tokenId: string
  collectionId: string
  collectionName: string
  category: string
  network: string
  priceEth: EthAmount
  compareAtPriceEth?: EthAmount
  imageUrl: string
  description: string
  attributes: string[]
  editions: NFTEdition[]
  rating: number
  reviewCount: number
  popularity: number
  listedAt: string
  isFeatured: boolean
  isNew: boolean
  version: number
}

export interface Favorite {
  userId: string
  nftId: string
  createdAt: string
}

export interface CartItem {
  id: string
  nftId: string
  editionId: string
  quantity: number
  nftName: string
  tokenId: string
  editionLabel: string
  imageUrl: string
  network: string
  unitPriceEth: EthAmount
  lineTotalEth: EthAmount
  available: number
}

export interface Cart {
  id: string
  ownerId: string
  items: CartItem[]
  version: number
  couponCode?: string
}

export interface Coupon {
  code: string
}

export interface Quote {
  id: string
  cartVersion: number
  validUntil: string
  currency: 'ETH'
  subtotalEth: EthAmount
  discountEth: EthAmount
  networkFeeEth: EthAmount
  totalEth: EthAmount
  coupon?: Coupon
  version: number
  items?: QuoteLine[]
}

export interface QuoteLine { nftId: string; editionId: string; quantity: number; unitPriceEth: EthAmount; subtotalEth: EthAmount }

export interface Network {
  id: string
  name: string
  currency: 'ETH'
}

export interface Wallet {
  id: string
  address: string
  label: string
  networkId: string
  role: 'primary' | 'secondary'
  ensName?: string
}

export type OrderStatus = 'pending' | 'confirmed' | 'rejected'

export interface OrderItem {
  nftId: string
  name: string
  editionId: string
  quantity: number
  unitPriceEth: EthAmount
  subtotalEth: EthAmount
  imageUrl: string
  editionLabel: string
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  items: OrderItem[]
  quote: Quote
  version: number
  createdAt: string
  wallet: Wallet
  network: Network
  receipt?: Receipt
}

export interface Receipt {
  orderId: string
  transactionReference: string
  explorerUrl: string
  confirmedAt: string
  items: OrderItem[]
  quote: Quote
  wallet: Wallet
  network: Network
}

export interface VersionedSocketEvent<TResource, TPayload> {
  eventId: string
  resourceId: string
  version: number
  resource: TResource
  payload: TPayload
}

export type NftUpdateReason = 'price' | 'availability'

export type NftUpdatedEvent = VersionedSocketEvent<
  NFT,
  { reason: NftUpdateReason; changedEditionIds: string[] }
>

export type OrderUpdatedEvent = VersionedSocketEvent<
  Order,
  { previousStatus: OrderStatus; status: OrderStatus }
>

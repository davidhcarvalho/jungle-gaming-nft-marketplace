import type { Cart, CartItem, CollectorProfile, Favorite, Network, Order, Quote, Receipt, Session, Wallet } from '@/types/domain'
import type { MockScenario } from '@/mocks/scenarios/types'
import type { NFT } from '@/types/domain'

export interface ApiError {
  code: 'validation' | 'unauthorized' | 'forbidden' | 'not_found' | 'conflict' | 'availability' | 'coupon_invalid' | 'coupon_expired' | 'timeout' | 'network' | 'server'
  message: string
  fields?: Record<string, string>
}

export interface FoundationHealth {
  status: 'ready'
  source: 'msw'
  scenario: MockScenario
}

export interface AuthPayload {
  email: string
  password: string
}

export interface SignupPayload extends AuthPayload {
  displayName: string
  passwordConfirmation: string
}

export interface AuthResponse {
  session: Session
  sessionToken: string
  cartMerge?: CartMergeSummary
}

export type SessionResponse = Session | null

export interface FavoritesResponse {
  userId: string
  favorites: Favorite[]
}

export type ProfileResponse = CollectorProfile
export type UpdateProfilePayload = Pick<CollectorProfile, 'displayName' | 'username' | 'email' | 'ensName' | 'walletNickname'>
export interface UpdateAvatarPayload { avatarDataUrl: string }
export interface ChangePasswordPayload { currentPassword: string; newPassword: string }
export interface WalletsResponse { userId: string; wallets: Wallet[]; networks: Network[]; connectedWalletId?: string }
export interface WalletPayload { address: string; label: string; networkId: string; ensName?: string; role?: Wallet['role'] }

export type CartResponse = Cart

export interface AddCartItemPayload {
  nftId: string
  editionId: string
  quantity: number
}

export interface UpdateCartItemPayload {
  quantity: number
}

export interface CartMergeSummary {
  mergedItemCount: number
  limitedItems: Array<Pick<CartItem, 'nftId' | 'editionId' | 'quantity'>>
}

export type QuoteResponse = Quote

export interface ManualCheckoutWalletPayload { provider: 'MetaMask' | 'WalletConnect' | 'Coinbase Wallet'; address: string; networkId: string }
export type ConnectCheckoutWalletPayload = { walletId: string } | { manualWallet: ManualCheckoutWalletPayload }
export interface CheckoutWalletsResponse { wallets: Wallet[]; networks: Network[]; connectedWalletId?: string; connectedManualWallet?: Wallet }
export interface CheckoutRevalidationResponse { quote: Quote; changes: string[]; blocked?: string }
export interface CheckoutCollectorDetails { displayName: string; email: string; username?: string; profileName?: string; walletAddress?: string; secondaryWallet?: string; walletType?: string; referralCode?: string; ensName?: string; note?: string }
export interface CreateOrderPayload { quoteId: string; quote: Quote; items: Array<{ nftId: string; editionId: string; quantity: number }>; walletId: string; networkId: string; collector: CheckoutCollectorDetails }
export interface OrderResponse { order: Order; receipt?: Receipt }

export interface NFTListResponse {
  items: NFT[]
  featured: NFT
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  facets: {
    categories: Record<string, number>
    collections: Record<string, number>
    networks: Record<string, number>
  }
}

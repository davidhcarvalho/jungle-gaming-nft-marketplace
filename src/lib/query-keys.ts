export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  foundation: {
    health: ['foundation', 'health'] as const,
  },
  catalog: {
    all: ['catalog'] as const,
    list: (params: Readonly<Record<string, string | number | undefined>>) =>
      ['catalog', 'list', params] as const,
    featured: ['catalog', 'featured'] as const,
  },
  nft: {
    detail: (nftId: string) => ['nft', nftId] as const,
  },
  private: {
    favorites: (userId: string) => ['private', userId, 'favorites'] as const,
    cart: (ownerId: string) => ['private', ownerId, 'cart'] as const,
    quote: (ownerId: string, cartVersion: number, couponCode?: string) =>
      ['private', ownerId, 'quote', cartVersion, couponCode ?? null] as const,
    profile: (userId: string) => ['private', userId, 'profile'] as const,
    wallets: (userId: string) => ['private', userId, 'wallets'] as const,
    order: (userId: string, orderId: string) => ['private', userId, 'orders', orderId] as const,
  },
} as const

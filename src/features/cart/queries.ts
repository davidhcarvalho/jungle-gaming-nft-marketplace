import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useSession } from '@/features/auth/queries'
import { getGuestCartId } from '@/features/cart/guest-cart-id'
import {
  addCartItem,
  applyCartCoupon,
  getCart,
  getCartQuote,
  removeCartCoupon,
  removeCartItem,
  updateCartItem,
} from '@/features/cart/api'
import { queryKeys } from '@/lib/query-keys'
import type { AddCartItemPayload, CartResponse, UpdateCartItemPayload } from '@/types/api'
import type { Cart } from '@/types/domain'

export function useCart() {
  const session = useSession()
  const ownerId = session.data?.user.id ? `user:${session.data.user.id}` : `guest:${getGuestCartId()}`
  const query = useQuery({
    queryKey: queryKeys.private.cart(ownerId),
    queryFn: ({ signal }) => getCart(signal),
    enabled: session.isFetched,
    staleTime: 5_000,
    retry: false,
  })
  return { ...query, ownerId, identityReady: session.isFetched }
}

export function useCartQuote(cart: Cart | undefined, enabled: boolean) {
  return useQuery({
    queryKey: cart
      ? queryKeys.private.quote(cart.ownerId, cart.version, cart.couponCode)
      : ['private', 'cart', 'quote', 'pending'] as const,
    queryFn: ({ signal }) => getCartQuote(signal),
    enabled: Boolean(cart) && enabled,
    retry: false,
    staleTime: 0,
  })
}

export function useAddCartItem() {
  return useCartMutation<AddCartItemPayload>(addCartItem)
}

export function useUpdateCartItem() {
  return useCartMutation<{ itemId: string } & UpdateCartItemPayload>(({ itemId, quantity }) => updateCartItem(itemId, { quantity }))
}

export function useRemoveCartItem() {
  return useCartMutation<string>(removeCartItem)
}

export function useApplyCartCoupon() {
  return useCartMutation<string>(applyCartCoupon)
}

export function useRemoveCartCoupon() {
  return useCartMutation<void>(removeCartCoupon)
}

function useCartMutation<TPayload>(mutationFn: (payload: TPayload) => Promise<CartResponse>) {
  const session = useSession()
  const queryClient = useQueryClient()
  const ownerId = session.data?.user.id ? `user:${session.data.user.id}` : `guest:${getGuestCartId()}`
  const cartKey = queryKeys.private.cart(ownerId)

  return useMutation({
    mutationFn,
    onSuccess: async (cart) => {
      queryClient.setQueryData(cartKey, cart)
      await queryClient.invalidateQueries({ queryKey: ['private', ownerId, 'quote'] })
    },
  })
}

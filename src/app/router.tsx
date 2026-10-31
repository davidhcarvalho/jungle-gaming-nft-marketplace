import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'

import { RootLayout } from '@/components/layout/root-layout'
import { FoundationSmokePage } from '@/features/foundation/foundation-smoke-page'
import { NotFoundPage } from '@/routes/not-found-page'
import { HomePage } from '@/features/catalog/home-page'
import { NFTDetailPage } from '@/features/nft/nft-detail-page'
import { CartPage } from '@/features/cart/cart-page'
import { CheckoutPage } from '@/features/checkout/checkout-page'
import { OrderPage } from '@/features/orders/order-page'
import { validateCatalogSearch } from '@/features/catalog/model'
import { AuthPage } from '@/features/auth/auth-page'
import { sanitizeReturnTo, validateAuthSearch } from '@/features/auth/model'
import { clearPrivateQueries, sessionQueryOptions } from '@/features/auth/queries'
import { queryClient } from '@/app/query-client'
import { queryKeys } from '@/lib/query-keys'
import { ProfilePage } from '@/features/profile/profile-page'
import { WalletsPage } from '@/features/wallets/wallets-page'

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search) => validateCatalogSearch(search),
  component: HomePage,
})

const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nfts/$nftId',
  component: NFTDetailPage,
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
})

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  beforeLoad: requireSession,
  component: CheckoutPage,
})

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  beforeLoad: requireSession,
  component: OrderPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: validateAuthSearch,
  component: LoginRoute,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  validateSearch: validateAuthSearch,
  component: SignupRoute,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: requireSession,
  component: ProfilePage,
})

const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallets',
  beforeLoad: requireSession,
  component: WalletsPage,
})

const foundationSmokeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/__foundation/smoke',
  component: FoundationSmokePage,
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  nftRoute,
  cartRoute,
  checkoutRoute,
  orderRoute,
  loginRoute,
  signupRoute,
  profileRoute,
  walletsRoute,
  ...(import.meta.env.DEV ? [foundationSmokeRoute] : []),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

function LoginRoute() {
  const { returnTo } = loginRoute.useSearch()
  return <AuthPage mode="login" returnTo={returnTo} />
}

function SignupRoute() {
  const { returnTo } = signupRoute.useSearch()
  return <AuthPage mode="signup" returnTo={returnTo} />
}

async function requireSession({ location }: { location: { href: string } }) {
  const session = await queryClient.fetchQuery(sessionQueryOptions)
  if (!session) {
    await clearPrivateQueries(queryClient)
    queryClient.setQueryData(queryKeys.auth.session, null)
    throw redirect({ to: '/login', search: { returnTo: sanitizeReturnTo(location.href) }, replace: true })
  }
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

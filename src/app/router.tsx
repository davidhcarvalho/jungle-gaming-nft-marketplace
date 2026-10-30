import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

import { RootLayout } from '@/components/layout/root-layout'
import { FoundationSmokePage } from '@/features/foundation/foundation-smoke-page'
import { PlaceholderPage } from '@/routes/placeholder-page'
import { NotFoundPage } from '@/routes/not-found-page'

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <PlaceholderPage title="Início" />,
})

const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nfts/$nftId',
  component: () => <PlaceholderPage title="Detalhe do NFT" />,
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: () => <PlaceholderPage title="Carrinho" />,
})

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: () => <PlaceholderPage title="Pagamento" />,
})

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: () => <PlaceholderPage title="Confirmação de pedido" />,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <PlaceholderPage title="Entrar" />,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: () => <PlaceholderPage title="Criar perfil" />,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => <PlaceholderPage title="Perfil do colecionador" />,
})

const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallets',
  component: () => <PlaceholderPage title="Carteiras" />,
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

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

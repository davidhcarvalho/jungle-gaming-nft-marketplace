import { foundationHandlers } from '@/mocks/handlers/foundation'
import { catalogHandlers } from '@/mocks/handlers/catalog'
import { scenarioHandlers } from '@/mocks/handlers/scenarios'
import { authHandlers } from '@/mocks/handlers/auth'
import { cartHandlers } from '@/mocks/handlers/cart'
import { checkoutOrderHandlers } from '@/mocks/handlers/checkout-orders'
import { profileWalletHandlers } from '@/mocks/handlers/profile-wallets'

export const handlers = [...scenarioHandlers, ...authHandlers, ...cartHandlers, ...checkoutOrderHandlers, ...profileWalletHandlers, ...foundationHandlers, ...catalogHandlers]

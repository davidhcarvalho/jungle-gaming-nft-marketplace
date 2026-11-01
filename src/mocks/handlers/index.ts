import { foundationHandlers } from '@/mocks/handlers/foundation'
import { catalogHandlers } from '@/mocks/handlers/catalog'
import { scenarioHandlers } from '@/mocks/handlers/scenarios'
import { authHandlers } from '@/mocks/handlers/auth'
import { cartHandlers } from '@/mocks/handlers/cart'
import { checkoutOrderHandlers } from '@/mocks/handlers/checkout-orders'
import { profileWalletHandlers } from '@/mocks/handlers/profile-wallets'
import { socketHandlers } from '@/mocks/socket/server'
import { realtimeScenarioHandlers } from '@/mocks/handlers/realtime-scenarios'

export const handlers = [...scenarioHandlers, ...realtimeScenarioHandlers, ...socketHandlers, ...authHandlers, ...cartHandlers, ...checkoutOrderHandlers, ...profileWalletHandlers, ...foundationHandlers, ...catalogHandlers]

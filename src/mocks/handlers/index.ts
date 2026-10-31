import { foundationHandlers } from '@/mocks/handlers/foundation'
import { catalogHandlers } from '@/mocks/handlers/catalog'
import { scenarioHandlers } from '@/mocks/handlers/scenarios'
import { authHandlers } from '@/mocks/handlers/auth'
import { cartHandlers } from '@/mocks/handlers/cart'

export const handlers = [...scenarioHandlers, ...authHandlers, ...cartHandlers, ...foundationHandlers, ...catalogHandlers]

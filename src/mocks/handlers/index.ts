import { foundationHandlers } from '@/mocks/handlers/foundation'
import { catalogHandlers } from '@/mocks/handlers/catalog'
import { scenarioHandlers } from '@/mocks/handlers/scenarios'
import { authHandlers } from '@/mocks/handlers/auth'

export const handlers = [...scenarioHandlers, ...authHandlers, ...foundationHandlers, ...catalogHandlers]

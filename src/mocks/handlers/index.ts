import { foundationHandlers } from '@/mocks/handlers/foundation'
import { catalogHandlers } from '@/mocks/handlers/catalog'
import { scenarioHandlers } from '@/mocks/handlers/scenarios'

export const handlers = [...scenarioHandlers, ...foundationHandlers, ...catalogHandlers]

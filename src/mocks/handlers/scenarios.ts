import { http, HttpResponse } from 'msw'

import { createFoundationHealth } from '@/mocks/fixtures/foundation'
import { resetMockState } from '@/mocks/scenarios/state'
import { isMockScenario } from '@/mocks/scenarios/types'
import { resetAuthMockState } from '@/mocks/state/auth-store'
import { resetCartMockState } from '@/mocks/state/cart-store'

export const scenarioHandlers = [
  http.post('/api/test-scenarios/reset', async ({ request }) => {
    const body: unknown = await request.json().catch(() => undefined)
    const scenario = readScenario(body)
    const { scenario: activeScenario } = resetMockState(scenario)
    resetAuthMockState()
    resetCartMockState(activeScenario === 'cart-existing' || activeScenario === 'cart-existing-mutation-error')
    return HttpResponse.json(createFoundationHealth(activeScenario))
  }),
]

function readScenario(value: unknown) {
  if (typeof value !== 'object' || value === null || !('scenario' in value)) return undefined
  return isMockScenario(value.scenario) ? value.scenario : undefined
}

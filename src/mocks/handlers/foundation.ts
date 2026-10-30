import { delay, http, HttpResponse } from 'msw'

import { createFoundationHealth } from '@/mocks/fixtures/foundation'
import { getMockScenario, resetMockState } from '@/mocks/scenarios/state'
import { isMockScenario } from '@/mocks/scenarios/types'
import type { MockScenario } from '@/mocks/scenarios/types'

export const foundationHandlers = [
  http.get('/api/foundation/health', async () => {
    const scenario = getMockScenario()
    if (scenario === 'slow') await delay(600)
    if (scenario === 'api-error') {
      return HttpResponse.json(
        { code: 'server', message: 'Cenário de erro da foundation.' },
        { status: 503 },
      )
    }

    return HttpResponse.json(createFoundationHealth(scenario))
  }),
  http.post('/api/foundation/reset', async ({ request }) => {
    const body: unknown = await request.json().catch(() => undefined)
    const requestedScenario = readScenario(body)
    const state = resetMockState(requestedScenario)
    return HttpResponse.json(createFoundationHealth(state.scenario))
  }),
]

function readScenario(value: unknown): MockScenario | undefined {
  if (typeof value !== 'object' || value === null || !('scenario' in value)) return undefined
  return isMockScenario(value.scenario) ? value.scenario : undefined
}

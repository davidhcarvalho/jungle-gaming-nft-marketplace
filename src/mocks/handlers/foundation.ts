import { delay, http, HttpResponse } from 'msw'

import { createFoundationHealth } from '@/mocks/fixtures/foundation'
import { getMockScenario } from '@/mocks/scenarios/state'

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
]

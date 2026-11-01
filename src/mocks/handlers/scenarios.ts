import { http, HttpResponse } from 'msw'

import { createFoundationHealth } from '@/mocks/fixtures/foundation'
import { resetMockState } from '@/mocks/scenarios/state'
import { isMockScenario } from '@/mocks/scenarios/types'
import { resetAuthMockState } from '@/mocks/state/auth-store'
import { resetCartMockState } from '@/mocks/state/cart-store'
import { resetOrderMockState } from '@/mocks/state/orders-store'
import { resetCatalogPriceOverrides, setCatalogPriceOverride } from '@/mocks/state/catalog-price-overrides'
import { resetProfileMockState } from '@/mocks/state/profile-store'
import { disconnectMockSockets } from '@/mocks/socket/server'

export const scenarioHandlers = [
  http.post('/api/test-scenarios/reset', async ({ request }) => {
    const body: unknown = await request.json().catch(() => undefined)
    const scenario = readScenario(body)
    const { scenario: activeScenario } = resetMockState(scenario)
    disconnectMockSockets()
    resetAuthMockState()
    resetCartMockState(activeScenario === 'cart-existing' || activeScenario === 'cart-existing-mutation-error')
    resetOrderMockState()
    resetProfileMockState()
    resetCatalogPriceOverrides()
    return HttpResponse.json(createFoundationHealth(activeScenario))
  }),
  http.post('/api/test-scenarios/catalog-price', async ({ request }) => {
    const body: unknown = await request.json().catch(() => undefined)
    if (typeof body !== 'object' || body === null || !('nftId' in body) || !('priceEth' in body)
      || typeof body.nftId !== 'string' || typeof body.priceEth !== 'string'
      || !setCatalogPriceOverride(body.nftId, body.priceEth)) {
      return HttpResponse.json({ code: 'validation', message: 'NFT ou preço de cenário inválido.' }, { status: 422 })
    }
    return HttpResponse.json({ nftId: body.nftId, priceEth: body.priceEth })
  }),
]

function readScenario(value: unknown) {
  if (typeof value !== 'object' || value === null || !('scenario' in value)) return undefined
  return isMockScenario(value.scenario) ? value.scenario : undefined
}

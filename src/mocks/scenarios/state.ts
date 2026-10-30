import type { MockScenario } from '@/mocks/scenarios/types'

const configuredScenario = import.meta.env.VITE_MOCK_SCENARIO
const initialScenario: MockScenario = isConfiguredScenario(configuredScenario)
  ? configuredScenario
  : 'default'

let currentScenario = initialScenario

function isConfiguredScenario(value: string | undefined): value is MockScenario {
  return value === 'default' || value === 'slow' || value === 'api-error'
}

export function getMockScenario() {
  return currentScenario
}

export function resetMockState(scenario: MockScenario = initialScenario) {
  currentScenario = scenario
  return { scenario: currentScenario }
}

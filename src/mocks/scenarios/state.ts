import type { MockScenario } from '@/mocks/scenarios/types'

const configuredScenario = import.meta.env.VITE_MOCK_SCENARIO
const initialScenario: MockScenario = isConfiguredScenario(configuredScenario)
  ? configuredScenario
  : 'default'

const scenarioStorageKey = 'kurio:mock-scenario'
let currentScenario = readStoredScenario() ?? initialScenario

function isConfiguredScenario(value: string | undefined): value is MockScenario {
  return value !== undefined && ['default', 'slow', 'api-error', 'empty', 'catalog-error', 'detail-error', 'variable-latency'].includes(value)
}

export function getMockScenario() {
  return currentScenario
}

export function resetMockState(scenario: MockScenario = initialScenario) {
  currentScenario = scenario
  try {
    window.localStorage.setItem(scenarioStorageKey, scenario)
  } catch {
    // The in-memory scenario remains deterministic when storage is unavailable.
  }
  return { scenario: currentScenario }
}

function readStoredScenario(): MockScenario | undefined {
  try {
    const stored = window.localStorage.getItem(scenarioStorageKey)
    if (stored !== null && isConfiguredScenario(stored)) return stored
    return undefined
  } catch {
    return undefined
  }
}

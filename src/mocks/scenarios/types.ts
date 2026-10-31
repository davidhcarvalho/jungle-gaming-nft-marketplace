export const mockScenarioNames = [
  'default',
  'slow',
  'api-error',
  'empty',
  'catalog-error',
  'detail-error',
  'variable-latency',
  'signup-conflict',
  'session-expired',
  'favorite-error',
] as const

export type MockScenario = (typeof mockScenarioNames)[number]

export function isMockScenario(value: unknown): value is MockScenario {
  return typeof value === 'string' && mockScenarioNames.some((scenario) => scenario === value)
}

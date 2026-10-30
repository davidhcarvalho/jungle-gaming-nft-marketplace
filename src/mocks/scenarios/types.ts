export const mockScenarioNames = ['default', 'slow', 'api-error'] as const

export type MockScenario = (typeof mockScenarioNames)[number]

export function isMockScenario(value: unknown): value is MockScenario {
  return typeof value === 'string' && mockScenarioNames.some((scenario) => scenario === value)
}

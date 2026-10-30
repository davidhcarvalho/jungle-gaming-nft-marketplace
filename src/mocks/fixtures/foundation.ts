import type { FoundationHealth } from '@/types/api'

export function createFoundationHealth(scenario: FoundationHealth['scenario']): FoundationHealth {
  return {
    status: 'ready',
    source: 'msw',
    scenario,
  }
}

import type { MockScenario } from '@/mocks/scenarios/types'

export interface ApiError {
  code: 'validation' | 'unauthorized' | 'forbidden' | 'not_found' | 'conflict' | 'availability' | 'timeout' | 'network' | 'server'
  message: string
  fields?: Record<string, string>
}

export interface FoundationHealth {
  status: 'ready'
  source: 'msw'
  scenario: MockScenario
}

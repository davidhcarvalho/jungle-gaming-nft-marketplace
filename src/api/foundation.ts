import { apiClient } from '@/api/client'
import type { FoundationHealth } from '@/types/api'
import type { MockScenario } from '@/mocks/scenarios/types'

export async function getFoundationHealth(signal?: AbortSignal) {
  const response = await apiClient.get<FoundationHealth>('/foundation/health', { signal })
  return response.data
}

export async function resetFoundationScenario(scenario?: MockScenario) {
  const response = await apiClient.post<FoundationHealth>('/test-scenarios/reset', { scenario })
  return response.data
}

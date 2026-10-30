import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { getApiError } from '@/api/errors'
import { getFoundationHealth, resetFoundationScenario } from '@/api/foundation'
import { Button } from '@/components/ui/button'
import { queryKeys } from '@/lib/query-keys'
import { mockScenarioNames, type MockScenario } from '@/mocks/scenarios/types'

export function FoundationSmokePage() {
  const queryClient = useQueryClient()
  const [selectedScenario, setSelectedScenario] = useState<MockScenario>('api-error')
  const health = useQuery({
    queryKey: queryKeys.foundation.health,
    queryFn: ({ signal }) => getFoundationHealth(signal),
    enabled: import.meta.env.VITE_ENABLE_MOCKS === 'true',
  })
  const reset = useMutation({
    mutationFn: (scenario?: MockScenario) => resetFoundationScenario(scenario),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.foundation.health, data),
  })

  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') {
    return <SmokeMessage title="MSW está desativado" detail="Defina VITE_ENABLE_MOCKS=true para executar este harness." />
  }

  if (health.isPending) return <SmokeMessage title="Consultando a API" detail="A resposta está sendo carregada pelo TanStack Query." />
  if (health.isError) {
    const apiError = getApiError(health.error)
    return (
      <SmokeMessage
        title="A chamada de smoke falhou"
        detail={`${apiError.code}: ${apiError.message}`}
        action={<Button onClick={() => void health.refetch()}>Tentar novamente</Button>}
      />
    )
  }

  return (
    <section className="smoke-panel" aria-labelledby="smoke-title">
      <p className="eyebrow">Diagnóstico de desenvolvimento</p>
      <h1 id="smoke-title">Request da foundation</h1>
      <p className="smoke-copy">TanStack Query pediu os dados ao Axios; o worker MSW interceptou a chamada HTTP e devolveu a fixture.</p>
      <dl className="smoke-data">
        <div><dt>Estado</dt><dd>{health.data.status}</dd></div>
        <div><dt>Origem</dt><dd data-testid="mock-source">{health.data.source}</dd></div>
        <div><dt>Cenário</dt><dd data-testid="mock-scenario">{health.data.scenario}</dd></div>
      </dl>
      <div className="smoke-actions">
        <label className="scenario-control" htmlFor="scenario-choice">Cenário de diagnóstico
          <select id="scenario-choice" value={selectedScenario} onChange={(event) => setSelectedScenario(event.target.value as MockScenario)}>
            {mockScenarioNames.map((scenario) => <option key={scenario} value={scenario}>{scenario}</option>)}
          </select>
        </label>
        <Button onClick={() => reset.mutate(selectedScenario)} disabled={reset.isPending}>Aplicar cenário</Button>
        <Button onClick={() => reset.mutate(undefined)} disabled={reset.isPending}>
          {reset.isPending ? 'Restaurando…' : 'Resetar cenário'}
        </Button>
        <Button variant="outline" onClick={() => void health.refetch()}>Refazer GET</Button>
      </div>
      {reset.isError && <p role="alert">{getApiError(reset.error).message}</p>}
      <p className="smoke-note" role="status">{health.isFetching ? 'Atualizando resposta…' : 'Request concluída.'}</p>
    </section>
  )
}

function SmokeMessage({ title, detail, action }: { title: string; detail: string; action?: ReactNode }) {
  return (
    <section className="smoke-panel" aria-live="polite">
      <h1>{title}</h1>
      <p className="smoke-copy">{detail}</p>
      {action}
    </section>
  )
}

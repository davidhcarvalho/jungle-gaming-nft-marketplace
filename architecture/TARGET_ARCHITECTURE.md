# Arquitetura-Alvo

Este documento orienta a solução sem impor overengineering.

## Princípios

- organização por domínio/feature;
- dependências explícitas;
- camada de transporte separada da UI;
- MSW simula a rede, não o componente;
- regras críticas testáveis fora do JSX quando possível;
- Query gerencia estado remoto;
- Router gerencia navegação/search/guards;
- estado local só para UI transitória.

## Estrutura sugerida

```text
src/
  api/
    client.ts
    errors.ts
  app/
    providers/
    query-client.ts
    router.ts
  components/
    ui/
    layout/
    feedback/
  features/
    auth/
    catalog/
    nft/
    favorites/
    cart/
    checkout/
    orders/
    profile/
    wallets/
  mocks/
    browser.ts
    handlers/
    fixtures/
    scenarios/
    state/
    socket/
  routes/
  lib/
  types/
  styles/
```

Adapte ao código existente; não reestruture só por estética.

## Dependências

```text
React UI
  ↓
feature hooks / route loaders
  ↓
TanStack Query
  ↓
Axios client
  ↓
REST
  ↓
MSW handlers (dev/demo/test)
```

Tempo real:

```text
MSW-compatible Socket.IO simulation
  ↓
socket.io-client
  ↓
session-aware subscription layer
  ↓
query cache reconciliation/invalidation
  ↓
UI
```

## Regras

### UI
Não conhece fixtures diretamente.

### API
Contratos tipados e erro normalizado.

### Query
Query keys incluem identidade do recurso, params e usuário quando privado.

### Router
Search params do catálogo são schema/tipos, não parsing manual espalhado.

### Mock state
Uma fonte coerente para catálogo, carrinho, favoritos, perfil, carteiras e pedidos.

### Domain
Cálculo ETH não usa floating point JS.

## Explicabilidade

Cada camada precisa responder claramente:
- o que ela faz;
- por que existe;
- quem pode depender dela.

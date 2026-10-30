# Gates Eliminatórios

Estes itens vêm diretamente dos critérios do desafio e têm prioridade máxima.

## Gate E1 — Stack obrigatória real

Deve existir uso efetivo de:
- React
- TypeScript
- TanStack Router
- TanStack Query
- Axios
- REST APIs
- Socket.IO
- Tailwind CSS
- shadcn/ui
- MSW
- Playwright
- Lighthouse

**Falha:** biblioteca instalada mas não participando da solução.

## Gate E2 — Fluxos principais funcionais

Descoberta, compra e conta não podem ser apenas telas estáticas.

**Falha:** botão muda de página sem operação simulada real.

## Gate E3 — Compra depende da simulação

A confirmação deve ocorrer somente quando o pedido mockado estiver efetivamente confirmado.

**Falha:** UI assume sucesso no clique.

## Gate E4 — Isolamento por usuário

Dados privados de sessão anterior não podem permanecer acessíveis após logout/troca.

Validar:
- favoritos;
- perfil;
- carteiras;
- pedidos;
- dados privados em cache;
- subscriptions.

## Gate E5 — Tempo real passa por Socket.IO

Os cenários real-time devem exercitar `socket.io-client`.

**Proibido:** chamar setters/cache diretamente como origem do evento.

## Gate E6 — E2E executável

Playwright precisa executar em checkout limpo com mocks.

## Política

Se qualquer gate estiver falhando, o projeto não entra em fase de polimento. Corrigir primeiro.

# Arquitetura da solução — fundação

Este documento registra apenas a fundação do Lote 01. Catálogo, conta, compra e real-time funcional ainda não foram implementados.

## Runtime e build

- Node `24.22.1`, fixado por `.nvmrc` e restringido a Node 24 em `package.json > engines`.
- npm é o único package manager; `package-lock.json` está presente e instalações limpas usam `npm ci`. Nesta retomada, a versão declarada de ESLint foi atualizada para 10 após confirmar o fim do suporte ao ESLint 9, mas o registry indisponível impediu atualizar o lockfile. O lock ainda resolve 9.39.5, então a instalação reproduzível está bloqueada até reconciliar manifesto e lock sem ignorar peers.
- Vite serve o SPA e gera o build estático. O plugin React trata TSX e o plugin oficial Tailwind integra as utilities CSS.
- TypeScript está em modo `strict`; `@/*` aponta para `src/*` em Vite e nos projetos TypeScript.

## Organização

- `src/app`: composição do provider, `QueryClient` e Router.
- `src/api`: Axios central, conversão de erros e primeira chamada REST.
- `src/components`: shell global e Button source-based no padrão shadcn/ui.
- `src/features/foundation`: harness de rede apenas em desenvolvimento.
- `src/mocks`: worker, handlers, fixture e cenário resetável.
- `src/realtime`: factory inicial de `socket.io-client`, sem conexão ou eventos nesta etapa.
- `src/routes`: placeholders explícitos e tratamento de rota não encontrada.
- `src/types`: contratos iniciais de API e domínio, com ETH modelado como string decimal.

## Navegação e estado remoto

TanStack Router usa uma route tree code-based tipada com os caminhos previstos no plano. As rotas ainda não têm guards e não fingem fluxos concluídos. `/__foundation/smoke` entra na árvore somente durante desenvolvimento. Deep links dependem do fallback SPA do Vite.

TanStack Query usa uma instância central: uma tentativa de retry, `staleTime` de 30 segundos, `gcTime` de cinco minutos, sem refetch ao focar a janela e refetch ao reconectar. Mutations não repetem automaticamente. Essa política inicial poderá ser ajustada por domínio.

## REST e erros

Todo acesso REST parte de `src/api/client.ts`, configurado por `VITE_API_BASE_URL`, timeout, credenciais e `AbortSignal`. Axios não contém fixtures nem regras de mock. `src/api/errors.ts` normaliza timeout, rede e erros estruturados.

## MSW e bootstrap

`src/main.tsx` aguarda `startMocks()` antes de montar React. O worker só inicia quando `VITE_ENABLE_MOCKS=true`, em desenvolvimento e no build de demonstração. `public/mockServiceWorker.js` foi gerado pelo comando oficial `npm run mocks:worker` e está presente. O módulo do browser e handlers é carregado dinamicamente apenas quando os mocks são habilitados.

GET `/api/foundation/health` percorre Query → Axios → HTTP e recebe a fixture pelo MSW. POST `/api/foundation/reset` restaura o cenário inicial e o reset é determinístico. Esses endpoints demonstram a fronteira de rede e não são recursos do marketplace.

## shadcn/ui e visual

`components.json` configura aliases e CSS variables do shadcn. O Button usa Radix Slot, class-variance-authority e `cn`. Os tokens CSS são aproximações iniciais derivadas das referências KURIO; serão comparados e refinados nos lotes de interface. Nenhuma screenshot de referência aparece na UI.

## Tipos e limites conhecidos

`EthAmount` é um alias string; nenhum valor monetário ETH usa `number`. Os contratos contêm campos mínimos baseados no desafio e evoluirão junto das APIs mockadas. `socket.io-client` está instalado e a factory arquitetural está preparada; transporte, eventos e subscriptions ficam para os lotes de real-time.

# Backlog por Lotes

Este arquivo é uma visão rápida. Os critérios completos estão em `lots/`.

## 00 — Discovery
- [x] inventariar repo (pacote de governança, arquitetura, refs e ausência de app)
- [x] rodar baseline disponível (npm/pnpm confirmaram ausência de manifesto; sem scripts para build/typecheck/lint/testes)
- [x] mapear stack e versões do ambiente
- [x] mapear telas, rotas-alvo e riscos
- [x] atualizar progresso e handoff

## 01 — Foundation
> Foundation aprovada com quality gate consolidado em `PROGRESS.md`. Não iniciar o Lote 02 sem nova instrução.
- [x] Router
- [x] Query
- [x] Axios
- [x] MSW
- [x] Tailwind
- [x] shadcn
- [x] types
- [x] mock reset
- [x] shell visual
- [x] not-found

## 02 — Catálogo/Detalhe
> BLOCKED no gate runtime/visual. Última execução externa informada: 42 testes, 37 PASS, 3 FAIL e 2 SKIPPED, com as três falhas replicadas no mesmo teste de recuperação de erro. Inspeção confirmou que mudar `q` cria nova query key; `placeholderData` preserva dados somente durante a transição, e sem dados válidos para a nova key a UI corretamente mostra erro principal. Assertion corrigida e cobertura separada adicionada para falha real de refetch em background. Typecheck/lint/build/build-mocks PASS nesta retomada; Playwright bloqueado antes dos testes por `listen EPERM` no bind local. Não marcar o lote concluído. Consulte `PROGRESS.md` e Q6. Não iniciar o Lote 03.
- [ ] hero/home
- [ ] search
- [ ] filtros
- [ ] sort
- [ ] paginação
- [ ] URL state
- [ ] race handling
- [ ] detail
- [ ] 404 NFT
- [ ] editions/quantity
- [ ] skeleton
- [ ] E2E
- [ ] visual compare

## 03 — Auth/Favoritos
- [ ] signup
- [ ] login
- [ ] session refresh
- [ ] expiration
- [ ] logout/switch
- [ ] guards
- [ ] favorite optimistic
- [ ] rollback
- [ ] E2E

## 04 — Cart/Quote
- [ ] add/update/remove
- [ ] guest persist
- [ ] merge login
- [ ] coupon
- [ ] quote
- [ ] ETH precision
- [ ] skeleton
- [ ] E2E

## 05 — Checkout/Orders
- [ ] forms
- [ ] wallet/network
- [ ] review
- [ ] revalidate
- [ ] idempotency
- [ ] pending
- [ ] confirmed
- [ ] rejected
- [ ] timeout recovery
- [ ] receipt snapshot
- [ ] E2E

## 06 — Profile/Wallets
- [ ] profile
- [ ] avatar
- [ ] password
- [ ] wallets
- [ ] validation
- [ ] persistence
- [ ] derived mobile
- [ ] E2E

## 07 — Real-time/Failures
- [ ] socket.io-client
- [ ] mock transport
- [ ] nft.updated
- [ ] order.updated
- [ ] event version
- [ ] duplicate/stale
- [ ] cleanup
- [ ] reconnect REST
- [ ] failure scenarios
- [ ] E2E realtime

## 08 — Quality/Deploy
- [ ] full E2E
- [ ] visual regression
- [ ] keyboard/focus
- [ ] 390/768/1440
- [ ] Lighthouse 3×
- [ ] README
- [ ] ARCHITECTURE
- [ ] clean checkout
- [ ] deploy
- [ ] production deep link

## 09 — Study
- [ ] architecture walkthrough
- [ ] request flow
- [ ] session
- [ ] cart
- [ ] idempotency
- [ ] realtime
- [ ] tests
- [ ] trade-offs
- [ ] mock interview

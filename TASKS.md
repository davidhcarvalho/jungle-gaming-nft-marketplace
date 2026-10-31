# Backlog por Lotes

Este arquivo é uma visão rápida. Os critérios completos estão em `lots/`.

## 00 — Discovery
- [x] inventariar repo (pacote de governança, arquitetura, refs e ausência de app)
- [x] rodar baseline disponível (npm/pnpm confirmaram ausência de manifesto; sem scripts para build/typecheck/lint/testes)
- [x] mapear stack e versões do ambiente
- [x] mapear telas, rotas-alvo e riscos
- [x] atualizar progresso e handoff

## 01 — Foundation
> PASS — aprovada externamente; quality gate consolidado em `PROGRESS.md`.
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
> PASS — revisão externa final: 45 testes encontrados, 43 PASS, 2 SKIPPED deliberadamente (somente capturas tablet), 0 FAIL. Fluxos funcionais em 768 px passaram. Revisão visual aprovou Home e Detalhe mobile/desktop. Desvios conhecidos: fallback visual para NFTs sem asset próprio, fonte exata desconhecida e detalhe desktop levemente mais compacto. Lote 03 iniciado mediante instrução explícita; consulte `PROGRESS.md`.
- [x] hero/home
- [x] search
- [x] filtros
- [x] sort
- [x] paginação
- [x] URL state
- [x] race handling
- [x] detail
- [x] 404 NFT
- [x] editions/quantity
- [x] skeleton
- [x] E2E
- [x] visual compare

## 03 — Auth/Favoritos
> PASS — `spec:auth-favorites` PASS (25 PASS, 2 SKIPPED); `full` PASS (typecheck, lint, build, build com mocks e E2E: 68 PASS, 4 SKIPPED, 0 FAIL). Capturas Login/Cadastro revisadas contra desktop/mobile; regressão completa dos Lotes 01/02 passou. Lote 04 não iniciado.
- [x] signup
- [x] login
- [x] session refresh
- [x] expiration
- [x] logout/switch
- [x] guards
- [x] favorite optimistic
- [x] rollback
- [x] E2E
- [x] revisão visual desktop/mobile

## 04 — Cart/Quote
> PASS — `spec:cart` e `full` aprovados via Local Validation Runner; 106 PASS, 5 SKIPPED, 0 FAIL no E2E completo. Capturas mobile 390/414 e desktop 1440 comparadas com os frames do carrinho. Não iniciar Lote 05 sem instrução explícita.
- [x] add/update/remove
- [x] guest persist
- [x] merge login
- [x] coupon
- [x] quote
- [x] ETH precision
- [x] skeleton
- [x] E2E

## 05 — Checkout/Orders
> PASS — `spec:checkout-orders`: 46 PASS, 2 SKIPPED, 0 FAIL (Request ID `1793465465-257338-29`); `full`: 152 PASS, 7 SKIPPED, 0 FAIL, com typecheck/lint/build/build com mocks PASS (Request ID `1793466343-257338-32`). Revisão em `evidence/lot-05/visual-review.md`; Lote 06 foi iniciado após aprovação externa e está concluído abaixo.
- [x] forms
- [x] wallet/network
- [x] review
- [x] revalidate
- [x] idempotency
- [x] pending
- [x] confirmed
- [x] rejected
- [x] timeout recovery
- [x] receipt snapshot
- [x] E2E

## 06 — Profile/Wallets
> PASS — `spec:profile-wallets`: 70 PASS, 2 SKIPPED, 0 FAIL (Request ID `1793469615-257338-37`); `full`: 222 PASS, 9 SKIPPED, 0 FAIL, com typecheck/lint/build/build com mocks PASS (Request ID `1793469885-257338-38`). Revisão visual e desvios em `evidence/lot-06/visual-review.md`. Não iniciar Lote 07.
- [x] profile
- [x] avatar
- [x] password
- [x] wallets
- [x] validation
- [x] persistence
- [x] derived mobile
- [x] E2E

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

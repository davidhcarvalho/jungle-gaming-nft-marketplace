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
> PASS — `spec:profile-wallets`: 70 PASS, 2 SKIPPED, 0 FAIL (Request ID `1793469615-257338-37`); `full`: 222 PASS, 9 SKIPPED, 0 FAIL, com typecheck/lint/build/build com mocks PASS (Request ID `1793469885-257338-38`). Revisão visual e desvios em `evidence/lot-06/visual-review.md`.
- [x] profile
- [x] avatar
- [x] password
- [x] wallets
- [x] validation
- [x] persistence
- [x] derived mobile
- [x] E2E

## 07 — Real-time/Failures
- **PASS:** `spec:realtime-failures` 27 PASS (Request ID `1793478980-257338-45`); `spec:catalog` PASS após correção de interação (Request ID `1793480107-257338-47`); `full` typecheck/lint/build/build com mocks PASS e E2E 249 PASS, 9 SKIPPED, 0 FAIL (Request ID `1793480213-257338-48`). Regressões históricas de screenshots restauradas; revisão visual em `evidence/lot-07/visual-review.md`. Commit confirmado: `82d744e feat: implement realtime synchronization`.
- [x] socket.io-client
- [x] mock transport via MSW binding
- [x] nft.updated
- [x] order.updated
- [x] event version
- [x] duplicate/stale
- [x] cleanup e isolamento
- [x] reconnect REST
- [x] failure scenarios
- [x] E2E realtime

## 08 — Quality/Deploy
- **PASS:** Gates estáticos, full E2E (257 PASS, 25 SKIPPED, 0 FAIL), visual, clean checkout e Lighthouse conforme README aprovados. Commit final `7b82d92` publicado em `origin/main`; produção redeployada pelo runner (Request `1793520488-575891-14`) e smoke após redeploy PASS (Request `1793520674-575891-16`) na URL `https://kurio-nft-marketplace-zeta.vercel.app`. O Lote 09 foi concluído como documentação.
- [x] full E2E após split realtime (257 PASS, 25 SKIPPED, 0 FAIL; Request `1793508169-485327-25`)
- [x] visual regression final (8/8 comparações desktop/mobile elegíveis PASS; 16 skips de viewports sem baseline; confirmado no full)
- [x] keyboard/focus (coberto pelo full)
- [x] 390/768/1440 (E2E completo)
- [x] Lighthouse 12/12 medições executadas, medianas e LCP/CLS/TBT relatados; resultados sub-target justificados conforme README (Performance 69/49/76/52; A11y 100/96, BP/SEO 100; Request `1793511419-550281-4`). Performance abaixo de 90 não bloqueia isoladamente.
- [x] README final (setup/fluxos/cenários e URL pública registrados)
- [x] ARCHITECTURE (estado atual e otimização inicial documentados)
- [x] clean checkout target (`npm ci` + typecheck/lint/build/demo + Playwright + preview); Request `1793511614-550281-6`, 257 PASS/25 SKIPPED/0 FAIL
- [x] deploy Vercel autorizado e smoke público (mobile/desktop; rotas, deep links, refresh, MSW REST, Socket.IO e console)
- [x] production deep links, refresh e assets essenciais

## 09 — Study
- **PASS (conteúdo):** material baseado no código, ADRs, testes e evidências reais em `study/`; deploy do Lote 08 sincronizado com `7b82d92` antes do início. Commit local confirmado: `3936ae7 docs: add interview preparation materials`; `main` acompanha `origin/main`.
- [x] architecture walkthrough
- [x] request flow
- [x] session
- [x] cart
- [x] idempotency
- [x] realtime
- [x] tests
- [x] trade-offs
- [x] mock interview / autoensaio


## Final polish — fechamento preparado
- [x] retorno mobile seguro em Perfil/Carteiras
- [x] auditoria de navegação, hashes e footer/social com feedback acessível
- [x] carteira manual temporária do checkout, sincronizada com seleção salva e não persistida
- [x] limpeza de ZIPs e batches Lighthouse superseded; evidências históricas restauradas
- [x] `spec:checkout-orders`, `spec:profile-wallets`, `spec:catalog`, `spec:final-polish` e `full` passaram; `full`: 267 PASS, 33 SKIPPED, 0 FAIL; gates estáticos PASS
- [x] Lighthouse final 12/12; relatório/medianas e limites atualizados em `evidence/lighthouse/analysis.md`
- Estado Git inicial confirmado no início desta rodada: `3936ae7` em `main`, acompanhando `origin/main`; nenhuma alteração staged, commit/push/deploy final não realizados.

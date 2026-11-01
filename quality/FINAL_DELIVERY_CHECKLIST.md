# Checklist Final de Entrega

## Repositório
- [x] código-fonte
- [x] lockfile
- [x] assets
- [x] mocks
- [x] fixtures
- [x] testes
- [x] config Lighthouse (`scripts/lighthouse-audit.mjs`)
- [x] README final (setup, cenários e URL pública verificada)
- [x] ARCHITECTURE.md

## Comandos
- [x] install checkout limpo (`npm ci` em `/tmp/kurio-final-clean.HODtkJ`)
- [x] dev mocks (Playwright full com Vite e MSW)
- [x] build
- [x] preview de produção (12 Lighthouse runs no Vite preview)
- [x] typecheck
- [x] lint
- [x] Playwright (full Request `1793513483-550281-8`: 282 total, 257 PASS, 25 SKIPPED, 0 unexpected; Playwright HTML report and last-run JSON confirm)
- [x] Playwright em clean checkout (Request `1793511614-550281-6`: npm ci, static gates, demo, 257 PASS/25 SKIPPED, preview rotas/assets)
- [x] Lighthouse 12 execuções (3× Home/Detalhe em mobile/desktop; medianas, LCP/CLS/TBT e justificativas em `evidence/lighthouse/analysis.md`)

## Funcional
- [x] catálogo
- [x] detalhe
- [x] auth
- [x] favoritos
- [x] carrinho
- [x] cupom
- [x] checkout
- [x] idempotência
- [x] pedido
- [x] recibo
- [x] perfil
- [x] carteiras
- [x] real-time

## Sessão
- [x] refresh
- [x] expiração
- [x] logout
- [x] troca usuário
- [x] sem vazamento cache/subscription

## Socket
- [x] `nft.updated`
- [x] `order.updated`
- [x] duplicate ignored
- [x] old ignored
- [x] reconnect REST reconcile
- [x] listeners disposed

## Visual
- [x] 390
- [x] 414 comparação mobile
- [x] 768
- [x] 1440
- [x] no horizontal overflow
- [x] visual baselines atuais (8/8 comparações de baseline elegíveis passam no full `1793508169-485327-25`; 16 skips para viewports sem baseline)

## A11y
- [x] teclado
- [x] foco
- [x] dialogs/drawers
- [x] forms
- [x] feedback
- [x] reduced motion (media query em `src/styles/globals.css`)

## Performance
- [x] 3 medições por página/perfil
- [x] medianas
- [x] LCP/CLS/TBT
- [x] Lighthouse medido conforme README; Accessibility, Best Practices e SEO atingem as metas. Performance abaixo de 90 está justificada com LCP breakdown, TBT, long tasks, unused JS, image/font findings; não bloqueia isoladamente (Request `1793511419-550281-4`)

## Deploy
- [x] URL pública — https://kurio-nft-marketplace-zeta.vercel.app
- [ ] mesma versão do repo commitado (redeploy/smoke após commit final)
- [x] mocks funcionando (public smoke)
- [x] socket mock funcionando (client conectado no public smoke)
- [x] deep links
- [x] refresh de rota

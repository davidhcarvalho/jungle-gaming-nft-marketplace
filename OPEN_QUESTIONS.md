# Questões Abertas e Lacunas

Este arquivo contém apenas lacunas reais. Não usar como desculpa para interromper trabalho que pode ser derivado com segurança.

## Estado dos Lotes 04–07

Os Lotes 04–07 foram validados e aprovados. No Lote 07, `spec:realtime-failures` e `full` passaram; o full terminou com 249 PASS, 9 SKIPPED e 0 FAIL, além de typecheck/lint/build/build com mocks PASS. Não há bloqueios funcionais ou ambientais em aberto para os Lotes 04–07. As lacunas gerais Q1–Q5 abaixo continuam válidas.

## Q1 — Fonte exata

As screenshots sugerem tipografia monoespaçada/retro, mas o nome da fonte não foi extraído.

**Ação preferida:** consultar Figma ou exportar informação tipográfica.  
**Plano temporário:** escolher a alternativa local/web mais próxima somente se necessário e documentar a substituição.

## Q2 — Assets originais dos NFTs

Os assets principais `emerald-ape.png`, `golden-beat.png`, `neon-vessel.png` e `sage-nomad.png` foram exportados do Figma e agora são usados para as identidades correspondentes. Fixtures adicionais sem arte própria reutilizam esses arquivos como fallback visual provisório: Sage Nomad em Cosmic Bloom/Violet Nomad/Sage Afterglow/Generative Mist; Emerald Ape em Sunset Ape/Rare Keeper; Golden Beat em Fast Current/Golden Signal/Golden Hour/Golden Dawn; Neon Vessel em Ivory Baron/Quiet Orbit/Ivory Echo/Silent Voyager.

**Ação preferida:** exportar assets específicos das fixtures adicionais caso fidelidade visual dessas obras também seja exigida.  
**Não fazer:** usar screenshots inteiras ou recortes delas como assets da aplicação.

## Q3 — Ícones específicos

Search, carrinho, usuário, carteira etc. podem vir de biblioteca ou assets do Figma.

**Ação:** usar asset real quando existir; caso contrário, usar ícone equivalente coerente e documentar se houver desvio perceptível.

## Q4 — Breakpoint exato do design

Existem referências em 1440 e ~414 CSS px, mas não um frame tablet.

**Ação:** implementar comportamento fluido e validar obrigatoriamente 390, 768 e 1440 conforme README.

## Q5 — Valores exatos de tokens

Cores aproximadas podem ser extraídas das screenshots, mas não são garantia dos tokens do Figma.

**Ação:** tratar screenshot como fonte visual e ajustar por comparação.

## Q6 — Reexecução externa do Lote 03 — RESOLVIDA

O Local Validation Runner executou `spec:auth-favorites` e `full` no host. O spec passou (25 PASS, 2 SKIPPED); o target full passou em typecheck/lint/build/build com mocks e na suíte E2E (68 PASS, 4 SKIPPED, 0 FAIL de 72). Capturas Login/Cadastro foram geradas e comparadas com as referências, com uma rodada de correção responsiva. Request IDs e detalhes estão em `PROGRESS.md`; revisão visual em `evidence/lot-03/visual-review.md`.

Não há bloqueio de browser pendente. Lotes 04–07 estão aprovados; a instalação da binding resolveu o Q7.

## Q7 — Instalação da binding Socket.IO/MSW — RESOLVIDA

O host instalou `@mswjs/socket.io-binding@0.2.0`. A inspeção direta de package.json/README/source/typings confirmou o export `toSocketIo(WebSocketHandlerConnection)` e compatibilidade de peer com MSW `^2.10.2`; versão consta no manifesto e lock. O uso nesta versão não é `SocketIo` nem `ws.link(..., { protocol })`.

**Evidência da resolução:** `node_modules/@mswjs/socket.io-binding/{package.json,README.md,src/index.ts,build/index.d.ts,build/index.js}`; versão 0.2.0. Limitações: wrapper com namespace padrão, sem rooms/broadcasting/ack complexo e anexos binários. Integração comprovada pelo spec realtime e pelo E2E completo do Lote 07.

## Q8 — Runner host após extensão da whitelist

**RESOLVIDO.** O runner reiniciado executou `vercel-check`, `vercel-prod` e `public-smoke`. O CLI Vercel é chamado pelo PATH autenticado do host; Node/npm de build/teste seguem fixados pelo mise.

## Q9 — Deploy público obrigatório — RESOLVIDO

Projeto Vercel `kurio-nft-marketplace` publicado no team `dusk15`; URL `https://kurio-nft-marketplace-zeta.vercel.app`. `public-smoke` passou em produção: rotas e refresh, MSW REST, Socket.IO, isolamento/redirect de rotas protegidas e ausência de erros inesperados. O Vercel não vinculou automaticamente GitHub por falta de Login Connection, mas deploy direto pelo CLI autorizado funcionou. Após criar o commit L08, publicar novamente e repetir smoke para associar o runtime ao código final commitado.

## Q10 — Performance Lighthouse

Resolvido por interpretação conforme README: Request `1793511419-550281-4` completou três medições por página/perfil e registrou medianas, LCP/CLS/TBT e causas em `evidence/lighthouse/analysis.md`. Accessibility, Best Practices e SEO atingiram as metas. Performance mediana foi 69/49 (Home mobile/desktop) e 76/52 (detalhe mobile/desktop); abaixo da meta, mas não bloqueia isoladamente. Diagnóstico aponta JS/bootstrap + MSW sob throttling, render delay desktop e descoberta da arte Home mobile depois da API; não há falha de medição/configuração nem simplificação artificial.

## Q11 — Commit/push do Lote 08 no host — RESOLVIDO

O commit `7b82d92` foi criado/publicado em `origin/main`; o alias Vercel foi redeployado a partir do checkout limpo e o smoke público pós-commit passou (Requests `1793520488-575891-14` e `1793520674-575891-16`).

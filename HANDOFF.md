# Handoff entre Sessões/Agentes

## Fechamento — Lote 05 (2026-10-31)

- Lote atual concluído: `LOT_05_CHECKOUT_ORDERS` (**PASS**). `spec:checkout-orders`: 46 PASS, 2 SKIPPED, 0 FAIL (Request ID `1793465465-257338-29`); `spec:foundation`: 6 PASS (Request ID `1793466312-257338-31`); `full`: typecheck/lint/build/build com mocks PASS e E2E 152 PASS, 7 SKIPPED, 0 FAIL (Request ID `1793466343-257338-32`).
- Runtime do Local Validation Runner: Node 24.22.1 / npm 11.19.1. Build com mocks mantém warning não bloqueante de chunk principal ~503.81 kB.
- Implementado checkout/orders REST via Query/Axios/MSW: guard auth reaproveitado, wallets simuladas, validação, quote revalidada, mudanças exigem confirmação nova, idempotência por tentativa com replay/conflict e timeout-after-create, estados pending/confirmed/rejected, refresh REST, isolamento por userId, snapshot receipt e cart cleanup após confirmed. Não há conexão ou eventos Socket.IO.
- Testes e quatro capturas finais do Lote 05 estão em `tests/checkout-orders.spec.ts` e `evidence/lot-05/`. O recibo é testado após alteração de preço via MSW; a evidência aguarda estado `confirmed`. Revisão contra Pagamento desktop/mobile e Confirmação desktop em `evidence/lot-05/visual-review.md`.
- Correções recentes: teste mobile valida item na rota Carrinho (linhas ficam ocultas no checkout mobile por referência); owner test aguarda token `mock.user-leo.*` e redirect antes de trocar para deep link; testes confirmam terminalidade REST para confirmed/rejected; recibo mobile mantém todos os valores; layout desktop/mobile corrigido.
- Evidências históricas regravadas pelo E2E em `evidence/lot-02/` e `evidence/lot-03/` foram restauradas do HEAD; `evidence/lot-01/` permaneceu intacta. Não houve commit, remote ou push.
- Lotes 01–05 aprovados; Lote 06 e Lote 07 não iniciados. Não avançar sem instrução explícita.

## Atualização mais recente — 2026-10-31

- **LOT 04 STATUS: PASS.** `spec:cart` no Local Validation Runner: 38 PASS, 1 SKIPPED, 0 FAIL (Request ID `1793457838-257338-8`). `full`: typecheck, lint, build, build com mocks PASS; E2E 106 PASS, 5 SKIPPED, 0 FAIL de 111 casos (Request ID `1793457992-257338-9`). Runtime Node 24.22.1/npm 11.19.1.
- Evidências do carrinho: `evidence/lot-04/cart-mobile-390-review.png`, `cart-mobile-414-review.png`, `cart-desktop-1440-review.png`; comparação e diferenças conhecidas em `evidence/lot-04/visual-review.md`. Capturas históricas dos Lotes 02/03 foram preservadas após a regressão completa.
- Arquitetura: REST/MSW para carrinho/cupom/quote; query/cache por owner; guest cart persistente e merge no login/signup; valores ETH em strings e cálculo interno de wei com `bigint`. ADR-007 documenta precisão e merge.
- Lotes 05 e 07 permanecem não iniciados. Não implementar checkout/pedidos nem Socket.IO funcional sem instrução explícita.

## Atualização mais recente — 2026-10-31

- **LOT 03 STATUS: PASS.** Runner host validou `spec:auth-favorites` (25 PASS, 2 SKIPPED; Request ID `1793454652-239275-7`) e `full` (typecheck/lint/build/build com mocks PASS; E2E 68 PASS, 4 SKIPPED, 0 FAIL; Request ID `1793454821-239275-8`). Os testes de Lotes 01 e 02 passaram na regressão completa. Naquele handoff, Lote 04 ainda não havia iniciado.
- Causa real corrigida: `AuthPage` chamava `router.history.push` sem `router` no escopo; o `ReferenceError` era capturado sem mensagem e bloqueava redirect de login/signup. `useRouter` foi restaurado.
- Capturas e comparação final de Login/Cadastro desktop/mobile estão em `evidence/lot-03/`; resumo e desvios estão em `evidence/lot-03/visual-review.md`.

- Workflow de validação externa local adicionado: `scripts/ai-local-runner.sh` e `AI_LOCAL_VALIDATION.md`. O script foi validado sintaticamente e não foi iniciado no sandbox. Depois do usuário iniciá-lo uma vez no host, agentes devem consultar o lock, mandar target whitelist em `.ai/runner/request` e aguardar `Request ID` novo em `latest.md` antes de ler status/log.

- Lote 02 aprovado externamente: 45 testes encontrados, 43 PASS, 2 SKIPPED (somente capturas tablet deliberadamente não executadas), 0 FAIL; os fluxos funcionais em tablet passaram. Revisão visual aprovou Home/Detalhe mobile e desktop.
- Desvios de Lote 02 aceitos: NFTs adicionais sem asset original próprio usam fallback entre os quatro PNGs, fonte exata do Figma não identificada e Detalhe Desktop um pouco mais compacto verticalmente.
- Estado atualizado após reexecução: `LOT_03_AUTH_FAVORITES`, **PASS**; não iniciar Lote 04 sem instrução explícita.
- Referências revisadas: `design-reference/Desktop/Login.png`, `Cadastro.png`, e as respectivas telas Mobile. Desktop representa painel modal sobre Home; mobile apresenta composição de tela inteira, com logo KURIO, campos e CTA predominantes.
- Situação encontrada antes de implementar: login e signup são placeholders de rota; existem `User`, `Session`, `Favorite`, query key privada por userId e Axios central. Não há handlers/fixtures de auth/favorites nem testes dos fluxos.
- Plano e riscos iniciais, comandos e critérios estão registrados no início da seção Lote 03 em `PROGRESS.md`. Não mexer em comportamento aprovado de catálogo/detalhe salvo evidência de regressão concreta.

## Estado atual

- Lote 02: **PASS**, aprovação externa registrada acima; resultados atuais prevalecem sobre os relatos históricos deste handoff.
- Lote atual/concluído: `LOT_04_CART_QUOTE` (**PASS**; validar Request IDs e capturas na atualização mais recente acima). Lote 05 não iniciado.
- Node `24.22.1` e npm `11.19.1` via mise. O cache Chromium está em `.cache/ms-playwright`.
- O checkout está na branch `main`; não criar commit/remote nem fazer push.

## Correções desta retomada

- O frame Mobile/Início diz exatamente “SEJA DONO DA CULTURA DIGITAL”. Mantive esse copy correto e troquei a assertion acoplada ao copy desktop por identificação semântica: heading de nível 1 dentro de main.
- O reset usa um único handler `scenarioHandlers`, `POST /api/test-scenarios/reset`, import explícito por `handlers/index`. O smoke foundation usa a mesma rota. A causa identificada para o 404 é a ausência de sincronismo entre o helper (fetch imediatamente após navegação) e o bootstrap assíncrono do Service Worker; o helper agora aguarda o marcador de readiness publicado após `worker.start({ waitUntilReady: true })`. Confirmação runtime pós-correção ainda depende da execução local.
- O teste do skeleton espera 12 placeholders (página default agora tem 12 itens para corresponder à grade de quatro por três no Figma Desktop), verifica geometria/aspect ratio e overflow durante loading, confirma que cards reais ainda não existem, então espera o skeleton sumir e os 12 cards carregarem.
- Ao atingir a quantidade máxima, o resumo sticky mobile exibe um `role=status` acessível. O teste localiza quantity group e status dentro da região mobile.
- O screenshot do foundation smoke usa `testInfo.outputPath()`; não sobrescreve `evidence/lot-01/*`. Testes de captura do Lote 02 continuam em `evidence/lot-02/`.

## Verificações

- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS, 236 módulos.
- `VITE_ENABLE_MOCKS=true npm run build` — PASS, 474 módulos; string do endpoint de reset presente no chunk MSW.
- `npx playwright test --list` — PASS, 42 casos.
- Playwright focado e suíte completa foram tentados; ambos bloquearam antes dos testes. Vite recebe `listen EPERM` em `127.0.0.1:4180`; execução manual confirmou o mesmo erro. Não há evidência runtime pós-correção.

## Próximo passo

Em ambiente com bind local permitido, executar `PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" mise exec node@24.22.1 -- npm run test:e2e`, revisar os fluxos auth/favorites e capturas `evidence/lot-03/`, então atualizar o gate. Repetir typecheck/lint/build se houver correções. Não iniciar Lote 04.

## Lote 03 — execução desta sessão (2026-10-31)

- Implementados handlers REST/MSW para signup, login, sessão, logout e favoritos; estado demo por usuário; token fictício via Axios Bearer; proteção das rotas previstas; preservação/sanitização de `returnTo`; limpeza de queries privadas em logout/troca; favoritos otimistas com rollback. Login/signup receberam composições desktop em dialog e mobile em tela inteira.
- Testes em `tests/auth-favorites.spec.ts` cobrem formulários, conflitos, persistência sem senha em texto claro, sessão e refresh, intenção protegida, isolamento de favoritos entre duas contas, logout, rollback, expiração e ciclo de foco. `playwright test --list` encontrou 72 execuções distribuídas nos projetos existentes.
- Node 24.22.1: typecheck PASS; lint PASS; build PASS (244 módulos); build com mocks PASS (485 módulos). Vite manual e Playwright focado foram tentados; Vite falha antes de servir por `listen EPERM: operation not permitted 127.0.0.1:4180`, então nenhum caso browser executou. Nenhum screenshot auth/rollback foi produzido nesta sessão.
- Governança: estado de Lote 02 corrigido para PASS externo; Lote 03 registrado como BLOCKED, com gate faltante e próximo passo descritos em `PROGRESS.md`, `TASKS.md` e `OPEN_QUESTIONS.md`.
- Ao inspecionar o focus trap, descobri que o seletor incluía links mobile com `display:none`; o modal agora filtra itens sem caixa renderizada e há caso Playwright para ciclo de foco/Escape. O teste de expiração também foi corrigido para selecionar o cenário antes do login, preservando um token a ser rejeitado pelo endpoint de sessão.
- Revalidação final com Node 24.22.1: typecheck, lint, build e build com mocks PASS. Playwright completo foi tentado e não iniciou o servidor; `listen EPERM` na porta `127.0.0.1:4180`. Nenhum E2E ou screenshot foi executado. A entrada de expiração foi corrigida para escolher cenário antes do login, de modo que o token emitido enfrente o 401 de sessão expirada; continua sem confirmação em browser.
- Runner local criado nesta retomada. Próximo passo: após runner ativo no host, solicitar `spec:auth-favorites` e depois `full`; verificar IDs novos, revisar traces/screenshots, corrigir e repetir. Não avançar ao Lote 04.

## Retomada mais recente

- Diagnóstico do 404: o smoke da foundation solicita o reset depois da montagem React; `setMockScenario()` usava `page.evaluate(fetch)` sem esperar readiness MSW. A falta de sincronização deixava o POST do cenário exposto a uma janela antes do browser worker assumir o controle. O handler/URL estavam no bundle e o smoke usava o endpoint canônico; não foi criado backend paralelo.
- `startMocks()` aguarda `worker.start({ waitUntilReady: true })` e retorna se mocks estão ativos. O bootstrap publica `html[data-msw-ready="true"]` após a inicialização; o helper navega se a página estiver em branco, espera esse marcador, faz o reset via fetch da página e valida resposta/status. Foundation smoke testa o mesmo sinal.
- Avisos desktop e mobile possuem `role=status` e `aria-label="Limite de compra"`; teste procura esse nome, com escopo `Resumo da compra` em mobile, sem selecionar por índice.
- Comparação feita contra referências mobile Home/Detalhe e desktop Home/Detalhe. Mantido o copy mobile correto. Ajustes realizados em contador mobile, altura do hero, ícone/altura da nav inferior, proporção da arte e início do painel mobile, CTA de aparência ativa com encaminhamento para login futuro, cards do catálogo (12 por página para corresponder à grade 4×3 desktop), dimensão do footer e texto default de Emerald Ape #042.
- Fontes permanecem substitutos provisórios ADR-004 sob paths estáveis em `public/assets/nfts/`; screenshots não são usados como UI ou asset.
- Gates com Node 24.22.1: typecheck/lint/build/build com mocks PASS. Teste dirigido bloqueou antes dos casos porque Vite não consegue bind: `listen EPERM 127.0.0.1:4180`. Capturas antigas continuam, mas não há screenshot pós-ajuste; fidelidade visual final e E2E continuam bloqueados.
- Próximo passo: reexecutar casos dirigidos, suíte inteira incluindo foundation, validar cenários/reset/viewports/console/rede e gerar/comparar novas capturas em `evidence/lot-02/`. Atualizar Q6 após confirmação externa. Não iniciar Lote 03.

## Assets principais e investigação do POST de cenário

- PNGs conferidos individualmente, 500×500 RGBA: `emerald-ape.png` para Emerald Ape; `golden-beat.png` para Golden Beat; `neon-vessel.png` para Neon Vessel; `sage-nomad.png` para Sage Nomad. Todas as URLs de `.webp` saíram de código/tests/public. O diretório só tinha os quatro PNGs, então não havia WebP físico para apagar.
- Fallbacks das fixtures extras ainda não têm seus próprios assets: Sage para Cosmic/Violet/Sage Afterglow/Generative Mist; Emerald para Sunset/Rare Keeper; Golden para Fast Current/Golden Signal/Golden Hour/Golden Dawn; Neon para Ivory Baron/Quiet Orbit/Ivory Echo/Silent Voyager. ADR-004/Q2 documentam a limitação.
- Comparação do reset: ambos os caminhos fazem POST JSON a `${location.origin}/api/test-scenarios/reset`; Axios deriva esse path de base `/api` + `/test-scenarios/reset`, helper usa fetch à rota completa. O handler não distingue headers e os nomes de cenário são válidos; array/import do handler e scope root do worker conferem. Não há diferença de path/import encontrada que explique o 404, então não foi aplicada correção especulativa. O helper agora inclui URL absoluta/controller/registrations em erro; smoke registra URL/método/body/status para a comparação runtime.
- Locator de quantity usa accessible name “Limite de compra” exatamente; mobile escopa em “Resumo da compra”, tablet/desktop usa role+name sem `filter({ visible: true })` ou índices.
- Ajuste da arte preserva PNG quadrado: dimensões naturais 500×500, `object-fit: cover`/`object-position: center`; containers controlam crop. Não houve captura de aplicação posterior.
- Próximo bloqueio: rodar o reset pelos dois caminhos no browser e comparar request/response/controller. O sandbox bloqueia bind local (`listen EPERM` na porta 4180), então não declarar reset corrigido nem visual aprovado. Não iniciar Lote 03.
- Gates desta retomada com Node 24.22.1: typecheck, lint, build e build com mocks passaram; teste focado bloqueou antes de executar casos e Vite manual confirmou `listen EPERM` em `127.0.0.1:4180`.

## Investigação do estado de erro do catálogo — retomada 2026-10-31

- A entrada externa desta retomada reportou 42 testes: 37 PASS, 3 FAIL, 2 SKIPPED. As três falhas eram o mesmo caso em mobile/tablet/desktop.
- `q` pertence aos parâmetros de `queryKeys.catalog.list`; `retry-this-request` portanto cria nova query key. `useNFTCatalog` usa `placeholderData: previousData`, que mantém os resultados anteriores durante o carregamento da nova key. Se a nova key falha antes de ter dados próprios, o estado terminal fica `isError && !data`; Home mostra o alerta primário “Não foi possível carregar o mercado.” e não mantém os cards da key anterior. A screenshot/error-context confirmou esse estado nos viewports. A assertion anterior sobre “Os resultados anteriores continuam visíveis” era semanticamente incorreta para essa falha de nova busca.
- Teste corrigido para validar erro primário, limpar o cenário para `default`, clicar “Tentar novamente” e verificar o empty state esperado para `retry-this-request`. Foi adicionado caso separado para falha de refetch da mesma key após reconexão, cenário real sustentado por `refetchOnReconnect`; ele verifica manutenção dos 12 resultados, feedback de atualização e retry com recuperação.
- Node 24.22.1: typecheck PASS; lint PASS; build PASS (236 módulos); build com `VITE_ENABLE_MOCKS=true` PASS (474 módulos). Teste Playwright focado foi tentado, mas webServer não iniciou; reprodução manual de Vite em porta alternativa confirmou `listen EPERM: operation not permitted 127.0.0.1:4199`. Nenhum teste browser executou após a correção; a suíte e o teste novo de background precisam reexecução externa. Lote 02 permanece BLOCKED; não iniciar Lote 03.

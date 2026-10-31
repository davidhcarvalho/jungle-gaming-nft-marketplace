# Handoff entre Sessões/Agentes

## Estado atual

- Lote atual: Lote 02 — Catálogo e Detalhe (**BLOCKED**). Não iniciar Lote 03.
- Execução local externa informada nesta retomada: 42 testes, 34 PASS, 6 FAIL, 2 SKIPPED. Assets originais foram integrados e o locator de quantity foi estreitado; o 404 do helper permanece sem causa concreta confirmada. Ainda não houve execução browser pós-alteração.
- Node `24.22.1` e npm `11.19.1` via mise. Browser Playwright está no cache `.cache/ms-playwright`.
- Git permanece em `main`, checkpoint `f5fecf1`; não criar commit/remote nem fazer push.

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

Executar os testes focados e a suíte completa em ambiente que permita bind na porta 4180. Confirmar reset/default/empty/catalog-error/detail-error/slow, skeleton e limite mobile no browser; revisar as capturas visuais pós-correção nos viewports exigidos. Só então fechar o Lote 02. Não iniciar Lote 03.

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

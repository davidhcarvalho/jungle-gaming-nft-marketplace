# Progresso do Projeto

> Este arquivo é atualizado pelo agente ao longo da execução.

## Estado atual

- Lote atual: `01 — Foundation e Infraestrutura` (**PASS — encerrado**)
- Último lote concluído: `01 — Foundation e Infraestrutura`
- Bloqueios críticos do lote atual: nenhum. O Lote 02 não foi iniciado.

## Lotes

- [x] Lote 00 — Discovery e Baseline
- [x] Lote 01 — Foundation e Infraestrutura
- [ ] Lote 02 — Catálogo e Detalhe
- [ ] Lote 03 — Autenticação, Sessão e Favoritos
- [ ] Lote 04 — Carrinho e Cotação
- [ ] Lote 05 — Checkout, Pedido e Confirmação
- [ ] Lote 06 — Perfil e Carteiras
- [ ] Lote 07 — Tempo Real e Cenários de Falha
- [ ] Lote 08 — Quality Gate, Deploy e Documentação
- [ ] Lote 09 — Estudo e Defesa Técnica

## Evidências por lote

### Lote 00
- Status: **PASS — discovery concluído.** O checkout contém o pacote de governança e referências, mas ainda não contém uma aplicação executável. Não foi possível executar build/typecheck/lint/E2E por inexistência de manifesto e configuração; a ausência foi confirmada pelos comandos abaixo e é o principal achado para o Lote 01.
- Arquivos inspecionados: `START_HERE.md`, `AGENTS.md`, `AI_CONTEXT_INDEX.md`, `PROJECT_CONTEXT.md`, `challenge/README_ORIGINAL.md`, `challenge/REQUIREMENTS_MATRIX.md`, `challenge/ELIMINATION_GATES.md`, `challenge/VISUAL_INVENTORY.md`, `ROADMAP.md`, `TASKS.md`, `lots/LOT_00_DISCOVERY_BASELINE.md`, `PROGRESS.md`, `HANDOFF.md`, `DECISIONS.md`, `OPEN_QUESTIONS.md`; planos em `architecture/`, critérios globais e `evidence/README.md`.
- Árvore resumida: raiz com documentos de governança; diretórios `architecture/`, `challenge/`, `design-reference/{Desktop,Mobile}/`, `evidence/`, `lots/`, `prompts/`, `quality/` e `study/`. Não há `src/`, `public/`, `tests/` ou diretório equivalente de aplicação.
- Arquitetura encontrada: apenas arquitetura-alvo documentada (React UI → feature/Router/Query → Axios → REST/MSW; Socket.IO para eventos). Nenhum código de aplicação, rota, componente, teste ou mock implementado.
- Stack no repositório: nenhuma dependência instalada ou declarada; não há `package.json`, lockfile ou configuração de React, TypeScript, TanStack, Axios, Socket.IO, Tailwind/shadcn, MSW, Playwright ou Lighthouse. Ambiente observado: Node `v25.9.0`, npm `11.12.1`, pnpm `12.15.0`; Yarn ausente; `corepack --version` não executa por erro do shim mise sem versão Node configurada. Package manager do projeto: ainda não definido.
- Scripts: inexistentes, pois não há manifesto. `npm run` e `pnpm run` falharam por ausência de `package.json`; `npm ls --depth=0` indicou árvore vazia.
- Referências visuais: 9 telas Desktop (PNG, 2880 px de largura) e 6 telas Mobile (PNG, 828×1792), além de duas contact sheets. Contact sheets Desktop e Mobile inspecionadas visualmente. São referências, não assets de interface. Não há assets originais de NFT/fontes/ícones no inventário atual.
- Telas e rotas-alvo: Início/Catálogo `/`; Detalhe `/nfts/$nftId`; Carrinho `/cart` (rota dedicada recomendada); Pagamento `/checkout`; Confirmação `/orders/$orderId`; Login `/login`; Cadastro `/signup`; Perfil `/profile`; Carteiras `/wallets`. Rotas protegidas conforme `architecture/ROUTES_PLAN.md`: checkout, pedido, perfil e carteiras. Referências mobile existem para Início, Detalhe, Carrinho, Pagamento, Login e Cadastro; Perfil, Carteiras e Confirmação devem ser derivados do sistema mobile.
- Domínios identificados: sessão/conta e usuários; catálogo/NFTs/coleções/edições; favoritos; carrinho; cupons/cotação; carteiras/redes; checkout/pagamentos simulados; pedidos/recibos; perfil/avatar/senha; eventos `nft.updated` e `order.updated`; cenários de falhas e conectividade.
- Riscos (ordem): (1) checkout sem aplicação, manifesto, dependências ou testes; todos os gates técnicos estão por implementar. (2) escopo alto para prazo curto: compra idempotente/revalidada, sessão isolada e eventos reais via `socket.io-client`. (3) ausência de assets originais e fonte/tokens exatos; screenshots não podem virar UI. (4) transporte Socket.IO compatível com MSW requer validação de viabilidade no Lote 07. (5) ambiente usa Node 25 e shim Corepack não configurado; fixar versão compatível com as dependências ao estabelecer o projeto.
- Comandos/evidências: `rg --files` e busca de arquivos de código/configuração confirmaram que há somente os documentos e imagens listados; `file design-reference/* design-reference/Desktop/* design-reference/Mobile/*` confirmou formatos e dimensões; contact sheets foram abertas para inspeção; `node --version` → `v25.9.0`; `npm --version` → `11.12.1`; `pnpm --version` → `12.15.0`; `yarn --version` → comando ausente; `corepack --version` → falhou no shim mise sem Node global selecionado; `npm run` → ENOENT `package.json`; `pnpm run` → `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND`; `npm ls --depth=0` → árvore vazia. Busca por configs/lockfiles retornou nenhuma ocorrência.
- Git: `.git/` existe vazio, sem metadados de repositório; `git status`/`git log` não podem fornecer branch, commit ou alterações rastreadas.
- Arquivos planejados para Lote 01: criar manifesto/lockfile e configurações da stack; criar app base em `src/` (providers, Router, Query, Axios, estilos/Tailwind, shell responsivo e not-found); configurar MSW e reset de cenário; definir contratos/types mínimos e scripts de dev/build/typecheck/lint/teste. Ajustar nomes/estrutura após revalidar o lote específico e dependências disponíveis. Nenhuma alteração de aplicação foi feita no Lote 00.
- Pendências/bloqueios: nenhum impedimento de discovery. A baseline executável não existe neste checkout e deverá ser estabelecida no Lote 01; não há comandos de build/teste existentes para rodar. Lacunas pré-existentes sobre fonte, assets, breakpoints e tokens permanecem registradas em `OPEN_QUESTIONS.md`.
- Critérios Lote 00: inventário/arquitetura/stack/riscos/referências/rotas e plano de arquivos documentados; comandos disponíveis testados e resultado de ausência comprovado; nenhuma implementação de produto iniciada. Considero o lote atendido como baseline de discovery; não alego sucesso de build/teste inexistente.

### Lote 01
- Status: **PASS — Foundation concluída e quality gate aprovado** com base nas evidências executadas no ambiente local e fornecidas nesta retomada. Nenhuma atividade do Lote 02 foi iniciada.
- Runtime: Node 24.22.1 e npm 11.19.1. Repositório Git válido, branch main, sem remote/commits; os arquivos permanecem untracked por não haver primeiro commit.
- Dependências resolvidas: React/React DOM 19.3.1; TypeScript 6.0.3; Vite 8.3.5; TanStack Router 1.170.46; TanStack Query 5.105.0; Axios 1.21.0; Tailwind CSS 4.3.3; MSW 2.15.0; socket.io-client 4.8.4; Playwright 1.64.1; Lighthouse 13.6.0; ESLint 10.14.0; @eslint/js 10.0.1; typescript-eslint 8.72.1.
- Instalação: npm install concluído após atualização do ESLint; 0 vulnerabilidades. MSW teve aprovação individual do postinstall documentada neste arquivo de decisão e no package.json; worker oficial disponível em public/mockServiceWorker.js.
- Gates de build: mise exec node@24.22.1 -- npm run typecheck → PASS; mise exec node@24.22.1 -- npm run lint → PASS com ESLint 10.14.0; mise exec node@24.22.1 -- npm run build → PASS. Vite transformou 227 módulos e produziu dist/index.html, CSS principal ~11.91 kB e JS principal ~391.46 kB (126.86 kB gzip).
- Browser: Playwright 1.64.1 executado duas vezes com sucesso; cada execução teve 6 testes aprovados. Chromium, Chromium Headless Shell e FFmpeg instalados usando PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"; o fallback Ubuntu 24.04 x64 foi usado por o sistema operacional não estar oficialmente listado.
- E2E por projeto: mobile-390 — PASS em health/reset Query → Axios → MSW e not-found; tablet-768 — PASS nos mesmos dois testes; desktop-1440 — PASS nos mesmos dois testes. Total 6 passed por execução. O teste também confirmou ausência de erros de console/pageerror e o estilo computado previsto.
- Fluxo comprovado em runtime: React → TanStack Query → Axios → HTTP → MSW → fixture/resposta → TanStack Query → React. A troca e o reset de cenário foram confirmados pelo teste; o Router mostrou a página not-found em caminho desconhecido.
- Dependências de sistema do browser: npx playwright install-deps chromium falhou porque este sistema não possui apt-get. Isso não é gate falho: Chromium executou os testes E2E com sucesso; não tentar instalar dependências de sistema novamente.
- Cache Playwright: .cache/ está listado em .gitignore; binaries locais não serão versionados. Nenhum screenshot de referência é usado como UI.
- Quality gate consolidado: instalação e lockfile — PASS; typecheck — PASS; lint ESLint 10.14.0 — PASS; build — PASS; smoke de integração — PASS; Router e not-found — PASS; Query/Axios/MSW e resposta de fixture — PASS; reset determinístico — PASS; Tailwind/shadcn configurados — PASS; socket.io-client presente — PASS; .env.example presente — PASS; viewports 390/768/1440 — PASS; erros de console/pageerror — nenhum observado nos testes; vulnerabilidades npm — 0.
- Arquivos de governança atualizados para remover os bloqueios ambientais anteriores e consolidar essas evidências. O estado Git continua sem commits e sem remote, conforme solicitado.
- Não implementados por pertencerem a lotes posteriores: fluxos completos de catálogo, autenticação, favoritos, carrinho, cupons, checkout, pedidos, perfil/carteiras e real-time funcional.

### Lote 02
- Status:
- Comandos:
- Testes:
- Screenshots:
- Evidências:
- Pendências:

### Lote 03
- Status:
- Comandos:
- Testes:
- Evidências:
- Pendências:

### Lote 04
- Status:
- Comandos:
- Testes:
- Evidências:
- Pendências:

### Lote 05
- Status:
- Comandos:
- Testes:
- Evidências:
- Pendências:

### Lote 06
- Status:
- Comandos:
- Testes:
- Screenshots:
- Evidências:
- Pendências:

### Lote 07
- Status:
- Comandos:
- Testes:
- Evidências:
- Pendências:

### Lote 08
- Status:
- Comandos:
- Testes:
- Lighthouse:
- Deploy:
- Evidências:
- Pendências:

### Lote 09
- Status:
- Tópicos estudados:
- Perguntas simuladas:
- Pontos ainda frágeis:

## Definition of Done global

Um item não está concluído apenas porque “funciona na máquina”.

Para ser concluído deve, conforme aplicável:
- compilar;
- passar typecheck;
- passar lint;
- ter comportamento correto;
- tratar erro/loading/empty;
- ser responsivo;
- respeitar referência visual;
- ser acessível;
- ter teste/evidência;
- não introduzir warning/erro de console;
- estar documentado quando não óbvio.

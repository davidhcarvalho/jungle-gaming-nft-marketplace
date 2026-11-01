# Arquitetura da solução — implementação até o Lote 07 e fechamento Lote 08

Este documento descreve a implementação atual do marketplace, incluindo conta, carrinho, pedidos, perfil/carteiras e sincronização realtime simulada. Os serviços de domínio são executados sobre APIs e transportes MSW locais; não há backend de produção.

## Runtime e build

- Node `24.22.1`, fixado por `.nvmrc` e restringido a Node 24 em `package.json > engines`.
- npm é o único package manager; `package-lock.json` está coerente e instalações limpas usam `npm ci`. ESLint 10.14.0 e `@eslint/js` 10.0.1 estão resolvidos no lockfile; `typescript-eslint` 8.72.1 suporta essa versão.
- Vite serve o SPA e gera o build estático. O plugin React trata TSX e o plugin oficial Tailwind integra as utilities CSS.
- TypeScript está em modo `strict`; `@/*` aponta para `src/*` em Vite e nos projetos TypeScript.

## Organização

- `src/app`: composição do provider, `QueryClient` e Router.
- `src/api`: Axios central, conversão de erros e primeira chamada REST.
- `src/components`: shell global e Button source-based no padrão shadcn/ui.
- `src/features/foundation`: harness de rede apenas em desenvolvimento.
- `src/features/catalog`: filtros/search schema, API REST, query hooks, fixtures de dados, cartões, estados e Home.
- `src/features/nft`: detalhe por ID, edições, limites e estados de recurso.
- `src/features/auth`: forms de login/cadastro, sessão, token de demonstração, validação de returnTo e operações REST de conta.
- `src/features/favorites`: API, query por usuário e mutation otimista com rollback.
- `src/features/cart`: identidade guest, API Axios, queries/mutations de carrinho e cotação, resumo e layout responsivo.
- `src/mocks`: worker, handlers, fixture e cenário resetável.
- `src/realtime`: conexão por sessão com `socket.io-client`, consumidor tipado/versionado de eventos, invalidação/reconciliação REST e teardown no logout/troca de usuário.
- `src/routes`: placeholders explícitos e tratamento de rota não encontrada.
- `src/types`: contratos iniciais de API e domínio, com ETH modelado como string decimal.

## Navegação e estado remoto

TanStack Router usa uma route tree code-based tipada. `/` valida os search params do catálogo; `/nfts/$nftId` distingue NFT 404 de rota desconhecida. `/login` e `/signup` validam `returnTo` contra caminhos internos para evitar open redirects. Guards fazem `fetchQuery` da sessão antes de renderizar `/checkout`, `/orders/$orderId`, `/profile` e `/wallets`; sem sessão válida redirecionam ao login preservando pathname e query. A rota `/cart` é pública para permitir compra como visitante e recuperar a identidade de carrinho guest. `/__foundation/smoke` só existe em desenvolvimento. Deep links dependem do fallback SPA do Vite.

TanStack Query usa uma instância central: uma tentativa de retry, `staleTime` de 30 segundos, `gcTime` de cinco minutos, sem refetch ao focar a janela e refetch ao reconectar. Mutations não repetem automaticamente. Essa política inicial poderá ser ajustada por domínio.

## REST e erros

Todo acesso REST parte de `src/api/client.ts`, configurado por `VITE_API_BASE_URL`, timeout, credenciais e `AbortSignal`. Um request interceptor envia o token de sessão fictício no header Bearer; o response interceptor emite um sinal de expiração para 401 em recursos privados. Axios não contém fixtures nem regras de mock. `src/api/errors.ts` normaliza timeout, rede e erros estruturados.

## MSW e bootstrap

`src/main.tsx` aguarda `startMocks()` antes de montar React. O worker só inicia quando `VITE_ENABLE_MOCKS=true`, em desenvolvimento e no build de demonstração. `public/mockServiceWorker.js` foi gerado pelo comando oficial `npm run mocks:worker` e está presente. O módulo do browser e handlers é carregado dinamicamente apenas quando os mocks são habilitados.

GET `/api/foundation/health` percorre Query → Axios → HTTP e recebe fixture pelo MSW. `POST /api/test-scenarios/reset` reseta cenário, contas, sessões e favoritos simulados. Auth usa `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/session` e `POST /api/auth/logout`; favoritos usam `GET /api/favorites`, `POST /api/favorites` e `DELETE /api/favorites/:nftId`. Os handlers retornam erros estruturados de validação, conflito, unauthorized e falha de serviço. `GET /api/nfts` e `GET /api/nfts/:nftId` mantêm os contratos do catálogo/detalhe. Cenários `signup-conflict`, `session-expired` e `favorite-error` permitem testar os erros de conta e recuperação.

Fixtures incluem duas contas (`user-ana`, `user-leo`) com senha representada somente por SHA-256 do e-mail normalizado e senha de demo. Estado de contas, tokens/sessões e favoritos fica no `localStorage` de mock para persistir entre refresh; o token cliente fictício também é guardado no `localStorage`, mas senha nunca é persistida. Isso é somente uma estratégia determinística de demonstração local, não um desenho de autenticação para produção.

Query key da sessão é `['auth','session']`; favoritos usam `['private', userId, 'favorites']`. Logout, sessão expirada e troca de usuário cancelam queries privadas em voo e removem todo o prefixo `private`, sem apagar dados públicos. A mutation de favorito atualiza a lista em `onMutate`, restaura o snapshot em `onError`, e invalida/refaz a query em `onSettled`. Callbacks ignoram respostas tardias caso a sessão ativa tenha mudado. Carrinhos usam query keys privadas por owner (`guest:<id>` ou `user:<id>`); logout/troca limpa cache, e a API determina o owner pelo token de sessão ou pelo header `X-Guest-Cart-Id`.

## shadcn/ui e visual

`components.json` configura aliases e CSS variables do shadcn. O Button usa Radix Slot, class-variance-authority e `cn`. Os tokens CSS foram ajustados às referências KURIO. Nenhuma screenshot de referência aparece na UI.

## Tipos e limites conhecidos

`EthAmount` é um alias string; preço e faixa trafegam como string decimal. O handler compara decimais usando unidades inteiras `BigInt`, sem converter valores ETH para `number`. Os contratos contêm campos mínimos baseados no desafio e evoluem junto das APIs mockadas. `socket.io-client` mantém a conexão e os listeners versionados de realtime descritos abaixo.

No ambiente de testes, `POST /api/test-scenarios/reset` seleciona deterministicamente os cenários MSW por HTTP e persiste a escolha para a próxima navegação. Catálogo e detalhe distinguem `catalog-error` e `detail-error`. Playwright inicia Vite isolado na porta 4180 (ou `PLAYWRIGHT_PORT`) sem reutilizar processo já aberto, evitando testar bundle antigo.

## Limite visual de assets

Os frames de referência do Figma não são usados como UI. Os quatro assets originais principais exportados (`emerald-ape.png`, `golden-beat.png`, `neon-vessel.png` e `sage-nomad.png`) alimentam as identidades correspondentes. Fixtures adicionais sem asset próprio reutilizam uma dessas imagens como fallback provisório; a arte específica dessas obras ainda pode ser substituída quando estiver disponível.


## Carrinho e cotação — Lote 04

Os contratos passam por Axios/MSW: `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:itemId`, `DELETE /api/cart/items/:itemId`, `POST /api/cart/coupon`, `DELETE /api/cart/coupon` e `POST /api/quote`. O request de quote não recebe valores financeiros do browser; o handler lê as linhas e o cupom armazenados para o owner, valida novamente o preço/estoque das fixtures e retorna subtotal, desconto, taxa e total. O checkout continua protegido e fora de escopo funcional deste lote.

O identificador guest fica no localStorage e é enviado por `X-Guest-Cart-Id`; MSW persiste carrinhos no localStorage de mock. Login e cadastro mesclam o guest ao user antes de responder: linhas iguais por NFT/edição são somadas até a disponibilidade; o cart guest é removido após merge, e a resposta informa quantidade de linhas e eventuais linhas limitadas. Carrinhos de conta são isolados pelo `userId`. O reset `POST /api/test-scenarios/reset` restaura carrinhos e cenários. Cenários de demonstração: `KURIO10` concede 10%; `EXPIRED` retorna cupom expirado; qualquer outro código é inválido.

`EthAmount` permanece string decimal em domínio/transporte. A camada de mock converte para unidades inteiras de 18 casas (`bigint`/wei), aplica quantidade, percentual e soma de taxas sem aritmética floating-point e serializa novamente como decimal string. A quote contém `id`, `cartVersion` e `validUntil` para permitir revalidação no Lote 05. Queries de quote são keyed por owner, versão do carrinho e código; cada mutation atualiza o cart e invalida quote.

O resumo da cotação tem skeleton com shimmer durante leitura/refetch inicial; erro de cotação preserva itens e oferece retry. Falhas de mutation não usam update otimista, então o cache confirmado permanece coerente quando MSW rejeita a operação. As regras de estoque são verificadas no handler, não apenas nos controles da interface.

## Checkout e pedidos — Lote 05

`/checkout` e `/orders/$orderId` continuam protegidos pelo guard de sessão compartilhado do Lote 03. O checkout consulta carteiras do usuário via `GET /api/checkout/wallets`, conecta/desconecta a seleção via REST/MSW e pede uma nova quote autoritativa em `POST /api/checkout/revalidate` antes de cada tentativa. Mudança de valor, disponibilidade, cupom ou taxa interrompe a criação: a quote atualizada precisa de uma confirmação explícita posterior.

`POST /api/orders` exige header `Idempotency-Key`. O cliente guarda uma chave por tentativa lógica no `sessionStorage`, reutiliza durante falha de transporte/retry e encerra a tentativa após resposta conclusiva ou conflito. O mock indexa a chave por usuário, compara o payload canônico e retorna o mesmo pedido quando a chave e payload coincidem; payload diferente conflita. O cenário timeout-after-create persiste um pedido pending antes de simular falha de rede, permitindo recuperar esse mesmo pedido na repetição.

Pedidos são recuperados por `GET /api/orders/:orderId` e atualização controlada por `POST /api/orders/:orderId/refresh`. A máquina mock permite `pending → confirmed|rejected`; estados terminais não regridem. O Lote 07 acrescenta notificações Socket.IO para esses estados; REST continua autoridade e é consultado após reconexão.

Ao confirmar, o mock cria um snapshot de receipt com itens, edição, quantidades, preços de linha, quote, carteira, rede, referência simulada e timestamp. Esse snapshot fica no pedido e não consulta novamente catálogo para renderização. Pedido rejected/pending preserva o carrinho; confirmação remove apenas as quantidades efetivamente gravadas no pedido. ETH continua string decimal no contrato e os cálculos mock usam wei com `bigint` conforme ADR-007.

O harness MSW expõe um endpoint de teste restrito para alterar preço de fixture (`POST /api/test-scenarios/catalog-price`); a mutação persiste no estado local de mock e é limpa pelo reset de cenário. Playwright usa essa rota para comprovar que o catálogo muda enquanto o recibo confirmado conserva os valores capturados.

O formulário de colecionador reaproveita dados da sessão e envia erros de validação pelo contrato do pedido. O frame mobile não possui formulário de colecionador; a composição mobile deriva a prioridade de carteira/rede/total e CTA do Figma, enquanto o formulário completo permanece no desktop. Não existe conexão de blockchain real e referências do explorer usam domínio `.invalid` de simulação.

## Sincronização realtime — Lote 07

`src/realtime/socket-client.ts` cria uma conexão `socket.io-client@4.8.4` por contexto de sessão, com transporte WebSocket e reconexão habilitada. O import do cliente é dinâmico após o bootstrap MSW, para que o browser use o WebSocket interceptável. `RealtimeProvider` associa a conexão à sessão atual, instala listeners uma vez por lifecycle e remove listeners/desconecta em logout, troca de usuário e unmount.

Em modo mock, `src/mocks/socket/server.ts` registra `ws.link(window.location.origin)` e adapta cada conexão pelo `toSocketIo(connection)` de `@mswjs/socket.io-binding@0.2.0` (MSW 2.15.0). Usa o namespace padrão e o path Socket.IO padrão. A binding implementa o handshake/protocolo sobre WebSocket interceptado pelo MSW; não há framing manual. O escopo de demonstração não inclui namespaces customizados, rooms, broadcast distribuído, acknowledgements complexos ou anexos binários.

Eventos `nft.updated` e `order.updated` carregam `eventId`, `resourceId`, `version`, recurso completo coerente com a resposta REST e payload tipado. O consumidor ignora IDs repetidos, versões iguais/antigas e transições que contrariem estado terminal; para pedido, também valida o `userId` ativo. Um evento NFT atualiza detalhe, invalida catálogo/carrinho/quote e informa que a quote precisa ser revista. A confirmação continua passando pela revalidação REST obrigatória do Lote 05. `order.updated` atualiza o pedido pendente e invalida dados relacionados; somente `confirmed` exibe confirmação.

Após reconnect, a aplicação espera a nova subscription e invalida recursos REST ativos (catálogo/detalhe, carrinho/quote e pedidos), recuperando eventos perdidos sem criar novo pedido. O mock controla cenários por `POST /api/test-scenarios/realtime`: `nft-price`, `nft-availability`, `order-status`, `order-status-missed` e `disconnect`; mudanças usam as mesmas stores persistidas que os handlers REST. Reset de cenário limpa overrides e encerra conexões simuladas para isolamento determinístico.

## Perfil e carteiras — Lote 06

`/profile` e `/wallets` reutilizam o guard de sessão existente e usam APIs Axios/MSW (`GET/PATCH /api/profile`, `/api/profile/avatar`, `/api/profile/password` e `GET/POST/PATCH /api/wallets`). Queries privadas são keyed por `userId`. Mutations gravam os dados confirmados no cache do perfil/carteiras; alteração de carteira invalida especificamente a query privada de wallets usada pelo checkout.

`src/mocks/state/wallets-store.ts` é a fonte única de carteiras para o perfil e para o checkout. Cada usuário tem exatamente uma principal; promover uma secundária troca as funções na mesma operação mock. Endereços EVM, rede e duplicidade são validados pelo handler. Persistência do estado mock sobrevive a refresh e o reset de cenários restaura os fixtures.

O estado de perfil também é persistido por usuário na camada mock. Avatar é validado e transportado como data URL de imagem somente no ambiente de demonstração, com limite de tamanho e operação REST para upload/remoção. Senhas não são persistidas em claro: o handler verifica a senha atual e substitui o SHA-256 digest da conta mock. Isso continua sendo uma simulação local, sem storage externo nem serviço de autenticação de produção.

Não há frames mobile de Perfil/Carteiras. ADR-009 registra a adaptação para uma coluna e a navegação refluída; os cartões de wallet mantêm o endereço integral em seu nome acessível mesmo quando o texto visual é truncado.

## Qualidade final — Lote 08

As páginas de feature usam `React.lazy` com um `Suspense` explícito no conteúdo da rota; o shell, guards e not-found permanecem na árvore inicial. Essa divisão reduziu o chunk de entrada do build normal de 514,16 kB (gzip 158,66 kB) para aproximadamente 253 kB (gzip 79,27 kB). O realtime provider continua montado, mas o client Socket.IO e seu consumidor de eventos são importados dinamicamente no ponto pós-LCP em que a conexão já é iniciada. No build demo, a entrada após essa separação é 314,96 kB (gzip 101,62 kB); o interceptor MSW requerido pela demonstração permanece em chunk separado de 336,43 kB (gzip 135,12 kB). Um teste inicial com `lazyRouteComponent` do Router gerou warning React 19 ao alternar a renderização suspensa/resolvida; foi substituído por `React.lazy` e cobertura explícita de Suspense. `npm run build:demo` gera `dist/` com MSW habilitado.

As quatro imagens originais de 500×500 continuam em PNG. O browser serve versões WebP qualidade 88 em `public/assets/nfts/optimized/`, revisadas visualmente contra os originais, com 32–41 kB por arquivo frente aos WebP lossless anteriores de 262–279 kB. A imagem Emerald Ape é pré-carregada por ser o destaque da Home e o recurso padrão do detalhe auditado.

`npm run lighthouse` constrói o bundle demo com MSW habilitado, inicia o Vite production preview e audita via Chromium/DevTools três vezes Home e detalhe em mobile 390×844 e desktop 1440×900, com throttling simulado. Desktop usa `formFactor: desktop` e emulação desktop explícita; não usa o dev server. Cada batch armazena os 12 relatórios JSON/HTML em diretório próprio sob `evidence/lighthouse/`, mais resumo com mediana, LCP, CLS e TBT. Request `1793511419-550281-4` registrou Performance 69/49/76/52 (Home mobile/desktop, detalhe mobile/desktop), Accessibility 100/96, Best Practices 100 e SEO 100. O README pede justificar metas não atingidas; Performance abaixo de 90 não é critério eliminatório por si só. A análise em `evidence/lighthouse/analysis.md` identifica custo de inicialização JS/MSW sob throttling simulado, render delay desktop e descoberta da imagem LCP Home mobile após a resposta REST; media/font findings também estão registrados. Mocks, REST e Socket.IO permanecem no build auditado.

`vercel.json` declara o build demo, `dist/` e rewrites SPA para as rotas do desafio; `public/_redirects` permanece para hosts que usam esse formato. Produção foi sincronizada com o commit `7b82d92` e validada via Playwright em `https://kurio-nft-marketplace-zeta.vercel.app`: deep links, refresh, MSW REST, Socket.IO, redirects protegidos e ausência de overflow/erros inesperados passaram (Request `1793520674-575891-16`).

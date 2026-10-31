# Arquitetura da solução — Lotes 01 a 04

Este documento registra as partes implementadas até o Lote 04. Checkout/pedidos, perfil completo, carteiras e real-time funcional seguem para lotes posteriores.

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
- `src/realtime`: factory inicial de `socket.io-client`, sem conexão ou eventos nesta etapa.
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

`components.json` configura aliases e CSS variables do shadcn. O Button usa Radix Slot, class-variance-authority e `cn`. Os tokens CSS são aproximações iniciais derivadas das referências KURIO; serão comparados e refinados nos lotes de interface. Nenhuma screenshot de referência aparece na UI.

## Tipos e limites conhecidos

`EthAmount` é um alias string; preço e faixa trafegam como string decimal. O handler compara decimais usando unidades inteiras `BigInt`, sem converter valores ETH para `number`. Os contratos contêm campos mínimos baseados no desafio e evoluirão junto das APIs mockadas. `socket.io-client` está instalado e a factory arquitetural está preparada; transporte, eventos e subscriptions ficam para os lotes de real-time.

No ambiente de testes, `POST /api/test-scenarios/reset` seleciona deterministicamente os cenários MSW por HTTP e persiste a escolha para a próxima navegação. Catálogo e detalhe distinguem `catalog-error` e `detail-error`. Playwright inicia Vite isolado na porta 4180 (ou `PLAYWRIGHT_PORT`) sem reutilizar processo já aberto, evitando testar bundle antigo.

## Limite visual de assets

Os frames de referência do Figma não são usados como UI. Os quatro assets originais principais exportados (`emerald-ape.png`, `golden-beat.png`, `neon-vessel.png` e `sage-nomad.png`) alimentam as identidades correspondentes. Fixtures adicionais sem asset próprio reutilizam uma dessas imagens como fallback provisório; a arte específica dessas obras ainda pode ser substituída quando estiver disponível.


## Carrinho e cotação — Lote 04

Os contratos passam por Axios/MSW: `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:itemId`, `DELETE /api/cart/items/:itemId`, `POST /api/cart/coupon`, `DELETE /api/cart/coupon` e `POST /api/quote`. O request de quote não recebe valores financeiros do browser; o handler lê as linhas e o cupom armazenados para o owner, valida novamente o preço/estoque das fixtures e retorna subtotal, desconto, taxa e total. O checkout continua protegido e fora de escopo funcional deste lote.

O identificador guest fica no localStorage e é enviado por `X-Guest-Cart-Id`; MSW persiste carrinhos no localStorage de mock. Login e cadastro mesclam o guest ao user antes de responder: linhas iguais por NFT/edição são somadas até a disponibilidade; o cart guest é removido após merge, e a resposta informa quantidade de linhas e eventuais linhas limitadas. Carrinhos de conta são isolados pelo `userId`. O reset `POST /api/test-scenarios/reset` restaura carrinhos e cenários. Cenários de demonstração: `KURIO10` concede 10%; `EXPIRED` retorna cupom expirado; qualquer outro código é inválido.

`EthAmount` permanece string decimal em domínio/transporte. A camada de mock converte para unidades inteiras de 18 casas (`bigint`/wei), aplica quantidade, percentual e soma de taxas sem aritmética floating-point e serializa novamente como decimal string. A quote contém `id`, `cartVersion` e `validUntil` para permitir revalidação no Lote 05. Queries de quote são keyed por owner, versão do carrinho e código; cada mutation atualiza o cart e invalida quote.

O resumo da cotação tem skeleton com shimmer durante leitura/refetch inicial; erro de cotação preserva itens e oferece retry. Falhas de mutation não usam update otimista, então o cache confirmado permanece coerente quando MSW rejeita a operação. As regras de estoque são verificadas no handler, não apenas nos controles da interface.

# Notas de estudo — explicar e defender o Kurio

Este material descreve o repositório que existe, incluindo suas simulações. A aplicação usa APIs REST e Socket.IO interceptados por MSW; não há backend privado, gateway, wallet extension nem transação blockchain real. Use os caminhos e testes citados para demonstrar cada afirmação. Não tente memorizar o texto: responda com suas palavras e abra o código quando precisar provar um detalhe.

## Resumo de 60 segundos

> Construí um marketplace NFT em React e TypeScript com rotas tipadas, estado remoto no TanStack Query e uma camada REST central via Axios. MSW intercepta as requisições do browser e fornece fixtures e estado persistente determinístico para desenvolvimento, teste e demonstração. O catálogo espelha filtros na URL; sessão e dados privados são isolados por usuário; carrinho e quote usam contratos de API; valores ETH são strings e a aritmética mock usa unidades inteiras com `bigint`. A criação de pedido usa uma chave de idempotência, revalidação autoritativa e snapshot imutável do recibo. Atualizações chegam por `socket.io-client`, com eventos versionados, rejeição de duplicatas/versões antigas e reconciliação por REST após reconexão. Playwright cobre os fluxos e breakpoints. O deploy público foi validado em `https://kurio-nft-marketplace-zeta.vercel.app`.

## Mapa de arquitetura em palavras

1. `src/main.tsx` aguarda o bootstrap opcional de MSW antes de renderizar React.
2. `src/app/providers.tsx` compõe os providers compartilhados; `src/app/query-client.ts` define defaults do TanStack Query.
3. `src/app/router.tsx` declara rotas e parâmetros de busca tipados, guards e páginas lazy.
4. Páginas e hooks de `src/features/*` chamam funções REST da própria feature.
5. `src/api/client.ts` centraliza base URL `/api`, timeout, token de sessão, identidade de carrinho guest e tratamento de 401; passa `AbortSignal` quando fornecido.
6. O browser faz HTTP normal. Em modo demo/teste, o Service Worker MSW intercepta a rede e encaminha para handlers e stores mock em `src/mocks/`.
7. Para tempo real, o cliente `socket.io-client` conecta pelo WebSocket interceptado pela binding MSW. O consumidor valida identidade, sessão, `eventId` e versão antes de reconciliar Query.

## Biblioteca por biblioteca — resposta curta e aprofundada

### React

**Curta:** compõe as páginas e os estados visuais. A lógica de dados vive em hooks/serviços de feature; componentes não importam fixtures.

**Aprofundada:** a raiz só é montada após o bootstrap de mocks, para evitar que a primeira query escape do Service Worker. Páginas grandes usam carregamento lazy com `React.lazy` e `Suspense` explícito. O provider de realtime segue o lifecycle de sessão e da árvore React.

**Onde provar:** `src/main.tsx`, `src/app/providers.tsx`, `src/features/`, `src/realtime/realtime-provider.tsx`.

### TypeScript

**Curta:** contratos tipados tornam os limites de domínio e transporte explícitos e o modo strict detecta inconsistências antes do browser.

**Aprofundada:** tipos de domínio estão em `src/types/domain.ts`; tipos de API/erro/evento estão em `src/types/api.ts`. ETH é string decimal no transporte. Tipos ajudam no compile time, mas validação de payload de rede ainda precisa ser defensiva no runtime.

### TanStack Router

**Curta:** controla navegação e deixa o estado compartilhável do catálogo na URL.

**Aprofundada:** search params passam por parsing/validação tipados na rota Home; isso permite refresh, link direto, back e forward. Rotas privadas consultam a sessão e redirecionam para login preservando `returnTo`, que é sanitizado. `/cart` continua acessível como guest. Uma rota not-found geral e o caso de NFT inexistente são estados distintos.

**Onde provar:** `src/app/router.tsx`, `src/features/catalog/home-page.tsx`, `tests/catalog.spec.ts`, `tests/auth-favorites.spec.ts`.

### TanStack Query

**Curta:** gerencia server state: cache, deduplicação, retries e invalidação.

**Aprofundada:** defaults conservadores são retry 1, stale time 30 s, garbage collection 5 min, sem refetch no foco e refetch ao reconectar; mutations não repetem automaticamente. Query keys descrevem identidade e parâmetros. Queries privadas começam por `['private', userId, ...]`. As query functions encaminham o `AbortSignal` do Query para Axios; no catálogo, mudança de parâmetros cria outra key e `placeholderData` mantém resultados anteriores só durante a transição. Invalidação por evento realtime é efeito da conexão Socket.IO; ela não substitui a conexão.

**Trade-off:** atualizar diretamente o cache pode dar feedback imediato, mas exige identidade/versionamento corretos. Quando REST precisa confirmar a verdade, invalidar/refazer query é mais simples e seguro.

**Onde provar:** `src/app/query-client.ts`, `src/lib/query-keys.ts`, `src/features/*/queries.ts`, `src/realtime/consume-events.ts`.

### Axios

**Curta:** um cliente comum garante que chamadas REST respeitem a mesma configuração e sessão.

**Aprofundada:** `apiClient` usa `/api` por padrão, timeout de 10 s, bearer token mock, header `X-Guest-Cart-Id`, `Accept`/JSON e `withCredentials`; encaminha `AbortSignal`. O interceptor de resposta transforma 401 de endpoints protegidos em um evento de sessão expirada, sem engolir a rejeição. Não contém respostas mockadas nem regras de domínio.

**Onde provar:** `src/api/client.ts`, `src/api/errors.ts`, `src/features/catalog/api.ts`.

### MSW

**Curta:** intercepta o tráfego de rede no browser e permite usar o mesmo contrato HTTP em dev, testes e demo.

**Aprofundada:** `VITE_ENABLE_MOCKS` escolhe o bootstrap; `src/main.tsx` espera `worker.start()` antes de renderizar. Handlers em `src/mocks/handlers/` chamam stores compartilhadas, preservando coerência entre catálogo, carrinho, quote, pedidos, perfil, carteiras e eventos. Cenários são determinísticos e resetáveis via endpoint de teste. O app continua usando Axios/HTTP: não há fixture importada em hook de produção.

**Limite:** persistência local de mock é útil para demo reproduzível, mas não tem as garantias concorrentes, autorização nem durabilidade de um backend real.

### Socket.IO

**Curta:** o cliente é `socket.io-client`; no demo, MSW intercepta seu transporte WebSocket e a binding implementa o protocolo compatível.

**Aprofundada:** `src/realtime/socket-client.ts` cria a conexão e `realtime-provider.tsx` a associa ao lifecycle da sessão. `@mswjs/socket.io-binding@0.2.0` usa `ws.link(window.location.origin)` e `toSocketIo`; não existe framing manual. `consume-events.ts` ignora `eventId` repetido, versão não maior que a conhecida e eventos privados de outra sessão. Após reconectar, invalida recursos ativos e REST reconcilia eventos perdidos.

**Ponto essencial:** realtime é notificação/sincronização. Quote e pedido continuam sob autoridade REST; um evento de preço pode deixar a quote stale, mas não autoriza checkout.

**Limites do mock documentados:** namespace/path padrão; sem rooms reais, broadcast distribuído, binary attachments ou acknowledgements complexos.

### Tailwind e shadcn/ui

**Curta:** Tailwind dá composição responsiva e tokens/utilitários; shadcn fornece componentes-base selecionados, todos adaptados à referência visual.

**Aprofundada:** valores arbitrários foram usados quando os frames pediam medidas fora da escala padrão. Os componentes não mantêm o tema shadcn default como identidade visual. Referências do Figma nunca são imagens renderizadas na UI.

### Playwright

**Curta:** valida interações reais no browser em cenários MSW e três tamanhos principais.

**Aprofundada:** specs cobrem fluxo de negócio, acesso direto, refresh, isolamento, recuperação de falhas e feedback. Projetos funcionais usam 390, 768 e 1440. Capturas visuais têm evidência por lote; snapshots de tablet são intencionalmente pulados sem referência, enquanto os fluxos funcionais em 768 passam. A suíte final antes do fechamento foi 257 PASS, 25 SKIPPED, 0 FAIL; o smoke público do commit final também passou.

**Regra de confiança:** um teste verde não prova sozinho fidelidade visual; as capturas foram comparadas às referências e revisadas.

### Lighthouse

**Curta:** mede o build otimizado em preview, com mocks habilitados, três vezes por página/perfil; reporta mediana e LCP/CLS/TBT.

**Aprofundada:** o desktop usa preset e screen emulation desktop; não é dev server. Performance abaixo de 90 foi justificada com LCP breakdown, TBT/long tasks, JS startup e imagem que só entra após resposta REST do catálogo. Não se deve dizer que a aplicação alcançou meta de Performance. Acessibilidade, Best Practices e SEO atingiram metas nos relatórios finais.

**Fonte de evidência:** `evidence/lighthouse/analysis.md` e os 12 JSON/HTML do batch apontado pelo Request `1793511419-550281-4`. Há lotes históricos com medições diferentes; ao apresentar números, abra o batch/request correto e não misture resultados. Os relatórios não foram refeitos depois do deploy porque código auditado permaneceu idêntico.

## Fluxos de domínio para explicar

### Catálogo, busca e resposta obsoleta

`HomePage` lê search params tipados; atualização do usuário navega com histórico adequado. `useNFTCatalog` forma query key com filtros/sort/page; query function passa o signal para Axios; `/api/nfts` é filtrado/paginado no handler MSW e devolve metadata. Query identity isola resultados. Resposta antiga não deve substituir a chave atual; cancelamento é possível pelo signal.

### Sessão e isolamento

Login/signup chama API; a resposta instala a sessão no cache de auth. Rotas privadas preservam `returnTo`. Query keys privadas incluem owner/user. Logout, expiração e troca cancelam/removem cache privado e encerram listeners associados à sessão. A store de mock também separa os dados pelo usuário. Uma demonstração de login mock não equivale a segurança real: o servidor de produção ainda precisaria autenticar e autorizar toda operação.

### Favorito otimista e rollback

1. `onMutate`: cancela a query em voo e guarda snapshot.
2. Atualiza cache para feedback imediato.
3. API/MSW confirma ou falha.
4. `onError`: restaura snapshot se falhar.
5. `onSettled`: invalida para reconciliar.

**Por que isso funciona aqui?** Há uma mutation visualmente simples, e o rollback evita que a UI afirme uma gravação que a API rejeitou. A mutation é protegida contra resposta de sessão anterior.

### Carrinho guest → usuário

O guest recebe identidade estável e seu cart persiste no mock local, identificado pelo header Axios. No login/signup, handler mescla linhas equivalentes por NFT/edição com o carrinho da conta, soma quantidades até estoque e remove o resíduo guest só após merge. Mesma identidade de edição não duplica linha. Depois da autenticação, key privada usa owner. Logout/troca não pode mostrar cart de outro usuário.

### ETH, quote e cupom

O transporte usa decimal string. O mock converte ETH em unidades inteiras de wei com `bigint`, calcula subtotal/desconto/taxa sem floating point e serializa decimal string. O browser não envia total autoritativo: a quote é derivada do cart/cupom/estoque no handler. `KURIO10` é exemplo válido; `EXPIRED` expirado; outros códigos inválidos (ver `ARCHITECTURE.md`).

### Checkout, idempotência e timeout

Antes de criar pedido, checkout pede nova revalidação REST para preço, disponibilidade, quantidade, cupom e taxa. Mudança exige confirmação explícita adicional. A chave de idempotência é criada para uma tentativa lógica e persiste em sessionStorage durante retry/timeout. Mesmo user+key+payload retorna o mesmo pedido; mesma key com payload diferente dá 409. Timeout-after-create grava o pedido antes de perder a resposta, e retry recupera o mesmo pedido. Nova tentativa deliberada após encerrar a anterior usa uma nova key.

### Estado de pedido e recibo

`pending → confirmed` ou `pending → rejected`; estados finais não regridem. Confirmed sozinho permite estado de sucesso. O receipt grava snapshot dos NFTs/edições/quantidades/preços/quote/wallet/network/reference/timestamp; alteração futura de catálogo não recalcula esse snapshot. Carrinho só remove quantidades realmente confirmadas; falha/rejeição preserva linhas.

### Perfil e carteiras

Perfil/avatar/senha e CRUD de carteira passam por API/MSW. Senha mock guarda digest, não texto puro; isso ainda não é mecanismo de produção. Avatar demo usa data URL validada, não storage externo. Wallet store é compartilhada com checkout e mantém exatamente uma principal por usuário; promover uma carteira rebaixa a anterior na mesma operação.

### Evento NFT/pedido e REST reconciliation

O servidor mock altera a store compartilhada e publica evento pelo socket binding; REST lê o mesmo estado. `eventId` repetido e `version <= knownVersion` são ignorados. `nft.updated` invalida catálogo/detalhe/cart/quote e anuncia revisão; REST revalida quote antes da compra. `order.updated` respeita sessão e transição terminal. Ao reconectar, Query invalida recursos ativos e REST recupera o estado perdido. Refresh de pedido pending consulta REST e não cria outro pedido.

## Perguntas prováveis com resposta curta e aprofundada

### “Por que os filtros ficam na URL?”

**Curta:** para compartilhar link e manter refresh, histórico e navegação direta coerentes.

**Aprofundada:** search params tipados alimentam a query key, então URL e resultado identificam a mesma consulta. Alterar filtro volta page para 1 e cria uma entrada de histórico para back/forward.

### “Como você evita que uma resposta antiga ganhe?”

**Curta:** a query key representa parâmetros e Query fornece AbortSignal para Axios.

**Aprofundada:** buscas diferentes ocupam keys distintas; cancelamento chega ao cliente Axios. A UI observa a key atual, não um estado global mutável. `placeholderData` preserva visualmente resultados durante a transição, mas uma falha da nova consulta sem dado válido apresenta erro principal.

### “Por que Query e não useEffect + state?”

**Curta:** cache, concorrência, cancelamento, retries e invalidação de estado remoto já são necessidades do produto.

**Aprofundada:** `useState` ainda é usado para estado local de interface; Query é usado para dados remotos com identidade, lifecycle e reconciliação. Isso evita implementar manualmente cache e deduplicação em cada tela.

### “O que é fonte de verdade para o total?”

**Curta:** quote da API simulada, nunca um total calculado só no browser.

**Aprofundada:** handler lê cart e estado de catálogo/cupom, calcula usando BigInt e retorna strings decimais. Checkout revalida os mesmos fatores antes de criação; se algo mudou, interrompe e pede aceitação explícita.

### “Como a idempotência impede pedido duplicado?”

**Curta:** retry da mesma tentativa envia a mesma key; a API guarda o resultado associado à key e payload.

**Aprofundada:** a UI também bloqueia clique concorrente, mas a garantia final fica no handler/store: replay igual devolve o mesmo pedido; payload diferente conflita. Assim timeout ambíguo não significa gerar uma nova compra.

### “Como você lidaria com um evento fora de ordem?”

**Curta:** o evento carrega versão e identidade; duplicata/versão menor ou igual é descartada.

**Aprofundada:** há versão conhecida no consumidor/cache por recurso, além do `eventId`. Pedidos também validam usuário e transições terminais. Reconnect não tenta reconstruir histórico: invalida as queries e busca snapshot atual via REST.

### “Por que não confiar no Socket.IO para a quote?”

**Curta:** socket notifica; REST revalida a operação financeira.

**Aprofundada:** eventos podem atrasar ou se perder e são adequados a UX rápida, mas checkout precisa de confirmação autoritativa. Um NFT atualizado marca quote como potencialmente stale; a API REST calcula e exige nova confirmação quando muda.

### “Como separou usuários?”

**Curta:** keys e stores são scoped por user/owner; logout/troca limpa cache e socket privado.

**Aprofundada:** queries privadas usam prefixo `private` com identidade. APIs/mock validam owner; pedido não pode ser consultado por outro usuário. Ao mudar sessão, requests/cache e listeners privados são removidos. Em produção, a autorização precisa existir também no servidor real.

### “Qual desvio visual você defenderia?”

**Curta:** há quatro artes originais principais; fixtures adicionais reutilizam fallback, e a fonte exata do Figma não foi identificada.

**Aprofundada:** as referências são screenshots exportadas para comparação, não assets de UI. Emerald Ape, Golden Beat, Neon Vessel e Sage Nomad usam PNGs originais; demais NFTs usam fallback documentado em ADR-004. Alguns layouts móveis de Perfil/Carteiras e Confirmação foram derivados porque não havia frame correspondente. A adaptação mantém hierarquia/tokens móveis aprovados e foi registrada em ADRs.

### “O que faria diferente em produção?”

**Curta:** substituir MSW por backend real, reforçar segurança financeira e operacional e medir novamente no ambiente publicado.

**Aprofundada:** autenticação/cookies seguros e autorização server-side; banco transacional para estoque, quote e idempotência; decimal/units validadas no backend; armazenamento real de avatar; Socket.IO autenticado com replay/recovery; logging/telemetria; CSP e rate limits; dados/contratos de rede reais; testes de concorrência e deployment pipeline. Não afirmaria que digest SHA-256 mock atende armazenamento de senha de produção.

## Três decisões que devo explicar sem ler

1. **BigInt em wei:** ETH é decimal e float binário perde precisão; transformar a string em unidades inteiras permite cálculo exato. Demonstrar em `src/lib/eth-decimal.ts`, ADR-007 e `tests/cart.spec.ts`/`checkout-orders.spec.ts`.
2. **Idempotency key por tentativa lógica:** timeout não revela se o servidor gravou pedido; a mesma chave/payload recupera resultado. Mostrar `src/features/checkout/`, handler de orders e `tests/checkout-orders.spec.ts`; ADR-008.
3. **Socket notifica, REST reconcilia:** versão reduz regressão e REST recupera eventos perdidos após reconnect; quote ainda deve ser revalidada. Mostrar `src/realtime/consume-events.ts`, `realtime-provider.tsx`, `tests/realtime-failures.spec.ts`; ADR-012.

## Trade-offs e “por que você fez assim?”

| Pergunta | Trade-off honesto |
|---|---|
| Por que MSW em vez de fixture direta? | Preserva contrato de rede e exercita Query→Axios→HTTP; custo é incluir worker/binding no build demo e não representar durabilidade/concorrência de servidor real. |
| Por que placeholder data no catálogo? | Evita flicker ao mudar parâmetros; em falha da nova key o estado correto ainda é erro principal, não alegar que o resultado anterior responde à nova busca. |
| Por que cache update em evento, mas refetch no reconnect? | Evento validado dá feedback rápido; reconnect pode perder mensagens e precisa de snapshot REST. |
| Por que endereço visualmente truncado? | Melhor leitura mobile; o accessible name mantém o valor completo e ações continuam disponíveis. |
| Por que performance Lighthouse não atingiu 90? | O README pede medir e justificar desvios. O custo dominante observado foi JS/bootstrap + MSW sob throttling e render delay; não foi retirado o mock obrigatório nem adulterado o audit. |
| Por que upload avatar em data URL? | Escopo de demonstração reproduzível com API mock; para produção usaria object storage e URL assinada. |

## Bugs interessantes e o que aprendi

- `replace: true` em alterações de filtro apagava estados que o usuário esperava recuperar com Back; o teste provou a semântica de histórico e a navegação foi ajustada.
- Regex `+` interpretava quantificador em vez do sinal da URL; o teste passou a comparar `URL.searchParams.get()` semanticamente.
- A mensagem de erro de uma nova query foi confundida com erro de refetch em background; query key e `placeholderData` mostraram que o teste descrevia semântica errada. Cobertura foi separada para cada estado.
- O cenário de teste MSW dava 404 por timing entre navegação e controle do Service Worker; o helper agora espera o sinal de readiness antes do POST.
- Locator `getByLabel('E-mail')` encontrou também newsletter no footer; o teste passou a escopar por formulário/landmark, sem nth arbitrário.
- Testes iniciais exigiam cards reais durante skeleton, embora a regra fosse preservar geometria. O teste agora verifica placeholders, dimensões e conteúdo após a resposta.
- Binding Socket.IO: evento do lado errado não funcionava; a API instalada foi inspecionada e a emissão usou a interface client da binding, sem protocolo manual.
- `lazyRouteComponent` gerou warning ao alternar Suspense em React 19; páginas usam `React.lazy` e boundary explícito.
- O primeiro public smoke após redeploy teve 404 vazio transitório de `/api/cart`; sem alteração funcional, repetição nova passou. Relatar a execução PASS final e mencionar a tentativa transitória se perguntarem sobre o histórico.

## Limitações que devo declarar sem fingir

- Backend, sessão, carteiras, quote, pedido, pagamentos e dados são simulados por MSW/local storage; não há conexão real a blockchain ou wallet extension.
- Hash/explorer do recibo é demonstrativo, não transação pública.
- Quatro NFTs usam arte original do Figma; NFTs adicionais reutilizam assets fallback (ADR-004).
- Fonte exata do Figma não foi identificada; alguns frames mobile não existem e foram derivados (ADRs relevantes).
- Lighthouse Performance ficou abaixo de 90 no batch final, apesar de A11y/BP/SEO passarem; causas e métricas estão em `evidence/lighthouse/analysis.md`.
- Não houve validação de segurança/escala de um backend real, de cadeia pública, de concorrência distribuída ou de conformidade financeira.
- Uma aprovação de suite E2E comprova os casos codificados, não ausência universal de defeitos.

## Glossário rápido

| Termo | Explicação simples |
|---|---|
| Server state | Dados cuja autoridade está fora do componente e que precisam de cache/revalidação. |
| Query key | Identidade estável de uma consulta; parâmetros diferentes devem produzir keys diferentes. |
| Invalidation | Marcar cache como possivelmente desatualizado e permitir refetch. |
| AbortSignal | Sinal cooperativo de cancelamento passado até a requisição. |
| Optimistic update | Mostrar mudança antes da confirmação, guardando snapshot para rollback. |
| MSW | Interceptor de rede de desenvolvimento/teste que responde a requests reais sem backend. |
| Idempotência | Repetir mesma operação lógica sem duplicar efeito. |
| Snapshot | Cópia imutável dos dados relevantes no instante de uma transação. |
| Stale | Cache/quote cuja atualidade já não pode ser garantida. |
| Reconciliation | Comparar estado local com fonte REST autoritativa para recuperar divergências. |
| LCP | Momento em que o maior conteúdo visível principal foi renderizado. |
| CLS | Medida de deslocamentos inesperados de layout. |
| TBT | Tempo agregado em tarefas longas que bloqueiam a thread principal no período medido. |

## Roteiro de estudo priorizado

1. **Sem notas (15 min):** desenhar mapa e narrar catálogo→pedido em uma folha. Anotar cada lacuna.
2. **Código (25 min):** abrir query keys, cliente Axios, handler MSW, `eth-decimal`, criação de order e consumidor Socket. Para cada arquivo, dizer qual responsabilidade tem e qual não tem.
3. **Falhas (20 min):** explicar favorite rollback, timeout-after-create, quote stale, reconnect com evento perdido e isolamento após troca de usuário.
4. **Evidência (15 min):** abrir os Playwright specs que provam cada fluxo e Lighthouse `analysis.md`; distinguir “testado”, “simulado” e “produção real”.
5. **Visual/a11y (10 min):** apontar frames, evidências, adaptação mobile e uma decisão de acessibilidade.
6. **Mock interview (20 min):** responder as perguntas de `study/WEAK_QUESTIONS.md` sem ler. Marcar confiança de 1–5; tudo abaixo de 4 volta ao código.
7. **Demo (7–9 min):** seguir `study/DEMO_SCRIPT.md` e manter a explicação abaixo de 30 segundos por tela.

## Autoavaliação honesta

Este pacote é material de preparação, não prova que o candidato já domina oralmente todos os tópicos. Antes da entrevista, complete os ensaios de `study/WEAK_QUESTIONS.md` sem consultar IA; em especial, explique de memória três decisões, dois trade-offs e um limite de produção.

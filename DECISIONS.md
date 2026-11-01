# Decision Log

Registre aqui decisões técnicas ou de UX que não são óbvias.

Formato:

## ADR-XXX — Título

**Data:**
**Lote:**
**Status:** Proposto | Aceito | Substituído

### Contexto
Qual problema exigiu decisão?

### Opções consideradas
1. ...
2. ...

### Decisão
...

### Por quê
...

### Consequências
...

### Como explicar em entrevista
...

---

## Decisões já conhecidas

### ADR-012 — Socket.IO mockado via binding MSW e reconciliação REST

**Data:** 2026-10-31
**Lote:** 07
**Status:** Aceito

#### Contexto
O challenge exige que atualizações realtime atravessem `socket.io-client`, mantendo os mocks de rede determinísticos e consistentes com REST. A API instalada de `@mswjs/socket.io-binding@0.2.0` é diferente de exemplos antigos: exporta `toSocketIo(connection)` e adapta uma conexão `ws.link(...)`.

#### Decisão
Usar `ws.link(window.location.origin)` com `toSocketIo(connection)` para o mock no namespace/path padrão; importar `socket.io-client` dinamicamente após o bootstrap MSW; manter uma conexão/listeners por sessão e removê-los no teardown. Eventos versionados são aplicados apenas quando mais novos; duplicatas/versões antigas são ignoradas. Reconnect invalida recursos ativos para reconciliação por REST. REST segue autoritativo para quote, disponibilidade e pedido.

#### Por quê
Exercita o cliente Socket.IO real no browser sem substituir o transporte por setters, mantendo o estado simulado único entre handlers HTTP e eventos. A binding instalada trata handshake e protocolo, evitando implementação manual de framing.

#### Consequências
O mock suporta somente namespace padrão e não cobre rooms reais, broadcast distribuído, acks complexos ou attachments binários. Cenários de teste alteram stores MSW persistidas e publicam notificações; pedidos privados são filtrados pela sessão autenticada. Atualização de NFT invalida quote; checkout precisa revalidar via REST e pedir confirmação explícita quando houver mudança.

#### Como explicar em entrevista
Socket.IO informa que um recurso mudou, mas o REST decide qual é o estado atual. Versionamento impede regressão por eventos atrasados; após reconnect, invalido queries ativas porque o cliente pode ter perdido eventos durante a desconexão.

### ADR-009 — Derivação mobile para Perfil e Carteiras

**Data:** 2026-10-31
**Lote:** 06
**Status:** Aceito

#### Contexto
O Figma contém frames desktop para Perfil do Colecionador e Carteiras, mas não define versões mobile. O produto precisa manter as duas rotas utilizáveis em 390/768 px sem inventar campos ou perder ações.

#### Opções consideradas
1. Reduzir a sidebar e os formulários desktop até caberem em mobile.
2. Derivar os fluxos com a linguagem mobile já aprovada: navegação de conta refluída, formulários em uma coluna e carteiras em cartões responsivos.

#### Decisão
Adotar a segunda opção. No mobile, a navegação de conta será uma região compacta e operável por teclado; os formulários passam a uma coluna; cada carteira será cartão com rede, função, ações e endereço quebrável/truncado visualmente, mantendo o endereço integral acessível. Em tablet, o layout transita sem overflow entre o desktop e o mobile.

#### Por quê
Preserva hierarquia e conteúdo do frame desktop, enquanto se alinha à densidade, aos controles e aos espaçamentos das telas mobile aprovadas. Não há frame que sustente uma composição mobile mais específica.

#### Consequências
A composição derivada será comparada com os tokens e padrões mobile existentes, mas não poderá ser chamada de correspondência pixel a pixel a uma referência inexistente. Não serão adicionados campos sem apoio nos contratos e no desafio.

#### Como explicar em entrevista
Onde o Figma não especificou o breakpoint, mantive o conteúdo e reordenei a navegação/formulário para uma coluna, preservando acessibilidade e sem introduzir novos campos de domínio.

### ADR-010 — Store única de carteiras e invariável de principal

**Data:** 2026-10-31
**Lote:** 06
**Status:** Aceito

#### Contexto
O checkout do Lote 05 já consulta carteiras, e o Lote 06 precisa oferecer sua manutenção. Stores independentes fariam o checkout mostrar dados antigos e permitiriam perfis com mais de uma principal.

#### Decisão
Usar `wallets-store` como fonte mock persistida por `userId`, compartilhada pelos handlers de perfil/carteiras e checkout. A operação de promover carteira altera a nova principal e rebaixa a anterior dentro da mesma operação do handler. Identidade/IDs das wallets já existentes no checkout são mantidos.

#### Consequências
Queries de wallets permanecem isoladas por usuário; após mutation, o cache de `checkoutWallets` daquele usuário é invalidado. Toda resposta válida contém exatamente uma wallet `primary`. Endereços são verificados por formato/rede, sem consultar blockchain.

### ADR-011 — Persistência mock de avatar e senha

**Data:** 2026-10-31
**Lote:** 06
**Status:** Aceito

#### Decisão
Avatar de demonstração é validado (PNG/JPEG/WebP e limite de tamanho), convertido em data URL e persistido pelo endpoint MSW de perfil; upload e remoção são requests REST. Mudança de senha compara o digest SHA-256 atual e grava somente o digest da nova senha no estado local mock. O texto da senha fica somente em trânsito durante a chamada e nos campos temporários do formulário.

#### Consequências
Refresh recupera o perfil/avatar pela API; reset restaura os dados demo. A estratégia é local de teste/demonstração e não representa armazenamento de produção ou serviço externo.


### ADR-004 — Substitutos locais para artwork do catálogo

**Data:** 2026-10-30
**Lote:** 02
**Status:** Parcialmente substituído; assets principais originais recebidos

#### Contexto
Na implementação inicial não havia arte original. Depois foram exportados do Figma quatro assets principais: Emerald Ape, Golden Beat, Neon Vessel e Sage Nomad. Screenshots de tela continuam proibidas como assets de interface.

#### Opções consideradas
1. Usar screenshots ou recortes delas, violando as regras de assets.
2. Deixar os cards sem arte, causando grande quebra de composição.
3. Criar artwork de substituição local e explicitamente provisória.

#### Decisão
Usar os PNGs originais recebidos para as identidades correspondentes: Emerald Ape, Golden Beat, Neon Vessel e Sage Nomad. Manter eventuais imagens de fallback apenas para outras fixtures sem asset correspondente, deixando sua condição provisória explícita. Não utilizar screenshots como assets.

#### Por quê
Os arquivos exportados são os assets de origem e correspondem às quatro identidades principais visíveis nas referências. Todas as quatro imagens são 500×500 RGBA; CSS controla crop e proporção sem distorção.

#### Consequências
Os quatro NFTs principais não têm mais diferença de asset. Fixtures adicionais sem arte específica ainda usam imagens disponíveis apenas como fallback visual: Sage Nomad é reutilizado em Cosmic Bloom, Violet Nomad, Sage Afterglow e Generative Mist; Emerald Ape em Sunset Ape e Rare Keeper; Golden Beat em Fast Current, Golden Signal, Golden Hour e Golden Dawn; Neon Vessel em Ivory Baron, Quiet Orbit, Ivory Echo e Silent Voyager. Esses dados são placeholders visuais, não afirmações sobre a arte original das obras. O diretório atual não continha arquivos WebP físicos para remoção; as referências WebP da aplicação foram eliminadas.

#### Como explicar em entrevista
O fallback inicial foi substituído pelos arquivos originais exportados para as quatro identidades principais. As fixtures adicionais continuam determinísticas, mas não fingem possuir arte original própria.

### ADR-005 — Playwright inicia um servidor Vite isolado

**Data:** 2026-10-30
**Lote:** 02
**Status:** Aceito

#### Contexto
O Playwright reutilizava qualquer servidor encontrado na porta padrão. Um processo antigo poderia servir uma versão sem o reset MSW atual e produzir 404 incompatíveis com o código em validação.

#### Decisão
O webServer do Playwright usa porta própria (4180 por padrão, ajustável por `PLAYWRIGHT_PORT`) e `reuseExistingServer: false`, para validar o bundle MSW desta checkout.

#### Consequências
Uma porta ocupada ou um ambiente que proíba bind local falhará antes dos testes, em vez de validar contra um processo alheio. Neste sandbox a execução continua bloqueada por `listen EPERM`.

### ADR-006 — Um contrato MSW para seleção e reset de cenários

**Data:** 2026-10-30
**Lote:** 02
**Status:** Aceito

#### Contexto
O smoke da foundation e os testes de catálogo/detalhe usavam caminhos de reset diferentes. Assim, o smoke não comprovava que a rota usada pelos testes estava registrada no worker.

#### Decisão
Usar somente `POST /api/test-scenarios/reset`, servido pelo handler MSW de cenários. O smoke foundation chama o mesmo contrato por Axios; o helper Playwright chama a mesma rota por HTTP e valida status, content-type, JSON e cenário.

#### Consequências
O bundle de mocks contém uma única rota de reset. A execução Playwright ainda precisa confirmar a interceptação em browser; os builds, por si só, não provam esse comportamento.

### ADR-003 — Aprovação restrita do postinstall do MSW

**Data:** 2026-10-30
**Lote:** 01
**Status:** Aceito

#### Contexto
O npm bloqueou o postinstall de `msw@2.15.0` por não haver autorização na política `allowScripts`. Esse script é responsável por gerar/copiar o worker do MSW quando `msw.workerDirectory` está configurado.

#### Decisão
Após inspecionar o script e confirmar que somente o MSW esperado estava pendente, aprovar exclusivamente `msw@2.15.0` usando `npm install-scripts approve msw@2.15.0`. A autorização por pacote fica registrada no `package.json`.

#### Consequências
O worker oficial pode ser gerado pelo script previsto e a política não concede permissão global a outros pacotes. A listagem posterior do npm não apontou scripts pendentes.

#### Como explicar em entrevista
A exceção foi limitada ao pacote cujo postinstall é necessário, depois de revisar sua ação, sem habilitar scripts indiscriminadamente.

### ADR-002 — Runtime e fundação do marketplace

**Data:** 2026-10-30
**Lote:** 01
**Status:** Aceito

#### Contexto
O checkout recebido continha somente documentos de governança e referências. Era necessário estabelecer uma aplicação executável sem substituir esse material.

#### Opções consideradas
1. Scaffold automático na raiz.
2. Configurar Vite e React manualmente sem sobrescrever os arquivos existentes.

#### Decisão
Usar npm com Node 24.22.1, React/TypeScript e Vite; configurar TanStack Router com uma árvore de rotas tipada em código, TanStack Query como estado remoto, Axios como único cliente REST e MSW na camada de rede. Tailwind CSS v4 e componentes source-based shadcn entram como base visual. Os fluxos de produto ficam para os lotes correspondentes.

#### Por quê
A configuração manual preserva os documentos e referências já presentes e evita scaffolding destrutivo. A composição mantém explícita a passagem de API até mock e UI.

#### Consequências
O worker MSW precisa ser gerado com `npm run mocks:worker`; o smoke técnico fica em rota exclusiva de desenvolvimento. As cores CSS atuais são tokens provisórios derivados das referências. A instalação e validação dependem do acesso ao registry npm.

#### Como explicar em entrevista
Router controla endereço, Query controla estado remoto, Axios centraliza transporte e MSW intercepta a rede. O componente não conhece fixtures.

### ADR-001 — Mobile sem frame específico para Perfil, Carteiras e Confirmação

**Status:** Aceito como restrição de projeto

### Contexto
O README exige funcionamento mobile para Perfil, Carteiras e Confirmação, porém as referências recebidas possuem apenas frames desktop para essas telas.

### Decisão
Derivar o mobile usando:
- espaçamentos;
- densidade;
- cards;
- navegação;
- tipografia;
- formulários;
- botões;
observados nos frames mobile existentes.

### Consequência
Qualquer adaptação relevante deverá ser documentada e validada em 390 px e 414 px.

### Como explicar em entrevista
O comportamento foi preservado e a adaptação visual seguiu o sistema visual existente, em vez de inventar uma nova linguagem.

### ADR-005 — Readiness MSW para reset de cenários no browser

**Data:** 2026-10-30
**Lote:** 02
**Status:** Sincronização mantida; não comprovada como causa do 404

#### Contexto
O helper E2E envia o reset de cenário por fetch, enquanto o smoke da foundation usa Axios por interação da UI. Um sinal de readiness foi adicionado após uma análise de timing anterior, mas a execução local posterior continuou retornando 404.

#### Decisão
Esperar `worker.start({ waitUntilReady: true })` no bootstrap e publicar `data-msw-ready=true` em `html` no ambiente de desenvolvimento depois que a inicialização terminar. O helper E2E aguarda esse sinal e só então faz `POST /api/test-scenarios/reset` no contexto da página.

#### Consequências
O helper aguarda o bootstrap antes do fetch e não usa atraso fixo ou `page.request`. Essa sincronização é mantida como garantia de inicialização, mas não é tratada como explicação ou solução do 404. A origem do 404 segue aberta: comparação estática não encontrou diferença concreta de path/import/scope; próxima execução deve comparar registros e responses reais.

### ADR-006 — Densidade default do catálogo visual

**Data:** 2026-10-30
**Lote:** 02
**Status:** Aceito; validação visual final pendente

#### Contexto
O frame Home Desktop apresenta quatro linhas de três NFTs e o frame mobile apresenta uma grade de duas colunas, sem contador acima do grid. O catálogo inicial da implementação retornava nove itens, deixando uma linha ausente no estado default desktop.

#### Decisão
Usar 12 itens por página no contrato/query inicial e remover o contador “19 obras” da composição do catálogo.

#### Consequências
O estado default tem geometria mais próxima do Figma e mantém múltiplas páginas a partir das fixtures atuais. Testes E2E foram atualizados para 12 itens. As capturas pós-ajuste ainda precisam ser comparadas em browser.

### ADR-007 — Sessão mockada persistente e isolamento de favoritos

**Data:** 2026-10-31
**Lote:** 03
**Status:** Aceito

#### Contexto
Login, sessão após refresh, dois usuários e favoritos persistentes precisam funcionar sem backend privado. O mock deve permitir expiração determinística e não salvar senhas em texto claro.

#### Decisão
Guardar estado do backend simulado (contas, sessões e favoritos por userId) em uma chave `localStorage` controlada pelos handlers MSW. O cliente mantém somente o token fictício de sessão, envia-o via Bearer pelo Axios e recupera a sessão por `GET /api/auth/session`. As contas demo mantêm um digest SHA-256 determinístico e senhas de cadastro são transformadas em digest antes de persistir. Query keys privadas começam com `private`; logout, expiração e troca cancelam requests e removem esse prefixo. Favoritos usam optimistic update com snapshot para rollback.

#### Consequências
O reset MSW restaura contas demo, sessões e favoritos. Tokens e dados de mock não são credenciais de produção; a estratégia serve à simulação no browser. O contrato permite acrescentar merge do carrinho visitante sem apagar o namespace público/visitante, que será implementado no lote de carrinho.


### ADR-007 — Precisão ETH e merge de carrinho visitante

**Data:** 2026-10-31
**Lote:** 04
**Status:** Aceito

#### Contexto
O carrinho e a cotação precisam calcular valores sem erro de ponto flutuante, e o carrinho visitante deve sobreviver à autenticação sem perder linhas ou misturar dados privados entre usuários.

#### Opções consideradas
1. Usar `number`/ponto flutuante para os valores ETH.
2. Adicionar uma biblioteca decimal para o mock.
3. Representar ETH como inteiros em wei (`bigint`) no cálculo interno, mantendo transporte e domínio como strings decimais.

#### Decisão
A API mock calcula valores em escala fixa de 18 casas com `bigint`; contratos REST continuam serializando ETH como strings. O navegador mantém um identificador guest estável, e após login/signup o handler mescla por par NFT/edição, soma quantidades e limita ao menor entre disponibilidade e máximo por pedido. O cart guest é removido somente depois do merge bem-sucedido; carrinhos autenticados são indexados por userId.

#### Por quê
A escala de 18 casas é exata, não exige dependência adicional e corresponde à unidade wei; a regra de merge é determinística e evita duplicação da mesma edição.

#### Consequências
Handlers MSW validam estoque/quantidade e persistem dados de demonstração localmente; o frontend nunca calcula o total final. Reset de cenário limpa o estado de carrinho. A camada de carrinho mantém identidade e versões estáveis para invalidação/reconciliação futura, sem implementar Socket.IO neste lote.

#### Como explicar em entrevista
ETH trafega como decimal string; o mock converte para wei com BigInt, aplica operações inteiras e retorna strings. No login, guest e user são combinados por identidade de edição e limitados ao estoque, preservando o carrinho privado por usuário.

### ADR-008 — Idempotência, recuperação REST e snapshot de recibo

**Data:** 2026-10-31
**Lote:** 05
**Status:** Aceito

#### Contexto
Checkout precisa suportar clique duplicado, falha de transporte após criação, reconsulta de pedido e recibo estável sem backend privado. O estado confirmado não pode depender de dados atuais do catálogo.

#### Decisão
O cliente gera uma `Idempotency-Key` por tentativa lógica e a guarda em `sessionStorage` até o resultado conclusivo. Timeout/retry reutiliza a chave; uma tentativa nova só recebe chave nova depois do fluxo anterior terminar. O handler MSW limita o escopo da chave ao usuário e guarda a serialização canônica do payload: replay igual retorna o pedido existente e payload diferente responde conflito.

Pedidos seguem `pending → confirmed | rejected`; `confirmed` e `rejected` são terminais. Até o Lote 07, reconsulta/transição de demonstração ocorre somente por REST. Na confirmação, o store grava cópia imutável de itens, preços/quote, wallet, network, referência e horário no receipt. A limpeza do carrinho usa as quantidades do pedido confirmado.

#### Consequências
O fluxo não depende de atualização otimista para afirmar sucesso. Se a resposta se perde após a criação, a mesma chave recupera o mesmo pedido. Catálogo pode mudar depois sem reescrever o recibo. O domínio ainda não conecta blockchain nem emite eventos Socket.IO.
### ADR-010 — Code splitting por rota e auditoria de demonstração

**Data:** 2026-10-31
**Lote:** 08
**Status:** Aceito

#### Contexto
O build acumulou um chunk de entrada acima de 500 kB. A entrada inicial importava as páginas completas do marketplace, embora a maioria das rotas não fosse necessária para a primeira tela. As auditorias Lighthouse também precisam representar a entrega funcional, incluindo MSW e Socket.IO mockados, sem simplificações específicas para pontuação.

#### Decisão
Usar `React.lazy` para as páginas de feature e um `Suspense` explícito dentro do shell da rota, mantendo shell, guards e not-found no bootstrap. O experimento com `lazyRouteComponent` foi descartado após o React 19 registrar warning em renders suspensas/resolvidas. Criar `build:demo` para executar TypeScript e Vite com `VITE_ENABLE_MOCKS=true`; `lighthouse` constrói esse bundle e audita Home e detalhe, nos perfis mobile/desktop, três vezes cada. O runner host aceita somente o target fixo `lighthouse`, sem argumentos de shell recebidos do arquivo request. Relatórios individuais e resumo com mediana/LCP/CLS/TBT ficam em `evidence/lighthouse/`.

#### Medição inicial
Build normal antes: entry 514,16 kB / gzip 158,66 kB. Depois: entry 252,77 kB / gzip 79,27 kB. Build de demonstração: entry 316,10 kB e chunk do interceptor MSW 336,43 kB, ambos separados por responsabilidade. Os números não implicam resultado Lighthouse; scores ainda dependem de execução auditável no browser host.

#### Consequências
Rotas não visitadas não carregam seus módulos de feature no bundle inicial. O build de demo permanece completo e usa handlers/realtime reais do mock. As medições devem ser tratadas como válidas somente após as 12 auditorias, summary completo e revisão dos alvos/condições.

### ADR-011 — Otimização de arte e relatório Lighthouse com stack demo completa

**Data:** 2026-10-31
**Lote:** 08
**Status:** Aceito

#### Contexto
As imagens principais originais em PNG tinham 413–439 kB cada. A primeira auditoria também apontou um atributo ARIA inválido e sliders menores que 24 px. A demo precisa continuar carregando os mocks REST e o binding Socket.IO real durante a auditoria.

#### Decisão
Manter os PNG originais exportados do Figma como fonte e servir derivados WebP com qualidade 88 em `public/assets/nfts/optimized/`. Uma inspeção lado a lado dos quatro originais e derivados não revelou diferença perceptível no tamanho de exibição do produto; os derivados ocupam 32–41 kB cada, contra 262–279 kB para os WebP lossless anteriores. Pré-carregar a arte Emerald Ape, comum à Home e ao detalhe auditado. Corrigir a semântica decorativa dos pontos do hero e dar 24 px de área de interação aos sliders de preço. A conexão real-time agora inicia após o primeiro paint de conteúdo, reduzindo concorrência de trabalho de rede/CPU no bootstrap sem substituir ou atrasar requests REST/MSW.

Manter Lighthouse em `throttlingMethod: simulate`, no preview do build demo, com três medições por página/perfil e todas as funcionalidades da entrega habilitadas. A inicialização MSW continua anterior à montagem React para impedir requests iniciais fora do worker. Um experimento que montava React antes da inicialização (com gate no Axios) foi revertido porque elevou LCP simulado de aproximadamente 3,6 s para cerca de 5 s.

#### Evidência e consequência
A rodada final de polish, Request `1793552324-575891-33`, completou as 12 medições no preview otimizado com mocks. Medianas de Performance Home mobile/desktop e detalhe mobile/desktop: 75/50/78/52; Accessibility 100/96; Best Practices e SEO 100; LCP 3520.92–3919.36 ms; CLS 0–0.07; TBT 529.5–768 ms. LCP, breakdown, boot-up, long tasks, unused JavaScript, imagens e fontes estão analisados em `evidence/lighthouse/analysis.md`; os 12 HTML/JSON finais e summaries ficam em `evidence/lighthouse/batch-2026-11-01T16-58-48-327Z/`. As metas abaixo de Performance são justificadas e o resultado segue a interpretação do README. Batches anteriores e duplicatas raiz foram removidos como superseded.

Os comandos Vercel e de atualização das baselines foram adicionados à whitelist fixa do Local Validation Runner; nenhum argumento de shell vem do arquivo request.

### ADR-012 — Navegação sem destinos falsos e carteira manual do checkout

**Data:** 2026-11-01
**Lote:** Final polish
**Status:** Aceito

#### Contexto
Na revisão manual, a navegação de retorno nas páginas de conta mobile estava ausente; ações de navegação e redes sociais apontavam para destinos indisponíveis; e o checkout permitia que dois controles selecionassem carteiras diferentes. O checkbox “Usar outra carteira?” não participava da conexão nem do pedido.

#### Decisão
Perfil e carteiras oferecem retorno ao último contexto seguro visitado pelo Router, com Home como fallback. Anchors apontam a seções existentes; destinos auxiliares fora do escopo e redes sociais sem URL fornecida preservam sua representação, mas respondem com um status acessível sem criar URLs fictícias. No checkout, cartões de carteiras salvas são o seletor autoritativo; os campos espelhados do formulário são somente leitura. O modo manual coleta provider, rede e endereço, valida na API mockada, permite conectar para a tentativa atual e nunca persiste a carteira em `/api/wallets`. Desativá-lo desconecta essa carteira e retorna à seleção salva.

#### Consequências
Os pedidos e recibos preservam a carteira efetivamente conectada no contrato REST; quote, revalidação e idempotência não mudam. A interface não promete uma área de coleção pessoal de NFTs possuídos, que permanece uma possível extensão futura.

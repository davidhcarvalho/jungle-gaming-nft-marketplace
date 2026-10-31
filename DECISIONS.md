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

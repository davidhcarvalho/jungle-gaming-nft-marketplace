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

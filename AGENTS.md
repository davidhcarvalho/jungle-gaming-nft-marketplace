# AGENTS.md — Contrato Operacional do Agente

Este arquivo é a primeira leitura obrigatória para qualquer agente trabalhando neste repositório.

## 1. Missão

Construir o NFT Marketplace do desafio da Jungle Gaming com prioridade simultânea em:

1. aderência integral ao `README.md`;
2. fidelidade visual ao Figma;
3. comportamento funcional real;
4. responsividade;
5. testabilidade;
6. acessibilidade;
7. performance;
8. explicabilidade técnica.

Não trate este projeto como um protótipo visual. Os fluxos principais precisam funcionar através das camadas exigidas pelo desafio.

## 2. Fontes de verdade

Leia e respeite nesta ordem:

1. `challenge/README_ORIGINAL.md`
2. `challenge/REQUIREMENTS_MATRIX.md`
3. `challenge/VISUAL_INVENTORY.md`
4. `quality/GLOBAL_ACCEPTANCE_CRITERIA.md`
5. `PROGRESS.md`
6. arquivo do lote atual em `lots/`
7. documentos de arquitetura em `architecture/`

As referências visuais estão em:
- `design-reference/Desktop/`
- `design-reference/Mobile/`

## 3. Stack obrigatória

Uso efetivo obrigatório de:

- React
- TypeScript
- TanStack Router
- TanStack Query
- Axios
- REST APIs
- Socket.IO / `socket.io-client`
- Tailwind CSS
- shadcn/ui
- MSW
- Playwright
- Lighthouse

Não substituir tecnologias obrigatórias.

## 4. Restrições eliminatórias

Nunca considerar a entrega válida se ocorrer qualquer item abaixo:

- stack obrigatória ausente ou apenas nominal;
- fluxo principal apenas visual;
- compra confirmada sem resposta da simulação;
- dados privados vazando entre usuários;
- eventos de tempo real disparados diretamente na UI/cache sem `socket.io-client`;
- testes E2E não executáveis.

Consulte também `challenge/ELIMINATION_GATES.md`.

## 5. Fluxo obrigatório de trabalho

Para cada lote:

### A. Inspect
- leia o lote;
- leia os arquivos relacionados;
- inspecione o código existente;
- inspecione as imagens de referência daquele fluxo;
- identifique dependências e riscos.

### B. Plan
Antes de editar, registre em `PROGRESS.md`:
- lote em andamento;
- arquivos esperados;
- critérios de aceite;
- riscos encontrados.

### C. Implement
- faça mudanças pequenas e coerentes;
- preserve arquitetura boa já existente;
- evite reescrever o projeto sem necessidade;
- não implemente requisito futuro fora do lote, salvo infraestrutura mínima inevitável.

### D. Verify
Execute as verificações do lote:
- typecheck;
- lint;
- build;
- testes relevantes;
- verificação visual;
- viewport exigida;
- console/rede quando aplicável.

### E. Evidence
Registre em `PROGRESS.md`:
- comandos executados;
- resultado;
- arquivos alterados;
- testes adicionados;
- screenshots/evidências geradas;
- desvios conhecidos.

### F. Gate
Somente marque o lote como `[x]` quando **todos** os critérios de aceite do arquivo do lote estiverem satisfeitos.

## 6. Regra de qualidade visual

Antes de implementar uma tela:
1. abra a referência correspondente;
2. identifique hierarquia, largura, grid, spacing, tipografia, imagem, borda, radius e estados;
3. implemente;
4. capture a aplicação no mesmo viewport;
5. compare;
6. corrija diferenças perceptíveis.

Não “melhore” o design por preferência própria.

Não preservar visual padrão do shadcn quando divergir do Figma.

Valores arbitrários do Tailwind são permitidos quando necessários para fidelidade.

## 7. Responsividade

Validar no mínimo:
- 390 px
- 768 px
- 1440 px

As referências mobile exportadas possuem 828 px de largura em 2x, equivalentes a aproximadamente 414 CSS px. Elas devem orientar o comportamento mobile, mas o layout também deve funcionar corretamente em 390 px.

Não criar somente dois layouts desconectados. A responsividade deve ser coerente entre tamanhos.

## 8. Estado e dados

- TanStack Query para estado remoto, queries e mutations.
- TanStack Router para rotas, search params e proteção.
- Axios para chamadas REST.
- Query keys privadas devem ser isoladas por usuário.
- Logout/troca de usuário devem limpar cache privado e subscriptions.
- Pelo menos uma mutation otimista real com rollback.
- Respostas obsoletas devem ser canceladas ou descartadas.

## 9. ETH

- ETH trafega como string decimal.
- Não usar `number` para cálculos financeiros.
- Quantidade é inteira.
- Cotação da API mockada é a fonte final de verdade do checkout.

## 10. MSW

Mocks devem existir na camada de rede.

Proibido colocar respostas fictícias ou “if mock” em componentes/hooks de negócio.

MSW precisa manter estado consistente entre:
- catálogo;
- favoritos;
- carrinho;
- perfil;
- carteiras;
- pedidos.

Cenários precisam ser determinísticos e resetáveis.

## 11. Socket.IO

Obrigatório exercitar `socket.io-client`.

Eventos mínimos:
- `nft.updated`
- `order.updated`

Eventos carregam identidade estável e versão.

Cliente deve:
- ignorar duplicatas;
- ignorar eventos antigos;
- reconciliar por REST após reconexão;
- liberar listeners;
- impedir atualização por sessão anterior.

## 12. Segurança e privacidade de sessão

- não armazenar senhas em claro;
- não misturar dados entre usuários;
- preservar contexto de retomada após sessão expirada;
- remover dados privados e subscriptions em logout/troca de usuário.

## 13. Código explicável

O candidato precisará defender o projeto.

Prefira:
- nomes claros;
- domínio explícito;
- funções pequenas;
- abstrações justificáveis;
- regras localizáveis;
- comentários apenas para decisões não óbvias.

Evite:
- overengineering;
- frameworks internos;
- metaprogramação desnecessária;
- generalizações que escondem fluxo de negócio.

Registre decisões relevantes em `DECISIONS.md`.

## 14. Handoff

Ao encerrar uma sessão ou trocar de agente:
- atualize `PROGRESS.md`;
- atualize `HANDOFF.md`;
- registre bloqueios em `OPEN_QUESTIONS.md`;
- registre decisões em `DECISIONS.md`.

Nenhum agente deve começar por suposição quando o estado está documentado.

## 15. Regra de parada

Se uma dependência necessária não puder ser inferida com segurança:
- não invente;
- registre a lacuna;
- implemente somente o que é seguro;
- sinalize o bloqueio em `OPEN_QUESTIONS.md`.

Não pare por questões cosméticas que possam ser derivadas das referências.

## 16. Validação local fora do sandbox

Se testes de browser forem bloqueados pelo sandbox (`listen EPERM`), use primeiro o **Local Validation Runner** documentado em `AI_LOCAL_VALIDATION.md`, quando estiver disponível, antes de solicitar execução manual ao usuário. Não inicie o runner em background a partir do sandbox; solicite execuções pelo arquivo de protocolo e inspecione o resultado novo antes de continuar.

# Matriz de Rastreabilidade de Requisitos

Legenda:
- **Fonte:** seção do README.
- **Lote:** onde deve ser implementado/fechado.
- **Evidência:** forma mínima de comprovação.

| ID | Requisito | Lote | Evidência |
|---|---|---:|---|
| R01 | React + TypeScript | 01 | build/typecheck |
| R02 | TanStack Router efetivo | 01–03 | rotas + search params + guards |
| R03 | TanStack Query efetivo | 01–07 | queries/mutations/cache |
| R04 | Axios para REST | 01 | cliente central + requests |
| R05 | REST APIs simuladas | 01–07 | handlers MSW |
| R06 | Socket.IO real no cliente | 07 | teste real-time |
| R07 | Tailwind CSS | 01–08 | UI |
| R08 | shadcn/ui adaptado | 01–08 | componentes |
| R09 | MSW | 01–07 | handlers/cenários |
| R10 | Playwright | 02–08 | suíte E2E |
| R11 | Lighthouse | 08 | relatórios |
| R12 | Início: destaque/catálogo | 02 | E2E + screenshot |
| R13 | Busca | 02 | URL + API + E2E |
| R14 | Filtros combináveis | 02 | E2E |
| R15 | Ordenação | 02 | E2E |
| R16 | Paginação | 02 | URL + E2E |
| R17 | Estado de catálogo na URL | 02 | back/forward/refresh |
| R18 | Filtro reinicia paginação | 02 | E2E |
| R19 | Respostas fora de ordem | 02/07 | cenário MSW |
| R20 | Detalhe por acesso direto | 02 | E2E |
| R21 | NFT inexistente | 02 | 404 UI |
| R22 | Edição indisponível | 02 | cenário |
| R23 | Limite de quantidade | 02/04 | teste |
| R24 | Favoritos persistentes por usuário | 03 | mutation + refresh |
| R25 | Atualização otimista + rollback | 03 | favoritos sugerido |
| R26 | Carrinho adicionar/alterar/remover | 04 | E2E |
| R27 | Carrinho respeita estoque/edição | 04/07 | teste |
| R28 | Carrinho após refresh | 04 | E2E |
| R29 | Carrinho visitante preservado após login | 03/04 | E2E |
| R30 | Cupom aplicar/remover | 04 | E2E |
| R31 | Cupom inválido/expirado | 04/07 | cenário |
| R32 | Subtotal/desconto/taxa/total da API | 04/05 | teste |
| R33 | Mudança de preço/disponibilidade no carrinho | 07 | socket E2E |
| R34 | ETH como string decimal | 01–05 | types/tests |
| R35 | Checkout valida campos | 05 | E2E |
| R36 | Seleção carteira/rede | 05/06 | E2E |
| R37 | Conexão/recusa/desconexão simuladas | 05/07 | cenários |
| R38 | Revalidar cotação antes de compra | 05/07 | E2E |
| R39 | Mudança exige nova confirmação | 05/07 | E2E |
| R40 | Idempotência do pedido | 05 | teste |
| R41 | Mesmo idempotency key + payload diferente = conflito | 05/07 | API test |
| R42 | Pending/confirmed/rejected | 05/07 | E2E |
| R43 | Recuperação após refresh/reconexão | 05/07 | E2E |
| R44 | Confirmação somente se confirmed | 05 | E2E |
| R45 | Falha preserva carrinho | 05 | E2E |
| R46 | Sucesso remove apenas comprado | 05 | E2E |
| R47 | Recibo é snapshot | 05 | teste |
| R48 | Login/cadastro/logout/sessão | 03 | E2E |
| R49 | Sessão recupera após refresh | 03 | E2E |
| R50 | Expiração preserva contexto | 03/05 | E2E |
| R51 | Logout/troca limpa cache privado | 03/07 | E2E |
| R52 | Formulários com erros API | 03/06 | E2E |
| R53 | Perfil persistente | 06 | E2E |
| R54 | Avatar | 06 | E2E |
| R55 | Alteração de senha | 06 | E2E |
| R56 | Carteiras CRUD mínimo | 06 | E2E |
| R57 | Estados loading/empty/error/success/background | 01–08 | UI/testes |
| R58 | Cancelar/descartar resposta obsoleta | 02 | teste |
| R59 | Isolamento por usuário e params | 01–07 | query keys/E2E |
| R60 | Rota inexistente | 01 | E2E |
| R61 | MSW na rede, não na UI | 01–07 | revisão |
| R62 | Estado mock consistente | 01–07 | E2E |
| R63 | Reset determinístico | 01 | helper/test |
| R64 | Pelo menos 2 usuários | 03 | fixture |
| R65 | Latência variável/timeouts/offline/4xx/5xx | 07 | cenários |
| R66 | `nft.updated` | 07 | socket test |
| R67 | `order.updated` | 07 | socket test |
| R68 | Evento tem identidade + versão | 07 | types/tests |
| R69 | Ignorar duplicatas/eventos antigos | 07 | E2E |
| R70 | Reconciliar REST após reconnect | 07 | E2E |
| R71 | Liberar listeners/subscriptions | 07 | teste/revisão |
| R72 | Desktop/tablet/mobile | 02–08 | 390/768/1440 |
| R73 | Skeleton shimmer catálogo | 02 | screenshot/test |
| R74 | Skeleton shimmer detalhe | 02 | screenshot/test |
| R75 | Skeleton shimmer resumo carrinho | 04 | screenshot/test |
| R76 | Respeitar reduced motion | 02/04 | CSS/teste |
| R77 | Teclado + foco visível | 02–08 | Playwright |
| R78 | Focus management dialogs/drawers | 02–08 | Playwright |
| R79 | Semântica/labels/erros associados | 03–06 | axe/manual |
| R80 | Alt text relevante | 02–08 | revisão |
| R81 | Estados não apenas por cor | 02–08 | revisão |
| R82 | Feedback acessível mutations/realtime | 03–07 | aria-live/toast |
| R83 | Sem overflow horizontal | 02–08 | 390/768/1440 |
| R84 | E2E catálogo | 02 | Playwright |
| R85 | E2E detalhe/not found | 02 | Playwright |
| R86 | E2E auth/sessão | 03 | Playwright |
| R87 | E2E favoritos rollback | 03 | Playwright |
| R88 | E2E carrinho | 04 | Playwright |
| R89 | E2E compra completa | 05 | Playwright |
| R90 | E2E pagamento falha/idempotência/timeout | 05/07 | Playwright |
| R91 | E2E perfil/avatar/senha/carteiras | 06 | Playwright |
| R92 | E2E mudança via Socket.IO | 07 | Playwright |
| R93 | E2E duplicados/antigos/reconnect | 07 | Playwright |
| R94 | E2E teclado/foco/form | 08 | Playwright |
| R95 | E2E skeleton/falha/retry | 08 | Playwright |
| R96 | Visual regression Home | 08 | baseline |
| R97 | Visual regression Detalhe | 08 | baseline |
| R98 | Visual regression Carrinho | 08 | baseline |
| R99 | Visual regression Pagamento | 08 | baseline |
| R100 | Lighthouse Home mobile/desktop | 08 | relatórios |
| R101 | Lighthouse Detalhe mobile/desktop | 08 | relatórios |
| R102 | 3 execuções + mediana | 08 | relatório |
| R103 | Performance ≥90 | 08 | Lighthouse |
| R104 | Accessibility ≥95 | 08 | Lighthouse |
| R105 | Best Practices ≥95 | 08 | Lighthouse |
| R106 | SEO ≥90 | 08 | Lighthouse |
| R107 | LCP/CLS/TBT registrados | 08 | relatório |
| R108 | Deploy público obrigatório | 08 | URL |
| R109 | Refresh/deep link no deploy | 08 | teste produção |
| R110 | README da solução completo | 08 | revisão |
| R111 | ARCHITECTURE.md | 08 | revisão |
| R112 | Checkout limpo reproduzível | 08 | instalação limpa |

## Uso

Ao concluir cada lote, filtre mentalmente/por busca os requisitos daquele lote e registre em `PROGRESS.md` quais evidências os cobrem.

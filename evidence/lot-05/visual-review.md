# Lote 05 — revisão visual

Revisão feita após comparação direta das capturas Playwright com os frames originais, sem usar screenshots como interface.

## Referências e capturas

| Tela | Referência | Captura revisada |
|---|---|---|
| Pagamento mobile | `design-reference/Mobile/Pagamento.png` (828×1792; base ~414×896 CSS) | `checkout-mobile-390-review.png` (390×844) |
| Pagamento desktop | `design-reference/Desktop/Pagamento.png` (2880×3314; base ~1440×1657 CSS) | `checkout-desktop-1440-review.png` (1440×1595) |
| Confirmação desktop | `design-reference/Desktop/Confirmação de Pedido.png` (2880×3314; base ~1440×1657 CSS) | `confirmation-desktop-1440-review.png` (1440×1058) |
| Confirmação mobile derivada | Não há frame mobile específico | `confirmation-mobile-390-review.png` (390×867) |

## Revisão e correções aplicadas

- Pagamento mobile mantém cabeçalho compacto, carteiras empilhadas, rede, total e CTA fixo inferior. A composição evita campos de colecionador que não aparecem no frame mobile.
- Pagamento desktop mantém formulário de colecionador à esquerda, resumo/carteiras à direita e footer global. Foram retirados o heading/painel adicional do formulário, ajustada a largura do conteúdo e alinhados rótulos obrigatórios para aproximar o frame.
- A área mobile foi ajustada para exibir o total após a seleção de carteira/rede; estados positivos duplicados foram removidos. O CTA permanece alcançável no rodapé.
- Confirmação desktop usa cartão central com metadados, itens, valores, referência e ação simulada. O card e sua largura/ordem visual foram ajustados após a primeira comparação.
- Confirmação mobile deriva essa hierarquia em uma coluna; metadados e hash quebram sem overflow. O recibo apresenta subtotal, desconto, taxa e total.
- A captura de confirmação agora espera a UI mostrar pedido `confirmed`; não registra estado `pending` como sucesso.

## Diferenças restantes observadas

- O frame de pagamento mostra três NFTs e conectores de carteira; as capturas usam o carrinho determinístico de um item e as carteiras cadastradas na sessão. A estrutura permite múltiplos itens e mantém escolha de wallet/rede via API.
- O recibo usa um símbolo de confirmação tipográfico em vez da ilustração de envelope “Thank You” do Figma. Os dados e a hierarquia do recibo permanecem presentes.
- O frame desktop de confirmação tem uma área externa escura maior por causa da altura da prancheta; a captura da aplicação termina após o conteúdo real, sem acrescentar altura vazia artificial.
- A referência contém transaction reference curta; a captura apresenta o identificador simulado completo, com quebra de linha para preservar leitura sem overflow.
- Os frames de referência exibem valores de exemplo; as capturas mostram a quote autoritativa da fixture atual.

Não há overflow horizontal nas larguras E2E 390, 768 e 1440. As capturas tablet não são requisito visual pois não existe frame tablet específico; a geometria funcional foi testada nesse viewport.

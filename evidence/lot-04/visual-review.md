# Revisão visual — Lote 04

Referências abertas individualmente: `design-reference/Desktop/Carrinho de NFTs.png` (2880×3508 px; 1440×1754 CSS px) e `design-reference/Mobile/Carrinho de NFTs.png` (828×1792 px; 414×896 CSS px). Comparação feita com as capturas Playwright em `evidence/lot-04/`.

## Carrinho mobile

- Capturas finais: `cart-mobile-390-review.png` (390×973) e `cart-mobile-414-review.png` (414×978).
- A composição preserva o título central e botão de voltar, quatro linhas em cartões, arte quadrada à esquerda, nome/edição/preço, controles de quantidade e remoção, painel arredondado de cotação e CTA largo abaixo dos itens. Em 390 e 414 px não há overflow horizontal.
- A revisão apontou que o label visível do cupom e a separação entre campo e botão destoavam do controle único do frame. O label passou a ficar visualmente oculto apenas no mobile, mantendo o nome acessível; campo e botão agora compartilham a borda/cápsula como na referência.
- Diferença de conteúdo mensurável: a referência mostra subtotal de `8.92 ETH`, mas as linhas/quantidades exibidas somam `8.14 ETH`. O app mantém `8.14 ETH`, coerente com os dados fixos e com a quote authoritative do mock; não alteramos valores apenas para reproduzir uma soma inconsistente.

## Carrinho desktop

- Captura final: `cart-desktop-1440-review.png` (1440×1668).
- A estrutura de duas colunas, cabeçalho/tabela, três linhas, quantidades de referência (2/6/9), painel de cotação, recomendações de cinco cards e footer correspondem à hierarquia do frame. Subtotal, taxa e total são consistentes com as linhas mostradas (`26.83`, `0.016` e `26.846 ETH`).
- Campo promocional e botão são contíguos, alinhados no mesmo controle. A proporção da arte é preservada.

## Diferenças conhecidas

- A fonte exata do Figma ainda não foi identificada; permanece a alternativa monoespaçada já usada pelo projeto.
- Recomendações para NFTs sem PNG próprio usam os fallbacks documentados em ADR-004. Não foram usados screenshots como assets.
- A discrepância de subtotal do frame mobile acima fica subordinada à cotação coerente com os valores de domínio/API.

Os screenshots foram gerados novamente pelo Playwright e ficam isolados em `evidence/lot-04/`; `evidence/lot-01/` e os arquivos visuais aprovados dos Lotes 02/03 foram preservados.

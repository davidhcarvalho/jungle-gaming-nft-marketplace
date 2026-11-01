# Lote 07 — revisão visual de estados realtime

Não há frames Figma próprios para notificações Socket.IO. Comparei as capturas com a linguagem aprovada do Carrinho de NFTs (Lote 04), do Pagamento (Lote 05) e do recibo de confirmação.

## Evidências

- `cart-price-updated-mobile-390-review.png`
- `cart-price-updated-desktop-1440-review.png`
- `order-confirmed-mobile-390-review.png`
- `order-rejected-desktop-1440-review.png`

## Revisão

- O aviso no carrinho usa contorno/fundo escuros e destaque âmbar coerente com feedback e CTA existentes; texto legível e `role="status"` com anúncio `aria-live="polite"`. Preço unitário, subtotal e total refletem a resposta REST/MSW após o evento.
- Mobile mantém fluxo em coluna e quantidade/preço legíveis; captura contém uma linha porque o cenário realtime prepara um NFT, então não é uma reprodução do estado de quatro itens do frame original do carrinho. O escopo visual desta evidência é o feedback realtime e ausência de overflow.
- Desktop mantém a grade do carrinho, painel de quote e recomendações; aviso fica acima dos itens, sem deslocar ou cobrir controles.
- A confirmação mobile usa a hierarquia do recibo já aprovada no Lote 05. O pedido só é mostrado como confirmado após `order.updated` com estado terminal confirmed. A recusa desktop reutiliza o painel e os links da linguagem de recibo, com mensagem explícita de preservação dos itens.
- As quatro capturas são de estado/rota da aplicação geradas pelo Playwright; screenshots de referência não são usados como assets.

## Diferenças conhecidas

- Os estados de preço/estoque e recusa não possuem referência Figma específica; a apresentação deriva dos componentes já aprovados.
- O conjunto de imagens de catálogo para obras sem arte própria continua usando os fallbacks provisórios documentados em ADR-004; o estado demonstrado usa o Emerald Ape original.

# Plano de Rotas

A nomenclatura final pode se ajustar ao projeto, mantendo comportamento.

## Rotas públicas

- `/`
  - Início / catálogo
- `/nfts/$nftId`
  - detalhe
- `/login`
- `/signup`

## Rotas protegidas

- `/checkout`
- `/orders/$orderId`
- `/profile`
- `/wallets`

## Carrinho

Pode ser rota `/cart` ou drawer/route conforme implementação visual. A referência desktop sugere página completa e mobile também possui tela própria; portanto rota dedicada é preferível.

## Search params do catálogo

Devem refletir filtros reais:

```text
q
collection
category
priceMin
priceMax
sort
page
```

Não criar params sem correspondência funcional.

## Regras

- refresh mantém estado;
- back/forward restaura estado;
- mudança de filtro reseta `page`;
- deep link para NFT funciona;
- rota privada preserva destino anterior;
- 404 de rota é tratada;
- 404 de recurso é diferente de 404 de rota.

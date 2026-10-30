# Estado, Cache e Tempo Real

## TanStack Query

### Query keys

Exemplos conceituais:

```ts
['nfts', searchParams]
['nft', nftId]
['favorites', userId]
['cart', userIdOrGuestId]
['profile', userId]
['wallets', userId]
['order', userId, orderId]
```

Não copiar cegamente; ajustar à implementação.

## Sessão

Ao trocar/logout:
- cancelar queries privadas em voo;
- remover cache privado;
- encerrar listeners;
- remover contexto sensível;
- manter apenas estado permitido do visitante.

## Carrinho visitante → usuário

O desafio exige preservar itens do visitante ao autenticar.

Definir e testar estratégia de merge:
- evitar duplicação;
- respeitar estoque;
- preservar edição/quantidade válida.

## Real-time

### `nft.updated`
Afeta:
- catálogo;
- detalhe;
- carrinho;
- quote/checkout.

### `order.updated`
Afeta:
- pedido pending;
- confirmed/rejected;
- navegação/feedback de confirmação.

## Versionamento

Manter por recurso:
- `id`
- `version`

Aplicar evento somente se:
`incoming.version > known.version`

Duplicata ou versão menor/igual é ignorada.

## Reconexão

Após reconnect:
- não confiar apenas na fila de eventos;
- refetch/reconciliar recursos ativos via REST.

## Sessão anterior

Subscription deve estar vinculada à sessão atual.

Eventos antigos jamais podem atualizar cache de novo usuário.

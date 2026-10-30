# Plano de Contratos REST

Os contratos finais devem ser documentados em `ARCHITECTURE.md` da solução.

## Recursos mínimos

### Session / Account
- POST signup
- POST login
- GET session
- POST logout
- simulação de expiração

### NFTs
- GET list com search/filter/sort/page
- GET by id

### Favorites
- GET
- POST add
- DELETE remove

### Cart
- GET
- POST item
- PATCH quantity
- DELETE item

### Quote
- POST/recalculate
- valida cupom
- valida preço
- valida disponibilidade
- retorna taxa e total

### Orders
- POST create com idempotency key
- GET status/receipt

### Profile
- GET
- PATCH data/avatar
- POST password change

### Wallets
- GET
- POST
- PATCH

## Erros mínimos

Representar de forma tipada:
- validation
- unauthorized
- forbidden
- not found
- conflict
- availability conflict
- transient failure
- timeout/network

## Idempotência

Pedido:
- mesma chave + mesmo payload → mesmo pedido;
- mesma chave + payload diferente → conflito;
- timeout após criação → retry recupera pedido já criado.

## Precisão

Valores ETH:
- transporte como string decimal;
- cálculo com biblioteca decimal ou estratégia equivalente;
- nunca usar `number` como fonte de verdade.

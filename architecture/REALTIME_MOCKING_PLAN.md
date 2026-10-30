# Plano de MSW + Socket.IO

## Objetivo

Ter uma camada de simulação reproduzível compartilhada entre:
- desenvolvimento;
- demonstração;
- Playwright.

## Princípio

A UI deve acreditar que conversa com uma API e um socket reais.

Nenhum componente deve importar fixture de negócio.

## Estado mock

Manter store controlado para:
- users
- sessions
- NFTs/editions
- favorites
- carts
- coupons
- profiles
- wallets
- orders
- idempotency records

## Cenários configuráveis

Mínimo:
- default/success
- empty catalog
- slow
- variable latency
- out of order
- network offline
- timeout
- HTTP 4xx
- HTTP 5xx
- expired session
- signup conflict
- invalid form
- invalid coupon
- expired coupon
- price changed
- sold out
- order timeout after creation
- payment confirmed
- payment rejected

## Controle por testes

Criar mecanismo determinístico de:
- reset;
- escolher cenário;
- definir relógio quando necessário;
- disparar evento socket;
- restaurar baseline.

## Socket

Usar integração compatível com protocolo Socket.IO e `socket.io-client`.

O teste precisa provar que o evento percorreu o transporte, não que uma função interna foi chamada.

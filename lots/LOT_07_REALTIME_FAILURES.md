# Lote 07 — Tempo Real e Cenários de Falha

## Objetivo

Fechar requisitos de Socket.IO, versões, reconexão e matriz de falhas reproduzíveis.

## Leitura obrigatória

- `architecture/REALTIME_MOCKING_PLAN.md`
- requisitos R33, R37–R43, R65–R71, R92–R93

## Tarefas

1. Integrar socket.io-client.
2. Criar transporte mock compatível.
3. `nft.updated`.
4. `order.updated`.
5. identity/version.
6. ignore duplicate.
7. ignore stale.
8. cleanup listeners.
9. session scoping.
10. reconnect + REST reconcile.
11. cenário preço muda com item no carrinho.
12. quote stale bloqueia checkout.
13. disconnect durante pending.
14. refresh/reconnect recupera pedido.
15. configurar todos cenários MSW obrigatórios.
16. E2E real-time pelo socket.
17. E2E network/HTTP/session/coupon/payment failures.

## Fora de escopo deste lote

- Não antecipar features de lotes seguintes salvo infraestrutura mínima necessária.

## Critérios de aceite

- [ ] testes provam uso de socket.io-client;
- [ ] evento antigo não regride;
- [ ] duplicata não reaplica;
- [ ] sessão anterior não afeta novo user;
- [ ] reconnect faz REST reconciliation;
- [ ] checkout reage a preço/estoque alterado;
- [ ] pending recupera sem nova compra;
- [ ] cenários são determinísticos.

## Evidência obrigatória

- traces dos testes;
- logs controlados do cenário;
- E2E real-time;
- tabela cenário → como reproduzir.

## Antes de avançar

- atualizar `PROGRESS.md`;
- atualizar `HANDOFF.md` se a sessão for encerrar;
- registrar decisões em `DECISIONS.md`;
- registrar bloqueios reais em `OPEN_QUESTIONS.md`.

## Preparação para entrevista

Explicar:
- versão de evento;
- cache update vs invalidation;
- por que reconciliar REST após reconnect.

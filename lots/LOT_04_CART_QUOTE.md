# Lote 04 — Carrinho e Cotação

## Objetivo

Implementar carrinho persistente, merge, cupom, precisão e quote proveniente da API.

## Leitura obrigatória

- Desktop/Mobile Carrinho
- requisitos R26–R34, R75–R76, R88

## Tarefas

1. GET cart.
2. Add item.
3. PATCH quantity.
4. Remove.
5. Limites por edição.
6. Persistência refresh.
7. Guest cart.
8. Merge no login.
9. Cupom apply/remove.
10. invalid/expired coupon.
11. Quote endpoint.
12. subtotal/desconto/network fee/total.
13. ETH string + decimal-safe calculations.
14. skeleton resumo.
15. feedback de mutation.
16. recomendações visuais somente se previstas.
17. desktop/mobile fidelity.
18. E2E completo do carrinho.

## Fora de escopo deste lote

- Não antecipar features de lotes seguintes salvo infraestrutura mínima necessária.

## Critérios de aceite

- [ ] nenhuma soma crítica usa floating point como fonte de verdade;
- [ ] refresh preserva;
- [ ] guest → user preserva;
- [ ] estoque/edição respeitados;
- [ ] cupom inválido/expirado tratado;
- [ ] totals correspondem à API;
- [ ] skeleton;
- [ ] visual responsivo;
- [ ] E2E passa.

## Evidência obrigatória

- teste de precisão;
- E2E cart;
- screenshots 1440/414;
- resultado refresh/merge.

## Antes de avançar

- atualizar `PROGRESS.md`;
- atualizar `HANDOFF.md` se a sessão for encerrar;
- registrar decisões em `DECISIONS.md`;
- registrar bloqueios reais em `OPEN_QUESTIONS.md`.

## Preparação para entrevista

Explicar:
- por que ETH é string;
- quem é fonte de verdade do total;
- estratégia de guest cart merge.

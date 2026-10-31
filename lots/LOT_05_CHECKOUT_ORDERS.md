# Lote 05 — Checkout, Pedido e Confirmação

## Objetivo

Fechar o fluxo de compra com validação, quote revalidation, idempotência e recibo imutável.

## Leitura obrigatória

- Desktop/Mobile Pagamento
- Desktop Confirmação
- requisitos R35–R47, R89–R90

## Tarefas

1. Form do colecionador.
2. Carteira/rede na compra.
3. Review.
4. Revalidar quote.
5. Detectar alteração e exigir nova confirmação.
6. Gerar idempotency key por tentativa lógica.
7. POST order idempotente.
8. Bloquear clique repetido.
9. Estado pending.
10. Confirmed/rejected.
11. Recuperar mesma ordem após timeout.
12. Recibo snapshot.
13. Só mostrar confirmação se confirmed.
14. Falha preserva carrinho.
15. Sucesso remove somente comprado.
16. Mobile de confirmação derivado da linguagem existente.
17. E2E happy path + reject + duplicate + timeout.

## Fora de escopo deste lote

- Não antecipar features de lotes seguintes salvo infraestrutura mínima necessária.

## Critérios de aceite

- [x] double click não duplica;
- [x] timeout recupera mesma ordem;
- [x] key reutilizada com payload diferente conflita;
- [x] quote desatualizada bloqueia confirmação;
- [x] rejected não mostra sucesso;
- [x] receipt não muda após catálogo;
- [x] carrinho correto após success/failure;
- [x] E2E passa.

## Evidência obrigatória

- IDs do pedido nas tentativas;
- testes idempotência;
- screenshots checkout/confirmation;
- E2E completo.

## Antes de avançar

- atualizar `PROGRESS.md`;
- atualizar `HANDOFF.md` se a sessão for encerrar;
- registrar decisões em `DECISIONS.md`;
- registrar bloqueios reais em `OPEN_QUESTIONS.md`.

## Preparação para entrevista

Explicar:
- idempotência;
- por que timeout é diferente de falha antes da criação;
- por que receipt é snapshot.

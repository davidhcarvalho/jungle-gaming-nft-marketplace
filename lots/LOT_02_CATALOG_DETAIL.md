# Lote 02 — Catálogo e Detalhe

## Objetivo

Implementar descoberta e detalhe com URL state, concorrência segura, visual fiel e estados completos.

## Leitura obrigatória

- `design-reference/Desktop/Início.png`
- `design-reference/Mobile/Início.png`
- `design-reference/Desktop/Detalhes do NFT.png`
- `design-reference/Mobile/Detalhes do NFT.png`
- requisitos R12–R23, R72–R80, R84–R85

## Tarefas

1. Home hero e navegação.
2. Catálogo com fixtures variadas.
3. Busca.
4. Filtros combináveis.
5. Ordenação.
6. Paginação.
7. Search params tipados no Router.
8. Reset da página ao alterar filtro.
9. Query com params reais.
10. Cancelamento/descarte de resposta obsoleta.
11. Empty/error/loading/background states.
12. Skeleton shimmer.
13. Detalhe por ID.
14. Not found de recurso.
15. Galeria.
16. Edições.
17. Quantidade/limite.
18. CTA de compra prepara integração com carrinho.
19. Responsividade 390/768/1440.
20. Comparação visual 1440 e 414.
21. E2E de catálogo e detalhe.

## Fora de escopo deste lote

- Não antecipar features de lotes seguintes salvo infraestrutura mínima necessária.

## Critérios de aceite

- [ ] URL restaura busca/filtros/sort/page;
- [ ] back/forward funciona;
- [ ] filtro reseta page;
- [ ] resultado fora de ordem não sobrescreve novo;
- [ ] detalhe deep link funciona;
- [ ] 404 do NFT é tratado;
- [ ] edição/quantidade respeitam limites;
- [ ] skeletons preservam layout;
- [ ] desktop/mobile visualmente coerentes;
- [ ] sem overflow 390/768/1440;
- [ ] E2E passa.

## Evidência obrigatória

- screenshots reference × app;
- Playwright catálogo;
- Playwright detalhe;
- comando/test result;
- divergências visuais restantes explicitadas.

## Antes de avançar

- atualizar `PROGRESS.md`;
- atualizar `HANDOFF.md` se a sessão for encerrar;
- registrar decisões em `DECISIONS.md`;
- registrar bloqueios reais em `OPEN_QUESTIONS.md`.

## Preparação para entrevista

Explicar:
- por que estado do catálogo pertence à URL;
- como evitar race condition;
- como Query e Router interagem.

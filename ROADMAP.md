# Roadmap Executivo

## Meta do projeto

Entregar uma aplicação completa, fiel e defendível tecnicamente, sem concentrar toda validação no final.

## Critical path

### Lote 00 — Discovery
**Meta:** entender o repo e estabelecer baseline.

### Lote 01 — Foundation
**Meta:** stack obrigatória conectada ponta a ponta.

### Lote 02 — Catálogo + Detalhe
**Meta:** primeiro fluxo público completo, URL-driven e visualmente fiel.

### Lote 03 — Auth + Favoritos
**Meta:** sessão realista, isolamento por usuário e primeira mutation otimista.

### Lote 04 — Carrinho + Quote
**Meta:** precisão financeira, persistência e cálculo vindo da API.

### Lote 05 — Checkout + Pedido
**Meta:** fechar compra com revalidação, idempotência e receipt snapshot.

### Lote 06 — Perfil + Carteiras
**Meta:** completar conta e derivar mobile ausente com consistência.

### Lote 07 — Real-time + Falhas
**Meta:** eliminar os maiores riscos técnicos de Socket.IO, reconexão e cenários determinísticos.

### Lote 08 — Quality + Deploy
**Meta:** E2E, visual regression, Lighthouse, docs, clean checkout e URL pública.

### Lote 09 — Estudo
**Meta:** conseguir defender arquitetura, trade-offs e fluxos sem depender da IA.

## Política de avanço

Lote seguinte só começa quando:
- critérios de aceite do atual passam;
- P0/P1 conhecidos estão resolvidos ou explicitamente bloqueados;
- `PROGRESS.md` tem evidência;
- handoff está coerente.

## Priorização em caso de pressão

1. gates eliminatórias;
2. fluxo de compra;
3. isolamento de sessão;
4. real-time;
5. testes obrigatórios;
6. fidelidade visual;
7. acessibilidade/performance;
8. polish opcional.

Não sacrificar requisito eliminatório por micro-polimento visual.

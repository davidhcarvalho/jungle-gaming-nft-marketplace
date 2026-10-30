# Acessibilidade e Performance

## Acessibilidade

Obrigatório:
- keyboard navigation;
- foco visível;
- focus trap em dialogs/drawers;
- labels reais;
- `aria-describedby`/mensagens associadas;
- alt relevante;
- contraste legível;
- estado não dependente só de cor;
- feedback acessível para mutation e real-time;
- sem perda de conteúdo em zoom.

## Skeleton

Obrigatório com shimmer:
- catálogo;
- detalhe;
- resumo do carrinho.

Preservar dimensões para reduzir layout shift.

Respeitar `prefers-reduced-motion`.

## Lighthouse

Auditar:
- Home desktop
- Home mobile
- Detalhe desktop
- Detalhe mobile

Executar 3 vezes cada perfil/página.

Reportar mediana.

Metas:
- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 90

Registrar:
- LCP
- CLS
- TBT

Não remover imagens, fontes ou funcionalidades apenas para melhorar score.

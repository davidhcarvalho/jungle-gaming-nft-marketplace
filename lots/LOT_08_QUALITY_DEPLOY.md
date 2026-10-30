# Lote 08 — Quality Gate, Deploy e Documentação

## Objetivo

Transformar a aplicação funcional em entrega reproduzível, auditada e publicável.

## Leitura obrigatória

- todos os quality docs
- requisitos R72–R83, R94–R112

## Tarefas

1. Rodar todos E2E.
2. Visual regression Home/Detail/Cart/Payment.
3. Baselines estáveis.
4. Teste teclado/foco/forms.
5. Skeleton/failure/retry.
6. Revisão sem overflow 390/768/1440.
7. Revisão console.
8. Build otimizado.
9. Lighthouse 3× por página/perfil.
10. Registrar medianas e LCP/CLS/TBT.
11. Corrigir regressões.
12. Finalizar README da solução.
13. Finalizar ARCHITECTURE.md.
14. Documentar cenários e credenciais.
15. Checkout limpo.
16. Deploy.
17. Testar deep links/refresh produção.
18. Confirmar mocks/socket no deploy.
19. Executar checklist final.

## Fora de escopo deste lote

- Não antecipar features de lotes seguintes salvo infraestrutura mínima necessária.

## Critérios de aceite

- [ ] suite E2E verde;
- [ ] regressão visual verde;
- [ ] Lighthouse medido corretamente;
- [ ] metas atingidas ou desvios justificados;
- [ ] README completo;
- [ ] ARCHITECTURE completo;
- [ ] clean checkout reproduz;
- [ ] deploy público;
- [ ] deep link/refresh;
- [ ] nenhuma gate eliminatória.

## Evidência obrigatória

- URL deploy;
- relatórios Lighthouse;
- Playwright report;
- screenshots/baselines;
- clean install log;
- checklist final preenchido.

## Antes de avançar

- atualizar `PROGRESS.md`;
- atualizar `HANDOFF.md` se a sessão for encerrar;
- registrar decisões em `DECISIONS.md`;
- registrar bloqueios reais em `OPEN_QUESTIONS.md`.

## Preparação para entrevista

Explicar:
- principais compromissos de performance;
- maior bug encontrado;
- arquitetura final;
- limitação conhecida e como resolveria.

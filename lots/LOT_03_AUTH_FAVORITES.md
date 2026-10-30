# Lote 03 — Autenticação, Sessão e Favoritos

## Objetivo

Implementar identidade, sessão recuperável, proteção de rotas, merge de contexto e favorito otimista.

## Leitura obrigatória

- Desktop/Mobile Login
- Desktop/Mobile Cadastro
- requisitos R24–R25, R48–R52, R59, R64, R86–R87

## Tarefas

1. Fixtures de pelo menos 2 usuários.
2. Signup.
3. Conflito de cadastro.
4. Login.
5. Sessão persistente.
6. Logout.
7. Expiração.
8. Guard de rotas privadas.
9. Preservar redirect/intenção.
10. Limpeza de cache privado em logout/troca.
11. Favoritos GET/add/remove.
12. Mutation otimista com rollback.
13. Persistência por usuário.
14. Preparar merge de carrinho visitante no login.
15. Form validation client/server.
16. Visual login/cadastro desktop/mobile.
17. E2E auth e favoritos.

## Fora de escopo deste lote

- Não antecipar features de lotes seguintes salvo infraestrutura mínima necessária.

## Critérios de aceite

- [ ] refresh recupera sessão;
- [ ] sessão expirada redireciona sem perder contexto necessário;
- [ ] logout/troca não vaza dados;
- [ ] dois usuários têm favoritos isolados;
- [ ] favorito otimista faz rollback em falha;
- [ ] login/cadastro fiéis ao Figma;
- [ ] E2E cobre troca de usuário.

## Evidência obrigatória

- testes;
- screenshot auth;
- demonstração de cache limpo;
- evidência rollback.

## Antes de avançar

- atualizar `PROGRESS.md`;
- atualizar `HANDOFF.md` se a sessão for encerrar;
- registrar decisões em `DECISIONS.md`;
- registrar bloqueios reais em `OPEN_QUESTIONS.md`.

## Preparação para entrevista

Explicar:
- como sessão mockada funciona;
- como dados privados são isolados;
- como funciona optimistic update + rollback.

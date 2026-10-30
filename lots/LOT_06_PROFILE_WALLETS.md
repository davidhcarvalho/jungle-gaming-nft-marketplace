# Lote 06 — Perfil e Carteiras

## Objetivo

Implementar conta persistente e adaptar telas não desenhadas no mobile sem quebrar linguagem visual.

## Leitura obrigatória

- Desktop Perfil
- Desktop Carteiras
- mobile patterns das outras telas
- requisitos R53–R56, R91

## Tarefas

1. GET profile.
2. Edit profile.
3. Avatar.
4. Change password.
5. GET wallets.
6. Add wallet.
7. Edit wallet.
8. Principal/secundária.
9. Validação e erros API.
10. Persistência refresh.
11. Criar versões mobile de Perfil e Carteiras por derivação.
12. Registrar decisão visual.
13. E2E.

## Fora de escopo deste lote

- Não antecipar features de lotes seguintes salvo infraestrutura mínima necessária.

## Critérios de aceite

- [ ] alterações persistem;
- [ ] senha tratada sem armazenamento em claro;
- [ ] wallets isoladas por usuário;
- [ ] mobile funciona em 390;
- [ ] mobile mantém linguagem visual;
- [ ] erros associados aos campos;
- [ ] E2E passa.

## Evidência obrigatória

- screenshots desktop + mobile derivado;
- testes;
- decisão em `DECISIONS.md`.

## Antes de avançar

- atualizar `PROGRESS.md`;
- atualizar `HANDOFF.md` se a sessão for encerrar;
- registrar decisões em `DECISIONS.md`;
- registrar bloqueios reais em `OPEN_QUESTIONS.md`.

## Preparação para entrevista

Explicar:
- como derivou mobile sem frame;
- persistência e validação;
- separação entre profile/wallet API e UI.

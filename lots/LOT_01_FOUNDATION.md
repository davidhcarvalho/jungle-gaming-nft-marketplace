# Lote 01 — Foundation e Infraestrutura

## Objetivo

Criar a espinha dorsal técnica exigida pelo desafio antes de construir fluxos complexos.

## Leitura obrigatória

- documentos de arquitetura;
- matriz R01–R11, R34, R57–R63;
- referência visual para tokens globais.

## Tarefas

1. Configurar React/TypeScript/build conforme repo.
2. Configurar Tailwind.
3. Integrar shadcn/ui sem preservar visual padrão indevido.
4. Configurar TanStack Router.
5. Configurar TanStack Query.
6. Criar Axios client e normalização de erros.
7. Configurar MSW browser/test.
8. Criar state/fixtures/scenario reset mínimos.
9. Definir contratos base.
10. Definir query key factory/padrão.
11. Criar shell/layout global.
12. Definir tokens iniciais de cor/typography/spacing a partir das referências.
13. Criar rota not-found.
14. Preparar mecanismo de ativação de mocks por ambiente.
15. Documentar política inicial de cache/retry.

## Fora de escopo deste lote

- Não antecipar features de lotes seguintes salvo infraestrutura mínima necessária.

## Critérios de aceite

- [ ] stack obrigatória de foundation está realmente conectada;
- [ ] uma request simples percorre Axios → MSW → Query → UI;
- [ ] Router funciona com deep link;
- [ ] reset de mocks funciona;
- [ ] TypeScript sem `any` estrutural desnecessário;
- [ ] ETH modelado como string;
- [ ] build/typecheck/lint passam;
- [ ] shell visual é coerente com KURIO.

## Evidência obrigatória

- comandos de build/typecheck/lint;
- request de smoke test;
- screenshot do shell desktop/mobile;
- arquivos-chave;
- lista de tokens provisórios.

## Antes de avançar

- atualizar `PROGRESS.md`;
- atualizar `HANDOFF.md` se a sessão for encerrar;
- registrar decisões em `DECISIONS.md`;
- registrar bloqueios reais em `OPEN_QUESTIONS.md`.

## Preparação para entrevista

Explicar:
- por que Query e não estado global para server state;
- por que MSW na rede;
- por que Axios central;
- como query keys evitam vazamento.

# Jungle Gaming — AI-Driven Delivery Pack

Este diretório foi preparado para ser colocado **na raiz do repositório do desafio** e servir como sistema operacional de trabalho para Codex, Cursor ou outro agente de código.

## Objetivo

Entregar o desafio técnico de Frontend da Jungle Gaming com:

- fidelidade visual máxima às referências do Figma;
- cumprimento integral do README;
- execução por lotes pequenos e verificáveis;
- critérios de aceite objetivos antes de avançar;
- rastreabilidade entre requisito, implementação, teste e evidência;
- código explicável em entrevista técnica;
- handoff simples entre agentes e sessões.

## Como usar

1. Copie o conteúdo deste pacote para a raiz do repositório.
2. Preserve o `README.md` original do desafio.
3. Mantenha `AGENTS.md` na raiz.
4. Antes de qualquer implementação, o agente deve ler:
   1. `AGENTS.md`
   2. `PROJECT_CONTEXT.md`
   3. `challenge/README_ORIGINAL.md`
   4. `challenge/REQUIREMENTS_MATRIX.md`
   5. `challenge/VISUAL_INVENTORY.md`
   6. `PROGRESS.md`
   7. o arquivo do lote atual em `lots/`
5. Execute somente um lote por vez.
6. O agente só pode marcar um lote como concluído quando todas as evidências exigidas estiverem registradas em `PROGRESS.md`.

## Prompt inicial recomendado

Abra `prompts/SESSION_BOOT_PROMPT.md`, copie o conteúdo e envie ao Codex/Cursor.

## Fonte de verdade

A precedência é:

1. **README original** para comportamento, stack, fluxos, cenários e critérios técnicos.
2. **Referências visuais** em `design-reference/` para identidade visual e composição.
3. **Documentos deste pacote** para processo, arquitetura-alvo, rastreabilidade e quality gates.
4. Código existente, desde que não viole os itens acima.

Se houver conflito, o agente deve registrar em `OPEN_QUESTIONS.md` ou `DECISIONS.md` antes de assumir algo.

## Regra central

Não avançar por sensação de “parece pronto”.

Avançar somente com:
- implementação;
- verificação;
- evidência;
- critérios de aceite satisfeitos.

## Importante

As imagens em `design-reference/` são **referências visuais**, não assets finais da aplicação. Assets reais devem ser exportados do Figma quando disponíveis. Substituições precisam ser documentadas.

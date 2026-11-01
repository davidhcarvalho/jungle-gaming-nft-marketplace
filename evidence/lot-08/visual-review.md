# Revisão visual — Lote 08

## Baselines e origem

Os oito baselines em `visual-baselines/` foram copiados sem alteração das capturas revisadas/aprovadas nos Lotes 02, 04 e 05. Eles cobrem Home, detalhe, carrinho e pagamento em 390 px e 1440 px. As capturas históricas originais permanecem nos diretórios dos lotes correspondentes. Nenhum screenshot foi incluído na UI nem usado como asset.

## Revisão realizada

Revisei a captura Home mobile de 390 px e a composição dos baselines desktop/mobile; os frames apresentam as proporções, crop de arte, conteúdo e composição já aprovados externamente para os fluxos correspondentes. O diff não altera markup visual nem estilos: o único ajuste de produto no Lote 08 até aqui é lazy loading por rota. O teste `spec:visual-regression` comparou os oito estados contra os baselines com tolerância `maxDiffPixelRatio: 0.003`.

Resultado do runner host: PASS (8 comparações; os demais 16 casos são skips deliberados porque cada baseline roda apenas no viewport correspondente). Uma revisão adicional com a suíte completa ainda é necessária antes de fechar o lote, para confirmar que os outros fluxos não alteraram evidências nem layout.

## Regressão final pós-otimização

No `full` Request `1793513483-550281-8`, as oito comparações elegíveis de baseline passaram novamente e 16 execuções foram skip intencional por não corresponderem ao viewport do baseline. As mudanças de `srcSet`/WebP mantiveram proporção, crop e composição dentro da tolerância configurada (`maxDiffPixelRatio: 0.003`). As imagens históricas regravadas por testes de revisão dos Lotes 02–07 foram restauradas byte a byte de `HEAD`; os baselines Lote 08 continuam preservados aqui. Não foram encontrados desvios visuais novos.

## Limites

Não há frame tablet no Figma para esses fluxos; tablet é coberto pelos testes funcionais e layout responsivo. O baselining usa capturas de evidência anteriormente aprovadas, não substitui o registro Figma original. Desvios conhecidos de assets/fontes e detalhe desktop permanecem documentados nos registros dos Lotes 02/04/05.

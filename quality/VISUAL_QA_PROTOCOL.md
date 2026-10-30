# Protocolo de QA Visual

## Objetivo

Transformar “parece parecido” em comparação repetível.

## Processo por tela

1. Identificar referência em `design-reference/`.
2. Rodar app com dados determinísticos.
3. Capturar via Playwright no viewport correspondente.
4. Comparar visualmente referência × aplicação.
5. Listar divergências por prioridade.
6. Corrigir.
7. Repetir até não existirem divergências significativas.

## Viewports

### Comparação direta
- Desktop: 1440 px
- Mobile Figma: 414 px

### Obrigatórios do desafio
- 390 px
- 768 px
- 1440 px

## Ordem de inspeção

### P0
- estrutura errada;
- componente faltando;
- coluna/card fora do lugar;
- header/footer incompatíveis;
- imagem errada;
- mobile quebrado.

### P1
- tamanho de container;
- grid;
- gap;
- padding;
- tipografia principal;
- altura de controles;
- aspect ratio.

### P2
- border radius;
- border color;
- line-height;
- microspacing;
- ícones.

## Regressão visual requerida

Baselines versionadas para:
- Início
- Detalhe
- Carrinho
- Pagamento

Desktop e mobile nos fluxos principais conforme configuração de testes.

## Tolerância

Não mascarar divergência relevante com threshold alto.

Se uma diferença é determinística, corrigir o layout em vez de aumentar tolerância.

## Assets

Não usar screenshot inteira para reproduzir a tela.

Se asset original estiver ausente, documentar e manter lista explícita de substituições.

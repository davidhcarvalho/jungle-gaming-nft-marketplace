# Critérios de Aceite Globais

Aplicam-se a todo lote quando pertinente.

## Funcional

- comportamento corresponde ao README;
- happy path funciona;
- erros relevantes são tratados;
- refresh não quebra fluxo;
- deep link funciona quando aplicável;
- ação fora de escopo não finge sucesso.

## Visual

- tela comparada com referência;
- macro-layout consistente;
- spacing sem divergências gritantes;
- tipografia coerente;
- cores e surfaces coerentes;
- imagens preservam proporções;
- sem overflow;
- mobile e desktop corretos.

## Estado

- remote state via Query;
- REST via Axios;
- cache com query keys corretas;
- sem dados privados entre usuários;
- mutations invalidam/atualizam coerentemente.

## Mocking

- dado vem da rede mockada;
- cenário reproduzível;
- reset conhecido;
- não há fake data diretamente na UI.

## Acessibilidade

- teclado;
- foco visível;
- labels;
- erros associados;
- semântica;
- alt;
- feedback acessível;
- focus management quando necessário.

## Qualidade

- TypeScript sem erros;
- lint sem erros relevantes;
- build;
- sem React warnings;
- sem unhandled requests;
- sem console errors inesperados.

## Evidência

Cada lote registra:
- comando;
- resultado;
- testes;
- screenshots quando visual;
- limitações.

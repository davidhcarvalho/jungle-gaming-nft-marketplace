# Prompt — Corrigir sem Quebrar Arquitetura

Há um bug no lote atual.

Antes de editar:
1. reproduza;
2. identifique camada de origem;
3. localize requisito afetado;
4. encontre o menor ponto correto para correção.

Evite:
- patch na UI para esconder bug de API;
- invalidar todo cache indiscriminadamente;
- duplicar lógica;
- contornar MSW;
- chamar cache diretamente para fingir socket.

Após corrigir:
- teste regressão;
- registre causa raiz;
- atualize evidência do lote.

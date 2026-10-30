# Estratégia de Testes

## Playwright — cobertura obrigatória

1. busca + filtros combinados + sort + page + histórico;
2. deep link detalhe + not found;
3. signup + login + sessão expirada + logout + troca de usuário;
4. favoritos + mutation failure + rollback;
5. carrinho + quantidade + remove + cupom + persistência refresh/login;
6. compra completa até recibo confirmado;
7. pagamento recusado + clique repetido + timeout + mesma ordem;
8. perfil + avatar + senha + carteiras + validação;
9. preço/disponibilidade via Socket.IO durante checkout;
10. evento duplicado/antigo + disconnect + retomada pending;
11. teclado + foco dialogs + validação;
12. skeleton slow + falha + retry.

## Browsers

Mínimo Chromium.

## Perfis

- desktop;
- mobile.

## Isolamento

Todo teste começa em estado conhecido.

Nunca depender da ordem dos testes.

## Tempo

Controlar:
- relógio;
- latência;
- evento;
quando necessário.

## Traces

Configurar traces em falha.

## Testes de REST

Precisam passar pelos handlers MSW.

## Testes real-time

Precisam passar por `socket.io-client`.

## Unit/integration complementares

Não são substitutos dos E2E, mas são recomendados para:
- cálculo decimal;
- idempotência;
- reducer/store mock;
- comparação de versões de eventos;
- merge de carrinho visitante.

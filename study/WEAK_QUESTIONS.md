# Perguntas para autoensaio e lacunas a fechar

Faça cada resposta sem abrir este arquivo. Marque confiança 1–5; itens abaixo de 4 exigem voltar ao código e repetir. A preparação só está internalizada quando consegue desenhar o fluxo e responder com evidência, não quando decorou uma frase.

## Arquitetura e request

- [ ] Desenhe o request completo de catálogo desde a mudança da URL até o card renderizado. Onde a query key é criada?
- [ ] Que problema o `AbortSignal` resolve e em quais arquivos ele cruza até Axios?
- [ ] Em uma busca nova que falha, por que não se deve chamar isso automaticamente de “erro em background”?
- [ ] O que pertence a `useState` e o que pertence a TanStack Query neste app?
- [ ] Como provar que MSW não está sendo chamado diretamente pela UI?

## Router e sessão

- [ ] Como `returnTo` é preservado e quais valores são rejeitados para impedir redirect externo?
- [ ] Quais rotas são guest-accessible e quais têm guard? Por que `/cart` é exceção?
- [ ] O que limpa ao trocar de usuário: query cache, requests em voo, socket listeners e stores?
- [ ] Por que query key com userId não substitui autorização no backend?
- [ ] Qual é a limitação da autenticação e do digest no ambiente MSW?

## Favoritos e cache

- [ ] Narre em ordem `onMutate`, snapshot, mutation REST, rollback e invalidation.
- [ ] O que impede uma resposta tardia de user A de atualizar a tela de user B?
- [ ] Quando escolheria cache update e quando preferiria invalidation/refetch?

## Cart, quote e precisão

- [ ] Como guest cart sobrevive refresh sem componente ser fonte de verdade?
- [ ] Qual regra mergeia a mesma edição entre guest e usuário? O que acontece no limite do estoque?
- [ ] Como `eth-decimal.ts` transforma uma string ETH em wei e volta sem `number` monetário?
- [ ] Quem calcula desconto, taxa e total? Como provar isso pela requisição/resposta?
- [ ] O que ocorre quando cupom expira ou o preço muda depois da quote?

## Checkout e pedido

- [ ] Diferencie tentativa lógica de retry técnico. Quando nasce uma chave nova?
- [ ] O que o servidor mock persiste antes de simular timeout-after-create?
- [ ] Por que a mesma key com payload diferente retorna conflict?
- [ ] Como o app evita double click, e por que botão disabled não é garantia suficiente?
- [ ] Quais transições de order state existem? O que torna `confirmed`/`rejected` terminais?
- [ ] Por que o receipt é snapshot e exatamente quais campos conserva?
- [ ] Como o carrinho parcial é limpo após confirmação? O que permanece em rejeição?

## Socket.IO/realtime

- [ ] Que parte prova uso efetivo de `socket.io-client` em vez de callback/cache setter?
- [ ] Como a binding MSW intercepta a conexão e quais limitações de escopo foram aceitas?
- [ ] Qual diferença entre `eventId` duplicado e `version` velha?
- [ ] Como versão conhecida é determinada e quando evento é ignorado?
- [ ] Por que um evento de preço invalida quote em vez de autorizar compra?
- [ ] O que acontece ao perder `order.updated` enquanto desconectado?
- [ ] Como listeners são instalados/retirados em reconnect, logout e troca de conta?
- [ ] Como provar que REST e evento compartilham a mesma store mock?

## Visual, acessibilidade e testes

- [ ] Que telas mobile não têm frame próprio e como a derivação foi documentada?
- [ ] Quais quatro artes são originais e quais artworks usam fallback? Qual fonte não foi identificada?
- [ ] Como testar teclado/foco, status, labels e reduced motion sem se apoiar apenas em cor?
- [ ] Quais testes são snapshots visuais e por que tablet pode ter skip de captura mesmo com fluxo 768 testado?
- [ ] Como um teste permite HTTP 404/503 intencional sem ignorar todos os erros do browser?
- [ ] Como separar bug de aplicação, mock, harness e assertion?

## Performance e entrega

- [ ] Qual comando Lighthouse usa build preview otimizado e como o desktop é emulado?
- [ ] Quais são as medianas do batch final e onde abrir os 12 relatórios sem misturar batches históricos?
- [ ] Explique Performance abaixo de 90 citando LCP breakdown, TBT, long tasks e custo JS/MSW, sem alegar que a meta passou.
- [ ] Por que não foi reexecutado Lighthouse depois do redeploy do commit final?
- [ ] Como Vercel deep-link rewrites permitem refresh de rota? Qual evidência pública comprova isso?
- [ ] O que o clean checkout verificou que a máquina local poderia esconder?

## Perguntas “por que?”

- [ ] Por que MSW na camada de rede e não `if (isMock)` nos hooks?
- [ ] Por que BigInt wei em vez de Decimal library ou number?
- [ ] Por que quote precisa ser revalidada imediatamente antes de criar order?
- [ ] Por que REST continua autoridade depois de reconnect Socket.IO?
- [ ] Por que usar lazy route loading e o que o bundle demo ainda precisa carregar?
- [ ] Por que não otimizar mais agressivamente imagem/layout só para subir Lighthouse?
- [ ] O que mudaria para produção sem transformar o escopo do challenge em serviço real?

## Exercício final obrigatório

- [ ] Expliquei sem ler três decisões em até 90 segundos cada: BigInt, idempotência e REST reconciliation.
- [ ] Expliquei dois trade-offs com custo e benefício concretos.
- [ ] Naveguei pelos arquivos fonte correspondentes sem busca assistida.
- [ ] Fiz a demo em 5–10 minutos sem chamar mock de produção nem compra de transação real.
- [ ] Declarei ao menos duas limitações sem tentar escondê-las.

# Guia de Estudo para a Entrevista

Este índice curto complementa os materiais detalhados:

- [Notas de estudo com respostas curtas/aprofundadas, decisões, trade-offs e glossário](STUDY_NOTES.md)
- [Mapa final de arquitetura e evidências por fluxo](ARCHITECTURE_MAP.md)
- [Roteiro de demonstração de 5–10 minutos](DEMO_SCRIPT.md)
- [Perguntas fracas para autoensaio](WEAK_QUESTIONS.md)

Ordem recomendada: desenhar sem consultar notas → walkthrough de código → perguntas fracas → demo cronometrada. Não apresente mocks como serviços reais.

## Bloco 1 — Arquitetura em 5 minutos

Ser capaz de desenhar:

```text
Route/UI
  ↓
Feature hooks
  ↓
TanStack Query
  ↓
Axios
  ↓
MSW REST

Socket mock
  ↓
socket.io-client
  ↓
subscription layer
  ↓
Query cache / refetch
  ↓
UI
```

## Bloco 2 — Perguntas prováveis

### Por que TanStack Query?
Responder com server state, cache, invalidação, concorrência e retry.

### Por que colocar filtros na URL?
Compartilhamento, refresh, back/forward e fonte única de navegação.

### Como evitou resposta fora de ordem?
Explicar signal/cancelamento/query identity e descarte de resposta obsoleta.

### Como funciona optimistic favorite?
Snapshot → update → rollback → settle/invalidate.

### Como preservou cart do visitante?
Explicar identidade guest e merge após autenticação.

### Como evitou pedido duplicado?
Idempotency key e estado do pedido.

### O que acontece se der timeout depois de criar pedido?
Retry com mesma key recupera mesma ordem.

### Por que receipt é snapshot?
Pedido precisa preservar preço/taxa do momento da compra.

### Como eventos Socket.IO não regressam estado?
Versão por recurso; ignorar <= versão conhecida.

### Por que refetch após reconnect?
Eventos podem ter sido perdidos; REST é fonte reconciliadora.

### Como evita dados do usuário A no B?
Query keys + limpeza + session scoped socket + mock state isolado.

### Como MSW foi usado?
Na camada de rede, compartilhando cenários entre dev/test/demo.

### Como mobile foi feito onde não havia frame?
Derivação consistente do sistema visual existente + documentação.

## Bloco 3 — Walkthroughs obrigatórios

Treinar:
1. busca → URL → request → query → UI;
2. login → session → private cache;
3. favorito optimistic;
4. add cart → quote;
5. checkout → revalidate → idempotent order;
6. socket price update → stale quote;
7. pending order → disconnect → reconnect;
8. logout → cleanup.

## Bloco 4 — Trade-offs

Preparar pelo menos 3:
- precisão decimal vs simplicidade;
- update cache imediato vs invalidate/refetch;
- persistência mock local vs pure in-memory;
- abstração vs explicabilidade;
- pixel fidelity vs acessibilidade.

## Bloco 5 — Evidências

Na entrevista, prefira apontar:
- teste;
- arquivo;
- cenário;
- decisão documentada;
em vez de apenas afirmar que funciona.

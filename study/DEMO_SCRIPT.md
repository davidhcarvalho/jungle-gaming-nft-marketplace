# Roteiro de demonstração — 7 a 9 minutos

Use a URL publicada ou execução local documentada no README. Se usar local, confira que `VITE_ENABLE_MOCKS=true` ou script demo está habilitado. Os dados são demonstração via MSW: explique isso antes de qualquer fluxo. Nunca apresente compra como transação real.

## 0:00–0:40 — contexto

- Abra `https://kurio-nft-marketplace-zeta.vercel.app`.
- Diga: “Este challenge implementa o fluxo de marketplace no browser. REST e Socket.IO são exercitados, mas os servidores são mocks MSW; não há blockchain/payment real.”
- Mostre Home e diga que filtros/pesquisa ficam na URL.

## 0:40–1:35 — catálogo e roteamento

- Pesquise/filtre e mostre a query string mudando.
- Recarregue; demonstre que o estado permanece. Se possível faça Back/Forward.
- Abra um NFT direto e diga que Router tipado separa rota desconhecida de recurso NFT não encontrado.
- Fonte para explicar: `src/app/router.tsx`, `src/features/catalog/home-page.tsx`, `src/features/catalog/queries.ts`.

## 1:35–2:25 — sessão e favorito

- Abra Login/Cadastro; descreva validação de API, `returnTo` e sessão.
- Entre com a credencial fictícia documentada no README, se o ambiente ainda estiver resetado.
- Acione favorito e descreva optimistic update → erro/rollback → invalidação (use o cenário de falha somente se estiver preparado).
- Explique que trocar usuário limpa estado privado; não alegue autenticação de produção.

## 2:25–3:30 — guest cart e quote

- Faça logout se a demo estiver autenticada; adicione item ao carrinho sem login, atualize a página.
- Mostre persistência guest. Faça login e explique merge guest→user, mesma edição e limite de estoque.
- Mostre cupom e resumo. Explique que o total mostrado vem da quote REST, não de uma soma autoritativa na UI.
- Fonte: `src/features/cart/`, `src/mocks/state/cart-store.ts`, `src/lib/eth-decimal.ts`.

## 3:30–5:00 — checkout, revalidação, pedido

- Abra checkout, selecione wallet/rede e explique que conexão é simulada.
- Mostre confirmação. Explique que a quote é revalidada; mudança exige nova aceitação.
- Confirme uma compra de demonstração e abra `/orders/$orderId`.
- Explique tentativa lógica/idempotency key, pending/terminal states, snapshot do recibo e remoção somente das quantidades compradas.
- Não provoque cenário de timeout ao vivo sem reset preparado; descreva e aponte o teste.

## 5:00–6:05 — perfil e carteiras

- Abra Profile e Wallets com sessão. Mostre que alteração persiste e que há uma carteira principal.
- Explique que checkout usa a mesma store/query de carteiras; o upload de avatar e alteração de senha são simulações.

## 6:05–7:10 — realtime

- Abra o carrinho ou um pedido pending, dispare o cenário usando o harness de testes se a demo tiver sido preparada.
- Mostre feedback de mudança e explique que evento Socket.IO versionado atualiza/invalida Query, mas REST confirma quote/estado após reconexão.
- Se não houver harness de demonstração público disponível, não invente botão/UI de produto: use o spec `tests/realtime-failures.spec.ts` como prova e explique a sequência.

## 7:10–8:10 — evidência de qualidade

- Aponte `tests/` e os projetos 390/768/1440.
- Cite o último full validado: 257 PASS, 25 SKIPPED, 0 FAIL. Explique que os skips são capturas/tablet sem baseline e que 768 teve fluxo funcional.
- Abra `evidence/lighthouse/analysis.md`: mostre medianas/métricas e explique honestamente Performance abaixo da meta conforme interpretação do README; não recite número de outro batch.
- Feche com `README.md`, `ARCHITECTURE.md` e URL pública.

## Versão curta de cinco minutos

Faça: framing (20s) → catálogo URL (60s) → guest cart/quote (75s) → checkout/idempotência/receipt (100s) → socket e REST reconciliation (70s) → evidência e limitações (45s). Profile/wallet pode ficar para perguntas.

## Preparação pré-demo

1. Abra a URL e confira que produção responde.
2. Abra DevTools Console: não deve haver erro inesperado.
3. Resete estado de demo pelo fluxo documentado apenas se autorizado/disponível; não limpe dados de outra sessão sem entender impacto.
4. Tenha uma conta fictícia do README pronta.
5. Não mostre trace/screenshot temporário como UI.
6. Tenha arquivos de código e evidências em abas separadas para responder perguntas sem interromper a demonstração.

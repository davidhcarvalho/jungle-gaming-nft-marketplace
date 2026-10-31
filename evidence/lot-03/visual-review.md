# Lote 03 — revisão visual de autenticação

## Referências inspecionadas

- `design-reference/Desktop/Login.png` e `design-reference/Desktop/Cadastro.png`: header da Home permanece visível; composição da Home (hero, arte, filtros e cards) aparece ao fundo escurecida/desfocada pelo overlay; formulário em modal central com abas, fechamento, campos e ações sociais.
- `design-reference/Mobile/Login.png` e `design-reference/Mobile/Cadastro.png`: layout de tela inteira sem header global; marca KURIO no topo, título/formulário central, CTA largo, ações sociais e convite para alternar modo.

## Comparação executada — 2026-10-31

Capturas Playwright atualizadas após as correções em `evidence/lot-03/`:

- `login-mobile-414-review.png`
- `signup-mobile-414-review.png`
- `login-desktop-1440-review.png`
- `signup-desktop-1440-review.png`

As referências mobile têm 828 × 1792 px (2x); foram comparadas em escala equivalente a 414 × 896 CSS px. Na primeira rodada, marca/título e controles estavam visualmente abaixo do Figma. Ajustei o espaçamento vertical; na nova comparação, a marca, heading, campos, CTA e ações sociais ficaram alinhados com diferenças de poucos pixels. O formulário de cadastro também passou a centralizar os placeholders e a usar o CTA móvel “Criar perfil”, conforme o frame mobile; desktop mantém “Criar conta”.

As referências desktop têm 2880 × 3962 px (2x). A composição do dialog foi ajustada para 500 px de largura, 80 px de padding lateral e posições verticais distintas para login/cadastro. As capturas resultantes correspondem à largura do painel, largura dos campos, posição e altura visual do dialog nas referências. A revisão incluiu header, artwork de fundo, abas, fechamento, introdução, inputs, CTA e ações sociais.

## Evidência e limite

As capturas Playwright desktop têm 1440 × 900 px (viewport do projeto), enquanto os frames exportados do Figma têm 1440 × 1981 CSS px após normalização. A comparação visual foi feita com as capturas e referências à mesma escala, priorizando o dialog/modal e a composição visível. O arquivo desktop do navegador representa o viewport de 900 px; o frame longo do Figma continua sendo a referência para a composição de fundo fora desse viewport.

Resultado da rodada: **visual aprovado internamente para login e cadastro em mobile e desktop**, sem overflow horizontal. A validação funcional dos viewports 390/768/1440 é registrada pela suíte completa. Não foram usados screenshots do Figma como assets da aplicação.

# Lote 06 — Revisão visual

As referências desktop foram abertas individualmente em resolução original:

- `design-reference/Desktop/Perfil do Colecionador.png` (1440 × 1657 CSS px)
- `design-reference/Desktop/Carteiras.png` (1440 × 1657 CSS px)

Não há frames mobile de Perfil ou Carteiras. As capturas mobile foram revisadas como derivação dos padrões mobile aprovados, sem alegar correspondência pixel a pixel com um frame inexistente.

## Perfil

Capturas revisadas: `profile-desktop-1440-review.png` e `profile-mobile-390-review.png`.

A versão desktop mantém header, navegação de conta lateral, conteúdo principal, avatar, campos em duas colunas e seção de senha em coluna única. Na rodada de comparação, movi o título “Meu perfil” para a navegação da conta, deixei “Perfil do colecionador” como título do conteúdo principal e limitei a largura da seção de senha, aproximando a hierarquia e o alinhamento do frame. A versão mobile troca a sidebar por navegação refluída, usa uma coluna e mantém avatar, formulários e ações sem overflow.

Diferenças restantes: navegação contém somente as opções existentes no escopo implementado; o frame inclui links para outras áreas do produto. O layout coloca o editor de avatar junto ao heading, não dentro de uma linha de formulário. O seletor visual `.eth` e ícones de mostrar senha não foram adicionados porque o contrato atual armazena um único nome ENS e não há requisito de controle de visibilidade.

## Carteiras

Capturas revisadas: `wallets-desktop-1440-review.png` e `wallets-mobile-390-review.png`.

Ambas mantêm o header, a navegação de conta, o título principal, texto explicativo e tipografia/cores do produto. As carteiras persistidas são apresentadas como cartões com rede, função, endereço e ações de editar/promover. No mobile, cartões empilham em uma coluna; endereços podem ser visualmente truncados/quebrados, mas o valor integral continua acessível. Confirmei ausência de overflow nos três viewports pelo Playwright.

Diferença conhecida: o frame desktop mostra um formulário de cadastro vazio para a carteira principal e um espaço vazio para a secundária. A captura usa os dois registros determinísticos já disponíveis no checkout para demonstrar a listagem e a invariável principal/secundária; o formulário de adicionar/editar abre a partir das ações. O formulário usa apenas campos apoiados pelo contrato (`apelido`, `rede`, `endereço`, `ENS`) e omite dados sem suporte de perfil, indicação e email.

## Evidência e limites

As quatro imagens desta pasta foram geradas pelos testes Playwright no browser real do host. Os smoke funcionais cobrem 390, 768 e 1440 px. Nenhum screenshot de referência é importado ou renderizado pela aplicação. As diferenças tipográficas gerais continuam limitadas pela fonte exata do Figma ainda não identificada (lacuna Q1).

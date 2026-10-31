# Revisão visual — Lote 02

Data da inspeção: 2026-10-30. Referências abertas individualmente em resolução suficiente; comparadas com as capturas anteriores a esta rodada em `home-mobile-390-review.png`, `home-desktop-1440-review.png`, `detail-mobile-390-review.png` e `detail-desktop-1440-review.png`.

| Área | Diferença observada | Correção aplicada | Verificação pendente |
| --- | --- | --- | --- |
| Home mobile | Headline desktop longa quebrava em quatro linhas e hero/catálogo começavam mais abaixo que no frame. | Mantido o texto exato do Figma mobile, “SEJA DONO DA CULTURA DIGITAL”, com ajuste de tipografia/altura do hero. | Recapturar em 390×844 e 414×896 e confirmar quebra/altura. |
| Home desktop | Sidebar acabava nos filtros, mas o Figma mostra card “NFT em destaque / Oferta limitada” abaixo deles. | Adicionado card de destaque no sidebar desktop; oculto em layout móvel onde o frame não o mostra. | Recapturar 1440 e confirmar dimensões/posição. |
| Detalhe mobile | Botões de voltar/favoritar estavam ancorados ao painel de informações por `top: -374px`, vulnerável à altura do artwork; imagem começava no topo, enquanto o Figma reserva uma faixa superior aos controles. | Ações movidas para a galeria, `top: 14px`; galeria reserva `66px` antes do artwork. | Recapturar 390/414 e validar sobreposição e interação. |
| Detalhe mobile — edição esgotada | Mensagem de indisponibilidade estava só no resumo desktop, escondido em mobile. | Adicionado status visível na região sticky “Resumo da compra”. | Testar disponibilidade, acessibilidade e sobreposição em browser. |
| Capturas | Full-page mobile produzia imagem de milhares de pixels e posicionava o elemento fixo em local inadequado para comparação com frames de ~896 CSS px. | Captura mobile alterada para viewport; desktop permanece full-page para avaliar composição longa. | Gerar novas capturas e comparar após correções. |

## Diferenças conhecidas

- Nota histórica: os quatro retratos eram provisórios na primeira rodada; a seção “Atualização dos assets” abaixo registra sua substituição pelos PNGs originais.
- A fonte Figma exata ainda não foi identificada (Q1); o fallback mono muda métricas e quebras tipográficas.
- As capturas na tabela são anteriores às correções. O sandbox impede iniciar Vite (`listen EPERM` em `127.0.0.1:4180`), portanto nenhuma correção visual foi aprovada por screenshot pós-mudança.

## Segunda rodada — 2026-10-30

As quatro referências originais foram reabertas individualmente e comparadas com as capturas de revisão existentes. As capturas disponíveis são anteriores aos ajustes desta rodada; nenhuma captura de aplicação pós-ajuste foi possível.

| Área | Diferença confirmada na referência | Ajuste implementado | Evidência pós-ajuste |
| --- | --- | --- | --- |
| Home mobile | O Figma não exibe o contador “19 obras”; hero termina antes e catálogo começa logo após tabs; ação central é ícone de coleção; nav inferior é mais alta e levanta o botão central. | Contador removido; hero ajustado para 190px com tipo/line-height menores; ação central usa ícone de coleção; nav passa a 92px. O texto segue “SEJA DONO DA CULTURA DIGITAL”. | Pendente: bind Vite negado por EPERM. |
| Home desktop | O estado visual tem 12 cards em quatro filas de três, Emerald Ape #042 inicia o catálogo, e footer editorial é mais alto que a captura antiga. | Page size/query key/skeleton alterados para 12; datas do conjunto default priorizam Emerald e itens seguintes da referência; footer expandido por blocos (promises, faixa de marca e links). | Pendente: bind Vite negado por EPERM. |
| Detalhe mobile | Artwork é mais baixo, painel começa próximo à base da arte; o frame mostra copy Emerald Ape, preço e edição antes do resumo sticky. | Artwork passou a proporção aproximada 1.09:1 e painel inicia logo após a imagem; fixture inclui descrição Figma e o resumo permanece sticky. CTA ativo encaminha ao placeholder de login/carrinho futuro, sem simular compra. | Pendente: bind Vite negado por EPERM. |
| Detalhe desktop | Descrição do produto/descrição longa e distância editorial até footer contribuem para o frame de 2246px; a captura anterior tinha 1962px. | Copy principal da fixture e texto de detalhe aproximados ao frame; dimensões do footer aumentadas por seção, sem padding vazio adicionado após o conteúdo. | Pendente: bind Vite negado por EPERM. |

Na segunda rodada, os originais ainda não estavam disponíveis; os caminhos provisórios descritos naquele registro foram substituídos na rodada atual. Screenshot algum foi recortado ou usado na UI.

## Atualização dos assets — 2026-10-30

Inspecionei individualmente os quatro PNGs recebidos (500×500 RGBA) e confirmei as identidades pelos nomes/arte: Emerald Ape, Golden Beat, Neon Vessel (gorila de casaco claro e gola verde) e Sage Nomad. Os paths correspondentes nas fixtures passaram a apontar para os quatro PNGs originais. A Home usa as mesmas URLs para hero, cards, destaque, banners e conteúdo editorial. `NFTArtwork` declara as dimensões naturais de 500×500; CSS mantém `object-fit: cover` e `object-position: center`, sem deformar os PNGs. Cards e galerias mantêm o crop definido pelos frames e seus containers.

Busca nos arquivos de aplicação não encontrou mais referências `.webp`; `public/assets/nfts/` já continha somente os quatro PNGs no início desta retomada, portanto nenhum arquivo físico foi removido. As fixtures sem asset original usam os PNGs como placeholders identificados no ADR-004/Q2. As capturas visuais da aplicação não puderam ser atualizadas nesta sessão porque o servidor local continua bloqueado por `listen EPERM`; a revisão pixel/visual pós-substituição permanece pendente.

## Diagnóstico reset MSW — ainda sem causa concreta observável

Comparação estática dos requests: foundation usa Axios com base `/api` e caminho `/test-scenarios/reset`; o helper usa `fetch` para `/api/test-scenarios/reset`. Ambos resolvem para `POST {location.origin}/api/test-scenarios/reset`. Ambos enviam JSON e o handler dedicado não filtra headers; os valores de cenário enviados pelo helper pertencem ao union/type permitido. O array final inclui `scenarioHandlers` e o worker é servido de `/mockServiceWorker.js` com scope raiz. Não foi encontrada diferença concreta de path, método, import, base URL ou scope no código.

Para a próxima execução, o erro do helper agora inclui URL resolvida, controller ativo e registrations/scopes do Service Worker; o teste foundation registra e valida URL, método, body e os dois status 200 do Axios. Isso é instrumentação de diagnóstico no caminho de falha/assertions, sem alteração do transporte ou endpoint. Como não foi possível rodar o browser nem os traces externos estavam presentes no checkout, o 404 não está resolvido e readiness não é considerado uma correção confirmada.

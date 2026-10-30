# Contexto do Projeto

## Produto

Marketplace de NFTs com marca visual **KURIO**, cobrindo descoberta, detalhe, carrinho, checkout e conta do colecionador.

## Objetivo do desafio

A avaliação não é apenas de UI. O README atribui peso relevante a:

- fidelidade visual e responsividade;
- fluxos e experiência;
- integração e estado;
- tempo real;
- mocking;
- testes;
- acessibilidade;
- performance;
- arquitetura e documentação.

## Escopo funcional principal

Telas previstas:
- Início
- Detalhes do NFT
- Carrinho de NFTs
- Pagamento
- Confirmação de pedido
- Login
- Cadastro
- Perfil do colecionador
- Carteiras

## Referências visuais recebidas

### Desktop
- Início
- Detalhes do NFT
- Carrinho de NFTs
- Pagamento
- Confirmação de Pedido
- Login
- Cadastro
- Perfil do Colecionador
- Carteiras

### Mobile
- Início
- Detalhes do NFT
- Carrinho de NFTs
- Pagamento
- Login
- Cadastro

Não existem referências mobile específicas para:
- Perfil do Colecionador
- Carteiras
- Confirmação de Pedido

Essas três telas precisam funcionar em mobile segundo o README. Devem ser derivadas da linguagem mobile existente e qualquer decisão relevante deve ser registrada em `DECISIONS.md`.

## Linguagem visual observada nas referências

Observações derivadas das imagens, não substituem o Figma:

- fundo quase preto/marrom;
- superfícies em marrom escuro;
- cor de destaque laranja/âmbar;
- textos principais em branco/quase branco;
- textos auxiliares em bege;
- estética editorial/retro;
- tipografia predominantemente monoespaçada ou de aparência monoespaçada;
- cards de NFT com arte grande e informação compacta;
- desktop com header horizontal e layout amplo;
- mobile com navegação inferior e cards empilhados;
- botões principais sólidos em laranja;
- estados secundários frequentemente outlined;
- bordas e divisores discretos em tons terrosos;
- imagens com cantos arredondados;
- densidade visual maior no desktop e simplificação funcional no mobile.

Paleta aproximada observada em pixels das referências:
- background: `#1B110D` / `#140D0A`
- surface: `#241612`
- accent: região de `#D69758` / `#D28A4C`
- cream: região de `#EDECD2`

**Esses hex são aproximações**, não tokens oficiais. Validar contra o Figma ou as screenshots antes de consolidar.

## Dimensões das referências exportadas

As imagens foram exportadas em 2x.

### Desktop
- Início: 2880 × 7336 → aproximadamente 1440 × 3668 CSS px
- Detalhes: 2880 × 4492 → aproximadamente 1440 × 2246
- Carrinho: 2880 × 3508 → aproximadamente 1440 × 1754
- Pagamento: 2880 × 3314 → aproximadamente 1440 × 1657
- Confirmação: 2880 × 3314 → aproximadamente 1440 × 1657
- Login: 2880 × 3962 → aproximadamente 1440 × 1981
- Cadastro: 2880 × 3962 → aproximadamente 1440 × 1981
- Perfil: 2880 × 2160 → aproximadamente 1440 × 1080
- Carteiras: 2880 × 2160 → aproximadamente 1440 × 1080

### Mobile
Todas as telas: 828 × 1792 → aproximadamente 414 × 896 CSS px.

## Assets

As screenshots são referência visual, não devem ser usadas como “a tela pronta”.

Ainda é necessário confirmar/exportar quando possível:
- imagens originais dos NFTs;
- logo em vetor/texto conforme Figma;
- ícones customizados;
- fontes exatas.

Ver `OPEN_QUESTIONS.md`.

## Estratégia de entrega

A implementação é dividida em lotes. Prioridade:
1. eliminar riscos de desclassificação;
2. criar arquitetura funcional;
3. construir fluxos principais;
4. fechar real-time e cenários de falha;
5. consolidar testes e visual;
6. auditar performance;
7. preparar defesa técnica.

O objetivo é evitar um grande “big bang” no fim.

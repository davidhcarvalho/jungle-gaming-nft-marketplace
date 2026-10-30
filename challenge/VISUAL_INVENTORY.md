# Inventário Visual

## Fonte

Referências exportadas do Figma em `design-reference/`.

## Desktop

| Tela | Arquivo | Export | Base CSS aproximada |
|---|---|---:|---:|
| Início | `Desktop/Início.png` | 2880×7336 | 1440×3668 |
| Detalhes | `Desktop/Detalhes do NFT.png` | 2880×4492 | 1440×2246 |
| Carrinho | `Desktop/Carrinho de NFTs.png` | 2880×3508 | 1440×1754 |
| Pagamento | `Desktop/Pagamento.png` | 2880×3314 | 1440×1657 |
| Confirmação | `Desktop/Confirmação de Pedido.png` | 2880×3314 | 1440×1657 |
| Login | `Desktop/Login.png` | 2880×3962 | 1440×1981 |
| Cadastro | `Desktop/Cadastro.png` | 2880×3962 | 1440×1981 |
| Perfil | `Desktop/Perfil do Colecionador.png` | 2880×2160 | 1440×1080 |
| Carteiras | `Desktop/Carteiras.png` | 2880×2160 | 1440×1080 |

## Mobile

| Tela | Arquivo | Export | Base CSS aproximada |
|---|---|---:|---:|
| Início | `Mobile/Início.png` | 828×1792 | 414×896 |
| Detalhes | `Mobile/Detalhes do NFT.png` | 828×1792 | 414×896 |
| Carrinho | `Mobile/Carrinho de NFTs.png` | 828×1792 | 414×896 |
| Pagamento | `Mobile/Pagamento.png` | 828×1792 | 414×896 |
| Login | `Mobile/Login.png` | 828×1792 | 414×896 |
| Cadastro | `Mobile/Cadastro.png` | 828×1792 | 414×896 |

## Telas sem frame mobile

- Perfil do Colecionador
- Carteiras
- Confirmação de Pedido

Derivar usando a linguagem mobile das demais telas.

## Padrões observados

### Desktop
- header superior com logo KURIO, navegação central e ações à direita;
- container amplo centralizado;
- fundo marrom muito escuro;
- laranja como foco, CTA, active state e preço;
- hero assimétrico;
- catálogo com sidebar de filtros e grid de cards;
- divisores finos;
- cards e campos com superfícies discretamente mais claras;
- footer editorial com múltiplas colunas.

### Mobile
- conteúdo ocupa praticamente toda a largura com margens laterais;
- controles maiores para toque;
- navegação inferior no catálogo;
- cabeçalhos simplificados;
- filtros recolhidos/acionados por botão;
- cards mais altos e visuais;
- checkout organizado em cards empilhados;
- CTAs largos próximos ao rodapé da viewport.

## Regra de comparação

Nunca comparar screenshots em escalas diferentes.

Para desktop:
- referência exportada 2x → reduzir conceitualmente para 50%;
- capture app em 1440 CSS px.

Para mobile:
- referência exportada 2x → reduzir conceitualmente para 50%;
- capture em 414 CSS px para comparação direta;
- depois validar 390 px por requisito.

## Ordem de fidelidade

1. macro-layout;
2. container/grid;
3. imagens e aspect ratio;
4. spacing;
5. tipografia;
6. cores;
7. bordas/radius;
8. microalinhamentos;
9. estados hover/focus/disabled.

## Observação sobre screenshots

Esses arquivos são referência. Não usar uma screenshot inteira como background para “passar” em regressão visual.

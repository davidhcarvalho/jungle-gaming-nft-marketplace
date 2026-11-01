# Lighthouse — rodada final do Final Polish

Request `1793552324-575891-33` completou as 12 medições após as alterações de navegação e checkout. O alvo foi o preview Vite de produção, construído com `VITE_ENABLE_MOCKS=true`, nunca o servidor de desenvolvimento. A configuração usa Lighthouse 13.6.0 no Node 24.22.1, três execuções por página/perfil, mobile 390×844 e desktop 1440×900 com `formFactor: desktop`, `mobile: false` e `disabled: false`. O batch completo e auditável está em `evidence/lighthouse/batch-2026-11-01T16-58-48-327Z/`; contém os 12 pares HTML/JSON e `summary.md`/`summary.json`.

| Página / perfil | Performance mediana | Accessibility | Best Practices | SEO | LCP mediano | CLS mediano | TBT mediano |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home mobile | 75 | 100 | 100 | 100 | 3706.27 ms | 0 | 582 ms |
| Home desktop | 50 | 96 | 100 | 100 | 3806.70 ms | 0.07 | 768 ms |
| Detalhe mobile | 78 | 100 | 100 | 100 | 3520.92 ms | 0 | 529.5 ms |
| Detalhe desktop | 52 | 96 | 100 | 100 | 3919.36 ms | 0.03 | 712.88 ms |

As metas do README são Performance ≥90, Accessibility ≥95, Best Practices ≥95 e SEO ≥90. Accessibility, Best Practices e SEO atingem as metas. Performance fica abaixo da meta nos quatro grupos; isso está identificado como desvio, com causas observadas nos relatórios, e não foi mascarado por alteração de configuração ou desativação de funcionalidades. O README exige justificar metas abaixo, mas não classifica esse score isoladamente como gate eliminatório.

## Diagnóstico observado

- LCP é a arte Emerald Ape na Home e no detalhe. No detalhe, o carregamento do recurso é curto e o maior componente de atraso é a renderização do elemento: mediana de 544.4 ms no mobile e 741.8 ms no desktop. Na Home mobile, a mediana inclui 501 ms de atraso no carregamento do recurso e 184.2 ms de renderização; no desktop, 25 ms de atraso de recurso e 793.3 ms de renderização.
- As medições registram 20 long tasks por execução representativa, com tarefas de até 217 ms no bundle principal e 153 ms no worker/browser MSW. O boot-up mediano fica aproximadamente entre 1.8 e 2.1 s. O diagnóstico estima 81–82 KiB de JavaScript não usado na navegação inicial (aproximadamente 43 KiB do binding de handlers/MSW e 40 KiB do entry da aplicação).
- A auditoria de entrega de imagens estima economia restante de 19 KiB somente para a arte hero desktop de 500×500 exibida a 350×350; nos demais grupos a economia mediana é zero. A aplicação já serve WebP e variantes responsivas. Não foi reduzida artificialmente a imagem do design para perseguir esse ganho.
- Nenhuma fonte `.woff`, `.ttf` ou `.otf` foi solicitada nas medições. Os relatórios não apontam o carregamento de fonte como causa de atraso.
- O custo dominante restante é CPU/startup e renderização sob throttling simulado do Lighthouse. A auditoria manteve a inicialização MSW e a cadeia real Axios/MSW; remove-las faria a demo deixar de validar os fluxos exigidos. O realtime continua usando `socket.io-client` e o binding Socket.IO da demo.

Os arquivos individuais preservados permitem auditar o LCP element, breakdown, long tasks, JavaScript não utilizado, imagens, fontes e métricas em cada execução. Nenhum HTML Lighthouse foi editado manualmente.

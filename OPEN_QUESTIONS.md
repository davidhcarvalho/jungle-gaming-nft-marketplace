# Questões Abertas e Lacunas

Este arquivo contém apenas lacunas reais. Não usar como desculpa para interromper trabalho que pode ser derivado com segurança.

## Q1 — Fonte exata

As screenshots sugerem tipografia monoespaçada/retro, mas o nome da fonte não foi extraído.

**Ação preferida:** consultar Figma ou exportar informação tipográfica.  
**Plano temporário:** escolher a alternativa local/web mais próxima somente se necessário e documentar a substituição.

## Q2 — Assets originais dos NFTs

Os assets principais `emerald-ape.png`, `golden-beat.png`, `neon-vessel.png` e `sage-nomad.png` foram exportados do Figma e agora são usados para as identidades correspondentes. Fixtures adicionais sem arte própria reutilizam esses arquivos como fallback visual provisório: Sage Nomad em Cosmic Bloom/Violet Nomad/Sage Afterglow/Generative Mist; Emerald Ape em Sunset Ape/Rare Keeper; Golden Beat em Fast Current/Golden Signal/Golden Hour/Golden Dawn; Neon Vessel em Ivory Baron/Quiet Orbit/Ivory Echo/Silent Voyager.

**Ação preferida:** exportar assets específicos das fixtures adicionais caso fidelidade visual dessas obras também seja exigida.  
**Não fazer:** usar screenshots inteiras ou recortes delas como assets da aplicação.

## Q3 — Ícones específicos

Search, carrinho, usuário, carteira etc. podem vir de biblioteca ou assets do Figma.

**Ação:** usar asset real quando existir; caso contrário, usar ícone equivalente coerente e documentar se houver desvio perceptível.

## Q4 — Breakpoint exato do design

Existem referências em 1440 e ~414 CSS px, mas não um frame tablet.

**Ação:** implementar comportamento fluido e validar obrigatoriamente 390, 768 e 1440 conforme README.

## Q5 — Valores exatos de tokens

Cores aproximadas podem ser extraídas das screenshots, mas não são garantia dos tokens do Figma.

**Ação:** tratar screenshot como fonte visual e ajustar por comparação.

## Q6 — Validação Playwright bloqueada por política de bind local

Na última execução externa informada, 42 testes resultaram em 37 PASS, 3 FAIL e 2 SKIPPED. As falhas eram o mesmo teste de erro do catálogo nos três viewports; os cenários/reset e outros fluxos estavam passando nessa suíte. A assertion do teste falho foi corrigida conforme a semântica de nova query, e foi separado um teste de refetch em background. Typecheck/lint/build/build-mocks passaram com Node 24.22.1. Nesta sandbox, Playwright não inicia porque o webServer Vite recebe `listen EPERM` ao tentar bind em `127.0.0.1` (confirmado também na porta alternativa 4199). Portanto faltam execução browser após esta correção, suíte completa e revisão final das evidências visuais; não falta browser instalado nem dependência do sistema.

**Ação necessária:** executar em ambiente que permita bind o teste de nova query e o teste de refetch em background, depois a suíte completa (incluindo foundation), validar viewports/console/rede e revisar as capturas atuais de `evidence/lot-02/`. Não alterar MSW/reset sem nova evidência de regressão.

# Questões Abertas e Lacunas

Este arquivo contém apenas lacunas reais. Não usar como desculpa para interromper trabalho que pode ser derivado com segurança.

## Estado dos Lotes 04–06

Os Lotes 04, 05 e 06 foram validados e aprovados. No Lote 06, `spec:profile-wallets` passou (70 PASS, 2 SKIPPED) e `full` passou (222 PASS, 9 SKIPPED, sem falhas; typecheck/lint/build/build com mocks verdes). Não há bloqueios ambientais ou funcionais em aberto para os Lotes 04–06. As lacunas gerais Q1–Q5 abaixo continuam válidas; Lote 07 ainda não iniciado.

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

## Q6 — Reexecução externa do Lote 03 — RESOLVIDA

O Local Validation Runner executou `spec:auth-favorites` e `full` no host. O spec passou (25 PASS, 2 SKIPPED); o target full passou em typecheck/lint/build/build com mocks e na suíte E2E (68 PASS, 4 SKIPPED, 0 FAIL de 72). Capturas Login/Cadastro foram geradas e comparadas com as referências, com uma rodada de correção responsiva. Request IDs e detalhes estão em `PROGRESS.md`; revisão visual em `evidence/lot-03/visual-review.md`.

Não há bloqueio de browser pendente. Lotes 04–06 estão aprovados; Lote 07 continua não iniciado.

# Lighthouse quality report

Generated: 2026-11-01T05:35:28.576Z
Node: v24.22.1 · Lighthouse: 13.6.0
OS: Linux 7.2.8-9-omarchy x64
Chrome: /home/ventus/Documents/Teste Tecnico/Jungle_Gaming_Test/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome
Preview: http://127.0.0.1:4173 (production build with mocks enabled)
Conditions: Vite production preview built with VITE_ENABLE_MOCKS=true; Lighthouse mobile emulation 390×844 and desktop emulation 1440×900; simulated throttling; three independent runs per page/profile.

| Page/profile | Runs | Performance | Accessibility | Best Practices | SEO | LCP median (ms) | CLS median | TBT median (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| home-mobile | 3/3 | 78 | 100 | 100 | 100 | 3648.61 | 0 | 478 |
| home-desktop | 3/3 | 50 | 96 | 100 | 100 | 3816.61 | 0.07 | 767.37 |
| detail-mobile | 3/3 | 78 | 100 | 100 | 100 | 3531.64 | 0 | 513.44 |
| detail-desktop | 3/3 | 52 | 96 | 100 | 100 | 3931.29 | 0.03 | 711 |

Targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

Individual HTML and JSON reports are stored beside this file. The summary contains per-run scores, LCP, CLS, TBT, browser user agent, and Lighthouse warnings.

No failed audit runs.

Below-target medians (reported for README justification; measurements completed):
- home-mobile performance: 78 (target 90)
- home-desktop performance: 50 (target 90)
- detail-mobile performance: 78 (target 90)
- detail-desktop performance: 52 (target 90)

Batch report directory: evidence/lighthouse/batch-2026-11-01T05-33-36-228Z/

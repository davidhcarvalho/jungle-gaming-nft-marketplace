# Lighthouse quality report

Generated: 2026-11-01T04:42:06.614Z
Node: v24.22.1 · Lighthouse: 13.6.0
OS: Linux 7.2.8-9-omarchy x64
Chrome: /home/ventus/Documents/Teste Tecnico/Jungle_Gaming_Test/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome
Preview: http://127.0.0.1:4173 (production build with mocks enabled)
Conditions: Vite production preview built with VITE_ENABLE_MOCKS=true; Lighthouse mobile emulation 390×844 and desktop emulation 1440×900; simulated throttling; three independent runs per page/profile.

| Page/profile | Runs | Performance | Accessibility | Best Practices | SEO | LCP median (ms) | CLS median | TBT median (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| home-mobile | 3/3 | 75 | 100 | 100 | 100 | 3765.39 | 0 | 572.5 |
| home-desktop | 3/3 | 52 | 96 | 100 | 100 | 3753.44 | 0.07 | 666.5 |
| detail-mobile | 3/3 | 75 | 100 | 100 | 100 | 3681.79 | 0 | 557.5 |
| detail-desktop | 3/3 | 52 | 96 | 100 | 100 | 3921.71 | 0.03 | 676 |

Targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.

Individual HTML and JSON reports are stored beside this file. The summary contains per-run scores, LCP, CLS, TBT, browser user agent, and Lighthouse warnings.

No failed audit runs.

Below-target or incomplete medians:
- home-mobile performance: 75 (required 90)
- home-desktop performance: 52 (required 90)
- detail-mobile performance: 75 (required 90)
- detail-desktop performance: 52 (required 90)

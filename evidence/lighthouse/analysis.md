# Lighthouse analysis

The latest complete batch is Request `1793502860-485327-11`: 12 Lighthouse 13.6.0 runs on Node 24.22.1, production Vite preview with `VITE_ENABLE_MOCKS=true`, mobile 390×844 and desktop 1440×900, three runs per Home/detail and profile. Individual HTML/JSON reports and the generated summary are stored beside this file. The batch completed all runs but exits FAIL because all four Performance medians remain below the documented target.

| Page/profile | Performance | Accessibility | Best Practices | SEO | LCP median | CLS median | TBT median |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home mobile | 75 | 100 | 100 | 100 | 3,839.10 ms | 0 | 557.07 ms |
| Home desktop | 49 | 100 | 100 | 100 | 4,067.81 ms | 0.07 | 735 ms |
| NFT detail mobile | 75 | 100 | 100 | 100 | 3,684.60 ms | 0 | 578.50 ms |
| NFT detail desktop | 52 | 96 | 100 | 100 | 4,021.19 ms | 0.03 | 685.89 ms |

The challenge targets are Performance ≥90, Accessibility ≥95, Best Practices ≥95, and SEO ≥90. This batch meets the last three categories in every group; it does not meet Performance. Do not treat this as a fully passing Lighthouse gate.

## Corrections and measured effect

- Added a real `favicon.svg` and a valid `robots.txt`. The previous audit found the default favicon request returning 404 and Lighthouse was parsing the SPA fallback HTML as `robots.txt`; current batch records Best Practices 100 and SEO 100 in all groups.
- The four original 500×500 PNG assets remain intact. Their UI derivatives are now WebP quality 88, at 32–41 kB each versus 262–279 kB for the earlier lossless WebPs. All four pairs were reviewed side by side at display size; no perceptible degradation was seen. Compared with Request `1793502681-485327-10`, mobile Home Performance improved from 65 to 75 and detail from 68 to 75; mobile LCP medians improved from 4,794.62/4,691.07 ms to 3,839.10/3,684.60 ms. Desktop LCP improved from about 4.96/4.97 s to about 4.07/4.02 s, though desktop Performance remains 49/52.
- Route-level `React.lazy` reduced the normal entry from about 514 kB (158.66 kB gzip) to 253.32 kB (79.25 kB gzip). The demo entry is 317.05 kB (102.27 kB gzip); MSW and the Socket.IO binding remain loaded in separate chunks because the public demo must retain those real network layers.
- The realtime client now waits for the first content paint before opening its Socket.IO connection. It still connects through `socket.io-client`; this change does not alter REST/MSW bootstrap or bypass any scenario. Request `1793502458-485327-9` validated all 27 realtime cases after this change.
- The first audit's decorative-dot ARIA issue and undersized price-slider targets were corrected. Current Accessibility medians are 96–100.

## Remaining performance work

The latest Lighthouse diagnostics still attribute the main cost to JavaScript startup and CPU work with Lighthouse's simulated mobile profile (4× CPU slowdown), including the required MSW browser interceptor/handlers and the React marketplace bootstrap. The page image is now much smaller and remains preloaded, but desktop medians are still below 55 and TBT is roughly 686–735 ms. No audit disables mocks, substitutes local fixtures into the UI, or omits the Socket.IO stack. Further reduction must preserve those requirements and be measured; otherwise document the observed limitation as an explicit Lot 08 deviation rather than altering the thresholds or audit settings.

The harness starts the installed Playwright Chromium with an isolated temporary profile, waits for DevTools readiness, and runs production preview output. All 12 reports are complete; incomplete batches are not accepted by the script.

## Latest measurement and interpretation (2026-11-01)

The newest complete run is Request `1793511419-550281-4`, batch `batch-2026-11-01T05-37-02-591Z/`. It ran on Node 24.22.1/Lighthouse 13.6.0 against Vite's optimized production preview with mocks enabled. The runner confirms 12/12 valid audits, three independent measurements per page/profile. Desktop is explicitly configured with `formFactor: 'desktop'` and `screenEmulation: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false, disabled: false }`; mobile uses the corresponding 390×844 mobile emulation. The report's preview origin is `http://127.0.0.1:4173`, served by `vite preview`, not the development server.

| Page/profile | Performance | Accessibility | Best Practices | SEO | LCP median | CLS median | TBT median |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home mobile | 69 | 100 | 100 | 100 | 3,727.28 ms | 0 | 916.50 ms |
| Home desktop | 49 | 96 | 100 | 100 | 3,741.02 ms | 0.07 | 876 ms |
| NFT detail mobile | 76 | 100 | 100 | 100 | 3,531.19 ms | 0 | 539 ms |
| NFT detail desktop | 52 | 96 | 100 | 100 | 3,919.25 ms | 0.03 | 699 ms |

The README requires three measurements and reported medians, identifies the category goals, and requires that misses be explained. A sub-90 Performance median is therefore recorded as a deviation, not by itself an elimination/blocking condition. Accessibility, Best Practices, and SEO meet their goals in all four groups. No setting was relaxed and the full mocked app/network stack remained enabled.

### Diagnostic evidence and bounded final optimization

- The optimized image variants and responsive `srcSet` were measured in this batch. Image transfer is no longer the dominant cost: image-delivery savings are zero in the three mobile/detail groups; the only remaining opportunity is about 19 KiB for the desktop Home hero displayed at 350 px. The first Home mobile catalog artwork is eager/high-priority in the rendered DOM, but Lighthouse still reports it as not discoverable from the initial HTML because it only enters the document after the authoritative catalog request completes. This is a consequence of preserving the required REST→Axios→MSW catalog flow rather than rendering imported fixture data directly.
- Median LCP breakdown (TTFB / resource-load delay / resource duration / element-render delay): Home mobile 8 / 525 / 94 / 246 ms; Home desktop 6 / 42 / 10 / 832 ms; detail mobile 4 / 22 / 14 / 569 ms; detail desktop 5 / 32 / 11 / 754 ms. Network transfer is short on the desktop hero and both detail pages; the long desktop render delay plus JavaScript work explains why smaller images alone cannot bring those scores to 90.
- Median Total Blocking Time is 539–917 ms. Each representative report records 20 long tasks; observed individual tasks include the required MSW browser bundle (up to 281 ms) and app entry/bootstrap code (up to 229 ms). Boot-up-time medians are about 1.9–2.8 s, with roughly 81–83 KiB estimated unused JS under each route's initial-load audit. These costs arise from parsing/starting the mocked app and the browser interceptor under Lighthouse's simulated CPU/network throttling, while the app has to retain its REST/MSW and Socket.IO behavior.
- Lighthouse reports a CSS render-blocking opportunity of about 311–318 ms (17 kB stylesheet). No font files were requested in the network audit, so font download/display is not a measured source of delay. The desktop Home image audit identifies about 19 KiB remaining image-delivery savings; all other groups report none. We did not add an artificially undersized hero image or change layout/design solely to chase this modest estimated saving, and we did not split more code without evidence it addresses the dominant execution cost.
- The WebP/responsive-image optimization and loading hints are the final targeted media changes; repeated code-splitting experiments already reduced entry bytes slightly without materially improving scores. Remaining scores are accepted and reported per README semantics, with runtime, TBT, LCP breakdown, unused JS, long tasks, image delivery, and font requests preserved in all 12 HTML/JSON reports in the batch directory above.

## Revalidation after realtime code splitting

Request `1793508017-485327-23` repeated the full 12-run matrix after moving the Socket.IO client and event consumer into dynamic imports at the existing post-LCP connection point. `spec:realtime-failures` passed 27/27 immediately before this audit (Request `1793507827-485327-22`). The provider remains mounted, the real `socket.io-client` connection is retained, and the REST/MSW bootstrap order is unchanged.

| Page/profile | Performance | Accessibility | Best Practices | SEO | LCP median (ms) | CLS median | TBT median (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home mobile | 75 | 100 | 100 | 100 | 3,765.39 | 0 | 572.5 |
| Home desktop | 52 | 96 | 100 | 100 | 3,753.44 | 0.07 | 666.5 |
| NFT detail mobile | 75 | 100 | 100 | 100 | 3,681.79 | 0 | 557.5 |
| NFT detail desktop | 52 | 96 | 100 | 100 | 3,921.71 | 0.03 | 676 |

The measured entry shrank from 317.05 kB to 314.96 kB (gzip 102.28 to 101.62 kB); this did not materially improve the score. The audit's bootup/main-thread diagnostics still identify JavaScript startup, notably the required MSW browser interceptor and marketplace bootstrap under the Lighthouse environment, while media transfer is no longer the dominant issue. The mobile LCP candidate on Home is the first catalog image, which is already preloaded but only inserted after the authoritative catalog request returns. The audit intentionally keeps the standard scenario mocks enabled and does not bypass the API path. Performance remains below the README's ≥90 target in all four groups; this is a real open acceptance gate, not an environmental failure or accepted exception.

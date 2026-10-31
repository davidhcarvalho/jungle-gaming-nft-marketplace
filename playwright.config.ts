import { defineConfig } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4180)
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PLAYWRIGHT_PORT deve ser uma porta TCP válida.')
}
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      VITE_ENABLE_MOCKS: 'true',
      VITE_MOCK_SCENARIO: 'default',
      VITE_API_BASE_URL: '/api',
    },
  },
})

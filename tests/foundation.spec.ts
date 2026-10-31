import { expect, test } from '@playwright/test'

test('TanStack Query → Axios → MSW health request and scenario reset', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  let resetRequestCount = 0
  const resetRequests: Array<{ url: string; method: string; body: string | null }> = []
  const resetStatuses: number[] = []
  page.on('request', (request) => {
    if (request.url().endsWith('/api/test-scenarios/reset')) {
      resetRequestCount += 1
      resetRequests.push({ url: request.url(), method: request.method(), body: request.postData() })
    }
  })
  page.on('response', (response) => {
    if (response.url().endsWith('/api/test-scenarios/reset')) resetStatuses.push(response.status())
  })
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  await page.goto('/__foundation/smoke')
  await expect(page.locator('html')).toHaveAttribute('data-msw-ready', 'true')
  await expect(page.getByRole('heading', { name: 'Request da foundation' })).toBeVisible()
  await expect(page.getByTestId('mock-source')).toHaveText('msw')
  await expect(page.getByTestId('mock-scenario')).toHaveText('default')

  await page.locator('#scenario-choice').selectOption('api-error')
  await page.getByRole('button', { name: 'Aplicar cenário' }).click()
  await expect(page.getByTestId('mock-scenario')).toHaveText('api-error')
  await expect.poll(() => resetRequestCount).toBe(1)
  await page.getByRole('button', { name: 'Resetar cenário' }).click()
  await expect(page.getByTestId('mock-scenario')).toHaveText('default')
  await expect.poll(() => resetRequestCount).toBe(2)
  await expect.poll(() => resetStatuses).toEqual([200, 200])
  expect(resetRequests).toEqual([
    { url: `${new URL(page.url()).origin}/api/test-scenarios/reset`, method: 'POST', body: '{"scenario":"api-error"}' },
    { url: `${new URL(page.url()).origin}/api/test-scenarios/reset`, method: 'POST', body: '{}' },
  ])
  await page.getByRole('button', { name: 'Refazer GET' }).click()
  await expect(page.getByTestId('mock-scenario')).toHaveText('default')

  const tailwindAccent = await page.getByRole('button', { name: 'Resetar cenário' }).evaluate((button) => getComputedStyle(button).backgroundColor)
  expect(tailwindAccent).toBe('rgb(214, 151, 88)')
  await expect(page.getByTestId('mock-source')).toHaveText('msw')

  await page.screenshot({ path: testInfo.outputPath(`foundation-${testInfo.project.name}.png`), fullPage: true })
  expect(consoleErrors).toEqual([])
})

test('the router renders a not-found page for unknown paths', async ({ page }) => {
  await page.goto('/this-route-does-not-exist')
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
})

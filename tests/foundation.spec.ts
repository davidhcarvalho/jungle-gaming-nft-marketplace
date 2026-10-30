import { mkdir } from 'node:fs/promises'

import { expect, test } from '@playwright/test'

test('TanStack Query → Axios → MSW health request and scenario reset', async ({ page }) => {
  const consoleErrors: string[] = []
  let resetRequestCount = 0
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/foundation/reset')) resetRequestCount += 1
  })
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))

  await page.goto('/__foundation/smoke')
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
  await page.getByRole('button', { name: 'Refazer GET' }).click()
  await expect(page.getByTestId('mock-scenario')).toHaveText('default')

  const tailwindAccent = await page.getByRole('button', { name: 'Resetar cenário' }).evaluate((button) => getComputedStyle(button).backgroundColor)
  expect(tailwindAccent).toBe('rgb(214, 151, 88)')
  await expect(page.getByTestId('mock-source')).toHaveText('msw')

  await mkdir('evidence/lot-01', { recursive: true })
  await page.screenshot({ path: `evidence/lot-01/foundation-${test.info().project.name}.png`, fullPage: true })
  expect(consoleErrors).toEqual([])
})

test('the router renders a not-found page for unknown paths', async ({ page }) => {
  await page.goto('/this-route-does-not-exist')
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
})

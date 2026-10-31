import { mkdir } from 'node:fs/promises'
import { expect, test } from './test-fixtures'
import { setMockScenario } from './helpers/mock-scenarios'

test('direct NFT access selects an edition and enforces quantity limit', async ({ page }) => {
  await page.goto('/nfts/emerald-ape-042')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await expect(page.getByTestId('nft-detail')).toBeVisible()
  if ((page.viewportSize()?.width ?? 1440) <= 640) {
    await expect(page.getByRole('region', { name: 'Resumo da compra' }).getByText('1.19 ETH')).toBeVisible()
  } else {
    await expect(page.getByText('1.19 ETH', { exact: true }).filter({ visible: true })).toBeVisible()
  }

  await page.getByRole('button', { name: /1\/10, 4 disponíveis/ }).click()
  const isMobile = (page.viewportSize()?.width ?? 1440) <= 640
  const purchaseSummary = isMobile ? page.getByRole('region', { name: 'Resumo da compra' }) : undefined
  const quantityGroup = purchaseSummary
    ? purchaseSummary.getByRole('group', { name: 'Quantidade de NFTs' })
    : page.getByRole('group', { name: 'Quantidade de NFTs' })
  const increase = quantityGroup.getByRole('button', { name: 'Aumentar quantidade' })
  await increase.click()
  await increase.click()
  await expect(quantityGroup.locator('output')).toHaveText('3')
  await expect(increase).toBeDisabled()
  if (purchaseSummary) {
    await expect(purchaseSummary.getByRole('status', { name: 'Limite de compra' })).toHaveText('Limite de 3 unidades por compra.')
    await expect(purchaseSummary.getByRole('button', { name: 'Comprar NFT' })).toBeEnabled()
  } else {
    await expect(page.getByRole('status', { name: 'Limite de compra' })).toContainText(/limite de 3 unidades por compra/)
    await expect(page.getByRole('button', { name: 'Comprar NFT' })).toBeEnabled()
  }
})

test('direct access distinguishes missing NFT from missing route', async ({ page, allowExpectedHttpFailure }) => {
  allowExpectedHttpFailure('/api/nfts/unknown-nft-id', 404)
  await page.goto('/nfts/unknown-nft-id')
  await expect(page.getByTestId('nft-not-found')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Esta obra não está disponível.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toHaveCount(0)
})

test('sold-out edition disables quantity and purchase controls', async ({ page }) => {
  await page.goto('/nfts/rare-keeper-999')
  await expect(page.getByRole('heading', { name: 'Rare Keeper #999' })).toBeVisible()
  if ((page.viewportSize()?.width ?? 1440) <= 640) {
    await expect(page.getByRole('region', { name: 'Resumo da compra' }).getByText('Esta edição não possui unidades disponíveis.')).toBeVisible()
  } else {
    await expect(page.getByText('Esta edição não possui unidades disponíveis.', { exact: true }).filter({ visible: true })).toBeVisible()
  }
  await expect(page.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Diminuir quantidade' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Edição esgotada' })).toBeDisabled()
})

test('detail loading skeleton precedes a slow MSW detail response', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'slow'))
  await page.goto('/nfts/emerald-ape-042')
  await expect(page.getByTestId('detail-skeleton')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
})

test('detail service errors can recover through a retry', async ({ page, allowExpectedHttpFailure }) => {
  allowExpectedHttpFailure('/api/nfts/emerald-ape-042', 503)
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  await setMockScenario(page, 'detail-error')
  await page.goto('/nfts/emerald-ape-042')
  await expect(page.getByRole('heading', { name: 'Não foi possível carregar este NFT.' })).toBeVisible()
  await setMockScenario(page, 'default')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
})

test('detail visual comparison capture', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'tablet-768') test.skip()
  await page.goto('/nfts/emerald-ape-042')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mais desta coleção' })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(100)
  const viewport = testInfo.project.name === 'mobile-390' ? 'mobile-390' : 'desktop-1440'
  await mkdir('evidence/lot-02', { recursive: true })
  await page.screenshot({ path: `evidence/lot-02/detail-${viewport}-review.png`, fullPage: viewport === 'desktop-1440' })
  if (viewport === 'mobile-390') {
    await page.setViewportSize({ width: 414, height: 896 })
    await page.screenshot({ path: 'evidence/lot-02/detail-mobile-414-review.png' })
  }
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }))
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
})

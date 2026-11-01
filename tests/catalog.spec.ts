import { mkdir } from 'node:fs/promises'
import type { Page } from '@playwright/test'
import { expect, test } from './test-fixtures'
import { setMockScenario } from './helpers/mock-scenarios'

async function openMobileFilters(page: Page) {
  if ((page.viewportSize()?.width ?? 1440) <= 640) {
    await page.getByRole('button', { name: 'Abrir filtros' }).click()
  }
}

function searchInput(page: Page) {
  return page.viewportSize()!.width <= 640
    ? page.locator('#catalog-search-mobile')
    : page.locator('#catalog-search-desktop')
}

test('catalog combines filters, sorts and resets pagination in URL state', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByTestId('nft-card')).toHaveCount(12)

  await page.getByRole('button', { name: 'Página 2' }).click()
  await expect(page).toHaveURL(/page=2/)
  await openMobileFilters(page)
  await page.getByRole('button', { name: /Arte digital/ }).click()
  await expect(page).toHaveURL(/category=digital-art/)
  await expect(page).not.toHaveURL(/page=2/)
  await page.getByRole('button', { name: /Ethereum/ }).click()
  await expect(page).toHaveURL(/network=ethereum/)
  await expect(page).toHaveURL(/category=digital-art/)
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042' })).toBeVisible()
  await expect(page.getByTestId('nft-card')).toHaveCount(1)

  await page.goBack()
  await expect(page).not.toHaveURL(/network=ethereum/)
  await expect(page).toHaveURL(/category=digital-art/)
  await page.goForward()
  await expect(page).toHaveURL(/network=ethereum/)

  if ((page.viewportSize()?.width ?? 1440) > 640) {
    await page.getByLabel('Ordenar por:').selectOption('price-asc')
    await expect(page).toHaveURL(/sort=price-asc/)
  } else {
    await page.getByRole('button', { name: 'Em alta' }).click()
    await expect(page).toHaveURL(/sort=popular/)
  }

  await page.goBack()
  await expect(page).toHaveURL(/network=ethereum/)
  await expect(page).not.toHaveURL(/sort=(price-asc|popular)/)
  await page.goForward()
  await expect(page).toHaveURL(/network=ethereum/)
  await expect(page).toHaveURL(/sort=(price-asc|popular)/)
  await page.reload()
  await expect(page.getByTestId('nft-card')).toHaveCount(1)
})

test('search persists through refresh, empty result and history navigation', async ({ page }) => {
  await page.goto('/')
  const search = searchInput(page)
  await search.fill('golden')
  await search.press('Enter')
  await expect(page).toHaveURL(/q=golden/)
  await expect(page.getByRole('link', { name: /Golden Beat/ }).first()).toBeVisible()
  await page.reload()
  await expect(searchInput(page)).toHaveValue('golden')

  await searchInput(page).fill('no matching artwork')
  await searchInput(page).press('Enter')
  await expect(page.getByText('Não encontramos resultados para esta busca.')).toBeVisible()
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('no matching artwork')
  await page.goBack()
  await expect(searchInput(page)).toHaveValue('golden')
  await expect(page.getByTestId('nft-card').first()).toBeVisible()
  await page.goForward()
  await expect(page.getByText('Não encontramos resultados para esta busca.')).toBeVisible()
})

test('empty and service error scenarios show recovery actions', async ({ page, allowExpectedHttpFailure }) => {
  await page.goto('/')
  await setMockScenario(page, 'empty')
  await page.getByRole('button', { name: 'Em alta' }).click()
  await expect(page.getByText('O catálogo está vazio neste cenário.')).toBeVisible()

  await setMockScenario(page, 'default')
  await page.reload()
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  allowExpectedHttpFailure('/api/nfts', 503)
  await setMockScenario(page, 'catalog-error')
  await searchInput(page).fill('retry-this-request')
  await searchInput(page).press('Enter')
  await expect(page.getByRole('alert').getByRole('heading', { name: 'Não foi possível carregar o mercado.' })).toBeVisible()
  await expect(page.getByTestId('nft-card')).toHaveCount(0)
  await setMockScenario(page, 'default')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByText('Não encontramos resultados para esta busca.')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByTestId('nft-card')).toHaveCount(0)
})

test('catalog background refresh keeps existing results after reconnect error and recovers', async ({ page, allowExpectedHttpFailure }) => {
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(12)

  await page.clock.install({ time: new Date() })
  await page.clock.fastForward(30_001)
  allowExpectedHttpFailure('/api/nfts', 503)
  await setMockScenario(page, 'catalog-error')

  await page.context().setOffline(true)
  const failedRefresh = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return url.pathname === '/api/nfts' && response.status() === 503
  })
  await page.context().setOffline(false)
  await failedRefresh
  const retryFailure = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return url.pathname === '/api/nfts' && response.status() === 503
  })
  await page.clock.fastForward(1_001)
  await retryFailure

  const updateError = page.getByRole('status').filter({ hasText: 'Não foi possível atualizar a lista. Os resultados anteriores continuam visíveis.' })
  await expect(updateError).toBeVisible()
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(updateError.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()

  // Resetting the scenario reconnects the mock socket. Its REST reconciliation
  // can recover this stale query before a manual retry click reaches the button.
  const reconciledCatalog = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return url.pathname === '/api/nfts' && response.status() === 200
  })
  await setMockScenario(page, 'default')
  await reconciledCatalog
  await expect(updateError).toHaveCount(0)
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
})

test('new search response is not replaced by an older delayed response', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  await setMockScenario(page, 'variable-latency')

  const input = searchInput(page)
  const slowRequest = page.waitForRequest((request) => {
    const url = new URL(request.url())
    return url.pathname.endsWith('/api/nfts') && url.searchParams.get('q') === 'slow'
  })
  await input.fill('slow')
  await input.press('Enter')
  await slowRequest

  await input.fill('fast')
  await input.press('Enter')
  await expect(page.getByRole('link', { name: 'Ver Fast Current #033' })).toBeVisible()
  await page.waitForTimeout(1_300)
  await expect(page.getByRole('link', { name: 'Ver Fast Current #033' })).toBeVisible()
  await expect(page).toHaveURL(/q=fast/)
})

test('catalog loading skeleton preserves card geometry while MSW responds slowly', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  await setMockScenario(page, 'slow')
  await page.reload()
  await expect(page.getByTestId('catalog-skeleton')).toBeVisible()
  const skeletonCards = page.getByTestId('catalog-skeleton-card')
  await expect(skeletonCards).toHaveCount(12)
  await expect(page.getByTestId('nft-card')).toHaveCount(0)

  const placeholderArt = skeletonCards.first().locator('.nft-skeleton-art')
  const placeholderBox = await placeholderArt.boundingBox()
  expect(placeholderBox).not.toBeNull()
  if (!placeholderBox) throw new Error('Skeleton placeholder has no rendered geometry.')
  expect(placeholderBox.width).toBeGreaterThan(0)
  expect(placeholderBox.height / placeholderBox.width).toBeGreaterThan(1)
  expect(placeholderBox.height / placeholderBox.width).toBeLessThan(1.1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  await expect(page.getByTestId('catalog-skeleton')).toBeHidden()
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  const realArtBox = await page.getByTestId('nft-card').first().locator('.nft-card-art-frame').boundingBox()
  expect(realArtBox).not.toBeNull()
  if (!realArtBox) throw new Error('NFT card has no rendered geometry after loading.')
  expect(Math.abs(realArtBox.width - placeholderBox.width)).toBeLessThanOrEqual(2)
  expect(Math.abs(realArtBox.height / realArtBox.width - placeholderBox.height / placeholderBox.width)).toBeLessThan(0.04)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('Home visual comparison capture', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'tablet-768') test.skip()
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(100)
  const viewport = testInfo.project.name === 'mobile-390' ? 'mobile-390' : 'desktop-1440'
  await mkdir('evidence/lot-02', { recursive: true })
  await page.screenshot({ path: `evidence/lot-02/home-${viewport}-review.png`, fullPage: viewport === 'desktop-1440' })
  if (viewport === 'mobile-390') {
    await page.setViewportSize({ width: 414, height: 896 })
    await page.screenshot({ path: 'evidence/lot-02/home-mobile-414-review.png' })
  }
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }))
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
})

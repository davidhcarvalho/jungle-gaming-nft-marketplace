import { expect, test } from './test-fixtures'
import { setMockScenario } from './helpers/mock-scenarios'
import type { Page } from '@playwright/test'

const ana = { email: 'ana@kurio.test', password: 'KurioDemo24!' }

async function resetScenario(page: Page) {
  await setMockScenario(page, 'default')
}

async function waitForVisualStability(page: Page, fullPage: boolean) {
  if (fullPage) await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState('networkidle')
  await page.evaluate(async () => {
    await document.fonts.ready
    window.scrollTo(0, 0)
  })
}

async function capture(page: Page, snapshot: string, fullPage: boolean) {
  if (page.viewportSize()?.width === 768) test.skip()
  await waitForVisualStability(page, fullPage)
  await expect(page).toHaveScreenshot(snapshot, {
    animations: 'disabled',
    caret: 'hide',
    fullPage,
    maxDiffPixelRatio: 0.003,
  })
}

async function addNFT(page: Page, nftId: string, quantity: number) {
  await page.goto(`/nfts/${nftId}`)
  await expect(page.getByTestId('nft-detail')).toBeVisible()
  const mobile = (page.viewportSize()?.width ?? 1440) <= 640
  const controls = mobile
    ? page.getByRole('region', { name: 'Resumo da compra' }).getByRole('group', { name: 'Quantidade de NFTs' })
    : page.getByRole('group', { name: 'Quantidade de NFTs' })
  for (let count = 1; count < quantity; count += 1) {
    await controls.getByRole('button', { name: 'Aumentar quantidade' }).click()
  }
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByTestId('cart-page')).toBeVisible()
}

test('final visual baseline: Home mobile 390', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'mobile-390') test.skip()
  await resetScenario(page)
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  await capture(page, 'home-mobile-390.png', false)
})

test('final visual baseline: Home desktop 1440', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'desktop-1440') test.skip()
  await resetScenario(page)
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  await capture(page, 'home-desktop-1440.png', true)
})

test('final visual baseline: NFT detail mobile 390', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'mobile-390') test.skip()
  await resetScenario(page)
  await page.goto('/nfts/emerald-ape-042')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await capture(page, 'detail-mobile-390.png', false)
})

test('final visual baseline: NFT detail desktop 1440', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'desktop-1440') test.skip()
  await resetScenario(page)
  await page.goto('/nfts/emerald-ape-042')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await capture(page, 'detail-desktop-1440.png', true)
})

test('final visual baseline: cart mobile 390', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'mobile-390') test.skip()
  await resetScenario(page)
  const items = [
    { id: 'emerald-ape-042', quantity: 1 },
    { id: 'violet-nomad-314', quantity: 1 },
    { id: 'ivory-baron-088', quantity: 2 },
    { id: 'golden-beat-207', quantity: 2 },
  ]
  for (const item of items) await addNFT(page, item.id, item.quantity)
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item')).toHaveCount(items.length)
  await capture(page, 'cart-mobile-390.png', true)
})

test('final visual baseline: cart desktop 1440', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'desktop-1440') test.skip()
  await resetScenario(page)
  const items = [
    { id: 'emerald-ape-042', quantity: 2 },
    { id: 'violet-nomad-314', quantity: 6 },
    { id: 'ivory-baron-088', quantity: 9 },
  ]
  for (const item of items) await addNFT(page, item.id, 1)
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item')).toHaveCount(items.length)
  for (const item of items) {
    const row = page.getByTestId('cart-item').filter({ hasText: item.id === 'emerald-ape-042' ? 'Emerald Ape #042' : item.id === 'violet-nomad-314' ? 'Violet Nomad #314' : 'Ivory Baron #088' })
    const quantity = row.getByRole('group', { name: /^Quantidade de/ })
    for (let current = 1; current < item.quantity; current += 1) {
      await quantity.getByRole('button', { name: /^Aumentar quantidade/ }).click()
      await expect(quantity.locator('output')).toHaveText(String(current + 1))
    }
  }
  await capture(page, 'cart-desktop-1440.png', true)
})

test('final visual baseline: payment mobile 390', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'mobile-390') test.skip()
  await resetScenario(page)
  await page.goto('/login?returnTo=%2Fcheckout')
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill(ana.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await addNFT(page, 'emerald-ape-042', 1)
  await page.goto('/checkout')
  await expect(page.getByTestId('checkout-page')).toBeVisible()
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Carteira conectada' })).toBeVisible()
  await capture(page, 'payment-mobile-390.png', false)
})

test('final visual baseline: payment desktop 1440', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'desktop-1440') test.skip()
  await resetScenario(page)
  await page.goto('/login?returnTo=%2Fcheckout')
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill(ana.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await addNFT(page, 'emerald-ape-042', 1)
  await page.goto('/checkout')
  await expect(page.getByTestId('checkout-page')).toBeVisible()
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Carteira conectada' })).toBeVisible()
  await capture(page, 'payment-desktop-1440.png', true)
})

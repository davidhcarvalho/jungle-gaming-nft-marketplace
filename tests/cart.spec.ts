import { mkdir } from 'node:fs/promises'
import { expect, test } from './test-fixtures'
import { setMockScenario } from './helpers/mock-scenarios'
import type { Page } from '@playwright/test'

const ana = { email: 'ana@kurio.test', password: 'KurioDemo24!' }

async function prepare(page: Page, scenario: Parameters<typeof setMockScenario>[1] = 'default') {
  await setMockScenario(page, scenario)
  await page.goto('about:blank')
}

async function addNFT(page: Page, nftId = 'emerald-ape-042', quantity = 1, edition?: '1/10') {
  await page.goto(`/nfts/${nftId}`)
  await expect(page.getByTestId('nft-detail')).toBeVisible()
  if (edition) await page.getByRole('button', { name: new RegExp(`^${edition.replace('/', '\\/')},`) }).click()

  const mobile = (page.viewportSize()?.width ?? 1440) <= 640
  const control = mobile
    ? page.getByRole('region', { name: 'Resumo da compra' }).getByRole('group', { name: 'Quantidade de NFTs' })
    : page.getByRole('group', { name: 'Quantidade de NFTs' })
  for (let count = 1; count < quantity; count += 1) await control.getByRole('button', { name: 'Aumentar quantidade' }).click()
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByTestId('cart-page')).toBeVisible()
}

async function loginAsAna(page: Page) {
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill(ana.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/cart$/)
}

function cartItem(page: Page, nftName = 'Emerald Ape #042') {
  return page.getByTestId('cart-item').filter({ hasText: nftName })
}

test('guest adds an NFT through the detail page and cart survives refresh', async ({ page }) => {
  await prepare(page)
  await addNFT(page)
  await expect(cartItem(page)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Resumo da carteira' })).toBeVisible()
  await page.reload()
  await expect(cartItem(page)).toBeVisible()
  await expect(page.getByTestId('cart-item')).toHaveCount(1)
})

test('quantity updates respect edition availability and API rejects excess stock', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page)
  await addNFT(page, 'emerald-ape-042', 3, '1/10')
  const row = cartItem(page)
  const control = row.getByRole('group', { name: 'Quantidade de Emerald Ape #042' })
  await expect(control.locator('output')).toHaveText('3')
  await control.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' }).click()
  await expect(control.locator('output')).toHaveText('4')
  await expect(control.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' })).toBeDisabled()
  await expect(row.getByRole('status', { name: 'Limite de disponibilidade' })).toHaveText('Limite de 4 unidade(s)')

  allowExpectedHttpFailure('/api/cart/items', 409)
  const response = await page.evaluate(async () => fetch('/api/cart/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Guest-Cart-Id': localStorage.getItem('kurio:guest-cart-id') ?? '',
    },
    body: JSON.stringify({ nftId: 'emerald-ape-042', editionId: 'emerald-ape-042-1of10', quantity: 1 }),
  }).then((result) => result.status))
  expect(response).toBe(409)
})

test('remove action empties the cart and exposes a recovery link', async ({ page }) => {
  await prepare(page)
  await addNFT(page)
  await cartItem(page).getByRole('button', { name: /Remover Emerald Ape #042/ }).click()
  await expect(page.getByTestId('cart-empty')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explorar NFTs' })).toBeVisible()
})

test('quote is authoritative for subtotal, coupon discount, network fee and total', async ({ page }) => {
  await prepare(page)
  await addNFT(page, 'emerald-ape-042', 2)
  const summary = page.getByTestId('cart-summary')
  await expect(summary.getByText('2.38 ETH', { exact: true })).toBeVisible()
  await summary.getByLabel('Código promocional').fill('KURIO10')
  await summary.getByRole('button', { name: 'Aplicar' }).click()
  await expect(summary.getByText('− 0.238 ETH', { exact: true })).toBeVisible()
  await expect(summary.getByText('0.016 ETH', { exact: true })).toBeVisible()
  await expect(summary.getByText('2.158 ETH', { exact: true })).toBeVisible()
  await expect(summary.getByText('KURIO10 aplicado')).toBeVisible()
  await summary.getByRole('button', { name: 'Remover cupom' }).click()
  await expect(summary.getByText('− 0 ETH', { exact: true })).toBeVisible()
  await expect(summary.getByText('2.396 ETH', { exact: true })).toBeVisible()
})

test('invalid and expired coupons return distinct accessible errors without changing items', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page)
  await addNFT(page)
  const summary = page.getByTestId('cart-summary')
  const coupon = summary.getByLabel('Código promocional')
  allowExpectedHttpFailure('/api/cart/coupon', 422)
  await coupon.fill('NOT-A-COUPON')
  await summary.getByRole('button', { name: 'Aplicar' }).click()
  await expect(summary.getByRole('alert')).toHaveText('Este código de cupom não é válido.')
  await coupon.fill('EXPIRED')
  await summary.getByRole('button', { name: 'Aplicar' }).click()
  await expect(summary.getByRole('alert')).toHaveText('Este cupom expirou.')
  await expect(cartItem(page)).toBeVisible()
})

test('guest cart merges into the authenticated cart without duplicating an edition', async ({ page }) => {
  await prepare(page, 'cart-existing')
  await addNFT(page, 'emerald-ape-042', 2)
  await page.goto('/login?returnTo=%2Fcart')
  await loginAsAna(page)
  const row = cartItem(page)
  await expect(row.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }).locator('output')).toHaveText('4')
  await page.reload()
  await expect(row).toBeVisible()
})

test('logout and account switch do not expose the previous account cart', async ({ page }) => {
  await prepare(page)
  await addNFT(page)
  await page.goto('/login?returnTo=%2Fcart')
  await loginAsAna(page)
  await expect(cartItem(page)).toBeVisible()
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await page.goto('/cart')
  await expect(page.getByTestId('cart-empty')).toBeVisible()
  await page.goto('/login?returnTo=%2Fcart')
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill('leo@kurio.test')
  await form.getByLabel('Senha', { exact: true }).fill('Collector24!')
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByTestId('cart-empty')).toBeVisible()
})

test('mutation failure leaves the existing cart unchanged', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, 'cart-existing-mutation-error')
  await page.goto('/login?returnTo=%2Fcart')
  await loginAsAna(page)
  const row = cartItem(page)
  await expect(row).toBeVisible()
  allowExpectedHttpFailure('/api/cart/items/emerald-ape-042%3A%3Aemerald-ape-042-1of50', 503)
  await row.getByRole('button', { name: /Remover Emerald Ape #042/ }).click()
  await expect(page.getByRole('alert')).toContainText('Não foi possível remover este item.')
  await expect(row).toBeVisible()
  await expect(row.getByRole('group', { name: 'Quantidade de Emerald Ape #042' }).locator('output')).toHaveText('2')
})

test('quote failure preserves cart items and offers retry', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, 'quote-error')
  await addNFT(page)
  allowExpectedHttpFailure('/api/quote', 503)
  const summary = page.getByTestId('cart-summary')
  await expect(cartItem(page)).toBeVisible()
  await expect(summary.getByText('Não foi possível atualizar os valores.')).toBeVisible()
  await expect(summary.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled()
})

test('cart read error recovers after scenario reset', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, 'cart-error')
  allowExpectedHttpFailure('/api/cart', 503)
  await page.goto('/cart')
  await expect(page.getByTestId('cart-error')).toBeVisible()
  await setMockScenario(page, 'default')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByTestId('cart-empty')).toBeVisible()
})

test('cart summary skeleton appears while the cart request is slow', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kurio:mock-scenario', 'slow'))
  await page.goto('/cart')
  await expect(page.getByTestId('cart-loading')).toBeVisible()
  await expect(page.getByTestId('cart-summary-skeleton')).toBeVisible()
  await expect(page.getByTestId('cart-empty')).toBeVisible()
  await expect(page.getByTestId('cart-summary-skeleton')).toHaveCount(0)
})

test('cart layout has no horizontal overflow at the active viewport', async ({ page }) => {
  await prepare(page)
  await addNFT(page)
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
})

test('cart visual review captures mobile and desktop at approved widths', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'tablet-768') test.skip()
  await prepare(page)
  const mobile = testInfo.project.name === 'mobile-390'
  const visualItems = mobile
    ? [{ id: 'emerald-ape-042', name: 'Emerald Ape #042', quantity: 1 }, { id: 'violet-nomad-314', name: 'Violet Nomad #314', quantity: 1 }, { id: 'ivory-baron-088', name: 'Ivory Baron #088', quantity: 2 }, { id: 'golden-beat-207', name: 'Golden Beat #207', quantity: 2 }]
    : [{ id: 'emerald-ape-042', name: 'Emerald Ape #042', quantity: 2 }, { id: 'violet-nomad-314', name: 'Violet Nomad #314', quantity: 6 }, { id: 'ivory-baron-088', name: 'Ivory Baron #088', quantity: 9 }]
  for (const item of visualItems) await addNFT(page, item.id)
  for (const item of visualItems) {
    const row = cartItem(page, item.name)
    const quantityGroup = row.getByRole('group', { name: `Quantidade de ${item.name}` })
    const current = Number(await quantityGroup.locator('output').textContent())
    for (let quantity = current; quantity < item.quantity; quantity += 1) {
      await quantityGroup.getByRole('button', { name: `Aumentar quantidade de ${item.name}` }).click()
      await expect(quantityGroup.locator('output')).toHaveText(String(quantity + 1))
    }
  }
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item')).toHaveCount(visualItems.length)
  await expect(page.getByRole('heading', { name: 'Resumo da carteira' })).toBeVisible()
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', await page.evaluate(() => window.innerWidth))
  await mkdir('evidence/lot-04', { recursive: true })
  const path = mobile ? 'evidence/lot-04/cart-mobile-390-review.png' : 'evidence/lot-04/cart-desktop-1440-review.png'
  await page.screenshot({ path, fullPage: true })
  if (mobile) {
    await page.setViewportSize({ width: 414, height: 896 })
    const mobileDimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(mobileDimensions.content).toBeLessThanOrEqual(mobileDimensions.viewport)
    await page.screenshot({ path: 'evidence/lot-04/cart-mobile-414-review.png', fullPage: true })
  }
})

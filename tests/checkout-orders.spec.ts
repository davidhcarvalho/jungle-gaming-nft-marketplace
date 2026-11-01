import { expect, test } from './test-fixtures'
import { setMockScenario } from './helpers/mock-scenarios'
import type { Page } from '@playwright/test'

const ana = { email: 'ana@kurio.test', password: 'KurioDemo24!' }
test.beforeEach(async ({ page }) => page.setDefaultTimeout(8_000))

async function prepare(page: Page, scenario: Parameters<typeof setMockScenario>[1] = 'default', connectWallet = true) {
  await setMockScenario(page, scenario)
  await page.goto('/login?returnTo=%2Fcheckout')
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill(ana.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  await page.goto('/nfts/emerald-ape-042')
  await expect(page.getByTestId('nft-detail')).toBeVisible()
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByTestId('cart-page')).toBeVisible()
  await page.goto('/checkout')
  await expect(page.getByTestId('checkout-page')).toBeVisible()
  if (connectWallet) {
    await page.getByRole('button', { name: 'Conectar carteira' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Carteira conectada' })).toBeVisible()
  }
}

async function waitForMockBootstrap(page: Page) {
  await expect(page.locator('html')).toHaveAttribute('data-msw-ready', 'true')
}

async function confirm(page: Page) {
  const button = page.getByRole('button', { name: /Confirmar compra|Confirmar novos valores/ })
  try {
    await button.click()
  } catch (error) {
    const hitTest = await button.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const hit = document.elementFromPoint(x, y)
      const style = getComputedStyle(element)
      return { rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }, scrollX, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, position: style.position, zIndex: style.zIndex, hit: hit?.outerHTML.slice(0, 240) }
    })
    throw new Error(`Checkout CTA hit test failed: ${JSON.stringify(hitTest)}`, { cause: error })
  }
}

async function reachOrder(page: Page) {
  await confirm(page)
  await expect(page).toHaveURL(/\/orders\/order-/)
}

async function requestOrderRefresh(page: Page): Promise<string> {
  const orderId = new URL(page.url()).pathname.split('/').at(-1) ?? ''
  return page.evaluate(async (id) => {
    const token = localStorage.getItem('kurio:session-token') ?? ''
    const response = await fetch(`/api/orders/${id}/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const body = await response.json() as { order: { status: string } }
    return body.order.status
  }, orderId)
}

test('checkout redirects guests to login and returns to checkout preserving the cart', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto('/nfts/emerald-ape-042')
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page).toHaveURL(/\/cart$/)
  await page.goto('/checkout')
  await expect(page).toHaveURL(/\/login\?returnTo=.*checkout/)
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill(ana.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/checkout$/)
  // Mobile checkout intentionally hides item rows to match its Figma composition;
  // verify persistence in the cart surface where the line item is visible.
  if ((page.viewportSize()?.width ?? 1440) <= 640) await page.goto('/cart')
  await expect(page.getByText('Emerald Ape #042', { exact: true })).toBeVisible()
})

test('wallet selection, connection, network and disconnect are available', async ({ page }) => {
  await prepare(page)
  await expect(page.getByRole('radio', { name: /MetaMask · Principal/ })).toBeChecked()
  await page.getByRole('button', { name: 'Desconectar' }).click()
  await page.getByRole('radio', { name: /Coinbase · Secundária/ }).check()
  await page.getByRole('region', { name: 'Carteira e rede' }).getByLabel('Rede de pagamento', { exact: true }).selectOption('polygon')
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Carteira conectada' })).toBeVisible()
  await page.getByRole('button', { name: 'Desconectar' }).click()
})

test('revalidation change requires a second confirmation and displays the new authoritative quote', async ({ page }) => {
  await prepare(page, 'checkout-price-changed')
  await confirm(page)
  await expect(page.getByRole('status', { name: 'Cotação atualizada' })).toContainText('O preço de uma edição mudou.')
  await expect(page).toHaveURL(/\/checkout$/)
  await expect(page.getByRole('button', { name: 'Confirmar novos valores' })).toBeEnabled()
  await confirm(page)
  await expect(page).toHaveURL(/\/orders\/order-/)
})

test('availability changes block purchase and preserve cart', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, 'checkout-availability-changed')
  allowExpectedHttpFailure('/api/checkout/revalidate', 409)
  await confirm(page)
  await expect(page.getByRole('alert')).toContainText('disponibilidade desta edição mudou')
  await expect(page).toHaveURL(/\/checkout$/)
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item')).toBeVisible()
})

test('collector fields are validated before submitting', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1440) <= 800, 'o frame mobile não contém formulário de dados do colecionador')
  await prepare(page)
  await page.getByTestId('checkout-page').getByRole('textbox', { name: 'E-mail' }).fill('email-invalido')
  await confirm(page)
  await expect(page.getByRole('alert')).toContainText('Revise nome, usuário, perfil e e-mail do colecionador.')
})

test('confirmed order creates an immutable receipt and removes purchased quantities only', async ({ page }) => {
  await prepare(page)
  await page.goto('/cart')
  const cartRow = page.getByTestId('cart-item')
  const quantity = cartRow.getByRole('group', { name: 'Quantidade de Emerald Ape #042' })
  await quantity.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' }).click()
  await page.goto('/checkout')
  await reachOrder(page)
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  expect(await requestOrderRefresh(page)).toBe('confirmed')
  await expect(page.getByText('Referência de transação simulada')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Itens do pedido' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  await page.goto('/cart')
  await expect(page.getByTestId('cart-empty')).toBeVisible()
})

test('rejected orders preserve the cart and show an accessible rejection state', async ({ page }) => {
  await prepare(page, 'order-rejected')
  await reachOrder(page)
  await expect(page.getByRole('heading', { name: 'Não foi possível confirmar seu pedido' })).toBeVisible()
  expect(await requestOrderRefresh(page)).toBe('rejected')
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item')).toBeVisible()
})

test('double click and timeout retry recover the same idempotent order', async ({ page }) => {
  await prepare(page, 'order-timeout-after-create')
  await page.getByRole('button', { name: 'Confirmar compra' }).dblclick()
  await expect(page.getByText('A resposta não foi recebida. Tente novamente para recuperar a mesma tentativa de pedido.')).toBeVisible()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/orders\/order-/)
  const orderUrl = page.url()
  await page.reload()
  await expect(page).toHaveURL(orderUrl)
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
})

test('pending order survives refresh and REST status refresh is terminal', async ({ page }) => {
  await prepare(page, 'order-pending')
  await reachOrder(page)
  await expect(page.getByText('Seu pedido está sendo processado')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Seu pedido está sendo processado')).toBeVisible()
  await page.getByRole('button', { name: 'Consultar status do pedido' }).click()
  await expect(page.getByText('Seu pedido está sendo processado')).toBeVisible()
})

test('simulated mobile and desktop evidence is captured under lot 05', async ({ page }) => {
  await prepare(page)
  const width = page.viewportSize()?.width ?? 1440
  const dimensions = await page.evaluate(() => {
    const client = document.documentElement.clientWidth
    const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return style.display !== 'none' && style.visibility !== 'hidden' && (rect.left < -1 || rect.right > client + 1)
      })
      .slice(0, 12)
      .map((element) => ({ tag: element.tagName, className: String(element.className), left: Math.round(element.getBoundingClientRect().left), right: Math.round(element.getBoundingClientRect().right), width: Math.round(element.getBoundingClientRect().width) }))
    return { client, scroll: document.documentElement.scrollWidth, offenders }
  })
  expect(dimensions.scroll, `horizontal overflow at ${width}px: ${JSON.stringify(dimensions.offenders)}`).toBeLessThanOrEqual(dimensions.client)
  await page.evaluate(() => window.scrollTo(0, 0))
  if (width === 390) await page.screenshot({ path: 'evidence/lot-05/checkout-mobile-390-review.png' })
  if (width === 1440) await page.screenshot({ path: 'evidence/lot-05/checkout-desktop-1440-review.png', fullPage: true })
  await reachOrder(page)
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  if (width === 390) await page.screenshot({ path: 'evidence/lot-05/confirmation-mobile-390-review.png', fullPage: true })
  if (width === 1440) await page.screenshot({ path: 'evidence/lot-05/confirmation-desktop-1440-review.png', fullPage: true })
})

test('wallet connection refusal is shown without enabling purchase', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, 'wallet-rejected', false)
  allowExpectedHttpFailure('/api/checkout/wallets/connect', 409)
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByRole('alert')).toContainText('A conexão da carteira foi recusada.')
  await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()
})

test('expired coupon updates quote and requires a second confirmation', async ({ page }) => {
  await prepare(page, 'checkout-coupon-expired')
  await page.goto('/cart')
  const summary = page.getByTestId('cart-summary')
  await summary.getByLabel('Código promocional').fill('KURIO10')
  await summary.getByRole('button', { name: 'Aplicar' }).click()
  await expect(summary.getByText('KURIO10 aplicado')).toBeVisible()
  await page.goto('/checkout')
  await confirm(page)
  await expect(page.getByRole('status', { name: 'Cotação atualizada' })).toContainText('O cupom expirou')
  await confirm(page)
  await expect(page).toHaveURL(/\/orders\/order-/)
})

test('same idempotency key replays one order and conflicts with a different payload', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page)
  const result = await page.evaluate(async () => {
    const token = localStorage.getItem('kurio:session-token') ?? ''
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const cartResponse = await fetch('/api/cart', { headers })
    const cart = await cartResponse.json() as { items: Array<{ nftId: string; editionId: string; quantity: number }> }
    const wallets = await fetch('/api/checkout/wallets', { headers }).then((response) => response.json()) as { wallets: Array<{ id: string }>; networks: Array<{ id: string }> }
    const wallet = wallets.wallets[0]!
    await fetch('/api/checkout/wallets/connect', { method: 'POST', headers, body: JSON.stringify({ walletId: wallet.id }) })
    const network = wallets.networks[0]!
    const quote = await fetch('/api/checkout/revalidate', { method: 'POST', headers, body: JSON.stringify({ quoteId: 'old', networkId: network.id }) }).then((response) => response.json()) as { quote: { id: string; [key: string]: unknown } }
    const payload = { quoteId: quote.quote.id, quote: quote.quote, items: cart.items.map(({ nftId, editionId, quantity }) => ({ nftId, editionId, quantity })), walletId: wallet.id, networkId: network.id, collector: { displayName: 'Ana Colecionadora', email: 'ana@kurio.test', note: '' } }
    const key = crypto.randomUUID()
    const send = (body: unknown) => fetch('/api/orders', { method: 'POST', headers: { ...headers, 'Idempotency-Key': key }, body: JSON.stringify(body) })
    const first = await send(payload)
    const firstBody = await first.json() as { order: { id: string } }
    const replay = await send(payload)
    const replayBody = await replay.json() as { order: { id: string } }
    const conflict = await send({ ...payload, collector: { ...payload.collector, note: 'outro payload' } })
    return { firstStatus: first.status, replayStatus: replay.status, firstId: firstBody.order.id, replayId: replayBody.order.id, conflictStatus: conflict.status }
  })
  expect(result).toMatchObject({ firstStatus: 201, replayStatus: 200, firstId: result.replayId, conflictStatus: 409 })
  allowExpectedHttpFailure('/api/orders', 409)
})

test('order ownership is isolated when another authenticated user opens the route', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page)
  await reachOrder(page)
  const orderUrl = page.url()
  await page.goto('/profile')
  await waitForMockBootstrap(page)
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('kurio:session-token'))).toBeNull()
  await page.goto('/login?returnTo=%2F')
  await waitForMockBootstrap(page)
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill('leo@kurio.test')
  await form.getByLabel('Senha', { exact: true }).fill('Collector24!')
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect.poll(() => page.evaluate(() => localStorage.getItem('kurio:session-token'))).toMatch(/^mock\.user-leo\./)
  await expect(page).toHaveURL(/\/$/)
  const orderPath = new URL(orderUrl).pathname.replace('/orders/', '/api/orders/')
  await page.evaluate((path) => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, orderUrl)
  await expect(page).toHaveURL(orderUrl)
  allowExpectedHttpFailure(orderPath, 404)
  await expect(page.getByRole('heading', { name: 'Pedido não encontrado' })).toBeVisible()
})

test('network fee changes require a second explicit confirmation', async ({ page }) => {
  await prepare(page, 'checkout-fee-changed')
  await confirm(page)
  await expect(page.getByRole('status', { name: 'Cotação atualizada' })).toContainText('A taxa de rede foi atualizada.')
  if ((page.viewportSize()?.width ?? 1440) <= 640) {
    await expect(page.getByRole('complementary', { name: 'Seus NFTs' }).getByText('1.214 ETH', { exact: true })).toBeVisible()
  } else {
    await expect(page.getByText('0.024 ETH', { exact: true })).toBeVisible()
  }
  await confirm(page)
  await expect(page).toHaveURL(/\/orders\/order-/)
})

test('confirmed receipt stays immutable after catalog price changes and direct reload', async ({ page }) => {
  await prepare(page)
  await reachOrder(page)
  const orderUrl = page.url()
  const initialTotal = await page.locator('.receipt-amounts').textContent()
  const priceChange = await page.evaluate(async () => {
    const response = await fetch('/api/test-scenarios/catalog-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nftId: 'emerald-ape-042', priceEth: '2.39' }),
    })
    return { ok: response.ok, status: response.status }
  })
  expect(priceChange).toMatchObject({ ok: true, status: 200 })
  await page.goto('/nfts/emerald-ape-042')
  await page.reload()
  await expect(page.getByTestId('nft-detail')).toBeVisible()
  await expect(page.getByRole('main').locator('.detail-price')).toHaveText('2.39 ETH')
  await page.goto(orderUrl)
  await expect.poll(() => page.locator('.receipt-amounts').textContent()).toBe(initialTotal)
  await page.reload()
  await expect.poll(() => page.locator('.receipt-amounts').textContent()).toBe(initialTotal)
})

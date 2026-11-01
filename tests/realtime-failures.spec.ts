import { expect, test } from './test-fixtures'
import type { Page } from '@playwright/test'

import { setMockScenario, triggerRealtimeScenario } from './helpers/mock-scenarios'

const ana = { email: 'ana@kurio.test', password: 'KurioDemo24!' }
const nftId = 'emerald-ape-042'
const editionId = 'emerald-ape-042-1of50'

async function waitForSocket(page: Page) {
  await expect(page.getByTestId('realtime-channel')).toHaveAttribute('data-status', 'connected')
}

async function loginAsAna(page: Page, returnTo = '/') {
  await page.goto(`/login?returnTo=${encodeURIComponent(returnTo)}`)
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill(ana.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`${returnTo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
  await waitForSocket(page)
}

async function addEmeraldToCart(page: Page) {
  await page.goto(`/nfts/${nftId}`)
  await expect(page.getByTestId('nft-detail')).toBeVisible()
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByTestId('cart-page')).toBeVisible()
}

async function prepareCheckout(page: Page) {
  await setMockScenario(page, 'order-pending')
  await loginAsAna(page, '/checkout')
  await addEmeraldToCart(page)
  await page.goto('/checkout')
  await expect(page.getByTestId('checkout-page')).toBeVisible()
  const connect = page.getByRole('button', { name: 'Conectar carteira' })
  if (await connect.isVisible()) await connect.click()
  await expect(page.getByRole('status').filter({ hasText: 'Carteira conectada' })).toBeVisible()
}

async function createPendingOrder(page: Page) {
  const urlBefore = page.url()
  const submit = page.getByRole('button', { name: 'Confirmar compra' })
  await submit.click()
  await expect(page).toHaveURL(/\/orders\/order-/)
  await expect(page.getByRole('heading', { name: 'Seu pedido está sendo processado' })).toBeVisible()
  expect(page.url()).not.toBe(urlBefore)
  return new URL(page.url()).pathname.split('/').at(-1)!
}

test('nft.updated travels through socket.io-client, updates catalog/detail and reconciles with REST', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto('/')
  await waitForSocket(page)
  await expect(page.getByTestId('nft-card').filter({ hasText: 'Emerald Ape #042' })).toContainText('1.19 ETH')

  await triggerRealtimeScenario(page, { action: 'nft-price', nftId, priceEth: '1.42' })
  const channel = page.getByTestId('realtime-channel')
  await expect(channel).toHaveAttribute('data-last-nft-id', nftId)
  await expect(channel).toHaveAttribute('data-last-nft-version', '2')
  await expect(channel).toHaveAttribute('data-applied-events', '1')
  await expect(page.getByTestId('nft-card').filter({ hasText: 'Emerald Ape #042' })).toContainText('1.42 ETH')

  await page.goto(`/nfts/${nftId}`)
  await expect(page.getByTestId('nft-detail').locator('.detail-price')).toHaveText('1.42 ETH')
  const restPrice = await page.evaluate(async (id) => (await fetch(`/api/nfts/${id}`).then((response) => response.json()) as { priceEth: string }).priceEth, nftId)
  expect(restPrice).toBe('1.42')
})

test('duplicate and stale nft.updated events are received but never regress resource version', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto(`/nfts/${nftId}`)
  await waitForSocket(page)
  await triggerRealtimeScenario(page, { action: 'nft-price', nftId, priceEth: '1.42', delivery: 'duplicate-and-stale' })

  const channel = page.getByTestId('realtime-channel')
  await expect(channel).toHaveAttribute('data-received-events', '3')
  await expect(channel).toHaveAttribute('data-applied-events', '1')
  await expect(channel).toHaveAttribute('data-ignored-events', '2')
  await expect(channel).toHaveAttribute('data-last-nft-version', '2')
  await expect(page.getByTestId('nft-detail').locator('.detail-price')).toHaveText('1.42 ETH')
})

test('nft.updated refreshes cart values and requires a revalidated quote confirmation', async ({ page }) => {
  await prepareCheckout(page)
  await triggerRealtimeScenario(page, { action: 'nft-price', nftId, priceEth: '1.42' })
  await expect(page.getByRole('status', { name: 'Atualização em tempo real' })).toContainText('cotação precisa ser revisada')
  await expect(page.getByTestId('realtime-channel')).toHaveAttribute('data-applied-events', '1')

  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('status', { name: 'Cotação atualizada' })).toContainText('revalidada após uma alteração no NFT')
  await expect(page).toHaveURL(/\/checkout$/)
  await page.getByRole('button', { name: 'Confirmar novos valores' }).click()
  await expect(page).toHaveURL(/\/orders\/order-/)
  await expect(page.getByRole('heading', { name: 'Seu pedido está sendo processado' })).toBeVisible()
})

test('availability update is reflected by REST and blocks a checkout whose quantity exceeds stock', async ({ page, allowExpectedHttpFailure }) => {
  await prepareCheckout(page)
  allowExpectedHttpFailure('/api/checkout/revalidate', 409)
  await triggerRealtimeScenario(page, { action: 'nft-availability', nftId, editionId, available: 0 })
  await expect(page.getByRole('status', { name: 'Atualização em tempo real' })).toContainText('disponibilidade desta edição foi alterada')
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page.getByRole('alert')).toContainText('disponibilidade mudou e não cobre mais as quantidades')
  await expect(page).toHaveURL(/\/checkout$/)
  const restAvailability = await page.evaluate(async ({ nft, edition }) => {
    const result = await fetch(`/api/nfts/${nft}`).then((response) => response.json()) as { editions: Array<{ id: string; available: number }> }
    return result.editions.find((item) => item.id === edition)?.available
  }, { nft: nftId, edition: editionId })
  expect(restAvailability).toBe(0)
})

test('order.updated changes pending to confirmed and terminal state ignores duplicate/stale events', async ({ page }) => {
  await prepareCheckout(page)
  const orderId = await createPendingOrder(page)
  const channel = page.getByTestId('realtime-channel')
  await expect(channel).toHaveAttribute('data-status', 'connected')
  await triggerRealtimeScenario(page, { action: 'order-status', userId: 'user-ana', orderId, status: 'confirmed', delivery: 'duplicate-and-stale' })
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  await expect(channel).toHaveAttribute('data-last-order-id', orderId)
  await expect(channel).toHaveAttribute('data-applied-events', '1')
  await expect(channel).toHaveAttribute('data-received-events', '3')
  await expect(channel).toHaveAttribute('data-ignored-events', '2')
  await expect(page.getByRole('status')).toContainText('Sua compra foi confirmada.')
  await expect(page.getByRole('heading', { name: 'Itens do pedido' })).toBeVisible()
  const width = page.viewportSize()?.width
  if (width === 390) await page.screenshot({ path: 'evidence/lot-07/order-confirmed-mobile-390-review.png', fullPage: true })
})

test('order.updated rejection preserves cart and presents accessible failure state', async ({ page }) => {
  await prepareCheckout(page)
  const orderId = await createPendingOrder(page)
  await triggerRealtimeScenario(page, { action: 'order-status', userId: 'user-ana', orderId, status: 'rejected' })
  await expect(page.getByRole('heading', { name: 'Não foi possível confirmar seu pedido' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('O pagamento simulado foi recusado.')
  if (page.viewportSize()?.width === 1440) await page.screenshot({ path: 'evidence/lot-07/order-rejected-desktop-1440-review.png', fullPage: true })
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item')).toBeVisible()
})

test('pending order recovers the same id through REST after disconnect and a missed event', async ({ page }) => {
  await prepareCheckout(page)
  const orderId = await createPendingOrder(page)
  const before = new URL(page.url()).pathname
  await page.reload()
  await expect(page).toHaveURL(new RegExp(`${before.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
  await expect(page.getByRole('heading', { name: 'Seu pedido está sendo processado' })).toBeVisible()
  await waitForSocket(page)
  await triggerRealtimeScenario(page, { action: 'order-status-missed', userId: 'user-ana', orderId, status: 'confirmed' })
  await expect(page.getByTestId('realtime-channel')).toHaveAttribute('data-status', 'connected', { timeout: 10_000 })
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible({ timeout: 10_000 })
  expect(new URL(page.url()).pathname).toBe(before)
  const order = await page.evaluate(async (id) => {
    const token = localStorage.getItem('kurio:session-token') ?? ''
    return fetch(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => response.json()) as Promise<{ order: { id: string; status: string; version: number } }>
  }, orderId)
  expect(order.order).toMatchObject({ id: orderId, status: 'confirmed', version: 2 })
})

test('realtime listener lifecycle stays singular across navigation and a new session receives no old order event', async ({ page }) => {
  await prepareCheckout(page)
  const orderId = await createPendingOrder(page)
  await page.goto('/')
  await page.goto(`/nfts/${nftId}`)
  await page.goto('/cart')
  await page.goto('/checkout')
  await waitForSocket(page)
  await triggerRealtimeScenario(page, { action: 'nft-price', nftId, priceEth: '1.44' })
  const channel = page.getByTestId('realtime-channel')
  await expect(channel).toHaveAttribute('data-received-events', '1')
  await expect(channel).toHaveAttribute('data-applied-events', '1')

  await page.goto('/profile')
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click()
  await page.goto('/login?returnTo=%2F')
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill('leo@kurio.test')
  await form.getByLabel('Senha', { exact: true }).fill('Collector24!')
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await waitForSocket(page)
  const previousReceivedCount = await channel.getAttribute('data-received-events')
  await triggerRealtimeScenario(page, { action: 'order-status', userId: 'user-ana', orderId, status: 'confirmed' })
  await expect(channel).toHaveAttribute('data-received-events', previousReceivedCount ?? '0')
  await expect(page.getByTestId('realtime-channel')).toHaveAttribute('data-status', 'connected')
})

test('realtime price feedback remains usable on mobile tablet and desktop without horizontal overflow', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto(`/nfts/${nftId}`)
  await expect(page.getByTestId('nft-detail')).toBeVisible()
  await waitForSocket(page)
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByTestId('cart-page')).toBeVisible()
  await expect(page.getByTestId('cart-item')).toBeVisible()
  await waitForSocket(page)
  await triggerRealtimeScenario(page, { action: 'nft-price', nftId, priceEth: '1.42' })
  const channel = page.getByTestId('realtime-channel')
  await expect(channel).toHaveAttribute('data-applied-events', '1')
  await expect(page.getByRole('status', { name: 'Atualização de NFT' })).toContainText('cotação precisa ser revisada')
  await expect(page.getByTestId('cart-item')).toContainText('1.42 ETH')
  const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client)
  const width = page.viewportSize()?.width
  if (width === 390) await page.screenshot({ path: 'evidence/lot-07/cart-price-updated-mobile-390-review.png', fullPage: true })
  if (width === 1440) await page.screenshot({ path: 'evidence/lot-07/cart-price-updated-desktop-1440-review.png', fullPage: true })
})

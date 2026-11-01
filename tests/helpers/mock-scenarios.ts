import type { Page } from '@playwright/test'

export type TestMockScenario = 'default' | 'slow' | 'empty' | 'catalog-error' | 'detail-error' | 'variable-latency' | 'signup-conflict' | 'session-expired' | 'favorite-error' | 'cart-error' | 'cart-mutation-error' | 'quote-error' | 'cart-existing' | 'cart-existing-mutation-error' | 'checkout-price-changed' | 'checkout-availability-changed' | 'checkout-coupon-expired' | 'checkout-fee-changed' | 'wallet-rejected' | 'wallet-disconnected' | 'order-timeout-after-create' | 'order-pending' | 'order-rejected' | 'order-server-error' | 'profile-error' | 'profile-mutation-error' | 'avatar-error' | 'password-error' | 'wallet-error' | 'wallet-mutation-error'

export type RealtimeScenarioInput =
  | { action: 'nft-price'; nftId: string; priceEth: string; delivery?: 'single' | 'duplicate' | 'duplicate-and-stale' }
  | { action: 'nft-availability'; nftId: string; editionId: string; available: number }
  | { action: 'order-status' | 'order-status-missed'; userId: string; orderId: string; status: 'confirmed' | 'rejected'; delivery?: 'single' | 'duplicate' | 'stale' | 'duplicate-and-stale' }
  | { action: 'disconnect'; userId?: string }

export async function setMockScenario(page: Page, scenario: TestMockScenario) {
  const isInitialNavigation = page.url() === 'about:blank'
  if (isInitialNavigation) await page.goto('/')
  await page.locator('html[data-msw-ready="true"]').waitFor({ state: 'attached' })
  if (isInitialNavigation) await page.getByRole('region', { name: 'Catálogo de NFTs' }).waitFor({ state: 'visible' })

  const result = await page.evaluate(async (nextScenario) => {
    const requestUrl = new URL('/api/test-scenarios/reset', window.location.href).href
    const workerController = navigator.serviceWorker.controller?.scriptURL ?? null
    const registrations = (await navigator.serviceWorker.getRegistrations()).map((registration) => ({
      scope: registration.scope,
      activeWorker: registration.active?.scriptURL ?? null,
    }))
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: nextScenario }),
    })
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type') ?? '',
      bodyText: await response.text(),
      requestUrl,
      workerController,
      registrations,
    }
  }, scenario)

  if (!result.ok) {
    throw new Error(`MSW scenario reset failed with HTTP ${result.status}: ${result.bodyText || '<empty response>'}; request=${result.requestUrl}; controller=${result.workerController ?? '<none>'}; registrations=${JSON.stringify(result.registrations)}`)
  }

  if (!result.contentType.toLowerCase().includes('application/json')) {
    throw new Error(`MSW scenario reset returned HTTP ${result.status} with non-JSON content type "${result.contentType}": ${result.bodyText || '<empty response>'}`)
  }

  let responseBody: unknown
  try {
    responseBody = JSON.parse(result.bodyText) as unknown
  } catch {
    throw new Error(`MSW scenario reset returned invalid JSON with HTTP ${result.status}: ${result.bodyText || '<empty response>'}`)
  }

  if (typeof responseBody !== 'object' || responseBody === null || !('scenario' in responseBody) || responseBody.scenario !== scenario) {
    throw new Error(`MSW scenario reset response did not confirm "${scenario}": ${result.bodyText}`)
  }
}

export async function triggerRealtimeScenario(page: Page, input: RealtimeScenarioInput) {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.locator('html[data-msw-ready="true"]').waitFor({ state: 'attached' })
  const response = await page.evaluate(async (payload) => {
    const result = await fetch('/api/test-scenarios/realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const bodyText = await result.text()
    let body: unknown
    try { body = JSON.parse(bodyText) as unknown } catch { body = undefined }
    return { ok: result.ok, status: result.status, bodyText, body }
  }, input)
  if (!response.ok) {
    throw new Error(`Realtime scenario failed with HTTP ${response.status}: ${response.bodyText || '<empty response>'}`)
  }
  return response.body
}

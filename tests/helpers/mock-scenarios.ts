import type { Page } from '@playwright/test'

export type TestMockScenario = 'default' | 'slow' | 'empty' | 'catalog-error' | 'detail-error' | 'variable-latency'

export async function setMockScenario(page: Page, scenario: TestMockScenario) {
  if (page.url() === 'about:blank') await page.goto('/')
  await page.locator('html[data-msw-ready="true"]').waitFor({ state: 'attached' })

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

import { expect, test as base } from '@playwright/test'

interface ExpectedHttpFailure {
  pathname: string
  status: number
}

interface ConsoleFailure {
  message: string
  status?: number
}

export const test = base.extend<{
  allowExpectedHttpFailure: (pathname: string, status: number) => void
}>({
  allowExpectedHttpFailure: async ({ page }, use) => {
    const expected: ExpectedHttpFailure[] = []
    const observedResponses: Array<{ pathname: string; status: number }> = []
    const consoleErrors: ConsoleFailure[] = []
    const pageErrors: string[] = []

    page.on('response', (response) => {
      if (response.status() >= 400) {
        observedResponses.push({ pathname: new URL(response.url()).pathname, status: response.status() })
      }
    })
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      const status = message.text().match(/status of (\d{3})/i)?.[1]
      consoleErrors.push({ message: message.text(), status: status ? Number(status) : undefined })
    })
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.addInitScript(() => {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason)
      })
    })

    await use((pathname, status) => expected.push({ pathname, status }))

    const expectedCounts = new Map<string, number>()
    for (const allowed of expected) {
      const observedCount = observedResponses.filter((response) => response.status === allowed.status && response.pathname === allowed.pathname).length
      expect(observedCount, `expected HTTP ${allowed.status} from ${allowed.pathname}`).toBeGreaterThan(0)
      expectedCounts.set(`${allowed.status}:*`, (expectedCounts.get(`${allowed.status}:*`) ?? 0) + observedCount)
    }

    const unexpectedConsoleErrors = consoleErrors.filter((failure) => {
      const key = failure.status === undefined ? undefined : `${failure.status}:*`
      const remaining = key ? expectedCounts.get(key) ?? 0 : 0
      if (key && remaining > 0) {
        expectedCounts.set(key, remaining - 1)
        return false
      }
      return true
    })

    expect(pageErrors, 'uncaught page errors and rejected promises').toEqual([])
    expect(unexpectedConsoleErrors.map(({ message }) => message), 'unexpected browser console errors').toEqual([])
  },
})

export { expect }

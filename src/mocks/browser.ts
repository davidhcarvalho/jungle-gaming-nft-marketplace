let started = false

export async function startMocks() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return false
  if (started) return true

  const [{ setupWorker }, { handlers }] = await Promise.all([
    import('msw/browser'),
    import('@/mocks/handlers/index'),
  ])
  const worker = setupWorker(...handlers)
  await worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: { url: '/mockServiceWorker.js' },
    waitUntilReady: true,
  })
  started = true
  return true
}

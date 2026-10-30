let started = false

export async function startMocks() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true' || started) return

  const [{ setupWorker }, { handlers }] = await Promise.all([
    import('msw/browser'),
    import('@/mocks/handlers'),
  ])
  const worker = setupWorker(...handlers)
  await worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
  started = true
}

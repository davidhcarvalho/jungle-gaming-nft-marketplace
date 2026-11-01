let teardownCurrentConnection: (() => void) | undefined

export function registerRealtimeTeardown(teardown: () => void) {
  teardownCurrentConnection = teardown
  return () => {
    if (teardownCurrentConnection === teardown) teardownCurrentConnection = undefined
  }
}

export function stopRealtimeSession() {
  teardownCurrentConnection?.()
}

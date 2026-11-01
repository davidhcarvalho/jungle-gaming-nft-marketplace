import assert from 'node:assert/strict'
import { cp, mkdtemp, rm } from 'node:fs/promises'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const sourceRoot = process.cwd()
const checkout = await mkdtemp(path.join(os.tmpdir(), 'kurio-clean-checkout-'))
const excluded = new Set(['.git', 'node_modules', '.cache', 'dist', 'test-results', 'playwright-report', 'blob-report', '.ai', 'coverage'])

try {
  await cp(sourceRoot, checkout, {
    recursive: true,
    filter(source) {
      const relative = path.relative(sourceRoot, source)
      if (!relative || relative === '') return true
      return !relative.split(path.sep).some((segment) => excluded.has(segment))
    },
  })

  for (const [label, args] of [
    ['clean install', ['ci']],
    ['typecheck', ['run', 'typecheck']],
    ['lint', ['run', 'lint']],
    ['production build', ['run', 'build']],
    ['demo build with mocks', ['run', 'build:demo']],
    ['Playwright E2E from clean checkout', ['run', 'test:e2e']],
  ]) {
    process.stdout.write(`\n=== ${label} ===\n$ npm ${args.join(' ')}\n`)
    const result = spawnSync('npm', args, {
      cwd: checkout,
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.resolve(sourceRoot, '.cache/ms-playwright') },
      stdio: 'inherit',
    })
    if (result.error) throw result.error
    assert.equal(result.status, 0, `${label} failed with exit ${result.status ?? 'unknown'}.`)
  }

  await verifyPreview()
  process.stdout.write('\nClean checkout gates all passed.\n')
} finally {
  await rm(checkout, { recursive: true, force: true })
}

async function verifyPreview() {
  process.stdout.write('\n=== production preview routes and assets ===\n')
  const vite = path.join(checkout, 'node_modules/vite/bin/vite.js')
  const server = spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
    cwd: checkout,
    env: process.env,
    stdio: 'inherit',
  })

  try {
    const origin = 'http://127.0.0.1:4173'
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (server.exitCode !== null) throw new Error(`Vite preview exited with ${server.exitCode}.`)
      try {
        const home = await fetch(origin)
        if (home.ok) break
      } catch {
        // Wait for Vite preview to accept connections.
      }
      await delay(250)
    }

    for (const pathname of ['/', '/nfts/emerald-ape-042', '/cart', '/mockServiceWorker.js', '/assets/nfts/optimized/emerald-ape.webp']) {
      const response = await fetch(new URL(pathname, origin))
      assert.equal(response.status, 200, `Preview request ${pathname} returned ${response.status}.`)
      if (pathname === '/' || pathname.startsWith('/nfts/') || pathname === '/cart') {
        assert.match(response.headers.get('content-type') ?? '', /text\/html/)
      }
      process.stdout.write(`PASS ${pathname} (${response.status})\n`)
    }
  } finally {
    server.kill('SIGTERM')
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(2_000)])
    if (server.exitCode === null) server.kill('SIGKILL')
  }
}

import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { chromium } from '@playwright/test'

const deploymentFile = path.resolve('evidence/lot-08/deployment-url.txt')
const reportFile = path.resolve('evidence/lot-08/public-smoke.md')
const deploymentUrl = (await readFile(deploymentFile, 'utf8')).trim()
const parsedUrl = new URL(deploymentUrl)

assert.equal(parsedUrl.protocol, 'https:', 'Public deployment must use HTTPS.')
assert.equal(parsedUrl.pathname, '/', 'deployment-url.txt must contain the deployment origin only.')
assert.equal(parsedUrl.search, '', 'deployment-url.txt must not contain query parameters.')
assert.equal(parsedUrl.username, '', 'Deployment URL must not contain credentials.')
assert.equal(parsedUrl.password, '', 'Deployment URL must not contain credentials.')

const browser = await chromium.launch()
const findings = []
const errors = []
const failedResponses = []
const demoAccount = { email: 'ana@kurio.test', password: 'KurioDemo24!' }

try {
  for (const viewport of [
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'desktop-1440', width: 1440, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
    const page = await context.newPage()
    const restResponses = []
    let expectedOrder404Responses = 0
    let handledOrder404ConsoleErrors = 0
    page.on('console', (message) => {
      if (message.type() !== 'error') return
      const isExpectedMissingOrder = new URL(page.url()).pathname === '/orders/public-smoke-order'
        && message.text().includes('status of 404')
        && handledOrder404ConsoleErrors < expectedOrder404Responses
      if (isExpectedMissingOrder) {
        handledOrder404ConsoleErrors += 1
        return
      }
      errors.push(`${viewport.name} console: ${message.text()}`)
    })
    page.on('pageerror', (error) => errors.push(`${viewport.name} pageerror: ${error.message}`))
    page.on('response', (response) => {
      if (response.status() >= 400) failedResponses.push(`${viewport.name} ${response.status()} ${response.url()}`)
      const responseUrl = new URL(response.url())
      if (responseUrl.pathname === '/api/orders/public-smoke-order' && response.status() === 404) {
        expectedOrder404Responses += 1
        const consoleErrorIndex = errors.findIndex((error) => error === `${viewport.name} console: Failed to load resource: the server responded with a status of 404 (Not Found)`)
        if (consoleErrorIndex >= 0 && new URL(page.url()).pathname === '/orders/public-smoke-order') {
          errors.splice(consoleErrorIndex, 1)
          handledOrder404ConsoleErrors += 1
        }
      }
      if (new URL(response.url()).pathname.startsWith('/api/')) {
        restResponses.push({ url: response.url(), status: response.status() })
      }
    })

    await page.goto(deploymentUrl, { waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
    await page.getByTestId('nft-card').first().waitFor({ state: 'visible' })
    await page.getByTestId('realtime-channel').waitFor({ state: 'attached' })
    await page.waitForFunction(() => globalThis.document.querySelector('[data-testid="realtime-channel"]')?.getAttribute('data-status') === 'connected')

    assert.ok(restResponses.some((response) => response.url.includes('/api/nfts?') && response.status === 200), 'Catalog API did not return through the deployed MSW worker.')
    const rootOverflow = await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.window.innerWidth)
    assert.equal(rootOverflow, false, `${viewport.name} has horizontal overflow on Home.`)
    findings.push(`${viewport.name}: Home, catalog REST/MSW, Socket.IO connected, no horizontal overflow.`)

    const detailUrl = new URL('/nfts/emerald-ape-042', deploymentUrl).href
    await page.goto(detailUrl, { waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { name: 'Emerald Ape #042' }).waitFor({ state: 'visible' })
    assert.ok(restResponses.some((response) => response.url.includes('/api/nfts/emerald-ape-042') && response.status === 200), 'Direct NFT route did not load detail REST from MSW.')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.getByRole('heading', { name: 'Emerald Ape #042' }).waitFor({ state: 'visible' })
    const detailOverflow = await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.window.innerWidth)
    assert.equal(detailOverflow, false, `${viewport.name} has horizontal overflow on NFT detail.`)
    findings.push(`${viewport.name}: direct NFT deep link and refresh, detail REST/MSW, no horizontal overflow.`)

    for (const route of ['/cart', '/login', '/signup']) {
      const response = await page.goto(new URL(route, deploymentUrl).href, { waitUntil: 'domcontentloaded' })
      assert.equal(response?.status(), 200, `Direct request to ${route} failed.`)
      if (route === '/login' || route === '/signup') {
        await page.getByRole('form', { name: route === '/login' ? 'Formulário de acesso' : 'Formulário de cadastro' }).waitFor({ state: 'visible' })
      } else {
        await page.getByRole('main').getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
      }
      await page.reload({ waitUntil: 'domcontentloaded' })
      if (route === '/login' || route === '/signup') {
        await page.getByRole('form', { name: route === '/login' ? 'Formulário de acesso' : 'Formulário de cadastro' }).waitFor({ state: 'visible' })
      } else {
        await page.getByRole('main').getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
      }
    }
    findings.push(`${viewport.name}: direct access and refresh for Cart, Login and Signup routes.`)

    for (const route of ['/checkout', '/orders/public-smoke-order', '/profile', '/wallets']) {
      const response = await page.goto(new URL(route, deploymentUrl).href, { waitUntil: 'domcontentloaded' })
      assert.equal(response?.status(), 200, `Direct request to protected route ${route} failed.`)
      await page.getByRole('form', { name: 'Formulário de acesso' }).waitFor({ state: 'visible' })
      const loginUrl = new URL(page.url())
      assert.equal(loginUrl.pathname, '/login', `${route} did not redirect to Login.`)
      assert.equal(loginUrl.searchParams.get('returnTo'), route, `${route} returnTo was not preserved.`)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByRole('form', { name: 'Formulário de acesso' }).waitFor({ state: 'visible' })
    }
    findings.push(`${viewport.name}: protected checkout, order, profile and wallet deep links redirect to Login with returnTo and survive refresh.`)

    await page.goto(new URL('/login', deploymentUrl).href, { waitUntil: 'domcontentloaded' })
    const loginForm = page.getByRole('form', { name: 'Formulário de acesso' })
    await loginForm.getByRole('textbox', { name: 'E-mail' }).fill(demoAccount.email)
    await loginForm.getByLabel('Senha', { exact: true }).fill(demoAccount.password)
    await loginForm.getByRole('button', { name: 'Entrar', exact: true }).click()
    await page.waitForURL((url) => url.pathname === '/')

    for (const [route, heading] of [['/profile', 'Meu perfil'], ['/wallets', 'Carteira principal'], ['/checkout', 'Seu carrinho está vazio'], ['/orders/public-smoke-order', 'Pedido não encontrado']]) {
      const response = await page.goto(new URL(route, deploymentUrl).href, { waitUntil: 'domcontentloaded' })
      assert.equal(response?.status(), 200, `Authenticated direct request to ${route} failed.`)
      await page.getByRole('main').getByRole('heading', { name: heading, exact: true }).waitFor({ state: 'visible' })
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.getByRole('main').getByRole('heading', { name: heading, exact: true }).waitFor({ state: 'visible' })
    }
    assert.equal(expectedOrder404Responses, 2, `${viewport.name} should make one expected missing-order REST request for direct navigation and one for refresh.`)
    assert.equal(handledOrder404ConsoleErrors, 2, `${viewport.name} should report and handle the two expected missing-order HTTP 404 responses.`)
    findings.push(`${viewport.name}: authenticated Checkout, Order, Profile and Wallet routes load directly and after refresh.`)

    await context.close()
  }

  assert.deepEqual(errors, [], `Unexpected browser console or page errors were found. HTTP failures: ${failedResponses.join(' | ')}`)
  findings.push('No unexpected console errors or uncaught page errors.')
  findings.push(`Public origin: ${parsedUrl.origin}`)

  await mkdir(path.dirname(reportFile), { recursive: true })
  const report = [
    '# Public deployment smoke',
    '',
    `Checked: ${new Date().toISOString()}`,
    `Origin: ${parsedUrl.origin}`,
    '',
    ...findings.map((finding) => `- ${finding}`),
    '',
  ].join('\n')
  await writeFile(reportFile, report)
  process.stdout.write(`${report}`)
} finally {
  await browser.close()
}

import { mkdir } from 'node:fs/promises'
import { expect, test } from './test-fixtures'
import { setMockScenario } from './helpers/mock-scenarios'
import type { Page } from '@playwright/test'

const ana = { email: 'ana@kurio.test', password: 'KurioDemo24!' }

async function login(page: Page, returnTo: '/' | '/profile' | '/wallets') {
  await page.goto(`/login?returnTo=${encodeURIComponent(returnTo)}`)
  const form = page.getByRole('form', { name: 'Formulário de acesso' })
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill(ana.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`${returnTo}$`))
}

async function captureEvidence(page: Page, filename: string, fullPage = false) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  await mkdir('evidence/final-polish', { recursive: true })
  await page.screenshot({ path: `evidence/final-polish/${filename}`, fullPage, animations: 'disabled' })
}

test('mobile account pages provide safe back actions to Home', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'mobile-390') test.skip()
  await setMockScenario(page, 'default')
  await login(page, '/')
  await page.getByRole('link', { name: 'Perfil' }).click()
  await expect(page).toHaveURL(/\/profile$/)
  await page.getByRole('button', { name: 'Voltar à página anterior' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')

  await page.goto('/profile')
  await page.getByRole('link', { name: 'Carteiras', exact: true }).click()
  await expect(page).toHaveURL(/\/wallets$/)
  await page.getByRole('button', { name: 'Voltar à página anterior' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
})

test('account back action falls back to Home when there is no safe account context', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'mobile-390') test.skip()
  await setMockScenario(page, 'default')
  await login(page, '/wallets')
  await page.getByRole('button', { name: 'Voltar à página anterior' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await expect(page.getByRole('heading', { name: 'Seja dono da cultura digital' })).toBeVisible()
})

test('primary navigation points to real Home anchors and footer actions explain unavailable destinations', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'mobile-390') test.skip()
  await setMockScenario(page, 'default')
  await page.goto('/')
  await page.getByRole('link', { name: 'Mercado', exact: true }).click()
  await expect(page).toHaveURL(/#catalog$/)
  await expect(page.locator('#catalog')).toBeInViewport()
  await page.getByRole('link', { name: 'Criadores', exact: true }).click()
  await expect(page).toHaveURL(/#features$/)
  await expect(page.locator('#features')).toBeInViewport()
  await page.getByRole('link', { name: 'Aprenda', exact: true }).click()
  await expect(page).toHaveURL(/#journal$/)
  await expect(page.locator('#journal')).toBeInViewport()

  await page.getByRole('button', { name: 'Minha coleção', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Aviso de navegação' })).toContainText('Minha coleção: este recurso não faz parte desta demonstração.')
  await expect(page).not.toHaveURL(/#(?:collection|owned|activity)/)
  await page.getByRole('button', { name: 'Enviar', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Aviso de navegação' })).toContainText('Inscrições: este recurso não faz parte desta demonstração.')
  await page.getByRole('button', { name: 'Instagram', exact: true }).click()
  await expect(page.getByRole('status', { name: 'Aviso de navegação' })).toContainText('Link externo não fornecido nesta demonstração.')
  await expect(page.getByRole('button', { name: 'Instagram', exact: true })).toBeVisible()
})

test('mobile bottom navigation has only working destinations or explicit feedback', async ({ page }, testInfo) => {
  if (testInfo.project.name !== 'mobile-390') test.skip()
  await setMockScenario(page, 'default')
  await page.goto('/')
  await page.getByRole('link', { name: 'Explorar catálogo' }).click()
  await expect(page).toHaveURL(/#catalog$/)
  await expect(page.locator('#catalog')).toBeInViewport()
  await page.getByRole('button', { name: 'Favoritos' }).click()
  await expect(page.getByRole('status', { name: 'Aviso de navegação' })).toContainText('não possui uma lista de favoritos')
})

test('captures final polish screens for Home, account and checkout', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'tablet-768') test.skip()
  const mobile = testInfo.project.name === 'mobile-390'
  const suffix = mobile ? 'mobile-390' : 'desktop-1440'
  await setMockScenario(page, 'default')
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(12)
  await captureEvidence(page, `home-${suffix}.png`, !mobile)

  await login(page, '/profile')
  await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible()
  if (mobile) await expect(page.getByRole('button', { name: 'Voltar à página anterior' })).toBeVisible()
  await captureEvidence(page, `profile-${suffix}.png`, true)
  await page.getByRole('link', { name: 'Carteiras', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Carteira principal' })).toBeVisible()
  await captureEvidence(page, `wallets-${suffix}.png`, true)

  await page.goto('/nfts/emerald-ape-042')
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByTestId('cart-page')).toBeVisible()
  await page.goto('/checkout')
  await expect(page.getByTestId('checkout-page')).toBeVisible()
  await page.getByRole('button', { name: 'Conectar carteira' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Carteira conectada' })).toBeVisible()
  await captureEvidence(page, `checkout-${suffix}.png`, !mobile)

  await page.getByRole('checkbox', { name: 'Usar outra carteira?' }).check()
  await page.getByRole('textbox', { name: 'Endereço da carteira manual' }).fill('0x1111111111111111111111111111111111111111')
  await captureEvidence(page, `checkout-manual-${suffix}.png`, !mobile)
})

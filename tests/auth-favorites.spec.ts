import { mkdir } from 'node:fs/promises'
import { expect, test } from './test-fixtures'
import { setMockScenario } from './helpers/mock-scenarios'
import type { Page } from '@playwright/test'

const ana = { email: 'ana@kurio.test', password: 'KurioDemo24!' }
const leo = { email: 'leo@kurio.test', password: 'Collector24!' }
const emeraldDetail = '/nfts/emerald-ape-042'

function authForm(page: Page, mode: 'login' | 'signup') {
  return page.getByRole('form', { name: mode === 'login' ? 'Formulário de acesso' : 'Formulário de cadastro' })
}

function visitorFavoriteButton(page: Page) {
  return page.getByRole('button', { name: /^Entrar para (?:adicionar aos favoritos|favoritar este NFT)$/ })
}

function signupSubmitButton(form: ReturnType<typeof authForm>) {
  return form.getByRole('button', { name: /^Criar (?:conta|perfil)$/ })
}

async function loginAs(page: Page, account: typeof ana) {
  const form = authForm(page, 'login')
  await form.getByRole('textbox', { name: 'E-mail' }).fill(account.email)
  await form.getByLabel('Senha', { exact: true }).fill(account.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
}

test('signup validates fields and reports API email conflicts', async ({ page, allowExpectedHttpFailure }) => {
  await setMockScenario(page, 'default')
  await page.goto('/signup')
  const form = authForm(page, 'signup')
  await signupSubmitButton(form).click()
  await expect(form.getByText('Informe seu nome.')).toBeVisible()
  await expect(form.getByText('Informe um e-mail válido.')).toBeVisible()

  await form.getByLabel('Nome de usuário').fill('Nova Pessoa')
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill('StrongPassword1!')
  await form.getByLabel('Confirmar senha', { exact: true }).fill('StrongPassword1!')
  allowExpectedHttpFailure('/api/auth/signup', 409)
  await signupSubmitButton(form).click()
  await expect(form.getByText('Este e-mail já está cadastrado.')).toBeVisible()

  await setMockScenario(page, 'signup-conflict')
  await form.getByRole('textbox', { name: 'E-mail' }).fill('nova@kurio.test')
  await signupSubmitButton(form).click()
  await expect(form.getByText('Este e-mail já está cadastrado.', { exact: true })).toBeVisible()
})

test('signup creates a session without retaining the submitted password', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto('/signup')
  const form = authForm(page, 'signup')
  await form.getByLabel('Nome de usuário').fill('Nova Pessoa')
  await form.getByRole('textbox', { name: 'E-mail' }).fill('nova@kurio.test')
  await form.getByLabel('Senha', { exact: true }).fill('StrongPassword1!')
  await form.getByLabel('Confirmar senha', { exact: true }).fill('StrongPassword1!')
  await signupSubmitButton(form).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await page.goto('/profile')
  await expect(page.getByRole('main').getByRole('heading', { name: 'Meu perfil', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('main').getByRole('heading', { name: 'Meu perfil', exact: true })).toBeVisible()
  const authStorage = await page.evaluate(() => localStorage.getItem('kurio:mock-auth-state') ?? '')
  expect(authStorage).not.toContain('StrongPassword1!')
  expect(authStorage).toContain('passwordDigest')
})

test('invalid login is reported by the API and remains on the login route', async ({ page, allowExpectedHttpFailure }) => {
  await setMockScenario(page, 'default')
  await page.goto('/login')
  const form = authForm(page, 'login')
  await form.getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await form.getByLabel('Senha', { exact: true }).fill('incorrect-password')
  allowExpectedHttpFailure('/api/auth/login', 401)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
  await expect.poll(() => new URL(page.url()).pathname).toBe('/login')
})

test('login preserves protected intent and restores session after refresh', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto(emeraldDetail)
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByTestId('cart-page')).toBeVisible()
  await page.goto('/checkout?step=review')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fcheckout%3Fstep%3Dreview/)
  await loginAs(page, ana)
  await expect(page).toHaveURL('/checkout?step=review')
  await expect(page.getByTestId('checkout-page')).toBeVisible()
  await page.reload()
  await expect(page).toHaveURL('/checkout?step=review')
  await expect(page.getByTestId('checkout-page')).toBeVisible()
})

test('favorites persist per account and logout removes private access', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto(emeraldDetail)
  await visitorFavoriteButton(page).click()
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fnfts%2Femerald-ape-042/)
  await loginAs(page, ana)
  await expect(page).toHaveURL(emeraldDetail)
  const anaFavorite = page.getByRole('button', { name: 'Adicionar aos favoritos' })
  await expect(anaFavorite).toBeVisible()
  await anaFavorite.click()
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute('aria-pressed', 'true')

  await page.goto(`/login?returnTo=${encodeURIComponent(emeraldDetail)}`)
  await loginAs(page, leo)
  await expect(page).toHaveURL(emeraldDetail)
  await expect(page.getByRole('button', { name: 'Adicionar aos favoritos' })).toHaveAttribute('aria-pressed', 'false')

  await page.goto('/profile')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fprofile/)
})

test('favorite optimistic update rolls back after an API failure', async ({ page, allowExpectedHttpFailure }, testInfo) => {
  await setMockScenario(page, 'favorite-error')
  allowExpectedHttpFailure('/api/favorites', 503)
  await page.goto(emeraldDetail)
  await visitorFavoriteButton(page).click()
  await loginAs(page, ana)
  const favorite = page.getByRole('button', { name: 'Adicionar aos favoritos' })
  await favorite.click()
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Adicionar aos favoritos' })).toHaveAttribute('aria-pressed', 'false')
  if (testInfo.project.name !== 'tablet-768') {
    await mkdir('evidence/lot-03', { recursive: true })
    const viewport = testInfo.project.name === 'mobile-390' ? 'mobile-390' : 'desktop-1440'
    await page.screenshot({ path: `evidence/lot-03/favorite-rollback-${viewport}-review.png` })
  }
})

test('expired session redirects with the protected destination preserved', async ({ page, allowExpectedHttpFailure }, testInfo) => {
  await setMockScenario(page, 'session-expired')
  await page.goto('/login?returnTo=%2Fprofile')
  await loginAs(page, ana)
  allowExpectedHttpFailure('/api/auth/session', 401)
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fprofile/)
  if (testInfo.project.name === 'mobile-390') {
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  } else {
    await expect(page.getByRole('dialog', { name: 'Entrar' })).toBeVisible()
  }
})

test('desktop auth dialog traps keyboard focus and closes with Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-390')
  await setMockScenario(page, 'default')
  await page.goto('/login')
  const dialog = page.getByRole('dialog')
  const close = dialog.getByRole('link', { name: 'Fechar autenticação' })
  const lastFocusable = dialog.getByRole('button', { name: 'Entrar', exact: true })
  await expect(dialog).toBeVisible()

  await close.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(lastFocusable).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect.poll(() => new URL(page.url()).pathname).toBe('/')
  await expect(page.getByRole('link', { name: 'Entrar', exact: true })).toBeFocused()
})

test('auth visual review captures login and signup at approved widths', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'tablet-768') test.skip()
  await setMockScenario(page, 'default')
  await page.goto('/login')
  await mkdir('evidence/lot-03', { recursive: true })
  const viewport = testInfo.project.name === 'mobile-390' ? 'mobile-414' : 'desktop-1440'
  if (testInfo.project.name === 'mobile-390') await page.setViewportSize({ width: 414, height: 896 })
  await expect(authForm(page, 'login').getByRole('textbox', { name: 'E-mail' })).toBeVisible()
  if (testInfo.project.name === 'mobile-390') await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  else await expect(page.getByRole('dialog')).toBeVisible()
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.screenshot({ path: `evidence/lot-03/login-${viewport}-review.png`, fullPage: viewport === 'desktop-1440' })

  await page.goto('/signup')
  await expect(authForm(page, 'signup').getByLabel('Nome de usuário')).toBeVisible()
  if (testInfo.project.name === 'mobile-390') await expect(page.getByRole('heading', { name: 'Criar perfil de colecionador' })).toBeVisible()
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.screenshot({ path: `evidence/lot-03/signup-${viewport}-review.png`, fullPage: viewport === 'desktop-1440' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { expect, test } from './test-fixtures'
import { setMockScenario } from './helpers/mock-scenarios'
import type { Page } from '@playwright/test'

const ana = { email: 'ana@kurio.test', password: 'KurioDemo24!' }
const leo = { email: 'leo@kurio.test', password: 'Collector24!' }
const validAddress = '0x1111111111111111111111111111111111111111'
const authForm = (page: Page) => page.getByRole('form', { name: 'Formulário de acesso' })
test.beforeEach(async ({ page }) => page.setDefaultTimeout(8_000))

async function login(page: Page, user = ana, returnTo = '/profile') {
  await page.goto(`/login?returnTo=${encodeURIComponent(returnTo)}`)
  const form = authForm(page)
  await form.getByRole('textbox', { name: 'E-mail' }).fill(user.email)
  await form.getByLabel('Senha', { exact: true }).fill(user.password)
  await form.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect.poll(() => new URL(page.url()).pathname).toBe(returnTo.split('?')[0])
}

async function prepare(page: Page, path = '/profile', scenario: Parameters<typeof setMockScenario>[1] = 'default', user = ana) {
  await setMockScenario(page, scenario)
  await login(page, user, path)
}

function walletEditor(page: Page) { return page.getByRole('region', { name: /Adicionar carteira|Editar carteira/ }).getByRole('form') }

test('profile route redirects guests and preserves the intended path', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fprofile/)
  await login(page, ana)
  await expect(page.getByRole('main').getByRole('heading', { name: 'Meu perfil', exact: true })).toBeVisible()
})

test('wallet route redirects guests and preserves the intended path', async ({ page }) => {
  await setMockScenario(page, 'default')
  await page.goto('/wallets')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fwallets/)
  await login(page, ana, '/wallets')
  await expect(page.getByRole('main').getByRole('heading', { name: 'Carteira principal', exact: true })).toBeVisible()
})

test('profile loads session data through the API', async ({ page }) => {
  await prepare(page)
  await expect(page.getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue('Ana Colecionadora')
  await expect(page.getByRole('main').getByRole('textbox', { name: 'E-mail', exact: true })).toHaveValue(ana.email)
})

test('profile edits persist after refresh and same-account reauthentication', async ({ page }) => {
  await prepare(page)
  const name = page.getByRole('textbox', { name: 'Nome de exibição' })
  await name.fill('Ana Colecionadora Atualizada')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toContainText('Seus dados foram salvos.')
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue('Ana Colecionadora Atualizada')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await login(page, ana)
  await expect(page.getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue('Ana Colecionadora Atualizada')
})

test('avatar upload persists across refresh', async ({ page }) => {
  await prepare(page)
  await page.getByLabel('Selecionar avatar').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ioAAAAASUVORK5CYII=', 'base64') })
  await expect(page.getByRole('status')).toContainText('Avatar atualizado.')
  await expect(page.getByRole('img', { name: 'Avatar do perfil' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('img', { name: 'Avatar do perfil' })).toBeVisible()
})

test('avatar API failure keeps the previously saved profile', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, '/profile', 'avatar-error')
  allowExpectedHttpFailure('/api/profile/avatar', 503)
  await page.getByLabel('Selecionar avatar').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ioAAAAASUVORK5CYII=', 'base64') })
  await expect(page.getByRole('alert')).toContainText('Não foi possível atualizar o avatar.')
  await expect(page.getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue('Ana Colecionadora')
})

test('wrong current password is rejected and associated with the password form', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page)
  allowExpectedHttpFailure('/api/profile/password', 422)
  await page.getByLabel('Senha atual').fill('not-the-current-password')
  await page.getByLabel('Nova senha', { exact: true }).fill('NewPassword24!')
  await page.getByLabel('Confirmar nova senha').fill('NewPassword24!')
  await page.getByRole('button', { name: 'Salvar nova senha' }).click()
  await expect(page.getByRole('alert')).toContainText('A senha atual não confere.')
})

test('password update changes the credential without persisting clear text', async ({ page }) => {
  await prepare(page)
  await page.getByLabel('Senha atual').fill(ana.password)
  await page.getByLabel('Nova senha', { exact: true }).fill('NewPassword24!')
  await page.getByLabel('Confirmar nova senha').fill('NewPassword24!')
  await page.getByRole('button', { name: 'Salvar nova senha' }).click()
  await expect(page.getByRole('status')).toContainText('Senha alterada com sucesso.')
  const stored = await page.evaluate(() => localStorage.getItem('kurio:mock-auth-state') ?? '')
  expect(stored).not.toContain('NewPassword24!')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await page.goto('/login')
  await authForm(page).getByRole('textbox', { name: 'E-mail' }).fill(ana.email)
  await authForm(page).getByLabel('Senha', { exact: true }).fill('NewPassword24!')
  await authForm(page).getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL('/')
})

test('password confirmation and minimum length are validated before request', async ({ page }) => {
  await prepare(page)
  await page.getByLabel('Senha atual').fill(ana.password)
  await page.getByLabel('Nova senha', { exact: true }).fill('short')
  await page.getByLabel('Confirmar nova senha').fill('different')
  await page.getByRole('button', { name: 'Salvar nova senha' }).click()
  await expect(page.getByRole('alert')).toContainText('Use ao menos 8 caracteres.')
  await page.getByLabel('Nova senha', { exact: true }).fill('LongPassword24!')
  await page.getByRole('button', { name: 'Salvar nova senha' }).click()
  await expect(page.getByRole('alert')).toContainText('As senhas não coincidem.')
})

test('wallet list contains the shared checkout wallet fixtures', async ({ page }) => {
  await prepare(page, '/wallets')
  await expect(page.getByRole('article', { name: /Carteira principal: MetaMask/ })).toBeVisible()
  await expect(page.getByRole('article', { name: /Carteira secundária: Coinbase/ })).toBeVisible()
})

test('wallet can be added and is available after refresh', async ({ page }) => {
  await prepare(page, '/wallets')
  await page.getByRole('button', { name: 'Adicionar carteira' }).click()
  const form = walletEditor(page)
  await form.getByRole('textbox', { name: 'Apelido da carteira' }).fill('Ledger pessoal')
  await form.getByRole('combobox', { name: 'Rede' }).selectOption('ethereum')
  await form.getByRole('textbox', { name: 'Endereço da carteira' }).fill(validAddress)
  await form.getByRole('textbox', { name: 'Nome ENS (opcional)' }).fill('ana-ledger.eth')
  await form.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(page.getByRole('article', { name: /Carteira secundária: Ledger pessoal/ })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('article', { name: /Carteira secundária: Ledger pessoal/ })).toBeVisible()
})

test('wallet can be edited through the API', async ({ page }) => {
  await prepare(page, '/wallets')
  await page.getByRole('article', { name: /Carteira secundária: Coinbase/ }).getByRole('button', { name: 'Editar carteira' }).click()
  const form = walletEditor(page)
  await form.getByRole('textbox', { name: 'Apelido da carteira' }).fill('Coinbase pessoal')
  await form.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('article', { name: /Carteira secundária: Coinbase pessoal/ })).toBeVisible()
})

test('promoting a wallet reassigns the unique primary role in the API', async ({ page }) => {
  await prepare(page, '/wallets')
  await page.getByRole('article', { name: /Carteira secundária: Coinbase/ }).getByRole('button', { name: 'Tornar principal' }).click()
  await expect(page.getByRole('article', { name: /Carteira principal: Coinbase/ })).toBeVisible()
  await expect(page.getByRole('article', { name: /Carteira secundária: MetaMask/ })).toBeVisible()
})

test('invalid wallet address returns an accessible validation error', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, '/wallets')
  allowExpectedHttpFailure('/api/wallets', 422)
  await page.getByRole('button', { name: 'Adicionar carteira' }).click()
  const form = walletEditor(page)
  await form.getByRole('textbox', { name: 'Apelido da carteira' }).fill('Carteira inválida')
  await form.getByRole('textbox', { name: 'Endereço da carteira' }).fill('0x123')
  await form.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(form.getByText('Informe um endereço EVM válido (0x e 40 caracteres hexadecimais).')).toBeVisible()
})

test('duplicate wallet on the same network returns a conflict', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, '/wallets')
  allowExpectedHttpFailure('/api/wallets', 409)
  await page.getByRole('button', { name: 'Adicionar carteira' }).click()
  const form = walletEditor(page)
  await form.getByRole('textbox', { name: 'Apelido da carteira' }).fill('Duplicada')
  await form.getByRole('combobox', { name: 'Rede' }).selectOption('ethereum')
  await form.getByRole('textbox', { name: 'Endereço da carteira' }).fill('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')
  await form.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(form.getByText('Este endereço já está cadastrado.')).toBeVisible()
})

test('profile and wallets stay isolated when switching accounts', async ({ page }) => {
  await prepare(page)
  await page.getByRole('textbox', { name: 'Nome de exibição' }).fill('Dados privados da Ana')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('status')).toContainText('Seus dados foram salvos.')
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await login(page, leo, '/profile')
  await expect(page.getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue('Leo Artista')
  await page.goto('/wallets')
  await expect(page.getByRole('article', { name: /Carteira principal: MetaMask/ })).toContainText('0x9C8f2A4B7D1E6F305A8c2b9D4E7F1A6C3D5B8E20')
})

test('wallet mutation is visible in checkout from the same store', async ({ page }) => {
  await prepare(page, '/wallets')
  await page.getByRole('article', { name: /Carteira secundária: Coinbase/ }).getByRole('button', { name: 'Editar carteira' }).click()
  const form = walletEditor(page)
  await form.getByRole('textbox', { name: 'Apelido da carteira' }).fill('Wallet compartilhada')
  await form.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('article', { name: /Carteira secundária: Wallet compartilhada/ })).toBeVisible()
  await page.goto('/nfts/emerald-ape-042')
  await page.getByRole('button', { name: 'Comprar NFT', exact: true }).click()
  await expect(page.getByTestId('cart-page')).toBeVisible()
  await page.goto('/checkout')
  await expect(page.getByRole('radio', { name: /Wallet compartilhada/ })).toBeVisible()
})

test('session expiration removes private access and keeps a login return path', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page)
  await setMockScenario(page, 'session-expired')
  allowExpectedHttpFailure('/api/auth/session', 401)
  allowExpectedHttpFailure('/api/profile', 401, { required: false })
  await page.goto('/profile')
  await expect(page).toHaveURL(/\/login\?returnTo=%2Fprofile/)
})

test('wallet service error has a retry action and recovers', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, '/wallets', 'wallet-error')
  allowExpectedHttpFailure('/api/wallets', 503)
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar as carteiras.')
  await setMockScenario(page, 'default')
  await login(page, ana, '/wallets')
  await expect(page.getByRole('article', { name: /Carteira principal/ })).toBeVisible()
})

test('wallet API mutation error preserves the saved wallet list', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, '/wallets', 'wallet-mutation-error')
  allowExpectedHttpFailure('/api/wallets', 503)
  await page.getByRole('button', { name: 'Adicionar carteira' }).click()
  const form = walletEditor(page)
  await form.getByRole('textbox', { name: 'Apelido da carteira' }).fill('Não salvar')
  await form.getByRole('textbox', { name: 'Endereço da carteira' }).fill(validAddress)
  await form.getByRole('button', { name: 'Salvar carteira' }).click()
  await expect(form.getByRole('alert')).toContainText('Não foi possível salvar a carteira.')
  await expect(page.getByRole('article', { name: /Carteira principal: MetaMask/ })).toBeVisible()
})

test('profile API mutation error does not replace persisted values', async ({ page, allowExpectedHttpFailure }) => {
  await prepare(page, '/profile', 'profile-mutation-error')
  allowExpectedHttpFailure('/api/profile', 503)
  await page.getByRole('textbox', { name: 'Nome de exibição' }).fill('Não persistir')
  await page.getByRole('button', { name: 'Salvar alterações' }).click()
  await expect(page.getByRole('alert')).toContainText('Não foi possível salvar as alterações.')
  await page.reload()
  await expect(page.getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue('Ana Colecionadora')
})

test('profile and wallet layouts have no horizontal overflow at supported widths', async ({ page }) => {
  const width = page.viewportSize()?.width ?? 1440
  await prepare(page, '/profile')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.goto('/wallets')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  expect([390, 768, 1440]).toContain(width)
})

test('profile desktop and mobile review screenshots', async ({ page }) => {
  const width = page.viewportSize()?.width
  test.skip(width !== 390 && width !== 1440, 'Visual review captures are limited to the requested mobile and desktop frames.')
  await prepare(page)
  await page.evaluate(() => document.fonts.ready)
  const folder = join(process.cwd(), 'evidence/lot-06')
  await mkdir(folder, { recursive: true })
  const file = width === 390 ? 'profile-mobile-390-review.png' : 'profile-desktop-1440-review.png'
  await page.screenshot({ path: join(folder, file), fullPage: true })
})

test('wallet desktop and mobile review screenshots', async ({ page }) => {
  const width = page.viewportSize()?.width
  test.skip(width !== 390 && width !== 1440, 'Visual review captures are limited to the requested mobile and desktop frames.')
  await prepare(page, '/wallets')
  await page.evaluate(() => document.fonts.ready)
  const folder = join(process.cwd(), 'evidence/lot-06')
  await mkdir(folder, { recursive: true })
  const file = width === 390 ? 'wallets-mobile-390-review.png' : 'wallets-desktop-1440-review.png'
  await page.screenshot({ path: join(folder, file), fullPage: true })
})

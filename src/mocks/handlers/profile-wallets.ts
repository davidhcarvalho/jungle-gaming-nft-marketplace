import { http, HttpResponse } from 'msw'
import { getMockScenario } from '@/mocks/scenarios/state'
import { changeMockPassword, getMockSession } from '@/mocks/state/auth-store'
import { addWallet, getWalletsForUser, updateWallet, walletNetworks } from '@/mocks/state/wallets-store'
import { getProfile, removeAvatar, updateAvatar, updateProfile } from '@/mocks/state/profile-store'
import type { ApiError, ChangePasswordPayload, UpdateAvatarPayload, UpdateProfilePayload, WalletPayload } from '@/types/api'

export const profileWalletHandlers = [
  http.get('/api/profile', ({ request }) => {
    const session = requireUser(request)
    if (!session) return apiError('unauthorized', 'Entre para acessar seu perfil.', 401)
    if (getMockScenario() === 'profile-error') return apiError('server', 'Não foi possível carregar seu perfil.', 503)
    return HttpResponse.json(getProfile(session.session.user))
  }),
  http.patch('/api/profile', async ({ request }) => {
    const session = requireUser(request)
    if (!session) return apiError('unauthorized', 'Entre para editar seu perfil.', 401)
    if (getMockScenario() === 'profile-mutation-error') return apiError('server', 'Não foi possível salvar as alterações.', 503)
    const body = await readBody<UpdateProfilePayload>(request)
    const fields: Record<string, string> = {}
    if (typeof body.displayName !== 'string' || body.displayName.trim().length < 2) fields.displayName = 'Informe seu nome de exibição.'
    if (typeof body.username !== 'string' || !/^[a-zA-Z0-9._-]{3,24}$/.test(body.username.trim())) fields.username = 'Use de 3 a 24 letras, números, ponto, hífen ou sublinhado.'
    if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) fields.email = 'Informe um e-mail válido.'
    if (typeof body.ensName !== 'string' || (body.ensName && !/^[a-zA-Z0-9-]+(?:\.eth)?$/.test(body.ensName.trim()))) fields.ensName = 'Informe um nome ENS válido ou deixe vazio.'
    if (typeof body.walletNickname !== 'string' || body.walletNickname.length > 40) fields.walletNickname = 'O apelido deve ter até 40 caracteres.'
    if (Object.keys(fields).length) return apiError('validation', 'Revise os campos do perfil.', 422, fields)
    const profile = updateProfile(session.session.user.id, { displayName: body.displayName.trim(), username: body.username.trim(), email: body.email.trim(), ensName: body.ensName.trim(), walletNickname: body.walletNickname.trim() })
    if (!profile) return apiError('not_found', 'Perfil não encontrado.', 404)
    return HttpResponse.json(profile)
  }),
  http.post('/api/profile/avatar', async ({ request }) => {
    const session = requireUser(request)
    if (!session) return apiError('unauthorized', 'Entre para alterar seu avatar.', 401)
    if (getMockScenario() === 'avatar-error') return apiError('server', 'Não foi possível atualizar o avatar.', 503)
    const body = await readBody<UpdateAvatarPayload>(request)
    if (typeof body.avatarDataUrl !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(body.avatarDataUrl) || body.avatarDataUrl.length > 2_000_000) return apiError('validation', 'Envie uma imagem PNG, JPEG ou WebP de até 1,5 MB.', 422, { avatar: 'Formato ou tamanho de imagem inválido.' })
    const profile = updateAvatar(session.session.user.id, body.avatarDataUrl)
    return profile ? HttpResponse.json(profile) : apiError('not_found', 'Perfil não encontrado.', 404)
  }),
  http.delete('/api/profile/avatar', ({ request }) => {
    const session = requireUser(request)
    if (!session) return apiError('unauthorized', 'Entre para remover seu avatar.', 401)
    const profile = removeAvatar(session.session.user.id)
    return profile ? HttpResponse.json(profile) : apiError('not_found', 'Perfil não encontrado.', 404)
  }),
  http.post('/api/profile/password', async ({ request }) => {
    const session = requireUser(request)
    if (!session) return apiError('unauthorized', 'Entre para alterar sua senha.', 401)
    if (getMockScenario() === 'password-error') return apiError('server', 'Não foi possível alterar a senha.', 503)
    const body = await readBody<ChangePasswordPayload>(request)
    if (typeof body.newPassword !== 'string' || body.newPassword.length < 8) return apiError('validation', 'Use ao menos 8 caracteres.', 422, { newPassword: 'Use ao menos 8 caracteres.' })
    if (!await changeMockPassword(session.session.user.id, body.currentPassword, body.newPassword)) return apiError('validation', 'A senha atual não confere.', 422, { currentPassword: 'Confira sua senha atual.' })
    return HttpResponse.json({ status: 'updated' })
  }),
  http.get('/api/wallets', ({ request }) => {
    const session = requireUser(request)
    if (!session) return apiError('unauthorized', 'Entre para acessar suas carteiras.', 401)
    if (getMockScenario() === 'wallet-error') return apiError('server', 'Não foi possível carregar as carteiras.', 503)
    return HttpResponse.json(getWalletsForUser(session.session.user.id))
  }),
  http.post('/api/wallets', async ({ request }) => {
    const session = requireUser(request)
    if (!session) return apiError('unauthorized', 'Entre para cadastrar uma carteira.', 401)
    if (getMockScenario() === 'wallet-mutation-error') return apiError('server', 'Não foi possível salvar a carteira.', 503)
    const body = await readBody<WalletPayload>(request)
    const error = validateWallet(body)
    if (error) return HttpResponse.json(error, { status: 422 })
    const wallet = addWallet(session.session.user.id, body)
    if (!wallet) return apiError('conflict', 'Esta carteira já está cadastrada nesta rede.', 409, { address: 'Este endereço já está cadastrado.' })
    return HttpResponse.json({ wallet, ...getWalletsForUser(session.session.user.id) }, { status: 201 })
  }),
  http.patch('/api/wallets/:walletId', async ({ request, params }) => {
    const session = requireUser(request)
    if (!session) return apiError('unauthorized', 'Entre para editar uma carteira.', 401)
    if (getMockScenario() === 'wallet-mutation-error') return apiError('server', 'Não foi possível salvar a carteira.', 503)
    const body = await readBody<WalletPayload>(request)
    const error = validateWallet(body)
    if (error) return HttpResponse.json(error, { status: 422 })
    const wallets = getWalletsForUser(session.session.user.id).wallets
    if (!wallets.some((wallet) => wallet.id === String(params.walletId))) return apiError('not_found', 'Carteira não encontrada.', 404)
    const updated = updateWallet(session.session.user.id, String(params.walletId), body)
    if (!updated) return apiError('conflict', 'Esta carteira já está cadastrada nesta rede.', 409, { address: 'Este endereço já está cadastrado.' })
    return HttpResponse.json({ wallet: updated, ...getWalletsForUser(session.session.user.id) })
  }),
]

function validateWallet(body: WalletPayload): ApiError | undefined {
  const fields: Record<string, string> = {}
  if (typeof body.label !== 'string' || body.label.trim().length < 2 || body.label.trim().length > 40) fields.label = 'Informe um apelido entre 2 e 40 caracteres.'
  if (typeof body.address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(body.address.trim())) fields.address = 'Informe um endereço EVM válido (0x e 40 caracteres hexadecimais).'
  if (!walletNetworks.some((network) => network.id === body.networkId)) fields.networkId = 'Selecione uma rede disponível.'
  if (body.ensName !== undefined && (typeof body.ensName !== 'string' || (body.ensName && !/^[a-zA-Z0-9-]+\.eth$/.test(body.ensName.trim())))) fields.ensName = 'Informe um nome .eth válido ou deixe vazio.'
  if (body.role !== undefined && body.role !== 'primary' && body.role !== 'secondary') fields.role = 'Tipo de carteira inválido.'
  return Object.keys(fields).length ? { code: 'validation', message: 'Revise os dados da carteira.', fields } : undefined
}
function requireUser(request: Request) { if (getMockScenario() === 'session-expired') return undefined; const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''); return getMockSession(token ?? null) }
async function readBody<T>(request: Request): Promise<T> { try { const value: unknown = await request.json(); return typeof value === 'object' && value !== null ? value as T : {} as T } catch { return {} as T } }
function apiError(code: ApiError['code'], message: string, status: number, fields?: ApiError['fields']): Response { return HttpResponse.json<ApiError>({ code, message, fields }, { status }) }

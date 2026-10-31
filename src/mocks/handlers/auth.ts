import { delay, http, HttpResponse } from 'msw'

import { getMockScenario } from '@/mocks/scenarios/state'
import {
  addMockFavorite,
  createMockAccount,
  digestMockPassword,
  findMockAccount,
  getMockFavorites,
  getMockSession,
  issueMockSession,
  removeMockFavorite,
  revokeMockSession,
} from '@/mocks/state/auth-store'
import { nftFixtures } from '@/features/catalog/fixtures'
import type { ApiError, AuthPayload, AuthResponse, FavoritesResponse, SignupPayload } from '@/types/api'

export const authHandlers = [
  http.post('/api/auth/signup', async ({ request }) => {
    const body = await readJson<SignupPayload>(request)
    const validation = validateSignup(body)
    if (validation) return HttpResponse.json(validation, { status: 422 })

    const email = body.email.trim().toLowerCase()
    if (getMockScenario() === 'signup-conflict' || findMockAccount(email)) {
      return apiError('conflict', 'Já existe uma conta com este e-mail.', 409, { email: 'Este e-mail já está cadastrado.' })
    }

    const digest = await digestMockPassword(email, body.password)
    const account = {
      id: `user-${crypto.randomUUID()}`,
      displayName: body.displayName.trim(),
      email,
      passwordDigest: digest,
    }
    const user = createMockAccount(account)
    const result = issueMockSession(user.id)
    if (!result) return apiError('server', 'Não foi possível criar a sessão.', 500)
    return HttpResponse.json<AuthResponse>(result, { status: 201 })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = await readJson<AuthPayload>(request)
    const validation = validateLogin(body)
    if (validation) return HttpResponse.json(validation, { status: 422 })

    const email = body.email.trim().toLowerCase()
    const account = findMockAccount(email)
    const digest = await digestMockPassword(email, body.password)
    if (!account || account.passwordDigest !== digest) {
      return apiError('unauthorized', 'E-mail ou senha incorretos.', 401)
    }

    const result = issueMockSession(account.id)
    if (!result) return apiError('server', 'Não foi possível iniciar a sessão.', 500)
    return HttpResponse.json<AuthResponse>(result)
  }),

  http.get('/api/auth/session', ({ request }) => {
    if (getMockScenario() === 'session-expired') {
      return apiError('unauthorized', 'Sua sessão expirou. Entre novamente para continuar.', 401)
    }
    const sessionToken = readSessionToken(request)
    if (!sessionToken) return HttpResponse.json(null)
    const session = getMockSession(sessionToken)
    if (!session) return apiError('unauthorized', 'Sua sessão não é válida.', 401)
    return HttpResponse.json(session.session)
  }),

  http.post('/api/auth/logout', ({ request }) => {
    revokeMockSession(readSessionToken(request))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/favorites', ({ request }) => {
    const session = requireSession(request)
    if (!session) return apiError('unauthorized', 'Entre para ver seus favoritos.', 401)
    const favorites = getMockFavorites(session.userId).filter((favorite) => nftFixtures.some((nft) => nft.id === favorite.nftId))
    return HttpResponse.json<FavoritesResponse>({ userId: session.userId, favorites })
  }),

  http.post('/api/favorites', async ({ request }) => {
    const session = requireSession(request)
    if (!session) return apiError('unauthorized', 'Entre para salvar favoritos.', 401)
    if (getMockScenario() === 'favorite-error') {
      await delay(400)
      return apiError('server', 'Não foi possível salvar este favorito.', 503)
    }

    const body = await readJson<{ nftId?: unknown }>(request)
    const nftId = typeof body.nftId === 'string' ? body.nftId : ''
    if (!nftFixtures.some((nft) => nft.id === nftId)) {
      return apiError('not_found', 'Este NFT não está disponível.', 404)
    }
    return HttpResponse.json<FavoritesResponse>({ userId: session.userId, favorites: addMockFavorite(session.userId, nftId) }, { status: 201 })
  }),

  http.delete('/api/favorites/:nftId', async ({ request, params }) => {
    const session = requireSession(request)
    if (!session) return apiError('unauthorized', 'Entre para remover favoritos.', 401)
    if (getMockScenario() === 'favorite-error') {
      await delay(400)
      return apiError('server', 'Não foi possível atualizar seus favoritos.', 503)
    }
    const nftId = String(params.nftId)
    return HttpResponse.json<FavoritesResponse>({ userId: session.userId, favorites: removeMockFavorite(session.userId, nftId) })
  }),
]

function readSessionToken(request: Request) {
  return request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null
}

function requireSession(request: Request) {
  if (getMockScenario() === 'session-expired') return undefined
  return getMockSession(readSessionToken(request))
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    const body: unknown = await request.json()
    return typeof body === 'object' && body !== null ? body as T : {} as T
  } catch {
    return {} as T
  }
}

function validateLogin(body: AuthPayload): ApiError | undefined {
  const fields: Record<string, string> = {}
  if (!isEmail(body.email)) fields.email = 'Informe um e-mail válido.'
  if (typeof body.password !== 'string' || body.password.length < 1) fields.password = 'Informe sua senha.'
  return Object.keys(fields).length ? { code: 'validation', message: 'Revise os campos informados.', fields } : undefined
}

function validateSignup(body: SignupPayload): ApiError | undefined {
  const fields: Record<string, string> = {}
  if (typeof body.displayName !== 'string' || body.displayName.trim().length < 2) fields.displayName = 'Informe seu nome.'
  if (!isEmail(body.email)) fields.email = 'Informe um e-mail válido.'
  if (typeof body.password !== 'string' || body.password.length < 8) fields.password = 'Use ao menos 8 caracteres.'
  if (typeof body.passwordConfirmation !== 'string' || body.password !== body.passwordConfirmation) fields.passwordConfirmation = 'As senhas não coincidem.'
  return Object.keys(fields).length ? { code: 'validation', message: 'Revise os campos informados.', fields } : undefined
}

function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function apiError(code: ApiError['code'], message: string, status: number, fields?: ApiError['fields']): Response {
  return HttpResponse.json<ApiError>({ code, message, fields }, { status })
}

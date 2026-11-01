import { http, HttpResponse } from 'msw'

import { updateMockNftAvailability, updateMockNftPrice } from '@/mocks/state/catalog-price-overrides'
import { disconnectMockSockets, getMockSocketConnectionCount, publishNftUpdated, publishOrderUpdated } from '@/mocks/socket/server'
import { getOrderForUser, transitionMockOrder } from '@/mocks/state/orders-store'
import type { NFT, NftUpdatedEvent, Order, OrderStatus, OrderUpdatedEvent } from '@/types/domain'

export const realtimeScenarioHandlers = [
  http.post('/api/test-scenarios/realtime', async ({ request }) => {
    const body = await readBody(request)
    if (body.action === 'nft-price') return updateNftPrice(body)
    if (body.action === 'nft-availability') return updateNftAvailability(body)
    if (body.action === 'order-status') return updateOrder(body, true)
    if (body.action === 'order-status-missed') return updateOrder(body, false, true)
    if (body.action === 'disconnect') {
      disconnectMockSockets(typeof body.userId === 'string' ? body.userId : undefined)
      return HttpResponse.json({ disconnected: true, remainingConnections: getMockSocketConnectionCount() })
    }
    return HttpResponse.json({ code: 'validation', message: 'Ação realtime inválida.' }, { status: 422 })
  }),
]

function updateNftPrice(body: Record<string, unknown>) {
  if (typeof body.nftId !== 'string' || typeof body.priceEth !== 'string') return validationError()
  const resource = updateMockNftPrice(body.nftId, body.priceEth)
  if (!resource) return HttpResponse.json({ code: 'not_found', message: 'NFT ou preço inválido.' }, { status: 404 })
  const event = createNftEvent(resource, 'price')
  publishNftUpdated(event)
  if (body.delivery === 'duplicate') publishNftUpdated(event)
  if (body.delivery === 'duplicate-and-stale') {
    publishNftUpdated(event)
    publishNftUpdated(createStaleNftEvent(resource))
  }
  return HttpResponse.json({ resource, event, connections: getMockSocketConnectionCount() })
}

function updateNftAvailability(body: Record<string, unknown>) {
  if (typeof body.nftId !== 'string' || typeof body.editionId !== 'string' || !Number.isSafeInteger(body.available)) return validationError()
  const resource = updateMockNftAvailability(body.nftId, body.editionId, body.available as number)
  if (!resource) return HttpResponse.json({ code: 'validation', message: 'Edição ou disponibilidade inválida.' }, { status: 422 })
  const event = createNftEvent(resource, 'availability', [body.editionId])
  publishNftUpdated(event)
  return HttpResponse.json({ resource, event, connections: getMockSocketConnectionCount() })
}

function updateOrder(body: Record<string, unknown>, publish: boolean, disconnectFirst = false) {
  const userId = typeof body.userId === 'string' ? body.userId : undefined
  const orderId = typeof body.orderId === 'string' ? body.orderId : undefined
  const status = body.status
  if (!userId || !orderId || (status !== 'confirmed' && status !== 'rejected')) return validationError()
  const order = getOrderForUser(userId, orderId)
  if (!order) return HttpResponse.json({ code: 'not_found', message: 'Pedido não encontrado para este usuário.' }, { status: 404 })
  if (disconnectFirst) disconnectMockSockets(userId)
  const previous = structuredClone(order)
  const updated = transitionMockOrder(order, status as Extract<OrderStatus, 'confirmed' | 'rejected'>)
  if (publish && updated.version > previous.version) publishOrderUpdated(userId, createOrderEvent(previous, updated))
  if ((body.delivery === 'duplicate' || body.delivery === 'duplicate-and-stale') && publish) publishOrderUpdated(userId, createOrderEvent(previous, updated))
  if ((body.delivery === 'stale' || body.delivery === 'duplicate-and-stale') && publish) publishOrderUpdated(userId, createStaleOrderEvent(previous, updated))
  return HttpResponse.json({ order: updated, connections: getMockSocketConnectionCount() })
}

function createNftEvent(resource: NFT, reason: NftUpdatedEvent['payload']['reason'], changedEditionIds?: string[]): NftUpdatedEvent {
  return {
    eventId: `nft:${resource.id}:v${resource.version}`,
    resourceId: resource.id,
    version: resource.version,
    resource,
    payload: { reason, changedEditionIds: changedEditionIds ?? resource.editions.map((edition) => edition.id) },
  }
}

function createStaleNftEvent(resource: NFT): NftUpdatedEvent {
  const previous = structuredClone(resource)
  previous.version = Math.max(0, resource.version - 1)
  return { ...createNftEvent(previous, 'price'), eventId: `nft:${resource.id}:stale-v${previous.version}` }
}

function createOrderEvent(previous: Order, order: Order): OrderUpdatedEvent {
  return {
    eventId: `order:${order.id}:v${order.version}`,
    resourceId: order.id,
    version: order.version,
    resource: structuredClone(order),
    payload: { previousStatus: previous.status, status: order.status },
  }
}

function createStaleOrderEvent(previous: Order, current: Order): OrderUpdatedEvent {
  const stale = structuredClone(previous)
  return {
    eventId: `order:${current.id}:stale-v${stale.version}`,
    resourceId: current.id,
    version: stale.version,
    resource: stale,
    payload: { previousStatus: stale.status, status: stale.status },
  }
}

function validationError() {
  return HttpResponse.json({ code: 'validation', message: 'Parâmetros de cenário realtime inválidos.' }, { status: 422 })
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json()
    return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

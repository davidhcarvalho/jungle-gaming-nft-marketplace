import type { QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'
import type { NFTListResponse, OrderResponse } from '@/types/api'
import type { NFT, NftUpdatedEvent, OrderUpdatedEvent } from '@/types/domain'

export interface RealtimeEventNotice {
  eventId: string
  type: 'nft.updated' | 'order.updated'
  resourceId: string
  version: number
  message: string
  receivedCount: number
  appliedCount: number
  ignoredCount: number
}

export function createRealtimeEventConsumer(queryClient: QueryClient, userId: string | undefined, onNotice: (notice: RealtimeEventNotice) => void) {
  const versions = new Map<string, number>()
  const eventIds = new Set<string>()
  let receivedCount = 0
  let appliedCount = 0
  let ignoredCount = 0

  function publishNotice(type: RealtimeEventNotice['type'], event: NftUpdatedEvent | OrderUpdatedEvent, message: string, applied: boolean) {
    receivedCount += 1
    if (applied) appliedCount += 1
    else ignoredCount += 1
    onNotice({
      eventId: event.eventId,
      type,
      resourceId: event.resourceId,
      version: event.version,
      message,
      receivedCount,
      appliedCount,
      ignoredCount,
    })
  }

  function onNftUpdated(event: NftUpdatedEvent) {
    const eventKey = `nft:${event.resourceId}`
    const knownVersion = Math.max(versions.get(eventKey) ?? 0, getKnownNftVersion(queryClient, event.resourceId))
    if (!isValidNftEvent(event) || eventIds.has(event.eventId) || event.version <= knownVersion) {
      eventIds.add(event.eventId)
      publishNotice('nft.updated', event, '', false)
      return
    }

    eventIds.add(event.eventId)
    versions.set(eventKey, event.version)
    queryClient.setQueryData(queryKeys.nft.detail(event.resourceId), event.resource)
    void queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all })
    void queryClient.invalidateQueries({ queryKey: queryKeys.nft.detail(event.resourceId) })
    invalidateCartAndQuote(queryClient)
    const message = event.payload.reason === 'price'
      ? 'O preço deste NFT foi atualizado. A cotação precisa ser revisada.'
      : 'A disponibilidade desta edição foi alterada. Revise seu carrinho e sua cotação.'
    publishNotice('nft.updated', event, message, true)
  }

  function onOrderUpdated(event: OrderUpdatedEvent) {
    const order = event.resource
    if (!userId || order.userId !== userId || !isValidOrderEvent(event)) {
      publishNotice('order.updated', event, '', false)
      return
    }

    const queryKey = queryKeys.private.order(userId, event.resourceId)
    const current = queryClient.getQueryData<OrderResponse>(queryKey)?.order
    const eventKey = `order:${event.resourceId}`
    const knownVersion = Math.max(versions.get(eventKey) ?? 0, current?.version ?? 0)
    const terminalConflict = current && current.status !== 'pending' && current.status !== order.status
    if (eventIds.has(event.eventId) || event.version <= knownVersion || terminalConflict) {
      eventIds.add(event.eventId)
      publishNotice('order.updated', event, '', false)
      return
    }

    eventIds.add(event.eventId)
    versions.set(eventKey, event.version)
    queryClient.setQueryData<OrderResponse>(queryKey, { order, receipt: order.receipt })
    void queryClient.invalidateQueries({ queryKey })
    invalidateCartAndQuote(queryClient)
    publishNotice('order.updated', event, order.status === 'confirmed' ? 'Pedido confirmado.' : 'Pagamento recusado.', true)
  }

  return { onNftUpdated, onOrderUpdated }
}

export function invalidateRealtimeResources(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.catalog.all })
  void queryClient.invalidateQueries({ queryKey: ['nft'] })
  invalidateCartAndQuote(queryClient)
  void queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === 'private' && query.queryKey[2] === 'orders',
  })
}

function invalidateCartAndQuote(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] === 'private' && (query.queryKey[2] === 'cart' || query.queryKey[2] === 'quote'),
  })
}

function getKnownNftVersion(queryClient: QueryClient, nftId: string) {
  const detail = queryClient.getQueryData<NFT>(queryKeys.nft.detail(nftId))?.version ?? 0
  const listVersions = queryClient.getQueriesData<NFTListResponse>({ queryKey: queryKeys.catalog.all }).flatMap(([, data]) => {
    const nft = data?.items.find((item) => item.id === nftId)
    const featured = data?.featured.id === nftId ? data.featured : undefined
    return [nft?.version ?? 0, featured?.version ?? 0]
  })
  return Math.max(detail, ...listVersions)
}

function isValidNftEvent(event: NftUpdatedEvent): boolean {
  return Boolean(event && event.eventId && event.resourceId === event.resource.id
    && event.version === event.resource.version && Number.isSafeInteger(event.version)
    && (event.payload.reason === 'price' || event.payload.reason === 'availability'))
}

function isValidOrderEvent(event: OrderUpdatedEvent): boolean {
  const validStatus = event.resource.status === 'pending' || event.resource.status === 'confirmed' || event.resource.status === 'rejected'
  return Boolean(event && event.eventId && event.resourceId === event.resource.id
    && event.version === event.resource.version && Number.isSafeInteger(event.version) && validStatus)
}

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type PropsWithChildren } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Socket } from 'socket.io-client'

import { getSessionToken } from '@/lib/session-token'
import { queryKeys } from '@/lib/query-keys'
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/types/domain'
import { createMarketplaceSocket } from '@/realtime/socket-client'
import { createRealtimeEventConsumer, invalidateRealtimeResources, type RealtimeEventNotice } from '@/realtime/consume-events'
import { registerRealtimeTeardown } from '@/realtime/session-lifecycle'

interface RealtimeSnapshot {
  status: 'disabled' | 'connecting' | 'connected' | 'disconnected' | 'error'
  lastMessage: string
  lastNftUpdate?: { nftId: string; version: number; message: string }
  lastOrderUpdate?: { orderId: string; version: number; message: string }
  receivedCount: number
  appliedCount: number
  ignoredCount: number
}

const initialSnapshot: RealtimeSnapshot = { status: 'connecting', lastMessage: '', receivedCount: 0, appliedCount: 0, ignoredCount: 0 }
const RealtimeContext = createContext<RealtimeSnapshot>(initialSnapshot)

export function RealtimeProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const identity = useSyncExternalStore(
    (notify) => queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === queryKeys.auth.session[0] && event.query.queryKey.length === queryKeys.auth.session.length) notify()
    }),
    () => readSessionIdentity(queryClient),
    () => 'pending',
  )
  const userId = identity === 'pending' || identity === 'anonymous' ? undefined : identity
  const sessionReady = identity !== 'pending'
  const [snapshot, setSnapshot] = useState<RealtimeSnapshot>(initialSnapshot)

  useEffect(() => {
    const shouldConnect = import.meta.env.VITE_ENABLE_MOCKS === 'true' || Boolean(import.meta.env.VITE_SOCKET_URL)
    if (!sessionReady) return
    if (!shouldConnect) {
      setSnapshot({ ...initialSnapshot, status: 'disabled' })
      return
    }

    let disposed = false
    let connectedBefore = false
    let socket: Socket | undefined
    let unregisterTeardown: (() => void) | undefined
    setSnapshot({ ...initialSnapshot, status: 'connecting' })

    void createMarketplaceSocket(getSessionToken()).then((createdSocket) => {
      if (disposed) {
        createdSocket.disconnect()
        return
      }
      socket = createdSocket
      const consumer = createRealtimeEventConsumer(queryClient, userId, onNotice)
      unregisterTeardown = registerRealtimeTeardown(() => {
        disposed = true
        socket?.removeAllListeners()
        socket?.disconnect()
      })

      socket.on('connect', () => {
        const isReconnect = connectedBefore
        connectedBefore = true
        socket?.emit('subscribe', { token: getSessionToken(), userId })
        setSnapshot((previous) => ({ ...previous, status: 'connecting' }))
        if (isReconnect) {
          socket?.once('subscribed', () => {
            if (!disposed) invalidateRealtimeResources(queryClient)
          })
        }
      })
      socket.on('subscribed', (acknowledgement: { userId: string | null }) => {
        if (disposed || acknowledgement.userId !== (userId ?? null)) return
        setSnapshot((previous) => ({ ...previous, status: 'connected' }))
      })
      socket.on('subscription:error', () => {
        if (!disposed) setSnapshot((previous) => ({ ...previous, status: 'error' }))
      })
      socket.on('disconnect', () => {
        if (!disposed) setSnapshot((previous) => ({ ...previous, status: 'disconnected' }))
      })
      socket.on('connect_error', () => {
        if (!disposed) setSnapshot((previous) => ({ ...previous, status: 'error' }))
      })
      socket.on('nft.updated', (event: NftUpdatedEvent) => {
        if (!disposed) consumer.onNftUpdated(event)
      })
      socket.on('order.updated', (event: OrderUpdatedEvent) => {
        if (!disposed) consumer.onOrderUpdated(event)
      })
      socket.connect()
    }).catch(() => {
      if (!disposed) setSnapshot((previous) => ({ ...previous, status: 'error' }))
    })

    return () => {
      disposed = true
      unregisterTeardown?.()
      socket?.removeAllListeners()
      socket?.disconnect()
    }

    function onNotice(notice: RealtimeEventNotice) {
      if (disposed) return
      setSnapshot((previous) => ({
        ...previous,
        receivedCount: notice.receivedCount,
        appliedCount: notice.appliedCount,
        ignoredCount: notice.ignoredCount,
        lastMessage: notice.message || previous.lastMessage,
        lastNftUpdate: notice.type === 'nft.updated' && notice.message
          ? { nftId: notice.resourceId, version: notice.version, message: notice.message }
          : previous.lastNftUpdate,
        lastOrderUpdate: notice.type === 'order.updated' && notice.message
          ? { orderId: notice.resourceId, version: notice.version, message: notice.message }
          : previous.lastOrderUpdate,
      }))
      document.documentElement.dataset.realtimeLastEvent = notice.eventId
    }
  }, [queryClient, sessionReady, userId])

  const lastEvent = snapshot.lastMessage

  return (
    <RealtimeContext.Provider value={snapshot}>
      <div
        className="sr-only"
        data-testid="realtime-channel"
        data-status={snapshot.status}
        data-received-events={snapshot.receivedCount}
        data-applied-events={snapshot.appliedCount}
        data-ignored-events={snapshot.ignoredCount}
        data-last-nft-id={snapshot.lastNftUpdate?.nftId ?? ''}
        data-last-nft-version={snapshot.lastNftUpdate?.version ?? ''}
        data-last-order-id={snapshot.lastOrderUpdate?.orderId ?? ''}
        aria-live="polite"
        aria-atomic="true"
      >{lastEvent}</div>
      {children}
    </RealtimeContext.Provider>
  )
}

function readSessionIdentity(queryClient: ReturnType<typeof useQueryClient>) {
  const query = queryClient.getQueryCache().find({ queryKey: queryKeys.auth.session })
  if (!query || query.state.status === 'pending') return 'pending'
  const session = query.state.data as { user?: { id?: string } } | null | undefined
  return session?.user?.id ?? 'anonymous'
}

export function useRealtimeSnapshot() {
  return useContext(RealtimeContext)
}

export function isNftRealtimeUpdateForItems(snapshot: RealtimeSnapshot, nftIds: string[]) {
  return Boolean(snapshot.lastNftUpdate && nftIds.includes(snapshot.lastNftUpdate.nftId))
}


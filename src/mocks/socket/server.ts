import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import { getMockSession } from '@/mocks/state/auth-store'

type SocketConnection = ReturnType<typeof toSocketIo>
interface MockClient { connection: SocketConnection; userId?: string }

const socketLink = ws.link(window.location.origin)
const connections = new Map<string, MockClient>()

export const socketHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    const socket = toSocketIo(connection)
    const client: MockClient = { connection: socket }
    connections.set(connection.client.id, client)

    socket.client.on('subscribe', (_event, rawPayload: unknown) => {
      const payload = readSubscription(rawPayload)
      if (!payload) {
        socket.client.emit('subscription:error', { code: 'invalid_subscription' })
        return
      }

      const session = payload.token ? getMockSession(payload.token) : undefined
      if (payload.token && (!session || session.userId !== payload.userId)) {
        client.userId = undefined
        socket.client.emit('subscription:error', { code: 'unauthorized' })
        return
      }

      client.userId = session?.userId
      socket.client.emit('subscribed', { userId: client.userId ?? null })
    })

    connection.client.addEventListener('close', () => {
      connections.delete(connection.client.id)
    })
  }),
]

export function publishNftUpdated(event: unknown) {
  for (const client of connections.values()) client.connection.client.emit('nft.updated', event)
}

export function publishOrderUpdated(userId: string, event: unknown) {
  for (const client of connections.values()) {
    if (client.userId === userId) client.connection.client.emit('order.updated', event)
  }
}

export function disconnectMockSockets(userId?: string) {
  for (const [id, client] of connections) {
    if (userId && client.userId !== userId) continue
    client.connection.rawClient.close(4000, 'Deterministic scenario disconnect')
    connections.delete(id)
  }
}

export function getMockSocketConnectionCount() {
  return connections.size
}

function readSubscription(value: unknown): { userId?: string; token?: string } | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const record = value as Record<string, unknown>
  if (record.userId !== undefined && typeof record.userId !== 'string') return undefined
  if (record.token !== undefined && record.token !== null && typeof record.token !== 'string') return undefined
  return { userId: record.userId as string | undefined, token: record.token as string | undefined }
}

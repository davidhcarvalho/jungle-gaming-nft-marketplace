import type { ManagerOptions, SocketOptions } from 'socket.io-client'

export async function createMarketplaceSocket(token?: string | null) {
  // Import after the awaited MSW bootstrap so Socket.IO captures the intercepted
  // browser WebSocket implementation, not the network implementation pre-MSW.
  const { io } = await import('socket.io-client')
  const origin = import.meta.env.VITE_SOCKET_URL || window.location.origin
  const options: Partial<ManagerOptions & SocketOptions> = {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 150,
    reconnectionDelayMax: 800,
    auth: token ? { token } : {},
  }
  return io(origin, options)
}

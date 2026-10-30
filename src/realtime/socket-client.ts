import { io } from 'socket.io-client'

export function createMarketplaceSocket() {
  const origin = import.meta.env.VITE_SOCKET_URL || window.location.origin

  return io(origin, {
    autoConnect: false,
    withCredentials: true,
  })
}

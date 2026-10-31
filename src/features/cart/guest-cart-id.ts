const guestCartIdKey = 'kurio:guest-cart-id'

export function getGuestCartId() {
  try {
    const existingId = window.localStorage.getItem(guestCartIdKey)
    if (existingId) return existingId
    const nextId = crypto.randomUUID()
    window.localStorage.setItem(guestCartIdKey, nextId)
    return nextId
  } catch {
    return 'ephemeral-guest'
  }
}

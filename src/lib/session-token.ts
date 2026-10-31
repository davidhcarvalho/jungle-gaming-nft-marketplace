const sessionTokenKey = 'kurio:session-token'

export function getSessionToken() {
  try {
    return window.localStorage.getItem(sessionTokenKey)
  } catch {
    return null
  }
}

export function setSessionToken(token: string) {
  try {
    window.localStorage.setItem(sessionTokenKey, token)
  } catch {
    // Session remains usable in memory for this page when storage is unavailable.
  }
}

export function clearSessionToken() {
  try {
    window.localStorage.removeItem(sessionTokenKey)
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}

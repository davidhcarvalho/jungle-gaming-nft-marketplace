import { validateCatalogSearch } from '@/features/catalog/model'
import type { NavigateFn } from '@tanstack/react-router'

let lastSafeAccountReturnPath: string | undefined

const safeHomeAnchors = new Set(['#catalog', '#features', '#journal', '#main-content'])

export function rememberSafeAccountReturnPath(href: string) {
  const current = new URL(href, window.location.origin)
  if (current.origin !== window.location.origin) return

  if (current.pathname === '/' && (!current.hash || safeHomeAnchors.has(current.hash))) {
    lastSafeAccountReturnPath = `${current.pathname}${current.search}${current.hash}`
    return
  }

  if (current.pathname === '/cart' && !current.hash) {
    lastSafeAccountReturnPath = current.pathname
    return
  }

  if (/^\/nfts\/[^/]+$/.test(current.pathname) && !current.hash) {
    lastSafeAccountReturnPath = current.pathname
  }
}

export function navigateBackToAccountContext(navigate: NavigateFn) {
  const destination = lastSafeAccountReturnPath
  if (!destination) {
    void navigate({ to: '/', search: { page: 1, sort: 'recent' }, replace: true })
    return
  }

  const url = new URL(destination, window.location.origin)
  if (url.pathname === '/cart') {
    void navigate({ to: '/cart', replace: true })
    return
  }

  const detailMatch = url.pathname.match(/^\/nfts\/([^/]+)$/)
  if (detailMatch) {
    let nftId: string
    try { nftId = decodeURIComponent(detailMatch[1]!) } catch {
      void navigate({ to: '/', search: { page: 1, sort: 'recent' } })
      return
    }
    void navigate({ to: '/nfts/$nftId', params: { nftId }, replace: true })
    return
  }

  void navigate({
    to: '/',
    search: validateCatalogSearch(Object.fromEntries(url.searchParams.entries())),
    hash: safeHomeAnchors.has(url.hash) ? url.hash : undefined,
    replace: true,
  })
}

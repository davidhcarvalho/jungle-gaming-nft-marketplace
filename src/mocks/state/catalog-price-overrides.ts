import { nftFixtures } from '@/features/catalog/fixtures'
import type { NFT } from '@/types/domain'

const storageKey = 'kurio:catalog-realtime-overrides'

interface CatalogOverride {
  priceEth?: string
  editionAvailability?: Record<string, number>
  version: number
}

type CatalogOverrides = Record<string, CatalogOverride>

export function setCatalogPriceOverride(nftId: string, priceEth: string) {
  if (!nftFixtures.some((nft) => nft.id === nftId) || !isEth(priceEth)) return false
  const overrides = readOverrides()
  const current = getCatalogNFT(nftId)
  overrides[nftId] = { ...overrides[nftId], priceEth, version: Math.max(current?.version ?? 0, overrides[nftId]?.version ?? 0) + 1 }
  return writeOverrides(overrides)
}

export function updateMockNftPrice(nftId: string, priceEth: string) {
  if (!nftFixtures.some((nft) => nft.id === nftId) || !isEth(priceEth)) return undefined
  const overrides = readOverrides()
  const current = getCatalogNFT(nftId)
  const override: CatalogOverride = {
    ...overrides[nftId],
    priceEth,
    version: Math.max(current?.version ?? 0, overrides[nftId]?.version ?? 0) + 1,
  }
  overrides[nftId] = override
  if (!writeOverrides(overrides)) return undefined
  return getCatalogNFT(nftId)
}

export function updateMockNftAvailability(nftId: string, editionId: string, available: number) {
  const current = getCatalogNFT(nftId)
  const edition = current?.editions.find((candidate) => candidate.id === editionId)
  if (!current || !edition || !Number.isSafeInteger(available) || available < 0 || available > edition.supply) return undefined
  const overrides = readOverrides()
  overrides[nftId] = {
    ...overrides[nftId],
    editionAvailability: { ...overrides[nftId]?.editionAvailability, [editionId]: available },
    version: Math.max(current.version, overrides[nftId]?.version ?? 0) + 1,
  }
  if (!writeOverrides(overrides)) return undefined
  return getCatalogNFT(nftId)
}

export function resetCatalogPriceOverrides() {
  try {
    localStorage.removeItem(storageKey)
    // Remove the pre-realtime key left by L02/L05 test controls.
    localStorage.removeItem('kurio:catalog-price-overrides')
  } catch {
    // Mock state is reset when storage is unavailable.
  }
}

export function getCatalogNFT(nftId: string): NFT | undefined {
  return getCatalogNFTs().find((nft) => nft.id === nftId)
}

export function getCatalogNFTs() {
  const overrides = readOverrides()
  return nftFixtures.map((nft) => applyOverride(nft, overrides[nft.id]))
}

function applyOverride(nft: NFT, override: CatalogOverride | undefined): NFT {
  if (!override) return nft
  return {
    ...nft,
    priceEth: override.priceEth ?? nft.priceEth,
    version: override.version,
    editions: nft.editions.map((edition) => ({
      ...edition,
      priceEth: override.priceEth ?? edition.priceEth,
      available: override.editionAvailability?.[edition.id] ?? edition.available,
    })),
  }
}

function isEth(value: string) {
  return /^\d+(\.\d{1,18})?$/.test(value)
}

function writeOverrides(overrides: CatalogOverrides) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(overrides))
    return true
  } catch {
    return false
  }
}

function readOverrides(): CatalogOverrides {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    if (typeof parsed !== 'object' || parsed === null) return {}
    const result: CatalogOverrides = {}
    for (const [nftId, value] of Object.entries(parsed) as Array<[string, unknown]>) {
      if (typeof value === 'string' && isEth(value)) {
        result[nftId] = { priceEth: value, version: 2 }
        continue
      }
      if (typeof value !== 'object' || value === null) continue
      const candidate = value as Partial<CatalogOverride>
      const priceEth = typeof candidate.priceEth === 'string' && isEth(candidate.priceEth) ? candidate.priceEth : undefined
      const editionAvailability = typeof candidate.editionAvailability === 'object' && candidate.editionAvailability !== null
        ? Object.fromEntries(Object.entries(candidate.editionAvailability).filter(([, available]) => Number.isSafeInteger(available) && (available as number) >= 0))
        : undefined
      const version = Number.isSafeInteger(candidate.version) && (candidate.version ?? 0) > 0 ? candidate.version! : 1
      result[nftId] = { priceEth, editionAvailability, version }
    }
    return result
  } catch {
    return {}
  }
}

import { nftFixtures } from '@/features/catalog/fixtures'

const storageKey = 'kurio:catalog-price-overrides'

export function setCatalogPriceOverride(nftId: string, priceEth: string) {
  if (!nftFixtures.some((nft) => nft.id === nftId) || !/^\d+(\.\d{1,18})?$/.test(priceEth)) return false
  const overrides = readOverrides()
  overrides[nftId] = priceEth
  try {
    localStorage.setItem(storageKey, JSON.stringify(overrides))
  } catch {
    return false
  }
  return true
}

export function resetCatalogPriceOverrides() {
  try {
    localStorage.removeItem(storageKey)
  } catch {
    // Mock state is reset when storage is available in browser tests.
  }
}

export function getCatalogNFTs() {
  const overrides = readOverrides()
  return nftFixtures.map((nft) => {
    const priceEth = overrides[nft.id]
    if (!priceEth) return nft
    return {
      ...nft,
      priceEth,
      editions: nft.editions.map((edition) => ({ ...edition, priceEth })),
    }
  })
}

function readOverrides(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '{}')
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === 'string'))
    }
  } catch {
    // Start from deterministic fixtures if local mock storage is unavailable.
  }
  return {}
}

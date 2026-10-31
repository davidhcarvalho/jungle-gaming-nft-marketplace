export const catalogSorts = ['recent', 'newest', 'popular', 'price-asc', 'price-desc'] as const

export type CatalogSort = (typeof catalogSorts)[number]

export interface CatalogSearch {
  q?: string
  collection?: string
  category?: string
  network?: string
  priceMin?: string
  priceMax?: string
  sort: CatalogSort
  page: number
}

export const catalogCategories = [
  { id: 'digital-art', label: 'Arte digital' },
  { id: 'photography', label: 'Fotografia' },
  { id: 'music', label: 'Música' },
  { id: '3d-art', label: 'Arte 3D' },
  { id: 'collectibles', label: 'Colecionáveis' },
  { id: 'generative', label: 'Generativa' },
  { id: 'games', label: 'Jogos' },
  { id: 'subscriptions', label: 'Assinaturas' },
  { id: 'utility', label: 'Utilidade' },
] as const

export const catalogCollections = [
  { id: 'kurio-apes', label: 'Kurio Apes' },
  { id: 'dream-state', label: 'Dream State' },
  { id: 'golden-beats', label: 'Golden Beats' },
] as const

export const catalogNetworks = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'solana', label: 'Solana' },
] as const

const decimalPattern = /^\d{1,6}(?:\.\d{1,18})?$/

export function validateCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const pageValue = Number(search.page)
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const sort = catalogSorts.find((option) => option === search.sort) ?? 'recent'

  return {
    q: readText(search.q),
    collection: readText(search.collection),
    category: readText(search.category),
    network: readText(search.network),
    priceMin: readPrice(search.priceMin),
    priceMax: readPrice(search.priceMax),
    sort,
    page,
  }
}

function readText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim().slice(0, 100)
  return text || undefined
}

function readPrice(value: unknown): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const price = String(value)
  return decimalPattern.test(price) ? price : undefined
}


import { delay, http, HttpResponse } from 'msw'

import { getCatalogNFTs } from '@/mocks/state/catalog-price-overrides'
import { catalogPageSize } from '@/features/catalog/api'
import type { CatalogSort } from '@/features/catalog/model'
import { getMockScenario } from '@/mocks/scenarios/state'
import type { NFT } from '@/types/domain'

export const catalogHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const url = new URL(request.url)
    const scenario = getMockScenario()

    if (scenario === 'catalog-error') {
      return HttpResponse.json(
        { code: 'server', message: 'Não foi possível carregar o catálogo.' },
        { status: 503 },
      )
    }

    if (scenario === 'slow') await delay(800)
    if (scenario === 'variable-latency') {
      const search = url.searchParams.get('q')?.toLocaleLowerCase('pt-BR')
      await delay(search === 'slow' ? 1_200 : search === 'fast' ? 50 : 180)
    }

    const search = url.searchParams.get('q')?.trim().toLocaleLowerCase('pt-BR') ?? ''
    const collection = url.searchParams.get('collection')
    const category = url.searchParams.get('category')
    const network = url.searchParams.get('network')
    const min = url.searchParams.get('priceMin')
    const max = url.searchParams.get('priceMax')
    const sort = readSort(url.searchParams.get('sort'))
    const page = readPositiveInteger(url.searchParams.get('page'), 1)
    const pageSize = Math.min(readPositiveInteger(url.searchParams.get('pageSize'), catalogPageSize), 30)

    const catalog = getCatalogNFTs()
    let items = scenario === 'empty' ? [] : catalog.filter((nft) => {
      const haystack = [nft.name, nft.collectionName, nft.category, ...nft.attributes]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
      return (!search || haystack.includes(search))
        && (!collection || nft.collectionId === collection)
        && (!category || nft.category === category)
        && (!network || nft.network === network)
        && (!min || compareEth(nft.priceEth, min) >= 0)
        && (!max || compareEth(nft.priceEth, max) <= 0)
        && (sort !== 'newest' || nft.isNew)
    })

    items = sortItems(items, sort)
    const totalItems = items.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const start = (page - 1) * pageSize

    return HttpResponse.json({
      items: items.slice(start, start + pageSize),
      featured: catalog.find((nft) => nft.isFeatured) ?? catalog[0],
      page,
      pageSize,
      totalItems,
      totalPages,
      facets: {
        categories: countBy(catalog, (nft) => nft.category),
        collections: countBy(catalog, (nft) => nft.collectionId),
        networks: countBy(catalog, (nft) => nft.network),
      },
    })
  }),
  http.get('/api/nfts/:nftId', async ({ params }) => {
    const scenario = getMockScenario()
    if (scenario === 'detail-error' || scenario === 'catalog-error') {
      return HttpResponse.json(
        { code: 'server', message: 'Não foi possível carregar esta obra agora.' },
        { status: 503 },
      )
    }
    if (scenario === 'slow') await delay(800)
    const nft = getCatalogNFTs().find((item) => item.id === params.nftId)
    if (!nft) {
      return HttpResponse.json(
        { code: 'not_found', message: 'Este NFT não está disponível no catálogo.' },
        { status: 404 },
      )
    }
    return HttpResponse.json(nft)
  }),
]

function readPositiveInteger(value: string | null, fallback: number) {
  if (value === null || !/^\d+$/.test(value)) return fallback
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}

function readSort(value: string | null): CatalogSort {
  if (value === 'newest' || value === 'popular' || value === 'price-asc' || value === 'price-desc') return value
  return 'recent'
}

function sortItems(items: NFT[], sort: CatalogSort) {
  return [...items].sort((left, right) => {
    if (sort === 'popular') return right.popularity - left.popularity || left.id.localeCompare(right.id)
    if (sort === 'price-asc') return compareEth(left.priceEth, right.priceEth) || left.id.localeCompare(right.id)
    if (sort === 'price-desc') return compareEth(right.priceEth, left.priceEth) || left.id.localeCompare(right.id)
    return right.listedAt.localeCompare(left.listedAt) || left.id.localeCompare(right.id)
  })
}

function compareEth(left: string, right: string) {
  return decimalUnits(left) < decimalUnits(right) ? -1 : decimalUnits(left) > decimalUnits(right) ? 1 : 0
}

function decimalUnits(value: string) {
  const [whole = '0', fractional = ''] = value.split('.')
  return BigInt(whole) * 10n ** 18n + BigInt(fractional.padEnd(18, '0').slice(0, 18) || '0')
}

function countBy(items: NFT[], getKey: (item: NFT) => string) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = getKey(item)
    counts[key] = (counts[key] ?? 0) + 1
    return counts
  }, {})
}

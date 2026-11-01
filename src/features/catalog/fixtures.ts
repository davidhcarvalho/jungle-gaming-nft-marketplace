import type { NFT } from '@/types/domain'

const edition = (
  id: string,
  label: string,
  supply: number,
  available: number,
  priceEth: string,
): NFT['editions'][number] => ({
  id,
  label,
  supply,
  available,
  maxPerOrder: 3,
  priceEth,
})

function makeNFT(
  input: Omit<NFT, 'editions' | 'description' | 'attributes' | 'rating' | 'reviewCount' | 'version'> & {
    editionLabels?: [string, number, number, string][]
    description?: string
    attributes?: string[]
    rating?: number
    reviewCount?: number
    version?: number
  },
): NFT {
  const { editionLabels, ...rest } = input
  const editions = (editionLabels ?? [['1/50', 50, 8, input.priceEth]]).map(([label, supply, available, price]) =>
    edition(`${input.id}-${label.replace('/', 'of')}`, label, supply, available, price),
  )

  return {
    ...rest,
    editions,
    description: input.description ?? `${input.name} é uma obra digital da coleção ${input.collectionName}, verificada na rede ${input.network}. Cada peça preserva uma identidade única em arte digital colecionável.`,
    attributes: input.attributes ?? ['Arte digital', 'Edição limitada', 'Verificado'],
    rating: input.rating ?? 4.8,
    reviewCount: input.reviewCount ?? 19,
    version: input.version ?? 1,
  }
}

export const nftFixtures: NFT[] = [
  makeNFT({ id: 'emerald-ape-042', tokenId: '0042', name: 'Emerald Ape #042', collectionId: 'kurio-apes', collectionName: 'Kurio Apes', category: 'digital-art', network: 'ethereum', priceEth: '1.19', imageUrl: '/assets/nfts/optimized/emerald-ape.webp', isFeatured: true, isNew: false, popularity: 98, listedAt: '2026-10-30T15:00:00.000Z', description: 'Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.', editionLabels: [['1/1', 1, 0, '4.90'], ['1/10', 10, 4, '1.79'], ['1/50', 50, 12, '1.19']], attributes: ['Óculos', 'Esmeralda', 'Raro'] }),
  makeNFT({ id: 'sage-nomad-009', tokenId: '0009', name: 'Sage Nomad #009', collectionId: 'kurio-apes', collectionName: 'Kurio Apes', category: 'collectibles', network: 'polygon', priceEth: '1.69', imageUrl: '/assets/nfts/optimized/sage-nomad.webp', isFeatured: false, isNew: true, popularity: 85, listedAt: '2026-10-30T14:00:00.000Z' }),
  makeNFT({ id: 'neon-vessel-552', tokenId: '0552', name: 'Neon Vessel #552', collectionId: 'kurio-apes', collectionName: 'Kurio Apes', category: '3d-art', network: 'ethereum', priceEth: '1.99', compareAtPriceEth: '2.29', imageUrl: '/assets/nfts/optimized/neon-vessel.webp', isFeatured: false, isNew: false, popularity: 91, listedAt: '2026-10-30T13:00:00.000Z', attributes: ['Acessório', 'Noite', 'Raro'] }),
  makeNFT({ id: 'cosmic-bloom-118', tokenId: '0118', name: 'Cosmic Bloom #118', collectionId: 'dream-state', collectionName: 'Dream State', category: 'generative', network: 'solana', priceEth: '1.29', imageUrl: '/assets/nfts/optimized/sage-nomad.webp', isFeatured: false, isNew: false, popularity: 76, listedAt: '2026-10-30T12:00:00.000Z', attributes: ['Cosmos', 'Lavanda', 'Único'] }),
  makeNFT({ id: 'violet-nomad-314', tokenId: '0314', name: 'Violet Nomad #314', collectionId: 'dream-state', collectionName: 'Dream State', category: 'photography', network: 'polygon', priceEth: '1.39', imageUrl: '/assets/nfts/optimized/sage-nomad.webp', isFeatured: false, isNew: true, popularity: 88, listedAt: '2026-10-30T11:00:00.000Z' }),
  makeNFT({ id: 'ivory-baron-088', tokenId: '0088', name: 'Ivory Baron #088', collectionId: 'kurio-apes', collectionName: 'Kurio Apes', category: 'collectibles', network: 'ethereum', priceEth: '1.79', imageUrl: '/assets/nfts/optimized/neon-vessel.webp', isFeatured: false, isNew: false, popularity: 80, listedAt: '2026-10-30T10:30:00.000Z', editionLabels: [['1/50', 50, 12, '1.79']], attributes: ['Marfim', 'Elegante', 'Colecionável'] }),
  makeNFT({ id: 'golden-beat-207', tokenId: '0207', name: 'Golden Beat #207', collectionId: 'golden-beats', collectionName: 'Golden Beats', category: 'music', network: 'solana', priceEth: '0.99', imageUrl: '/assets/nfts/optimized/golden-beat.webp', isFeatured: false, isNew: true, popularity: 94, listedAt: '2026-10-30T10:00:00.000Z', attributes: ['Música', 'Fones', 'Dourado'] }),
  makeNFT({ id: 'fast-current-033', tokenId: '0033', name: 'Fast Current #033', collectionId: 'dream-state', collectionName: 'Dream State', category: 'generative', network: 'solana', priceEth: '0.85', imageUrl: '/assets/nfts/optimized/golden-beat.webp', isFeatured: false, isNew: true, popularity: 63, listedAt: '2026-10-30T09:00:00.000Z' }),
  makeNFT({ id: 'golden-signal-160', tokenId: '0160', name: 'Golden Signal #160', collectionId: 'golden-beats', collectionName: 'Golden Beats', category: 'music', network: 'ethereum', priceEth: '0.39', imageUrl: '/assets/nfts/optimized/golden-beat.webp', isFeatured: false, isNew: false, popularity: 66, listedAt: '2026-10-18T10:00:00.000Z', attributes: ['Sinal', 'Dourado', 'Único'] }),
  makeNFT({ id: 'sunset-ape-311', tokenId: '0311', name: 'Sunset Ape #311', collectionId: 'kurio-apes', collectionName: 'Kurio Apes', category: 'digital-art', network: 'polygon', priceEth: '0.89', imageUrl: '/assets/nfts/optimized/emerald-ape.webp', isFeatured: false, isNew: false, popularity: 70, listedAt: '2026-10-15T10:00:00.000Z' }),
  makeNFT({ id: 'quiet-orbit-075', tokenId: '0075', name: 'Quiet Orbit #075', collectionId: 'dream-state', collectionName: 'Dream State', category: 'generative', network: 'ethereum', priceEth: '2.49', imageUrl: '/assets/nfts/optimized/neon-vessel.webp', isFeatured: false, isNew: true, popularity: 89, listedAt: '2026-10-26T10:00:00.000Z' }),
  makeNFT({ id: 'ivory-echo-014', tokenId: '0014', name: 'Ivory Echo #014', collectionId: 'kurio-apes', collectionName: 'Kurio Apes', category: 'photography', network: 'polygon', priceEth: '0.59', imageUrl: '/assets/nfts/optimized/neon-vessel.webp', isFeatured: false, isNew: false, popularity: 62, listedAt: '2026-10-12T10:00:00.000Z' }),
  makeNFT({ id: 'sage-afterglow-061', tokenId: '0061', name: 'Sage Afterglow #061', collectionId: 'dream-state', collectionName: 'Dream State', category: 'digital-art', network: 'solana', priceEth: '3.10', imageUrl: '/assets/nfts/optimized/sage-nomad.webp', isFeatured: false, isNew: false, popularity: 72, listedAt: '2026-10-08T10:00:00.000Z' }),
  makeNFT({ id: 'neon-vessel-709', tokenId: '0709', name: 'Neon Vessel #709', collectionId: 'kurio-apes', collectionName: 'Kurio Apes', category: 'games', network: 'ethereum', priceEth: '1.09', imageUrl: '/assets/nfts/optimized/neon-vessel.webp', isFeatured: false, isNew: true, popularity: 92, listedAt: '2026-10-30T08:00:00.000Z' }),
  makeNFT({ id: 'golden-hour-033', tokenId: '0033', name: 'Golden Hour #033', collectionId: 'golden-beats', collectionName: 'Golden Beats', category: 'music', network: 'polygon', priceEth: '0.75', imageUrl: '/assets/nfts/optimized/golden-beat.webp', isFeatured: false, isNew: false, popularity: 57, listedAt: '2026-10-05T10:00:00.000Z' }),
  makeNFT({ id: 'rare-keeper-999', tokenId: '0999', name: 'Rare Keeper #999', collectionId: 'kurio-apes', collectionName: 'Kurio Apes', category: 'collectibles', network: 'ethereum', priceEth: '12.30', imageUrl: '/assets/nfts/optimized/emerald-ape.webp', isFeatured: false, isNew: false, popularity: 99, listedAt: '2026-09-18T10:00:00.000Z', editionLabels: [['1/1', 1, 0, '12.30']], attributes: ['Único', 'Edição fechada', 'Raridade máxima'] }),
  makeNFT({ id: 'generative-mist-002', tokenId: '0002', name: 'Generative Mist #002', collectionId: 'dream-state', collectionName: 'Dream State', category: 'generative', network: 'solana', priceEth: '0.49', imageUrl: '/assets/nfts/optimized/sage-nomad.webp', isFeatured: false, isNew: true, popularity: 61, listedAt: '2026-10-29T18:00:00.000Z' }),
  makeNFT({ id: 'golden-dawn-081', tokenId: '0081', name: 'Golden Dawn #081', collectionId: 'golden-beats', collectionName: 'Golden Beats', category: '3d-art', network: 'ethereum', priceEth: '2.05', imageUrl: '/assets/nfts/optimized/golden-beat.webp', isFeatured: false, isNew: false, popularity: 75, listedAt: '2026-10-03T10:00:00.000Z' }),
  makeNFT({ id: 'silent-voyager-012', tokenId: '0012', name: 'Silent Voyager #012', collectionId: 'dream-state', collectionName: 'Dream State', category: 'subscriptions', network: 'polygon', priceEth: '0.25', imageUrl: '/assets/nfts/optimized/neon-vessel.webp', isFeatured: false, isNew: false, popularity: 54, listedAt: '2026-09-28T10:00:00.000Z' }),
]

export const featuredNFT = nftFixtures.find((nft) => nft.isFeatured) ?? nftFixtures[0]!


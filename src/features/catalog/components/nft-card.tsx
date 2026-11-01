import { Link } from '@tanstack/react-router'

import type { NFT } from '@/types/domain'
import { NFTArtwork } from '@/features/catalog/components/nft-artwork'

export function NFTCard({ nft, staggered = false, eager = false }: { nft: NFT; staggered?: boolean; eager?: boolean }) {
  const available = nft.editions.some((edition) => edition.available > 0)

  return (
    <article className={`nft-card${staggered ? ' is-staggered' : ''}`} data-testid="nft-card">
      <Link className="nft-card-art-link" to="/nfts/$nftId" params={{ nftId: nft.id }} aria-label={`Ver ${nft.name}`}>
        <span className="nft-card-art-frame">
          <NFTArtwork src={nft.imageUrl} alt={`Arte digital ${nft.name}`} eager={eager} responsive sizes="(max-width: 767px) 160px, 250px" />
          {!available && <span className="nft-sold-out-badge">Edição esgotada</span>}
        </span>
      </Link>
      <div className="nft-card-copy">
        <Link className="nft-card-name" to="/nfts/$nftId" params={{ nftId: nft.id }}>{nft.name}</Link>
        <span className="nft-card-price"><span>{nft.priceEth} ETH</span>{nft.compareAtPriceEth && <del>{nft.compareAtPriceEth} ETH</del>}</span>
      </div>
    </article>
  )
}

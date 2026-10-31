interface NFTArtworkProps {
  src: string
  alt: string
  className?: string
  eager?: boolean
}

export function NFTArtwork({ src, alt, className = '', eager = false }: NFTArtworkProps) {
  return (
    <img
      className={`nft-artwork ${className}`}
      src={src}
      alt={alt}
      width="500"
      height="500"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

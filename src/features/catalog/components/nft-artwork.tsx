interface NFTArtworkProps {
  src: string
  alt: string
  className?: string
  eager?: boolean
  responsive?: boolean
  sizes?: string
}

export function NFTArtwork({ src, alt, className = '', eager = false, responsive = false, sizes }: NFTArtworkProps) {
  return (
    <img
      className={`nft-artwork ${className}`}
      src={src}
      srcSet={responsive && src.endsWith('.webp') ? `${src.replace(/\.webp$/, '-334.webp')} 334w, ${src} 500w` : undefined}
      sizes={responsive ? sizes : undefined}
      alt={alt}
      width="500"
      height="500"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  )
}

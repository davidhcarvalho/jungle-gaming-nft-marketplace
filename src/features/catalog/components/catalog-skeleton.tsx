export function CatalogSkeleton() {
  return (
    <div className="nft-grid" aria-label="Carregando catálogo" aria-live="polite" data-testid="catalog-skeleton">
      {Array.from({ length: 12 }, (_, index) => (
        <div className="nft-skeleton" key={index} aria-hidden="true" data-testid="catalog-skeleton-card">
          <div className="nft-skeleton-art shimmer" />
          <div className="nft-skeleton-line shimmer" />
          <div className="nft-skeleton-price shimmer" />
        </div>
      ))}
    </div>
  )
}

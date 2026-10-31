import { useEffect, useState } from 'react'
import type { CatalogSearch } from '@/features/catalog/model'
import { catalogCategories, catalogCollections, catalogNetworks } from '@/features/catalog/model'

interface CatalogFiltersProps {
  search: CatalogSearch
  onChange: (patch: Partial<CatalogSearch>) => void
  open: boolean
  facets?: { categories: Record<string, number>; collections: Record<string, number>; networks: Record<string, number> }
}

export function CatalogFilters({ search, onChange, open, facets }: CatalogFiltersProps) {
  const [min, setMin] = useState(search.priceMin ?? '0.02')
  const [max, setMax] = useState(search.priceMax ?? '12.30')

  useEffect(() => {
    setMin(search.priceMin ?? '0.02')
    setMax(search.priceMax ?? '12.30')
  }, [search.priceMin, search.priceMax])

  function applyPrice() {
    onChange({
      priceMin: min === '0.02' ? undefined : min,
      priceMax: max === '12.30' ? undefined : max,
    })
  }

  return (
    <aside className={`catalog-sidebar${open ? ' is-open' : ''}`} aria-label="Filtros do catálogo">
      <fieldset className="filter-group">
        <legend>Coleções</legend>
        <div className="filter-options">
          {catalogCategories.map((category) => (
            <button
              className={`filter-option${search.category === category.id ? ' is-active' : ''}`}
              type="button"
              key={category.id}
              aria-pressed={search.category === category.id}
              onClick={() => onChange({ category: search.category === category.id ? undefined : category.id })}
            >
              <span>{category.label}</span>{facets && <span className="filter-count">({facets.categories[category.id] ?? 0})</span>}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="filter-select-label" htmlFor="collection-filter">Coleção</label>
      <select id="collection-filter" className="filter-select" value={search.collection ?? ''} onChange={(event) => onChange({ collection: event.target.value || undefined })}>
        <option value="">Todas as coleções</option>
        {catalogCollections.map((collection) => <option value={collection.id} key={collection.id}>{collection.label}{facets ? ` (${facets.collections[collection.id] ?? 0})` : ''}</option>)}
      </select>

      <fieldset className="filter-group price-filter">
        <legend>Faixa de preço</legend>
        <div className="price-range-controls">
          <label htmlFor="price-min">Mínimo em ETH</label>
          <input id="price-min" type="range" min="0.02" max="12.30" step="0.01" value={min} onChange={(event) => setMin(event.target.value)} />
          <label htmlFor="price-max">Máximo em ETH</label>
          <input id="price-max" type="range" min="0.02" max="12.30" step="0.01" value={max} onChange={(event) => setMax(event.target.value)} />
        </div>
        <output className="price-range-output" htmlFor="price-min price-max">Preço: {min} – {max} ETH</output>
        <button className="small-accent-button" type="button" onClick={applyPrice}>Aplicar</button>
      </fieldset>

      <fieldset className="filter-group">
        <legend>Rede</legend>
        <div className="filter-options">
          {catalogNetworks.map((network) => (
            <button
              className={`filter-option${search.network === network.id ? ' is-active' : ''}`}
              type="button"
              key={network.id}
              aria-pressed={search.network === network.id}
              onClick={() => onChange({ network: search.network === network.id ? undefined : network.id })}
            >
              <span>{network.label}</span>{facets && <span className="filter-count">({facets.networks[network.id] ?? 0})</span>}
            </button>
          ))}
        </div>
      </fieldset>

      {search.category || search.collection || search.network || search.priceMin || search.priceMax ? (
        <button className="clear-filters-button" type="button" onClick={() => onChange({ category: undefined, collection: undefined, network: undefined, priceMin: undefined, priceMax: undefined })}>
          Limpar filtros
        </button>
      ) : null}
    </aside>
  )
}

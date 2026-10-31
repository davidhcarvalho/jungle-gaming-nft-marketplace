import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { CatalogFilters } from '@/features/catalog/components/catalog-filters'
import { CatalogSkeleton } from '@/features/catalog/components/catalog-skeleton'
import { NFTArtwork } from '@/features/catalog/components/nft-artwork'
import { NFTCard } from '@/features/catalog/components/nft-card'
import { useNFTCatalog } from '@/features/catalog/queries'
import type { CatalogSearch } from '@/features/catalog/model'

const tabs = [
  { label: 'Todos os NFTs', value: 'recent' },
  { label: 'Novos lançamentos', value: 'newest' },
  { label: 'Em alta', value: 'popular' },
] as const

const articles = [
  { title: 'Como funciona a propriedade de NFTs', date: '12 de setembro', read: 'Leitura de 6 min', image: '/assets/nfts/neon-vessel.png', category: 'GUIA' },
  { title: '10 artistas digitais para acompanhar', date: '13 de setembro', read: 'Leitura de 2 min', image: '/assets/nfts/emerald-ape.png', category: 'CRIADORES' },
  { title: 'Raridade, atributos e procedência', date: '15 de setembro', read: 'Leitura de 3 min', image: '/assets/nfts/sage-nomad.png', category: 'MERCADO' },
  { title: 'Como proteger sua carteira', date: '15 de setembro', read: 'Leitura de 2 min', image: '/assets/nfts/golden-beat.png', category: 'SEGURANÇA' },
]

export function HomePage() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })
  const catalog = useNFTCatalog(search)
  const [queryDraft, setQueryDraft] = useState(search.q ?? '')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => setQueryDraft(search.q ?? ''), [search.q])

  function updateSearch(patch: Partial<CatalogSearch>, resetPage = true) {
    void navigate({
      search: (previous) => ({
        ...previous,
        ...patch,
        page: patch.page ?? (resetPage ? 1 : search.page),
      }),
      replace: false,
      resetScroll: false,
    })
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateSearch({ q: queryDraft.trim() || undefined })
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const data = catalog.data
  const items = data?.items ?? []
  const featured = data?.featured
  const hasFilters = Boolean(search.q || search.collection || search.category || search.network || search.priceMin || search.priceMax)

  return (
    <div className="home-page">
      <div className="mobile-catalog-search">
        <form className="catalog-search-form" onSubmit={submitSearch} role="search">
          <label className="sr-only" htmlFor="catalog-search-mobile">Buscar NFTs e coleções</label>
          <span className="search-glyph" aria-hidden="true" />
          <input id="catalog-search-mobile" value={queryDraft} onChange={(event) => setQueryDraft(event.target.value)} placeholder="Explorar coleções" />
          <button className="filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="catalog-filter-panel" onClick={() => setFiltersOpen((open) => !open)}>
            <span className="filter-glyph" aria-hidden="true" /><span className="sr-only">{filtersOpen ? 'Fechar filtros' : 'Abrir filtros'}</span>
          </button>
        </form>
      </div>

      <section className="home-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-eyebrow">Bem-vindo à Kurio</p>
          <h1 id="hero-title"><span className="hero-title-desktop">Seja dono do futuro da arte digital</span><span className="hero-title-mobile">Seja dono da cultura digital</span></h1>
          <p className="hero-description"><span className="hero-description-desktop">Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</span><span className="hero-description-mobile">Descubra NFTs selecionados de criadores do mundo todo.</span></p>
          <a className="hero-link" href="#catalog">EXPLORAR <span aria-hidden="true">→</span></a>
          <div className="hero-dots" aria-label="Destaque 1 de 3"><span /><span /><span /></div>
        </div>
        {featured ? (
          <Link className="hero-art-link" to="/nfts/$nftId" params={{ nftId: featured.id }} aria-label={`Ver destaque ${featured.name}`}>
            <NFTArtwork src={featured.imageUrl} alt={`Arte em destaque: ${featured.name}`} eager />
            <span className="hero-floating-art"><NFTArtwork src="/assets/nfts/sage-nomad.png" alt="" /></span>
          </Link>
        ) : <div className="hero-art-placeholder shimmer" aria-hidden="true" />}
      </section>

      <section className="catalog-section" id="catalog" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="sr-only">Catálogo de NFTs</h2>
        <div className="catalog-layout">
          <div className="catalog-sidebar-column">
            <CatalogFilters search={search} onChange={(patch) => updateSearch(patch)} open={filtersOpen} facets={data?.facets} />
            <article className="sidebar-featured">
              <p>NFT EM DESTAQUE</p>
              <strong>OFERTA LIMITADA</strong>
              <Link to="/nfts/$nftId" params={{ nftId: 'sage-nomad-009' }} aria-label="Ver destaque Sage Nomad #009">
                <NFTArtwork src="/assets/nfts/sage-nomad.png" alt="Sage Nomad em destaque" />
              </Link>
            </article>
          </div>
          <div className="catalog-main-column">
            <div className="catalog-toolbar">
              <div className="catalog-tabs" role="group" aria-label="Tipo de listagem">
                {tabs.map((tab) => (
                  <button key={tab.value} type="button" className={`catalog-tab${search.sort === tab.value ? ' is-active' : ''}`} aria-pressed={search.sort === tab.value} onClick={() => updateSearch({ sort: tab.value })}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <form className="catalog-search-desktop" onSubmit={submitSearch} role="search">
                <label className="sr-only" htmlFor="catalog-search-desktop">Buscar NFTs e coleções</label>
                <span className="search-glyph" aria-hidden="true" />
                <input id="catalog-search-desktop" value={queryDraft} onChange={(event) => setQueryDraft(event.target.value)} placeholder="Buscar no mercado" />
                <button type="submit" className="sr-only">Buscar</button>
              </form>
              <label className="catalog-sort-label" htmlFor="catalog-sort">Ordenar por:
                <select id="catalog-sort" value={search.sort === 'price-asc' || search.sort === 'price-desc' ? search.sort : 'recent'} onChange={(event) => updateSearch({ sort: event.target.value as CatalogSearch['sort'] })}>
                  <option value="recent">Listados recentemente</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>
              </label>
            </div>
            <div className="catalog-results" aria-busy={catalog.isFetching}>
            {catalog.isFetching && data && <p className="catalog-update-status" role="status">Atualizando resultados…</p>}
            {catalog.isPending && <CatalogSkeleton />}
            {catalog.isError && !data && (
              <div className="catalog-state catalog-error" role="alert">
                <p className="state-kicker">ERRO DE CONEXÃO</p>
                <h3>Não foi possível carregar o mercado.</h3>
                <p>Confira a conexão e tente novamente.</p>
                <Button onClick={() => void catalog.refetch()} disabled={catalog.isFetching}>Tentar novamente</Button>
              </div>
            )}
            {catalog.isError && data && (
              <div className="catalog-background-error" role="status">
                <span>Não foi possível atualizar a lista. Os resultados anteriores continuam visíveis.</span>
                <button type="button" onClick={() => void catalog.refetch()}>Tentar novamente</button>
              </div>
            )}
            {data && items.length === 0 && (
              <div className="catalog-state catalog-empty" role="status">
                <p className="state-kicker">NENHUMA OBRA ENCONTRADA</p>
                <h3>{hasFilters ? 'Não encontramos resultados para esta busca.' : 'O catálogo está vazio neste cenário.'}</h3>
                <p>Experimente combinar outros filtros ou explorar todas as coleções.</p>
                {hasFilters && <Button variant="outline" onClick={() => { setQueryDraft(''); updateSearch({ q: undefined, collection: undefined, category: undefined, network: undefined, priceMin: undefined, priceMax: undefined }) }}>Limpar filtros</Button>}
              </div>
            )}
            {data && items.length > 0 && (
              <>
                <div className="nft-grid">
                  {items.map((nft, index) => <NFTCard key={nft.id} nft={nft} staggered={index % 2 === 1} />)}
                </div>
                {data.totalPages > 1 && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={(page) => updateSearch({ page }, false)} />}
              </>
            )}
            </div>
          </div>
        </div>
      </section>

      <section className="feature-banners" aria-label="Destaques do mercado">
        <article className="feature-banner">
          <NFTArtwork src="/assets/nfts/emerald-ape.png" alt="Arte da coleção Kurio Apes" />
          <div><p className="banner-kicker">Lançamentos gênesis de edição limitada</p><p>Colecione edições escassas diretamente dos criadores antes da revelação pública.</p><Link to="/nfts/$nftId" params={{ nftId: 'emerald-ape-042' }}>Explorar <span aria-hidden="true">→</span></Link></div>
        </article>
        <article className="feature-banner feature-banner-reverse">
          <NFTArtwork src="/assets/nfts/neon-vessel.png" alt="Arte digital selecionada da coleção Kurio Apes" />
          <div><p className="banner-kicker">Arte digital selecionada e muito mais</p><p>Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.</p><a href="#catalog">Explorar <span aria-hidden="true">→</span></a></div>
        </article>
      </section>

      <section className="journal-section" id="journal" aria-labelledby="journal-heading">
        <header className="journal-heading"><h2 id="journal-heading">Diário da Cunhagem</h2><p>Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p></header>
        <div className="journal-grid">
          {articles.map((article) => (
            <article className="journal-card" key={article.title}>
              <NFTArtwork src={article.image} alt="" />
              <div><p className="journal-meta">{article.date} <span>|</span> {article.read}</p><h3>{article.title}</h3><span className="journal-read-more">Ler mais →</span></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <nav className="catalog-pagination" aria-label="Paginação do catálogo">
      <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
        <button type="button" key={pageNumber} aria-label={`Página ${pageNumber}`} aria-current={pageNumber === page ? 'page' : undefined} className={pageNumber === page ? 'is-current' : ''} onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>
      ))}
      <button type="button" aria-label="Próxima página" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>›</button>
    </nav>
  )
}

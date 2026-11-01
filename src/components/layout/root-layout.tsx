import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { Suspense, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { clearSessionToken } from '@/lib/session-token'
import { clearPrivateQueries, useLogout, useSession } from '@/features/auth/queries'
import { queryKeys } from '@/lib/query-keys'
import { useCart } from '@/features/cart/queries'
import { stopRealtimeSession } from '@/realtime/session-lifecycle'
import { rememberSafeAccountReturnPath } from '@/lib/account-navigation'

export function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const href = useRouterState({ select: (state) => state.location.href })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const cart = useCart()
  const cartCount = cart.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0
  const isHome = pathname === '/'
  const isDetail = pathname.startsWith('/nfts/')
  const isCart = pathname === '/cart'
  const isCheckout = pathname === '/checkout'
  const isOrder = pathname.startsWith('/orders/')
  const isAccount = pathname === '/profile' || pathname === '/wallets'
  const isAuthRoute = pathname === '/login' || pathname === '/signup'
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => rememberSafeAccountReturnPath(href), [href])

  useEffect(() => {
    function handleSessionExpired() {
      const location = window.location
      const returnTo = `${location.pathname}${location.search}${location.hash}`
      clearSessionToken()
      stopRealtimeSession()
      void clearPrivateQueries(queryClient)
      queryClient.setQueryData(queryKeys.auth.session, null)
      if (!isAuthRoute) void navigate({ to: '/login', search: { returnTo }, replace: true })
    }
    window.addEventListener('kurio:session-expired', handleSessionExpired)
    return () => window.removeEventListener('kurio:session-expired', handleSessionExpired)
  }, [isAuthRoute, navigate, queryClient])

  return (
    <div className={`app-frame${isHome ? ' is-home-route' : ''}${isDetail ? ' is-detail-route' : ''}${isCart ? ' is-cart-route' : ''}${isCheckout ? ' is-checkout-route' : ''}${isOrder ? ' is-order-route' : ''}${isAuthRoute ? ' is-auth-route' : ''}${isAccount ? ' is-account-route' : ''}`}>
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand" to="/" search={{ page: 1, sort: 'recent' }} aria-label="KURIO, início">KURIO</Link>
          <nav className="desktop-nav" aria-label="Navegação principal">
            <Link to="/" search={{ page: 1, sort: 'recent' }} activeProps={{ className: `nav-link${isHome ? ' is-active' : ''}` }} className={`nav-link${isHome ? ' is-active' : ''}`}>Início</Link>
            <Link to="/" hash="catalog" search={{ page: 1, sort: 'recent' }} activeProps={{ className: `nav-link${isDetail ? ' is-active' : ''}` }} className={`nav-link${isDetail ? ' is-active' : ''}`}>Mercado</Link>
            <a className="nav-link" href="/#features">Criadores</a>
            <a className="nav-link" href="/#journal">Aprenda</a>
          </nav>
          <div className="header-actions">
            <a className="header-icon-link" href="/#catalog" aria-label="Ir para busca e catálogo"><SearchIcon /></a>
            <Link className="header-icon-link cart-header-link" to="/cart" aria-label={`Abrir carrinho, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}><CartIcon /><span className="cart-count" aria-hidden="true">{cartCount}</span></Link>
            <AuthHeaderActions />
          </div>
        </div>
      </header>
      <main id="main-content" className="main-content">
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter onUnavailable={setAnnouncement} />
      {isHome && <MobileNavigation onUnavailable={setAnnouncement} />}
      {announcement && <div className="site-announcement" role="status" aria-label="Aviso de navegação" aria-live="polite"><span>{announcement}</span><button type="button" aria-label="Fechar aviso" onClick={() => setAnnouncement('')}>×</button></div>}
    </div>
  )
}

function RouteLoading() {
  return <div className="route-loading" role="status" aria-live="polite"><span className="sr-only">Carregando página…</span></div>
}

function AuthHeaderActions() {
  const session = useSession()
  const logout = useLogout()
  const navigate = useNavigate()

  if (!session.data) return <Link className="header-action" to="/login" search={{ returnTo: '/' }}><span aria-hidden="true">↪</span> Entrar</Link>

  return (
    <div className="signed-in-actions">
      <Link className="header-action" to="/profile" aria-label={`Perfil de ${session.data.user.displayName}`}>{session.data.user.displayName}</Link>
      <button className="header-logout" type="button" disabled={logout.isPending} onClick={() => logout.mutate(undefined, { onSettled: () => void navigate({ to: '/', search: { page: 1, sort: 'recent' } }) })}>
        {logout.isPending ? 'Saindo…' : 'Sair'}
      </button>
    </div>
  )
}

function SiteFooter({ onUnavailable }: { onUnavailable: (message: string) => void }) {
  const unavailable = (label: string) => onUnavailable(`${label}: este recurso não faz parte desta demonstração.`)
  const socialUnavailable = () => onUnavailable('Link externo não fornecido nesta demonstração.')
  return (
    <footer className="site-footer">
      <div className="footer-promises">
        <article><span className="footer-promise-mark">W</span><h2>Segurança da carteira</h2><p>Proteja sua carteira e colecione arte digital verificada com confiança.</p></article>
        <article><span className="footer-promise-mark">C</span><h2>Criadores em destaque</h2><p>Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.</p></article>
        <article><span className="footer-promise-mark">D</span><h2>Alertas de lançamentos</h2><p>Receba calendários de cunhagem, novidades de listas de acesso e análises de mercado.</p></article>
        <article className="footer-newsletter"><h2>Antecipe-se ao próximo lançamento</h2><div className="newsletter-control"><label className="sr-only" htmlFor="newsletter-email">Seu e-mail</label><input id="newsletter-email" type="email" placeholder="digite seu e-mail..." disabled /><button type="button" onClick={() => unavailable('Inscrições')}>Enviar</button></div><p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p></article>
      </div>
      <div className="footer-brand-strip"><strong>KURIO</strong><span>Feito para colecionadores,<br /> criadores e cultura</span><span>contato@email.com</span><span>+55 11 4002 8922</span></div>
      <div className="footer-links-grid">
        <div><h2>Meu perfil</h2><Link className="footer-action-link" to="/profile">Meu perfil</Link><button className="footer-action-link" type="button" onClick={() => unavailable('Minha coleção')}>Minha coleção</button><button className="footer-action-link" type="button" onClick={() => unavailable('Atividade')}>Atividade</button><button className="footer-action-link" type="button" onClick={() => unavailable('Estúdio do criador')}>Estúdio do criador</button><button className="footer-action-link" type="button" onClick={() => unavailable('Lista de interesse')}>Lista de interesse</button></div>
        <div><h2>Central de ajuda</h2><button className="footer-action-link" type="button" onClick={() => unavailable('Central de ajuda')}>Central de ajuda</button><button className="footer-action-link" type="button" onClick={() => unavailable('Como comprar NFTs')}>Como comprar NFTs</button><button className="footer-action-link" type="button" onClick={() => unavailable('Carteira e segurança')}>Carteira e segurança</button><button className="footer-action-link" type="button" onClick={() => unavailable('Política do mercado')}>Política do mercado</button><button className="footer-action-link" type="button" onClick={() => unavailable('Denunciar item')}>Denunciar item</button></div>
        <div><h2>Coleções</h2><Link to="/" search={{ page: 1, sort: 'recent', category: 'digital-art' }}>Arte digital</Link><Link to="/" search={{ page: 1, sort: 'recent', category: 'photography' }}>Fotografia</Link><Link to="/" search={{ page: 1, sort: 'recent', category: 'music' }}>Música</Link><Link to="/" search={{ page: 1, sort: 'recent', category: '3d-art' }}>Arte 3D</Link><Link to="/" search={{ page: 1, sort: 'recent', category: 'utility' }}>Utilidade</Link></div>
        <div><h2>Redes sociais</h2><div className="footer-socials" aria-label="Redes sociais">{[['Facebook', 'f'], ['Instagram', '◎'], ['Twitter', '♥'], ['LinkedIn', 'in'], ['YouTube', '▶']].map(([name, icon]) => <button key={name} type="button" aria-label={name} onClick={socialUnavailable}>{icon}</button>)}</div><h3>Carteiras compatíveis</h3><span className="wallet-labels">METAMASK · WALLETCONNECT · COINBASE</span></div>
      </div>
      <p className="footer-copyright">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  )
}

function MobileNavigation({ onUnavailable }: { onUnavailable: (message: string) => void }) {
  return (
    <nav className="mobile-nav" aria-label="Navegação mobile">
      <Link className="mobile-nav-link is-active" to="/" search={{ page: 1, sort: 'recent' }} aria-label="Início"><HomeIcon /></Link>
      <button className="mobile-nav-link" type="button" aria-label="Favoritos" onClick={() => onUnavailable('Esta demonstração não possui uma lista de favoritos; favorite obras nas páginas dos NFTs.')}><HeartIcon /></button>
      <a className="mobile-nav-featured" href="#catalog" aria-label="Explorar catálogo"><CollectionIcon /></a>
      <Link className="mobile-nav-link" to="/cart" aria-label="Carrinho"><CartIcon /></Link>
      <Link className="mobile-nav-link" to="/profile" aria-label="Perfil"><UserIcon /></Link>
    </nav>
  )
}

function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg> }
function CartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.9-1.5L22 8H5" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></svg> }
function HomeIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /></svg> }
function HeartIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.8c0 5-8.8 11.1-8.8 11.1S3.2 13.8 3.2 8.8a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" /></svg> }
function UserIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0z" /></svg> }
function CollectionIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 17h14" /><rect x="3" y="4" width="18" height="6" rx="2" /><rect x="3" y="14" width="18" height="6" rx="2" /></svg> }

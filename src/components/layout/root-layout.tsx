import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { clearSessionToken } from '@/lib/session-token'
import { clearPrivateQueries, useLogout, useSession } from '@/features/auth/queries'
import { queryKeys } from '@/lib/query-keys'
import { useCart } from '@/features/cart/queries'
import { stopRealtimeSession } from '@/realtime/session-lifecycle'

export function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
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
            <Link to="/" hash="#catalog" search={{ page: 1, sort: 'recent' }} activeProps={{ className: `nav-link${isDetail ? ' is-active' : ''}` }} className={`nav-link${isDetail ? ' is-active' : ''}`}>Mercado</Link>
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
      <main id="main-content" className="main-content"><Outlet /></main>
      <SiteFooter />
      {isHome && <MobileNavigation />}
    </div>
  )
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

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-promises">
        <article><span className="footer-promise-mark">W</span><h2>Segurança da carteira</h2><p>Proteja sua carteira e colecione arte digital verificada com confiança.</p></article>
        <article><span className="footer-promise-mark">C</span><h2>Criadores em destaque</h2><p>Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.</p></article>
        <article><span className="footer-promise-mark">D</span><h2>Alertas de lançamentos</h2><p>Receba calendários de cunhagem, novidades de listas de acesso e análises de mercado.</p></article>
        <article className="footer-newsletter"><h2>Antecipe-se ao próximo lançamento</h2><div className="newsletter-control"><label className="sr-only" htmlFor="newsletter-email">Seu e-mail</label><input id="newsletter-email" type="email" placeholder="digite seu e-mail..." disabled /><button type="button" disabled>Enviar</button></div><p>Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p></article>
      </div>
      <div className="footer-brand-strip"><strong>KURIO</strong><span>Feito para colecionadores,<br /> criadores e cultura</span><span>contato@email.com</span><span>+55 11 4002 8922</span></div>
      <div className="footer-links-grid">
        <div><h2>Meu perfil</h2><span>Meu perfil</span><span>Minha coleção</span><span>Atividade</span><span>Estúdio do criador</span><span>Lista de interesse</span></div>
        <div><h2>Central de ajuda</h2><span>Central de ajuda</span><span>Como comprar NFTs</span><span>Carteira e segurança</span><span>Política do mercado</span><span>Denunciar item</span></div>
        <div><h2>Coleções</h2><a href="/#catalog">Arte digital</a><a href="/#catalog">Fotografia</a><a href="/#catalog">Música</a><a href="/#catalog">Arte 3D</a><a href="/#catalog">Utilidade</a></div>
        <div><h2>Redes sociais</h2><div className="footer-socials" aria-label="Redes sociais"><span>f</span><span>◎</span><span>♥</span><span>in</span><span>▶</span></div><h3>Carteiras compatíveis</h3><span className="wallet-labels">METAMASK · WALLETCONNECT · COINBASE</span></div>
      </div>
      <p className="footer-copyright">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  )
}

function MobileNavigation() {
  return (
    <nav className="mobile-nav" aria-label="Navegação mobile">
      <Link className="mobile-nav-link is-active" to="/" search={{ page: 1, sort: 'recent' }} aria-label="Início"><HomeIcon /></Link>
      <button className="mobile-nav-link" type="button" disabled aria-label="Favoritos disponíveis em uma etapa posterior"><HeartIcon /></button>
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

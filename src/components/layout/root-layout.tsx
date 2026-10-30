import { Link, Outlet } from '@tanstack/react-router'

const navItems = [
  { to: '/', label: 'Início' },
  { to: '/cart', label: 'Carrinho' },
  { to: '/profile', label: 'Perfil' },
] as const

export function RootLayout() {
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="KURIO, início">KURIO</Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} activeProps={{ className: 'nav-link is-active' }} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="header-action" to="/login">Entrar</Link>
      </header>
      <main id="main-content" className="main-content"><Outlet /></main>
      <footer className="site-footer"><span>KURIO</span><span>Marketplace de arte digital</span></footer>
      <nav className="mobile-nav" aria-label="Navegação mobile">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} activeProps={{ className: 'mobile-nav-link is-active' }} className="mobile-nav-link">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

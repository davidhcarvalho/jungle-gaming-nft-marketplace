import { Link, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useLogout } from '@/features/auth/queries'
import { navigateBackToAccountContext } from '@/lib/account-navigation'

export function AccountLayout({ active, children }: { active: 'profile' | 'wallets'; children: ReactNode }) {
  const logout = useLogout(); const navigate = useNavigate()
  return <section className="account-page" aria-labelledby="account-title">
    <button className="account-mobile-back" type="button" aria-label="Voltar à página anterior" onClick={() => navigateBackToAccountContext(navigate)}><span aria-hidden="true">‹</span> Voltar</button>
    <Link className="account-mobile-brand" to="/" search={{ page: 1, sort: 'recent' }} aria-label="KURIO, início">KURIO</Link>
    <div className="account-layout">
      <aside className="account-sidebar">
        <h1 id="account-title">Meu perfil</h1>
        <nav className="account-nav" aria-label="Navegação da conta">
          <Link to="/profile" className={active === 'profile' ? 'is-active' : ''}>Dados do perfil</Link>
          <Link to="/wallets" className={active === 'wallets' ? 'is-active' : ''}>Carteiras</Link>
          <Link to="/cart">Meu carrinho</Link>
          <button type="button" className="account-logout" disabled={logout.isPending} onClick={() => logout.mutate(undefined, { onSettled: () => void navigate({ to: '/', search: { page: 1, sort: 'recent' } }) })}>{logout.isPending ? 'Saindo…' : 'Sair da conta'}</button>
        </nav>
      </aside>
      <div className="account-content">{children}</div>
    </div>
  </section>
}

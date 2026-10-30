import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <section className="route-placeholder" aria-labelledby="not-found-title">
      <p className="eyebrow">Erro 404</p>
      <h1 id="not-found-title">Página não encontrada</h1>
      <p>O endereço não corresponde a uma rota disponível.</p>
      <Link className="text-link" to="/">Voltar ao início</Link>
    </section>
  )
}

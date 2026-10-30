export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="route-placeholder" aria-labelledby="placeholder-title">
      <p className="eyebrow">Base técnica pronta</p>
      <h1 id="placeholder-title">{title}</h1>
      <p>Esta tela é um espaço técnico temporário. A experiência funcional será construída no lote correspondente.</p>
    </section>
  )
}

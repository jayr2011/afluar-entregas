export default function Pedido() {
  const heroId = 'pedido-hero'

  return (
    <main aria-labelledby={heroId} className="min-h-screen">
      <section
        aria-labelledby={heroId}
        className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h1 id={heroId} className="mb-4 text-4xl font-bold">
          Página de Pedido
        </h1>
        <p className="text-lg text-gray-600">Aqui você pode acompanhar seu pedido.</p>
      </section>
    </main>
  )
}

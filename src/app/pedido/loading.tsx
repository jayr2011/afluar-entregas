import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando página de pedido"
      className="flex min-h-screen flex-col items-center justify-center"
    >
      <span className="sr-only">Carregando página de pedido</span>
      <Skeleton className="mb-4 h-12 w-64" aria-hidden="true" />
      <Skeleton className="h-6 w-80" aria-hidden="true" />
    </div>
  )
}

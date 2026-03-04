import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando carrinho"
      className="min-h-screen bg-linear-to-b from-background to-primary/5"
    >
      <span className="sr-only">Carregando carrinho</span>
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-5 w-36 mb-4" aria-hidden="true" />

        <Skeleton className="h-8 w-64 mb-6" aria-hidden="true" />

        <Skeleton className="h-10 w-full mb-8" aria-hidden="true" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-20 w-20 rounded-lg" aria-hidden="true" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" aria-hidden="true" />
                    <Skeleton className="h-4 w-24" aria-hidden="true" />
                    <div className="flex items-center gap-2 pt-2">
                      <Skeleton className="h-8 w-8 rounded" aria-hidden="true" />
                      <Skeleton className="h-5 w-8" aria-hidden="true" />
                      <Skeleton className="h-8 w-8 rounded" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" aria-hidden="true" />
                <Skeleton className="h-4 w-full" aria-hidden="true" />
                <Skeleton className="h-4 w-3/4" aria-hidden="true" />
                <Skeleton className="h-px w-full" aria-hidden="true" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" aria-hidden="true" />
                  <Skeleton className="h-5 w-20" aria-hidden="true" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" aria-hidden="true" />
                <Skeleton className="h-10 w-full rounded-lg" aria-hidden="true" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

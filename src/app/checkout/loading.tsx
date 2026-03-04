import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main
      className="min-h-screen bg-linear-to-b from-background to-primary/5"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando checkout"
    >
      <p className="sr-only" aria-live="polite">
        Carregando checkout...
      </p>
      <div className="container mx-auto max-w-xl px-4 py-8">
        <Skeleton className="h-10 w-48 mb-4" aria-hidden="true" />

        <Skeleton className="h-8 w-full max-w-xs mb-6" aria-hidden="true" />

        <h1 className="text-3xl font-bold mb-6">Endereço de entrega</h1>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Skeleton className="h-4 w-4" aria-hidden="true" />
              Resumo do pedido
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-32" aria-hidden="true" />
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados para entrega</CardTitle>
            <CardDescription>
              Preencha seus dados e o endereço onde deseja receber o pedido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" aria-hidden="true" />
              <Skeleton className="h-10 w-full" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" aria-hidden="true" />
              <Skeleton className="h-10 w-full" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" aria-hidden="true" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" aria-hidden="true" />
                <Skeleton className="h-10 w-24" aria-hidden="true" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" aria-hidden="true" />
              <Skeleton className="h-10 w-full" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" aria-hidden="true" />
                <Skeleton className="h-10 w-full" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" aria-hidden="true" />
                <Skeleton className="h-10 w-full" aria-hidden="true" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" aria-hidden="true" />
              <Skeleton className="h-10 w-full" aria-hidden="true" />
            </div>

            <Skeleton className="h-12 w-full" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

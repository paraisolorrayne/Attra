import { Container } from '@/components/ui/container'
import { Skeleton, VehicleGridSkeleton } from '@/components/ui/skeleton'

export default function EstoqueLoading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <Container className="py-4">
        <Skeleton className="h-4 w-48" />
      </Container>

      {/* Hero skeleton */}
      <section className="py-12 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
        </Container>
      </section>

      {/* Filters skeleton */}
      <section className="py-6 bg-background-soft border-b border-border">
        <Container>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </Container>
      </section>

      {/* Grid skeleton */}
      <section className="py-12 bg-background">
        <Container>
          <VehicleGridSkeleton count={12} />
        </Container>
      </section>
    </>
  )
}


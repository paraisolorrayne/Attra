import { Container } from '@/components/ui/container'
import { AttraLoader, Skeleton, FiltersSkeleton, VehicleHorizontalCardSkeleton } from '@/components/ui/skeleton'

export default function VeiculosLoading() {
  return (
    <>
      {/* Branded loader hero */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <AttraLoader variant="section" text="Carregando veículos" className="min-h-[200px]" />
        </Container>
      </section>

      {/* Content with sidebar — skeleton structure */}
      <section className="pb-20">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 shrink-0">
              <FiltersSkeleton />
            </aside>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-36 rounded-lg" />
              </div>
              <div className="space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <VehicleHorizontalCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}


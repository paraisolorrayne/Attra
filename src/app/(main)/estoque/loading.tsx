import { Container } from '@/components/ui/container'
import { Skeleton, FiltersSkeleton, VehicleHorizontalCardSkeleton } from '@/components/ui/skeleton'

export default function EstoqueLoading() {
  return (
    <>
      {/* Header with breadcrumb only */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </Container>
      </section>

      {/* Content with sidebar */}
      <section className="pb-20">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters */}
            <aside className="lg:w-72 shrink-0">
              <FiltersSkeleton />
            </aside>

            {/* Main content */}
            <div className="flex-1">
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-36 rounded-lg" />
              </div>

              {/* Vehicle cards */}
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


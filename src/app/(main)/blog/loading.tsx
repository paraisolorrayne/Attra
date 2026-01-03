import { Container } from '@/components/ui/container'
import { Skeleton, BlogGridSkeleton } from '@/components/ui/skeleton'

export default function BlogLoading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <Container className="py-4">
        <Skeleton className="h-4 w-32" />
      </Container>

      {/* Hero skeleton */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-12 w-48 mx-auto mb-6" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
        </Container>
      </section>

      {/* Categories skeleton */}
      <section className="py-8 bg-background-soft border-b border-border">
        <Container>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full" />
            ))}
          </div>
        </Container>
      </section>

      {/* Grid skeleton */}
      <section className="py-16 bg-background">
        <Container>
          <BlogGridSkeleton count={9} />
        </Container>
      </section>
    </>
  )
}


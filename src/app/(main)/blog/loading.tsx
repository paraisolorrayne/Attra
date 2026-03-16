import { Container } from '@/components/ui/container'
import { AttraLoader, Skeleton, BlogGridSkeleton } from '@/components/ui/skeleton'

export default function BlogLoading() {
  return (
    <main className="bg-background min-h-screen">
      {/* Branded loader hero */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <AttraLoader variant="section" text="Carregando notícias" className="min-h-[200px]" />
        </Container>
      </section>

      {/* Blog Content skeleton */}
      <section className="py-12">
        <Container>
          <div className="flex gap-4 mb-8 border-b border-border">
            <Skeleton className="h-10 w-28 rounded-t-lg" />
            <Skeleton className="h-10 w-28 rounded-t-lg" />
          </div>
          <BlogGridSkeleton count={6} />
        </Container>
      </section>
    </main>
  )
}


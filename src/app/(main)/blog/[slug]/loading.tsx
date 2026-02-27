import { Container } from '@/components/ui/container'
import { Skeleton, BlogPostSkeleton } from '@/components/ui/skeleton'

export default function BlogPostLoading() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero area */}
      <section className="pt-28 pb-8 bg-gradient-to-b from-background-soft to-background">
        <Container>
          {/* Breadcrumb */}
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="py-12">
        <Container>
          <BlogPostSkeleton />
        </Container>
      </section>
    </main>
  )
}


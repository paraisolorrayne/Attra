import { Container } from '@/components/ui/container'
import { AttraLoader, BlogPostSkeleton } from '@/components/ui/skeleton'

export default function BlogPostLoading() {
  return (
    <main className="bg-background min-h-screen">
      {/* Branded loader hero */}
      <section className="pt-28 pb-8 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <AttraLoader variant="section" text="Carregando artigo" className="min-h-[160px]" />
        </Container>
      </section>

      {/* Content skeleton */}
      <section className="py-12">
        <Container>
          <BlogPostSkeleton />
        </Container>
      </section>
    </main>
  )
}


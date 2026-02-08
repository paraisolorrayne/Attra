import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Calendar, ExternalLink, Newspaper } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface NewsArticle {
  id: string
  slug: string | null
  title: string
  description: string | null
  image_url: string | null
  source_name: string
  original_url: string
  published_at: string
  category_id: number
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Try to get article by slug first
  let { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .single()

  // Fallback: if not found by slug, try by ID (for backward compatibility)
  if (error || !data) {
    const { data: articleById, error: idError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', slug)
      .single()

    if (idError || !articleById) return null
    data = articleById
  }

  return data
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Notícia não encontrada | Attra Veículos',
      description: 'A notícia solicitada não foi encontrada.',
    }
  }

  return {
    title: `${article.title} | Notícias Attra`,
    description: article.description || 'Leia a notícia completa no portal Attra Veículos.',
    openGraph: {
      title: article.title,
      description: article.description || undefined,
      images: article.image_url ? [{ url: article.image_url }] : [],
    },
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getCategoryName(categoryId: number): string {
  const categories: Record<number, string> = {
    1: 'Destaques',
    2: 'Formula 1',
    3: 'Carros Premium',
  }
  return categories[categoryId] || 'Notícias'
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const breadcrumbItems = [
    { label: 'Notícias', href: '/news' },
    { label: getCategoryName(article.category_id) },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative w-full h-[40vh] lg:h-[50vh] bg-background-soft">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Newspaper className="w-24 h-24 text-foreground-secondary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <Container className="relative -mt-32 z-10 pb-16">
        <Breadcrumb items={breadcrumbItems} />

        <article className="mt-6 max-w-3xl mx-auto">
          {/* Category & Date */}
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {getCategoryName(article.category_id)}
            </span>
            <span className="flex items-center gap-1.5 text-foreground-secondary text-sm">
              <Calendar className="w-4 h-4" />
              {formatDate(article.published_at)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          {/* Source Attribution */}
          <div className="flex items-center gap-2 p-4 bg-background-soft border border-border rounded-lg mb-8">
            <Newspaper className="w-5 h-5 text-primary" />
            <span className="text-foreground-secondary">Fonte:</span>
            <span className="font-medium text-foreground">{article.source_name}</span>
          </div>

          {/* Description */}
          {article.description && (
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-foreground-secondary text-lg leading-relaxed">
                {article.description}
              </p>
            </div>
          )}

          {/* CTA to Original */}
          <div className="bg-background-card border border-border rounded-xl p-6 text-center mb-8">
            <p className="text-foreground-secondary mb-4">
              Para ler a matéria completa, acesse a fonte original:
            </p>
            <Button asChild size="lg">
              <Link href={article.original_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5 mr-2" />
                Ler no {article.source_name}
              </Link>
            </Button>
          </div>
        </article>
      </Container>
    </main>
  )
}


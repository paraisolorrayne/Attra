'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowRight, Tag } from 'lucide-react'
import type { DualBlogPost } from '@/types'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { ListenToContent } from './listen-to-content'

interface EducativoTemplateProps {
  post: DualBlogPost
}

export function EducativoTemplate({ post }: EducativoTemplateProps) {
  const breadcrumbItems = [
    { label: 'Blog', href: '/blog' },
    { label: post.educativo?.category || 'Artigo', href: `/blog?categoria=${post.educativo?.category?.toLowerCase()}` },
    { label: post.title }
  ]

  return (
    <article className="bg-background">
      {/* Header Section */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <Breadcrumb items={breadcrumbItems} afterHero />
          
          {/* Category Badge */}
          {post.educativo?.category && (
            <div className="mt-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Tag className="w-3.5 h-3.5" />
                {post.educativo.category}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground max-w-4xl leading-tight">
            {post.title}
          </h1>
          
          {/* Excerpt */}
          <p className="mt-4 text-lg text-foreground-secondary max-w-3xl">
            {post.excerpt}
          </p>
          
          {/* Meta Info */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-foreground-secondary">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <span className="font-medium text-foreground">{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.published_date}>{formatDate(post.published_date)}</time>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{post.reading_time} de leitura</span>
            </div>
          </div>

          {/* Listen to Content Button */}
          <div className="mt-6">
            <ListenToContent
              content={post.content}
              title={post.title}
            />
          </div>
        </Container>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <section className="relative w-full aspect-[21/9] max-h-[500px] overflow-hidden">
          <Image
            src={post.featured_image}
            alt={post.featured_image_alt || post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </section>
      )}

      {/* Content */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Article Content */}
            <div 
              className="prose prose-lg prose-neutral dark:prose-invert 
                         prose-headings:font-semibold prose-headings:text-foreground
                         prose-p:text-foreground-secondary prose-p:leading-relaxed
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-li:text-foreground-secondary
                         prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Insights Box */}
            <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
              <h3 className="text-xl font-semibold text-foreground mb-3">
                💡 Insight da Attra
              </h3>
              <p className="text-foreground-secondary">
                Nossa expertise em curadoria de veículos premium garante que cada cliente tenha acesso 
                às melhores oportunidades do mercado. Com mais de 14 anos de experiência, sabemos 
                identificar valor onde outros não veem.
              </p>
            </div>

            {/* CTA Section */}
            <div className="mt-12 p-8 bg-background-card rounded-2xl border border-border text-center">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Procurando seu próximo veículo?
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-lg mx-auto">
                Explore nosso estoque curado de veículos premium ou fale com um consultor especializado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/estoque">
                    Ver Estoque
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contato">Falar com Consultor</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </article>
  )
}


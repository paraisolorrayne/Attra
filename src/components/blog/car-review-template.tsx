'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowRight, Gauge, Zap, RotateCcw, Fuel, CheckCircle, XCircle } from 'lucide-react'
import type { DualBlogPost, CarReviewSpecs } from '@/types'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface CarReviewTemplateProps {
  post: DualBlogPost
}

// Vehicle Specs Component
function VehicleSpecs({ specs }: { specs?: CarReviewSpecs }) {
  if (!specs) return null
  
  const specItems = [
    { icon: Fuel, label: 'Motor', value: specs.engine },
    { icon: Zap, label: 'Potência', value: specs.power },
    { icon: RotateCcw, label: 'Torque', value: specs.torque },
    { icon: Gauge, label: '0-100 km/h', value: specs.acceleration },
    { icon: Gauge, label: 'Vel. Máxima', value: specs.top_speed },
    { icon: RotateCcw, label: 'Transmissão', value: specs.transmission },
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {specItems.map((item, index) => (
        <div 
          key={index}
          className="p-4 bg-background-card rounded-xl border border-border hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-2 text-foreground-secondary mb-1">
            <item.icon className="w-4 h-4 text-primary" />
            <span className="text-sm">{item.label}</span>
          </div>
          <p className="text-foreground font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function CarReviewTemplate({ post }: CarReviewTemplateProps) {
  const { car_review } = post
  
  const breadcrumbItems = [
    { label: 'Blog', href: '/blog' },
    { label: 'Reviews', href: '/blog?tipo=car_review' },
    { label: `${car_review?.brand} ${car_review?.model}` }
  ]

  return (
    <article className="bg-background">
      {/* Hero Header with Vehicle Brand Badge */}
      <section className="pt-28 pb-12 bg-gradient-to-b from-background-soft to-background">
        <Container>
          <Breadcrumb items={breadcrumbItems} afterHero />
          
          {/* Brand & Model Badge */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-4 py-1.5 bg-primary text-white rounded-full text-sm font-semibold">
              {car_review?.brand}
            </span>
            <span className="text-foreground-secondary">
              {car_review?.model} • {car_review?.year}
            </span>
          </div>
          
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
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
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
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
        </section>
      )}

      {/* Specs Section */}
      <section className="py-10 border-b border-border">
        <Container>
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Especificações Técnicas
          </h2>
          <VehicleSpecs specs={car_review?.specs} />
        </Container>
      </section>

      {/* Gallery Section */}
      {car_review?.gallery_images && car_review.gallery_images.length > 0 && (
        <section className="py-10 bg-background-soft">
          <Container>
            <h2 className="text-xl font-semibold text-foreground mb-6">Galeria</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {car_review.gallery_images.map((img, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                  <Image
                    src={img}
                    alt={`${car_review.brand} ${car_review.model} - Imagem ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Content */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg prose-neutral dark:prose-invert
                         prose-headings:font-semibold prose-headings:text-foreground
                         prose-p:text-foreground-secondary prose-p:leading-relaxed
                         prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Availability Section */}
            {car_review?.availability && (
              <div className="mt-12 p-6 rounded-2xl border-2 border-primary/30 bg-primary/5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {car_review.availability.in_stock ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-semibold text-green-600 dark:text-green-400">Disponível em Estoque</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-foreground-secondary" />
                          <span className="font-semibold text-foreground-secondary">Indisponível no momento</span>
                        </>
                      )}
                    </div>
                    {car_review.availability.price && (
                      <p className="text-2xl font-bold text-foreground">
                        {car_review.availability.price}
                      </p>
                    )}
                  </div>
                  {car_review.availability.in_stock && car_review.availability.stock_url && (
                    <Button asChild size="lg">
                      <Link href={car_review.availability.stock_url}>
                        Ver no Estoque
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Expert Opinion */}
            <div className="mt-12 p-6 bg-background-card rounded-2xl border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                🏁 Avaliação Attra
              </h3>
              <p className="text-foreground-secondary">
                Como especialistas em veículos premium, avaliamos cada modelo considerando performance,
                exclusividade, custo de manutenção e potencial de valorização. O {car_review?.brand} {car_review?.model}
                é uma escolha excepcional para quem busca o melhor da engenharia automotiva.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <p className="text-foreground-secondary mb-4">
                Interessado neste ou em outro modelo similar?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/estoque">
                    Explorar Estoque Completo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/solicitar-veiculo">Solicitar Veículo Específico</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </article>
  )
}


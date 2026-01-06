'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Calendar, Clock, User, ArrowRight, Gauge, Zap, RotateCcw, Fuel,
  CheckCircle, ChevronLeft, ChevronRight, MessageCircle, Car,
  Shield, TrendingUp, Star, Settings, Disc, X, Expand
} from 'lucide-react'
import type {
  DualBlogPost, CarReviewSpecs, CarReviewFAQ, CarReviewHighlight,
  CarReviewEvaluation, CarReviewGalleryImage
} from '@/types'
import { Container } from '@/components/ui/container'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { formatDate, cn } from '@/lib/utils'

interface CarReviewTemplateProps {
  post: DualBlogPost
}

// ============================================================================
// VEHICLE SPECS TABLE - Componente semântico para especificações técnicas
// ============================================================================
function VehicleSpecsTable({ specs, brand, model }: {
  specs?: CarReviewSpecs
  brand?: string
  model?: string
}) {
  if (!specs) return null

  // Filtrar apenas specs que têm valor (evita "Consultar")
  const specItems = [
    { label: 'Motor', value: specs.engine, icon: Fuel },
    { label: 'Potência', value: specs.power, icon: Zap },
    { label: 'Torque', value: specs.torque, icon: RotateCcw },
    { label: '0-100 km/h', value: specs.acceleration, icon: Gauge },
    { label: 'Velocidade Máxima', value: specs.top_speed, icon: Gauge },
    { label: 'Transmissão', value: specs.transmission, icon: Settings },
    { label: 'Peso', value: specs.weight, icon: Disc },
    { label: 'Tração', value: specs.drivetrain, icon: Car },
    { label: 'Pneus', value: specs.tires, icon: Disc },
    { label: 'Freios', value: specs.brakes, icon: Disc },
  ].filter(item => item.value && item.value !== 'Consultar')

  if (specItems.length === 0) return null

  return (
    <section
      className="py-10 lg:py-14 border-b border-border"
      itemScope
      itemType="https://schema.org/Vehicle"
    >
      <Container>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8">
          Especificações Técnicas do {brand} {model}
        </h2>

        {/* Grid responsivo com dados estruturados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {specItems.map((item, index) => (
            <div
              key={index}
              className="group p-5 bg-background-card rounded-xl border border-border
                         hover:border-primary/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground-secondary uppercase tracking-wide">
                  {item.label}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground" itemProp={
                item.label === 'Motor' ? 'vehicleEngine' :
                item.label === 'Transmissão' ? 'vehicleTransmission' : undefined
              }>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Nota sobre dados */}
        <p className="mt-6 text-sm text-foreground-secondary/70 text-center">
          Especificações fornecidas pelo fabricante. Valores podem variar conforme versão e configuração.
        </p>
      </Container>
    </section>
  )
}

// ============================================================================
// GALLERY CAROUSEL - Galeria com navegação e legendas
// ============================================================================
function GallerySection({
  images,
  brand,
  model
}: {
  images?: string[] | CarReviewGalleryImage[]
  brand?: string
  model?: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!images || images.length === 0) return null

  // Normalizar imagens para formato com legenda
  const normalizedImages: CarReviewGalleryImage[] = images.map((img, i) =>
    typeof img === 'string'
      ? { url: img, alt: `${brand} ${model} - Imagem ${i + 1}` }
      : img
  )

  const totalImages = normalizedImages.length

  const goToPrev = () => setActiveIndex(i => i === 0 ? totalImages - 1 : i - 1)
  const goToNext = () => setActiveIndex(i => i === totalImages - 1 ? 0 : i + 1)

  // Keyboard navigation - usando evento diretamente no useEffect
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActiveIndex(i => i === 0 ? totalImages - 1 : i - 1)
      if (e.key === 'ArrowRight') setActiveIndex(i => i === totalImages - 1 ? 0 : i + 1)
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, totalImages])

  return (
    <section className="py-10 lg:py-14 bg-background-soft">
      <Container>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8">
          Galeria de Fotos
        </h2>

        {/* Imagem principal com navegação */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 group cursor-pointer"
             onClick={() => setIsFullscreen(true)}>
          <Image
            src={normalizedImages[activeIndex].url}
            alt={normalizedImages[activeIndex].alt}
            fill
            className="object-cover"
            priority={activeIndex === 0}
          />

          {/* Botão de expandir */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(true) }}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Tela cheia"
          >
            <Expand className="w-5 h-5" />
          </button>

          {/* Navegação */}
          {normalizedImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50
                           text-white hover:bg-black/70 transition-colors"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50
                           text-white hover:bg-black/70 transition-colors"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Legenda */}
          {normalizedImages[activeIndex].caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm lg:text-base">
                {normalizedImages[activeIndex].caption}
              </p>
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {normalizedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {normalizedImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-14 lg:w-28 lg:h-20 rounded-lg overflow-hidden transition-all",
                  activeIndex === index
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <Image src={img.url} alt={img.alt} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Fullscreen overlay */}
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation - Previous */}
            {normalizedImages.length > 1 && (
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-colors"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Main image */}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-16">
              <Image
                src={normalizedImages[activeIndex].url}
                alt={normalizedImages[activeIndex].alt}
                fill
                className="object-contain"
                quality={100}
                sizes="100vw"
                priority
              />
            </div>

            {/* Navigation - Next */}
            {normalizedImages.length > 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-10 transition-colors"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {/* Thumbnail strip in fullscreen */}
            {normalizedImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90%] overflow-x-auto py-2 px-4">
                {normalizedImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'relative w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                      index === activeIndex ? 'border-primary' : 'border-white/30 opacity-60 hover:opacity-100'
                    )}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="80px" quality={60} />
                  </button>
                ))}
              </div>
            )}

            {/* Caption in fullscreen */}
            {normalizedImages[activeIndex].caption && (
              <div className="absolute bottom-32 left-1/2 -translate-x-1/2 text-white text-center max-w-2xl px-4">
                <p className="text-sm lg:text-base bg-black/50 px-4 py-2 rounded-lg">
                  {normalizedImages[activeIndex].caption}
                </p>
              </div>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black/50 px-4 py-2 rounded-full">
              {activeIndex + 1} / {normalizedImages.length}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}

// ============================================================================
// FAQ SECTION - Perguntas frequentes para SEO/LLMO
// ============================================================================
function FAQSection({ faqs, brand, model }: {
  faqs?: CarReviewFAQ[]
  brand?: string
  model?: string
}) {
  if (!faqs || faqs.length === 0) return null

  return (
    <section
      className="py-10 lg:py-14 bg-background-soft/50"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <Container size="lg">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-8">
          Perguntas Frequentes sobre o {brand} {model}
        </h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-6 bg-background rounded-2xl border border-border"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <h3
                className="text-lg lg:text-xl font-semibold text-foreground mb-3"
                itemProp="name"
              >
                {faq.question}
              </h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p
                  className="text-foreground-secondary leading-relaxed"
                  itemProp="text"
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

// ============================================================================
// OPTIONALS & HIGHLIGHTS - Opcionais e destaques
// ============================================================================
function OptionalsSection({
  optionals,
  highlights
}: {
  optionals?: string[]
  highlights?: CarReviewHighlight[]
}) {
  if ((!optionals || optionals.length === 0) && (!highlights || highlights.length === 0)) {
    return null
  }

  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Opcionais */}
      {optionals && optionals.length > 0 && (
        <div className="p-6 bg-background-card rounded-2xl border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Opcionais e Equipamentos
          </h3>
          <ul className="space-y-2">
            {optionals.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-foreground-secondary">
                <span className="text-primary mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Destaques */}
      {highlights && highlights.length > 0 && (
        <div className="p-6 bg-background-card rounded-2xl border border-border">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Destaques do Modelo
          </h3>
          <ul className="space-y-2">
            {highlights.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-foreground-secondary">
                <span className="text-primary mt-1">★</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// ATTRA EVALUATION - Avaliação premium Attra
// ============================================================================
function AttraEvaluationSection({
  evaluation,
  brand,
  model
}: {
  evaluation?: CarReviewEvaluation
  brand?: string
  model?: string
}) {
  // Avaliação padrão se não houver dados
  const defaultEvaluation: CarReviewEvaluation = {
    summary: `Como referência em veículos premium em Uberlândia, Minas Gerais, a Attra Veículos avalia o ${brand} ${model} considerando performance, exclusividade, custo de manutenção e potencial de valorização. Este é um exemplar excepcional para colecionadores e entusiastas exigentes.`,
    highlights: [
      'Performance de referência em sua categoria',
      'Exclusividade garantida no mercado brasileiro',
      'Curadoria Attra com procedência verificada',
      'Potencial de valorização como colecionável',
      'Suporte especializado pós-venda'
    ]
  }

  const eval_ = evaluation || defaultEvaluation

  const potentialLabels = {
    alto: { text: 'Alto potencial de valorização', color: 'text-green-600 dark:text-green-400' },
    medio: { text: 'Potencial moderado de valorização', color: 'text-yellow-600 dark:text-yellow-400' },
    estavel: { text: 'Valor estável no mercado', color: 'text-blue-600 dark:text-blue-400' }
  }

  return (
    <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 via-background-card to-primary/10
                    rounded-2xl border-2 border-primary/20 relative overflow-hidden">
      {/* Badge decorativo */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white
                         text-xs font-semibold rounded-full uppercase tracking-wide">
          <Shield className="w-3 h-3" />
          Curadoria Attra
        </span>
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-4">
        🏁 Avaliação Attra Veículos
      </h3>

      <p className="text-foreground-secondary leading-relaxed mb-6">
        {eval_.summary}
      </p>

      {/* Highlights */}
      <ul className="space-y-3 mb-6">
        {eval_.highlights.map((item, index) => (
          <li key={index} className="flex items-center gap-3 text-foreground">
            <div className="p-1 rounded-full bg-primary/20">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Potencial de investimento */}
      {eval_.investment_potential && (
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className={cn("font-semibold", potentialLabels[eval_.investment_potential].color)}>
            {potentialLabels[eval_.investment_potential].text}
          </span>
        </div>
      )}

      {/* Perfil do cliente */}
      {eval_.target_profile && (
        <p className="mt-4 text-sm text-foreground-secondary italic">
          Perfil ideal: {eval_.target_profile}
        </p>
      )}
    </div>
  )
}

// ============================================================================
// CTA SECTION - Chamadas para ação
// ============================================================================
function CTASection({ brand, model, isPrimary = false }: {
  brand?: string
  model?: string
  isPrimary?: boolean
}) {
  const whatsappNumber = '5534991530174'
  const whatsappMessage = encodeURIComponent(
    `Olá! Vi o ${brand} ${model} no blog da Attra e gostaria de mais informações.`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className={cn(
      "text-center",
      isPrimary ? "py-10 lg:py-14 bg-background-soft" : "mt-12"
    )}>
      <Container size={isPrimary ? "lg" : undefined}>
        <p className="text-lg text-foreground-secondary mb-6">
          Interessado no {brand} {model} ou em modelos similares?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="min-h-[52px] text-base">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" />
              Falar com Especialista
            </a>
          </Button>

          <Button asChild variant="outline" size="lg" className="min-h-[52px] text-base">
            <Link href={`/estoque?marca=${brand?.toLowerCase()}`}>
              <Car className="w-5 h-5 mr-2" />
              Ver Estoque {brand}
            </Link>
          </Button>

          <Button asChild variant="ghost" size="lg" className="min-h-[52px] text-base">
            <Link href="/solicitar-veiculo">
              Solicitar Veículo Específico
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  )
}

// ============================================================================
// ARTICLE FOOTER - Rodapé com links relacionados
// ============================================================================
function ArticleFooter({ brand }: { brand?: string }) {
  return (
    <footer className="py-10 lg:py-14 border-t border-border">
      <Container>
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* Links para estoque */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Explore Nosso Estoque
            </h3>
            <div className="flex flex-wrap gap-3">
              {brand && (
                <Link
                  href={`/estoque?marca=${brand.toLowerCase()}`}
                  className="px-4 py-2 bg-background-card rounded-lg border border-border
                             hover:border-primary/40 transition-colors text-sm"
                >
                  Mais {brand}
                </Link>
              )}
              <Link
                href="/estoque"
                className="px-4 py-2 bg-background-card rounded-lg border border-border
                           hover:border-primary/40 transition-colors text-sm"
              >
                Todo o Estoque
              </Link>
              <Link
                href="/estoque?categoria=superesportivos"
                className="px-4 py-2 bg-background-card rounded-lg border border-border
                           hover:border-primary/40 transition-colors text-sm"
              >
                Superesportivos
              </Link>
            </div>
          </div>

          {/* Links para outros reviews */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Mais Reviews Attra
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog?tipo=car_review"
                className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20
                           hover:bg-primary/20 transition-colors text-sm text-primary"
              >
                Ver Todos os Reviews
              </Link>
              <Link
                href="/blog"
                className="px-4 py-2 bg-background-card rounded-lg border border-border
                           hover:border-primary/40 transition-colors text-sm"
              >
                Blog Attra
              </Link>
            </div>
          </div>
        </div>

        {/* Menção Attra para LLMO */}
        <p className="mt-8 text-sm text-foreground-secondary/70 text-center max-w-3xl mx-auto">
          A <strong className="text-foreground">Attra Veículos</strong> é referência em veículos premium
          e superesportivos em Uberlândia, Minas Gerais. Oferecemos curadoria especializada,
          procedência verificada e suporte completo para colecionadores e entusiastas exigentes.
        </p>
      </Container>
    </footer>
  )
}

// ============================================================================
// MAIN TEMPLATE
// ============================================================================
export function CarReviewTemplate({ post }: CarReviewTemplateProps) {
  const { car_review } = post

  const breadcrumbItems = [
    { label: 'Início', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Reviews', href: '/blog?tipo=car_review' },
    { label: `${car_review?.brand} ${car_review?.model}` }
  ]

  // Construir subtítulo com informações do veículo
  const vehicleSubtitle = [
    car_review?.year,
    car_review?.version,
    car_review?.status
  ].filter(Boolean).join(' • ')

  return (
    <article
      className="bg-background"
      itemScope
      itemType="https://schema.org/Review"
    >
      {/* ================================================================== */}
      {/* HERO HEADER - Cabeçalho do artigo com hierarquia visual clara */}
      {/* ================================================================== */}
      <section className="pt-28 pb-12 lg:pb-16 bg-gradient-to-b from-background-soft to-background">
        <Container>
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} afterHero />

          {/* Brand Badge + Subtítulo */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-4 py-1.5 bg-primary text-white rounded-full text-sm font-bold uppercase tracking-wide">
              {car_review?.brand}
            </span>
            {vehicleSubtitle && (
              <span className="text-foreground-secondary font-medium">
                {vehicleSubtitle}
              </span>
            )}
          </div>

          {/* Título H1 - Principal */}
          <h1
            className="mt-6 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground max-w-5xl leading-[1.1] tracking-tight"
            itemProp="name"
          >
            {post.title}
          </h1>

          {/* Excerpt/Lead */}
          <p className="mt-6 text-lg lg:text-xl text-foreground-secondary max-w-3xl leading-relaxed">
            {post.excerpt}
          </p>

          {/* Meta informações */}
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-foreground-secondary">
            {post.author && (
              <div className="flex items-center gap-2" itemProp="author" itemScope itemType="https://schema.org/Person">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground block" itemProp="name">
                    {post.author.name}
                  </span>
                  <span className="text-xs">Attra Veículos</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.published_date} itemProp="datePublished">
                {formatDate(post.published_date)}
              </time>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{post.reading_time} de leitura</span>
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================== */}
      {/* HERO IMAGE - Imagem principal com legenda rica */}
      {/* ================================================================== */}
      {post.featured_image && (
        <section className="relative w-full aspect-[21/9] max-h-[600px] overflow-hidden">
          <Image
            src={post.featured_image}
            alt={post.featured_image_alt || `${car_review?.brand} ${car_review?.model} ${car_review?.year}`}
            fill
            className="object-cover"
            priority
            itemProp="image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

          {/* Legenda da imagem hero */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
            <Container>
              <p className="text-white/90 text-sm lg:text-base font-medium">
                {car_review?.brand} {car_review?.model} {car_review?.year}
                {car_review?.color && ` • ${car_review.color}`}
                {car_review?.status && ` • ${car_review.status}`}
              </p>
            </Container>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* ESPECIFICAÇÕES TÉCNICAS - Componente rico semântico */}
      {/* ================================================================== */}
      <VehicleSpecsTable
        specs={car_review?.specs}
        brand={car_review?.brand}
        model={car_review?.model}
      />

      {/* ================================================================== */}
      {/* CTA PRIMÁRIO - Após primeira dobra */}
      {/* ================================================================== */}
      <CTASection brand={car_review?.brand} model={car_review?.model} isPrimary />

      {/* ================================================================== */}
      {/* GALERIA DE FOTOS - Com navegação e legendas */}
      {/* ================================================================== */}
      <GallerySection
        images={car_review?.gallery_images}
        brand={car_review?.brand}
        model={car_review?.model}
      />

      {/* ================================================================== */}
      {/* CONTEÚDO PRINCIPAL - Corpo do artigo longo */}
      {/* ================================================================== */}
      <section className="py-14 lg:py-20">
        <Container size="lg">
          <div className="max-w-3xl mx-auto">
            {/* Conteúdo HTML com tipografia otimizada para leitura longa */}
            <div
              className="prose prose-lg lg:prose-xl prose-neutral dark:prose-invert
                         prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
                         prose-h2:text-2xl prose-h2:lg:text-3xl prose-h2:mt-12 prose-h2:mb-6
                         prose-h3:text-xl prose-h3:lg:text-2xl prose-h3:mt-8 prose-h3:mb-4
                         prose-p:text-foreground-secondary prose-p:leading-[1.8] prose-p:mb-6
                         prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-foreground prose-strong:font-semibold
                         prose-ul:my-6 prose-li:my-2 prose-li:text-foreground-secondary
                         prose-blockquote:border-l-primary prose-blockquote:bg-background-soft
                         prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                         prose-blockquote:not-italic prose-blockquote:text-foreground-secondary"
              dangerouslySetInnerHTML={{ __html: post.content }}
              itemProp="reviewBody"
            />

            {/* ================================================================== */}
            {/* OPCIONAIS E DESTAQUES */}
            {/* ================================================================== */}
            <OptionalsSection
              optionals={car_review?.optionals}
              highlights={car_review?.highlights}
            />

            {/* ================================================================== */}
            {/* DISPONIBILIDADE NO ESTOQUE */}
            {/* ================================================================== */}
            {car_review?.availability && (
              <div className="mt-12 p-6 lg:p-8 rounded-2xl border-2 border-primary/30 bg-primary/5">
                <div className="flex items-start justify-between flex-wrap gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      {car_review.availability.in_stock ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            Disponível em Estoque Attra
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-6 h-6 text-foreground-secondary" />
                          <span className="text-lg font-semibold text-foreground-secondary">
                            Sob Consulta
                          </span>
                        </>
                      )}
                    </div>
                    {car_review.availability.price && (
                      <p className="text-3xl font-bold text-foreground">
                        {car_review.availability.price}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-foreground-secondary">
                      Veículo disponível na Attra Veículos em Uberlândia-MG
                    </p>
                  </div>
                  {car_review.availability.in_stock && car_review.availability.stock_url && (
                    <Button asChild size="lg" className="min-h-[52px]">
                      <Link href={car_review.availability.stock_url}>
                        Ver Detalhes no Estoque
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================== */}
            {/* AVALIAÇÃO ATTRA - Card premium reformulado */}
            {/* ================================================================== */}
            <AttraEvaluationSection
              evaluation={car_review?.evaluation}
              brand={car_review?.brand}
              model={car_review?.model}
            />
          </div>
        </Container>
      </section>

      {/* ================================================================== */}
      {/* FAQ - Perguntas Frequentes para SEO/LLMO */}
      {/* ================================================================== */}
      <FAQSection
        faqs={car_review?.faq}
        brand={car_review?.brand}
        model={car_review?.model}
      />

      {/* ================================================================== */}
      {/* CTA FINAL */}
      {/* ================================================================== */}
      <CTASection brand={car_review?.brand} model={car_review?.model} />

      {/* ================================================================== */}
      {/* RODAPÉ DO ARTIGO - Links relacionados */}
      {/* ================================================================== */}
      <ArticleFooter brand={car_review?.brand} />
    </article>
  )
}


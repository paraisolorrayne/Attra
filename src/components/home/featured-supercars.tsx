'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Vehicle } from '@/types'

interface FeaturedSupercarsProps {
  vehicles?: Vehicle[]
}

export function FeaturedSupercars({ vehicles = [] }: FeaturedSupercarsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Take first 3 vehicles for display
  const displayVehicles = vehicles.slice(0, 3)

  if (displayVehicles.length === 0) {
    return null // Don't render section if no vehicles
  }

  return (
    <section ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className={`mb-16 opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-primary font-medium tracking-wide uppercase text-sm">Destaques</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Últimos veículos em destaque
          </h2>
          <p className="text-foreground-secondary text-lg max-w-2xl">
            Máquinas exclusivas selecionadas para entusiastas exigentes
          </p>
        </div>

        {/* Featured Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {displayVehicles.map((vehicle, index) => (
            <Link
              key={vehicle.id}
              href={`/veiculo/${vehicle.slug}`}
              className={`group card-premium bg-background-card border border-border rounded-2xl overflow-hidden opacity-0 ${
                isVisible ? `animate-fade-in-up stagger-${index + 1}` : ''
              }`}
            >
              {/* Image container with consistent 4:3 aspect ratio */}
              <div className="relative aspect-[4/3] overflow-hidden bg-background-soft vehicle-image-container">
                <Image
                  src={vehicle.photos?.[0] || '/placeholder.jpg'}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  fill
                  className="card-vehicle-image transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {vehicle.is_new && <Badge variant="success">0 km</Badge>}
                  {vehicle.category === 'supercar' && <Badge variant="primary">Superesportivo</Badge>}
                  {vehicle.category === 'premium' && <Badge variant="secondary">Premium</Badge>}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-primary text-sm font-medium mb-1">{vehicle.brand}</p>
                <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {vehicle.model}
                </h3>
                <p className="text-foreground-secondary mb-4">
                  {vehicle.year_model} • {vehicle.mileage === 0 ? '0 km' : `${vehicle.mileage?.toLocaleString('pt-BR')} km`}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {formatPrice(vehicle.price || 0)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All CTA */}
        <div className={`mt-12 text-center opacity-0 ${isVisible ? 'animate-fade-in-up stagger-5' : ''}`}>
          <Button asChild variant="outline" size="lg">
            <Link href="/estoque" className="flex items-center gap-2">
              Ver todo o estoque <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}


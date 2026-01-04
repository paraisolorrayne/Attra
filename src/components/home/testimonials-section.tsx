'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { Star, Quote, MapPin } from 'lucide-react'
import { Container } from '@/components/ui/container'

interface Review {
  id: string
  author: {
    name: string
    photoUrl?: string
  }
  rating: number
  text: string
  date: string
  store: {
    name: string
    code: string
  }
}

interface TestimonialsData {
  reviews: Review[]
  meta: {
    averageRating: number
    totalReviews: number
  }
}

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [data, setData] = useState<TestimonialsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/google-reviews?limit=6&min_rating=4')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  // Don't render if no reviews
  if (!loading && (!data?.reviews || data.reviews.length === 0)) {
    return null
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  return (
    <section ref={sectionRef} className="py-24 bg-background-soft relative overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className={`text-center mb-16 opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <span className="text-primary font-medium tracking-wide uppercase text-sm">
            Depoimentos
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-4">
            O que nossos clientes dizem
          </h2>
          {data?.meta && (
            <div className="flex items-center justify-center gap-4 text-foreground-secondary">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(data.meta.averageRating))}
                <span className="font-semibold text-foreground">{data.meta.averageRating}</span>
              </div>
              <span className="text-sm">•</span>
              <span className="text-sm">{data.meta.totalReviews}+ avaliações no Google</span>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-background-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                <div className="h-20 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.reviews.map((review, index) => (
              <div
                key={review.id}
                className={`group relative bg-background-card border border-border rounded-2xl p-6 
                  hover:border-primary/50 transition-all duration-300 hover:shadow-lg
                  opacity-0 ${isVisible ? `animate-fade-in-up stagger-${Math.min(index + 1, 6)}` : ''}`}
              >
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
                
                {/* Rating */}
                <div className="mb-4">{renderStars(review.rating)}</div>
                
                {/* Review Text */}
                <p className="text-foreground-secondary mb-6 line-clamp-4 min-h-[96px]">
                  "{review.text}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {review.author.photoUrl ? (
                      <Image
                        src={review.author.photoUrl}
                        alt={review.author.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold text-sm">
                        {review.author.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{review.author.name}</p>
                    {review.store?.code && (
                      <p className="text-xs text-foreground-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Loja {review.store.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Google Badge */}
        <div className={`mt-12 text-center opacity-0 ${isVisible ? 'animate-fade-in-up stagger-6' : ''}`}>
          <a
            href="https://www.google.com/search?q=attra+veiculos+uberlandia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary transition-colors"
          >
            <Image src="/images/google-logo.svg" alt="Google" width={16} height={16} className="opacity-70" />
            Ver todas as avaliações no Google
          </a>
        </div>
      </Container>
    </section>
  )
}


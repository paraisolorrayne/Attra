'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Award, Users, MapPin, Calendar, CheckCircle } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '18+', label: 'Anos de Mercado', icon: Calendar },
  { value: '500+', label: 'Veículos/Ano', icon: Award },
  { value: '27', label: 'Estados Atendidos', icon: MapPin },
  { value: '5.0', label: 'Avaliação Google', icon: Users },
]

const pillars = [
  'Negócio familiar com quase 20 anos de história',
  'Referência em veículos premium e carros de luxo em Uberlândia e no Brasil',
  'Atendimento transparente, respeitoso e consultivo',
]

export function AboutSectionExpanded() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-background-soft" id="sobre">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <div className={`opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}>
            <span className="text-primary font-medium tracking-wide uppercase text-sm">Sobre a Attra</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-6">
              Referência em Veículos Premium em Uberlândia e no Brasil
            </h2>

            {/* 1 parágrafo principal – história + confiança */}
            <p className="text-foreground-secondary leading-relaxed mb-6">
              Fundada em 2008 por Irineu, a <strong className="text-foreground">Attra Veículos</strong> nasceu como
              um negócio familiar em Uberlândia, construído sobre integridade e paixão automotiva. Ao longo de
              quase duas décadas, a família transformou a Attra em sinônimo de confiança na{' '}
              <strong className="text-foreground">compra de carros de luxo em todo o Brasil</strong> — com
              atendimento nacional a partir de Uberlândia, avaliações entre 4.7 e 4.9 no Google Maps e centenas
              de clientes que validam nossa reputação.
            </p>

            {/* 3 bullets – pilares */}
            <div className="space-y-3 mb-8">
              {pillars.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Teaser curadoria + link /jornada */}
            <p className="text-foreground-secondary leading-relaxed mb-8">
              Cada veículo passa por <strong className="text-foreground">curadoria rigorosa, inspeção técnica
              completa e verificação de documentação</strong>, garantindo a segurança que clientes de veículos
              premium e supercarros exigem.{' '}
              <Link
                href="/jornada"
                className="text-primary hover:text-primary-hover font-medium transition-colors inline-flex items-center gap-1"
              >
                Veja em detalhes como funciona nossa curadoria na Jornada Attra
                <ArrowRight className="w-4 h-4" />
              </Link>
            </p>

            {/* CTA */}
            <Button asChild size="lg">
              <Link href="/sobre" className="flex items-center gap-2">
                Conheça Nossa História <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {/* Right - Stats & Image */}
          <div className={`opacity-0 ${isVisible ? 'animate-fade-in-up stagger-2' : ''}`}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-background border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-colors"
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-foreground-secondary">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* CEO Photo - Thiago */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border">
              <Image
                src="/about/thiago-ceo.png"
                alt="Thiago - CEO Attra Veículos"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-lg font-semibold text-white">Thiago</p>
                <p className="text-sm text-white/80">CEO - Attra Veículos</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}


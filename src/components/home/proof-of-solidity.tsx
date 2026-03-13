'use client'

import { useRef, useEffect, useState } from 'react'
import { Building2, MapPin, CheckCircle, TrendingUp } from 'lucide-react'
import { Container } from '@/components/ui/container'

const pillars = [
  {
    icon: Building2,
    title: 'Tradição',
    subtitle: '18+ Anos',
    description: 'Negócio familiar à prova do tempo, consolidado como referência premium no Brasil desde 2008.',
  },
  {
    icon: MapPin,
    title: 'Cobertura Nacional',
    subtitle: '27 Estados',
    description: 'Presença em todo o território nacional com logística especializada e garantia de entrega segura.',
  },
  {
    icon: CheckCircle,
    title: 'Curadoria',
    subtitle: '200+ Itens',
    description: 'Cada veículo passa por inspção rigorossímica, análise documental completa e verificação de procedência.',
  },
  {
    icon: TrendingUp,
    title: 'Evolução',
    subtitle: '+500 Vendas/Ano',
    description: 'Crescimento contínuo reafirmando a confiança de clientes e colecionadores em toda a jornada.',
  },
]

const metrics = [
  { value: '18+', label: 'Anos no Mercado' },
  { value: '500+', label: 'Veículos/Ano' },
  { value: '27', label: 'Estados' },
  { value: '5.0', label: 'Google Rating' },
]

export function ProofOfSolidity() {
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
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 bg-gradient-to-br from-background via-background to-primary/5"
      id="prova-solidez"
    >
      <Container size="2xl">
        {/* Section Header */}
        <div className={`text-center mb-16 opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <span className="text-primary font-medium tracking-wide uppercase text-sm">Solidez e Confiança</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Empresa em Evolução, Fundamentada na Tradição
          </h2>
          <p className="text-foreground-secondary text-lg max-w-3xl mx-auto">
            Quase duas décadas de história provam nosso compromisso com veículos premium, curadoria rigorosa e 
            atendimento exemplar em todo o Brasil.
          </p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`bg-background border border-border rounded-2xl p-6 text-center hover:border-primary/40 transition-all
                opacity-0 ${isVisible ? `animate-fade-in-up stagger-${index + 1}` : ''}`}
            >
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">{metric.value}</div>
              <p className="text-sm lg:text-base text-foreground-secondary font-medium">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className={`group bg-background-card border border-border rounded-2xl p-6 lg:p-8
                hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all
                opacity-0 ${isVisible ? `animate-fade-in-up stagger-${index + 1}` : ''}`}
            >
              <div className="mb-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center 
                              group-hover:bg-primary/20 transition-colors mb-4">
                  <pillar.icon className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs lg:text-sm text-primary font-medium mt-1">{pillar.subtitle}</p>
              </div>
              <p className="text-sm lg:text-base text-foreground-secondary leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

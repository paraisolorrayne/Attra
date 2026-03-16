'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, UserCheck, Cpu, HeartHandshake } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { SectionKicker, SectionHeading } from '@/components/ui/brand'

const pillars = [
  {
    icon: Search,
    title: 'Curadoria rigorosa',
    description: 'Cada veículo passa por seleção e análise criteriosa antes de integrar o acervo.',
  },
  {
    icon: UserCheck,
    title: 'Experiência personalizada',
    description: 'O atendimento considera o carro desejado e o momento do cliente.',
  },
  {
    icon: Cpu,
    title: 'Tecnologia aplicada ao relacionamento',
    description: 'IA e sistemas próprios tornam o atendimento mais ágil, eficiente e conectado.',
  },
  {
    icon: HeartHandshake,
    title: 'Acompanhamento contínuo',
    description: 'A relação continua depois da entrega.',
  },
]

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)

    // Fallback: garante que o conteúdo aparece mesmo sem scroll (mobile)
    const timeout = setTimeout(() => setIsVisible(true), 1500)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
      <Container size="2xl">
        {/* Section Header */}
        <div className={`text-center mb-16 opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <SectionKicker className="mb-4">Operação</SectionKicker>
          <SectionHeading as="h2" size="lg" className="mb-4">
            Um novo jeito de operar
          </SectionHeading>
          <p className="text-foreground-secondary text-lg max-w-3xl mx-auto">
            Com o tempo, a Attra evoluiu. O que começou como uma visão clara sobre curadoria passou a
            incorporar tecnologia, inteligência de dados e novos modelos de relacionamento. Hoje, a empresa
            combina sensibilidade automotiva com eficiência operacional — ampliando atendimento sem perder
            proximidade, confiança e atenção aos detalhes.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className={`group institutional-card overflow-hidden
                transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5
                opacity-0 ${isVisible ? `animate-fade-in-up stagger-${index + 1}` : ''}`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/10
                                  group-hover:bg-primary/15 group-hover:border-primary/20 transition-colors
                                  shrink-0 self-start">
                    <pillar.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="type-display-md text-lg sm:text-xl group-hover:text-primary transition-colors mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`mt-12 text-center opacity-0 ${isVisible ? 'animate-fade-in-up stagger-5' : ''}`}>
          <Button asChild size="lg">
            <Link href="/jornada" className="flex items-center gap-2">
              Ver a Jornada Attra em Detalhes <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}


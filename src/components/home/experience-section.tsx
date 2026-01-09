'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Building2, Truck, Shield, UserCheck } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

const experiences = [
  {
    icon: Building2,
    title: 'Showrooms com Curadoria',
    description: 'Ambientação exclusiva projetada para exibir cada veículo como uma obra de arte. Iluminação profissional, climatização e espaço pensado para apreciação.',
  },
  {
    icon: Truck,
    title: 'Logística Nacional Premium',
    description: 'Entrega em qualquer estado do Brasil com seguro especializado para veículos de alto valor, rastreamento em tempo real e cuidado obsessivo.',
  },
  {
    icon: Shield,
    title: 'Procedência Verificada',
    description: 'Cada veículo passa por análise rigorosa de histórico, documentação e inspeção técnica de 200 itens antes de integrar nosso acervo.',
  },
  {
    icon: UserCheck,
    title: 'Atendimento Sob Medida',
    description: 'Consultores especializados dedicados a entender seu perfil e apresentar as melhores opções com discrição, agilidade e total personalização.',
  },
]

export function ExperienceSection() {
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

  return (
    <section ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className={`text-center mb-16 opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <span className="text-primary font-medium tracking-wide uppercase text-sm">Além do Carro</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-4">
            A Experiência Attra
          </h2>
          <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
            Do primeiro contato à entrega das chaves, cada detalhe é pensado para quem exige o extraordinário
          </p>
        </div>

        {/* Experience Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {experiences.map((exp, index) => (
            <div
              key={exp.title}
              className={`group relative bg-background-card border border-border rounded-2xl overflow-hidden
                transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5
                opacity-0 ${isVisible ? `animate-fade-in-up stagger-${index + 1}` : ''}`}
            >
              {/* Premium Gradient Background - Subtle monochromatic */}
              <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-background-soft via-background-card to-background-soft">
                {/* Subtle radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(154,28,28,0.08),transparent_60%)]" />

                {/* Large background icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <exp.icon className="w-28 h-28 text-foreground/[0.03] dark:text-foreground/[0.05]" />
                </div>

                {/* Bottom fade to card */}
                <div className="absolute inset-0 bg-gradient-to-t from-background-card via-background-card/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/10
                                  group-hover:bg-primary/15 group-hover:border-primary/20 transition-colors
                                  shrink-0 self-start">
                    <exp.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-foreground-secondary leading-relaxed">
                      {exp.description}
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
              Conheça a jornada completa <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}


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
    gradient: 'from-primary/20 via-primary/10 to-transparent',
  },
  {
    icon: Truck,
    title: 'Logística Nacional Premium',
    description: 'Entrega em qualquer estado do Brasil com seguro especializado para veículos de alto valor, rastreamento em tempo real e cuidado obsessivo.',
    gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
  },
  {
    icon: Shield,
    title: 'Procedência Verificada',
    description: 'Cada veículo passa por análise rigorosa de histórico, documentação e inspeção técnica de 200 itens antes de integrar nosso acervo.',
    gradient: 'from-green-500/20 via-green-500/10 to-transparent',
  },
  {
    icon: UserCheck,
    title: 'Atendimento Sob Medida',
    description: 'Consultores especializados dedicados a entender seu perfil e apresentar as melhores opções com discrição, agilidade e total personalização.',
    gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
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
                card-premium opacity-0 ${isVisible ? `animate-fade-in-up stagger-${index + 1}` : ''}`}
            >
              {/* Gradient Background */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${exp.gradient}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <exp.icon className="w-24 h-24 text-foreground/5" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-card via-background-card/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <exp.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-foreground-secondary">
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


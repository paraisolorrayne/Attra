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

const differentials = [
  'Curadoria rigorosa de veículos premium',
  'Inspeção técnica de 150 pontos',
  'Documentação 100% verificada',
  'Entrega nacional com seguro especializado',
  'Financiamento com taxas diferenciadas',
  'Atendimento consultivo personalizado',
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
            
            <div className="space-y-4 text-foreground-secondary leading-relaxed">
              <p>
                A história da <strong className="text-foreground">Attra Veículos</strong> é, acima de tudo, uma história de família.
                Fundada em 2008, a nossa trajetória começou sob a visão e o trabalho de Irineu, que estabeleceu em Uberlândia os alicerces
                de uma empresa pautada pela integridade e pela paixão automotiva. Hoje, a família segue os passos do pai, honrando
                seu nome e trazendo a confiança de um negócio familiar para o mercado automotivo de alto luxo.
              </p>
              <strong className="text-foreground">Tradição que Gera Confiança</strong>
              <p>
                Ao longo de quase 20 anos, transformamos o nome Attra em sinônimo de segurança. Entendemos que a compra de um veículo
                premium não é apenas uma transação, mas a realização de um projeto. Por isso, aplicamos os valores aprendidos em casa:
                transparência, respeito e compromisso em cada negociação. A confiança é o nosso maior patrimônio.
              </p>
              <p>
                Nossa reputação é validada por quem mais importa: nossos clientes. Mantemos médias de avaliação entre 4.7 e 4.9 no
                Google Maps, onde somos frequentemente elogiados pela transparência nas negociações, atendimento atencioso e a qualidade
                impecável dos veículos entregues.
              </p>
              <p>
                Nossa filosofia é simples: cada veículo em nosso estoque deve atender aos mais rigorosos padrões. Para garantir a sua
                tranquilidade, desenvolvemos um processo de curadoria que inclui:
              </p>
            </div>

            {/* Differentials List */}
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {differentials.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/sobre" className="flex items-center gap-2">
                  Conheça Nossa História <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
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


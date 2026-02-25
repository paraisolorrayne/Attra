import { CalendarCheck, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'

export function ConciergeCtaSection() {
  return (
    <section className="py-16 lg:py-20 bg-background-soft">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-5 bg-primary/10 rounded-full flex items-center justify-center">
            <CalendarCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Agendar Atendimento Exclusivo
          </h2>
          <p className="text-foreground-secondary mb-6 max-w-lg mx-auto">
            Escolha o melhor horário para falar com um consultor especializado Attra sobre veículos premium e supercarros
          </p>
          <a
            href="https://wa.me/553432563200?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20atendimento%20exclusivo%20com%20um%20consultor%20Attra."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg"
          >
            Agendar meu horário <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </Container>
    </section>
  )
}


import Link from 'next/link'
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const locations = [
  {
    id: '1',
    name: 'Attra Veículos – Showroom',
    address: 'Av. Rondon Pacheco, 1670',
    city: 'Uberlândia',
    state: 'MG',
    cep: '38408-343',
    phone: '(34) 3256-3200',
    hours: 'Seg-Sex: 8h às 18h | Sáb: 8h às 13h',
  },
]

export function LocationSection() {
  return (
    <section id="localizacao" className="py-16 lg:py-24 bg-background-soft">
      <Container size="2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Localização
          </h2>
          <p className="text-foreground-secondary max-w-2xl mx-auto">
            Showroom de carros de luxo em Uberlândia, com atendimento nacional para veículos premium e supercarros
          </p>
        </div>

        {/* Side-by-side layout: Location card + Map */}
        <div className="grid lg:grid-cols-2 gap-0 items-stretch mb-8">
          {/* Left: Location Card */}
          <div className={cn(
            "grid gap-6",
            locations.length === 1 ? "" : "md:grid-cols-2"
          )}>
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-background border border-border rounded-xl p-8 hover:border-primary transition-colors"
              >
                <h3 className="text-2xl font-semibold text-foreground mb-6">
                  {location.name}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-base text-foreground">{location.address}</p>
                      <p className="text-sm text-foreground-secondary">
                        {location.city} - {location.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <a
                      href={`tel:${location.phone.replace(/\D/g, '')}`}
                      className="text-base text-foreground hover:text-primary transition-colors font-medium"
                    >
                      {location.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground-secondary">{location.hours}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <a
                    href="https://maps.app.goo.gl/q8RmVwZpLo7n7W8B8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-base text-primary hover:text-primary-hover font-semibold transition-colors"
                  >
                    Ver no mapa <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Google Map Embed */}
          <div className="bg-background border border-border rounded-xl overflow-hidden h-full min-h-[400px] lg:min-h-[550px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3752.7623839425146!2d-48.27717!3d-18.91861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sAttra%20Ve%C3%ADculos!2sAv.%20Rondon%20Pacheco%2C%201670%20-%20Uberlandia%2C%20MG%2038408-343!5e0!3m2!1spt-BR!2sbr!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="text-center">
          <Button variant="outline" asChild>
            <Link href="/contato" className="flex items-center gap-2">
              Todas as formas de contato <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}


import Link from 'next/link'
import { MapPin, Phone, Clock, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

const locations = [
  {
    id: '1',
    name: 'Attra Veículos – Showroom',
    address: 'Av. Rondon Pacheco, 1670',
    city: 'Uberlândia',
    state: 'MG',
    cep: '38400-242',
    phone: '(34) 3256-3200',
    hours: 'Seg-Sex: 8h às 18h | Sáb: 8h às 13h',
  },
]

export function LocationSection() {
  return (
    <section id="localizacao" className="py-16 lg:py-24 bg-background-soft">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Nossas Lojas
          </h2>
          <p className="text-foreground-secondary max-w-2xl mx-auto">
            Visite nossos showrooms e conheça de perto os melhores veículos do mercado
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-background border border-border rounded-xl p-6 hover:border-primary transition-colors"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {location.name}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground">{location.address}</p>
                    <p className="text-foreground-secondary">
                      {location.city} - {location.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a
                    href={`tel:${location.phone.replace(/\D/g, '')}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {location.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-foreground-secondary">{location.hours}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${location.address}, ${location.city} - ${location.state}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Ver no mapa <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
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


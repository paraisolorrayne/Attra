import Link from 'next/link'
import { Container } from '@/components/ui/container'

const brands = [
  { name: 'Porsche', logo: '/brands/porsche.svg' },
  { name: 'BMW', logo: '/brands/bmw.svg' },
  { name: 'Mercedes-Benz', logo: '/brands/mercedes.svg' },
  { name: 'Audi', logo: '/brands/audi.svg' },
  { name: 'Land Rover', logo: '/brands/land-rover.svg' },
  { name: 'Cadillac', logo: '/brands/cadillac.svg' },
  { name: 'Ferrari', logo: '/brands/ferrari.svg' },
  { name: 'Lamborghini', logo: '/brands/lamborghini.svg' },
]

export function BrandSearch() {
  return (
    <section className="py-12 lg:py-16 bg-background">
      <Container>
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Buscar por Marca
          </h2>
          <p className="text-foreground-secondary">
            Encontre o veículo ideal entre as melhores marcas do mundo
          </p>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={`/estoque?marca=${brand.name.toLowerCase().replace(' ', '-')}`}
              className="flex flex-col items-center justify-center p-4 bg-background-card border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 mb-2 flex items-center justify-center bg-background rounded-full">
                <span className="text-xs font-bold text-foreground-secondary group-hover:text-primary transition-colors">
                  {brand.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-foreground-secondary text-center group-hover:text-foreground transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}


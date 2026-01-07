'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Youtube } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'

const quickLinks = [
  { name: 'Estoque', href: '/estoque' },
  { name: 'Sobre Nós', href: '/sobre' },
  { name: 'Financiamento', href: '/financiamento' },
  { name: 'Compramos seu Carro', href: '/compramos-seu-carro' },
  { name: 'Solicitar Veículo', href: '/solicitar-veiculo' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contato', href: '/contato' },
]

const brands = ['Porsche', 'BMW', 'Mercedes-Benz', 'Audi', 'Land Rover', 'Cadillac', 'Lamborghini', 'Ferrari']

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show white logo in dark mode, black logo in light mode
  const showWhiteLogo = mounted && resolvedTheme === 'dark'

  return (
    <footer className="bg-background-card border-t border-border">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <Link href="/" className="relative flex items-center mb-4 h-10">
              {/* White logo - visible in dark mode */}
              <Image
                src="/images/logo-white.png"
                alt="Attra Veículos"
                width={120}
                height={36}
                className={cn(
                  'h-9 w-auto object-contain transition-opacity duration-300',
                  showWhiteLogo ? 'opacity-100' : 'opacity-0'
                )}
              />
              {/* Black logo - visible in light mode */}
              <Image
                src="/images/logo-black.png"
                alt="Attra Veículos"
                width={120}
                height={36}
                className={cn(
                  'absolute left-0 h-9 w-auto object-contain transition-opacity duration-300',
                  showWhiteLogo ? 'opacity-0' : 'opacity-100'
                )}
              />
            </Link>
            <p className="text-foreground-secondary text-sm mb-4">
              Referência em veículos nacionais, importados, seminovos e supercarros em Uberlândia e região. 
              Atendimento nacional a partir de Minas Gerais.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/attraveiculos" target="_blank" rel="noopener noreferrer" className="p-2 bg-background hover:bg-primary hover:text-white rounded-lg transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/attraveiculos" target="_blank" rel="noopener noreferrer" className="p-2 bg-background hover:bg-primary hover:text-white rounded-lg transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@attraveiculos" target="_blank" rel="noopener noreferrer" className="p-2 bg-background hover:bg-primary hover:text-white rounded-lg transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-foreground-secondary hover:text-primary text-sm transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Marcas em Destaque</h3>
            <ul className="space-y-2">
              {brands.map((brand) => (
                <li key={brand}>
                  <Link href={`/estoque?marca=${brand.toLowerCase()}`} className="text-foreground-secondary hover:text-primary text-sm transition-colors">
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-foreground font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li>
                <div className="flex items-start gap-2 text-foreground-secondary text-sm">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <a href="tel:+553432563100" className="hover:text-primary transition-colors">(34) 3256-3100</a>
                    <a href="tel:+553432260202" className="hover:text-primary transition-colors">(34) 3226-0202</a>
                  </div>
                </div>
              </li>
              <li>
                <a href="mailto:faleconosco@attraveiculos.com.br" className="flex items-start gap-2 text-foreground-secondary hover:text-primary text-sm transition-colors">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>faleconosco@attraveiculos.com.br</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-foreground-secondary text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Av. Rondon Pacheco, 1670<br />Uberlândia - MG, 38400-242</span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-2 text-foreground-secondary text-sm">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Seg-Sex: 8h às 18h<br />Sábado: 8h às 13h</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <Container className="py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground-secondary">
            <p>© {currentYear} Attra Veículos. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <Link href="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link>
              <Link href="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}


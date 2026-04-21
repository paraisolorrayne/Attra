'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Vehicle } from '@/types'
import { getWhatsAppUrl } from '@/lib/constants'

interface HomeHeroProps {
  vehicle?: Vehicle | null
}

const whatsappMessage =
  'Olá, Attra. Gostaria de conversar com um especialista sobre um veículo premium.'

export function HomeHero({ vehicle }: HomeHeroProps) {
  const photo = vehicle?.photos?.[0]
  const brand = vehicle?.brand

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-background-soft via-background to-background">
      {/* Watermark brand — aspirational, non-literal */}
      {brand && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] select-none"
        >
          <span className="whitespace-nowrap text-[7rem] sm:text-[14rem] lg:text-[22rem] font-black uppercase tracking-tighter text-foreground">
            {brand}
          </span>
        </div>
      )}

      <div className="relative mx-auto max-w-[92%] lg:max-w-[72%] pt-24 pb-10 md:pt-32 md:pb-16 lg:pt-36 lg:pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          {/* Copy column */}
          <div className="relative z-10 max-w-xl">
            <p className="text-primary text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] mb-3 md:mb-5">
              Curadoria nacional · Desde 2009
            </p>

            <h1 className="text-[1.85rem] leading-[1.08] sm:text-4xl sm:leading-[1.05] lg:text-[3.6rem] lg:leading-[1.02] font-black text-foreground tracking-tight mb-5 md:mb-6">
              Um atendimento à altura do carro que você vai comprar.
            </h1>

            {/* CTAs come BEFORE the subhead on mobile so both sit above the fold.
                Two-column grid on mobile keeps both buttons visible without scroll. */}
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
              <a
                href={getWhatsAppUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-primary hover:bg-primary-hover text-white font-semibold text-[13px] sm:text-base px-3 sm:px-7 py-3.5 sm:py-4 rounded-xl transition-colors shadow-lg shadow-primary/10"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>Falar com <span className="hidden sm:inline">um </span>especialista</span>
              </a>
              <Link
                href="/veiculos"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-foreground hover:bg-foreground/90 text-background font-semibold text-[13px] sm:text-base px-3 sm:px-7 py-3.5 sm:py-4 rounded-xl transition-colors shadow-lg shadow-black/10"
              >
                <span>Explorar estoque</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>

          {/* Visual column — aspirational vehicle (NOT a listing card) */}
          {photo && vehicle && (
            <div className="relative z-10 order-last lg:order-none">
              <Link
                href={`/veiculo/${vehicle.slug}`}
                aria-label={`Ver ${vehicle.brand} ${vehicle.model}`}
                className="group block"
              >
                <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/60 shadow-2xl shadow-black/20">
                  <Image
                    src={photo}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 92vw, 44vw"
                    priority
                  />
                  {/* Dark gradient for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                  {/* Caption overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                    <p className="text-white/70 text-[10px] uppercase tracking-[0.25em] font-semibold mb-1.5">
                      Destaque do acervo
                    </p>
                    <p className="text-white text-lg sm:text-2xl font-bold leading-tight">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-white/80 text-xs sm:text-sm mt-1 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                      Conhecer este veículo <ArrowRight className="w-4 h-4" />
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

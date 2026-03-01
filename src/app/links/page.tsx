'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { MessageCircle, Car, ChevronRight, Instagram, Youtube, Shield, MapPin } from 'lucide-react'
import { WHATSAPP_NUMBER, SITE_URL } from '@/lib/constants'

/* ─── UTM helpers ─── */
function useUtmParams() {
  const sp = useSearchParams()
  const source = sp.get('utm_source') || 'instagram'
  const medium = sp.get('utm_medium') || 'bio_link'
  const campaign = sp.get('utm_campaign') || 'geral'
  return { source, medium, campaign }
}

/* ─── dataLayer push ─── */
function trackClick(id: string, type: string, label: string, position: string, utm: any) {
  if (typeof window !== 'undefined') {
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({
      event: 'link_click',
      link_id: id,
      link_type: type,
      link_label: label,
      link_position: position,
      origem: `${utm.source}/${utm.medium}/${utm.campaign}`,
    })
  }
}

/* ─── CTAs ─── */
const CTAS = [
  {
    id: 'cta-whatsapp-principal',
    type: 'whatsapp',
    label: 'iniciar_selecao',
    position: 'top_1',
    title: 'Iniciar processo de escolha',
    subtitle: 'Etapa inicial leva menos de 1 minuto',
    icon: MessageCircle,
    accent: true,
  },
  {
    id: 'cta-estoque-consulta',
    type: 'estoque',
    label: 'consultar_acervo',
    position: 'top_2',
    title: 'Consultar veículos disponíveis',
    subtitle: 'Apenas visualização do acervo',
    icon: Car,
    href: '/estoque?ordenar=preco-desc',
  },
] as const

const TRUST = [
  'Seleção baseada em histórico, procedência e configuração',
  'Atendimento direto até a entrega, sem intermediários',
  'Redução de risco na escolha, não pressão comercial',
]

function LinksContent() {
  const utm = useUtmParams()

  // Força tema do sistema nesta página (ignora escolha manual do site)
  const { setTheme } = useTheme()
  useEffect(() => { setTheme('system') }, [setTheme])

  const whatsappMsg = encodeURIComponent(
`Gostaria de atendimento sobre os veículos disponíveis.
`
  )

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`
  const mapsUrl = 'https://maps.app.goo.gl/wBpftykDQRQJmB1z8'

  function getHref(cta: (typeof CTAS)[number]) {
    if (cta.type === 'whatsapp') return whatsappUrl
    return `${SITE_URL}${(cta as any).href}`
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* HERO */}
      <section className="pt-10 pb-6 px-5 text-center max-w-lg mx-auto w-full">
        <Image src="/images/logo-white.png" alt="Attra Veículos" width={160} height={48} className="mx-auto mb-6 h-10 w-auto dark:block hidden" priority />
        <Image src="/images/logo-black.png" alt="Attra Veículos" width={160} height={48} className="mx-auto mb-6 h-10 w-auto dark:hidden block" priority />

        <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
          Para quem não compra carro por impulso.
        </h1>

        <p className="text-sm text-foreground-secondary leading-relaxed">
          Curadoria e orientação para escolher com segurança
        </p>
        <p className="text-sm text-foreground-secondary leading-relaxed">
          em qualquer lugar do Brasil.
        </p>
      </section>

      {/* CTA */}
      <section className="px-5 pb-8 max-w-lg mx-auto w-full space-y-3">
        {CTAS.map((cta) => (
          <a
            key={cta.id}
            href={getHref(cta)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(cta.id, cta.type, cta.label, cta.position, utm)}
            className={`flex items-center gap-3 w-full rounded-xl px-5 py-4 transition-all duration-200 active:scale-[0.98] ${
              'accent' in cta
                ? 'bg-[#25D366] text-white hover:bg-[#1fb855]'
                : 'bg-background-card border border-border hover:border-primary/60 hover:bg-background-soft'
            }`}
          >
            <cta.icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-left">
              <span className="block font-semibold text-[15px]">{cta.title}</span>
              <span className="block text-xs mt-0.5 opacity-80">{cta.subtitle}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </a>
        ))}
      </section>

      {/* TRUST */}
      <section className="px-5 pb-8 max-w-lg mx-auto w-full">
        <div className="rounded-xl bg-background-card border border-border p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-secondary mb-4">
            Como trabalhamos
          </h2>
          <ul className="space-y-3">
            {TRUST.map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground-secondary">
                <Shield className="w-4 h-4 mt-0.5 text-primary" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* HIGHLIGHT */}
      <section className="px-5 pb-10 max-w-lg mx-auto w-full">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-secondary mb-4">
          Exemplo recente de curadoria
        </h2>
        <a
          href={`${SITE_URL}/estoque?marca=ferrari`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl bg-background-card border border-border overflow-hidden hover:border-primary/60 transition-colors"
        >
          <div className="aspect-video relative">
            <Image src="/images/BG MB 01.png" alt="Veículo selecionado" fill className="object-cover" />
          </div>
          <div className="p-4">
            <p className="font-semibold text-base">Selecionado por configuração e histórico</p>
            <p className="text-xs text-foreground-secondary mt-1">Ver outros disponíveis →</p>
          </div>
        </a>
      </section>

      {/* RETIRADA / ENTREGA */}
      <section className="px-5 pb-10 max-w-lg mx-auto w-full">
        <div className="rounded-xl bg-background-card border border-border p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-secondary mb-4">
            Retirada ou visita agendada
          </h2>

          <p className="text-sm text-foreground-secondary mb-4 leading-relaxed">
            Clientes de outras cidades recebem orientação completa de chegada após a confirmação do veículo.
          </p>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick('cta-maps', 'maps', 'como_chegar', 'bottom', utm)}
            className="flex items-center gap-3 w-full rounded-xl px-5 py-4 bg-background-soft border border-border hover:border-primary/60 hover:bg-background-card transition-all"
          >
            <MapPin className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 text-left">
              <span className="block font-semibold text-[15px]">Abrir localização da unidade</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto px-5 py-8 border-t border-border max-w-lg mx-auto w-full text-center">
        <div className="flex justify-center gap-5 mb-4">
          <a href="https://instagram.com/attra.veiculos" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="w-5 h-5 text-foreground-secondary hover:text-foreground transition-colors" /></a>
          <a href="https://youtube.com/@attraveiculos" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube className="w-5 h-5 text-foreground-secondary hover:text-foreground transition-colors" /></a>
        </div>
        <a href={`${SITE_URL}/politica-privacidade`} className="text-xs text-foreground-secondary/60 hover:text-foreground-secondary transition-colors">
          Política de Privacidade
        </a>
      </footer>

    </div>
  )
}

export default function LinksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <LinksContent />
    </Suspense>
  )
}
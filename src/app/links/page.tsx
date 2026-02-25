'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import { MessageCircle, Car, MapPin, Trophy, ChevronRight, Instagram, Youtube, Shield } from 'lucide-react'
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
function trackClick(
  id: string, type: string, label: string, position: string,
  utm: { source: string; medium: string; campaign: string }
) {
  if (typeof window !== 'undefined') {
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({
      event: 'link_click',
      link_id: id,
      link_type: type,
      link_label: label,
      link_position: position,
      origem: `${utm.source}/${utm.medium}/${utm.campaign}`,
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
    })
  }
}

/* ─── CTA data ─── */
const CTAS = [
  {
    id: 'cta-whatsapp-principal',
    type: 'whatsapp',
    label: 'whatsapp_principal',
    position: 'top_1',
    title: 'Falar com um especialista no WhatsApp',
    subtitle: 'Atendimento consultivo em horário comercial.',
    icon: MessageCircle,
    accent: true,
  },
  {
    id: 'cta-estoque-completo',
    type: 'site',
    label: 'estoque_completo',
    position: 'top_2',
    title: 'Ver estoque completo no site',
    subtitle: 'Veículos atualizados em tempo real, com fotos e detalhes técnicos.',
    icon: Car,
    href: '/estoque',
  },
  {
    id: 'cta-estoque-esportivos',
    type: 'esportivos',
    label: 'estoque_esportivos',
    position: 'top_3',
    title: 'Ver esportivos e superesportivos',
    icon: Trophy,
    href: '/estoque?carroceria=coupe',
  },
  {
    id: 'cta-rondon-estoque',
    type: 'estoque_unidade',
    label: 'estoque_rondon',
    position: 'top_4',
    title: 'Estoque – Unidade Rondon Pacheco',
    icon: Car,
    href: '/estoque',
  },
  {
    id: 'cta-rondon-maps',
    type: 'maps_unidade',
    label: 'maps_rondon',
    position: 'top_5',
    title: 'Como chegar – Unidade Rondon Pacheco',
    icon: MapPin,
    href: 'https://maps.app.goo.gl/wBpftykDQRQJmB1z8',
    external: true,
  },
] as const

const TRUST_BULLETS = [
  'Mais de 500 veículos entregues em diversas regiões do Brasil.',
  'Atendimento consultivo, do primeiro contato à entrega na sua garagem.',
  'Veículos revisados, laudo cautelar e garantia de procedência.',
]

function LinksContent() {
  const utm = useUtmParams()

  const whatsappMsg = encodeURIComponent(
    `Olá, vim da bio do Instagram da Attra. Gostaria de falar com um especialista.`
  )
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`

  function getHref(cta: (typeof CTAS)[number]) {
    if (cta.type === 'whatsapp') return whatsappUrl
    if ('external' in cta && cta.external) return (cta as any).href
    // Links internos do site: sem UTMs (o estoque interpreta todos os params como filtros)
    return `${SITE_URL}${(cta as any).href}`
  }

  return (
    <div className="min-h-screen bg-[#060708] text-[#F5F5F5] flex flex-col">
      {/* ── Hero ── */}
      <section id="links-hero" className="pt-10 pb-6 px-5 text-center max-w-lg mx-auto w-full">
        <Image
          src="/images/logo-white.png"
          alt="Attra Veículos"
          width={160}
          height={48}
          className="mx-auto mb-6 h-10 w-auto"
          priority
        />
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
          Seu próximo carro especial, em qualquer lugar do Brasil.
        </h1>
        <p className="text-sm text-[#A8ABB2] leading-relaxed">
          Curadoria de veículos nacionais, importados e esportivos, com showroom em Uberlândia e entregas em todo o país.
        </p>
      </section>

      {/* ── CTAs ── */}
      <section id="links-ctas" className="px-5 pb-8 max-w-lg mx-auto w-full space-y-3">
        {CTAS.map((cta) => {
          const Icon = cta.icon
          const isAccent = 'accent' in cta && cta.accent
          return (
            <a
              key={cta.id}
              id={cta.id}
              href={getHref(cta)}
              target="_blank"
              rel="noopener noreferrer"
              data-link-type={cta.type}
              data-link-label={cta.label}
              data-link-position={cta.position}
              onClick={() => trackClick(cta.id, cta.type, cta.label, cta.position, utm)}
              className={`flex items-center gap-3 w-full rounded-xl px-5 py-4 transition-all duration-200 active:scale-[0.98] ${
                isAccent
                  ? 'bg-[#25D366] text-white hover:bg-[#1fb855]'
                  : 'bg-[#141518] border border-[#2A2D32] hover:border-[#9A1C1C]/60 hover:bg-[#1a1b1f]'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <span className="block font-semibold text-[15px] leading-snug">{cta.title}</span>
                {'subtitle' in cta && cta.subtitle && (
                  <span className={`block text-xs mt-0.5 ${isAccent ? 'text-white/80' : 'text-[#A8ABB2]'}`}>
                    {cta.subtitle}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-40" />
            </a>
          )
        })}
      </section>

      {/* ── Trust / Prova social ── */}
      <section id="links-trust" className="px-5 pb-8 max-w-lg mx-auto w-full">
        <div className="rounded-xl bg-[#141518] border border-[#2A2D32] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A8ABB2] mb-4">
            Por que a Attra?
          </h2>
          <ul className="space-y-3">
            {TRUST_BULLETS.map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#d4d4d4]">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#9A1C1C]" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Destaque do mês (placeholder) ── */}
      <section id="links-highlight" className="px-5 pb-10 max-w-lg mx-auto w-full">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A8ABB2] mb-4">
          Destaque do mês
        </h2>
        <a
          href={`${SITE_URL}/estoque`}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl bg-[#141518] border border-[#2A2D32] overflow-hidden hover:border-[#9A1C1C]/60 transition-colors"
        >
          <div className="aspect-video relative">
            <Image
              src="/images/BG MB 01.png"
              alt="Ferrari – Destaque do mês"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <p className="font-semibold text-base">Ferrari</p>
            <p className="text-xs text-[#A8ABB2] mt-1">Confira no estoque →</p>
          </div>
        </a>
      </section>

      {/* ── Footer ── */}
      <footer id="links-footer" className="mt-auto px-5 py-8 border-t border-[#2A2D32] max-w-lg mx-auto w-full text-center">
        <div className="flex justify-center gap-5 mb-4">
          <a href="https://instagram.com/attra.veiculos" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#A8ABB2] hover:text-white transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://tiktok.com/@attraveiculos" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-[#A8ABB2] hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.49 12.4a2.73 2.73 0 0 1 .69.09V9a6.46 6.46 0 0 0-.69-.05A6.34 6.34 0 0 0 3.14 15.3a6.34 6.34 0 0 0 6.35 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.12a4.85 4.85 0 0 1-1.01-.43Z" /></svg>
          </a>
          <a href="https://youtube.com/@attraveiculos" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[#A8ABB2] hover:text-white transition-colors">
            <Youtube className="w-5 h-5" />
          </a>
        </div>
        <a href={`${SITE_URL}/politica-privacidade`} className="text-xs text-[#666] hover:text-[#A8ABB2] transition-colors">
          Política de Privacidade
        </a>
      </footer>
    </div>
  )
}

export default function LinksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#060708] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#9A1C1C] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LinksContent />
    </Suspense>
  )
}

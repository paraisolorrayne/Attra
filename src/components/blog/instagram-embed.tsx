'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface InstagramEmbedProps {
  url: string
  title?: string
}

/**
 * Componente de embed do Instagram
 * Renderiza um post do Instagram usando o iframe oficial
 * Com fallback para link estilizado caso o embed falhe
 */
export function InstagramEmbed({ url, title = 'Post do Instagram' }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Extrair shortcode da URL do Instagram
  const getShortcode = (instagramUrl: string): string | null => {
    const match = instagramUrl.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/)
    return match ? match[1] : null
  }

  const shortcode = getShortcode(url)

  useEffect(() => {
    // Chamar o script de embed do Instagram após o componente renderizar
    if (typeof window !== 'undefined' && window.instgrm) {
      window.instgrm.Embeds.process()
    }
  }, [shortcode])

  if (!shortcode) {
    // Fallback: link estilizado se a URL for inválida
    return (
      <div className="my-8 p-6 bg-background-card rounded-lg border border-border text-center">
        <p className="text-foreground-secondary mb-4">
          Não foi possível carregar o embed do Instagram
        </p>
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver no Instagram
        </Link>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="my-8 flex justify-center"
    >
      {/* Wrapper responsivo para o iframe */}
      <div className="w-full max-w-[540px] px-4 sm:px-0">
        {/* Blockquote com markup recomendado pelo Instagram */}
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{
            background: '#FFF',
            border: '0',
            borderRadius: '3px',
            boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
            margin: '1px',
            maxWidth: '540px',
            minWidth: '326px',
            padding: '0',
            width: 'calc(100% - 2px)',
          }}
        >
          {/* Fallback: link para o post */}
          <div style={{ padding: '16px' }}>
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {title}
            </Link>
            <p className="text-sm text-foreground-secondary mt-2">
              Uma publicação compartilhada por Attra Veículos (@attra.veiculos)
            </p>
          </div>
        </blockquote>
      </div>
    </div>
  )
}

// Declaração de tipo para o objeto global do Instagram
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}


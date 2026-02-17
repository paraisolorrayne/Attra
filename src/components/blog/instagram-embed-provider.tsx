'use client'

import Script from 'next/script'
import { ReactNode } from 'react'

interface InstagramEmbedProviderProps {
  children: ReactNode
}

/**
 * Provider que carrega o script do Instagram uma única vez
 * Deve envolver os componentes que usam InstagramEmbed
 *
 * Uso:
 * <InstagramEmbedProvider>
 *   <InstagramEmbed url="..." />
 * </InstagramEmbedProvider>
 */
export function InstagramEmbedProvider({ children }: InstagramEmbedProviderProps) {
  return (
    <>
      {children}
      {/* Script oficial do Instagram - carregado apenas uma vez */}
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Processar embeds após o script carregar
          if (typeof window !== 'undefined' && window.instgrm) {
            window.instgrm.Embeds.process()
          }
        }}
      />
    </>
  )
}


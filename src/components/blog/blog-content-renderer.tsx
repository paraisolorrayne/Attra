'use client'

import { useMemo, useEffect, useRef, useCallback } from 'react'
import { replaceInstagramMarkersWithComponents } from '@/lib/instagram-processor'
import { InstagramEmbed } from './instagram-embed'

interface BlogContentRendererProps {
  content: string
  className?: string
  itemProp?: string
}

/**
 * Componente que renderiza conteúdo HTML de blog com suporte a embeds do Instagram
 * e tratamento gracioso de imagens quebradas/faltantes
 */
export function BlogContentRenderer({
  content,
  className = 'blog-prose',
  itemProp,
}: BlogContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Processar marcadores de Instagram e dividir conteúdo
  const parts = useMemo(() => {
    return replaceInstagramMarkersWithComponents(content)
  }, [content])

  // Tratar imagens quebradas no conteúdo HTML
  const handleBrokenImages = useCallback(() => {
    if (!containerRef.current) return
    const images = containerRef.current.querySelectorAll('img')
    images.forEach(img => {
      if (img.dataset.errorHandled) return
      img.dataset.errorHandled = 'true'
      img.onerror = () => {
        // Esconder a imagem e seu container <figure> se existir
        const figure = img.closest('figure')
        if (figure) {
          figure.style.display = 'none'
        } else {
          img.style.display = 'none'
        }
      }
      // Verificar se a imagem já falhou (para imagens que erraram antes do handler)
      if (img.complete && img.naturalWidth === 0 && img.src) {
        const figure = img.closest('figure')
        if (figure) {
          figure.style.display = 'none'
        } else {
          img.style.display = 'none'
        }
      }
    })
  }, [])

  useEffect(() => {
    handleBrokenImages()
  }, [parts, handleBrokenImages])

  return (
    <div className={className} itemProp={itemProp} ref={containerRef}>
      {parts.map((part, index) => {
        if (part.type === 'html') {
          return (
            <div
              key={index}
              dangerouslySetInnerHTML={{ __html: part.content }}
            />
          )
        }

        if (part.type === 'instagram' && part.url) {
          return (
            <InstagramEmbed
              key={index}
              url={part.url}
              title="Post do Instagram"
            />
          )
        }

        return null
      })}
    </div>
  )
}


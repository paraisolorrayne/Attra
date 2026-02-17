/**
 * Processador de embeds do Instagram
 * Substitui blockquotes com URLs do Instagram por componentes InstagramEmbed
 */

/**
 * Extrai URLs do Instagram de um elemento HTML
 * Procura por padrões como:
 * - https://www.instagram.com/p/SHORTCODE/
 * - https://instagram.com/p/SHORTCODE/
 */
function extractInstagramUrl(html: string): string | null {
  const match = html.match(/https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?/i)
  return match ? match[0] : null
}

/**
 * Verifica se um blockquote contém uma URL do Instagram
 */
function isInstagramBlockquote(blockquoteHtml: string): boolean {
  return /instagram\.com\/p\/[a-zA-Z0-9_-]+/i.test(blockquoteHtml)
}

/**
 * Processa o conteúdo HTML e substitui blockquotes do Instagram
 * por um marcador especial que será processado no cliente
 * 
 * Formato do marcador: <!--INSTAGRAM_EMBED:https://www.instagram.com/p/SHORTCODE/-->
 */
export function processInstagramEmbeds(htmlContent: string): string {
  if (!htmlContent) return htmlContent

  // Regex para encontrar blockquotes
  const blockquoteRegex = /<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi

  let processedContent = htmlContent

  // Encontrar todos os blockquotes
  const blockquotes = htmlContent.match(blockquoteRegex) || []

  for (const blockquote of blockquotes) {
    // Verificar se é um blockquote do Instagram
    if (isInstagramBlockquote(blockquote)) {
      const instagramUrl = extractInstagramUrl(blockquote)

      if (instagramUrl) {
        // Substituir o blockquote por um marcador especial
        const marker = `<!--INSTAGRAM_EMBED:${instagramUrl}-->`
        processedContent = processedContent.replace(blockquote, marker)
      }
    }
  }

  return processedContent
}

/**
 * Extrai todos os marcadores de Instagram do conteúdo
 * Retorna um array de URLs para serem renderizadas como componentes
 */
export function extractInstagramMarkers(htmlContent: string): string[] {
  const markerRegex = /<!--INSTAGRAM_EMBED:(https?:\/\/[^-]+)-->/g
  const matches = htmlContent.matchAll(markerRegex)
  const urls: string[] = []

  for (const match of matches) {
    if (match[1]) {
      urls.push(match[1])
    }
  }

  return urls
}

/**
 * Remove os marcadores de Instagram do conteúdo HTML
 * Útil se você quiser renderizar os embeds separadamente
 */
export function removeInstagramMarkers(htmlContent: string): string {
  return htmlContent.replace(/<!--INSTAGRAM_EMBED:[^-]+-->/g, '')
}

/**
 * Substitui os marcadores de Instagram por componentes React
 * Nota: Esta função é para uso em componentes client-side
 * 
 * Exemplo de uso em um componente:
 * const content = replaceInstagramMarkersWithComponents(htmlContent, InstagramEmbed)
 */
export function replaceInstagramMarkersWithComponents(
  htmlContent: string,
  markerPattern = /<!--INSTAGRAM_EMBED:(https?:\/\/[^-]+)-->/g
): Array<{ type: 'html' | 'instagram'; content: string; url?: string }> {
  const parts: Array<{ type: 'html' | 'instagram'; content: string; url?: string }> = []
  let lastIndex = 0

  const matches = Array.from(htmlContent.matchAll(markerPattern))

  for (const match of matches) {
    const matchIndex = match.index!
    const matchLength = match[0].length
    const url = match[1]

    // Adicionar HTML antes do marcador
    if (matchIndex > lastIndex) {
      parts.push({
        type: 'html',
        content: htmlContent.substring(lastIndex, matchIndex),
      })
    }

    // Adicionar marcador do Instagram
    parts.push({
      type: 'instagram',
      content: match[0],
      url,
    })

    lastIndex = matchIndex + matchLength
  }

  // Adicionar HTML restante
  if (lastIndex < htmlContent.length) {
    parts.push({
      type: 'html',
      content: htmlContent.substring(lastIndex),
    })
  }

  return parts.length > 0 ? parts : [{ type: 'html', content: htmlContent }]
}


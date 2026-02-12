/**
 * News Guardrails Service
 * Uses Gemini AI to validate if news articles are relevant for Attra's HNWI audience
 * Covers: F1, Supercars, Haute Horlogerie, High-End Finance
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.0-flash'
const API_TIMEOUT = 10000 // 10 seconds

interface ArticleValidation {
  isAutomotive: boolean // Mantido para compatibilidade - conceito expandido para "IsAttraRelevant"
  confidence: number // 0-100
  reason: string
  category?: 'formula1' | 'supercar' | 'luxury' | 'market' | 'other'
}

interface ArticleInput {
  title: string
  description: string
  source?: string
}

/**
 * Validate if an article is relevant for Attra's HNWI audience using Gemini AI
 */
export async function validateArticleWithAI(article: ArticleInput): Promise<ArticleValidation> {
  if (!GEMINI_API_KEY) {
    console.warn('[NewsGuardrails] No Gemini API key, skipping AI validation')
    return { isAutomotive: true, confidence: 50, reason: 'AI validation skipped - no API key' }
  }

  const prompt = `Você é o Editor Chefe da "Attra", uma plataforma exclusiva para indivíduos de altíssima renda (High-Net-Worth Individuals).

Sua missão é filtrar notícias para um feed que mistura:
1. Automobilismo de Elite (F1, Hypercars, Lançamentos Premium).
2. Alta Relojoaria (Rolex, Patek, Leilões, Recordes).
3. Mercado Financeiro Premium (Private Banking, Tendências de Investimento, Wealth Management) - SOMENTE notícias positivas ou analíticas, sem escândalos policiais.

Analise a seguinte notícia:
Título: "${article.title}"
Descrição: "${article.description || 'Sem descrição'}"
Fonte: "${article.source || 'Desconhecida'}"

Regras de Aprovação (Deve retornar true para 'isAutomotive'):
- É sobre supercarros ou marcas de luxo (Ferrari, Porsche, etc.)? SIM.
- É sobre Fórmula 1 (Pilotos, Tecnologia, Bastidores)? SIM.
- É sobre relógios de luxo ou joias de alto valor? SIM.
- É sobre investimentos, fusões de grandes empresas ou tendências de riqueza? SIM.

Regras de Rejeição (Deve retornar false):
- Carros populares (Gol, Onix, Uber), trânsito comum, IPVA, multas.
- Crime, polícia, roubos, mortes, tragédias.
- Fofoca de celebridades que não envolve o lifestyle de luxo.
- Política partidária polarizada ou escândalos de corrupção (a menos que afete diretamente o mercado financeiro global).
- Notícias puramente negativas ou deprimentes.

Retorne APENAS um JSON neste formato, sem markdown:
{
  "isAutomotive": boolean,
  "confidence": number,
  "reason": "string curta explicando a decisão",
  "category": "formula1" | "supercar" | "luxury" | "market" | "other"
}`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1, // Low temperature for consistent classification
            maxOutputTokens: 200,
          },
        }),
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('[NewsGuardrails] Gemini API error:', response.status)
      return { isAutomotive: true, confidence: 50, reason: 'AI validation failed - API error' }
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[NewsGuardrails] Could not parse AI response:', text)
      return { isAutomotive: true, confidence: 50, reason: 'AI validation failed - parse error' }
    }

    const result = JSON.parse(jsonMatch[0]) as ArticleValidation
    console.log(`[NewsGuardrails] "${article.title.substring(0, 50)}..." -> ${result.isAutomotive ? 'ACEITO' : 'REJEITADO'} (${result.confidence}%)`)
    
    return result
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    console.error(`[NewsGuardrails] ${isTimeout ? 'Timeout' : 'Error'}:`, error)
    return { isAutomotive: true, confidence: 50, reason: `AI validation failed - ${isTimeout ? 'timeout' : 'error'}` }
  }
}

/**
 * Batch validate multiple articles
 * Returns only the articles that pass validation
 */
export async function filterArticlesWithAI(
  articles: ArticleInput[],
  minConfidence: number = 70
): Promise<ArticleInput[]> {
  const results = await Promise.all(
    articles.map(async (article) => {
      const validation = await validateArticleWithAI(article)
      return { article, validation }
    })
  )

  return results
    .filter(({ validation }) => validation.isAutomotive && validation.confidence >= minConfidence)
    .map(({ article }) => article)
}


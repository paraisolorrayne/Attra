/**
 * News Guardrails Service
 * Uses Gemini AI to validate if news articles are truly about automotive topics
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.0-flash'
const API_TIMEOUT = 10000 // 10 seconds

interface ArticleValidation {
  isAutomotive: boolean
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
 * Validate if an article is truly about automotive topics using Gemini AI
 */
export async function validateArticleWithAI(article: ArticleInput): Promise<ArticleValidation> {
  if (!GEMINI_API_KEY) {
    console.warn('[NewsGuardrails] No Gemini API key, skipping AI validation')
    return { isAutomotive: true, confidence: 50, reason: 'AI validation skipped - no API key' }
  }

  const prompt = `Você é um especialista em classificação de notícias automotivas. Analise o seguinte artigo e determine se é REALMENTE sobre carros, automóveis, Formula 1, ou o mercado automotivo.

TÍTULO: ${article.title}
DESCRIÇÃO: ${article.description || 'Sem descrição'}
FONTE: ${article.source || 'Desconhecida'}

REGRAS DE CLASSIFICAÇÃO:
1. ACEITAR: Notícias sobre carros, modelos de veículos, lançamentos, exposições de carros, museus de carros, corridas (F1, automobilismo), mercado automotivo, vendas de veículos, tecnologia automotiva.
2. REJEITAR: Notícias sobre pessoas famosas que apenas mencionam marcas de carros (ex: "Celebridade X comprou Ferrari"), crimes envolvendo carros (roubos, acidentes fatais), notícias de fofoca/entretenimento, procedimentos estéticos, política, esportes não-automotivos.
3. REJEITAR: Se o foco principal NÃO é o veículo/automóvel em si.

Responda APENAS com um JSON válido no formato:
{
  "isAutomotive": true/false,
  "confidence": 0-100,
  "reason": "explicação breve",
  "category": "formula1" | "supercar" | "luxury" | "market" | "other"
}

Responda SOMENTE o JSON, sem markdown ou texto adicional.`

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


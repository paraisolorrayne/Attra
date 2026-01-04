#!/usr/bin/env npx ts-node
/**
 * Script para enriquecer posts de blog existentes usando Gemini AI
 *
 * Este script analisa posts do tipo 'car_review' e gera automaticamente:
 * - faq: Perguntas frequentes relevantes
 * - highlights: Destaques técnicos categorizados
 * - optionals: Equipamentos e opcionais
 * - evaluation: Avaliação Attra com resumo e potencial de investimento
 * - version, status, color: Metadados do veículo
 * - specs expandidos: weight, drivetrain, tires, brakes, etc.
 *
 * Uso: npx ts-node scripts/enhance-blog-posts.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================================
// TYPES
// ============================================================================

interface CarReviewSpecs {
  engine: string
  power: string
  torque: string
  acceleration: string
  top_speed: string
  transmission: string
  weight?: string
  drivetrain?: string
  tires?: string
  brakes?: string
  fuel_consumption?: string
  trunk_capacity?: string
}

interface CarReviewFAQ {
  question: string
  answer: string
}

interface CarReviewHighlight {
  text: string
  category?: 'performance' | 'design' | 'technology' | 'exclusivity' | 'comfort'
}

interface CarReviewEvaluation {
  summary: string
  highlights: string[]
  target_profile?: string
  investment_potential?: 'alto' | 'medio' | 'estavel'
}

interface EnhancedCarReviewFields {
  version?: string
  status?: string
  color?: string
  specs: CarReviewSpecs
  faq?: CarReviewFAQ[]
  highlights?: CarReviewHighlight[]
  optionals?: string[]
  evaluation?: CarReviewEvaluation
}

interface BlogPost {
  id: string
  post_type: string
  title: string
  slug: string
  content: string
  car_review?: {
    brand: string
    model: string
    year: number
    version?: string
    status?: string
    color?: string
    specs: CarReviewSpecs
    gallery_images: string[]
    availability: { in_stock: boolean; price?: string; stock_url?: string }
    faq?: CarReviewFAQ[]
    highlights?: CarReviewHighlight[]
    optionals?: string[]
    evaluation?: CarReviewEvaluation
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'
const API_TIMEOUT = 60000 // 60 seconds for complex prompts
const DELAY_BETWEEN_REQUESTS = 15000 // 15 seconds to avoid rate limiting
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 30000 // 30 seconds base delay for retries
const BATCH_SIZE = parseInt(process.argv[2] || '0') || 999 // Limit posts per run (0 = all)

// Paths
const BLOG_API_PATH = path.resolve(__dirname, '../src/lib/blog-api.ts')
const IMPORTED_POSTS_PATH = path.resolve(__dirname, '../src/lib/imported-blog-posts.ts')

// ============================================================================
// UTILITIES
// ============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const icons = { info: '📝', success: '✅', error: '❌', warning: '⚠️' }
  console.log(`${icons[type]} ${message}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTextContent(html: string): string {
  const text = stripHtml(html)
  // Limit to ~4000 chars to fit in context
  return text.length > 4000 ? text.substring(0, 4000) + '...' : text
}

// ============================================================================
// GEMINI API
// ============================================================================

async function callGeminiAPIWithRetry(prompt: string, retries = 0): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    log('GEMINI_API_KEY não configurada', 'error')
    return null
  }

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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)

    if (response.status === 429) {
      // Rate limit hit - retry with exponential backoff
      if (retries < MAX_RETRIES) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, retries)
        log(`Rate limit atingido. Aguardando ${delay / 1000}s antes de retry ${retries + 1}/${MAX_RETRIES}...`, 'warning')
        await sleep(delay)
        return callGeminiAPIWithRetry(prompt, retries + 1)
      } else {
        log(`Rate limit: máximo de retries atingido (${MAX_RETRIES})`, 'error')
        return null
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      log(`Erro da API Gemini: ${response.status} - ${errorText.substring(0, 200)}`, 'error')
      return null
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log(`Erro ao chamar Gemini: ${message}`, 'error')

    // Retry on network errors
    if (retries < MAX_RETRIES && (message.includes('fetch') || message.includes('network'))) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, retries)
      log(`Erro de rede. Aguardando ${delay / 1000}s antes de retry...`, 'warning')
      await sleep(delay)
      return callGeminiAPIWithRetry(prompt, retries + 1)
    }

    return null
  }
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildEnhancementPrompt(post: BlogPost): string {
  const { car_review } = post
  const textContent = extractTextContent(post.content)

  return `Você é um especialista em veículos premium e de luxo. Analise o conteúdo deste artigo sobre o ${car_review?.brand} ${car_review?.model} ${car_review?.year} e gere dados estruturados para enriquecer o template do blog.

TÍTULO: ${post.title}

CONTEÚDO DO ARTIGO:
${textContent}

---

Gere um JSON válido com a seguinte estrutura EXATA (sem markdown, apenas JSON puro):

{
  "version": "versão específica do modelo se mencionada (ex: LP640-2, Turbo S, GTS 4.0) ou null",
  "status": "status do veículo (ex: '0km • Exclusivo Attra', 'Seminovo Premium', 'Sob Encomenda')",
  "color": "cor do veículo se mencionada ou null",
  "specs": {
    "engine": "especificação do motor (ex: 6.5L V12 Naturalmente Aspirado)",
    "power": "potência com unidade (ex: 800 cv @ 8.500 rpm)",
    "torque": "torque com unidade (ex: 718 Nm @ 7.000 rpm)",
    "acceleration": "tempo 0-100 km/h (ex: 2,9s)",
    "top_speed": "velocidade máxima (ex: 340 km/h)",
    "transmission": "tipo de transmissão (ex: Automática 7 marchas DCT)",
    "weight": "peso em kg se mencionado ou null",
    "drivetrain": "tipo de tração (ex: Tração Traseira, AWD, 4x4)",
    "tires": "especificação de pneus se mencionada ou null",
    "brakes": "tipo de freios (ex: Carbono-cerâmicos) ou null"
  },
  "faq": [
    {
      "question": "Pergunta relevante sobre este modelo específico para SEO",
      "answer": "Resposta objetiva e informativa em 2-3 frases"
    }
  ],
  "highlights": [
    {
      "text": "Destaque técnico ou diferencial do veículo",
      "category": "performance|design|technology|exclusivity|comfort"
    }
  ],
  "optionals": ["Lista de equipamentos e opcionais mencionados no artigo"],
  "evaluation": {
    "summary": "Resumo da avaliação Attra em 2-3 frases focado no valor e experiência do veículo",
    "highlights": ["3-5 pontos principais de destaque para bullet points"],
    "target_profile": "Perfil ideal do comprador em uma frase",
    "investment_potential": "alto|medio|estavel"
  }
}

REGRAS IMPORTANTES:
1. Gere EXATAMENTE 4-5 perguntas FAQ relevantes para SEO
2. Gere EXATAMENTE 5-6 highlights distribuídos entre as categorias
3. Extraia TODOS os opcionais mencionados no artigo
4. Se uma informação não estiver no artigo, use null (não invente)
5. Use informações reais do artigo, não dados genéricos
6. Specs que não estão no artigo devem ser null
7. O JSON deve ser válido e parseável
8. NÃO inclua markdown, apenas JSON puro
9. Foque em termos de busca que clientes premium usariam
10. Mencione "Attra Veículos" e "Uberlândia" onde apropriado nas respostas`
}

// ============================================================================
// DATA PARSING & VALIDATION
// ============================================================================

function parseGeminiResponse(response: string): EnhancedCarReviewFields | null {
  try {
    // Remove markdown code blocks if present
    let jsonStr = response
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    // Try to find JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonStr)

    // Validate required fields
    if (!parsed.specs || typeof parsed.specs !== 'object') {
      log('Resposta sem specs válidas', 'warning')
      return null
    }

    // Validate FAQ array
    if (parsed.faq && !Array.isArray(parsed.faq)) {
      parsed.faq = []
    }

    // Validate highlights array
    if (parsed.highlights && !Array.isArray(parsed.highlights)) {
      parsed.highlights = []
    }

    // Validate optionals array
    if (parsed.optionals && !Array.isArray(parsed.optionals)) {
      parsed.optionals = []
    }

    // Validate evaluation object
    if (parsed.evaluation) {
      if (!parsed.evaluation.summary) parsed.evaluation.summary = null
      if (!Array.isArray(parsed.evaluation.highlights)) parsed.evaluation.highlights = []
      if (!['alto', 'medio', 'estavel'].includes(parsed.evaluation.investment_potential)) {
        parsed.evaluation.investment_potential = 'estavel'
      }
    }

    return parsed as EnhancedCarReviewFields
  } catch (error) {
    log(`Erro ao parsear resposta JSON: ${error}`, 'error')
    return null
  }
}

function needsEnhancement(post: BlogPost): boolean {
  if (post.post_type !== 'car_review' || !post.car_review) {
    return false
  }

  const { car_review } = post

  // Check if missing any of the new fields
  const missingNewFields =
    !car_review.faq?.length ||
    !car_review.highlights?.length ||
    !car_review.optionals?.length ||
    !car_review.evaluation?.summary

  // Check if specs are "Consultar"
  const hasConsultarSpecs = Object.values(car_review.specs || {}).some(
    val => val === 'Consultar'
  )

  return missingNewFields || hasConsultarSpecs
}


// ============================================================================
// FILE PROCESSING
// ============================================================================

function extractPostsFromFile(filePath: string): { posts: BlogPost[]; fileType: 'mock' | 'imported' } | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    if (filePath.includes('blog-api.ts')) {
      // Extract mockBlogPosts array
      const match = content.match(/const mockBlogPosts:\s*DualBlogPost\[\]\s*=\s*\[([\s\S]*?)\n\]/)
      if (!match) {
        log('Não foi possível encontrar mockBlogPosts em blog-api.ts', 'warning')
        return null
      }
      // This is complex to parse, we'll handle differently
      return { posts: [], fileType: 'mock' }
    }

    if (filePath.includes('imported-blog-posts.ts')) {
      // Parse the JSON array from the file
      const match = content.match(/export const importedBlogPosts:\s*DualBlogPost\[\]\s*=\s*(\[[\s\S]*\])/)
      if (!match) {
        log('Não foi possível encontrar importedBlogPosts', 'warning')
        return null
      }

      try {
        const posts = JSON.parse(match[1]) as BlogPost[]
        return { posts, fileType: 'imported' }
      } catch {
        log('Erro ao parsear importedBlogPosts JSON', 'error')
        return null
      }
    }

    return null
  } catch (error) {
    log(`Erro ao ler arquivo ${filePath}: ${error}`, 'error')
    return null
  }
}

function mergeEnhancedData(original: BlogPost['car_review'], enhanced: EnhancedCarReviewFields): BlogPost['car_review'] {
  if (!original) return undefined

  const mergedSpecs = { ...original.specs }

  // Only update specs that were "Consultar" or missing
  for (const [key, value] of Object.entries(enhanced.specs)) {
    if (value && value !== 'null' && value !== null) {
      const originalValue = mergedSpecs[key as keyof CarReviewSpecs]
      if (!originalValue || originalValue === 'Consultar') {
        (mergedSpecs as Record<string, string | undefined>)[key] = value as string
      }
    }
  }

  return {
    ...original,
    version: enhanced.version || original.version,
    status: enhanced.status || original.status,
    color: enhanced.color || original.color,
    specs: mergedSpecs,
    faq: enhanced.faq?.length ? enhanced.faq : original.faq,
    highlights: enhanced.highlights?.length ? enhanced.highlights : original.highlights,
    optionals: enhanced.optionals?.length ? enhanced.optionals : original.optionals,
    evaluation: enhanced.evaluation?.summary ? enhanced.evaluation : original.evaluation,
  }
}

async function enhancePost(post: BlogPost): Promise<BlogPost | null> {
  log(`Processando: ${post.title.substring(0, 60)}...`, 'info')

  const prompt = buildEnhancementPrompt(post)
  const response = await callGeminiAPIWithRetry(prompt)

  if (!response) {
    log(`Falha ao obter resposta para: ${post.id}`, 'error')
    return null
  }

  const enhanced = parseGeminiResponse(response)

  if (!enhanced) {
    log(`Falha ao parsear resposta para: ${post.id}`, 'error')
    return null
  }

  const enhancedCarReview = mergeEnhancedData(post.car_review, enhanced)

  return {
    ...post,
    car_review: enhancedCarReview,
  }
}

function updateImportedPostsFile(posts: BlogPost[]): boolean {
  try {
    const content = `// Auto-generated from WordPress import - Enhanced with AI on ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Regenerate using: npx ts-node scripts/import-wordpress-blog.ts
// Enhancement: npx ts-node scripts/enhance-blog-posts.ts

import type { DualBlogPost } from '@/types'

export const importedBlogPosts: DualBlogPost[] = ${JSON.stringify(posts, null, 2)}
`

    fs.writeFileSync(IMPORTED_POSTS_PATH, content, 'utf-8')
    log(`Arquivo atualizado: ${IMPORTED_POSTS_PATH}`, 'success')
    return true
  } catch (error) {
    log(`Erro ao escrever arquivo: ${error}`, 'error')
    return false
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n🚗 ENHANCE BLOG POSTS - Attra Veículos')
  console.log('=' .repeat(50))
  console.log(`📅 ${new Date().toLocaleString('pt-BR')}\n`)

  // Check API key
  if (!GEMINI_API_KEY) {
    log('GEMINI_API_KEY não encontrada em .env.local', 'error')
    log('Configure a variável de ambiente e tente novamente', 'info')
    process.exit(1)
  }

  log(`API Key configurada: ${GEMINI_API_KEY.substring(0, 8)}...`, 'success')

  // Load imported posts
  log('\n📂 Carregando posts importados...', 'info')
  const imported = extractPostsFromFile(IMPORTED_POSTS_PATH)

  if (!imported || !imported.posts.length) {
    log('Nenhum post encontrado em imported-blog-posts.ts', 'warning')
    process.exit(1)
  }

  log(`Encontrados ${imported.posts.length} posts no total`, 'info')

  // Filter posts that need enhancement
  let postsToEnhance = imported.posts.filter(needsEnhancement)
  log(`Posts que precisam de enriquecimento: ${postsToEnhance.length}`, 'info')

  if (postsToEnhance.length === 0) {
    log('\n✨ Todos os posts já estão enriquecidos!', 'success')
    process.exit(0)
  }

  // Limit batch size
  if (BATCH_SIZE < postsToEnhance.length) {
    log(`Limitando a ${BATCH_SIZE} posts nesta execução (use: npx ts-node scripts/enhance-blog-posts.ts [número])`, 'info')
    postsToEnhance = postsToEnhance.slice(0, BATCH_SIZE)
  }

  console.log('\n' + '─'.repeat(50))
  log('Iniciando processamento com Gemini AI...\n', 'info')

  // Process each post
  const enhancedPosts: BlogPost[] = []
  const failedPosts: string[] = []

  for (let i = 0; i < postsToEnhance.length; i++) {
    const post = postsToEnhance[i]
    console.log(`\n[${i + 1}/${postsToEnhance.length}] ${post.car_review?.brand} ${post.car_review?.model}`)

    const enhanced = await enhancePost(post)

    if (enhanced) {
      enhancedPosts.push(enhanced)
      log('Enriquecido com sucesso!', 'success')

      // Show preview of generated data
      if (enhanced.car_review?.faq?.length) {
        console.log(`   📌 FAQs geradas: ${enhanced.car_review.faq.length}`)
      }
      if (enhanced.car_review?.highlights?.length) {
        console.log(`   ⭐ Highlights: ${enhanced.car_review.highlights.length}`)
      }
      if (enhanced.car_review?.optionals?.length) {
        console.log(`   🔧 Opcionais: ${enhanced.car_review.optionals.length}`)
      }
      if (enhanced.car_review?.evaluation?.summary) {
        console.log(`   📊 Avaliação: ${enhanced.car_review.evaluation.investment_potential || 'definida'}`)
      }
    } else {
      failedPosts.push(post.id)
      log('Falha no processamento', 'error')
    }

    // Delay between requests
    if (i < postsToEnhance.length - 1) {
      await sleep(DELAY_BETWEEN_REQUESTS)
    }
  }

  // Merge enhanced posts with originals
  console.log('\n' + '─'.repeat(50))
  log('\n📝 Atualizando arquivos...', 'info')

  const updatedPosts = imported.posts.map(post => {
    const enhanced = enhancedPosts.find(e => e.id === post.id)
    return enhanced || post
  })

  // Write updated file
  const success = updateImportedPostsFile(updatedPosts)

  // Summary
  console.log('\n' + '═'.repeat(50))
  console.log('📊 RESUMO DA EXECUÇÃO')
  console.log('═'.repeat(50))
  console.log(`   Total processados: ${postsToEnhance.length}`)
  console.log(`   ✅ Sucesso: ${enhancedPosts.length}`)
  console.log(`   ❌ Falhas: ${failedPosts.length}`)

  if (failedPosts.length > 0) {
    console.log(`   IDs com falha: ${failedPosts.join(', ')}`)
  }

  if (success) {
    log('\n🎉 Processo concluído com sucesso!', 'success')
    log('Execute "npm run build" para verificar as alterações.', 'info')
  }
}

main().catch(console.error)


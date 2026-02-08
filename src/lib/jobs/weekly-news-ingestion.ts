/**
 * Weekly News Ingestion Job
 * 
 * Fetches news from GNews API, classifies them by category,
 * and stores in Supabase with weekly cache.
 * 
 * Run: Every Sunday at 00:00
 * 
 * Usage:
 * - Vercel Cron: Add to vercel.json
 * - Manual: Call /api/cron/news-ingestion endpoint
 */

import { createClient } from '@supabase/supabase-js'
import { validateArticleWithAI } from '@/lib/news-guardrails'
import { generateNewsSlug } from '@/lib/utils'

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '3fed0093c3944c90b74dd58d7110ee4e'
const GNEWS_BASE_URL = 'https://gnews.io/api/v4/search'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface GNewsArticle {
  title: string
  description: string
  content: string
  url: string
  image: string
  publishedAt: string
  source: {
    name: string
    url: string
  }
}

interface GNewsResponse {
  totalArticles: number
  articles: GNewsArticle[]
}

// Keywords for classification
const F1_KEYWORDS = ['formula 1', 'f1', 'grand prix', 'gp ', 'verstappen', 'hamilton', 'ferrari f1', 'mclaren f1', 'red bull racing', 'fia', 'pole position', 'pit stop', 'corrida de f1', 'campeonato de f1']
const PREMIUM_KEYWORDS = ['ferrari', 'lamborghini', 'porsche', 'mclaren', 'aston martin', 'bentley', 'rolls-royce', 'bugatti', 'pagani', 'koenigsegg', 'supercar', 'hypercar', 'luxury car', 'carro de luxo', 'esportivo', 'supercarro']

// Keywords that indicate the article is NOT about cars (false positives)
const EXCLUDE_KEYWORDS = [
  // People with car brand names
  'juju ferrari', 'juju', 'puerpério', 'maternidade', 'gravidez', 'grávida',
  // Crime/Police news
  'roubo', 'assalto', 'furto', 'polícia', 'pm ', 'policial', 'suspeito', 'morre', 'morte', 'baleado', 'tiro', 'crime', 'criminoso', 'preso', 'prisão', 'despejo', 'aluguel', 'alugueis',
  // Medical/Beauty
  'silicone', 'cirurgia', 'plástica', 'estética',
  // Politics/Business unrelated
  'cfo ', 'vice-presidente', 'americanas',
  // Other false positives
  'tronco', 'praça', 'homenagem', 'político',
]

// Keywords that CONFIRM the article is about cars (positive signals)
const AUTOMOTIVE_CONFIRM_KEYWORDS = [
  'museu', 'exposição', 'modelo', 'motor', 'cv', 'hp', 'cavalos', 'velocidade', 'km/h', 'mph',
  'lançamento', 'novo modelo', 'test drive', 'avaliação', 'review',
  'showroom', 'concessionária', 'vendas', 'mercado automotivo',
  'f40', 'f50', 'sf90', '812', '296', 'huracan', 'aventador', 'urus',
  '911', 'cayenne', 'taycan', 'panamera', 'macan',
  'automóvel', 'veículo', 'carro', 'esportivo', 'superesportivo',
]

/**
 * Check if an article should be excluded (not about cars)
 */
function shouldExcludeArticle(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()

  // Check for exclusion keywords
  for (const keyword of EXCLUDE_KEYWORDS) {
    if (text.includes(keyword)) {
      // But if it also has strong automotive confirmation, keep it
      const hasAutomotiveConfirm = AUTOMOTIVE_CONFIRM_KEYWORDS.some(k => text.includes(k))
      if (!hasAutomotiveConfirm) {
        return true // Exclude
      }
    }
  }

  return false // Keep
}

function classifyArticle(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase()

  // Check for F1 keywords first (more specific)
  for (const keyword of F1_KEYWORDS) {
    if (text.includes(keyword)) return 2 // formula-1
  }

  // Check for premium/luxury keywords
  for (const keyword of PREMIUM_KEYWORDS) {
    if (text.includes(keyword)) return 3 // premium-market
  }

  // Default to premium market for automotive news
  return 3
}

/**
 * Extract key terms from a title for similarity comparison
 * Removes common words and normalizes the text
 */
function extractKeyTerms(title: string): Set<string> {
  const stopWords = ['a', 'o', 'e', 'de', 'da', 'do', 'em', 'no', 'na', 'para', 'com', 'por', 'que', 'um', 'uma', 'os', 'as', 'dos', 'das', 'ao', 'à', 'é', 'são', 'foi', 'será', 'após', 'entre', 'sobre', 'como', 'mais', 'seu', 'sua', 'seus', 'suas']

  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, ' ') // Remove special chars
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))

  return new Set(normalized)
}

/**
 * Calculate Jaccard similarity between two sets of terms
 */
function calculateSimilarity(terms1: Set<string>, terms2: Set<string>): number {
  const intersection = new Set([...terms1].filter(x => terms2.has(x)))
  const union = new Set([...terms1, ...terms2])

  if (union.size === 0) return 0
  return intersection.size / union.size
}

/**
 * Check if an article is too similar to any existing article
 */
function isDuplicateArticle(
  newTitle: string,
  existingTitles: string[],
  threshold: number = 0.5
): boolean {
  const newTerms = extractKeyTerms(newTitle)

  for (const existingTitle of existingTitles) {
    const existingTerms = extractKeyTerms(existingTitle)
    const similarity = calculateSimilarity(newTerms, existingTerms)

    if (similarity >= threshold) {
      console.log(`[NewsIngestion] Duplicate detected (${(similarity * 100).toFixed(0)}% similar):`)
      console.log(`  - New: "${newTitle}"`)
      console.log(`  - Existing: "${existingTitle}"`)
      return true
    }
  }

  return false
}

async function fetchGNewsArticles(query: string, max: number = 10): Promise<GNewsArticle[]> {
  const params = new URLSearchParams({
    q: query,
    lang: 'pt',
    country: 'br',
    max: max.toString(),
    apikey: GNEWS_API_KEY,
  })

  const response = await fetch(`${GNEWS_BASE_URL}?${params}`)
  
  if (!response.ok) {
    throw new Error(`GNews API error: ${response.status} ${response.statusText}`)
  }

  const data: GNewsResponse = await response.json()
  return data.articles || []
}

function getWeekRange(): { weekStart: string; weekEnd: string } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  
  // Calculate start of week (Sunday)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  
  // Calculate end of week (Saturday)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
  }
}

export async function runWeeklyNewsIngestion(): Promise<{
  success: boolean
  cycleId?: string
  articlesInserted: number
  errors: string[]
}> {
  const errors: string[] = []
  let articlesInserted = 0
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { weekStart, weekEnd } = getWeekRange()

  console.log(`[NewsIngestion] Starting for week ${weekStart} to ${weekEnd}`)

  try {
    // 1. Check if cycle already exists for this week
    const { data: existingCycle } = await supabase
      .from('news_cycles')
      .select('*')
      .eq('week_start', weekStart)
      .eq('week_end', weekEnd)
      .single()

    let newCycle = existingCycle

    if (existingCycle) {
      console.log(`[NewsIngestion] Using existing cycle ${existingCycle.id}`)
    } else {
      // Create new cycle (inactive)
      const { data: createdCycle, error: cycleError } = await supabase
        .from('news_cycles')
        .insert({ week_start: weekStart, week_end: weekEnd, is_active: false })
        .select()
        .single()

      if (cycleError) {
        throw new Error(`Failed to create cycle: ${cycleError.message}`)
      }

      newCycle = createdCycle
      console.log(`[NewsIngestion] Created cycle ${newCycle.id}`)
    }

    if (!newCycle) {
      throw new Error('Failed to get or create cycle')
    }

    // 2. Fetch articles from GNews API
    const queries = [
      { query: 'Formula 1 OR F1 OR Grand Prix', category: 2 },
      { query: 'supercar OR hypercar OR Ferrari OR Lamborghini OR Porsche', category: 3 },
      { query: 'carro luxo OR mercado automotivo premium', category: 3 },
    ]

    const allArticles: Array<{
      article: GNewsArticle
      category_id: number
    }> = []

    for (const { query } of queries) {
      try {
        const articles = await fetchGNewsArticles(query, 10)
        articles.forEach(article => {
          // Reclassify based on actual content
          const classifiedCategory = classifyArticle(article.title, article.description)
          allArticles.push({ article, category_id: classifiedCategory })
        })
      } catch (err) {
        errors.push(`Failed to fetch "${query}": ${err}`)
      }
    }

    console.log(`[NewsIngestion] Fetched ${allArticles.length} articles`)

    // 3. Deduplicate by URL
    const seenUrls = new Set<string>()
    const uniqueArticles = allArticles.filter(({ article }) => {
      if (seenUrls.has(article.url)) return false
      seenUrls.add(article.url)
      return true
    })

    console.log(`[NewsIngestion] ${uniqueArticles.length} unique articles after URL deduplication`)

    // 3.5. Deduplicate by title similarity (avoid same story from different sources)
    const seenTitles: string[] = []
    const deduplicatedArticles = uniqueArticles.filter(({ article }) => {
      if (isDuplicateArticle(article.title, seenTitles, 0.4)) {
        return false
      }
      seenTitles.push(article.title)
      return true
    })

    console.log(`[NewsIngestion] ${deduplicatedArticles.length} unique articles after similarity deduplication`)

    // 4. Pre-filter obvious non-automotive articles (fast keyword check)
    const preFilteredArticles = deduplicatedArticles.filter(({ article }) => {
      const shouldExclude = shouldExcludeArticle(article.title, article.description)
      if (shouldExclude) {
        console.log(`[NewsIngestion] Pre-filter excluding: "${article.title.substring(0, 60)}..."`)
      }
      return !shouldExclude
    })

    console.log(`[NewsIngestion] ${preFilteredArticles.length} articles after keyword pre-filter`)

    // 5. AI Guardrails - Validate articles are truly automotive using Gemini
    const filteredArticles: typeof preFilteredArticles = []
    for (const item of preFilteredArticles) {
      const validation = await validateArticleWithAI({
        title: item.article.title,
        description: item.article.description,
        source: item.article.source.name
      })

      if (validation.isAutomotive && validation.confidence >= 70) {
        filteredArticles.push(item)
      } else {
        console.log(`[NewsIngestion] AI rejected: "${item.article.title.substring(0, 60)}..." - ${validation.reason}`)
      }
    }

    console.log(`[NewsIngestion] ${filteredArticles.length} articles after AI guardrails validation`)

    // 6. Select 3 featured articles (most recent from premium category)
    const premiumArticles = filteredArticles
      .filter(a => a.category_id === 3)
      .sort((a, b) => new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime())
      .slice(0, 3)

    console.log(`[NewsIngestion] Premium articles found: ${premiumArticles.length}`)

    // 7. Insert articles
    for (let i = 0; i < filteredArticles.length; i++) {
      const { article, category_id } = filteredArticles[i]

      // Check if this is a featured article
      const featuredIndex = premiumArticles.findIndex(p => p.article.url === article.url)
      const isFeatured = featuredIndex !== -1

      // Generate UUID for the article
      const articleId = crypto.randomUUID()
      const slug = generateNewsSlug(article.title, articleId)

      const articleData = {
        id: articleId,
        slug,
        news_cycle_id: newCycle.id,
        category_id: isFeatured ? 1 : category_id, // Featured uses category 1
        source_id: 1, // GNews
        title: article.title,
        description: article.description,
        image_url: article.image,
        source_name: article.source.name,
        original_url: article.url,
        published_at: article.publishedAt,
        is_featured: isFeatured,
        featured_order: isFeatured ? featuredIndex + 1 : null,
      }

      console.log(`[NewsIngestion] Inserting article ${i + 1}/${filteredArticles.length}: "${article.title.substring(0, 50)}..." (category: ${articleData.category_id}, featured: ${isFeatured})`)

      const { error: insertError } = await supabase
        .from('news_articles')
        .insert(articleData)

      if (insertError) {
        console.log(`[NewsIngestion] Insert error: ${insertError.code} - ${insertError.message}`)
        if (insertError.code === '23505') {
          // Duplicate URL, skip
          console.log(`[NewsIngestion] Skipping duplicate article`)
          continue
        }
        errors.push(`Failed to insert "${article.title}": ${insertError.message}`)
      } else {
        articlesInserted++
        console.log(`[NewsIngestion] Article inserted successfully`)
      }
    }

    console.log(`[NewsIngestion] Inserted ${articlesInserted} articles`)

    // 6. Activate new cycle, deactivate old
    await supabase
      .from('news_cycles')
      .update({ is_active: false })
      .neq('id', newCycle.id)

    await supabase
      .from('news_cycles')
      .update({ is_active: true })
      .eq('id', newCycle.id)

    console.log(`[NewsIngestion] Activated cycle ${newCycle.id}`)

    return {
      success: true,
      cycleId: newCycle.id,
      articlesInserted,
      errors,
    }
  } catch (error) {
    console.error('[NewsIngestion] Critical error:', error)
    return {
      success: false,
      articlesInserted,
      errors: [...errors, String(error)],
    }
  }
}


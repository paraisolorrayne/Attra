/**
 * Sanitize prices from existing blog posts in Supabase.
 *
 * Percorre `dual_blog_posts`, aplica o mesmo sanitizador usado no blog-ai
 * (remove "R$ ...", "X milhões de reais" etc), e limpa `car_review.availability.price`.
 *
 * Uso:
 *   npx tsx scripts/sanitize-blog-prices.ts              # DRY RUN (não grava)
 *   npx tsx scripts/sanitize-blog-prices.ts --apply      # grava as mudanças
 *   npx tsx scripts/sanitize-blog-prices.ts --slug=X     # filtra por slug
 *   npx tsx scripts/sanitize-blog-prices.ts --only-ai    # só posts com source='admin' (AI cron)
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { sanitizePrices } from '../src/lib/blog-ai/gemini-blog'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const APPLY = process.argv.includes('--apply')
const ONLY_AI = process.argv.includes('--only-ai')
const SLUG_FILTER = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1]

// Mesmos padrões do sanitizador — usados aqui só para *contar* / *preview* os matches
const PRICE_PATTERNS: RegExp[] = [
  /R\$\s*\d[\d.,]*\s*(?:mil(?:h[õã]o|h[õã]es|h[aã]o)?)?/gi,
  /\b[\d.,]+\s*(?:mil|milh[õã]o|milh[õã]es)\s*(?:de\s+)?reais?\b/gi,
  /\b(?:um|dois|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\s+milh[õã]es?\s*(?:de\s+)?reais?\b/gi,
  /a\s+partir\s+de\s+R\$\s*[\d.,]+/gi,
]

interface PostRow {
  id: string
  slug: string
  title: string
  content: string
  source: string | null
  car_review: { availability?: { price?: string } } & Record<string, unknown> | null
}

function findMatches(html: string): string[] {
  const all: string[] = []
  for (const re of PRICE_PATTERNS) {
    const m = html.match(re)
    if (m) all.push(...m)
  }
  return all
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios em .env.local')
    process.exit(1)
  }

  const mode = APPLY ? '🔴 APPLY (grava)' : '🟢 DRY-RUN (não grava)'
  console.log(`\n${mode}`)
  if (SLUG_FILTER) console.log(`  filtro slug: ${SLUG_FILTER}`)
  if (ONLY_AI) console.log(`  filtro: source=admin (posts gerados pela IA)`)
  console.log('')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  let query = supabase
    .from('dual_blog_posts')
    .select('id, slug, title, content, source, car_review')
    .order('published_date', { ascending: false })

  if (SLUG_FILTER) query = query.eq('slug', SLUG_FILTER)
  if (ONLY_AI) query = query.eq('source', 'admin')

  const { data, error } = await query
  if (error) {
    console.error('❌ Erro ao buscar posts:', error.message)
    process.exit(1)
  }

  const posts = (data ?? []) as PostRow[]
  console.log(`📚 ${posts.length} post(s) encontrado(s)\n`)

  let touched = 0
  let contentChanged = 0
  let priceStripped = 0

  for (const p of posts) {
    const matches = findMatches(p.content ?? '')
    const hadAvailabilityPrice = Boolean(p.car_review?.availability?.price)

    if (matches.length === 0 && !hadAvailabilityPrice) continue

    touched++
    console.log(`— ${p.slug}`)
    console.log(`  "${p.title}"`)

    if (matches.length > 0) {
      contentChanged++
      const preview = matches.slice(0, 5).map((m) => `    • ${m}`).join('\n')
      console.log(`  ${matches.length} ocorrência(s) no content:`)
      console.log(preview)
      if (matches.length > 5) console.log(`    … +${matches.length - 5}`)
    }

    if (hadAvailabilityPrice) {
      priceStripped++
      console.log(`  availability.price = "${p.car_review!.availability!.price}"`)
    }

    if (APPLY) {
      const newContent = matches.length > 0 ? sanitizePrices(p.content) : p.content
      const newCarReview = hadAvailabilityPrice
        ? (() => {
            const cr = { ...(p.car_review as Record<string, unknown>) }
            const av = { ...(cr.availability as Record<string, unknown>) }
            delete av.price
            cr.availability = av
            return cr
          })()
        : p.car_review

      const { error: updErr } = await supabase
        .from('dual_blog_posts')
        .update({
          content: newContent,
          car_review: newCarReview,
          updated_date: new Date().toISOString(),
        })
        .eq('id', p.id)

      if (updErr) console.log(`  ❌ update falhou: ${updErr.message}`)
      else console.log(`  ✅ gravado`)
    }

    console.log('')
  }

  console.log('─'.repeat(50))
  console.log(`Total analisado: ${posts.length}`)
  console.log(`Precisam de ajuste: ${touched}`)
  console.log(`  - content com preços: ${contentChanged}`)
  console.log(`  - availability.price preenchido: ${priceStripped}`)
  if (!APPLY && touched > 0) {
    console.log('\n👉 Rode novamente com --apply para gravar as mudanças')
  }
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})

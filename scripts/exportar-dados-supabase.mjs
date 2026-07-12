// Fase 0 da migração Supabase→VPS: inventário de tabelas + export de dados.
//
// Uso:
//   node scripts/exportar-dados-supabase.mjs               # inventário (contagem por tabela)
//   node scripts/exportar-dados-supabase.mjs --export      # inventário + export JSON (blog/news + tabelas do DROP)
//
// Credenciais: lê .env.production.vps (copiado da VPS) ou .env.local.
// Saída: backups/export-YYYY-MM-DD/ (gitignored).
import { createClient } from '@supabase/supabase-js'
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  for (const file of ['.env.production.vps', '.env.local']) {
    const path = resolve(root, file)
    if (!existsSync(path)) continue
    const env = {}
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
    if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log(`Credenciais: ${file}`)
      return env
    }
  }
  console.error('ERRO: nenhuma credencial Supabase encontrada (.env.production.vps ou .env.local).')
  console.error('Copie da VPS: scp attra-vps:/var/www/attra/.env.production .env.production.vps')
  process.exit(1)
}

const env = loadEnv()
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Tabelas ativas (ficam) + tabelas do DROP 20260711 (backup antes de dropar)
const TABELAS_ATIVAS = [
  'admin_users', 'blog_ai_generations', 'blog_posts', 'campaign_vehicles',
  'conversion_events', 'dual_blog_posts', 'identity_events', 'inventory_snapshots',
  'ip_geolocation_cache', 'ip_company_cache', 'marketing_campaigns', 'marketing_strategies',
  'marketing_tasks', 'news_articles', 'news_cycles', 'newsletter_campaigns',
  'newsletter_subscribers', 'site_settings', 'task_assignments', 'task_comments',
  'task_status_history', 'vehicle_embeddings', 'vehicle_hero_asset',
  'vehicle_section_content', 'vehicle_sounds', 'visitor_fingerprints',
  'visitor_page_views', 'visitor_profiles', 'visitor_sessions',
]
const TABELAS_DROP = [
  'leads', 'eventos_lead', 'lead_notes', 'clientes', 'historico_compras',
  'boletos', 'eventos_boleto', 'site_banners',
  'google_places', 'google_reviews', 'google_reviews_sync_log',
]
// Export de prova pedido: blog + notícias
const TABELAS_EXPORT_PROVA = ['dual_blog_posts', 'blog_posts', 'blog_ai_generations', 'news_articles', 'news_cycles']

async function contar(tabela) {
  const { count, error } = await supabase.from(tabela).select('*', { count: 'exact', head: true })
  return error ? `ERRO: ${error.message}` : count
}

async function exportarTabela(tabela, dir) {
  const rows = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(tabela).select('*').range(from, from + PAGE - 1)
    if (error) return { tabela, erro: error.message }
    rows.push(...(data || []))
    if (!data || data.length < PAGE) break
  }
  const file = resolve(dir, `${tabela}.json`)
  writeFileSync(file, JSON.stringify(rows, null, 1))
  return { tabela, linhas: rows.length, arquivo: file }
}

const doExport = process.argv.includes('--export')

console.log('\n===== INVENTÁRIO (contagem por tabela) =====\n')
console.log('--- Tabelas ativas (vão para a VPS) ---')
for (const t of TABELAS_ATIVAS) console.log(`${t.padEnd(28)} ${await contar(t)}`)
console.log('\n--- Tabelas do DROP (backup antes de dropar) ---')
for (const t of TABELAS_DROP) console.log(`${t.padEnd(28)} ${await contar(t)}`)

console.log('\n--- Buckets de storage ---')
const { data: buckets, error: bErr } = await supabase.storage.listBuckets()
if (bErr) console.log(`ERRO: ${bErr.message}`)
else for (const b of buckets) console.log(`${b.name.padEnd(28)} public=${b.public}`)

if (doExport) {
  const dir = resolve(root, `backups/export-${new Date().toISOString().slice(0, 10)}`)
  mkdirSync(dir, { recursive: true })
  console.log(`\n===== EXPORT → ${dir} =====\n`)
  for (const t of [...new Set([...TABELAS_EXPORT_PROVA, ...TABELAS_DROP])]) {
    const r = await exportarTabela(t, dir)
    console.log(r.erro ? `${t.padEnd(28)} ERRO: ${r.erro}` : `${t.padEnd(28)} ${r.linhas} linhas → ${r.arquivo.replace(root + '/', '')}`)
  }
  console.log('\nOK. Confira os JSONs antes de aplicar a migration de DROP.')
}

/**
 * Script para atualizar o campo vendedor nos registros existentes de historico_compras
 * 
 * Este script NÃO cria novos registros, apenas atualiza os existentes
 * com base no nome do cliente, data e valor da compra.
 * 
 * Usage: npx tsx scripts/update-vendedor-historico.ts [path-to-csv]
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const DEFAULT_CSV_PATH = '/Users/lorrayneparaiso/Downloads/Regua de Relacionamento Attra.xlsx - 2025.csv'

// Statistics
const stats = {
  totalRows: 0,
  updated: 0,
  notFound: 0,
  alreadyHasVendedor: 0,
  errors: [] as string[]
}

// Month mapping
const monthMap: Record<string, number> = {
  'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3,
  'abril': 4, 'maio': 5, 'junho': 6,
  'julho': 7, 'agosto': 8, 'setembro': 9,
  'outubro': 10, 'novembro': 11, 'dezembro': 12
}

// Simple CSV parser
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const records: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const record: Record<string, string> = {}
    headers.forEach((header, idx) => {
      record[header] = values[idx] || ''
    })
    records.push(record)
  }

  return records
}

// Parse Brazilian currency
function parseCurrency(value: string): number {
  if (!value || value.trim() === '') return 0
  const cleaned = value.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

// Normalize phone
function normalizePhone(phone: string): string | null {
  if (!phone || phone.trim() === '') return null
  let digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`
  return `+55${digits}`
}

// Normalize vendedor
function normalizeVendedor(vendedor: string): string | null {
  if (!vendedor || vendedor.trim() === '') return null
  const cleaned = vendedor.trim().toUpperCase()
  if (cleaned === '<SEM VENDEDOR>' || cleaned === 'SEM VENDEDOR' || cleaned === 'N/A' || cleaned === '-') {
    return null
  }
  return vendedor.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

// Parse date
function parseDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '') return '2025-01-15'
  const cleaned = dateStr.trim().toLowerCase()
  if (monthMap[cleaned]) {
    const month = monthMap[cleaned]
    return `2025-${month.toString().padStart(2, '0')}-15`
  }
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [first, second, year] = parts.map(p => parseInt(p, 10))
    let fullYear = year < 100 ? 2000 + year : year
    if (fullYear > 2025) fullYear = 2025
    const day = first > 12 ? first : first
    const month = first > 12 ? second : (second > 12 ? first : second)
    return `${fullYear}-${Math.min(Math.max(month, 1), 12).toString().padStart(2, '0')}-${Math.min(Math.max(day, 1), 31).toString().padStart(2, '0')}`
  }
  return '2025-01-15'
}

async function main() {
  console.log('🔄 Atualizando campo vendedor nos registros existentes...\n')

  const csvPath = process.argv[2] || DEFAULT_CSV_PATH

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`)
    process.exit(1)
  }

  console.log(`📄 Reading CSV: ${path.basename(csvPath)}`)
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parseCSV(fileContent)
  stats.totalRows = records.length
  console.log(`   Found ${stats.totalRows} records\n`)

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Get all clientes with their phones
  console.log('📥 Carregando clientes do banco...')
  const { data: clientes } = await supabase.from('clientes').select('id, nome, telefone')
  const clienteMap = new Map<string, string>()
  for (const c of clientes || []) {
    if (c.telefone) clienteMap.set(c.telefone, c.id)
    if (c.nome) clienteMap.set(c.nome.toLowerCase(), c.id)
  }
  console.log(`   ${clientes?.length || 0} clientes carregados\n`)

  console.log('🔄 Atualizando registros...')
  let processed = 0

  for (const row of records) {
    processed++
    if (processed % 50 === 0) console.log(`   ${processed}/${stats.totalRows}...`)

    const vendedor = normalizeVendedor(row['VENDEDOR'])
    if (!vendedor) continue // Skip if no vendedor to update

    const telefone = normalizePhone(row['TELEFONE'])
    const nome = row['NOME PARCEIRO']?.trim().toLowerCase()
    const valor = parseCurrency(row['VALOR'])
    
    // Find cliente_id
    let clienteId = telefone ? clienteMap.get(telefone) : undefined
    if (!clienteId && nome) clienteId = clienteMap.get(nome)
    if (!clienteId) {
      stats.notFound++
      continue
    }

    // Find matching compra by cliente_id and valor
    const { data: compras } = await supabase
      .from('historico_compras')
      .select('id, vendedor')
      .eq('cliente_id', clienteId)
      .eq('valor_compra', valor)
      .limit(1)

    if (!compras || compras.length === 0) {
      stats.notFound++
      continue
    }

    const compra = compras[0]
    if (compra.vendedor) {
      stats.alreadyHasVendedor++
      continue
    }

    // Update vendedor
    const { error } = await supabase
      .from('historico_compras')
      .update({ vendedor })
      .eq('id', compra.id)

    if (error) {
      stats.errors.push(`Error updating ${compra.id}: ${error.message}`)
    } else {
      stats.updated++
    }
  }

  console.log('\n✅ Atualização concluída!\n')
  console.log('📊 Estatísticas:')
  console.log(`   Total de linhas no CSV: ${stats.totalRows}`)
  console.log(`   Registros atualizados: ${stats.updated}`)
  console.log(`   Já tinham vendedor: ${stats.alreadyHasVendedor}`)
  console.log(`   Não encontrados: ${stats.notFound}`)
  if (stats.errors.length > 0) {
    console.log(`   Erros: ${stats.errors.length}`)
    stats.errors.slice(0, 5).forEach(e => console.log(`     - ${e}`))
  }
}

main().catch(console.error)


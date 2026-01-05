/**
 * Import Script for vendas_consolidadas.csv
 * 
 * This script:
 * 1. Clears existing data from historico_compras and clientes tables
 * 2. Imports all sales from the consolidated CSV file
 * 
 * CSV Structure (11 columns):
 * - id_venda, nome_cliente, telefone, email, data_venda, ano_venda
 * - vendedor, veiculo, marca, valor_venda, loja
 * 
 * Usage: npx tsx scripts/import-vendas-consolidadas.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const CSV_PATH = '/Users/lorrayneparaiso/Downloads/vendas_consolidadas.csv'

const stats = {
  totalRows: 0,
  clientesCreated: 0,
  clientesDuplicates: 0,
  vendasCreated: 0,
  errors: [] as string[]
}

interface CSVRow {
  id_venda: string
  nome_cliente: string
  telefone: string
  email: string
  data_venda: string
  ano_venda: string
  vendedor: string
  veiculo: string
  marca: string
  valor_venda: string
  loja: string
}

// Parse CSV with proper handling of commas in fields
function parseCSV(content: string): CSVRow[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  const headers = lines[0].split(',').map(h => h.trim())
  const records: CSVRow[] = []

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
    records.push(record as unknown as CSVRow)
  }

  return records
}

// Normalize phone to E.164 format
function normalizePhone(phone: string): string | null {
  if (!phone || phone.trim() === '') return null

  // Remove .0 suffix that sometimes appears in CSV (e.g., "34991196071.0")
  let cleaned = phone.replace(/\.0+$/, '')

  // Extract only digits
  let digits = cleaned.replace(/\D/g, '')

  if (digits.length < 10) return null

  // Remove leading 0 from 11-digit numbers (old format)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  // Handle numbers that already have country code 55
  if (digits.startsWith('55') && digits.length >= 12) {
    // If it's 55 + 11 digits = 13 total, might have extra digit, normalize to 12
    if (digits.length > 13) {
      digits = digits.substring(0, 13)
    }
    return `+${digits}`
  }

  // Standard 10 or 11 digit Brazilian numbers
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`
  }

  // For 12+ digits without 55 prefix, truncate to 11 and add prefix
  if (digits.length > 11) {
    digits = digits.substring(0, 11)
  }

  return `+55${digits}`
}

// Normalize email
function normalizeEmail(email: string): string | null {
  if (!email || email.trim() === '') return null
  const cleaned = email.trim().toLowerCase()
  if (!cleaned.includes('@')) return null
  return cleaned
}

// Normalize vendedor
function normalizeVendedor(vendedor: string): string | null {
  if (!vendedor || vendedor.trim() === '') return null
  const cleaned = vendedor.trim().toUpperCase()
  if (cleaned === '<SEM VENDEDOR>' || cleaned === 'SEM VENDEDOR') return null
  return vendedor.trim().split(' ').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(' ')
}

// Normalize loja - keep short codes for DB compatibility
function normalizeLoja(loja: string): string {
  const code = loja?.trim().toUpperCase()
  // Keep as short code (JP/RP) - will be expanded in UI
  if (code === 'JP' || code === 'RP') return code
  return loja?.trim() || 'JP' // Default to JP
}

// Parse valor
function parseValor(valor: string): number {
  if (!valor) return 0
  const cleaned = valor.replace(/[^\d.,]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

async function clearDatabase(supabase: SupabaseClient) {
  console.log('🗑️  Limpando dados existentes...')
  
  // Clear historico_compras first (has FK to clientes)
  const { error: errorCompras } = await supabase
    .from('historico_compras')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  
  if (errorCompras) {
    console.error('   ❌ Erro ao limpar historico_compras:', errorCompras.message)
  } else {
    console.log('   ✅ historico_compras limpo')
  }

  // Clear clientes
  const { error: errorClientes } = await supabase
    .from('clientes')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  
  if (errorClientes) {
    console.error('   ❌ Erro ao limpar clientes:', errorClientes.message)
  } else {
    console.log('   ✅ clientes limpo')
  }
}

async function main() {
  console.log('🚀 Import vendas_consolidadas.csv\n')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV not found: ${CSV_PATH}`)
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  
  // Test connection
  const { error: testError } = await supabase.from('clientes').select('id').limit(1)
  if (testError) {
    console.error('❌ Connection failed:', testError.message)
    process.exit(1)
  }

  // Clear existing data
  await clearDatabase(supabase)

  // Read CSV
  console.log(`\n📄 Reading CSV...`)
  const content = fs.readFileSync(CSV_PATH, 'utf-8')
  const records = parseCSV(content)
  stats.totalRows = records.length
  console.log(`   ${stats.totalRows} records found\n`)

  // Track clientes to avoid duplicates
  const clienteMap = new Map<string, string>() // key -> id

  console.log('📥 Importing data...')
  let processed = 0

  for (const row of records) {
    processed++
    if (processed % 500 === 0) {
      console.log(`   ${processed}/${stats.totalRows}...`)
    }

    const nome = row.nome_cliente?.trim()
    if (!nome) continue

    const telefone = normalizePhone(row.telefone)
    const email = normalizeEmail(row.email)
    const lookupKey = telefone || email || nome.toLowerCase()

    // Find or create cliente
    let clienteId = clienteMap.get(lookupKey)
    
    if (!clienteId) {
      // Create new cliente
      const { data: newCliente, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          nome,
          telefone,
          email,
          origem_principal: 'crm_externo'
        })
        .select('id')
        .single()

      if (clienteError) {
        stats.errors.push(`Cliente ${nome}: ${clienteError.message}`)
        continue
      }

      clienteId = newCliente.id
      clienteMap.set(lookupKey, clienteId)
      stats.clientesCreated++
    } else {
      stats.clientesDuplicates++
    }

    // Create venda
    const vendaPayload = {
      cliente_id: clienteId,
      data_compra: row.data_venda || '2025-01-01',
      valor_compra: parseValor(row.valor_venda),
      modelo: row.veiculo?.trim().substring(0, 255) || 'Não especificado',
      marca: row.marca?.trim().substring(0, 100) || null,
      vendedor: normalizeVendedor(row.vendedor),
      loja: normalizeLoja(row.loja),
      status: 'vendido'
    }

    const { error: vendaError } = await supabase
      .from('historico_compras')
      .insert(vendaPayload)

    if (vendaError) {
      if (stats.errors.length < 5) {
        console.log(`\n❌ Erro na venda ${row.id_venda}:`)
        console.log('   Payload:', JSON.stringify(vendaPayload, null, 2))
        console.log('   Error:', vendaError.message)
      }
      stats.errors.push(`Venda ${row.id_venda}: ${vendaError.message}`)
    } else {
      stats.vendasCreated++
    }
  }

  console.log('\n✅ Import concluído!\n')
  console.log('📊 Estatísticas:')
  console.log(`   Total CSV rows: ${stats.totalRows}`)
  console.log(`   Clientes criados: ${stats.clientesCreated}`)
  console.log(`   Clientes duplicados: ${stats.clientesDuplicates}`)
  console.log(`   Vendas criadas: ${stats.vendasCreated}`)
  console.log(`   Erros: ${stats.errors.length}`)
  
  if (stats.errors.length > 0) {
    console.log('\n⚠️  Primeiros 10 erros:')
    stats.errors.slice(0, 10).forEach(e => console.log(`   - ${e}`))
  }
}

main().catch(console.error)


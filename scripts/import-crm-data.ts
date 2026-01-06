/**
 * CRM Data Import Script
 * 
 * Imports sales data from "Regua de Relacionamento" spreadsheet into the CRM.
 * 
 * Source: Regua de Relacionamento Attra.xlsx - 2025.csv
 * 
 * CSV Columns:
 * - NOME PARCEIRO: Customer name
 * - TELEFONE: Phone number
 * - E-MAIL: Email
 * - DATA: Sale date (various formats)
 * - VENDEDOR: Salesperson
 * - VEÍCULO: Vehicle description
 * - VALOR: Sale value (Brazilian format)
 * - LOJA: Store code (RP = Rondon Pacheco)
 * 
 * Usage: npx tsx scripts/import-crm-data.ts [path-to-csv]
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Simple CSV parser (no external dependency needed)
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) return []

  // Parse header
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

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Default CSV path
const DEFAULT_CSV_PATH = '/Users/lorrayneparaiso/Downloads/Regua de Relacionamento Attra.xlsx - 2025.csv'

// Statistics tracking
const stats = {
  totalRows: 0,
  clientesCreated: 0,
  clientesDuplicates: 0,
  comprasCreated: 0,
  errors: [] as string[]
}

// Month name to number mapping (Portuguese)
const monthMap: Record<string, number> = {
  'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3,
  'abril': 4, 'maio': 5, 'junho': 6,
  'julho': 7, 'agosto': 8, 'setembro': 9,
  'outubro': 10, 'novembro': 11, 'dezembro': 12
}

interface CSVRow {
  'NOME PARCEIRO': string
  'TELEFONE': string
  'E-MAIL': string
  'DATA': string
  'VENDEDOR': string
  'VEÍCULO': string
  'VALOR': string
  'LOJA': string
}

interface ClienteRecord {
  id?: string
  nome: string
  telefone: string | null
  email: string | null
  origem_principal: 'site' | 'whatsapp' | 'indicacao' | 'crm_externo'
}

interface CompraRecord {
  cliente_id: string
  data_compra: string
  valor_compra: number
  modelo: string
  marca: string | null
  categoria: string | null
  loja: string | null
  vendedor: string | null
  status: 'ativo' | 'vendido' | 'trocado'
}

/**
 * Normalize phone number to E.164 international format
 * Brazilian phones: +55 + DDD (2 digits) + number (8-9 digits)
 * Example: 034 991450045 -> +5534991450045
 */
function normalizePhone(phone: string): string | null {
  if (!phone || phone.trim() === '') return null

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '')

  // Skip invalid phones
  if (digits.length < 10 || digits === '0000000000' || digits.startsWith('00')) {
    return null
  }

  // Remove leading 0 from DDD if present (e.g., 034 -> 34)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1)
  } else if (digits.length === 12 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  // If already has country code 55, just add +
  if (digits.startsWith('55') && digits.length >= 12) {
    return `+${digits}`
  }

  // Add Brazil country code +55
  // Valid Brazilian numbers: 10 digits (landline) or 11 digits (mobile)
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`
  }

  // Return with +55 prefix anyway for other cases
  return `+55${digits}`
}

/**
 * Normalize email
 */
function normalizeEmail(email: string): string | null {
  if (!email || email.trim() === '') return null
  const cleaned = email.trim().toLowerCase()
  if (!cleaned.includes('@')) return null
  return cleaned
}

/**
 * Parse Brazilian currency format to number
 * "R$ 280.000,00" -> 280000
 */
function parseCurrency(value: string): number {
  if (!value || value.trim() === '') return 0
  
  // Remove R$, spaces, dots and convert comma to dot
  const cleaned = value
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  
  return parseFloat(cleaned) || 0
}

/**
 * Parse date from various formats
 * IMPORTANT: All sales should be in 2025, not 2026
 */
function parseDate(dateStr: string): string {
  if (!dateStr || dateStr.trim() === '') {
    return '2025-01-15' // Default to mid-January 2025
  }

  const cleaned = dateStr.trim().toLowerCase()

  // Check if it's a month name (e.g., "Janeiro", "dezembro")
  if (monthMap[cleaned]) {
    const month = monthMap[cleaned]
    // All sales are from 2025
    return `2025-${month.toString().padStart(2, '0')}-15`
  }

  // Check if it's in DD/MM/YYYY format (Brazilian standard)
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    let [first, second, year] = parts.map(p => parseInt(p, 10))
    // Handle 2-digit years
    let fullYear = year < 100 ? 2000 + year : year

    // VALIDATION: No sales from 2026, cap at 2025
    if (fullYear > 2025) {
      fullYear = 2025
    }

    // Brazilian format: DD/MM/YYYY
    // If first number > 12, it must be the day
    // If second number > 12, it must be the day (swap)
    let day: number, month: number
    if (first > 12) {
      // First is definitely day (e.g., 24/11/2025)
      day = first
      month = second
    } else if (second > 12) {
      // Second is definitely day, so first is month (unusual but handle it)
      day = second
      month = first
    } else {
      // Both are ≤12, assume DD/MM (Brazilian standard)
      day = first
      month = second
    }

    // Validate and clamp values
    month = Math.min(Math.max(month, 1), 12)
    day = Math.min(Math.max(day, 1), 31)

    return `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  // Default to January 2025
  return '2025-01-15'
}

/**
 * Normalize vendedor (salesperson) field
 * "<SEM VENDEDOR>" or empty should be treated as null (will display as "Não informado")
 */
function normalizeVendedor(vendedor: string): string | null {
  if (!vendedor || vendedor.trim() === '') return null

  const cleaned = vendedor.trim().toUpperCase()

  // Handle "<SEM VENDEDOR>" or similar
  if (cleaned === '<SEM VENDEDOR>' ||
      cleaned === 'SEM VENDEDOR' ||
      cleaned === 'N/A' ||
      cleaned === 'NA' ||
      cleaned === '-') {
    return null
  }

  // Capitalize first letter of each word
  return vendedor.trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Extract brand from vehicle name
 */
function extractBrand(vehicle: string): string | null {
  const brands = [
    'FERRARI', 'PORSCHE', 'BMW', 'MERCEDES', 'AUDI', 'LAND ROVER', 'RANGE ROVER',
    'JAGUAR', 'LAMBORGHINI', 'MASERATI', 'BENTLEY', 'ROLLS ROYCE',
    'JEEP', 'RAM', 'DODGE', 'TOYOTA', 'HONDA', 'VOLKSWAGEN', 'CHEVROLET',
    'FORD', 'NISSAN', 'MITSUBISHI', 'HYUNDAI', 'KIA', 'VOLVO', 'PEUGEOT',
    'CAOA CHERY', 'CHERY', 'FIAT', 'RENAULT', 'CITROEN', 'TROLLER'
  ]
  
  const upperVehicle = vehicle.toUpperCase()
  for (const brand of brands) {
    if (upperVehicle.includes(brand)) {
      return brand
    }
  }
  
  // Try first word as brand
  const firstWord = vehicle.split(' ')[0].toUpperCase()
  if (firstWord.length > 2) {
    return firstWord
  }

  return null
}

/**
 * Extract category from vehicle name
 */
function extractCategory(vehicle: string): string | null {
  const upperVehicle = vehicle.toUpperCase()

  if (upperVehicle.includes('SUV') || upperVehicle.includes('DISCOVERY') ||
      upperVehicle.includes('DEFENDER') || upperVehicle.includes('EVOQUE') ||
      upperVehicle.includes('CAYENNE') || upperVehicle.includes('X1') ||
      upperVehicle.includes('X2') || upperVehicle.includes('X3') ||
      upperVehicle.includes('X4') || upperVehicle.includes('X5') ||
      upperVehicle.includes('X6') || upperVehicle.includes('X7') ||
      upperVehicle.includes('GLA') || upperVehicle.includes('GLB') ||
      upperVehicle.includes('GLC') || upperVehicle.includes('GLE') ||
      upperVehicle.includes('GLS') || upperVehicle.includes('COMPASS') ||
      upperVehicle.includes('RENEGADE') || upperVehicle.includes('VELAR') ||
      upperVehicle.includes('Q3') || upperVehicle.includes('Q5') ||
      upperVehicle.includes('Q7') || upperVehicle.includes('Q8') ||
      upperVehicle.includes('TIGGO') || upperVehicle.includes('CRETA') ||
      upperVehicle.includes('FRONTIER') || upperVehicle.includes('S10') ||
      upperVehicle.includes('AMAROK') || upperVehicle.includes('SW4') ||
      upperVehicle.includes('TRITON') || upperVehicle.includes('RANGER')) {
    return 'SUV/Pickup'
  }

  if (upperVehicle.includes('FERRARI') || upperVehicle.includes('LAMBORGHINI') ||
      upperVehicle.includes('911') || upperVehicle.includes('GT') ||
      upperVehicle.includes('AMG') || upperVehicle.includes('M2') ||
      upperVehicle.includes('M3') || upperVehicle.includes('M4') ||
      upperVehicle.includes('M5') || upperVehicle.includes('M6') ||
      upperVehicle.includes('M8') || upperVehicle.includes('MUSTANG') ||
      upperVehicle.includes('BOXSTER') || upperVehicle.includes('CAYMAN') ||
      upperVehicle.includes('SL') || upperVehicle.includes('Z4')) {
    return 'Esportivo'
  }

  if (upperVehicle.includes('SEDAN') || upperVehicle.includes('320') ||
      upperVehicle.includes('330') || upperVehicle.includes('530') ||
      upperVehicle.includes('C200') || upperVehicle.includes('C300') ||
      upperVehicle.includes('E300') || upperVehicle.includes('A4') ||
      upperVehicle.includes('A6') || upperVehicle.includes('COROLLA') ||
      upperVehicle.includes('CIVIC') || upperVehicle.includes('VIRTUS')) {
    return 'Sedan'
  }

  if (upperVehicle.includes('HÍBRID') || upperVehicle.includes('HYBRID') ||
      upperVehicle.includes('PHEV') || upperVehicle.includes('E-HYBRID') ||
      upperVehicle.includes('330E') || upperVehicle.includes('ELÉTRIC')) {
    return 'Híbrido/Elétrico'
  }

  return 'Outros'
}

/**
 * Find or create customer
 */
async function findOrCreateCliente(
  supabase: SupabaseClient,
  row: CSVRow,
  existingClientes: Map<string, string>
): Promise<string | null> {
  const nome = row['NOME PARCEIRO']?.trim()
  if (!nome) return null

  const telefone = normalizePhone(row['TELEFONE'])
  const email = normalizeEmail(row['E-MAIL'])

  // Create a lookup key
  const lookupKey = telefone || email || nome.toLowerCase()

  // Check if we already processed this customer
  if (existingClientes.has(lookupKey)) {
    stats.clientesDuplicates++
    return existingClientes.get(lookupKey)!
  }

  // Check if customer exists in database
  let existingId: string | null = null

  if (telefone) {
    const { data } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefone', telefone)
      .single()
    if (data) existingId = (data as { id: string }).id
  }

  if (!existingId && email) {
    const { data } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', email)
      .single()
    if (data) existingId = (data as { id: string }).id
  }

  if (existingId) {
    existingClientes.set(lookupKey, existingId)
    stats.clientesDuplicates++
    return existingId
  }

  // Create new customer
  const clienteData: ClienteRecord = {
    nome,
    telefone,
    email,
    origem_principal: 'crm_externo'
  }

  const { data: newCliente, error } = await supabase
    .from('clientes')
    .insert(clienteData as unknown as Record<string, unknown>)
    .select('id')
    .single()

  if (error) {
    stats.errors.push(`Failed to create cliente "${nome}": ${error.message}`)
    return null
  }

  const clienteId = (newCliente as { id: string }).id
  existingClientes.set(lookupKey, clienteId)
  stats.clientesCreated++
  return clienteId
}

/**
 * Create purchase history record
 */
async function createCompra(
  supabase: SupabaseClient,
  clienteId: string,
  row: CSVRow
): Promise<boolean> {
  const vehicle = row['VEÍCULO']?.trim() || 'Veículo não especificado'
  const valor = parseCurrency(row['VALOR'])
  const dataCompra = parseDate(row['DATA'])
  const marca = extractBrand(vehicle)
  const categoria = extractCategory(vehicle)
  const loja = row['LOJA']?.trim() || null
  const vendedor = normalizeVendedor(row['VENDEDOR'])

  const compraData: CompraRecord = {
    cliente_id: clienteId,
    data_compra: dataCompra,
    valor_compra: valor,
    modelo: vehicle,
    marca,
    categoria,
    loja,
    vendedor,
    status: 'vendido'
  }

  const { error } = await supabase
    .from('historico_compras')
    .insert(compraData as unknown as Record<string, unknown>)

  if (error) {
    stats.errors.push(`Failed to create compra for cliente ${clienteId}: ${error.message}`)
    return false
  }

  stats.comprasCreated++
  return true
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting CRM Data Import...\n')

  // Get CSV path from args or use default
  const csvPath = process.argv[2] || DEFAULT_CSV_PATH

  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  // Check if file exists
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`)
    process.exit(1)
  }

  console.log(`📄 Reading CSV: ${path.basename(csvPath)}`)

  // Read and parse CSV
  const fileContent = fs.readFileSync(csvPath, 'utf-8')
  const rawRecords = parseCSV(fileContent)
  const records = rawRecords as unknown as CSVRow[]

  stats.totalRows = records.length
  console.log(`   Found ${stats.totalRows} records\n`)

  // Connect to Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Test connection
  console.log('🔗 Testing Supabase connection...')
  const { error: testError } = await supabase.from('clientes').select('id').limit(1)
  if (testError) {
    console.error('❌ Failed to connect to Supabase:', testError.message)
    console.error('   Make sure the CRM tables exist (run migrations first)')
    process.exit(1)
  }
  console.log('   ✅ Connected!\n')

  // Track existing customers to avoid duplicates
  const existingClientes = new Map<string, string>()

  // Process each row
  console.log('📥 Importing data...')
  let processed = 0

  for (const row of records) {
    processed++

    // Show progress every 50 records
    if (processed % 50 === 0) {
      console.log(`   Processing ${processed}/${stats.totalRows}...`)
    }

    // Skip rows without customer name
    if (!row['NOME PARCEIRO'] || row['NOME PARCEIRO'].trim() === '') {
      stats.errors.push(`Row ${processed}: Missing customer name`)
      continue
    }

    // Find or create customer
    const clienteId = await findOrCreateCliente(supabase, row, existingClientes)
    if (!clienteId) {
      continue
    }

    // Create purchase record
    await createCompra(supabase, clienteId, row)
  }

  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Import Summary')
  console.log('='.repeat(50))
  console.log(`   Total rows processed: ${stats.totalRows}`)
  console.log(`   Customers created:    ${stats.clientesCreated}`)
  console.log(`   Customers merged:     ${stats.clientesDuplicates}`)
  console.log(`   Purchases created:    ${stats.comprasCreated}`)
  console.log(`   Errors:               ${stats.errors.length}`)

  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors:')
    // Show first 10 errors
    stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`))
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more`)
    }
  }

  console.log('\n🎉 Import complete!')
}

// Run the import
main().catch(err => {
  console.error('❌ Import failed:', err)
  process.exit(1)
})


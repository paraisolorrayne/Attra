/**
 * AutoConf API Integration
 * Handles fetching vehicle data from AutoConf API
 */

import { Vehicle } from '@/types'
import { realInventoryVehicles } from './vehicle-inventory-data'

// AutoConf API Types
export interface AutoConfVehicle {
  id: number
  modelo_id: number
  modelo_nome: string
  modelo_slug: string
  modelopai_id: number
  modelopai_nome: string
  modelopai_slug: string
  marca_id: number
  marca_nome: string
  marca_slug: string
  tipo_id: number
  tipo_nome: string
  tipo_slug: string
  cor_id: number
  cor_nome: string
  cor_slug: string
  combustivel_id: number
  combustivel_nome: string
  combustivel_slug: string
  cambio_id: number
  cambio_nome: string
  cambio_slug: string
  carroceria_id: number | null
  carroceria_nome: string | null
  carroceria_slug: string | null
  anofabricacao: string
  anomodelo: string
  km: number
  potencia: number | null
  valorvenda: string
  valorpromocao: string | null
  zero_km: number
  foto: string
  fotos: Array<{ url: string }>
  versao_descricao: string | null
  acessorios: Array<{ nome: string; id: number; categoria: string | null; destaque: number; slug: string }>
  acessorios_destaque: Array<{ nome: string; id: number; categoria: string | null; destaque: number; slug: string }>
  filtro: string
  filtroTipo: string
  prioridade: number
  prioridade_veiculo: number
  status_id: number
  publicacao: string
  placa: string
  placa_completa: string
  sugestoes: number[]
  favorito: boolean
}

/**
 * Clean version string by removing model name prefix and technical specs
 * Example: "911 Turbo S Coupe 3.6/3.8 24V (991/992)" with model "911"
 * Returns: "Turbo S Coupe"
 */
export function cleanVersionString(modeloNome: string, modeloPaiNome: string): string | null {
  if (!modeloNome || modeloNome === modeloPaiNome) {
    return null
  }

  let version = modeloNome

  // Remove model name prefix if version starts with it
  const modelLower = modeloPaiNome.toLowerCase()
  const versionLower = version.toLowerCase()

  if (versionLower.startsWith(modelLower)) {
    version = version.substring(modeloPaiNome.length).trim()
  }

  // Remove technical specifications patterns
  // Engine displacement: "3.6/3.8", "2.0", "3.0" etc.
  version = version.replace(/\s*\d+\.\d+(?:\/\d+\.\d+)?\s*/g, ' ')

  // Valve configuration: "24V", "16V" etc.
  version = version.replace(/\s*\d+V\s*/gi, ' ')

  // Generation codes in parentheses: "(991/992)", "(G20)", "(F10)" etc.
  version = version.replace(/\s*\([^)]*\)\s*/g, ' ')

  // Engine codes: "TB", "TSI", "TFSI", "BiTurbo" - keep these as they're part of trim name
  // But remove standalone technical markers

  // Capacity in liters: "3.0L", "2.0L" etc.
  version = version.replace(/\s*\d+\.\d+L\s*/gi, ' ')

  // Clean up multiple spaces and trim
  version = version.replace(/\s+/g, ' ').trim()

  // If version is empty or just whitespace after cleaning, return null
  if (!version || version.length < 2) {
    return null
  }

  return version
}

export interface AutoConfResponse {
  count: number
  registros_por_pagina: string
  pagina_atual: number
  ultima_pagina: number
  veiculos: AutoConfVehicle[]
}

export interface AutoConfFilters {
  tipo?: 'carros' | 'motos' | 'caminhoes'
  pagina?: number
  registros_por_pagina?: number
  marca_id?: number
  modelo_id?: number
  ano_de?: number
  ano_ate?: number
  preco_de?: number
  preco_ate?: number
  km_de?: number
  km_ate?: number
  combustivel_id?: number
  cambio_id?: number
  cor_id?: number
  ordenar?: 'preco' | 'ano' | 'km' | 'publicacao'
  ordem?: 'asc' | 'desc'
}

const AUTOCONF_BASE_URL = 'https://api.autoconf.com.br/api/v1'
const BEARER_TOKEN = process.env.AUTOCONF_BEARER_TOKEN || ''
const DEALER_TOKEN = process.env.AUTOCONF_DEALER_TOKEN || ''

/**
 * Fetch vehicles from AutoConf API
 */
export async function fetchAutoConfVehicles(filters: AutoConfFilters = {}): Promise<AutoConfResponse> {
  const formData = new URLSearchParams()
  formData.append('token', DEALER_TOKEN)
  formData.append('tipo', filters.tipo || 'carros')
  formData.append('pagina', String(filters.pagina || 1))
  formData.append('registros_por_pagina', String(filters.registros_por_pagina || 20))

  if (filters.marca_id) formData.append('marca_id', String(filters.marca_id))
  if (filters.modelo_id) formData.append('modelo_id', String(filters.modelo_id))
  if (filters.ano_de) formData.append('ano_de', String(filters.ano_de))
  if (filters.ano_ate) formData.append('ano_ate', String(filters.ano_ate))
  if (filters.preco_de) formData.append('preco_de', String(filters.preco_de))
  if (filters.preco_ate) formData.append('preco_ate', String(filters.preco_ate))
  if (filters.km_de) formData.append('km_de', String(filters.km_de))
  if (filters.km_ate) formData.append('km_ate', String(filters.km_ate))
  if (filters.combustivel_id) formData.append('combustivel_id', String(filters.combustivel_id))
  if (filters.cambio_id) formData.append('cambio_id', String(filters.cambio_id))
  if (filters.cor_id) formData.append('cor_id', String(filters.cor_id))
  if (filters.ordenar) formData.append('ordenar', filters.ordenar)
  if (filters.ordem) formData.append('ordem', filters.ordem)

  const response = await fetch(`${AUTOCONF_BASE_URL}/veiculos`, {
    method: 'POST',
    headers: {
      'Authorization': BEARER_TOKEN,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    next: { revalidate: 300 }, // Cache for 5 minutes
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error(`AutoConf API error: ${response.status} - ${text}`)
    throw new Error(`AutoConf API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Ads Home vehicle structure (from /ads-home endpoint)
 * Contains additional fields for featured/promotional vehicles
 */
interface AdsHomeVehicle extends AutoConfVehicle {
  veiculo_id?: number
  ordem?: number
}

/**
 * Fetch featured/promotional vehicles from AutoConf API
 * Uses the /ads-home endpoint which returns highlighted vehicles
 */
export async function fetchAdsHome(): Promise<AutoConfVehicle[]> {
  const formData = new URLSearchParams()
  formData.append('token', DEALER_TOKEN)

  try {
    const response = await fetch(`${AUTOCONF_BASE_URL}/ads-home`, {
      method: 'POST',
      headers: {
        'Authorization': BEARER_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error(`AutoConf Ads Home API error: ${response.status}`)
      return []
    }

    const data = await response.json()

    // The /ads-home endpoint returns { destaques: [...] }
    const destaques: AdsHomeVehicle[] = data.destaques || []

    if (destaques.length === 0) {
      console.log('No featured vehicles in ads-home response')
      return []
    }

    // Sort by 'ordem' (ascending) if available, to respect CRM ordering
    const sortedDestaques = [...destaques].sort((a, b) => {
      const ordemA = a.ordem ?? 999
      const ordemB = b.ordem ?? 999
      return ordemA - ordemB
    })

    // Map to standard AutoConfVehicle structure
    // Use veiculo_id as id if present, otherwise keep original id
    return sortedDestaques.map(vehicle => ({
      ...vehicle,
      id: vehicle.veiculo_id ?? vehicle.id,
    }))
  } catch (error) {
    console.error('Error fetching ads home vehicles:', error)
    return []
  }
}

/**
 * Fetch a single vehicle by ID from AutoConf API
 */
export async function fetchAutoConfVehicleById(vehicleId: number): Promise<AutoConfVehicle | null> {
  const formData = new URLSearchParams()
  formData.append('token', DEALER_TOKEN)
  formData.append('id', String(vehicleId))

  const response = await fetch(`${AUTOCONF_BASE_URL}/veiculo`, {
    method: 'POST',
    headers: {
      'Authorization': BEARER_TOKEN,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    console.error(`AutoConf API error fetching vehicle ${vehicleId}: ${response.status}`)
    return null
  }

  const data = await response.json()
  return data.veiculo || null
}

/**
 * Map AutoConf vehicle to our Vehicle interface
 */
export function mapAutoConfToVehicle(autoconfVehicle: AutoConfVehicle): Vehicle {
  const slug = generateVehicleSlug(autoconfVehicle)
  // Safely handle missing acessorios arrays (not always present in /ads-home endpoint)
  const acessorios = autoconfVehicle.acessorios || []
  const acessoriosDestaque = autoconfVehicle.acessorios_destaque || []
  const options = [
    ...acessorios.map(a => a.nome),
    ...acessoriosDestaque.map(a => a.nome),
  ]
  const uniqueOptions = [...new Set(options)]

  // Determine category based on price and brand
  const price = parseFloat(autoconfVehicle.valorvenda)
  const category = determineCategoryFromVehicle(autoconfVehicle, price)

  // Determine if vehicle is imported based on brand
  const importedBrands = ['Ferrari', 'Lamborghini', 'McLaren', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'Maserati']
  const isImported = importedBrands.some(b => autoconfVehicle.marca_nome.toLowerCase().includes(b.toLowerCase()))

  // Safely handle potentially missing fields from /ads-home endpoint
  const km = autoconfVehicle.km ?? 0
  const kmFormatted = km.toLocaleString('pt-BR')

  return {
    id: String(autoconfVehicle.id),
    slug,
    brand: autoconfVehicle.marca_nome || 'Desconhecido',
    model: autoconfVehicle.modelopai_nome || 'Modelo',
    version: cleanVersionString(autoconfVehicle.modelo_nome, autoconfVehicle.modelopai_nome)
      || autoconfVehicle.versao_descricao || null,
    year_manufacture: parseInt(autoconfVehicle.anofabricacao) || 0,
    year_model: parseInt(autoconfVehicle.anomodelo) || 0,
    color: autoconfVehicle.cor_nome || 'Não informado',
    mileage: km,
    fuel_type: autoconfVehicle.combustivel_nome || 'Não informado',
    transmission: autoconfVehicle.cambio_nome || 'Não informado',
    price,
    category,
    body_type: autoconfVehicle.carroceria_nome || 'Sedan',
    location_id: '1', // Default location
    photos: autoconfVehicle.fotos?.map(f => f.url) || (autoconfVehicle.foto ? [autoconfVehicle.foto] : []),
    videos: null,
    options: uniqueOptions.length > 0 ? uniqueOptions : null,
    description: generateDescription(autoconfVehicle),
    seo_title: `${autoconfVehicle.marca_nome || 'Veículo'} ${autoconfVehicle.modelopai_nome || ''} ${autoconfVehicle.anomodelo || ''} | Attra Veículos`,
    seo_description: `${autoconfVehicle.marca_nome || 'Veículo'} ${autoconfVehicle.modelopai_nome || ''} ${autoconfVehicle.anomodelo || ''} com ${kmFormatted} km. Compre com a Attra Veículos.`,
    status: 'available',
    is_featured: (autoconfVehicle.prioridade_veiculo ?? 0) > 0,
    is_new: autoconfVehicle.zero_km === 1,
    created_at: autoconfVehicle.publicacao || new Date().toISOString(),
    updated_at: autoconfVehicle.publicacao || new Date().toISOString(),
    crm_id: String(autoconfVehicle.id),
    horsepower: autoconfVehicle.potencia ?? null,
    torque: null,
    acceleration: null,
    top_speed: null,
    engine: null,
    origin: isImported ? 'imported' : 'national',
    audio_url: null,
  }
}

/**
 * Generate a URL-friendly slug for the vehicle
 */
function generateVehicleSlug(vehicle: AutoConfVehicle): string {
  const base = `${vehicle.marca_nome}-${vehicle.modelopai_nome}-${vehicle.anomodelo}`
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + `-${vehicle.id}`
}

/**
 * Determine vehicle category based on characteristics
 */
function determineCategoryFromVehicle(vehicle: AutoConfVehicle, price: number): string {
  const brand = vehicle.marca_nome.toLowerCase()

  // Supercars/Sports
  const supercarBrands = ['ferrari', 'lamborghini', 'mclaren', 'bugatti', 'pagani', 'koenigsegg']
  if (supercarBrands.some(b => brand.includes(b))) return 'supercar'

  // Sports cars
  const sportsBrands = ['porsche', 'aston martin', 'maserati', 'lotus']
  if (sportsBrands.some(b => brand.includes(b))) return 'sports'

  // Luxury
  const luxuryBrands = ['bentley', 'rolls-royce', 'maybach']
  if (luxuryBrands.some(b => brand.includes(b))) return 'luxury'

  // Premium
  const premiumBrands = ['bmw', 'mercedes', 'audi', 'lexus', 'land rover', 'range rover', 'jaguar', 'volvo']
  if (premiumBrands.some(b => brand.includes(b))) return 'premium'

  // SUV based on body type
  if (vehicle.carroceria_nome?.toLowerCase().includes('suv')) return 'suv'

  // Price-based fallback
  if (price >= 500000) return 'luxury'
  if (price >= 200000) return 'premium'

  return 'executive'
}

/**
 * Generate a description for the vehicle
 */
function generateDescription(vehicle: AutoConfVehicle): string {
  const isNew = vehicle.zero_km === 1
  const km = (vehicle.km ?? 0).toLocaleString('pt-BR')
  const brand = vehicle.marca_nome || 'Veículo'
  const model = vehicle.modelopai_nome || ''
  const year = vehicle.anomodelo || ''
  const fuel = vehicle.combustivel_nome || 'não informado'
  const transmission = vehicle.cambio_nome || 'não informado'
  const version = vehicle.versao_descricao || ''

  if (isNew) {
    return `${brand} ${model} ${year} 0km. ${version} Motor ${fuel}, câmbio ${transmission}. Verifique a disponibilidade com nossos consultores.`
  }

  return `${brand} ${model} ${year} com apenas ${km} km rodados. ${version} Motor ${fuel}, câmbio ${transmission}. Documentação em dia, pronto para entrega.`
}

// Use real inventory data from list_vehicle.json as fallback
// This provides realistic vehicle data when the AutoConf API is unavailable
const mockVehicles: Vehicle[] = realInventoryVehicles

/**
 * Fetch and map vehicles with error handling
 */
export async function getVehicles(filters: AutoConfFilters = {}): Promise<{
  vehicles: Vehicle[]
  total: number
  page: number
  totalPages: number
}> {
  try {
    const response = await fetchAutoConfVehicles(filters)

    return {
      vehicles: response.veiculos.map(mapAutoConfToVehicle),
      total: response.count,
      page: response.pagina_atual,
      totalPages: response.ultima_pagina,
    }
  } catch (error) {
    console.error('Error fetching vehicles from AutoConf:', error)
    // Return real inventory data as fallback when API fails (403, timeout, etc.)
    console.warn('Using real inventory data as fallback')
    const page = filters.pagina || 1
    const perPage = filters.registros_por_pagina || 20
    const start = (page - 1) * perPage
    const end = start + perPage
    return {
      vehicles: mockVehicles.slice(start, end),
      total: mockVehicles.length,
      page,
      totalPages: Math.ceil(mockVehicles.length / perPage),
    }
  }
}

/**
 * Fetch a single vehicle by ID and map to our interface
 */
export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      // Try to find in real inventory data by id string
      return mockVehicles.find(v => v.id === id) || null
    }

    const autoconfVehicle = await fetchAutoConfVehicleById(numericId)
    if (!autoconfVehicle) {
      // Vehicle not found in API, try real inventory data
      return mockVehicles.find(v => v.id === id) || null
    }

    return mapAutoConfToVehicle(autoconfVehicle)
  } catch (error) {
    console.error('Error fetching vehicle by ID:', error)
    // Return from real inventory data as fallback when API fails
    return mockVehicles.find(v => v.id === id) || null
  }
}

/**
 * Get vehicle by slug
 * Slug format: marca-modelo-ano-ID (e.g., porsche-911-carrera-2024-295110)
 */
export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  try {
    // Extract the ID from the end of the slug
    const slugParts = slug.split('-')
    const potentialId = slugParts[slugParts.length - 1]

    // If the last part is a number, try to fetch directly by ID
    if (potentialId && /^\d+$/.test(potentialId)) {
      const vehicleId = parseInt(potentialId, 10)
      const autoconfVehicle = await fetchAutoConfVehicleById(vehicleId)
      if (autoconfVehicle) {
        return mapAutoConfToVehicle(autoconfVehicle)
      }
    }

    // Fallback: search in vehicle list
    const response = await fetchAutoConfVehicles({
      tipo: 'carros',
      registros_por_pagina: 100,
    })

    const vehicle = response.veiculos.find(v => {
      const vehicleSlug = generateVehicleSlug(v)
      return vehicleSlug === slug
    })

    if (!vehicle) return null
    return mapAutoConfToVehicle(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle by slug:', error)
    // Return from real inventory data as fallback when API fails
    return mockVehicles.find(v => v.slug === slug) || null
  }
}

/**
 * Get related/similar vehicles using the sugestoes IDs from the current vehicle
 */
export async function getRelatedVehicles(currentId: string, brand: string, limit = 4): Promise<Vehicle[]> {
  try {
    const numericId = parseInt(currentId, 10)

    // First, get the current vehicle to access its sugestoes
    if (!isNaN(numericId)) {
      const currentVehicle = await fetchAutoConfVehicleById(numericId)

      if (currentVehicle && currentVehicle.sugestoes && currentVehicle.sugestoes.length > 0) {
        // Fetch each suggested vehicle by ID (limit to requested amount)
        const suggestedIds = currentVehicle.sugestoes.slice(0, limit)
        const suggestedVehicles = await Promise.all(
          suggestedIds.map(id => fetchAutoConfVehicleById(id))
        )

        // Filter out null results and map to Vehicle interface
        return suggestedVehicles
          .filter((v): v is AutoConfVehicle => v !== null)
          .map(mapAutoConfToVehicle)
      }
    }

    // Fallback: if no sugestoes, get random vehicles from the list
    const response = await fetchAutoConfVehicles({
      tipo: 'carros',
      registros_por_pagina: limit + 1,
    })

    const filtered = response.veiculos
      .filter(v => String(v.id) !== currentId)
      .slice(0, limit)

    return filtered.map(mapAutoConfToVehicle)
  } catch (error) {
    console.error('Error fetching related vehicles:', error)
    // Return from real inventory data as fallback when API fails
    return mockVehicles
      .filter(v => v.id !== currentId)
      .slice(0, limit)
  }
}

/**
 * Deduplicate vehicles based on brand + model + year
 * Keeps the first occurrence (usually most expensive when sorted by price desc)
 */
function deduplicateVehicles(vehicles: AutoConfVehicle[]): AutoConfVehicle[] {
  const seen = new Set<string>()
  return vehicles.filter(vehicle => {
    const key = `${vehicle.marca_nome.toLowerCase()}-${vehicle.modelopai_nome.toLowerCase()}-${vehicle.anomodelo}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * Deduplicate mapped vehicles based on brand + model + year
 */
function deduplicateMappedVehicles(vehicles: Vehicle[]): Vehicle[] {
  const seen = new Set<string>()
  return vehicles.filter(vehicle => {
    const key = `${vehicle.brand.toLowerCase()}-${vehicle.model.toLowerCase()}-${vehicle.year_model}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * Get home/featured vehicles for hero banner
 * Returns mapped vehicles from /veiculos-home endpoint with fallback
 *
 * Fallback strategy:
 * 1. Try /veiculos-home endpoint (featured/priority vehicles)
 * 2. If empty, fetch most expensive vehicles from /veiculos (deduplicated)
 * 3. If API error, use local realInventoryVehicles data
 */
export async function getHomeVehicles(limit = 4): Promise<Vehicle[]> {
  try {
    // Primary: Try to get featured/promotional vehicles from /ads-home
    const adsHomeVehicles = await fetchAdsHome()

    if (adsHomeVehicles.length > 0) {
      // Deduplicate and limit (already sorted by 'ordem' from fetchAdsHome)
      const uniqueVehicles = deduplicateVehicles(adsHomeVehicles)
      console.log(`Found ${adsHomeVehicles.length} featured vehicles, ${uniqueVehicles.length} unique`)
      return uniqueVehicles.slice(0, limit).map(mapAutoConfToVehicle)
    }

    // Fallback: Get most expensive vehicles, fetching extra to account for duplicates
    console.log('No ads-home vehicles found, fetching most expensive vehicles as fallback')
    const fetchLimit = limit * 3 // Fetch more to have enough after deduplication
    const response = await fetchAutoConfVehicles({
      tipo: 'carros',
      registros_por_pagina: fetchLimit,
      ordenar: 'preco',
      ordem: 'desc',
    })

    if (response.veiculos.length > 0) {
      // Deduplicate based on brand + model + year
      const uniqueVehicles = deduplicateVehicles(response.veiculos)

      // If still not enough unique vehicles, try fetching more
      if (uniqueVehicles.length < limit && response.veiculos.length >= fetchLimit) {
        console.log(`Only ${uniqueVehicles.length} unique vehicles, fetching more...`)
        const moreResponse = await fetchAutoConfVehicles({
          tipo: 'carros',
          registros_por_pagina: limit * 5,
          ordenar: 'preco',
          ordem: 'desc',
        })
        const allUnique = deduplicateVehicles(moreResponse.veiculos)
        return allUnique.slice(0, limit).map(mapAutoConfToVehicle)
      }

      return uniqueVehicles.slice(0, limit).map(mapAutoConfToVehicle)
    }

    // Final fallback: use local inventory data (deduplicated)
    console.warn('API returned no vehicles, using local inventory data')
    const sortedMock = mockVehicles.sort((a, b) => (b.price || 0) - (a.price || 0))
    return deduplicateMappedVehicles(sortedMock).slice(0, limit)
  } catch (error) {
    console.error('Error fetching home vehicles:', error)
    // Return most expensive vehicles from real inventory as final fallback (deduplicated)
    const sortedMock = mockVehicles.sort((a, b) => (b.price || 0) - (a.price || 0))
    return deduplicateMappedVehicles(sortedMock).slice(0, limit)
  }
}

/**
 * Vehicle Section Content — orquestra a geração e cache das 3 seções
 * editoriais (OVERVIEW / EXTERIOR DESIGN / INTERIOR) que aparecem na
 * página de detalhe do veículo (estilo Lamborghini Temerario).
 *
 * Estratégia (alinhada com a usuária):
 *   - Heurística simples pra escolher as fotos (índices 0, 5, 15 do
 *     array photos[] devolvido pela Autoconf — padrão Attra é 10
 *     fotos exterior seguidas de 10 interior, então essas posições
 *     pegam capa frontal, lateral exterior e dashboard interior).
 *   - Gemini Text gera a copy editorial de cada seção (factual,
 *     sem poetismo, baseada só nos specs do veículo).
 *   - Resultado é persistido em vehicle_section_content (Supabase) e
 *     invalidado apenas se o número de fotos mudar.
 *
 * Não usamos Gemini Vision: custo ~300x maior e os ganhos de precisão
 * de classificação não compensam dado o padrão da Attra. Se algum dia
 * precisar refinar, basta substituir pickHeuristicPhotos por uma versão
 * que chama Vision.
 */

import { Vehicle } from '@/types'
import { createAdminClient } from '@/lib/supabase/admin'

export interface VehicleSectionPart {
  photo_url: string
  copy: string | null
}

export interface VehicleSections {
  overview: VehicleSectionPart
  exterior: VehicleSectionPart
  interior: VehicleSectionPart
  /**
   * 'cache'    — veio direto do Supabase (zero IA call)
   * 'fresh'    — gerado agora com Gemini, e cacheado
   * 'fallback' — sem IA, copy null (fotos OK via heurística)
   */
  source: 'cache' | 'fresh' | 'fallback'
}

const OVERVIEW_PHOTO_INDEX = 0
const EXTERIOR_PHOTO_INDEX = 5
const INTERIOR_PHOTO_INDEX = 15
const GEMINI_TIMEOUT_MS = 10000

type SectionKind = 'overview' | 'exterior' | 'interior'

/**
 * Escolhe a foto de cada seção pelo padrão Attra (heurística por índice).
 * Cai pra photos[0] como último recurso quando o índice alvo não existe.
 */
function pickHeuristicPhoto(photos: string[], targetIndex: number): string {
  return photos[targetIndex] ?? photos[0] ?? ''
}

/**
 * vehicle.id é string no schema mas guarda número (ex: "989248"). Esta
 * conversão é segura porque o autoconf-api preserva o ID inteiro do
 * Autoconf. Se o ID não for numérico, retorna NaN — caller deve checar.
 */
function vehicleIdToNumber(id: string): number {
  return parseInt(id, 10)
}

/**
 * Lê do cache Supabase. Retorna null se não existe ou se o número de
 * fotos mudou (sinal de fotos novas/removidas no Autoconf — invalida).
 */
export async function getCachedVehicleSections(
  vehicleId: string,
  currentPhotoCount: number,
): Promise<VehicleSections | null> {
  const numericId = vehicleIdToNumber(vehicleId)
  if (Number.isNaN(numericId)) return null

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('vehicle_section_content')
      .select('*')
      .eq('vehicle_id', numericId)
      .maybeSingle()

    if (error || !data) return null

    // Invalida cache se número de fotos mudou (fotos foram add/removidas)
    if (data.photo_count !== currentPhotoCount) return null

    return {
      overview: { photo_url: data.overview_photo_url, copy: data.overview_copy },
      exterior: { photo_url: data.exterior_photo_url, copy: data.exterior_copy },
      interior: { photo_url: data.interior_photo_url, copy: data.interior_copy },
      source: 'cache',
    }
  } catch (error) {
    console.error('[vehicle-sections] cache read failed:', error)
    return null
  }
}

/**
 * Fallback estático — heurística sem nenhuma chamada de IA. Usado quando
 * o cache está vazio E não dá pra esperar a geração (ex: SSR sem
 * disposição pra adicionar latência). Próxima visita pega do cache fresh.
 */
export function getFallbackVehicleSections(vehicle: Vehicle): VehicleSections {
  const photos = vehicle.photos ?? []
  return {
    overview: { photo_url: pickHeuristicPhoto(photos, OVERVIEW_PHOTO_INDEX), copy: null },
    exterior: { photo_url: pickHeuristicPhoto(photos, EXTERIOR_PHOTO_INDEX), copy: null },
    interior: { photo_url: pickHeuristicPhoto(photos, INTERIOR_PHOTO_INDEX), copy: null },
    source: 'fallback',
  }
}

/**
 * Prompt informativo (sem poetismo, sem clichês de marketing).
 * Constraints reforçados:
 *   - Use APENAS dados fornecidos
 *   - Tom técnico/factual
 *   - 2-3 frases curtas
 *   - Sem aspas/títulos/markdown
 */
function buildSectionPrompt(vehicle: Vehicle, section: SectionKind): string {
  const sectionInstructions = {
    overview: 'Resumo geral do veículo. Mencione marca, modelo, ano e quilometragem. Indique o segmento (esportivo, SUV, sedã etc.) e se aplica, a procedência ou destaque técnico mais relevante.',
    exterior: 'Foco no design exterior: linhas da carroceria, cor, tipo de carroceria, rodas (se a potência ou esportividade sugerir destaque). Descrição visual factual baseada na cor e tipo.',
    interior: 'Foco no interior: tipo de câmbio, conforto, acabamento típico da categoria. Use cor da carroceria como referência indireta se relevante. Não invente detalhes do interior (materiais específicos, cor de banco etc.) — limite-se ao que é genérico do modelo.',
  }

  const km = vehicle.mileage === 0
    ? '0 km (zero km)'
    : `${vehicle.mileage.toLocaleString('pt-BR')} km`
  const potencia = vehicle.horsepower ? `${vehicle.horsepower} cv` : 'não informada'
  const version = vehicle.version ? ` ${vehicle.version}` : ''

  return `Escreva 2-3 frases factuais para a seção "${section.toUpperCase()}" da página de um veículo premium.

${sectionInstructions[section]}

DADOS DO VEÍCULO (use APENAS estes):
- Marca: ${vehicle.brand}
- Modelo: ${vehicle.model}${version}
- Ano modelo: ${vehicle.year_model}
- Ano fabricação: ${vehicle.year_manufacture}
- Quilometragem: ${km}
- Combustível: ${vehicle.fuel_type ?? 'Não informado'}
- Câmbio: ${vehicle.transmission ?? 'Não informado'}
- Cor: ${vehicle.color ?? 'Não informada'}
- Carroceria: ${vehicle.body_type ?? 'Não informada'}
- Potência: ${potencia}
- Categoria: ${vehicle.category ?? 'Premium'}

REGRAS:
1. Português do Brasil.
2. Máximo 3 frases curtas. Total entre 30 e 60 palavras.
3. Tom técnico e objetivo. Proibido: "impressionante", "magnífico", "deslumbrante", "marcante", "deslumbra", "extraordinário", "luxuoso", "imponente" e clichês similares.
4. Use APENAS os dados acima. NÃO INVENTE: opcionais não listados, materiais do interior, cor de banco, detalhes de acabamento, equipamentos não mencionados.
5. Se um dado relevante para a seção não existir, evite a área (não diga "informação não disponível"; apenas omita).
6. Não use o nome completo "marca modelo" mais de uma vez no parágrafo.

Entregue APENAS o parágrafo. Sem título, sem aspas, sem listas, sem markdown.`
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Chama Gemini Text. Retorna null em qualquer falha (sem throw — o caller
 * persiste null e a UI mostra fallback estático ou texto vazio).
 */
async function generateSectionCopy(
  vehicle: Vehicle,
  section: SectionKind,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('[vehicle-sections] GEMINI_API_KEY não configurada')
    return null
  }

  const prompt = buildSectionPrompt(vehicle, section)

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            topK: 32,
            topP: 0.9,
            maxOutputTokens: 280,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      },
      GEMINI_TIMEOUT_MS,
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error(`[vehicle-sections] Gemini ${section} HTTP ${response.status}:`, errorText.substring(0, 200))
      return null
    }

    const data = await response.json()
    const generated = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generated || typeof generated !== 'string' || generated.trim().length === 0) {
      console.error(`[vehicle-sections] Gemini ${section} retornou texto vazio`)
      return null
    }

    return sanitizeCopy(generated)
  } catch (error) {
    console.error(`[vehicle-sections] Gemini ${section} falhou:`, error instanceof Error ? error.message : error)
    return null
  }
}

function sanitizeCopy(text: string): string {
  return text
    .replace(/[#*_`]/g, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Pipeline completo: aplica heurística pra escolher fotos + chama Gemini
 * em paralelo pras 3 copies + upsert no Supabase.
 */
export async function generateAndCacheVehicleSections(
  vehicle: Vehicle,
): Promise<VehicleSections> {
  const fallback = getFallbackVehicleSections(vehicle)

  // 3 copies em paralelo
  const [overviewCopy, exteriorCopy, interiorCopy] = await Promise.all([
    generateSectionCopy(vehicle, 'overview'),
    generateSectionCopy(vehicle, 'exterior'),
    generateSectionCopy(vehicle, 'interior'),
  ])

  const sections: VehicleSections = {
    overview: { photo_url: fallback.overview.photo_url, copy: overviewCopy },
    exterior: { photo_url: fallback.exterior.photo_url, copy: exteriorCopy },
    interior: { photo_url: fallback.interior.photo_url, copy: interiorCopy },
    source: 'fresh',
  }

  const numericId = vehicleIdToNumber(vehicle.id)
  if (Number.isNaN(numericId)) {
    console.warn(`[vehicle-sections] vehicle.id "${vehicle.id}" não é numérico, pulando cache`)
    return sections
  }

  try {
    const supabase = createAdminClient()
    const photoCount = vehicle.photos?.length ?? 0
    const now = new Date().toISOString()

    await supabase
      .from('vehicle_section_content')
      .upsert(
        {
          vehicle_id: numericId,
          vehicle_slug: vehicle.slug,
          photo_count: photoCount,
          overview_photo_url: sections.overview.photo_url,
          exterior_photo_url: sections.exterior.photo_url,
          interior_photo_url: sections.interior.photo_url,
          overview_copy: sections.overview.copy,
          exterior_copy: sections.exterior.copy,
          interior_copy: sections.interior.copy,
          classified_at: now,
          copy_generated_at: now,
        },
        { onConflict: 'vehicle_id' },
      )
  } catch (error) {
    console.error('[vehicle-sections] upsert falhou:', error)
  }

  return sections
}

/**
 * API pública: tenta cache primeiro, se miss gera e cacheia.
 *
 * IMPORTANTE: este caminho é síncrono (aguarda Gemini se cache miss),
 * então a primeira visita ao veículo pode ter +2-4s de latência. Para
 * SSR de prod, prefira chamar `getCachedVehicleSections` direto (instant)
 * e disparar `generateAndCacheVehicleSections` em background — a UI mostra
 * fallback no primeiro load e atualiza no próximo refresh.
 */
export async function getOrGenerateVehicleSections(
  vehicle: Vehicle,
): Promise<VehicleSections> {
  const photoCount = vehicle.photos?.length ?? 0
  const cached = await getCachedVehicleSections(vehicle.id, photoCount)
  if (cached) return cached
  return generateAndCacheVehicleSections(vehicle)
}

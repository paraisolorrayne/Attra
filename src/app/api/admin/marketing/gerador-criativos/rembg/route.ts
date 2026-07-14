import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin-auth-supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Remove o fundo da foto do veículo via Replicate (bria/remove-background,
// o mesmo modelo do pipeline de hero). Usado pelo template Editorial do
// Gerador de Criativos: o carro recortado é composto sobre o cenário de
// estúdio embutido. Custo ~US$0,05/imagem.
// BiRefNet: recorte mais preciso em bordas finas (rodas, aerofólios,
// vãos) — o bria fica como fallback se o primário falhar.
const REMBG_MODELS = [
  process.env.REMBG_MODEL || 'men1scus/birefnet',
  'bria/remove-background',
]
const POLL_MS = 2000
const TIMEOUT_MS = 90_000

async function runRembg(model: string, apiToken: string, image: string): Promise<string | null> {
  const start = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: { image } }),
  })
  if (!start.ok) {
    console.warn(`[GeradorRembg] ${model} start HTTP ${start.status}`)
    return null
  }
  const pred = await start.json()
  const getUrl = pred.urls?.get
  if (!getUrl) return null

  const deadline = Date.now() + TIMEOUT_MS
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_MS))
    const poll = await fetch(getUrl, { headers: { 'Authorization': `Bearer ${apiToken}` } })
    const data = await poll.json()
    if (data.status === 'succeeded') {
      return typeof data.output === 'string' ? data.output : data.output?.[0] ?? null
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      console.warn(`[GeradorRembg] ${model} ${data.status}: ${data.error || ''}`)
      return null
    }
  }
  console.warn(`[GeradorRembg] ${model} timeout`)
  return null
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiToken = process.env.REPLICATE_API_TOKEN
  if (!apiToken) {
    return NextResponse.json({ error: 'REPLICATE_API_TOKEN não configurada no servidor' }, { status: 500 })
  }

  const { image, imageUrl } = await request.json()

  // Duas formas de entrada: dataURL (upload manual, já reduzido no browser)
  // ou URL pública (foto do estoque — sem upload, o Replicate baixa direto)
  let input: string
  if (typeof imageUrl === 'string' && /^https:\/\//.test(imageUrl)) {
    input = imageUrl
  } else if (typeof image === 'string' && image.startsWith('data:image/')) {
    if (image.length > 14_000_000) {
      return NextResponse.json({ error: 'Imagem grande demais (máx ~10MB)' }, { status: 413 })
    }
    input = image
  } else {
    return NextResponse.json({ error: 'Envie image (data URL) ou imageUrl (https)' }, { status: 400 })
  }

  try {
    let outputUrl: string | null = null
    for (const model of REMBG_MODELS) {
      outputUrl = await runRembg(model, apiToken, input)
      if (outputUrl) break
    }
    if (!outputUrl) {
      return NextResponse.json({ error: 'Recorte falhou nos dois modelos — tente outra foto' }, { status: 502 })
    }

    // Busca o PNG recortado e devolve como data URL — mesma origem, o
    // canvas do gerador continua exportável
    const imgResp = await fetch(outputUrl)
    if (!imgResp.ok) {
      return NextResponse.json({ error: `Falha ao baixar resultado (HTTP ${imgResp.status})` }, { status: 502 })
    }
    const buf = Buffer.from(await imgResp.arrayBuffer())
    console.log(`[GeradorRembg] ${admin.email} recortou uma foto (${Math.round(buf.length / 1024)}KB)`)
    return NextResponse.json({ image: `data:image/png;base64,${buf.toString('base64')}` })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

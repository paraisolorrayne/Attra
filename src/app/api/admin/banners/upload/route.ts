import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'

const BANNERS_BUCKET = 'banner-images'
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo inválido. Apenas JPEG, PNG, WebP e AVIF são permitidos.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const filename = `banner-${timestamp}-${random}.${ext}`
    const filePath = `banners/${filename}`

    const supabase = createAdminClient()
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(BANNERS_BUCKET)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      console.error('Banner upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage
      .from(BANNERS_BUCKET)
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Error uploading banner image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


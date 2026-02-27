import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { BLOG_IMAGES_BUCKET } from '@/lib/supabase/storage'

const BLOG_WEBHOOK_SECRET = process.env.BLOG_WEBHOOK_SECRET || ''

// --- Helpers ---

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/^-|-$/g, '')
}

function generateSlug(title: string): string {
  const base = slugify(title)
  const suffix = Date.now().toString(36).slice(-6)
  return `${base}-${suffix}`
}

function estimateReadingTime(text: string): string {
  const words = text.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min`
}

function extractExcerpt(text: string, maxLength = 160): string {
  const clean = text.replace(/\n+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  return clean.substring(0, maxLength).replace(/\s\S*$/, '') + '...'
}

/** Convert LinkedIn plain-text to basic HTML paragraphs */
function linkedinTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      // Convert single newlines to <br> within a paragraph
      const html = block.replace(/\n/g, '<br />')
      return `<p>${html}</p>`
    })
    .join('\n')
}

function parseHashtags(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map(h => h.replace(/^#/, '').trim())
    .filter(Boolean)
}

// --- Route ---

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization')
    const isAuthorized = authHeader === `Bearer ${BLOG_WEBHOOK_SECRET}` && BLOG_WEBHOOK_SECRET !== ''

    if (!isAuthorized && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, hashtags, image_base64, image_content_type } = body as {
      title?: string
      content?: string
      hashtags?: string
      image_base64?: string       // base64-encoded image from n8n
      image_content_type?: string // e.g. "image/png"
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: title, content' },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()
    const slug = generateSlug(title)
    const keywords = hashtags ? parseHashtags(hashtags) : []
    const htmlContent = linkedinTextToHtml(content)
    const excerpt = extractExcerpt(content)
    const readingTime = estimateReadingTime(content)

    // --- Upload image if provided ---
    let featuredImageUrl = ''

    if (image_base64) {
      const buffer = Buffer.from(image_base64, 'base64')
      const ext = (image_content_type || 'image/png').split('/')[1] || 'png'
      const filename = `n8n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const filePath = `posts/${filename}`

      const { error: uploadError } = await supabase.storage
        .from(BLOG_IMAGES_BUCKET)
        .upload(filePath, buffer, {
          contentType: image_content_type || 'image/png',
          cacheControl: '31536000',
          upsert: false,
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from(BLOG_IMAGES_BUCKET)
          .getPublicUrl(filePath)
        featuredImageUrl = urlData.publicUrl
      } else {
        console.error('[Webhook blog-post] Image upload error:', uploadError.message)
      }
    }

    // --- Insert blog post ---
    const { data: newPost, error: insertError } = await supabase
      .from('dual_blog_posts')
      .insert({
        post_type: 'educativo',
        title,
        slug,
        excerpt,
        content: htmlContent,
        featured_image: featuredImageUrl,
        featured_image_alt: title,
        author: { name: 'Attra Veículos' },
        published_date: new Date().toISOString(),
        reading_time: readingTime,
        is_published: true,
        educativo: {
          category: 'Mercado',
          topic: keywords[0] || 'Superesportivos',
          seo_keyword: keywords[0] || '',
        },
        seo: {
          meta_title: title,
          meta_description: excerpt,
          keywords,
        },
        source: 'n8n',
      })
      .select('id, slug, title')
      .single()

    if (insertError) {
      console.error('[Webhook blog-post] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log(`[Webhook blog-post] Post created: ${newPost.title} (${newPost.slug})`)

    return NextResponse.json({
      success: true,
      post: newPost,
      url: `/blog/${newPost.slug}`,
    })
  } catch (error) {
    console.error('[Webhook blog-post] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}


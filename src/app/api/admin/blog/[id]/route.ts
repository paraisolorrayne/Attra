import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/server'
import { deleteBlogImage, isSupabaseStorageUrl } from '@/lib/supabase/storage'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single blog post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: post, error } = await supabase
      .from('dual_blog_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update blog post
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // If slug is being changed, check uniqueness
    if (body.slug) {
      const { data: existing } = await supabase
        .from('dual_blog_posts')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'Já existe um post com este slug' },
          { status: 409 }
        )
      }
    }

    // Add updated_date
    body.updated_date = new Date().toISOString()

    const { data: updatedPost, error } = await supabase
      .from('dual_blog_posts')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating blog post:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!updatedPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error) {
    console.error('Error in blog PATCH:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove blog post
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Get post to delete associated images
    const { data: post } = await supabase
      .from('dual_blog_posts')
      .select('featured_image, car_review')
      .eq('id', id)
      .single()

    if (post) {
      // Delete featured image from storage
      if (post.featured_image && isSupabaseStorageUrl(post.featured_image)) {
        await deleteBlogImage(post.featured_image)
      }

      // Delete gallery images from storage
      const carReview = post.car_review as Record<string, unknown> | null
      if (carReview?.gallery_images && Array.isArray(carReview.gallery_images)) {
        for (const img of carReview.gallery_images) {
          const url = typeof img === 'string' ? img : (img as Record<string, string>)?.url
          if (url && isSupabaseStorageUrl(url)) {
            await deleteBlogImage(url)
          }
        }
      }
    }

    const { error } = await supabase
      .from('dual_blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting blog post:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in blog DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


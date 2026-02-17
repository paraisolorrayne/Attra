-- Migration: Create dual_blog_posts table for admin blog management
-- Date: 2026-02-17
-- Description: Stores blog posts created via admin panel (both educativo and car_review types)

CREATE TABLE IF NOT EXISTS public.dual_blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core fields
    post_type TEXT NOT NULL CHECK (post_type IN ('educativo', 'car_review')),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    featured_image TEXT NOT NULL DEFAULT '',
    featured_image_alt TEXT NOT NULL DEFAULT '',
    
    -- Author (stored as JSONB: {name, bio?, avatar?})
    author JSONB NOT NULL DEFAULT '{"name": "Cris Vassiliades"}',
    
    -- Dates
    published_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_date TIMESTAMPTZ,
    
    -- Metadata
    reading_time TEXT NOT NULL DEFAULT '5 min',
    is_published BOOLEAN NOT NULL DEFAULT false,
    
    -- Type-specific fields (JSONB)
    educativo JSONB, -- {category, topic, seo_keyword}
    car_review JSONB, -- {brand, model, year, version, specs, gallery_images, availability, ...}
    
    -- SEO (JSONB: {meta_title, meta_description, canonical_url?, keywords[]})
    seo JSONB NOT NULL DEFAULT '{"meta_title": "", "meta_description": "", "keywords": []}',
    
    -- Source tracking
    source TEXT NOT NULL DEFAULT 'admin', -- 'admin' or 'wordpress'
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dual_blog_posts_slug ON public.dual_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_dual_blog_posts_post_type ON public.dual_blog_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_dual_blog_posts_is_published ON public.dual_blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_dual_blog_posts_published_date ON public.dual_blog_posts(published_date DESC);

-- Enable RLS
ALTER TABLE public.dual_blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access to published posts
CREATE POLICY "Public can read published posts"
    ON public.dual_blog_posts
    FOR SELECT
    USING (is_published = true);

-- Allow admin full access (via service role key, bypasses RLS)
-- No specific admin policy needed since admin client uses service role key

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_dual_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dual_blog_posts_updated_at
    BEFORE UPDATE ON public.dual_blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_dual_blog_posts_updated_at();

-- Create storage bucket for blog images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-images bucket
CREATE POLICY "Public can read blog images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can update blog images"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can delete blog images"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'blog-images');


-- Migration: Create news tables for Attra Veículos News Section
-- Source: GNews API with weekly cache in Supabase

-- 0. Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. News Cycles (weekly periods)
CREATE TABLE IF NOT EXISTS public.news_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_week_range CHECK (week_end > week_start)
);

-- Ensure only one active cycle at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_cycles_single_active 
    ON public.news_cycles (is_active) WHERE is_active = true;

-- 2. News Categories
CREATE TABLE IF NOT EXISTS public.news_categories (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.news_categories (id, slug, name, description) VALUES
    (1, 'featured', 'Destaques da Semana', 'Notícias em destaque selecionadas pela curadoria'),
    (2, 'formula-1', 'Formula 1', 'Notícias sobre Formula 1, F1, Grand Prix'),
    (3, 'premium-market', 'Carros Premium & Mercado', 'Notícias sobre carros de luxo e mercado automotivo')
ON CONFLICT (id) DO NOTHING;

-- 3. News Sources
CREATE TABLE IF NOT EXISTS public.news_sources (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public'
                   AND table_name = 'news_sources'
                   AND column_name = 'api_base_url') THEN
        ALTER TABLE public.news_sources ADD COLUMN api_base_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public'
                   AND table_name = 'news_sources'
                   AND column_name = 'is_active') THEN
        ALTER TABLE public.news_sources ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Insert GNews as the primary source (using only columns that definitely exist)
INSERT INTO public.news_sources (id, slug, name) VALUES
    (1, 'gnews', 'GNews')
ON CONFLICT (id) DO NOTHING;

-- Update additional fields for GNews
UPDATE public.news_sources
SET api_base_url = 'https://gnews.io/api/v4',
    is_active = true
WHERE id = 1;

-- 4. News Articles
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_cycle_id UUID NOT NULL REFERENCES public.news_cycles(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES public.news_categories(id),
    source_id INTEGER NOT NULL REFERENCES public.news_sources(id),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    image_url TEXT,
    source_name TEXT NOT NULL,
    original_url TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_order INTEGER CHECK (featured_order IS NULL OR (featured_order >= 1 AND featured_order <= 3)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_articles_cycle ON public.news_articles(news_cycle_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_featured ON public.news_articles(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON public.news_articles(published_at DESC);

-- Unique constraint: no duplicate URLs within the same cycle
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_articles_unique_url 
    ON public.news_articles(news_cycle_id, original_url);

-- Constraint: Maximum 3 featured articles per cycle
CREATE OR REPLACE FUNCTION check_featured_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_featured = true THEN
        IF (SELECT COUNT(*) FROM public.news_articles 
            WHERE news_cycle_id = NEW.news_cycle_id 
            AND is_featured = true 
            AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) >= 3 THEN
            RAISE EXCEPTION 'Maximum 3 featured articles per cycle';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_featured_limit ON public.news_articles;
CREATE TRIGGER trigger_check_featured_limit
    BEFORE INSERT OR UPDATE ON public.news_articles
    FOR EACH ROW
    EXECUTE FUNCTION check_featured_limit();

-- Constraint: Featured articles must have category_id = 1 and source_id = 1
CREATE OR REPLACE FUNCTION check_featured_constraints()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_featured = true THEN
        IF NEW.category_id != 1 OR NEW.source_id != 1 THEN
            RAISE EXCEPTION 'Featured articles must have category_id=1 and source_id=1';
        END IF;
        IF NEW.featured_order IS NULL THEN
            RAISE EXCEPTION 'Featured articles must have a featured_order (1, 2, or 3)';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_featured_constraints ON public.news_articles;
CREATE TRIGGER trigger_check_featured_constraints
    BEFORE INSERT OR UPDATE ON public.news_articles
    FOR EACH ROW
    EXECUTE FUNCTION check_featured_constraints();

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON public.news_articles;
CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON public.news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_cycles_updated_at ON public.news_cycles;
CREATE TRIGGER update_news_cycles_updated_at
    BEFORE UPDATE ON public.news_cycles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.news_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Public read access for all news tables
CREATE POLICY "Anyone can view news cycles" ON public.news_cycles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can view news categories" ON public.news_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can view news sources" ON public.news_sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can view news articles" ON public.news_articles FOR SELECT TO anon, authenticated USING (true);

-- Admin write access (for the ingestion job using service role, these aren't strictly needed but good for clarity)
CREATE POLICY "Service can manage news cycles" ON public.news_cycles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage news articles" ON public.news_articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.news_cycles TO anon;
GRANT SELECT ON public.news_categories TO anon;
GRANT SELECT ON public.news_sources TO anon;
GRANT SELECT ON public.news_articles TO anon;
GRANT ALL ON public.news_cycles TO authenticated;
GRANT ALL ON public.news_categories TO authenticated;
GRANT ALL ON public.news_sources TO authenticated;
GRANT ALL ON public.news_articles TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.news_cycles IS 'Weekly news cycles - only one can be active at a time';
COMMENT ON TABLE public.news_categories IS 'News categories: featured, formula-1, premium-market';
COMMENT ON TABLE public.news_sources IS 'News API sources (GNews is the primary)';
COMMENT ON TABLE public.news_articles IS 'Cached news articles from GNews API';


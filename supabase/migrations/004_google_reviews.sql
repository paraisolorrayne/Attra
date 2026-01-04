-- Google Reviews Cache Schema
-- Stores reviews from Google Places API with relevance scoring

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores for Google Places IDs
CREATE TABLE IF NOT EXISTS google_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  store_code TEXT, -- 'JP' or 'RP'
  address TEXT,
  rating DECIMAL(2,1),
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached Google Reviews with relevance scoring
CREATE TABLE IF NOT EXISTS google_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id UUID REFERENCES google_places(id) ON DELETE CASCADE,
  
  -- Review data from Google
  google_review_id TEXT, -- unique identifier from Google if available
  author_name TEXT NOT NULL,
  author_photo_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  review_time TIMESTAMPTZ, -- when the review was posted
  language TEXT DEFAULT 'pt',
  
  -- Relevance analysis
  relevance_score DECIMAL(5,2) DEFAULT 0, -- 0-100 score
  sentiment_keywords TEXT[], -- positive keywords found
  mentions_services BOOLEAN DEFAULT false,
  mentions_vehicles BOOLEAN DEFAULT false,
  mentions_team BOOLEAN DEFAULT false,
  
  -- Display control
  approved BOOLEAN DEFAULT false, -- manual approval for display
  featured BOOLEAN DEFAULT false, -- show in featured section
  display_order INTEGER,
  
  -- Metadata
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews
  UNIQUE(google_place_id, author_name, review_time)
);

-- Sync history for tracking weekly updates
CREATE TABLE IF NOT EXISTS google_reviews_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id UUID REFERENCES google_places(id) ON DELETE CASCADE,
  sync_status TEXT NOT NULL, -- 'success', 'error', 'partial'
  reviews_fetched INTEGER DEFAULT 0,
  reviews_new INTEGER DEFAULT 0,
  reviews_updated INTEGER DEFAULT 0,
  error_message TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_google_reviews_place ON google_reviews(google_place_id);
CREATE INDEX idx_google_reviews_approved ON google_reviews(approved) WHERE approved = true;
CREATE INDEX idx_google_reviews_relevance ON google_reviews(relevance_score DESC);
CREATE INDEX idx_google_reviews_rating ON google_reviews(rating DESC);
CREATE INDEX idx_google_reviews_featured ON google_reviews(featured) WHERE featured = true;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_google_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER trigger_google_places_updated_at
  BEFORE UPDATE ON google_places
  FOR EACH ROW
  EXECUTE FUNCTION update_google_reviews_updated_at();

CREATE TRIGGER trigger_google_reviews_updated_at
  BEFORE UPDATE ON google_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_google_reviews_updated_at();

-- RLS Policies
ALTER TABLE google_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews_sync_log ENABLE ROW LEVEL SECURITY;

-- Public read for approved reviews (for website display)
CREATE POLICY "Public can view approved reviews" ON google_reviews
  FOR SELECT USING (approved = true);

CREATE POLICY "Public can view places" ON google_places
  FOR SELECT USING (true);

-- Admin full access (using service role)
CREATE POLICY "Service role full access on places" ON google_places
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on reviews" ON google_reviews
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sync_log" ON google_reviews_sync_log
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default places for Attra stores (Place IDs to be updated with real ones)
INSERT INTO google_places (place_id, name, store_code, address) VALUES
  ('PLACE_ID_JP', 'Attra Veículos - João Pinheiro', 'JP', 'Av. João Pinheiro, Uberlândia - MG'),
  ('PLACE_ID_RP', 'Attra Veículos - Rondon Pacheco', 'RP', 'Av. Rondon Pacheco, 4100, Uberlândia - MG')
ON CONFLICT (place_id) DO NOTHING;

-- Comment on tables
COMMENT ON TABLE google_places IS 'Google Places registered for review tracking';
COMMENT ON TABLE google_reviews IS 'Cached reviews from Google with relevance scoring';
COMMENT ON TABLE google_reviews_sync_log IS 'History of review sync operations';
COMMENT ON COLUMN google_reviews.relevance_score IS 'Calculated score 0-100 based on rating, text quality, and keywords';


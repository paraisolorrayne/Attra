-- =============================================
-- SITE BANNERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS site_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  image_mobile_url TEXT,
  target_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  device_type TEXT NOT NULL DEFAULT 'all' CHECK (device_type IN ('all', 'desktop', 'mobile')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for site_banners
ALTER TABLE site_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active banners" ON site_banners
  FOR SELECT USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );

CREATE POLICY "Allow service role full access on site_banners" ON site_banners
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- NEWSLETTER CAMPAIGNS TABLE
-- =============================================
CREATE TYPE newsletter_campaign_status AS ENUM ('draft', 'scheduled', 'sent', 'cancelled');

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT,
  featured_image TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  html_content TEXT,
  status newsletter_campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for newsletter_campaigns
ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on newsletter_campaigns" ON newsletter_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'manual',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint on email
CREATE UNIQUE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers (email);

-- RLS for newsletter_subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on newsletter_subscribers" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- Allow public insert for subscription form
CREATE POLICY "Allow public subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- =============================================
-- LEAD NOTES TABLE (for CRM improvements)
-- =============================================
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for lead_notes
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on lead_notes" ON lead_notes
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_site_banners_active ON site_banners (is_active, display_order);
CREATE INDEX idx_site_banners_dates ON site_banners (start_date, end_date);
CREATE INDEX idx_newsletter_campaigns_status ON newsletter_campaigns (status);
CREATE INDEX idx_newsletter_campaigns_scheduled ON newsletter_campaigns (scheduled_at);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers (is_active);
CREATE INDEX idx_lead_notes_lead_id ON lead_notes (lead_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_banners_updated_at BEFORE UPDATE ON site_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_notes_updated_at BEFORE UPDATE ON lead_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


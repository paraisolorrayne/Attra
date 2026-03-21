-- =====================================================
-- MIGRATION: Add tracking/attribution columns to leads
-- Permite atribuição direta de leads a sessões, IPs,
-- landing pages, referrers e parâmetros UTM/click IDs
-- =====================================================

-- 1. Session attribution
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS session_id TEXT,
    ADD COLUMN IF NOT EXISTS visitor_session_db_id UUID REFERENCES public.visitor_sessions(id) ON DELETE SET NULL;

-- 2. Network / geo
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS ip_address INET;

-- 3. Landing page and referrer
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS landing_page TEXT,
    ADD COLUMN IF NOT EXISTS referrer TEXT;

-- 4. UTM parameters
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS utm_source TEXT,
    ADD COLUMN IF NOT EXISTS utm_medium TEXT,
    ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
    ADD COLUMN IF NOT EXISTS utm_content TEXT,
    ADD COLUMN IF NOT EXISTS utm_term TEXT;

-- 5. Click IDs (paid traffic attribution)
ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS fbclid TEXT,
    ADD COLUMN IF NOT EXISTS gclid TEXT,
    ADD COLUMN IF NOT EXISTS ttclid TEXT;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_session_id
    ON public.leads(session_id)
    WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_visitor_session_db_id
    ON public.leads(visitor_session_db_id)
    WHERE visitor_session_db_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_ip_address
    ON public.leads(ip_address)
    WHERE ip_address IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_fbclid
    ON public.leads(fbclid)
    WHERE fbclid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_gclid
    ON public.leads(gclid)
    WHERE gclid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_utm_source
    ON public.leads(utm_source)
    WHERE utm_source IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_landing_page
    ON public.leads(landing_page)
    WHERE landing_page IS NOT NULL;

-- =====================================================
-- COMMENT on columns for documentation
-- =====================================================

COMMENT ON COLUMN public.leads.session_id IS 'Text session_id from visitor_sessions (for cross-reference)';
COMMENT ON COLUMN public.leads.visitor_session_db_id IS 'FK to visitor_sessions.id (UUID)';
COMMENT ON COLUMN public.leads.ip_address IS 'IP address of the visitor when the lead was created';
COMMENT ON COLUMN public.leads.landing_page IS 'First page URL the visitor landed on';
COMMENT ON COLUMN public.leads.referrer IS 'HTTP referrer URL';
COMMENT ON COLUMN public.leads.utm_source IS 'UTM source parameter (e.g. facebook, google)';
COMMENT ON COLUMN public.leads.utm_medium IS 'UTM medium parameter (e.g. cpc, organic)';
COMMENT ON COLUMN public.leads.utm_campaign IS 'UTM campaign name';
COMMENT ON COLUMN public.leads.utm_content IS 'UTM content parameter';
COMMENT ON COLUMN public.leads.utm_term IS 'UTM term parameter';
COMMENT ON COLUMN public.leads.fbclid IS 'Facebook click ID for conversion attribution';
COMMENT ON COLUMN public.leads.gclid IS 'Google click ID for conversion attribution';
COMMENT ON COLUMN public.leads.ttclid IS 'TikTok click ID for conversion attribution';


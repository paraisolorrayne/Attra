-- =====================================================
-- MIGRATION: Visitor Enrichment & Click IDs
-- Adds click ID tracking (gclid, fbclid, ttclid),
-- confidence_score for enrichment, consent_given for LGPD
-- =====================================================

-- 1. Add click ID columns to visitor_sessions
ALTER TABLE public.visitor_sessions
    ADD COLUMN IF NOT EXISTS gclid TEXT,
    ADD COLUMN IF NOT EXISTS fbclid TEXT,
    ADD COLUMN IF NOT EXISTS ttclid TEXT;

-- 2. Add confidence_score and consent_given to visitor_profiles
ALTER TABLE public.visitor_profiles
    ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,4) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS legitimate_interest_basis TEXT;

-- 3. Add behavioral signals columns to visitor_profiles for enrichment
ALTER TABLE public.visitor_profiles
    ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_page_views INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_product_views INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_dwell_time_seconds INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- 4. Create conversion_events table for Google/Meta API tracking
CREATE TABLE IF NOT EXISTS public.conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_id UUID REFERENCES public.visitor_fingerprints(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.visitor_profiles(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.visitor_sessions(id) ON DELETE SET NULL,

    -- Conversion details
    event_name TEXT NOT NULL, -- 'purchase', 'lead', 'contact', 'whatsapp_click'
    event_value DECIMAL(12,2),
    currency TEXT DEFAULT 'BRL',

    -- Click IDs for attribution
    gclid TEXT,
    fbclid TEXT,
    ttclid TEXT,

    -- Hashed PII for enhanced conversions (SHA256)
    hashed_email TEXT,
    hashed_phone TEXT,

    -- API send status
    sent_to_google BOOLEAN DEFAULT FALSE,
    sent_to_google_at TIMESTAMPTZ,
    google_response JSONB,
    sent_to_meta BOOLEAN DEFAULT FALSE,
    sent_to_meta_at TIMESTAMPTZ,
    meta_response JSONB,

    -- Metadata
    page_path TEXT,
    vehicle_id TEXT,
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_gclid ON public.visitor_sessions(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_fbclid ON public.visitor_sessions(fbclid) WHERE fbclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversion_events_profile ON public.conversion_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created ON public.conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_gclid ON public.conversion_events(gclid) WHERE gclid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_confidence ON public.visitor_profiles(confidence_score);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.visitor_profiles(last_active_at);

-- 6. RLS for conversion_events
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view conversion_events"
    ON public.conversion_events FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true)
    );

CREATE POLICY "Service can insert conversion_events"
    ON public.conversion_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service can update conversion_events"
    ON public.conversion_events FOR UPDATE
    TO authenticated
    USING (true);

GRANT ALL ON public.conversion_events TO authenticated;

-- 7. Function to check if visitor qualifies for sales outreach
-- (confidence > 0.80 AND visited_product_pages >= 4 AND last_event < 10min)
CREATE OR REPLACE FUNCTION public.check_sales_qualification(p_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_profile RECORD;
    v_recent_event BOOLEAN;
BEGIN
    SELECT confidence_score, total_product_views, last_active_at
    INTO v_profile
    FROM public.visitor_profiles
    WHERE id = p_profile_id;

    IF NOT FOUND THEN RETURN FALSE; END IF;

    -- Check last activity within 10 minutes
    v_recent_event := (v_profile.last_active_at > NOW() - INTERVAL '10 minutes');

    RETURN (
        COALESCE(v_profile.confidence_score, 0) > 0.80
        AND COALESCE(v_profile.total_product_views, 0) >= 4
        AND v_recent_event
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to update behavioral signals on visitor_profiles
CREATE OR REPLACE FUNCTION public.update_profile_behavioral_signals(p_profile_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.visitor_profiles
    SET
        total_sessions = (
            SELECT COUNT(*) FROM public.visitor_sessions vs
            JOIN public.visitor_fingerprints vf ON vs.fingerprint_id = vf.id
            WHERE vf.resolved_profile_id = p_profile_id
        ),
        total_page_views = (
            SELECT COALESCE(SUM(vs.page_views_count), 0) FROM public.visitor_sessions vs
            JOIN public.visitor_fingerprints vf ON vs.fingerprint_id = vf.id
            WHERE vf.resolved_profile_id = p_profile_id
        ),
        total_product_views = (
            SELECT COALESCE(SUM(vs.vehicles_viewed), 0) FROM public.visitor_sessions vs
            JOIN public.visitor_fingerprints vf ON vs.fingerprint_id = vf.id
            WHERE vf.resolved_profile_id = p_profile_id
        ),
        last_active_at = NOW(),
        updated_at = NOW()
    WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_sales_qualification TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile_behavioral_signals TO authenticated;


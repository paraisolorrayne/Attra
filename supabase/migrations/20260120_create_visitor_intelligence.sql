-- =====================================================
-- VISITOR INTELLIGENCE & DEANONYMIZATION SYSTEM
-- Sistema de captura e enriquecimento de visitantes
-- =====================================================

-- FUNÇÃO HELPER: Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. VISITOR FINGERPRINTS
-- Armazena identificadores únicos de dispositivos/navegadores
CREATE TABLE IF NOT EXISTS public.visitor_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id TEXT NOT NULL UNIQUE, -- FingerprintJS visitorId

    -- Dados do dispositivo
    browser_name TEXT,
    browser_version TEXT,
    os_name TEXT,
    os_version TEXT,
    device_type TEXT, -- desktop, mobile, tablet
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,

    -- Metadados
    confidence_score DECIMAL(5,4), -- FingerprintJS confidence
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_visits INTEGER DEFAULT 1,

    -- Identity resolution
    resolved_profile_id UUID, -- Link para perfil identificado
    is_bot BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. VISITOR SESSIONS
-- Cada sessão de navegação
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_id UUID NOT NULL REFERENCES public.visitor_fingerprints(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE, -- ID único da sessão

    -- Dados da sessão
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Origem do tráfego
    referrer_url TEXT,
    referrer_domain TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,

    -- Geolocalização (via IP)
    ip_address INET,
    country_code TEXT,
    region TEXT,
    city TEXT,

    -- Métricas
    page_views_count INTEGER DEFAULT 0,
    vehicles_viewed INTEGER DEFAULT 0,

    -- Eventos importantes
    contacted_whatsapp BOOLEAN DEFAULT FALSE,
    submitted_form BOOLEAN DEFAULT FALSE,
    used_calculator BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PAGE VIEWS
-- Histórico de páginas visitadas
CREATE TABLE IF NOT EXISTS public.visitor_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
    fingerprint_id UUID NOT NULL REFERENCES public.visitor_fingerprints(id) ON DELETE CASCADE,

    -- Dados da página
    page_url TEXT NOT NULL,
    page_path TEXT NOT NULL,
    page_title TEXT,
    page_type TEXT, -- home, vehicle, blog, contact, etc.

    -- Para páginas de veículos (vehicle_id como TEXT pois vem da AutoConf API)
    vehicle_id TEXT,
    vehicle_slug TEXT,
    vehicle_brand TEXT,
    vehicle_model TEXT,
    vehicle_price DECIMAL(12,2),

    -- Métricas de engajamento
    time_on_page_seconds INTEGER,
    scroll_depth_percent INTEGER,

    -- Interações
    clicked_whatsapp BOOLEAN DEFAULT FALSE,
    clicked_phone BOOLEAN DEFAULT FALSE,
    clicked_form BOOLEAN DEFAULT FALSE,
    played_engine_sound BOOLEAN DEFAULT FALSE,

    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. VISITOR PROFILES (Perfis identificados/enriquecidos)
CREATE TABLE IF NOT EXISTS public.visitor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificadores
    email TEXT,
    phone TEXT,
    cpf_hash TEXT, -- Hash do CPF para privacidade

    -- Dados pessoais (quando disponíveis)
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,

    -- Dados profissionais (B2B)
    company_name TEXT,
    company_domain TEXT,
    company_industry TEXT,
    company_size TEXT,
    job_title TEXT,
    linkedin_url TEXT,

    -- Enriquecimento
    enrichment_source TEXT, -- clearbit, snov, bigdata, etc.
    enrichment_data JSONB DEFAULT '{}',
    enriched_at TIMESTAMPTZ,

    -- Scores
    lead_score INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,

    -- Status
    status TEXT DEFAULT 'anonymous' CHECK (status IN ('anonymous', 'identified', 'enriched', 'converted')),
    converted_to_lead_id UUID, -- Link para tabela de leads do CRM

    -- LGPD
    consent_marketing BOOLEAN DEFAULT FALSE,
    consent_tracking BOOLEAN DEFAULT TRUE, -- Implícito via cookies
    consent_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 5. IDENTITY EVENTS (Histórico de eventos de identificação)
CREATE TABLE IF NOT EXISTS public.identity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_id UUID REFERENCES public.visitor_fingerprints(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.visitor_profiles(id) ON DELETE SET NULL,

    -- Tipo de evento
    event_type TEXT NOT NULL, -- email_captured, phone_captured, form_submitted, enrichment_success, etc.
    event_data JSONB DEFAULT '{}',
    source TEXT, -- url_param, form, whatsapp, enrichment, etc.

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para identity_events
CREATE INDEX IF NOT EXISTS idx_identity_events_fingerprint ON public.identity_events(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_identity_events_profile ON public.identity_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_identity_events_type ON public.identity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_identity_events_created ON public.identity_events(created_at DESC);


-- 6. IP TO COMPANY MAPPING (Cache de resolução IP -> Empresa)
CREATE TABLE IF NOT EXISTS public.ip_company_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_range_start INET NOT NULL,
    ip_range_end INET NOT NULL,

    -- Dados da empresa
    company_name TEXT NOT NULL,
    company_domain TEXT,
    company_industry TEXT,
    company_size TEXT,
    company_linkedin TEXT,

    -- Metadados
    source TEXT NOT NULL, -- clearbit, snov, bigdata, manual
    confidence DECIMAL(5,4),

    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_fingerprints_visitor_id ON public.visitor_fingerprints(visitor_id);
CREATE INDEX idx_fingerprints_resolved_profile ON public.visitor_fingerprints(resolved_profile_id);
CREATE INDEX idx_fingerprints_last_seen ON public.visitor_fingerprints(last_seen_at);

CREATE INDEX idx_sessions_fingerprint ON public.visitor_sessions(fingerprint_id);
CREATE INDEX idx_sessions_started_at ON public.visitor_sessions(started_at);
CREATE INDEX idx_sessions_ip ON public.visitor_sessions(ip_address);

CREATE INDEX idx_page_views_session ON public.visitor_page_views(session_id);
CREATE INDEX idx_page_views_fingerprint ON public.visitor_page_views(fingerprint_id);
CREATE INDEX idx_page_views_vehicle ON public.visitor_page_views(vehicle_id);
CREATE INDEX idx_page_views_viewed_at ON public.visitor_page_views(viewed_at);

CREATE INDEX idx_profiles_email ON public.visitor_profiles(email);
CREATE INDEX idx_profiles_phone ON public.visitor_profiles(phone);
CREATE INDEX idx_profiles_status ON public.visitor_profiles(status);
CREATE INDEX idx_profiles_lead_score ON public.visitor_profiles(lead_score);

CREATE INDEX idx_ip_cache_range ON public.ip_company_cache USING gist (ip_range_start inet_ops, ip_range_end inet_ops);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.visitor_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_company_cache ENABLE ROW LEVEL SECURITY;

-- Políticas: Apenas admins podem ver dados de visitantes
CREATE POLICY "Admin can view fingerprints"
    ON public.visitor_fingerprints FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true)
    );

CREATE POLICY "Admin can view sessions"
    ON public.visitor_sessions FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true)
    );

CREATE POLICY "Admin can view page_views"
    ON public.visitor_page_views FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true)
    );

CREATE POLICY "Admin can view profiles"
    ON public.visitor_profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true)
    );

CREATE POLICY "Admin can view identity_events"
    ON public.identity_events FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() AND admin_users.is_active = true)
    );

-- Service role pode inserir dados (via APIs)
CREATE POLICY "Service can insert fingerprints"
    ON public.visitor_fingerprints FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service can insert sessions"
    ON public.visitor_sessions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service can insert page_views"
    ON public.visitor_page_views FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service can insert profiles"
    ON public.visitor_profiles FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Service can insert identity_events"
    ON public.identity_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Permitir updates em fingerprints e profiles
CREATE POLICY "Service can update fingerprints"
    ON public.visitor_fingerprints FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Service can update profiles"
    ON public.visitor_profiles FOR UPDATE
    TO authenticated
    USING (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER set_fingerprints_updated_at
    BEFORE UPDATE ON public.visitor_fingerprints
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.visitor_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON public.visitor_fingerprints TO authenticated;
GRANT ALL ON public.visitor_sessions TO authenticated;
GRANT ALL ON public.visitor_page_views TO authenticated;
GRANT ALL ON public.visitor_profiles TO authenticated;
GRANT ALL ON public.identity_events TO authenticated;
GRANT ALL ON public.ip_company_cache TO authenticated;


-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment session page views
CREATE OR REPLACE FUNCTION public.increment_session_page_views(
    p_session_id UUID,
    is_vehicle BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.visitor_sessions
    SET
        page_views_count = page_views_count + 1,
        vehicles_viewed = CASE WHEN is_vehicle THEN vehicles_viewed + 1 ELSE vehicles_viewed END
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate lead score based on behavior
CREATE OR REPLACE FUNCTION public.calculate_lead_score(p_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    v_total_visits INTEGER;
    v_vehicles_viewed INTEGER;
    v_whatsapp_clicks INTEGER;
    v_form_submits INTEGER;
    v_has_email BOOLEAN;
    v_has_phone BOOLEAN;
BEGIN
    -- Get profile data
    SELECT
        email IS NOT NULL,
        phone IS NOT NULL
    INTO v_has_email, v_has_phone
    FROM public.visitor_profiles
    WHERE id = p_profile_id;

    -- Base score for having contact info
    IF v_has_email THEN score := score + 20; END IF;
    IF v_has_phone THEN score := score + 20; END IF;

    -- Get behavior metrics from fingerprints linked to this profile
    SELECT
        COALESCE(SUM(f.total_visits), 0),
        COALESCE(SUM(s.vehicles_viewed), 0),
        COALESCE(COUNT(CASE WHEN s.contacted_whatsapp THEN 1 END), 0),
        COALESCE(COUNT(CASE WHEN s.submitted_form THEN 1 END), 0)
    INTO v_total_visits, v_vehicles_viewed, v_whatsapp_clicks, v_form_submits
    FROM public.visitor_fingerprints f
    LEFT JOIN public.visitor_sessions s ON s.fingerprint_id = f.id
    WHERE f.resolved_profile_id = p_profile_id;

    -- Score for visits (max 20 points)
    score := score + LEAST(v_total_visits * 2, 20);

    -- Score for vehicle views (max 30 points)
    score := score + LEAST(v_vehicles_viewed * 5, 30);

    -- Score for WhatsApp clicks (10 points each, max 30)
    score := score + LEAST(v_whatsapp_clicks * 10, 30);

    -- Score for form submissions (20 points each, max 40)
    score := score + LEAST(v_form_submits * 20, 40);

    RETURN LEAST(score, 100); -- Cap at 100
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_session_page_views TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_lead_score TO authenticated;

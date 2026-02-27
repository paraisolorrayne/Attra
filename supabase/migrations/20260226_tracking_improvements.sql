-- =====================================================
-- MIGRATION: Tracking Improvements
-- Adiciona colunas faltantes para geolocalização,
-- heartbeat, scroll depth e metadata de engajamento
-- =====================================================

-- 1. Adicionar last_activity_at em visitor_sessions para heartbeat
ALTER TABLE public.visitor_sessions
    ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Adicionar metadata JSONB em visitor_page_views para eventos extras
ALTER TABLE public.visitor_page_views
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 3. Adicionar event_id para deduplicação de eventos
ALTER TABLE public.visitor_page_views
    ADD COLUMN IF NOT EXISTS event_id TEXT;

-- 4. Indexes faltantes para performance de queries
CREATE INDEX IF NOT EXISTS idx_sessions_country_code
    ON public.visitor_sessions(country_code)
    WHERE country_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ip_cache_ip_address
    ON public.ip_company_cache(ip_range_start);

CREATE INDEX IF NOT EXISTS idx_page_views_event_id
    ON public.visitor_page_views(event_id)
    WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_last_activity
    ON public.visitor_sessions(last_activity_at);

-- 5. Política de UPDATE para visitor_sessions (necessária para heartbeat/geo update)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'visitor_sessions'
          AND policyname = 'Service can update sessions'
    ) THEN
        CREATE POLICY "Service can update sessions"
            ON public.visitor_sessions FOR UPDATE
            TO authenticated
            USING (true);
    END IF;
END $$;

-- 6. Política de UPDATE para visitor_page_views (necessária para scroll depth e page time)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'visitor_page_views'
          AND policyname = 'Service can update page_views'
    ) THEN
        CREATE POLICY "Service can update page_views"
            ON public.visitor_page_views FOR UPDATE
            TO authenticated
            USING (true);
    END IF;
END $$;

-- 7. Função para atualizar heartbeat da sessão
CREATE OR REPLACE FUNCTION public.update_session_heartbeat(
    p_session_db_id UUID,
    p_duration_seconds INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.visitor_sessions
    SET
        last_activity_at = NOW(),
        duration_seconds = COALESCE(p_duration_seconds, duration_seconds),
        ended_at = NOW()
    WHERE id = p_session_db_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.update_session_heartbeat TO authenticated;

-- 8. Tabela de cache de geolocalização por IP (simplificada, sem range)
CREATE TABLE IF NOT EXISTS public.ip_geolocation_cache (
    ip_address INET PRIMARY KEY,
    country_code TEXT,
    region TEXT,
    city TEXT,
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- RLS
ALTER TABLE public.ip_geolocation_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'ip_geolocation_cache'
          AND policyname = 'Service can manage ip_geolocation_cache'
    ) THEN
        CREATE POLICY "Service can manage ip_geolocation_cache"
            ON public.ip_geolocation_cache FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

GRANT ALL ON public.ip_geolocation_cache TO authenticated;


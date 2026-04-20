-- =====================================================
-- MIGRATION: Add campaign identifier columns to visitor_sessions
-- Espelha as colunas utm_id/adset_id/ad_id de `leads` para que a
-- tabela de sessões também retenha o ID da campanha de primeiro
-- contato. Facilita queries de atribuição por sessão.
-- =====================================================

ALTER TABLE public.visitor_sessions
    ADD COLUMN IF NOT EXISTS utm_id   TEXT,
    ADD COLUMN IF NOT EXISTS adset_id TEXT,
    ADD COLUMN IF NOT EXISTS ad_id    TEXT;

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_utm_id
    ON public.visitor_sessions(utm_id)
    WHERE utm_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_adset_id
    ON public.visitor_sessions(adset_id)
    WHERE adset_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ad_id
    ON public.visitor_sessions(ad_id)
    WHERE ad_id IS NOT NULL;

COMMENT ON COLUMN public.visitor_sessions.utm_id   IS 'GA4 Campaign ID (utm_id)';
COMMENT ON COLUMN public.visitor_sessions.adset_id IS 'Meta adset_id / Google ad_group_id';
COMMENT ON COLUMN public.visitor_sessions.ad_id    IS 'Meta ad_id / Google creative_id';

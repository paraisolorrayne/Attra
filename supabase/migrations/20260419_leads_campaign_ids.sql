-- =====================================================
-- MIGRATION: Add campaign identifier columns to leads
-- Permite rastrear o ID da campanha / adset / ad (além
-- do nome em utm_campaign). Padrão GA4 é utm_id;
-- Google Ads usa {campaignid} e Meta usa campaign_id.
-- =====================================================

ALTER TABLE public.leads
    ADD COLUMN IF NOT EXISTS utm_id TEXT,
    ADD COLUMN IF NOT EXISTS adset_id TEXT,
    ADD COLUMN IF NOT EXISTS ad_id TEXT;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_utm_id
    ON public.leads(utm_id)
    WHERE utm_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_adset_id
    ON public.leads(adset_id)
    WHERE adset_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_ad_id
    ON public.leads(ad_id)
    WHERE ad_id IS NOT NULL;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN public.leads.utm_id IS 'GA4 Campaign ID (utm_id) — ID único da campanha na plataforma de origem';
COMMENT ON COLUMN public.leads.adset_id IS 'Meta adset_id / Google ad_group_id — ID do conjunto de anúncios';
COMMENT ON COLUMN public.leads.ad_id IS 'Meta ad_id / Google creative_id — ID do criativo/anúncio';

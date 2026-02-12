-- Marketing Campaigns Tables
-- Board-style campaign management: Publicada → Encerrada por ganho / Encerrada por desempenho

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'publicada' CHECK (status IN ('publicada', 'encerrada_ganho', 'encerrada_desempenho')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaign_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
    vehicle_name TEXT NOT NULL,
    added_date DATE,
    notes TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS: Admin full access
CREATE POLICY "Admin can manage campaigns"
    ON public.marketing_campaigns FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

-- RLS: Gerente can view campaigns
CREATE POLICY "Gerente can view campaigns"
    ON public.marketing_campaigns FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- RLS: Admin full access to campaign_vehicles
CREATE POLICY "Admin can manage campaign vehicles"
    ON public.campaign_vehicles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

-- RLS: Gerente can view campaign vehicles
CREATE POLICY "Gerente can view campaign vehicles"
    ON public.campaign_vehicles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_active = true
        )
    );

-- Trigger for updated_at
CREATE TRIGGER marketing_campaigns_updated_at
    BEFORE UPDATE ON public.marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_vehicles_campaign ON public.campaign_vehicles(campaign_id);

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_vehicles TO authenticated;


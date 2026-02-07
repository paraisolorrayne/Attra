-- Create site_settings table for global site configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT 'true'::jsonb,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read settings (needed for frontend components)
CREATE POLICY "Anyone can read site settings"
    ON public.site_settings FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy: Only admin users can update settings
CREATE POLICY "Admin users can update site settings"
    ON public.site_settings FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

-- Policy: Only admin users can insert settings
CREATE POLICY "Admin users can insert site settings"
    ON public.site_settings FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'admin'
            AND admin_users.is_active = true
        )
    );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_site_settings_updated_at();

-- Insert default settings (audio features enabled by default)
INSERT INTO public.site_settings (key, value, description) VALUES
    ('listen_to_content_enabled', 'true', 'Habilita/desabilita a leitura em voz alta nos artigos do blog'),
    ('engine_sound_section_enabled', 'true', 'Habilita/desabilita a seção Som do Motor na página inicial')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings(key);

-- Grant permissions
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;


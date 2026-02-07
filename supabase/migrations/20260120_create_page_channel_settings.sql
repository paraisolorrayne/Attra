-- Create page_channel_settings table for controlling Leadster/WhatsApp behavior per page
-- This table stores which pages should use Leadster static chat vs direct WhatsApp redirect

CREATE TABLE IF NOT EXISTS public.page_channel_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Page identification
    page_path TEXT NOT NULL UNIQUE,  -- e.g., '/estoque', '/financiamento', '/veiculo/*'
    page_name TEXT NOT NULL,          -- Human readable name: "Estoque", "Financiamento"
    
    -- Channel behavior configuration
    -- 'leadster_static' = Chat widget without AI (just captures messages)
    -- 'leadster_ai' = Chat widget with AI responses
    -- 'whatsapp_direct' = Direct redirect to WhatsApp
    -- 'default' = Use automatic detection based on page type
    channel_behavior TEXT NOT NULL DEFAULT 'default' CHECK (
        channel_behavior IN ('leadster_static', 'leadster_ai', 'whatsapp_direct', 'default')
    ),
    
    -- Optional: Custom greeting message for this page
    custom_greeting TEXT,
    
    -- Optional: Custom WhatsApp message template
    custom_whatsapp_message TEXT,
    
    -- Enable/disable for this specific page
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.page_channel_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read settings (needed for frontend)
CREATE POLICY "Anyone can read page channel settings"
    ON public.page_channel_settings FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy: Only admins can modify (will be enforced in API)
CREATE POLICY "Authenticated users can modify page channel settings"
    ON public.page_channel_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create index for fast page lookup
CREATE INDEX IF NOT EXISTS idx_page_channel_settings_page_path 
    ON public.page_channel_settings(page_path);

-- Insert default configurations for common pages
INSERT INTO public.page_channel_settings (page_path, page_name, channel_behavior, custom_greeting) VALUES
    ('/', 'Página Inicial', 'leadster_ai', 'Olá! Bem-vindo à Attra Veículos. Como posso ajudar?'),
    ('/estoque', 'Estoque', 'leadster_static', 'Olá! Procurando algo específico? Um consultor entrará em contato em breve.'),
    ('/estoque/*', 'Páginas de Estoque (Filtros)', 'leadster_static', NULL),
    ('/veiculo/*', 'Página de Veículo', 'whatsapp_direct', NULL),
    ('/financiamento', 'Financiamento', 'leadster_ai', 'Olá! Posso ajudar com informações sobre financiamento.'),
    ('/servicos', 'Serviços', 'leadster_ai', 'Olá! Precisa de informações sobre nossos serviços?'),
    ('/contato', 'Contato', 'leadster_ai', 'Olá! Como podemos ajudar você hoje?'),
    ('/blog', 'Blog', 'leadster_ai', NULL),
    ('/blog/*', 'Artigos do Blog', 'leadster_ai', NULL),
    ('/sobre', 'Sobre', 'leadster_ai', NULL),
    ('/jornada-cliente', 'Jornada do Cliente', 'leadster_ai', 'Olá! Quer agendar uma visita ao nosso showroom?')
ON CONFLICT (page_path) DO NOTHING;

-- Add comment explaining the table
COMMENT ON TABLE public.page_channel_settings IS 
    'Stores per-page configuration for Leadster/WhatsApp button behavior. Allows admin to control whether each page uses Leadster static chat, Leadster AI chat, or direct WhatsApp redirect.';

COMMENT ON COLUMN public.page_channel_settings.channel_behavior IS 
    'The channel behavior for this page: leadster_static (chat without AI), leadster_ai (chat with AI), whatsapp_direct (redirect to WhatsApp), or default (auto-detect)';

COMMENT ON COLUMN public.page_channel_settings.page_path IS 
    'The URL path pattern. Supports wildcards with * for matching subpages (e.g., /veiculo/* matches /veiculo/honda-civic)';


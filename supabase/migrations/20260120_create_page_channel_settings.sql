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
-- Most pages use whatsapp_direct for immediate customer contact
INSERT INTO public.page_channel_settings (page_path, page_name, channel_behavior, custom_greeting) VALUES
    ('/', 'Página Inicial', 'whatsapp_direct', NULL),
    ('/estoque', 'Estoque', 'whatsapp_direct', NULL),
    ('/estoque/*', 'Páginas de Estoque (Filtros)', 'whatsapp_direct', NULL),
    ('/veiculo/*', 'Página de Veículo', 'whatsapp_direct', NULL),
    ('/financiamento', 'Financiamento', 'whatsapp_direct', NULL),
    ('/servicos', 'Serviços', 'whatsapp_direct', NULL),
    ('/servicos/*', 'Páginas de Serviços', 'whatsapp_direct', NULL),
    ('/contato', 'Contato', 'whatsapp_direct', NULL),
    ('/blog', 'Blog', 'whatsapp_direct', NULL),
    ('/blog/*', 'Artigos do Blog', 'whatsapp_direct', NULL),
    ('/sobre', 'Sobre', 'whatsapp_direct', NULL),
    ('/jornada', 'Jornada do Cliente', 'whatsapp_direct', NULL),
    ('/jornada-cliente', 'Jornada do Cliente (Alternativo)', 'whatsapp_direct', NULL)
ON CONFLICT (page_path) DO NOTHING;

-- Add comment explaining the table
COMMENT ON TABLE public.page_channel_settings IS 
    'Stores per-page configuration for Leadster/WhatsApp button behavior. Allows admin to control whether each page uses Leadster static chat, Leadster AI chat, or direct WhatsApp redirect.';

COMMENT ON COLUMN public.page_channel_settings.channel_behavior IS 
    'The channel behavior for this page: leadster_static (chat without AI), leadster_ai (chat with AI), whatsapp_direct (redirect to WhatsApp), or default (auto-detect)';

COMMENT ON COLUMN public.page_channel_settings.page_path IS 
    'The URL path pattern. Supports wildcards with * for matching subpages (e.g., /veiculo/* matches /veiculo/honda-civic)';


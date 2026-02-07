-- =====================================================
-- SEED: Marketing Tasks Q1 2026
-- Execute este script APÓS a migração das tabelas
-- =====================================================

-- Primeiro, vamos criar uma estratégia para agrupar as tarefas
INSERT INTO public.marketing_strategies (name, description, category, status, start_date, end_date, goals)
VALUES (
    'Planejamento Q1 2026',
    'Estratégia de marketing para o primeiro trimestre de 2026, focando em branding, conteúdo e expansão de canais.',
    'other',
    'active',
    '2026-01-01',
    '2026-03-31',
    '["Aumentar presença digital", "Definir posicionamento de marca", "Expandir para novas redes sociais", "Criar fluxo de nutrição de leads"]'::jsonb
);

-- Guardar o ID da estratégia
DO $$
DECLARE
    strategy_id UUID;
BEGIN
    SELECT id INTO strategy_id FROM public.marketing_strategies WHERE name = 'Planejamento Q1 2026' LIMIT 1;

    -- =====================================================
    -- TAREFAS PRIORITÁRIAS (High Priority) - Status: backlog
    -- =====================================================
    
    -- 1. API de conversões
    INSERT INTO public.marketing_tasks (title, description, strategy_id, category, status, priority, due_date, estimated_hours)
    VALUES (
        'API de conversões',
        'Implementar API para rastreamento de conversões de leads e vendas. Integrar com Google Analytics, Meta Pixel e outras plataformas de ads.',
        strategy_id,
        'other',
        'backlog',
        'high',
        '2026-02-15',
        40
    );

    -- 2. Cronograma de conteúdos de nutrição
    INSERT INTO public.marketing_tasks (title, description, strategy_id, category, status, priority, due_date, estimated_hours)
    VALUES (
        'Cronograma de conteúdos de nutrição',
        'Desenvolver calendário editorial completo para nutrição de leads. Incluir e-mails, posts de blog e conteúdos para redes sociais. Responsável: Todos.',
        strategy_id,
        'content',
        'backlog',
        'high',
        '2026-01-31',
        24
    );

    -- 3. Planejamento de eventos
    INSERT INTO public.marketing_tasks (title, description, strategy_id, category, status, priority, due_date, estimated_hours)
    VALUES (
        'Planejamento de eventos',
        'Definir calendário de eventos para Q1/Q2 2026. Incluir feiras, encontros de carros, e eventos próprios da Attra. Responsável: Todos.',
        strategy_id,
        'events',
        'backlog',
        'high',
        '2026-02-28',
        16
    );

    -- 4. Discovery de branding
    INSERT INTO public.marketing_tasks (title, description, strategy_id, category, status, priority, due_date, estimated_hours)
    VALUES (
        'Discovery de branding - Análise de posicionamento',
        'Realizar análise de posicionamento de marca baseada na percepção da Cris e Thiago. Definir tom de voz, valores, proposta de valor única e diretrizes visuais. Responsável: Marketing + Tech.',
        strategy_id,
        'other',
        'backlog',
        'high',
        '2026-02-10',
        32
    );

    -- 5. Implementação TikTok + X (Twitter)
    INSERT INTO public.marketing_tasks (title, description, strategy_id, category, status, priority, due_date, estimated_hours)
    VALUES (
        'Implementação TikTok + X (Twitter)',
        'Criar e configurar perfis oficiais no TikTok e X (Twitter). Definir estratégia de conteúdo específica para cada plataforma. Responsável: Marketing.',
        strategy_id,
        'social_media',
        'backlog',
        'high',
        '2026-02-20',
        20
    );

    -- =====================================================
    -- TAREFAS MÉDIAS (Medium Priority)
    -- =====================================================

    -- 6. Criação de checklist para conteúdos
    INSERT INTO public.marketing_tasks (title, description, strategy_id, category, status, priority, due_date, estimated_hours)
    VALUES (
        'Criação de checklist para conteúdos',
        'Desenvolver checklist padronizado para criação de conteúdos. Incluir SEO, formatação, revisão, aprovação e publicação.',
        strategy_id,
        'content',
        'backlog',
        'medium',
        '2026-03-15',
        8
    );

    -- 7. Revisão da estrutura de páginas
    INSERT INTO public.marketing_tasks (title, description, strategy_id, category, status, priority, due_date, estimated_hours)
    VALUES (
        'Revisão da estrutura de páginas (rede social ↔ blog ↔ página do carro)',
        'Analisar e otimizar a estrutura de navegação entre redes sociais, blog e páginas de veículos. Garantir fluxo consistente e CTAs claros.',
        strategy_id,
        'content',
        'backlog',
        'medium',
        '2026-03-20',
        16
    );

    -- =====================================================
    -- BACKLOG DE IDEIAS (Low Priority)
    -- =====================================================

    -- 8. Vídeos com som do motor
    INSERT INTO public.marketing_tasks (title, description, strategy_id, category, status, priority, due_date, estimated_hours)
    VALUES (
        'Desenvolver formato de postagem de vídeo com trechos de som do motor',
        'Criar template de vídeo no estilo mosaico com trechos de som do motor dos veículos. Referência: vídeos estilo grid/mosaico populares no TikTok e Reels.',
        strategy_id,
        'social_media',
        'backlog',
        'low',
        NULL,  -- Sem data definida para backlog
        12
    );

END $$;

-- =====================================================
-- Verificar tarefas inseridas
-- =====================================================
SELECT 
    title,
    category,
    status,
    priority,
    due_date,
    estimated_hours
FROM public.marketing_tasks
ORDER BY 
    CASE priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END,
    due_date NULLS LAST;


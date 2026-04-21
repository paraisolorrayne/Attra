-- Migration: Blog AI Automation
-- Date: 2026-04-20
-- Purpose: Track daily AI-generated blog posts and schedule the cron via pg_cron.
--
-- The endpoint that actually generates content lives at /api/cron/blog-ai.
-- pg_cron + pg_net call it once a day. The blog_ai_generations table gives us
-- idempotency (don't generate twice for the same day) and an audit trail.

-- Extensions required for HTTP cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Tracking table for every AI blog run
CREATE TABLE IF NOT EXISTS public.blog_ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- When the job ran (date-only for idempotency checks, timestamp for audit)
    run_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
    run_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Strategy chosen this run:
    --   'instagram'  -> adapted from an IG post (yesterday)
    --   'review'     -> car review (single car > R$300k)
    --   'comparison' -> comparison between two cars
    --   'skipped'    -> nothing generated (already ran today, or no content source)
    strategy TEXT NOT NULL CHECK (strategy IN ('instagram', 'review', 'comparison', 'skipped')),

    -- Link to the published post (NULL when strategy = 'skipped' or on failure)
    blog_post_id UUID REFERENCES public.dual_blog_posts(id) ON DELETE SET NULL,

    -- Source references (which IG post, which vehicle IDs, etc.)
    source JSONB NOT NULL DEFAULT '{}',

    -- Outcome
    success BOOLEAN NOT NULL DEFAULT false,
    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_ai_generations_run_date
    ON public.blog_ai_generations(run_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_ai_generations_strategy
    ON public.blog_ai_generations(strategy);

-- Row Level Security: admin-only via service role (which bypasses RLS anyway)
ALTER TABLE public.blog_ai_generations ENABLE ROW LEVEL SECURITY;

-- No public policies: this table is written/read only by the service role.

-- ============================================================================
-- Cron schedule
--
-- Supabase hosted Postgres does not grant permission to run ALTER DATABASE SET,
-- so URL and secret are embedded directly inside the cron body. The cron.job
-- table is only accessible via the service role, which is acceptable.
--
-- To rotate the CRON_SECRET: re-run this file (or just the cron.schedule call
-- below) with the new value — cron.unschedule() above makes this idempotent.
-- ============================================================================

-- Schedule the daily run at 08:00 BRT (11:00 UTC).
DO $$
BEGIN
    PERFORM cron.unschedule('daily-blog-ai')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-blog-ai');
EXCEPTION WHEN OTHERS THEN
    -- If the job didn't exist, ignore.
    NULL;
END $$;

SELECT cron.schedule(
    'daily-blog-ai',
    '0 11 * * *',
    $$
    SELECT net.http_post(
        url     := 'https://attraveiculos.com.br/api/cron/blog-ai',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer 7ebccf573c72d2e69ad542c00a28621a6231dce696f37574b9dd532d2f5407ec'
        ),
        body    := '{}'::jsonb
    ) AS request_id;
    $$
);

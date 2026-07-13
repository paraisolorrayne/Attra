-- Faxina inicial do banco (executar UMA vez, via psql com a connection
-- string do Session pooler):
--   psql "postgresql://..." -v ON_ERROR_STOP=1 -f deploy/db-faxina-inicial.sql
--
-- Contexto: inventory_snapshots acumulou 294k linhas com o estoque inteiro
-- em JSONB cada (≈40 GB). DELETE convencional estoura o statement_timeout;
-- aqui salvamos as 5 mais recentes por source, TRUNCATE (libera o disco na
-- hora) e reinserimos. A manutenção diária fica por conta do cron
-- attra-cleanup-tracking + poda automática no save.

SET statement_timeout = 0;

-- Tamanho antes
SELECT 'ANTES: ' || pg_size_pretty(pg_database_size(current_database()));

-- 1) inventory_snapshots: mantém só as 5 mais recentes por source
BEGIN;

CREATE TEMP TABLE keep_snapshots AS
SELECT id, source, payload, vehicle_count, created_at
FROM (
    SELECT *, row_number() OVER (PARTITION BY source ORDER BY created_at DESC) AS rn
    FROM public.inventory_snapshots
) ranked
WHERE rn <= 5;

TRUNCATE public.inventory_snapshots;

INSERT INTO public.inventory_snapshots (id, source, payload, vehicle_count, created_at)
SELECT id, source, payload, vehicle_count, created_at FROM keep_snapshots;

COMMIT;

SELECT 'inventory_snapshots agora: ' || count(*) || ' linhas' FROM public.inventory_snapshots;

-- 2) Tracking com mais de 60 dias (a função agora só encontra volume pequeno)
SELECT * FROM public.cleanup_old_tracking_data(60);

-- 3) Recupera o espaço das tabelas de tracking
VACUUM FULL public.visitor_sessions;
VACUUM FULL public.visitor_page_views;
VACUUM FULL public.identity_events;
VACUUM ANALYZE public.inventory_snapshots;

-- Tamanho depois
SELECT 'DEPOIS: ' || pg_size_pretty(pg_database_size(current_database()));

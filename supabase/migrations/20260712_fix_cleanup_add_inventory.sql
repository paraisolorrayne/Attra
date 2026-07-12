-- Correção da retenção de dados (2026-07-12), motivada pelo estouro da cota:
--
-- 1. inventory_snapshots tinha 294.871 linhas — cada save insere o estoque
--    inteiro em JSONB, mas o código só lê a ÚLTIMA linha por source
--    (src/lib/inventory-snapshot.ts). Regra nova: manter as 5 mais recentes
--    por source, apagar o resto.
-- 2. A versão anterior da função quebrava em produção: deletava de
--    ip_geolocation_cache / ip_company_cache, que NÃO existem no banco real
--    (migrations nunca aplicadas). Agora cada tabela é protegida por
--    to_regclass() — tabela ausente vira linha "skipped" no retorno.
--
-- Aplicar no SQL Editor do painel (ou via psql). Depois da 1ª execução,
-- rodar VACUUM FULL nas tabelas grandes para devolver o espaço:
--   VACUUM FULL public.inventory_snapshots;
--   VACUUM FULL public.visitor_sessions;
--   VACUUM FULL public.visitor_page_views;

CREATE OR REPLACE FUNCTION public.cleanup_old_tracking_data(
    retention_days INTEGER DEFAULT 60
)
RETURNS TABLE (
    table_name TEXT,
    rows_deleted BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cutoff_date TIMESTAMPTZ := NOW() - (retention_days || ' days')::INTERVAL;
    v_count BIGINT;
    t TEXT;
    time_tables CONSTANT TEXT[][] := ARRAY[
        ['visitor_page_views',   'viewed_at'],
        ['visitor_sessions',     'started_at'],
        ['identity_events',      'created_at'],
        ['ip_geolocation_cache', 'cached_at'],
        ['ip_company_cache',     'cached_at']
    ];
    i INTEGER;
BEGIN
    -- Tabelas com retenção por tempo (tolerante a tabela ausente)
    FOR i IN 1 .. array_length(time_tables, 1) LOOP
        t := time_tables[i][1];
        IF to_regclass('public.' || t) IS NULL THEN
            table_name := t; rows_deleted := -1; RETURN NEXT; -- -1 = tabela não existe
            CONTINUE;
        END IF;
        EXECUTE format(
            'DELETE FROM public.%I WHERE %I < $1', t, time_tables[i][2]
        ) USING cutoff_date;
        GET DIAGNOSTICS v_count = ROW_COUNT;
        table_name := t; rows_deleted := v_count; RETURN NEXT;
    END LOOP;

    -- inventory_snapshots: manter só as 5 mais recentes por source
    IF to_regclass('public.inventory_snapshots') IS NOT NULL THEN
        DELETE FROM public.inventory_snapshots
        WHERE id NOT IN (
            SELECT id FROM (
                SELECT id,
                       row_number() OVER (PARTITION BY source ORDER BY created_at DESC) AS rn
                FROM public.inventory_snapshots
            ) ranked
            WHERE rn <= 5
        );
        GET DIAGNOSTICS v_count = ROW_COUNT;
        table_name := 'inventory_snapshots'; rows_deleted := v_count; RETURN NEXT;
    ELSE
        table_name := 'inventory_snapshots'; rows_deleted := -1; RETURN NEXT;
    END IF;

    RETURN;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_tracking_data IS
    'Retenção: apaga tracking/caches > retention_days (default 60) e mantém só os 5 inventory_snapshots mais recentes por source. rows_deleted = -1 indica tabela inexistente (pulada).';

GRANT EXECUTE ON FUNCTION public.cleanup_old_tracking_data(INTEGER) TO service_role;

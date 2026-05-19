-- Table: vehicle_hero_asset
-- Cacheia a versão sem background da foto principal de cada veículo
-- que aparece no Hero da home. Processamento via Replicate (rembg model)
-- é caro (custo $0.005 / latência ~5-10s), então cacheamos a URL pública
-- do Supabase Storage e referenciamos por vehicle_id.
--
-- Reprocessamento acontece apenas quando o `source_photo_url` muda
-- (sinal de que a foto principal do veículo foi trocada no Autoconf).
CREATE TABLE IF NOT EXISTS vehicle_hero_asset (
    id                   BIGSERIAL PRIMARY KEY,
    vehicle_id           INTEGER   NOT NULL UNIQUE,
    vehicle_slug         TEXT      NOT NULL,

    -- URL da foto original (do array vehicle.photos[0]). Se mudar, invalida.
    source_photo_url     TEXT      NOT NULL,

    -- Path do arquivo PNG/WebP transparente no bucket Supabase Storage.
    no_bg_storage_path   TEXT      NOT NULL,

    -- URL pública gerada por supabase.storage.getPublicUrl(). Cacheada
    -- para evitar uma chamada extra de getPublicUrl no SSR.
    no_bg_public_url     TEXT      NOT NULL,

    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_hero_asset_vehicle_id
    ON vehicle_hero_asset (vehicle_id);

-- RLS: anon pode ler (renderiza no SSR público), só service_role escreve
ALTER TABLE vehicle_hero_asset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_hero_asset"
    ON vehicle_hero_asset FOR SELECT
    TO anon USING (true);

CREATE POLICY "auth_read_hero_asset"
    ON vehicle_hero_asset FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "service_write_hero_asset"
    ON vehicle_hero_asset FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_vehicle_hero_asset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_hero_asset_updated_at
    BEFORE UPDATE ON vehicle_hero_asset
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_hero_asset_updated_at();

-- Storage bucket: 'vehicle-hero-assets' (public read)
-- Criar manualmente via Supabase Dashboard → Storage → New Bucket:
--   Name: vehicle-hero-assets
--   Public: true
--   File size limit: 5MB
--   Allowed MIME types: image/png, image/webp

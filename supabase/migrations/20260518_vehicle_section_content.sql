-- Table: vehicle_section_content
-- Cacheia o resultado da classificação Gemini Vision + copy editorial Gemini Text
-- para as 3 seções da página de detalhe: OVERVIEW, EXTERIOR DESIGN, INTERIOR.
--
-- Why: Autoconf devolve ~20 fotos por veículo sem categoria. Chamar Gemini Vision
-- a cada page-view custa $$ e adiciona latência. Esta tabela guarda a foto
-- escolhida por categoria + copy gerada, invalidando apenas quando photo_count
-- muda (sinal de fotos novas/removidas no Autoconf).
CREATE TABLE IF NOT EXISTS vehicle_section_content (
    id                   BIGSERIAL PRIMARY KEY,
    vehicle_id           INTEGER   NOT NULL UNIQUE,
    vehicle_slug         TEXT      NOT NULL,

    -- Snapshot da contagem de fotos no momento da classificação.
    -- Se o Autoconf devolver número diferente em vista futura, invalidamos
    -- e reclassificamos (fotos foram adicionadas/removidas).
    photo_count          INTEGER   NOT NULL,

    -- URLs das 3 fotos escolhidas por categoria. Vêm direto do array
    -- vehicle.photos do Autoconf — não baixamos nem armazenamos a imagem.
    overview_photo_url   TEXT      NOT NULL,
    exterior_photo_url   TEXT      NOT NULL,
    interior_photo_url   TEXT      NOT NULL,

    -- Copy editorial gerada por Gemini Text (1-2 frases, factual,
    -- sem adjetivos exagerados conforme prompt).
    overview_copy        TEXT,
    exterior_copy        TEXT,
    interior_copy        TEXT,

    -- Timestamps independentes — classificação e copy podem ser geradas
    -- em momentos diferentes (ex: classificação ok, copy falhou e foi
    -- regenerada em retry).
    classified_at        TIMESTAMPTZ DEFAULT NOW(),
    copy_generated_at    TIMESTAMPTZ,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_section_content_vehicle_id
    ON vehicle_section_content (vehicle_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_section_content_slug
    ON vehicle_section_content (vehicle_slug);

-- RLS: anon pode ler (renderiza no SSR público), só service_role escreve
ALTER TABLE vehicle_section_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_section_content"
    ON vehicle_section_content FOR SELECT
    TO anon USING (true);

CREATE POLICY "auth_read_section_content"
    ON vehicle_section_content FOR SELECT
    TO authenticated USING (true);

CREATE POLICY "service_write_section_content"
    ON vehicle_section_content FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_vehicle_section_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_section_content_updated_at
    BEFORE UPDATE ON vehicle_section_content
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_section_content_updated_at();

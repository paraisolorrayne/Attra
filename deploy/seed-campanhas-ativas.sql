-- Seed das campanhas ativas do Marketing (estrutura de 15/07/2026, fornecida
-- pela Lorrayne). Idempotente: só cria a campanha se ainda não existir (por nome).
-- Aplicar: psql "$DATABASE_URL" -f deploy/seed-campanhas-ativas.sql
DO $$
DECLARE cid uuid; eid uuid;
BEGIN
  SELECT id INTO eid FROM admin_users WHERE email = 'eduardo.bueno@attraveiculos.com.br';

  -- Campanha Rondon
  SELECT id INTO cid FROM marketing_campaigns WHERE name = 'Campanha Rondon';
  IF cid IS NULL THEN
    INSERT INTO marketing_campaigns (name, description, status, created_by)
    VALUES ('Campanha Rondon', 'Veículos em anúncio (estrutura de 15/07/2026).', 'publicada', eid) RETURNING id INTO cid;
    INSERT INTO campaign_vehicles (campaign_id, vehicle_name, added_date, display_order) VALUES
      (cid, 'Hilux SW4 Diamond 2026', '2026-07-08', 0),
      (cid, 'LR Defender X-Dynamic 2026', '2026-07-08', 1),
      (cid, 'BMW X2 M Sport 2026', '2026-07-08', 2),
      (cid, 'Porsche 911 Carrera S 2012', '2026-07-08', 3),
      (cid, 'Porsche 911 Carrera S Cabriolet 2023', '2026-07-08', 4),
      (cid, 'Mercedes GLE 63s Coupe 2023', '2026-07-08', 5),
      (cid, 'Audi Q5 Advanced 2025', '2026-07-08', 6),
      (cid, 'Cadillac Escalade', '2026-06-23', 7),
      (cid, 'Nissan Frontier Xe 2023', '2026-06-17', 8),
      (cid, 'Ram 3500 Night Edition 2022', '2026-06-16', 9),
      (cid, 'Porsche Cayenne Turbo GT 2025', '2026-06-16', 10),
      (cid, 'BMW X6 XDRIVE 40i 2026', '2026-06-16', 11),
      (cid, 'Porsche Macan 2023', '2026-05-26', 12);
  END IF;

  -- Aquisição de público para o perfil
  SELECT id INTO cid FROM marketing_campaigns WHERE name = 'Aquisição de público para o perfil';
  IF cid IS NULL THEN
    INSERT INTO marketing_campaigns (name, description, status, created_by)
    VALUES ('Aquisição de público para o perfil', 'Aquisição de público para o perfil.', 'publicada', eid) RETURNING id INTO cid;
    INSERT INTO campaign_vehicles (campaign_id, vehicle_name, display_order) VALUES
      (cid, 'Reels Macan 4 Eletrica', 0),
      (cid, 'Reels - Purossangue', 1);
  END IF;

  -- Aquisição de público para o site
  SELECT id INTO cid FROM marketing_campaigns WHERE name = 'Aquisição de público para o site';
  IF cid IS NULL THEN
    INSERT INTO marketing_campaigns (name, description, status, created_by)
    VALUES ('Aquisição de público para o site', 'Aquisição de público para o site.', 'publicada', eid) RETURNING id INTO cid;
    INSERT INTO campaign_vehicles (campaign_id, vehicle_name, display_order) VALUES
      (cid, 'Reels do Estoque', 0);
  END IF;
END $$;

SELECT c.name, c.status, count(v.id) AS itens
FROM marketing_campaigns c LEFT JOIN campaign_vehicles v ON v.campaign_id = c.id
GROUP BY c.id, c.name, c.status, c.created_at ORDER BY c.created_at;

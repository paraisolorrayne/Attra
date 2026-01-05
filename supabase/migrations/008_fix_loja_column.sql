-- Fix loja column type to allow longer store names
-- The column was accidentally created as VARCHAR(10) but needs to store full names

-- First check if column exists and alter it
DO $$
BEGIN
  -- Alter loja column to TEXT if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'historico_compras' AND column_name = 'loja'
  ) THEN
    ALTER TABLE historico_compras ALTER COLUMN loja TYPE TEXT;
  END IF;
END $$;


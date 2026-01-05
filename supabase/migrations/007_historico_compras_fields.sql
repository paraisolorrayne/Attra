-- Add loja and vendedor fields to historico_compras table
-- These fields store the store name and salesperson for each purchase

-- Add loja column (store name where the purchase was made)
ALTER TABLE historico_compras ADD COLUMN IF NOT EXISTS loja TEXT;

-- Add vendedor column (salesperson who made the sale)
ALTER TABLE historico_compras ADD COLUMN IF NOT EXISTS vendedor TEXT;

-- Add descricao column if it doesn't exist (for purchase description)
ALTER TABLE historico_compras ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_historico_compras_loja ON historico_compras(loja);
CREATE INDEX IF NOT EXISTS idx_historico_compras_vendedor ON historico_compras(vendedor);

-- Comments
COMMENT ON COLUMN historico_compras.loja IS 'Store name where the purchase was made';
COMMENT ON COLUMN historico_compras.vendedor IS 'Salesperson who handled the sale';
COMMENT ON COLUMN historico_compras.descricao IS 'Description of the purchase';


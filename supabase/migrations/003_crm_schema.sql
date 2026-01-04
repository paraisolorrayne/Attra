-- =============================================
-- CRM Schema Migration
-- Attra Veículos Internal Mini-CRM
-- =============================================

-- Create ENUM types
CREATE TYPE origem_cliente AS ENUM ('site', 'whatsapp', 'indicacao', 'crm_externo');
CREATE TYPE origem_lead AS ENUM ('site_chat', 'whatsapp_ia', 'instagram_form', 'crm_externo');
CREATE TYPE interesse_tipo AS ENUM ('comprar', 'vender', 'ambos');
CREATE TYPE prioridade_lead AS ENUM ('baixa', 'media', 'alta');
CREATE TYPE status_lead AS ENUM ('novo', 'em_atendimento', 'concluido', 'perdido', 'ganho');
CREATE TYPE evento_lead_tipo AS ENUM ('criado', 'contato_realizado', 'retorno_pendente', 'sem_resposta', 'ganho', 'perdido');
CREATE TYPE status_compra AS ENUM ('ativo', 'vendido', 'trocado');
CREATE TYPE status_boleto AS ENUM ('pendente', 'vencido', 'pago', 'cancelado', 'em_negociacao');
CREATE TYPE forma_cobranca AS ENUM ('boleto', 'pix_copia_cola', 'link_pagamento');
CREATE TYPE origem_boleto AS ENUM ('manual', 'gateway_x', 'sistema_y');
CREATE TYPE evento_boleto_tipo AS ENUM ('criado', 'enviado', 'lembranca', 'pago', 'cancelado', 'renegociado');

-- =============================================
-- Clientes (Customers) Table
-- =============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  cpf_cnpj VARCHAR(20),
  origem_principal origem_cliente NOT NULL DEFAULT 'site',
  faixa_valor_preferida_min DECIMAL(12, 2),
  faixa_valor_preferida_max DECIMAL(12, 2),
  tipos_preferidos TEXT[] DEFAULT '{}',
  marcas_preferidas TEXT[] DEFAULT '{}',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for clientes
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_criado_em ON clientes(criado_em DESC);

-- =============================================
-- Leads Table
-- =============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origem origem_lead NOT NULL DEFAULT 'site_chat',
  payload_bruto JSONB DEFAULT '{}',
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  interesse_tipo interesse_tipo DEFAULT 'comprar',
  faixa_preco_interesse_min DECIMAL(12, 2),
  faixa_preco_interesse_max DECIMAL(12, 2),
  categoria_interesse VARCHAR(100),
  marca_interesse VARCHAR(100),
  modelo_interesse VARCHAR(255),
  prioridade prioridade_lead NOT NULL DEFAULT 'media',
  status status_lead NOT NULL DEFAULT 'novo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for leads
CREATE INDEX idx_leads_cliente_id ON leads(cliente_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_prioridade ON leads(prioridade);
CREATE INDEX idx_leads_origem ON leads(origem);
CREATE INDEX idx_leads_criado_em ON leads(criado_em DESC);
CREATE INDEX idx_leads_telefone ON leads(telefone);

-- =============================================
-- Eventos Lead (Lead Events) Table
-- =============================================
CREATE TABLE eventos_lead (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tipo evento_lead_tipo NOT NULL,
  descricao TEXT,
  proximo_contato_em TIMESTAMP WITH TIME ZONE,
  responsavel VARCHAR(100) DEFAULT 'Sistema',
  webhook_disparado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for eventos_lead
CREATE INDEX idx_eventos_lead_lead_id ON eventos_lead(lead_id);
CREATE INDEX idx_eventos_lead_proximo_contato ON eventos_lead(proximo_contato_em) 
  WHERE proximo_contato_em IS NOT NULL AND webhook_disparado = FALSE;
CREATE INDEX idx_eventos_lead_criado_em ON eventos_lead(criado_em DESC);

-- =============================================
-- Histórico Compras (Purchase History) Table
-- =============================================
CREATE TABLE historico_compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  veiculo_id_externo VARCHAR(100),
  data_compra DATE NOT NULL,
  valor_compra DECIMAL(12, 2) NOT NULL,
  categoria VARCHAR(100),
  marca VARCHAR(100),
  modelo VARCHAR(255),
  status status_compra NOT NULL DEFAULT 'ativo',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for historico_compras
CREATE INDEX idx_historico_compras_cliente_id ON historico_compras(cliente_id);
CREATE INDEX idx_historico_compras_data_compra ON historico_compras(data_compra DESC);
CREATE INDEX idx_historico_compras_categoria ON historico_compras(categoria);
CREATE INDEX idx_historico_compras_marca ON historico_compras(marca);

-- =============================================
-- Boletos (Invoices) Table
-- =============================================
CREATE TABLE boletos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  identificador_externo VARCHAR(100),
  nosso_numero VARCHAR(50),
  linha_digitavel VARCHAR(100),
  descricao VARCHAR(255) NOT NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status status_boleto NOT NULL DEFAULT 'pendente',
  forma_cobranca forma_cobranca NOT NULL DEFAULT 'boleto',
  origem origem_boleto NOT NULL DEFAULT 'manual',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for boletos
CREATE INDEX idx_boletos_cliente_id ON boletos(cliente_id);
CREATE INDEX idx_boletos_lead_id ON boletos(lead_id);
CREATE INDEX idx_boletos_status ON boletos(status);
CREATE INDEX idx_boletos_data_vencimento ON boletos(data_vencimento);
CREATE INDEX idx_boletos_vencidos ON boletos(data_vencimento, status) 
  WHERE status IN ('pendente', 'em_negociacao');

-- =============================================
-- Eventos Boleto (Boleto Events) Table
-- =============================================
CREATE TABLE eventos_boleto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boleto_id UUID NOT NULL REFERENCES boletos(id) ON DELETE CASCADE,
  tipo evento_boleto_tipo NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for eventos_boleto
CREATE INDEX idx_eventos_boleto_boleto_id ON eventos_boleto(boleto_id);
CREATE INDEX idx_eventos_boleto_criado_em ON eventos_boleto(criado_em DESC);

-- =============================================
-- Triggers for auto-updating timestamps
-- =============================================
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clientes_atualizado_em
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_leads_atualizado_em
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

CREATE TRIGGER trigger_boletos_atualizado_em
  BEFORE UPDATE ON boletos
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- =============================================
-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
-- =============================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_boleto ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access to clientes" ON clientes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to eventos_lead" ON eventos_lead
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to historico_compras" ON historico_compras
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to boletos" ON boletos
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to eventos_boleto" ON eventos_boleto
  FOR ALL USING (auth.role() = 'service_role');


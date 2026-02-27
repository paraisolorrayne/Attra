-- =============================================
-- ÉPICO 0: Modelo de Realidade Comercial (Camada de Verdade)
-- Motor de regras determinístico baseado em eventos
-- =============================================

-- ENUM para tipos de evento comercial
CREATE TYPE tipo_evento_comercial AS ENUM (
  'AVANCO_ETAPA',
  'OBJECAO_REGISTRADA',
  'INTERACAO_INVALIDA',
  'INTERACAO_VALIDA',
  'PROPOSTA_ENVIADA',
  'PROPOSTA_ACEITA',
  'PROPOSTA_RECUSADA',
  'TESTE_DRIVE',
  'FINANCIAMENTO_APROVADO',
  'FINANCIAMENTO_RECUSADO',
  'CONTRATO_ASSINADO',
  'LEAD_REABERTO',
  'LEAD_PERDIDO',
  'ESCALADA_FERNANDA'
);

-- ENUM para estágios do funil OTTO
CREATE TYPE estagio_funil_otto AS ENUM (
  'CONTATO_INICIAL',
  'QUALIFICACAO',
  'VISITA_AGENDADA',
  'VISITA_REALIZADA',
  'PROPOSTA',
  'NEGOCIACAO',
  'APROVACAO_FINANCEIRA',
  'FECHAMENTO',
  'POS_VENDA'
);

-- Tarefa 0.1: Tabela de Eventos Comerciais (Log Imutável)
CREATE TABLE eventos_comerciais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL,
  vendedor_id UUID NOT NULL,
  tipo_evento tipo_evento_comercial NOT NULL,
  estagio_anterior estagio_funil_otto,
  estagio_novo estagio_funil_otto,
  evidencia_ia JSONB NOT NULL DEFAULT '{}',
  nivel_confianca NUMERIC(5,2) CHECK (nivel_confianca >= 0 AND nivel_confianca <= 100),
  state_version_at INTEGER NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para eventos_comerciais
CREATE INDEX idx_eventos_comerciais_lead_id ON eventos_comerciais(lead_id);
CREATE INDEX idx_eventos_comerciais_vendedor_id ON eventos_comerciais(vendedor_id);
CREATE INDEX idx_eventos_comerciais_tipo ON eventos_comerciais(tipo_evento);
CREATE INDEX idx_eventos_comerciais_criado_em ON eventos_comerciais(criado_em DESC);
CREATE INDEX idx_eventos_comerciais_lead_version ON eventos_comerciais(lead_id, state_version_at);

-- Tarefa 0.1: Adicionar state_version na tabela leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS state_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estagio_funil estagio_funil_otto DEFAULT 'CONTATO_INICIAL';

-- Índice para versionamento
CREATE INDEX idx_leads_state_version ON leads(id, state_version);

-- Tarefa 0.2: Redesenhar cronômetros com versionamento
ALTER TABLE cronometros_otto ADD COLUMN IF NOT EXISTS lead_state_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cronometros_otto ADD COLUMN IF NOT EXISTS temperatura_no_inicio TEXT;
ALTER TABLE cronometros_otto ADD COLUMN IF NOT EXISTS tipo_sla TEXT DEFAULT 'business_hours';
ALTER TABLE cronometros_otto ADD COLUMN IF NOT EXISTS alerta_amarelo_enviado BOOLEAN DEFAULT FALSE;
ALTER TABLE cronometros_otto ADD COLUMN IF NOT EXISTS alerta_vermelho_enviado BOOLEAN DEFAULT FALSE;
ALTER TABLE cronometros_otto ADD COLUMN IF NOT EXISTS ignorado BOOLEAN DEFAULT FALSE;

-- Índice composto para query de versão ativa
CREATE INDEX idx_cronometros_version_ativa
  ON cronometros_otto(lead_id, lead_state_version, alerta_amarelo_at)
  WHERE status_cronometro = 'ativo';

-- Tarefa 0.3: Tabela de regras de interação válida
CREATE TABLE regras_interacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  padrao_texto TEXT NOT NULL,
  tipo_resultado tipo_evento_comercial NOT NULL DEFAULT 'INTERACAO_INVALIDA',
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir regras padrão de interação inválida
INSERT INTO regras_interacao (padrao_texto, tipo_resultado, descricao) VALUES
  ('bom dia', 'INTERACAO_INVALIDA', 'Saudação genérica - não altera probabilidade de venda'),
  ('boa tarde', 'INTERACAO_INVALIDA', 'Saudação genérica - não altera probabilidade de venda'),
  ('boa noite', 'INTERACAO_INVALIDA', 'Saudação genérica - não altera probabilidade de venda'),
  ('estou vendo', 'INTERACAO_INVALIDA', 'Resposta evasiva - não altera estado da negociação'),
  ('vou ver', 'INTERACAO_INVALIDA', 'Resposta evasiva - não altera estado da negociação'),
  ('tô vendo', 'INTERACAO_INVALIDA', 'Resposta evasiva - não altera estado da negociação'),
  ('vou falar com ele', 'INTERACAO_INVALIDA', 'Delegação sem ação concreta'),
  ('depois eu vejo', 'INTERACAO_INVALIDA', 'Adiamento sem compromisso'),
  ('ok', 'INTERACAO_INVALIDA', 'Confirmação genérica sem avanço'),
  ('tá bom', 'INTERACAO_INVALIDA', 'Confirmação genérica sem avanço'),
  ('beleza', 'INTERACAO_INVALIDA', 'Confirmação genérica sem avanço');

-- Função para incrementar state_version automaticamente
CREATE OR REPLACE FUNCTION incrementar_state_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Só incrementa se o evento for válido (não INTERACAO_INVALIDA)
  IF NEW.tipo_evento != 'INTERACAO_INVALIDA' THEN
    UPDATE leads
    SET state_version = state_version + 1,
        ultima_interacao = NOW()
    WHERE id = NEW.lead_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incrementar_state_version
  AFTER INSERT ON eventos_comerciais
  FOR EACH ROW EXECUTE FUNCTION incrementar_state_version();

-- Transições válidas do funil (máquina de estados)
CREATE TABLE transicoes_funil (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estagio_de estagio_funil_otto NOT NULL,
  estagio_para estagio_funil_otto NOT NULL,
  requer_evento tipo_evento_comercial,
  ativo BOOLEAN DEFAULT TRUE,
  UNIQUE(estagio_de, estagio_para)
);

-- Inserir transições válidas do funil
INSERT INTO transicoes_funil (estagio_de, estagio_para, requer_evento) VALUES
  ('CONTATO_INICIAL', 'QUALIFICACAO', 'AVANCO_ETAPA'),
  ('QUALIFICACAO', 'VISITA_AGENDADA', 'AVANCO_ETAPA'),
  ('VISITA_AGENDADA', 'VISITA_REALIZADA', 'AVANCO_ETAPA'),
  ('VISITA_REALIZADA', 'PROPOSTA', 'PROPOSTA_ENVIADA'),
  ('PROPOSTA', 'NEGOCIACAO', 'AVANCO_ETAPA'),
  ('NEGOCIACAO', 'APROVACAO_FINANCEIRA', 'FINANCIAMENTO_APROVADO'),
  ('APROVACAO_FINANCEIRA', 'FECHAMENTO', 'CONTRATO_ASSINADO'),
  ('FECHAMENTO', 'POS_VENDA', 'AVANCO_ETAPA'),
  -- Retrocessos permitidos
  ('PROPOSTA', 'QUALIFICACAO', 'OBJECAO_REGISTRADA'),
  ('NEGOCIACAO', 'PROPOSTA', 'OBJECAO_REGISTRADA'),
  ('APROVACAO_FINANCEIRA', 'NEGOCIACAO', 'FINANCIAMENTO_RECUSADO');

-- Função de validação de transição
CREATE OR REPLACE FUNCTION validar_transicao_funil(
  p_lead_id UUID,
  p_estagio_novo estagio_funil_otto,
  p_tipo_evento tipo_evento_comercial
) RETURNS BOOLEAN AS $$
DECLARE
  v_estagio_atual estagio_funil_otto;
  v_transicao_valida BOOLEAN;
BEGIN
  SELECT estagio_funil INTO v_estagio_atual FROM leads WHERE id = p_lead_id;

  IF v_estagio_atual IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Mesma etapa é sempre válido (atualização sem mudança)
  IF v_estagio_atual = p_estagio_novo THEN
    RETURN TRUE;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM transicoes_funil
    WHERE estagio_de = v_estagio_atual
      AND estagio_para = p_estagio_novo
      AND (requer_evento IS NULL OR requer_evento = p_tipo_evento)
      AND ativo = TRUE
  ) INTO v_transicao_valida;

  RETURN v_transicao_valida;
END;
$$ LANGUAGE plpgsql;

-- Query otimizada para cronjob de verificação (Épico 3 - Tarefa 3.2)
-- SELECT c.* FROM cronometros_otto c
-- INNER JOIN leads l ON l.id = c.lead_id
-- WHERE c.alerta_amarelo_at <= NOW()
--   AND c.lead_state_version = l.state_version
--   AND c.status_cronometro = 'ativo'
--   AND c.alerta_amarelo_enviado = FALSE;

-- RLS para novas tabelas
ALTER TABLE eventos_comerciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE regras_interacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE transicoes_funil ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access eventos_comerciais" ON eventos_comerciais
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access regras_interacao" ON regras_interacao
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access transicoes_funil" ON transicoes_funil
  FOR ALL USING (auth.role() = 'service_role');

-- Remove constraint anterior (baseada em segmentacao_id — incorreta para múltiplas refs da mesma grade)
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_visita_segmentacao_unique;

-- Constraint correta: uma referência por loja por sessão
ALTER TABLE pedidos
  ADD CONSTRAINT pedidos_visita_referencia_unique
  UNIQUE (visita_id, referencia);

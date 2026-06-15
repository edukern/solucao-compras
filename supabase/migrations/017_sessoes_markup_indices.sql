-- supabase/migrations/017_sessoes_markup_indices.sql
-- Índices de markup por sessão para definição posterior ao envio do pedido ao fornecedor
ALTER TABLE sessoes
  ADD COLUMN IF NOT EXISTS markup_index1 NUMERIC,
  ADD COLUMN IF NOT EXISTS markup_index2 NUMERIC;

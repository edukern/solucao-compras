-- supabase/migrations/008_fornecedores_padrao.sql
ALTER TABLE fornecedores
  ADD COLUMN IF NOT EXISTS vendedor_padrao        TEXT,
  ADD COLUMN IF NOT EXISTS cond_pag_padrao        TEXT,
  ADD COLUMN IF NOT EXISTS frete_padrao           TEXT,
  ADD COLUMN IF NOT EXISTS transportadora_padrao  TEXT,
  ADD COLUMN IF NOT EXISTS obs_padrao             TEXT,
  ADD COLUMN IF NOT EXISTS icms_credito_pct       NUMERIC(5,2);

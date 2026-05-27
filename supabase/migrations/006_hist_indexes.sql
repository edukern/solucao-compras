-- supabase/migrations/006_hist_indexes.sql
-- Índices para acelerar queries de analytics no histórico

CREATE INDEX IF NOT EXISTS hist_grade_colecao
  ON hist_grade(colecao_id);

CREATE INDEX IF NOT EXISTS hist_grade_seg
  ON hist_grade(segmentacao_id, colecao_id);

CREATE INDEX IF NOT EXISTS hist_comp_prod_colecao
  ON hist_comprador_produto(colecao_id, comprador_id);

CREATE INDEX IF NOT EXISTS hist_comp_forn_colecao
  ON hist_comprador_fornecedor(colecao_id, comprador_id);

CREATE INDEX IF NOT EXISTS hist_fornecedor_colecao
  ON hist_fornecedor(colecao_id);

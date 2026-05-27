-- Re-enable RLS on all tables after historico seed import.
-- Migration 008 disabled RLS so the apply-historico-seed.js script could
-- insert data using the anon key. This restores the original security model.
ALTER TABLE segmentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_fornecedor           ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_comprador_fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_comprador_produto    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_grade               ENABLE ROW LEVEL SECURITY;

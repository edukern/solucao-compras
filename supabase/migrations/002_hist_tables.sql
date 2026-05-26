-- supabase/migrations/002_hist_tables.sql

CREATE TABLE IF NOT EXISTS hist_grade (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  segmentacao_id  BIGINT REFERENCES segmentacoes(id),
  tamanho         TEXT NOT NULL,
  qtd_total_comprada INTEGER NOT NULL,
  UNIQUE (colecao_id, segmentacao_id, tamanho)
);

CREATE TABLE IF NOT EXISTS hist_fornecedor (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  fornecedor_id   BIGINT REFERENCES fornecedores(id),
  total_bruto     NUMERIC(12,2),
  total_liquido   NUMERIC(12,2),
  num_referencias INTEGER,
  UNIQUE (colecao_id, fornecedor_id)
);

CREATE TABLE IF NOT EXISTS hist_comprador_fornecedor (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  comprador_id    BIGINT REFERENCES compradores(id),
  fornecedor_id   BIGINT REFERENCES fornecedores(id),
  total_bruto     NUMERIC(12,2),
  total_liquido   NUMERIC(12,2),
  UNIQUE (colecao_id, comprador_id, fornecedor_id)
);

CREATE TABLE IF NOT EXISTS hist_comprador_produto (
  id              BIGSERIAL PRIMARY KEY,
  colecao_id      TEXT NOT NULL,
  comprador_id    BIGINT REFERENCES compradores(id),
  segmentacao_id  BIGINT REFERENCES segmentacoes(id),
  qtd_total       INTEGER,
  valor_total     NUMERIC(12,2),
  UNIQUE (colecao_id, comprador_id, segmentacao_id)
);

-- RLS: leitura pública para autenticados, escrita apenas via service role
ALTER TABLE hist_grade             ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_fornecedor        ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_comprador_fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE hist_comprador_produto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read" ON hist_grade             FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON hist_fornecedor        FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON hist_comprador_fornecedor FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read" ON hist_comprador_produto FOR SELECT USING (auth.role() = 'authenticated');

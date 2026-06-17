-- Migration 020: Revisa hist_empresa_grade para usar tipo_grade em vez de segmentacao_id
--
-- O Macle entrega dados agregados no nível de tipo_grade (AD, EX, PP, etc.),
-- não no nível de segmentação (tipo_produto). A granularidade correta é tipo_grade.

DROP TABLE IF EXISTS hist_empresa_grade;

CREATE TABLE hist_empresa_grade (
  id            BIGSERIAL PRIMARY KEY,
  comprador_id  BIGINT NOT NULL REFERENCES compradores(id),
  tipo_grade    TEXT   NOT NULL,
  colecao_id    BIGINT NOT NULL REFERENCES colecoes(id),
  tamanho       TEXT   NOT NULL,
  qtd_comprada  INTEGER NOT NULL DEFAULT 0,
  qtd_vendida   INTEGER NOT NULL DEFAULT 0,
  qtd_estoque   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (comprador_id, tipo_grade, colecao_id, tamanho)
);

CREATE INDEX IF NOT EXISTS idx_hist_emp_grade_comp_col
  ON hist_empresa_grade(comprador_id, colecao_id);

ALTER TABLE hist_empresa_grade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read"  ON hist_empresa_grade FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON hist_empresa_grade FOR ALL    USING (auth.role() = 'authenticated');

-- Migration 011: create pendencias_respostas table
-- Used by Pendencias.jsx to store answers to questions for the developer.

CREATE TABLE IF NOT EXISTS pendencias_respostas (
  id            BIGSERIAL PRIMARY KEY,
  pergunta_id   TEXT NOT NULL,
  resposta      TEXT NOT NULL,
  respondido_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pendencias_respostas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_read"  ON pendencias_respostas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write" ON pendencias_respostas FOR ALL    USING (auth.role() = 'authenticated');

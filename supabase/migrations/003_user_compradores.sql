CREATE TABLE IF NOT EXISTS user_compradores (
  user_id      UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  comprador_id BIGINT  NOT NULL    REFERENCES compradores(id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_compradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON user_compradores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own" ON user_compradores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own" ON user_compradores
  FOR DELETE USING (auth.uid() = user_id);

-- GRANTs necessários (tabelas criadas via SQL não recebem grants automáticos)
GRANT SELECT ON compradores TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT DELETE ON user_compradores TO authenticated;

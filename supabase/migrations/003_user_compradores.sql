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

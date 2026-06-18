-- 025: app_config singleton com flag de manutenção. Leitura pública (authenticated),
-- escrita só por admin (via dashboard). RLS habilitado.

CREATE TABLE IF NOT EXISTS app_config (
  id         smallint PRIMARY KEY DEFAULT 1,
  manutencao boolean  NOT NULL DEFAULT false,
  mensagem   text     NOT NULL DEFAULT 'Sistema em manutenção — salve seu trabalho.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_config_singleton CHECK (id = 1)
);

INSERT INTO app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_config_read ON app_config;
CREATE POLICY app_config_read ON app_config
  FOR SELECT USING (auth.role() = 'authenticated');

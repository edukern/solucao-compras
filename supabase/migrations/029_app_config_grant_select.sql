-- 029: a migração 025 criou app_config com RLS + política de SELECT, mas nunca deu o
-- GRANT de tabela para authenticated. Sem o GRANT, o Postgres barra o acesso antes mesmo
-- de avaliar a política de RLS ("permission denied for table app_config") -- a checagem de
-- modo manutenção falhava silenciosamente a cada 30s desde que a 025 foi aplicada.
GRANT SELECT ON app_config TO authenticated;

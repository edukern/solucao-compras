-- 023: histórico append-only de pedidos e pedido_itens. Rede de segurança no plano
-- free (sem PITR). Toda UPDATE/DELETE grava a linha ANTERIOR. Poda diária via pg_cron.

CREATE TABLE IF NOT EXISTS pedidos_historico (
  hist_id    bigserial PRIMARY KEY,
  op         text NOT NULL,                 -- 'UPDATE' | 'DELETE'
  registrado_em timestamptz NOT NULL DEFAULT now(),
  pedido_id  bigint,
  dados      jsonb NOT NULL                 -- linha anterior completa
);

CREATE TABLE IF NOT EXISTS pedido_itens_historico (
  hist_id    bigserial PRIMARY KEY,
  op         text NOT NULL,
  registrado_em timestamptz NOT NULL DEFAULT now(),
  item_id    bigint,
  dados      jsonb NOT NULL
);

-- RLS sem política de SELECT: clientes (authenticated) NÃO leem o histórico.
-- As triggers são SECURITY DEFINER, então continuam inserindo normalmente.
-- Restauração de dados é feita pelo owner via dashboard. Evita que uma loja
-- leia o histórico de pedidos de outra (as tabelas-base têm comprador_read_own).
ALTER TABLE pedidos_historico      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens_historico ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION log_pedidos_historico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO pedidos_historico (op, pedido_id, dados)
  VALUES (TG_OP, OLD.id, to_jsonb(OLD));
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION log_pedido_itens_historico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO pedido_itens_historico (op, item_id, dados)
  VALUES (TG_OP, OLD.id, to_jsonb(OLD));
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_hist ON pedidos;
CREATE TRIGGER trg_pedidos_hist
  AFTER UPDATE OR DELETE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION log_pedidos_historico();

DROP TRIGGER IF EXISTS trg_pedido_itens_hist ON pedido_itens;
CREATE TRIGGER trg_pedido_itens_hist
  AFTER UPDATE OR DELETE ON pedido_itens
  FOR EACH ROW EXECUTE FUNCTION log_pedido_itens_historico();

-- Poda diária: manter 60 dias (respeita o limite de 500MB do free tier)
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION podar_historico()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM pedidos_historico       WHERE registrado_em < now() - interval '60 days';
  DELETE FROM pedido_itens_historico  WHERE registrado_em < now() - interval '60 days';
$$;

-- Idempotente: remove o job anterior (se existir) antes de reagendar.
DO $$
BEGIN
  PERFORM cron.unschedule('podar-historico');
EXCEPTION WHEN OTHERS THEN
  NULL;  -- job ainda não existia
END $$;

SELECT cron.schedule('podar-historico', '0 4 * * *', 'SELECT podar_historico()');

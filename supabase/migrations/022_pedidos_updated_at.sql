-- 022: updated_at em pedidos e pedido_itens (concorrência otimística + recovery)
-- Aditiva e retrocompatível: coluna nova com default, nenhuma coluna removida/renomeada.

ALTER TABLE pedidos       ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE pedido_itens  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_updated_at ON pedidos;
CREATE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_pedido_itens_updated_at ON pedido_itens;
CREATE TRIGGER trg_pedido_itens_updated_at
  BEFORE UPDATE ON pedido_itens
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

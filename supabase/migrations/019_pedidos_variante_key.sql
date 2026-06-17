-- Permite múltiplos pedidos da mesma referência na mesma visita (ex: mesma ref em cores diferentes)
-- variante_key é '' para o item original e um UUID para cada cópia adicional

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS variante_key TEXT NOT NULL DEFAULT '';

ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_visita_referencia_unique;

ALTER TABLE pedidos
  ADD CONSTRAINT pedidos_visita_referencia_variante_unique
  UNIQUE (visita_id, referencia, variante_key);

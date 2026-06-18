-- 024: RPCs atômicas para gravação de pedidos + itens.
-- Substituem o padrão JS "delete itens + insert itens" por uma transação única.
-- security definer: roda como owner, contornando a granularidade de RLS de leitura,
-- mas só é executável por authenticated (grant abaixo).

-- salvar_pedidos_visita: upsert dos pedidos da visita + replace atômico dos itens.
-- p_payload: jsonb array de objetos:
--   { referencia, variante_key, segmentacao_id, valor_unitario, desconto_pct,
--     icms_pct, markup_pct, preco_venda, cor, detalhe, obs,
--     itens: [ { tamanho, qtd } ] }
CREATE OR REPLACE FUNCTION salvar_pedidos_visita(
  p_visita_id bigint,
  p_payload   jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r        jsonb;
  v_ped_id bigint;
BEGIN
  FOR r IN SELECT * FROM jsonb_array_elements(p_payload)
  LOOP
    INSERT INTO pedidos (
      visita_id, referencia, variante_key, segmentacao_id,
      valor_unitario, desconto_pct, icms_pct, markup_pct, preco_venda,
      cor, detalhe, obs
    ) VALUES (
      p_visita_id,
      r->>'referencia',
      COALESCE(r->>'variante_key', ''),
      (r->>'segmentacao_id')::bigint,
      COALESCE((r->>'valor_unitario')::numeric, 0),
      COALESCE((r->>'desconto_pct')::numeric, 0),
      COALESCE((r->>'icms_pct')::numeric, 0),
      COALESCE((r->>'markup_pct')::numeric, 0),
      COALESCE((r->>'preco_venda')::numeric, 0),
      COALESCE(r->>'cor', ''),
      COALESCE(r->>'detalhe', ''),
      COALESCE(r->>'obs', '')
    )
    ON CONFLICT (visita_id, referencia, variante_key) DO UPDATE SET
      segmentacao_id = EXCLUDED.segmentacao_id,
      valor_unitario = EXCLUDED.valor_unitario,
      desconto_pct   = EXCLUDED.desconto_pct,
      icms_pct       = EXCLUDED.icms_pct,
      markup_pct     = EXCLUDED.markup_pct,
      preco_venda    = EXCLUDED.preco_venda,
      cor            = EXCLUDED.cor,
      detalhe        = EXCLUDED.detalhe,
      obs            = EXCLUDED.obs
    RETURNING id INTO v_ped_id;

    -- replace dos itens deste pedido, tudo na mesma transação
    DELETE FROM pedido_itens WHERE pedido_id = v_ped_id;
    INSERT INTO pedido_itens (pedido_id, tamanho, qtd)
    SELECT v_ped_id, (it->>'tamanho'), (it->>'qtd')::int
    FROM jsonb_array_elements(COALESCE(r->'itens', '[]'::jsonb)) it
    WHERE (it->>'qtd')::int > 0;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION salvar_pedidos_visita(bigint, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION salvar_pedidos_visita(bigint, jsonb) TO authenticated;

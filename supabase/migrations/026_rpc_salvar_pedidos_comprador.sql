-- 026: corrige salvar_pedidos_visita — preencher comprador_id no INSERT.
-- Bug: a RPC (024) inseria pedidos SEM comprador_id (coluna NOT NULL, sem default,
-- sem trigger). Ao salvar quantidades de uma sessão nova (pedido ainda não criado
-- por inicializarColaboracao/salvarRascunho), o INSERT estourava
-- "null value in column comprador_id violates not-null constraint".
-- Correção (fonte de verdade): comprador_id vem da própria visita (visitas.comprador_id),
-- a mesma fonte que os inserts diretos do frontend já usam.
-- comprador_id fica SÓ no INSERT (fora do ON CONFLICT DO UPDATE), para não alterar
-- o comprador de pedidos pré-existentes.

CREATE OR REPLACE FUNCTION salvar_pedidos_visita(
  p_visita_id bigint,
  p_payload   jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r             jsonb;
  v_ped_id      bigint;
  v_comprador   bigint;
BEGIN
  SELECT comprador_id INTO v_comprador FROM visitas WHERE id = p_visita_id;
  IF v_comprador IS NULL THEN
    RAISE EXCEPTION 'salvar_pedidos_visita: visita % inexistente ou sem comprador_id', p_visita_id;
  END IF;

  FOR r IN SELECT * FROM jsonb_array_elements(p_payload)
  LOOP
    INSERT INTO pedidos (
      visita_id, comprador_id, referencia, variante_key, segmentacao_id,
      valor_unitario, desconto_pct, icms_pct, markup_pct, preco_venda,
      cor, detalhe, obs
    ) VALUES (
      p_visita_id,
      v_comprador,
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

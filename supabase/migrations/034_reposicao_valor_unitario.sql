-- Reposição: custo unitário por referência (valor_unitario) em
-- pedido_reposicao_itens, para gerar pedido/PDF com valor.
--
-- Mesmo nome e tipo de pedidos.valor_unitario (numeric(10,2)) — não criar um
-- segundo nome pro mesmo fato. Desnormalizado em todas as linhas de tamanho da
-- referência (igual nome/tipo/classe/tipo_grade). A tela mostra e edita UM custo
-- por referência; ao salvar, grava o mesmo valor em todas as linhas da ref.
--
-- O ponto-e-stock vai passar a mandar valor_unitario (custo do ERP, vlrunit) no
-- payload. A validação abaixo ACEITA valor_unitario ausente / null / 0 sem
-- recusar a carga — item sem custo cadastrado é comum e não pode travar o
-- rascunho inteiro. Só recusa (com mensagem própria) formato realmente inválido
-- (texto, negativo).
--
-- Aditiva e idempotente. Parte do corpo real de produção da RPC (pg_get_functiondef
-- em 2026-09-01), que é idêntico ao arquivo 033. Ramo on conflict (origem_key)
-- do nothing inalterado — reenvio não sobrescreve item revisado à mão, e também
-- não faz backfill de valor_unitario em rascunho antigo (fica NULL → a tela
-- mostra "—", não "R$ 0,00").
-- Revisado pelo agente revisor-impacto em 2026-09-01.

alter table public.pedido_reposicao_itens
  add column if not exists valor_unitario numeric(10,2);

create or replace function public.salvar_pedido_reposicao(
  p_marca             text,
  p_janela_dias       integer,
  p_gerado_por        text,
  p_disclaimer_aceito boolean,
  p_origem_key        text,
  p_itens             jsonb
) returns table(id uuid, criado boolean, status text, itens_gravados integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id             uuid;
  v_criado         boolean;
  v_status         text;
  v_count          integer;
  v_invalido       integer;
  v_preco_invalido integer;
  v_recentes       integer;
  v_itens_gravados integer;
begin
  if p_marca is null or length(trim(p_marca)) = 0 then
    raise exception 'marca obrigatória';
  end if;
  if length(trim(p_marca)) > 120 then
    raise exception 'marca excede o tamanho máximo (120 caracteres)';
  end if;
  if p_origem_key is null or length(trim(p_origem_key)) = 0 then
    raise exception 'origem_key obrigatória';
  end if;
  if p_janela_dias is null or p_janela_dias not between 1 and 365 then
    raise exception 'janela_dias inválida';
  end if;
  if not coalesce(p_disclaimer_aceito, false) then
    raise exception 'disclaimer não aceito — rascunho não pode ser gravado sem confirmação de conferência das quantidades';
  end if;
  if p_gerado_por is not null and length(trim(p_gerado_por)) > 120 then
    raise exception 'gerado_por excede o tamanho máximo (120 caracteres)';
  end if;

  select jsonb_array_length(p_itens) into v_count;
  if v_count is null or v_count = 0 then
    raise exception 'rascunho sem itens';
  end if;
  if v_count > 500 then
    raise exception 'rascunho com % itens — acima do limite, revisar manualmente', v_count;
  end if;

  select count(*) into v_invalido
  from jsonb_array_elements(p_itens) it
  where coalesce(length(trim(it->>'referencia')), 0) = 0
     or length(trim(it->>'referencia')) > 64
     or coalesce(length(trim(it->>'tamanho')), 0) = 0
     or length(trim(it->>'tamanho')) > 32
     or case when jsonb_typeof(it->'qtd') = 'number' then
               (it->>'qtd')::numeric <> floor((it->>'qtd')::numeric)
               or (it->>'qtd')::numeric <= 0
               or (it->>'qtd')::numeric > 9999
             else true
        end
     or case when not (it ? 'vendido_periodo') then false
             when jsonb_typeof(it->'vendido_periodo') <> 'number' then true
             else (it->>'vendido_periodo')::numeric <> floor((it->>'vendido_periodo')::numeric)
                  or (it->>'vendido_periodo')::numeric < 0
        end
     or case when not (it ? 'estoque_cd') then false
             when jsonb_typeof(it->'estoque_cd') <> 'number' then true
             else (it->>'estoque_cd')::numeric <> floor((it->>'estoque_cd')::numeric)
        end
     or case when not (it ? 'ja_pedido') then false
             when jsonb_typeof(it->'ja_pedido') <> 'number' then true
             else (it->>'ja_pedido')::numeric <> floor((it->>'ja_pedido')::numeric)
                  or (it->>'ja_pedido')::numeric < 0
        end;
  if v_invalido > 0 then
    raise exception '% item(ns) com referência/tamanho/quantidade inválido — carga recusada inteira, nada foi gravado', v_invalido;
  end if;

  -- valor_unitario: opcional. Aceita ausente, null e número >= 0. Recusa só
  -- formato realmente inválido, com mensagem que cita o campo.
  select count(*) into v_preco_invalido
  from jsonb_array_elements(p_itens) it
  where (it ? 'valor_unitario') and (
          jsonb_typeof(it->'valor_unitario') not in ('number', 'null')
          or (jsonb_typeof(it->'valor_unitario') = 'number' and (it->>'valor_unitario')::numeric < 0)
        );
  if v_preco_invalido > 0 then
    raise exception '% item(ns) com valor_unitario em formato inválido (esperado número >= 0 ou nulo) — carga recusada, nada foi gravado', v_preco_invalido;
  end if;

  select count(*) into v_recentes
  from pedidos_reposicao
  where gerado_em > now() - interval '1 hour'
    and marca = trim(p_marca);
  if v_recentes >= 50 then
    raise exception 'limite de 50 rascunhos por hora atingido para esta marca — tente de novo mais tarde';
  end if;

  insert into pedidos_reposicao (marca, janela_dias, status, disclaimer_aceito, gerado_por, origem_key)
  values (trim(p_marca), p_janela_dias, 'rascunho', true, p_gerado_por, trim(p_origem_key))
  on conflict (origem_key) do nothing
  returning pedidos_reposicao.id into v_id;

  if v_id is not null then
    v_criado := true;
    v_status := 'rascunho';

    insert into pedido_reposicao_itens (
      pedido_reposicao_id, referencia, tamanho, qtd, qtd_sugerida,
      vendido_periodo, estoque_cd, ja_pedido,
      nome, tipo, classe, colecao, reffornecedor, codigo_ponto_e,
      foto_url, tipo_grade, valor_unitario
    )
    select
      v_id,
      agg.referencia,
      agg.tamanho,
      sum(agg.qtd)::int,
      sum(agg.qtd)::int,
      sum(agg.vendido_periodo)::int,
      max(agg.estoque_cd)::int,
      sum(agg.ja_pedido)::int,
      max(agg.nome),
      max(agg.tipo),
      max(agg.classe),
      max(agg.colecao),
      max(agg.reffornecedor),
      max(agg.codigo_ponto_e),
      max(agg.foto_url),
      max(agg.tipo_grade),
      nullif(round(max(agg.valor_unitario), 2), 0)
    from (
      select
        it->>'referencia' as referencia,
        it->>'tamanho' as tamanho,
        (it->>'qtd')::numeric as qtd,
        coalesce((it->>'vendido_periodo')::numeric, 0) as vendido_periodo,
        coalesce((it->>'estoque_cd')::numeric, 0) as estoque_cd,
        coalesce((it->>'ja_pedido')::numeric, 0) as ja_pedido,
        nullif(trim(it->>'nome'), '') as nome,
        nullif(trim(it->>'tipo'), '') as tipo,
        nullif(trim(it->>'classe'), '') as classe,
        nullif(trim(it->>'colecao'), '') as colecao,
        nullif(trim(it->>'reffornecedor'), '') as reffornecedor,
        nullif(trim(it->>'codigo_ponto_e'), '') as codigo_ponto_e,
        nullif(trim(it->>'foto_url'), '') as foto_url,
        nullif(trim(it->>'tipo_grade'), '') as tipo_grade,
        case when jsonb_typeof(it->'valor_unitario') = 'number'
             then (it->>'valor_unitario')::numeric end as valor_unitario
      from jsonb_array_elements(p_itens) it
    ) agg
    group by agg.referencia, agg.tamanho;

    get diagnostics v_itens_gravados = row_count;
  else
    v_criado := false;
    select pr.id, pr.status into v_id, v_status
    from pedidos_reposicao pr
    where pr.origem_key = trim(p_origem_key);

    select count(*) into v_itens_gravados
    from pedido_reposicao_itens
    where pedido_reposicao_id = v_id;
  end if;

  return query select v_id, v_criado, v_status, v_itens_gravados;
end;
$$;

revoke all on function public.salvar_pedido_reposicao(text, integer, text, boolean, text, jsonb) from public;
grant execute on function public.salvar_pedido_reposicao(text, integer, text, boolean, text, jsonb) to anon;

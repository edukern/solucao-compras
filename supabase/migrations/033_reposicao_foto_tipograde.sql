-- Reposição: colunas foto_url e tipo_grade em pedido_reposicao_itens.
--
-- O ponto-e-stock passou a mandar no payload da RPC salvar_pedido_reposicao,
-- por item: foto_url (URL de imagem do produto, a mesma que a tela de rascunho
-- de lá já usa) e tipo_grade (código de grade do ERP — hoje "genérico"/null em
-- ~97% dos produtos, mas os ~3% reais valem a pena guardar). Sem estas colunas
-- + a leitura na RPC, os dois campos eram descartados em silêncio.
--
-- tipo_grade também passa a ser o lugar onde a tela grava a grade que o COMPRADOR
-- escolhe no seletor (quando o palpite automático de classe+tamanhos não serve).
--
-- Aditiva e idempotente. Nulável, sem CHECK, sem default. Não toca dado
-- existente (rows antigos ficam com NULL nas duas). O ramo de conflito da RPC
-- (on conflict (origem_key) do nothing) continua intocado — reenvio do mesmo
-- origem_key não sobrescreve item já revisado à mão.
-- Mesmo padrão da migração 032 (que documentou nome/tipo/classe/colecao/
-- reffornecedor/codigo_ponto_e).

alter table public.pedido_reposicao_itens add column if not exists foto_url   text;
alter table public.pedido_reposicao_itens add column if not exists tipo_grade text;

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

  -- Cada checagem numérica usa CASE pra garantir que o tipo é conferido ANTES
  -- do cast: o Postgres não garante a ordem de avaliação entre cláusulas OR
  -- soltas (pode reordenar por otimização), só CASE WHEN garante sequência.
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

  -- Limite por marca, não global — um remetente com problema não trava os demais.
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
      foto_url, tipo_grade
    )
    select
      v_id,
      agg.referencia,
      agg.tamanho,
      sum(agg.qtd)::int,
      sum(agg.qtd)::int,   -- qtd_sugerida = o que a máquina propôs; qtd vira editável na revisão
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
      max(agg.tipo_grade)
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
        nullif(trim(it->>'tipo_grade'), '') as tipo_grade
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

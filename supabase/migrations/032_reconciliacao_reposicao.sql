-- Reconciliação do schema de reposição + coluna qtd_sugerida.
--
-- CONTEXTO (o porquê desta migração existir):
-- A produção (projeto bhxpkysueyoblizkvomb) já tinha, ANTES desta migração e SEM
-- registro no ledger de migrações, três coisas que não estavam no SQL do repo:
--   1. 6 colunas extras em pedido_reposicao_itens
--      (nome, tipo, classe, colecao, reffornecedor, codigo_ponto_e) — o ponto-e-stock
--      já manda esses campos no payload da RPC; a função só grava se as colunas existem.
--   2. Uma versão mais nova de salvar_pedido_reposicao() que lê/grava essas 6 colunas.
--   3. A view pedidos_reposicao_lista (arquivo 031 no repo, aplicada em produção mas
--      ausente do ledger schema_migrations).
-- Sem esta migração, um `supabase db push` reaplicaria a 030 antiga e DERRUBARIA a RPC
-- nova em silêncio (o ponto-e-stock continuaria mandando os 6 campos e eles seriam
-- descartados). Esta migração torna o repo a fonte da verdade de novo.
--
-- O QUE É NOVO DE VERDADE aqui (não estava em produção): a coluna qtd_sugerida.
-- A tela "Reposição" (RevisaoReposicao) passa a permitir editar qtd de cada
-- referência/tamanho antes de aprovar o rascunho. Com isso, "qtd" deixa de ser
-- só a sugestão da máquina e passa a guardar a decisão humana. qtd_sugerida
-- preserva o número original proposto, para dar pra comparar sugerido × pedido.
--
-- Tudo abaixo é idempotente (`if not exists` / `create or replace` / update
-- condicional), então rodar em cima de um banco que já tem as 6 colunas + a RPC
-- nova não causa efeito nenhum além de criar qtd_sugerida e fazer o backfill.
-- Revisado pelo agente revisor-impacto em 2026-08-29 (risco BAIXO-MÉDIO; não toca
-- sessoes/visitas/pedidos; backup das duas tabelas de reposição feito antes de aplicar).

-- ── 1. Colunas de enriquecimento (documenta o que já está em produção) ──────────
alter table public.pedido_reposicao_itens add column if not exists nome           text;
alter table public.pedido_reposicao_itens add column if not exists tipo           text;
alter table public.pedido_reposicao_itens add column if not exists classe         text;
alter table public.pedido_reposicao_itens add column if not exists colecao        text;
alter table public.pedido_reposicao_itens add column if not exists reffornecedor  text;
alter table public.pedido_reposicao_itens add column if not exists codigo_ponto_e text;

-- ── 2. qtd_sugerida: snapshot do número que a máquina propôs (NOVO) ────────────
-- Nullable e sem CHECK de propósito: é um registro histórico de leitura, não um
-- campo operacional. A trava de valor válido (1..9999) vive em qtd, que é o que a
-- tela edita. Backfill copia o valor atual — antes da 1ª edição em produção,
-- qtd == qtd_sugerida em toda linha.
alter table public.pedido_reposicao_itens add column if not exists qtd_sugerida integer;
update public.pedido_reposicao_itens set qtd_sugerida = qtd where qtd_sugerida is null;

-- ── 3. View da lista (reconcilia a 031 no ledger) ─────────────────────────────
create or replace view public.pedidos_reposicao_lista
with (security_invoker = true)
as
select
  pr.id,
  pr.marca,
  pr.janela_dias,
  pr.status,
  pr.gerado_por,
  pr.gerado_em,
  pr.revisado_por,
  pr.revisado_em,
  coalesce(ag.qtd_referencias, 0)::integer as qtd_referencias,
  coalesce(ag.qtd_total, 0)::integer       as qtd_total
from public.pedidos_reposicao pr
left join lateral (
  select
    count(distinct i.referencia) as qtd_referencias,
    sum(i.qtd)                   as qtd_total
  from public.pedido_reposicao_itens i
  where i.pedido_reposicao_id = pr.id
) ag on true;

grant select on public.pedidos_reposicao_lista to authenticated;

-- ── 4. RPC de gravação: corpo atual de produção + qtd_sugerida no insert ──────
-- Idêntica à função que já está em produção (lê nome/tipo/classe/colecao/
-- reffornecedor/codigo_ponto_e do payload), com uma única adição: grava
-- qtd_sugerida = mesmo valor de qtd no momento do insert. O ramo de conflito
-- (reenvio do mesmo origem_key) continua `do nothing` — reenvio NÃO sobrescreve
-- nem apaga itens já revisados à mão.
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
      nome, tipo, classe, colecao, reffornecedor, codigo_ponto_e
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
      max(agg.codigo_ponto_e)
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
        nullif(trim(it->>'codigo_ponto_e'), '') as codigo_ponto_e
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

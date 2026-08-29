-- ┌──────────────────────────────────────────────────────────────────────────────┐
-- │ ATENÇÃO: a RPC salvar_pedido_reposicao() e a tabela pedido_reposicao_itens    │
-- │ definidas aqui foram SUPERADAS pela migração 032_reconciliacao_reposicao.sql. │
-- │ Produção tem 6 colunas extras (nome/tipo/classe/colecao/reffornecedor/        │
-- │ codigo_ponto_e) + coluna qtd_sugerida + versão nova da função. Se você        │
-- │ reaplicar SÓ este arquivo, derruba a função nova em silêncio. Rode a 032.     │
-- └──────────────────────────────────────────────────────────────────────────────┘
--
-- Rascunho de pedido de reposicao vindo do ponto-e-stock (CD Ponto E).
-- Tabela nova e desacoplada de sessoes/visitas/pedidos: reposicao nao nasce de uma
-- sessao de compra com fornecedor, e um pedido avulso de "repor o que vendeu" (sem
-- projecao). Fica pendente de revisao humana ate alguem do compras confirmar.
--
-- Gravacao feita via RPC security definer (salvar_pedido_reposicao, no fim deste
-- arquivo), mesmo padrao ja usado em salvar_pedidos_visita (024): transacao unica,
-- devolve o id gravado, sem depender de SELECT/RETURNING do anon (que nao teria
-- permissao). anon so recebe EXECUTE na funcao, nunca grant direto nas tabelas —
-- grants/RLS abaixo cobrem so o lado authenticated (equipe do compras revisando).
--
-- Revisado por revisor-impacto (conferencia independente da rodada feita no
-- ponto-e-stock) em 2026-08-20. Ajustes aplicados nessa revisao: validacao dos
-- campos numericos por CASE (evita erro cru do Postgres quando chega um valor
-- fora do formato, tipo "3.5" ou texto, num campo de quantidade — o Postgres nao
-- garante ordem de avaliacao entre clausulas OR soltas, so CASE garante), soma
-- (em vez de pegar so o maior) em vendido_periodo/ja_pedido na agregacao por
-- referencia+tamanho, retorno de status+itens_gravados para quem reenviar no
-- mesmo dia saber o que ja estava gravado, limite de tamanho em texto livre, e
-- remocao do DELETE do grant de authenticated (descarte e via status, nao apagar
-- linha).
create table if not exists public.pedidos_reposicao (
  id uuid primary key default gen_random_uuid(),
  origem_key text not null unique,
  marca text not null check (length(trim(marca)) > 0 and length(marca) <= 120),
  janela_dias integer not null check (janela_dias between 1 and 365),
  status text not null default 'rascunho' check (status in ('rascunho', 'revisado', 'descartado')),
  disclaimer_aceito boolean not null default false,
  gerado_por text check (gerado_por is null or length(gerado_por) <= 120),
  gerado_em timestamptz not null default now(),
  revisado_por text,
  revisado_em timestamptz
);

create table if not exists public.pedido_reposicao_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_reposicao_id uuid not null references public.pedidos_reposicao(id) on delete cascade,
  referencia text not null check (length(trim(referencia)) > 0 and length(referencia) <= 64),
  tamanho text not null check (length(trim(tamanho)) > 0 and length(tamanho) <= 32),
  qtd integer not null check (qtd > 0 and qtd <= 9999),
  vendido_periodo integer not null default 0 check (vendido_periodo >= 0),
  estoque_cd integer not null default 0,
  ja_pedido integer not null default 0 check (ja_pedido >= 0),
  unique (pedido_reposicao_id, referencia, tamanho)
);

create index if not exists pedido_reposicao_itens_pedido_id_idx
  on public.pedido_reposicao_itens(pedido_reposicao_id);
create index if not exists pedidos_reposicao_status_gerado_idx
  on public.pedidos_reposicao(status, gerado_em desc);
create index if not exists pedidos_reposicao_marca_gerado_idx
  on public.pedidos_reposicao(marca, gerado_em desc);

alter table public.pedidos_reposicao enable row level security;
alter table public.pedido_reposicao_itens enable row level security;

drop policy if exists "auth_full_access" on public.pedidos_reposicao;
create policy "auth_full_access" on public.pedidos_reposicao
  for all to authenticated
  using (true) with check (true);

drop policy if exists "auth_full_access_itens" on public.pedido_reposicao_itens;
create policy "auth_full_access_itens" on public.pedido_reposicao_itens
  for all to authenticated
  using (true) with check (true);

-- Sem DELETE de propósito: a policy acima é "FOR ALL", mas como o GRANT abaixo
-- não inclui delete, o Postgres barra qualquer DELETE antes mesmo de olhar a
-- policy (checagem de privilégio de tabela vem antes do RLS). Descarte de um
-- rascunho é via UPDATE status='descartado', não apagar a linha.
grant select, insert, update on public.pedidos_reposicao to authenticated;
grant select, insert, update on public.pedido_reposicao_itens to authenticated;

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
  -- Sem isso, um valor tipo "3.5" ou um texto num campo numérico derrubaria a
  -- função com um erro cru do Postgres em vez da mensagem de validação abaixo.
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

  -- Limite por marca, não global — um remetente com problema não trava os
  -- demais dentro da mesma hora.
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
      pedido_reposicao_id, referencia, tamanho, qtd, vendido_periodo, estoque_cd, ja_pedido
    )
    select
      v_id,
      agg.referencia,
      agg.tamanho,
      sum(agg.qtd)::int,
      sum(agg.vendido_periodo)::int,
      max(agg.estoque_cd)::int,
      sum(agg.ja_pedido)::int
    from (
      select
        it->>'referencia' as referencia,
        it->>'tamanho' as tamanho,
        (it->>'qtd')::numeric as qtd,
        coalesce((it->>'vendido_periodo')::numeric, 0) as vendido_periodo,
        coalesce((it->>'estoque_cd')::numeric, 0) as estoque_cd,
        coalesce((it->>'ja_pedido')::numeric, 0) as ja_pedido
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

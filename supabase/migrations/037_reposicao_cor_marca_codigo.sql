-- Reposição: 2 campos novos, opcionais, que o ponto-e-stock vai passar a mandar.
--
-- 1. `cor` (text) em pedido_reposicao_itens — cor real da peça, vinda do cadastro
--    do produto no ERP. Hoje o PDF só tinha corDoNome() (pdfHelpers.js), que
--    ADIVINHA a cor pegando o resto do texto de `nome` depois do código da
--    referência — funciona quando esse resto é cor de verdade, mas às vezes é
--    detalhe de produto (MODELADORA, FAIXA, AMAMENTACAO), sem jeito de
--    diferenciar só pelo texto. Coluna própria resolve isso NA FONTE. Consumo na
--    tela/PDF fica pra uma rodada seguinte — esta migração só abre a porta de
--    entrada do dado.
--
-- 2. `marca_codigo` (text) em pedidos_reposicao — código do fornecedor no ERP.
--    Reposição só carrega `marca` (texto livre, ex. "ZEE RUCCI"), sem link
--    confiável com o cadastro de fornecedores deste projeto — já existe a MESMA
--    marca cadastrada 2x aqui com grafia diferente ("ZEE RUCCI" id 482 e
--    "ZEERUCCI" id 563). `marca_codigo` é só CAPTURA por enquanto: não tem FK,
--    não tem uso automático, não faz join com `fornecedores` nesta rodada — só
--    guarda o dado bruto pra um link seguro futuro, que exige antes (a)
--    `fornecedores.codigo_erp` (coluna que ainda não existe) e (b) resolver a
--    duplicata 482/563. Não tratar como "já funciona" só porque a coluna existe.
--
-- IMPORTANTE — `p_marca_codigo` é parâmetro de FUNÇÃO (nível de pedido), não
-- campo dentro de item. Postgres/PostgREST tratam uma lista de argumentos
-- diferente como uma SEGUNDA função (overload) — por isso o DROP explícito
-- abaixo antes do CREATE OR REPLACE: sem ele, ficariam 2 versões da função
-- (6 e 7 argumentos) e o PostgREST não consegue decidir qual chamar pra uma
-- chamada de 6 argumentos → toda chamada do ponto-e-stock passa a falhar
-- (PGRST203/300 Multiple Choices), incluindo as que não mudaram nada.
-- Revisado pelo agente revisor-impacto em 2026-09-11 (achou esse P0 antes de
-- ir pro ar). `cor` dentro do item é campo solto no jsonb — esse não tem esse
-- risco, chega opcional sem quebrar nada mesmo antes desta migração existir.
--
-- ORDEM OBRIGATÓRIA com o ponto-e-stock: esta migração + smoke test primeiro;
-- só depois de confirmado no ar o ponto-e-stock pode começar a mandar
-- `p_marca_codigo`. O campo `cor` dentro dos itens pode ir a qualquer momento,
-- inclusive antes desta migração (fica ignorado até aqui, sem erro).
--
-- P2-1 (revisor-impacto): a mesma referência+tamanho pode chegar em cores
-- diferentes no `ponto-e-stock` (foi por isso que corDoNome() existe — ver
-- comentário em pdfHelpers.js). A agregação abaixo faz `group by
-- referencia, tamanho` com soma de quantidade — se aceitasse `max(cor)` sem
-- checar, uma referência com 10 ROSA + 10 PRETO viraria uma linha só "20
-- ROSA" (dado visivelmente errado indo pro fornecedor). Em vez de misturar,
-- a carga inteira é recusada com mensagem clara quando isso acontece —
-- pior caso vira "rascunho não entrou", nunca "pedido errado saiu".
--
-- Aditiva. Corpo novo parte do corpo real de produção (pg_get_functiondef em
-- 2026-09-11, idêntico ao arquivo 034) — só acrescenta os dois campos e as
-- duas validações novas, resto item por item igual.

alter table public.pedido_reposicao_itens
  add column if not exists cor text;
comment on column public.pedido_reposicao_itens.cor is
  'Cor real da peça, mandada pelo ponto-e-stock (ERP). NULL em rascunho gravado antes de 2026-09 ou quando o ERP não tem cor limpa pro SKU — nesses casos o PDF cai no fallback corDoNome() (pdfHelpers.js).';

alter table public.pedidos_reposicao
  add column if not exists marca_codigo text;
comment on column public.pedidos_reposicao.marca_codigo is
  'Código do fornecedor no ERP, mandado pelo ponto-e-stock. Só captura — sem FK, sem join automático com fornecedores ainda (falta fornecedores.codigo_erp + resolver duplicata ZEE RUCCI/ZEERUCCI, ids 482/563).';

drop function if exists public.salvar_pedido_reposicao(text, integer, text, boolean, text, jsonb);

create or replace function public.salvar_pedido_reposicao(
  p_marca             text,
  p_janela_dias       integer,
  p_gerado_por        text,
  p_disclaimer_aceito boolean,
  p_origem_key        text,
  p_itens             jsonb,
  p_marca_codigo      text default null
)
returns table(id uuid, criado boolean, status text, itens_gravados integer)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_id             uuid;
  v_criado         boolean;
  v_status         text;
  v_count          integer;
  v_invalido       integer;
  v_preco_invalido integer;
  v_cor_conflito   integer;
  v_recentes       integer;
  v_itens_gravados integer;
begin
  if p_marca is null or length(trim(p_marca)) = 0 then
    raise exception 'marca obrigatória';
  end if;
  if length(trim(p_marca)) > 120 then
    raise exception 'marca excede o tamanho máximo (120 caracteres)';
  end if;
  if p_marca_codigo is not null and length(trim(p_marca_codigo)) > 40 then
    raise exception 'marca_codigo excede o tamanho máximo (40 caracteres)';
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

  select count(*) into v_preco_invalido
  from jsonb_array_elements(p_itens) it
  where (it ? 'valor_unitario') and (
          jsonb_typeof(it->'valor_unitario') not in ('number', 'null')
          or (jsonb_typeof(it->'valor_unitario') = 'number' and (it->>'valor_unitario')::numeric < 0)
        );
  if v_preco_invalido > 0 then
    raise exception '% item(ns) com valor_unitario em formato inválido (esperado número >= 0 ou nulo) — carga recusada, nada foi gravado', v_preco_invalido;
  end if;

  -- P2-1: mesma referencia+tamanho não pode chegar com mais de uma cor distinta
  -- nesta carga — misturar sob uma cor só (max()) mandaria peça errada pro
  -- fornecedor. Cor ausente/vazia não conta pra esse conflito.
  select count(*) into v_cor_conflito
  from (
    select it->>'referencia' as referencia, it->>'tamanho' as tamanho
    from jsonb_array_elements(p_itens) it
    where nullif(trim(it->>'cor'), '') is not null
    group by it->>'referencia', it->>'tamanho'
    having count(distinct nullif(trim(it->>'cor'), '')) > 1
  ) conflitos;
  if v_cor_conflito > 0 then
    raise exception '% referência(s)/tamanho com mais de uma cor diferente na mesma carga — carga recusada, revisar com o ponto-e-stock (cada referencia+tamanho precisa ter uma única cor)', v_cor_conflito;
  end if;

  select count(*) into v_recentes
  from pedidos_reposicao
  where gerado_em > now() - interval '1 hour'
    and marca = trim(p_marca);
  if v_recentes >= 50 then
    raise exception 'limite de 50 rascunhos por hora atingido para esta marca — tente de novo mais tarde';
  end if;

  insert into pedidos_reposicao (marca, marca_codigo, janela_dias, status, disclaimer_aceito, gerado_por, origem_key)
  values (trim(p_marca), nullif(trim(p_marca_codigo), ''), p_janela_dias, 'rascunho', true, p_gerado_por, trim(p_origem_key))
  on conflict (origem_key) do nothing
  returning pedidos_reposicao.id into v_id;

  if v_id is not null then
    v_criado := true;
    v_status := 'rascunho';

    insert into pedido_reposicao_itens (
      pedido_reposicao_id, referencia, tamanho, qtd, qtd_sugerida,
      vendido_periodo, estoque_cd, ja_pedido,
      nome, tipo, classe, colecao, reffornecedor, codigo_ponto_e,
      foto_url, tipo_grade, valor_unitario, cor
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
      nullif(round(max(agg.valor_unitario), 2), 0),
      max(agg.cor)
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
             then (it->>'valor_unitario')::numeric end as valor_unitario,
        nullif(trim(it->>'cor'), '') as cor
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
$function$;

revoke all on function public.salvar_pedido_reposicao(text, integer, text, boolean, text, jsonb, text) from public;
grant execute on function public.salvar_pedido_reposicao(text, integer, text, boolean, text, jsonb, text) to anon;

notify pgrst, 'reload schema';

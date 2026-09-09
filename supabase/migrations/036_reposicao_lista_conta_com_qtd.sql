-- Reposição: a contagem de "N referências" no card da lista (view
-- pedidos_reposicao_lista) passa a ignorar referência com todos os tamanhos
-- zerados — mesmo critério que o PDF e a tela de detalhe já usam
-- (totalQtd > 0) pra decidir o que "está" no pedido.
--
-- Por quê: a tela de detalhe ganhou um botão "excluir referência" que zera
-- todos os tamanhos de uma referência (ver RevisaoReposicao.jsx —
-- handleExcluirRef). Sem este ajuste, o card da lista continuaria contando
-- essa referência ("qtd_referencias") mesmo com ela zerada e escondida na
-- tela de detalhe — os dois números (card vs. detalhe) ficariam em
-- desacordo sobre o mesmo fato ("quantas referências tem este pedido").
--
-- Só a view muda; nenhuma linha de pedido_reposicao_itens é tocada. Aditiva
-- e reversível (bastaria reaplicar a versão anterior da view, sem count
-- filtrado).
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
    count(distinct i.referencia) filter (where i.qtd > 0) as qtd_referencias,
    sum(i.qtd)                                             as qtd_total
  from public.pedido_reposicao_itens i
  where i.pedido_reposicao_id = pr.id
) ag on true;

grant select on public.pedidos_reposicao_lista to authenticated;

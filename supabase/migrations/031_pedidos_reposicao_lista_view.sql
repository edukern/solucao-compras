-- View de leitura para a lista de revisão de reposição (tela RevisaoReposicao):
-- agrega quantas referências distintas e quantas unidades no total cada rascunho
-- tem, sem exigir uma query por card (evita N+1). LATERAL correlacionado em vez
-- de "LEFT JOIN (SELECT ... GROUP BY)" solto: assim o filtro por status, aplicado
-- pelo client em cima da view, pode ser empurrado para dentro da agregação em vez
-- de agregar pedido_reposicao_itens inteira primeiro.
--
-- security_invoker = true é obrigatório aqui, não cosmético: sem essa opção a
-- view roda com o privilégio do dono (postgres) e ignora a RLS das tabelas base.
-- Com ela, a RLS de pedidos_reposicao / pedido_reposicao_itens (030, policy
-- "auth_full_access", for all to authenticated using (true)) é avaliada com o
-- role de quem consulta a view — hoje authenticated já lê tudo nas duas tabelas
-- (não há segmentação por loja/usuário nelas), então a view não expõe nada novo.
--
-- Colunas explícitas (não "pr.*") de propósito: adicionar coluna na tabela base
-- no futuro não quebra silenciosamente um "create or replace view" com *.
-- coalesce(...)::int trata rascunho sem itens (sem match no LATERAL) como 0 em
-- vez de NULL — sem isso a tela renderizaria "null" na contagem.
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

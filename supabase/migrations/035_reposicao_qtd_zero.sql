-- Reposição: permitir qtd = 0 num item de rascunho ("não repor este tamanho").
--
-- Antes: pedido_reposicao_itens.qtd tinha CHECK ((qtd > 0) AND (qtd <= 9999)),
-- o que obrigava o revisor a comprar pelo menos 1 de todo tamanho que veio com
-- sugestão — não dava para dizer "esse tamanho eu não quero". Colocar 0 marcava
-- o campo como inválido e travava o "Salvar alterações" e o "Marcar como
-- revisado" com o aviso "Há quantidades inválidas".
--
-- Agora: CHECK ((qtd >= 0) AND (qtd <= 9999)). Uma linha com qtd 0 = tamanho
-- revisado e deixado de fora; qtd_sugerida continua ao lado, preservando o
-- palpite original (auditoria). Nada é apagado.
--
-- Efeitos: a view pedidos_reposicao_lista soma qtd (0 não conta no total) e
-- conta referências distintas (uma ref toda zerada ainda aparece na contagem —
-- aceitável). As telas e o PDF já ignoram tamanho com qtd 0.
--
-- A tabela do fluxo principal (pedido_itens) não tem CHECK de qtd — a da
-- reposição era a exceção mais rígida. A RPC salvar_pedido_reposicao mantém,
-- inalterada, a recusa de qtd <= 0 no payload que chega do ponto-e-stock (feed
-- externo continua exigindo quantidade positiva na carga inicial).
--
-- Aditiva e idempotente. Reversível: basta reapertar para (qtd > 0), desde que
-- nenhum item tenha sido zerado nesse meio-tempo.
-- Revisado em 2026-09-01.

alter table public.pedido_reposicao_itens
  drop constraint if exists pedido_reposicao_itens_qtd_check;

alter table public.pedido_reposicao_itens
  add constraint pedido_reposicao_itens_qtd_check
  check ((qtd >= 0) and (qtd <= 9999));

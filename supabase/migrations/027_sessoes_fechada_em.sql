-- 027_sessoes_fechada_em.sql
-- Feature "sessão fechada": carimbo de quando o usuário clicou "Fechar sessão".
--
-- NULL  = aberta / desconhecida (todas as sessões existentes e as novas até fechar).
-- valor = momento em que foi fechada; reabrir a edição (Retomar) volta para NULL.
--
-- Aditiva e nullable: não toca dado existente, código antigo ignora a coluna,
-- inserts dos scripts de importação defaultam NULL. Status é VISUAL (badge no
-- Histórico) — NÃO trava preenchimento de loja nem edição.
alter table sessoes add column if not exists fechada_em timestamptz;

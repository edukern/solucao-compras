-- ============================================================================
-- Migração pontual: mover TODAS as sessões da coleção 27/1 para a 26/2
-- e apagar a coleção 27/1 (criada por engano — "não existe 27/1 ainda").
--
-- Origem  : colecoes.id = 1   (nome '27/1')  — 19 sessões
-- Destino : colecoes.id = 17  (nome '26/2')  — já tinha 1 sessão  → ficará com 20
--
-- Verificado antes (18/06/2026):
--   - colecao_id só existe na cadeia operacional em sessoes; visitas/pedidos/
--     pedido_itens seguem a sessão automaticamente (não têm colecao_id).
--   - FKs para colecoes(id) com regra NO ACTION: sessoes, grade_historica,
--     projecoes, hist_empresa_grade. Todas com 0 linhas em colecao_id=1
--     (exceto sessoes=19, que serão movidas). Logo o DELETE da 27/1 é limpo.
--   - Tabelas hist_* com colecao_id TEXT não referenciam colecoes.id.
--   - sessoes_backup_2622 (sem FK) tem 19 linhas col=1 — backup, deixado intacto.
--
-- NOTA: o backup é criado como PASSO SEPARADO (não dentro da transação), porque
-- o "Run and enable RLS" do SQL Editor reescreve scripts que têm CREATE TABLE e
-- quebra a transação. Por isso 3 passos abaixo, rodados na ordem.
-- ============================================================================


-- ── PASSO 1 — BACKUP (rode 1x; escolha "Run and enable RLS"; persiste) ───────
CREATE TABLE backup_move_colecao_20260618 AS
SELECT id AS sessao_id, colecao_id AS colecao_id_antigo, now() AS backup_em
FROM sessoes
WHERE colecao_id = 1;

-- confere o backup (esperado: 19)
SELECT count(*) AS linhas_no_backup FROM backup_move_colecao_20260618;


-- ── PASSO 2 — ENSAIO (não cria tabela; termina em ROLLBACK; não persiste) ────
-- Esperado: 0 · 20 · 0
BEGIN;
  UPDATE sessoes SET colecao_id = 17 WHERE colecao_id = 1;
  DELETE FROM colecoes WHERE id = 1;
  SELECT
    (SELECT count(*) FROM sessoes  WHERE colecao_id = 1)  AS sessoes_ainda_27_1,  -- 0
    (SELECT count(*) FROM sessoes  WHERE colecao_id = 17) AS sessoes_na_26_2,      -- 20
    (SELECT count(*) FROM colecoes WHERE id = 1)          AS colecao_27_1_existe;  -- 0
ROLLBACK;


-- ── PASSO 3 — DEFINITIVO (só após o ensaio bater 0 · 20 · 0) ─────────────────
BEGIN;
  UPDATE sessoes SET colecao_id = 17 WHERE colecao_id = 1;
  DELETE FROM colecoes WHERE id = 1;
COMMIT;

-- verificação final pós-commit (esperado: 0 · 20 · 0)
SELECT
  (SELECT count(*) FROM sessoes  WHERE colecao_id = 1)  AS sessoes_ainda_27_1,
  (SELECT count(*) FROM sessoes  WHERE colecao_id = 17) AS sessoes_na_26_2,
  (SELECT count(*) FROM colecoes WHERE id = 1)          AS colecao_27_1_existe;


-- ============================================================================
-- ROLLBACK MANUAL (se precisar desfazer DEPOIS do COMMIT):
--   INSERT INTO colecoes (id, nome, ano, estacao, status)
--   VALUES (1, '27/1', 2027, 'verao', 'planejamento');
--   UPDATE sessoes s SET colecao_id = b.colecao_id_antigo
--   FROM backup_move_colecao_20260618 b WHERE s.id = b.sessao_id;
-- ============================================================================

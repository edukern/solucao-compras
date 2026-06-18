---
name: migracao-27-1-para-26-2
description: Migração pontual 27/1→26/2 CONCLUÍDA em 18/06/2026 (20 sessões movidas, 27/1 apagada)
metadata:
  type: project
---

Correção de dados pontual **CONCLUÍDA em 18/06/2026 (noite)**.

**O que foi feito:** movidas TODAS as sessões da coleção 27/1 (`colecoes.id = 1`, 20 sessões no momento da execução) para a 26/2 (`colecoes.id = 17`) e apagada a 27/1 — ela foi criada por engano ("não existe 27/1 ainda"; todas as 27/1 eram na verdade 26/2). Verificação final `0 · 21 · 0` (21 = 20 movidas + 1 que a 26/2 já tinha). Rodado com 0 usuários ativos.

**Backup/rollback:** tabela `backup_move_colecao_20260618` mantida como fallback. Rollback manual no rodapé de `docs/migracao-27-1-para-26-2.sql` (recria a 27/1 e restaura `colecao_id` por `sessao_id`).

**Por que foi seguro (via [[revisor-impacto]], risco BAIXO):** colecao_id só existe em `sessoes` na cadeia operacional; visitas/pedidos/pedido_itens seguem a sessão. FKs NO ACTION (grade_historica/projecoes/hist_empresa_grade) tinham 0 linhas em col=1, então o DELETE foi limpo.

**Aprendizado reutilizável:** no SQL Editor do Supabase o "Run and enable RLS" reescreve scripts com CREATE TABLE e quebra transação — por isso backup é sempre passo separado do bloco transacional. Padrão de migração de dados que deu certo: backup isolado → ensaio BEGIN…ROLLBACK → definitivo BEGIN…COMMIT → verificação.

Relacionado: [[project_importacao_26_2]].

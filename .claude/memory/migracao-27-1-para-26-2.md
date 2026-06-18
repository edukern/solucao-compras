---
name: migracao-27-1-para-26-2
description: Migração pontual 27/1→26/2 preparada e PAUSADA, aguardando janela sem usuários
metadata:
  type: project
---

Correção de dados pontual **preparada, validada e PAUSADA** (pausada em 18/06/2026 porque usuários voltaram a preencher referências/grades — DELETE de coleção é disruptivo ao vivo).

**O que é:** mover TODAS as sessões da coleção 27/1 (`colecoes.id = 1`, eram 19 sessões) para a 26/2 (`colecoes.id = 17`) e apagar a 27/1 — ela foi criada por engano ("não existe 27/1 ainda"). Confirmado pelo Eduardo: todas as 27/1 são na verdade 26/2.

**Script pronto:** `docs/migracao-27-1-para-26-2.sql` — 3 passos no SQL Editor do Supabase: (1) backup `backup_move_colecao_20260618`, (2) ensaio com ROLLBACK (esperado 0·20·0), (3) definitivo com COMMIT.

**Why pausou:** sem urgência; rodar com gente na 27/1 deixa o seletor num estado morto (activeId aponta pra coleção apagada) até F5. Roda numa janela sem usuários.

**How to apply (retomada):**
- Reconferir `SELECT count(*) FROM sessoes WHERE colecao_id = 1` — se entraram sessões novas, será >19; ajustar o número esperado do ensaio (sessoes_na_26_2 = count + 1).
- No SQL Editor o "Run and enable RLS" reescreve scripts com CREATE TABLE e quebra transação — por isso o backup é passo separado do bloco transacional.
- Já passou pelo [[revisor-impacto]]: risco BAIXO. colecao_id só existe em sessoes na cadeia operacional; visitas/pedidos/pedido_itens seguem a sessão. FKs NO ACTION (grade_historica/projecoes/hist_empresa_grade) têm 0 linhas em col=1, então DELETE é limpo.
- Pós-COMMIT: F5 no app; a 26/2 passa a abrir por padrão (ordenação número-mais-alto) e a 27/1 some do seletor.

Relacionado: [[project_importacao_26_2]].

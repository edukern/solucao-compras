# HANDOFF — Solução Compras
Atualizado: 2026-06-18 | Handoff #10

> Várias frentes em aberto em paralelo. A mais recente está no topo. Frentes mais antigas (Importação 26/2, Sync Macle) seguem pendentes mais abaixo e **não devem ser perdidas**.

---

# 🔵 FRENTE ATUAL (sessão 18/06) — Migração de coleção + modelo de operação

## ⏳ Próximos passos pendentes

### 1. Migração 27/1 → 26/2 — ✅ CONCLUÍDA (18/06, noite)
20 sessões movidas da coleção `27/1` (id 1) para a `26/2` (id 17); coleção 27/1 apagada. Verificação final `0 · 21 · 0` (21 = 20 movidas + 1 que a 26/2 já tinha). Backup em `backup_move_colecao_20260618` (mantido como fallback; rollback manual no rodapé de `docs/migracao-27-1-para-26-2.sql`). Rodado com 0 usuários ativos.

### 2. Desenhar o modelo "Eduardo como cliente" para o projeto todo (estratégico — quando ele quiser)
Eduardo quer operar o projeto inteiro pedindo em linguagem simples, tratado como cliente que só quer que funcione. Já é o modo padrão para features/UI/fixes. Para ampliar o alcance até casos sensíveis, desenhar os **dois passos estruturais**:
- **Acesso operacional escopado** (executar mudanças de banco sem ele ser o executor manual no SQL Editor).
- **Ambiente de teste antes da produção** (a falta de staging é o que força acompanhamento próximo; com ele, mais coisa roda hands-off).
- 1º agente recomendado: **read-only de consulta** ("pergunte ao sistema em português") — valor alto, risco zero. Pergunta aberta a Eduardo: qual parte ele mais quer parar de acompanhar primeiro.

### 3. Feature futura: separar sessões abertas × fechadas no Histórico
Decisão de produto já tomada: sessão é **fechada quando clica em "Fechar sessão"**; reabrir a edição volta a aberta. Hoje não há campo de status em `sessoes`. Implementar = adicionar flag (ex.: `fechada_em timestamp`) + passar pelo `revisor-impacto` (mexe em schema + fluxo de pedidos).

## 🧠 Decisões técnicas que afetam o próximo passo
- **`colecao_id` só existe em `sessoes`** na cadeia operacional — visitas/pedidos/pedido_itens seguem a sessão. Por isso a migração é nível-de-sessão (só `UPDATE sessoes.colecao_id`).
- **Identificar coleção pelo campo `nome`** (ex.: '27/1'), nunca por `ano`/`estacao` (inconsistentes; 26/2 aparece como 2026/verao). Ordenação e identificação usam `nome`.
- **SQL Editor**: "Run and enable RLS" reescreve scripts com `CREATE TABLE` e quebra transações → backup é passo separado. Operações no editor rodam como `postgres` e ignoram RLS.
- **Deploy**: nada de código pendente; `git status` limpo em `815a7ee` (já no ar). UI desta sessão já publicada: ordenação de sessões, botão "Opções", rodapé invertido, seletor de coleções.
- **Build**: o script real é `npm run build` (CLAUDE.md cita `build:web`, que não existe — drift de doc, não corrigido).

## 📁 Arquivos relevantes
- `docs/migracao-27-1-para-26-2.sql` — script da migração pausada.
- `.claude/memory/MEMORY.md` — índice; ver `migracao-27-1-para-26-2.md` e `sessao-fechada-definicao.md`.
- `src/renderer/src/services/sessoes.js` (`list` por id desc) · `colecoes.js` (`list` por nome AA/E).
- `src/renderer/src/screens/Compras.jsx` / `Compras.module.css` — botão "Opções" e rodapé Fase 2.

---

# ✅ FRENTE — Salvaguardas contra perda de dados (CONCLUÍDA, em produção)
Branch `safeguards-perda-dados` mergeado em `main` e no ar (commit `1a87335`). 4 migrations (`022→024→025→023`) aplicadas e verificadas. Spec/plano em `docs/superpowers/`.
- **Pendente opcional:** validar no app os 3 cenários (F5 no meio do preenchimento preserva qtds; 2 abas organizador+loja não se sobrescrevem; sem internet mostra "⚠ Falha ao salvar"). Precisa de login de comprador + sessão de teste descartável (banco é produção).
- **Decisões-chave:** banco é fonte da verdade; auto-save por delta na granularidade (visita, referencia); "Fechar sessão" lê fresco do banco (não regrava); plano free sem PITR → histórico append-only + poda `pg_cron` 60 dias.

---

# 🟡 FRENTE 2 (PENDENTE) — Importação 26/2
Handoff dedicado: **`HANDOFF-IMPORTACAO-26-2.md`** (raiz). Spec/plano em `docs/superpowers/`.
Estado: 42 planilhas extraídas em `Pedidos/26-2-import/`, 3 formatos mapeados, plano escrito. **Falta executar o plano.** Trava anti-duplicação de fornecedores pendente (Aconchego/Rakels já existem sob nome variante). Ver arquivo dedicado.

---

# 🟡 FRENTE 3 (PENDENTE) — Sync Macle → Supabase

## ⏳ Próximos passos (em ordem)
1. **Conectar Agregador UI ao `hist_empresa_grade`** — `src/renderer/src/screens/Agregador.jsx` ainda não consome a tabela. Ler do Supabase com `tipo_grade`, `colecao_id`, `tamanho`, `qtd_comprada`, `qtd_vendida`, `qtd_estoque`.
2. **Agendar o sync no servidor** (Windows Task Scheduler), diário: `cd C:\sync-controle && node sync-controle.js >> C:\sync-controle\sync.log 2>&1`
3. **Projeto `macle-integrations`** — mover `sync-controle.js` + relatórios para projeto Node.js separado.

## 🧠 Decisões técnicas (Sync Macle)
- **`tipo_grade TEXT`** e não `segmentacao_id`: Macle entrega nível de grade (AD, EX, PP, BB = `gradetamanho.descricao`).
- **Lojas Backes num único comprador:** Samuel compra p/ o grupo (lojas 1,11,12,13,99); `codempresa_controle: [1,11,12,13,99]` via `ANY($1::int[])`.
- **Estratégia BI:** Macle conservador → PostgreSQL read-only (10.0.0.1 via WireGuard) → Node → upsert Supabase → React. `sync-controle.js` é o template.

## 📁 Arquivos (Sync Macle)
- `scripts/sync-controle.js` (pronto, falta config no servidor) · `scripts/sync-config.example.json` · `supabase/migrations/020_hist_empresa_grade_v2.sql` (aplicada) · `C:\sync-controle\` (servidor).

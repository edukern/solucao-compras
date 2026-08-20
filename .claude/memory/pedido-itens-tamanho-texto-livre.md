---
name: pedido-itens-tamanho-texto-livre
description: pedido_itens.tamanho é TEXT livre no banco — grades canônicas são só uma trava do front-end
metadata:
  type: project
---

`pedido_itens.tamanho` é `TEXT NOT NULL`, sem CHECK/enum, sem UNIQUE(pedido_id, tamanho)
(`supabase/migrations/001_schema_inicial.sql`). O banco já aceita qualquer string de
tamanho hoje — o bloqueio pra digitar um tamanho fora da grade sempre foi 100%
client-side (várias telas montam a lista de colunas/tamanhos salvos a partir de
`GRADE_DEFINITIONS[tipo_grade].tamanhos`, `src/renderer/src/constants/grades.js`).

Implicações confirmadas em 2026-08-20 (ver PR #14):
- Antes da correção, `buildUpdateParaVisita` (RegistrarPedidoSessao.jsx) e `handleSalvar`
  (PreencherMinhaLoja.jsx) filtravam os itens a salvar por essa lista fixa — qualquer
  quantidade num tamanho fora da grade era descartada silenciosamente ao salvar.
- pdfHelpers.js (3 geradores), Dashboard.jsx, Agregador.jsx e
  relatorios/PorSegmentacao.jsx montam a coluna de tamanhos só a partir da grade
  canônica — um tamanho fora do padrão soma no total mas não aparece em coluna nenhuma.
  **Só os 2 primeiros (pdfHelpers.js, Dashboard.jsx) foram corrigidos no PR #14**;
  Agregador.jsx e PorSegmentacao.jsx ainda têm esse gap (risco P2 aceito, são telas de
  relatório interno, não documento que sai pro fornecedor).
- Já existe dado real em produção com tamanho fora da grade canônica da sua
  `tipo_grade` (ex.: `tipo_grade='BB'` com tamanhos G/M/P/RN salvos — BB canônica é só
  1/2/3/4) — provavelmente de reclassificação de segmentação depois que já havia dado
  lançado, ou de import histórico.
- Também já existem linhas duplicadas em `pedido_itens` pro mesmo (pedido_id, tamanho)
  — até 7 repetições em alguns pedidos. Não investigado ainda; task separada aberta
  (ver `task_02756913` no spawn_task) pra achar a origem antes de decidir se corrige.

**Why:** entender isso evita reintroduzir o bug (filtrar por grade canônica antes de
salvar) e explica por que "tamanho extra numa sessão" não precisou de migração nova —
ver [[dev-local-usa-banco-producao]].

**How to apply:** ao mexer em qualquer código que grave ou exiba `pedido_itens`, nunca
assumir que `tamanho` está limitado à grade do `tipo_grade` — usar a união entre a grade
canônica e o que está realmente salvo, tanto pra salvar (nunca filtrar) quanto pra exibir.

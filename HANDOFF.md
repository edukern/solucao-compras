# HANDOFF — Solução Compras
Atualizado: 2026-06-18 | Sessão #9

> Este projeto tem **3 frentes em aberto em paralelo**. A frente ATIVA desta sessão é a #1 (Salvaguardas). As frentes #2 e #3 continuam pendentes e **não devem ser perdidas**.

---

# 🔴 FRENTE 1 (ATIVA) — Salvaguardas contra perda de dados

Branch: **`safeguards-perda-dados`** (NÃO está em `main`, NÃO está em produção).
Spec: `docs/superpowers/specs/2026-06-18-safeguards-perda-dados-design.md`
Plano: `docs/superpowers/plans/2026-06-18-safeguards-perda-dados.md`

Código 100% implementado, testado (build ok, 8/8 testes) e revisado. Falta só **aplicar as migrations e publicar**.

## ⏳ Próximos passos (em ordem)

### 1. Aplicar as 4 migrations no Supabase (projeto `bhxpkysueyoblizkvomb`)
No SQL Editor, rodar o conteúdo de cada arquivo, **um de cada vez**, e conferir a verificação:

| Ordem | Arquivo | Verificação (resultado esperado) |
|---|---|---|
| 1 | `supabase/migrations/022_pedidos_updated_at.sql` | `SELECT column_name FROM information_schema.columns WHERE table_name='pedidos' AND column_name='updated_at';` → 1 linha |
| 2 | `supabase/migrations/024_rpc_salvar_pedidos.sql` | `SELECT proname FROM pg_proc WHERE proname='salvar_pedidos_visita';` → 1 linha |
| 3 | `supabase/migrations/025_app_config_manutencao.sql` | `SELECT id, manutencao FROM app_config;` → `1 | false` |
| 4 | `supabase/migrations/023_historico_append_only.sql` | `SELECT jobname FROM cron.job WHERE jobname='podar-historico';` → 1 linha |

⚠️ Se o **023** falhar em `CREATE EXTENSION pg_cron`: ativar `pg_cron` em **Database → Extensions** e rodar de novo (o 023 é idempotente).

### 2. Publicar (só DEPOIS das migrations confirmadas)
`git checkout main && git merge safeguards-perda-dados && git push` — o push para `main` dispara o deploy no Cloudflare Pages. Ordem obrigatória: **banco primeiro, código depois** (o código novo chama a RPC, lê `updated_at` e `app_config`).

### 3. Verificação pós-deploy (cenários)
- F5 no meio do preenchimento → quantidades voltam (não somem).
- 2 abas (organizador Phase 2 + loja Phase 5 na mesma sessão) → organizador "Gerar PDFs" preserva o que a loja preencheu.
- Sem internet → status "⚠ Falha ao salvar / tentar de novo".

## 🧠 Decisões técnicas que não estão no código

- **Banco é a fonte da verdade.** Quantidades são auto-salvas por delta na granularidade **(visita, referencia)** — gravar uma loja nunca toca outra. Está coberto por teste (`tests/pedido-merge.test.js`, caso "overwrite guard").
- **Fechar sessão NÃO regrava** — lê fresco do banco via `itensPorFornecedor`. `salvarBatch` (delete+insert não atômico) foi **removido**.
- **Concorrência:** última-escrita-vence por (visita, ref). Merge no nível do tamanho ficou como evolução futura documentada no spec (não implementado).
- **Plano free, sem PITR:** rede de segurança = histórico append-only por trigger + poda `pg_cron` 60 dias. Histórico tem RLS sem SELECT (cliente não lê histórico de outra loja).
- **Follow-up conhecido (não-bloqueante):** `segmentacoes.findOrCreate` é select-then-insert (não atômico) — risco baixo de segmentação duplicada sob concorrência. Não foi corrigido para evitar migration de constraint às cegas. Considerar UNIQUE(classificacao,tipo_produto,classe,tipo_grade) + upsert depois.

## 📁 Arquivos que importam para esta frente

| Arquivo | O quê |
|---|---|
| `supabase/migrations/022..025` | As 4 migrations a aplicar |
| `src/renderer/src/services/pedidoMerge.js` | Lógica pura de delta (`computeItensDelta`, `computeDeltaPorVisita`) |
| `src/renderer/src/services/pedidos.js` | `salvarPedidosVisita` (RPC), `salvarQuantidadesDelta`, `maxUpdatedAt` |
| `src/renderer/src/screens/Compras.jsx` | Integração: auto-save delta, recovery, fechar, status, manutenção |

---

# 🟡 FRENTE 2 (PENDENTE) — Importação 26/2

Handoff próprio e detalhado: **`HANDOFF-IMPORTACAO-26-2.md`** (raiz).
Spec/plano: `docs/superpowers/specs/2026-06-18-importacao-26-2-design.md` e `docs/superpowers/plans/2026-06-18-importacao-26-2.md`.
Estado: 42 planilhas extraídas em `Pedidos/26-2-import/`, 3 formatos mapeados, plano de implementação escrito. **Falta executar o plano.** Ver o arquivo dedicado antes de continuar.

---

# 🟡 FRENTE 3 (PENDENTE) — Sync Macle → Supabase (era a sessão #8)

## ⏳ Próximos passos (em ordem)

1. **Conectar Agregador UI ao `hist_empresa_grade`** — `src/renderer/src/screens/Agregador.jsx` ainda não consome a tabela. Ler do Supabase com `tipo_grade`, `colecao_id`, `tamanho`, `qtd_comprada`, `qtd_vendida`, `qtd_estoque`.
2. **Agendar o sync no servidor** (Windows Task Scheduler), diário:
   `cd C:\sync-controle && node sync-controle.js >> C:\sync-controle\sync.log 2>&1`
3. **Projeto `macle-integrations`** — depois do Agregador, mover `sync-controle.js` + relatórios para projeto Node.js separado, tirando do solucao-compras.

## 🧠 Decisões técnicas (Sync Macle)

- **`tipo_grade TEXT` e não `segmentacao_id`:** Macle entrega dados no nível de grade (AD, EX, PP, BB = `gradetamanho.descricao`); `segmentacoes` é mais granular e não bate.
- **Todas as lojas Backes num único comprador:** Samuel compra para o grupo (lojas 1,11,12,13,99); `codempresa_controle: [1,11,12,13,99]` agrega via `ANY($1::int[])`.
- **Estratégia BI geral:** ERP Macle é conservador → padrão é PostgreSQL read-only (10.0.0.1 via WireGuard) → script Node → upsert Supabase → React. `sync-controle.js` é o template.

## 📁 Arquivos (Sync Macle)

| Arquivo | Importância |
|---|---|
| `scripts/sync-controle.js` | Script completo e pronto — só falta o config no servidor |
| `scripts/sync-config.example.json` | Template do config |
| `supabase/migrations/020_hist_empresa_grade_v2.sql` | Migration já aplicada |
| `C:\sync-controle\` (servidor) | Destino do script no servidor Windows |

**Banco controle Macle (tabelas-chave do sync):** `itemdoccompra` (compras, filtro `dtmovto`/`codempresa`), `itemdocvenda` (vendas, filtro `dataemissao`/`codempresa`/`estornado<>'S'`), `estoque` (saldo, sem filtro), `item` (catálogo, tem `codgrade`/`codcolecao`), `gradetamanho` (nome da grade), `tamanho` (nome/ordem).

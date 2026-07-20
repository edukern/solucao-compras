# HANDOFF — Solução Compras
Atualizado: 2026-06-21 | Handoff #13

> Várias frentes em aberto em paralelo. A mais recente está no topo. Frentes mais antigas (Importação 26/2, Sync Macle) seguem pendentes mais abaixo e **não devem ser perdidas**.

---

# 🔵 FRENTE ATUAL (sessão 21/06) — Camada compartilhada de leitura do ERP (`macle-integrations`)

> Sessão conduzida a partir do `ponto-e-stock`, mas com impacto direto aqui. A antiga **Frente 3 (Sync Macle → Supabase)** ganhou um projeto dedicado: **`macle-integrations`** (`D:\projetos\macle-integrations`, repo privado `github.com/edukern/macle-integrations`). Em vez de cada app (este + ponto-e-stock) ler o `controle` por conta própria, uma camada única lê o ERP e grava numa tabela compartilhada no **Supabase deste projeto**.

## O que muda para o solucao-compras
- A tabela nova `hist_segmento_loja` (loja × nivel2/3/4 = TIPO/CLASSE/CLASSIFICACAO — "segmento" é nome legado, ver macle `macle-taxonomia-produto` — × tamanho, com qtd **e valor**) **já está no Supabase `bhxpkysueyoblizkvomb` (criada e populada 21/06, RLS habilitado, anon key bloqueada).** Fase 1 = só a camada; ninguém consome ainda. O `sync-controle.js`/`hist_empresa_grade` daqui continuam intactos.
- Intenção de médio prazo: migrar o `sync-controle.js` daqui para o `macle-integrations` e, num 2º spec, **substituir o import manual de Excel** da projeção de compra por essa tabela.
- Continuação detalhada está em `D:\projetos\macle-integrations\HANDOFF.md` (**sync em produção e validado; falta só agendar no servidor**).

## ⚠️ Achados desta sessão que afetam ESTE repo
1. **SEGURANÇA — service_role key vazada.** `scripts/migrate.mjs:31` tem a **service_role key hardcoded e commitada** (JWT válido até 2036). Ela ignora RLS → lê/escreve tudo. **Rotacionar no Supabase + mover para env.** (A anon key pública no `deploy-web.yml` é normal — a proteção dela é o RLS; mas por isso toda tabela nova com dado sensível PRECISA de RLS habilitado.)
2. **Coleção errada no sync-config.** `scripts/sync-config.example.json` usa `codcolecao 20000014` (coleção ANTIGA). A ativa é **20000015** (2026/2). Conferir se o `sync-config.json` real do servidor já está em 20000015 — senão o sync puxa coleção errada.
3. **Colunas de valor do ERP confirmadas ao vivo:** não existe `valortotal`. Valor bruto = venda `(qtd − qtddevolv) × precoun`, compra `qtd × vlrunit`; `estoque` sem valor. Útil se o `sync-controle.js` daqui (hoje só qtd) for estendido para valor.

## 📝 Mudanças no working tree (NÃO commitadas — main é protegida, precisam de PR)
- `PROJETO.md` — **corrigido**: descrevia versão Electron/SQLite que não existe mais; agora reflete a stack real (React/Vite/Supabase). `CLAUDE.md` declarado como fonte de verdade da stack.
- `package.json` — descrição não cita mais "RH" (módulo já removido).
- `.claude/memory/` — `project_ponto_e_stock_integracao.md` e `MEMORY.md` atualizados (macle-integrations criado, achados do ERP).

---

# 🔵 FRENTE ATUAL (sessão 19/06) — Acesso da Scheila (colaboradora do CD)

Scheila vai mexer no sistema via Claude na máquina dela, "sem quebrar nada". Rede de segurança em camadas. **Setup técnico concluído — só falta ela rodar o setup na máquina dela.** Detalhes/reverter em `.claude/memory/colaboracao-scheila-branch-protection.md`.

## ✅ Feito nesta sessão
- **Repo agora PRIVADO** (`gh repo edit --visibility private`) — era público com conteúdo interno/pessoal exposto. Análise de carreira do Eduardo movida pra memória pessoal (fora do repo).
- **`main` protegida** (via `gh api`): exige PR + check `build` verde + **1 aprovação do Eduardo** + branch up-to-date; sem force-push/delete; `enforce_admins: false` (Eduardo segue com push direto; só a Scheila fica presa ao PR).
- **Conta da empresa `lojaspontoe` adicionada como colaboradora (Write, aceito).** Convite solto p/ `connorfinan95` cancelado. Sem pendências de acesso no GitHub.
- **Camada 1** (agente revisor viaja no clone) + **Camada 2** (gate de build `pr-check.yml`) commitadas (`9041443`) e ativas (a proteção da main as tornou efetivas). **`.claude/CLAUDE.md` também passou a viajar** (contexto pro Claude dela).
- **Guias prontos:** `CONTRIBUTING.md` (uso diário, linguagem simples sem inglês) + `docs/SETUP-SCHEILA.md` (prompt pra ela colar no Claude dela fazer o setup sozinho).
- **Preview de PR (camada 3) DESCARTADO**: sem staging, bateria no Supabase de produção (revisão deu P0). Scheila valida visual no `npm run dev` local. Só reconsiderar com staging.

## ⏳ Próximos passos
1. **Scheila (na máquina dela):** colar o prompt de `docs/SETUP-SCHEILA.md` no Claude Code → setup automático (login GitHub como `lojaspontoe`, clone, `npm install`, `.env.local`, `npm run dev`) → abrir o 1º PR.
2. **Eduardo:** quando o 1º PR aparecer, revisar/aprovar (Claude guia). Nada pendente antes disso.
3. (Opcional) Se quiser banco de teste de verdade → criar **Supabase de staging** e então o preview de PR passa a fazer sentido.

## 🧠 Decisões
- **Conta usada:** Scheila opera com a conta da empresa `lojaspontoe` (não conta pessoal) → autoria dos PRs aparece como "empresa", sem rastreio por pessoa. Aceitável por ora.
- O "ambiente de teste antes da produção" que faltava = **`npm run dev` local** (mesmo app, privado, antes do PR). Preview na nuvem só agrega com staging.
- `enforce_admins: false` é intencional (escape hatch do dono). Para prender o Eduardo também: ligar `enforce_admins`.

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

### 3. Badge de sessão fechada — ✅ IMPLEMENTADA (19/06, commit `0a7cf6b`)
Coluna `sessoes.fechada_em` (migração `027`, **aplicar no Supabase**); `handleFechar` carimba (não-bloqueante), `handleRetomarSessao` limpa, badge "Fechada" no Histórico quando `fechada_em != null`. Passou pelo `revisor-impacto` (risco BAIXO). **É status VISUAL — não trava preenchimento de loja nem edição** (congelar de verdade seria outra feature: checagem na escrita/RLS).

## 🧠 Decisões técnicas que afetam o próximo passo
- **`colecao_id` só existe em `sessoes`** na cadeia operacional — visitas/pedidos/pedido_itens seguem a sessão. Por isso a migração é nível-de-sessão (só `UPDATE sessoes.colecao_id`).
- **Identificar coleção pelo campo `nome`** (ex.: '27/1'), nunca por `ano`/`estacao` (inconsistentes; 26/2 aparece como 2026/verao). Ordenação e identificação usam `nome`.
- **SQL Editor**: "Run and enable RLS" reescreve scripts com `CREATE TABLE` e quebra transações → backup é passo separado. Operações no editor rodam como `postgres` e ignoram RLS.
- **Deploy**: tudo no ar em `0a7cf6b` (19/06). Desde a sessão 18/06: fix desconto, scripts de import na coleção 17, guard anti-duplicado, `saude.js`/Programação, `reimport.js`, badge de sessão fechada. Deploy é Cloudflare Pages no push (GitHub Actions `deploy-web.yml`), não Vercel.
- **Build**: o script real é `npm run build` (`vite build --config vite.web.config.js` → `dist/web`). Drift do `.claude/CLAUDE.md` (citava `build:web`) corrigido em 18/06.

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

# 🟡 FRENTE 2 (EM ANDAMENTO) — Importação 26/2

## Estado atual (20/06 — saúde pós-sessão)

```
OK: ~24  |  OK_MAS_DUP: 6  |  DIVERGE: 8  |  FALTA_CADASTRO: 5  |  NAO_IMPORTADO: 0
Bolt total: ~86.700 peças  |  Planilha: 84.382 peças
```

Rodar `node docs/importar-26-2/saude.js` para confirmar números exatos.

## ✅ Concluído nesta sessão (20/06)
- **19 fornecedores novos** criados via `seed-fornecedores.js` (IDs #762–#780, incluindo BEAVER x2, CHARMS, LOOK CHIC, PURO MAR).
- **ÍNTIMA FLOR #737** (com acento, duplicado) apagado + FKs limpas. Import realizado sob #405 (5.458pç).
- **Mormaii Calçados** importado sob #724 (382pç). Arquivo renomeado de `Calcacados` → `Calcados` (typo corrigido). #775 "MORMAII CALCADOS" ficou vazio — pode apagar.
- **Todos os 24 fornecedores "simples"** importados com OK.

## ⏳ Pendências que precisam de confirmação

### 1. Arquivos "Programação" — importar ou ignorar?
Form respondeu "faz parte do pedido principal" — ainda não claro se significa:

**A) Ignorar** — peças já estão contadas na planilha principal. Saude.js mostra FALTA_CADASTRO para esses arquivos; intencional.

**B) Importar como segunda sessão** do fornecedor pai — requer `--fornecedor-id=N` no apply.js e desativar GAP_TOTAL para reimports explícitos.

| Arquivo | Peças | Fornecedor pai |
|---|---|---|
| FEMMINART PROGRAMACAO | 734 | FEMMINART #690 |
| LZT Programação | 318 | LZT (verificar id) |
| Mormaii Programação | 1.095 | MORMAII #342 |

**Quem confirma:** Samuel (foi quem mencionou Programação no form).

### 2. DIVERGE pequenos — reimportar ou aceitar?
Form confirmou Aconchego +2 e Urban City +2 → bolt correto, ignorar.  
Os demais precisam de decisão:

| Fornecedor | Planilha | Bolt | Diff |
|---|---|---|---|
| Desayner | 1.752 | 1.691 | -61 |
| Marco Textil | 856 | 853 | -3 |
| SCHRAMM | 5.585 | 5.511 | -74 |
| Tanise | 3.884 | 3.881 | -3 |
| Trajadinhos | 1.723 | 1.534 | -189 |

`reimport.js` (apagar-e-reinserir) já está pronto para Desayner/Tanise/Trajadinhos. SCHRAMM bloqueado (abas-pessoa no xlsx, precisa parsear).

### 3. Mormaii DIVERGE +1.751
Bolt=3.211 vs planilha=1.460. Provavelmente veio de importação anterior de outra coleção misturada aqui. Investigar se há sessões de coleção errada vinculadas ao MORMAII #342.

### 4. OK_MAS_DUP — limpar cadastros duplicados (baixa urgência)
| Fornecedor | Ação |
|---|---|
| Rakels | Manter RAKEL'S #587, apagar #642 |
| Aconchego | Manter #9, apagar os outros |
| BEAVER | Dois CNPJs legítimos — manter ambos |
| Biogás, Elite, Lupo, LZT | Confirmar qual manter |

### 5. MORMAII CALCADOS #775 — apagar
Sobra do seed (import foi pro #724). Remover FK de `hist_fornecedor` e `hist_comprador_fornecedor` antes de apagar (mesmo procedimento do ÍNTIMA FLOR #737).

## Arquivos relevantes
- `docs/importar-26-2/apply.js` — import principal
- `docs/importar-26-2/saude.js` — relatório de cobertura
- `docs/importar-26-2/seed-fornecedores.js` — 19 fornecedores criados
- `docs/importar-26-2/reimport.js` — apagar-e-reinserir (dry-run por padrão)
- `Pedidos/26-2-import/` — xlsx de origem (42 arquivos)

---

# 🟡 FRENTE 3 (PENDENTE) — Sync Macle → Supabase

## ⏳ Próximos passos (em ordem)
1. ✅ **Agregador UI já consome `hist_empresa_grade`** (`services/agregador.js`, `screens/Agregador.jsx`). Tabela tem 529 linhas (sync já rodou ao menos 1x, provavelmente manual).
2. **Agendar o sync no servidor** (Windows Task Scheduler), diário: `cd C:\sync-controle && node sync-controle.js >> C:\sync-controle\sync.log 2>&1`. **Combinado: configurar 20/06 de manhã.**
3. **Projeto `macle-integrations`** — mover `sync-controle.js` + relatórios para projeto Node.js separado.
4. **Integração ponto-e-stock** (não começou) — o motor de reposição roda 100% em mocks; falta escrever o provider real (`getStockProvider`/`external/`) lendo `hist_empresa_grade` do Supabase.

## 🧠 Decisões técnicas (Sync Macle)
- **`tipo_grade TEXT`** e não `segmentacao_id`: Macle entrega nível de grade (AD, EX, PP, BB = `gradetamanho.descricao`).
- **Lojas Backes num único comprador:** Samuel compra p/ o grupo (lojas 1,11,12,13,99); `codempresa_controle: [1,11,12,13,99]` via `ANY($1::int[])`.
- **Estratégia BI:** Macle conservador → PostgreSQL read-only (10.0.0.1 via WireGuard) → Node → upsert Supabase → React. `sync-controle.js` é o template.

## 📁 Arquivos (Sync Macle)
- `scripts/sync-controle.js` (pronto, falta config no servidor) · `scripts/sync-config.example.json` · `supabase/migrations/020_hist_empresa_grade_v2.sql` (aplicada) · `C:\sync-controle\` (servidor).

---

## 📋 Backlog técnico (auditoria jun/2026)

Melhorias de qualidade/segurança em [`docs/BACKLOG.md`](docs/BACKLOG.md). Destaque 🔴: remover fallback de dev do `RH_JWT_SECRET` (`api/_rh-lib.js`) e quebrar o `Compras.jsx` (plano em `docs/PLANO-QUEBRAR-COMPRAS.md`). Nenhum bloqueia produção.

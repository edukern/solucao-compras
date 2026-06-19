# HANDOFF — Solução Compras
Atualizado: 2026-06-19 | Handoff #12

> Várias frentes em aberto em paralelo. A mais recente está no topo. Frentes mais antigas (Importação 26/2, Sync Macle) seguem pendentes mais abaixo e **não devem ser perdidas**.

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
Handoff dedicado: **`HANDOFF-IMPORTACAO-26-2.md`** (raiz) — tem o estado atual.
Avançado (19/06): coleção alvo corrigida p/ id 17 (`lib/colecao.js`), guard anti-duplicado blindado, `saude.js` corrigido (Programação não casa com base), diagnóstico das 7 divergências, `reimport.js` (apagar-e-reinserir, dry-run). **Aguardando compradores** (Google Form enviado: fornecedores novos/duplicados, Programação, Lupo, códigos/extras). Cruzamento com banco `controle`: 14 dos 17 sem-cadastro já existem lá. Reimport pronto p/ Desayner/Trajadinhos/Tanise; SCHRAMM bloqueado (abas-pessoa).

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

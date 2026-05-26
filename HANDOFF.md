# HANDOFF — Solução Compras

> Última atualização: 2026-05-26 — Sessão 8 (arquitetura multi-usuário + plano de implementação)

---

## Prompt para colar na nova sessão

> Estou continuando o desenvolvimento da **Solução Compras** — app de gestão de pedidos de compra para a rede de 8 lojas Irmãos Backes. Na última sessão finalizamos o design da arquitetura multi-usuário e escrevemos o plano de implementação completo. O próximo passo é **executar o plano** em `docs/superpowers/plans/2026-05-26-migracao-core-web.md`, começando pela **Task 1: Schema no Supabase**. Por favor leia o HANDOFF.md e o plano antes de qualquer ação.

---

## ✅ O que foi concluído nesta sessão (Sessão 8)

1. **Análise histórica dos 3.000 xlsx** em `Pedidos/` — estrutura de dados mapeada, 8 compradores identificados, 4 campos faltantes no schema detectados
2. **Relatório DOCX executivo** gerado em `docs/Análise Histórico de Pedidos.docx`
3. **Brainstorming de arquitetura completo** — 3 opções de arquitetura comparadas, 4 opções de infra zero-custo analisadas, estratégia de compactação de dados definida
4. **Design doc aprovado e commitado** — `docs/superpowers/specs/2026-05-26-arquitetura-multi-usuario-design.md`
5. **Plano de implementação completo commitado** — `docs/superpowers/plans/2026-05-26-migracao-core-web.md`

---

## ⏳ Próximos passos (em ordem)

### PRÓXIMA TAREFA IMEDIATA: Executar Task 1 do plano

Abrir `docs/superpowers/plans/2026-05-26-migracao-core-web.md` e executar a **Task 1: Schema no Supabase**:

1. Criar os arquivos SQL (o plano tem o conteúdo completo):
   - `supabase/migrations/001_schema_inicial.sql`
   - `supabase/migrations/002_hist_tables.sql`
   - `supabase/seed.sql`
2. Rodar os 3 SQLs no Supabase Dashboard → SQL Editor (nessa ordem)
3. Verificar que as tabelas aparecem em Database → Tables

**Depois da Task 1, seguir em sequência:**
- Task 2: Criar `src/renderer/src/services/` (9 arquivos de serviços Supabase)
- Task 3: Instalar `xlsx`, migrar `CollectionContext.jsx`, limpar `App.jsx`
- Task 4: Migrar `Compras.jsx` (~20 chamadas window.api)
- Task 5: Migrar `Dashboard.jsx` e `Planejamento.jsx`
- Task 6: Auth (AuthContext + tela Login + guard + RLS)
- Task 7: Deploy Cloudflare Pages + keep-alive cron GitHub Actions

### Planos follow-on (após o core):
- Script de import histórico dos 3.000 xlsx → tabelas `hist_*`
- Relatórios: Curva ABC, Quebra de Estoque, Análise por Lojista

---

## 📁 Arquivos modificados nesta sessão

| Arquivo | Motivo |
|---|---|
| `docs/Análise Histórico de Pedidos.docx` | Relatório executivo da análise histórica |
| `docs/gerar-relatorio-pedidos.js` | Script Node.js que gerou o DOCX |
| `docs/superpowers/specs/2026-05-26-arquitetura-multi-usuario-design.md` | Design doc aprovado pelo usuário |
| `docs/superpowers/plans/2026-05-26-migracao-core-web.md` | Plano de implementação completo (7 tasks) |
| `.claude/handoff-memory.json` | Controle de handoffs (criado) |

---

## 🧠 Decisões técnicas que não estão no código

### Arquitetura escolhida: Web App + Supabase Free + Cloudflare Pages + keep-alive cron
- **Por que não Firebase:** Firestore é NoSQL — dificulta Curva ABC (`GROUP BY`) e joins de grade. PostgreSQL resolve naturalmente.
- **Por que não Supabase Pro:** O único problema do free é a pausa de 1 semana. Um cron SELECT a cada 4 dias resolve. Com dados compactados, 500MB é mais que suficiente por anos.
- **Por que Cloudflare Pages e não Vercel:** Vercel Hobby tem restrição "non-commercial only" nos ToS — viola para app empresarial. Cloudflare é gratuito e comercial OK.

### Estratégia de compactação de dados (decisão central desta sessão)
- Os 3.000 xlsx (~400MB) são reduzidos a 4 tabelas de resumo (~10MB):
  - `hist_grade` — grade por produto/temporada → alimenta projeções
  - `hist_fornecedor` — volume por fornecedor/temporada → Curva ABC
  - `hist_comprador_fornecedor` — quem compra quanto de quem
  - `hist_comprador_produto` — mix de produto por lojista
- Import é feito **1× por script standalone** (não faz parte do app).
- xlsx originais ficam no Google Drive como arquivo (app não acessa mais).

### Data layer: window.api.* (não window.electron diretamente)
- O app usa uma abstração `window.api.*` via preload bridge do Electron.
- A migração cria `src/renderer/src/services/` com funções de mesma assinatura.
- `Pendencias.jsx` já usa Supabase diretamente — é o modelo a seguir.
- Mapeamento completo das ~20 chamadas está na Task 2 do plano.

### Campos do schema: maioria já existe
- `cor` → já em `pedidos.cor` (adicionado maio/2026)
- `icms_pct` → já em `pedidos.icms_pct`
- `nota_fiscal` → já em `pedidos.nota_fiscal`
- **Só `prazo_entrega DATE` é genuinamente novo** (está no plano, Task 1)

### Branch e estado do git
- Commits desta sessão em: `release/v1.1.13`
- Verificar com `git branch` antes de começar a próxima sessão

---

## 🔑 Contexto permanente do projeto

- **Supabase URL:** `https://bhxpkysueyoblizkvomb.supabase.co`
- **Supabase anon key:** `sb_publishable_Pe-o7iG5jjV0n0qTTKQI-Q_DUZ8-tHm`
- **Demo atual:** `solucao-compras-demo.vercel.app` (usa mock data — será substituído por Cloudflare Pages)
- **8 compradores:** Irmãos Backes, Samuel Paulo Backes, PSM Backes, Alexandre Backes, Elisangela M. Backes, Rafael J. Backes, Streit Conf, FMV Streit Conf
- **Pasta de pedidos históricos:** `C:\Users\eduke\Solução Compras\Pedidos\` (sincronizada no Google Drive, ~3.000 xlsx, 2015–2026)
- **Email do usuário:** gptlojaspontoe@gmail.com

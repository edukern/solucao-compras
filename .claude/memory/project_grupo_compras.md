---
name: estado-do-projeto-e-pr-ximos-passos
description: "Contexto completo do projeto Solução Compras — stack, features prontas, bugs abertos, pendências"
metadata: 
  node_type: memory
  type: project
  originSessionId: ea745987-669c-42b2-a60c-2c7f68e82abb
---

## O projeto

App React + Supabase (SPA, sem Electron) para gestão de pedidos de compra em grupo da rede Irmãos Backes.

**Repo:** https://github.com/edukern/solucao-compras  
**App web:** https://bolt-compras.pages.dev (Cloudflare Pages, auto-deploy no push)  
**Supabase project:** `bhxpkysueyoblizkvomb`  
**Stack:** React 18 + Vite, Supabase (auth + DB + realtime), CSS Modules  
**Hook:** `prevent-destructive-commands.py` bloqueia `git add`/`git commit` — usuário roda git manualmente

---

## Phases de navegação (Compras.jsx)

| Phase | Tela |
|---|---|
| 0 | Home / Histórico de sessões |
| 1 | Nova sessão (formulário) |
| 2 | Registrar pedidos — editor de itens + grades por loja |
| 3 | Fechar sessão — gerar PDFs |
| 4 | Visualizar sessão (somente leitura, auto-refresh) |
| 5 | Preencher minha loja (preenchimento colaborativo) |

---

## Features prontas (2026-05-28)

- Phases 0–5 implementadas
- Controle de acesso: `comprador.is_editor` — só editores acessam Phase 2
- Phase 5 colaborativa: organizador "libera" refs → compradores preenchem sua loja
- Supabase Presence: aviso multi-device
- PDF de pedidos: layout tabular horizontal A4 landscape (reescrito na sessão 13)
- Histórico com stats (peças + valor) por sessão
- Recuperação de sessão interrompida (localStorage)

---

## 🔴 BUG ABERTO — PRIORITÁRIO

**Erro ao clicar "Editar" em sessão existente (Phase 2 via handleRetomarSessao):**
`Cannot read properties of undefined (reading 'reduce')`

A função `handleRetomarSessao` (Compras.jsx ~linha 3399) chama `itensPorFornecedor` + `byId`, constrói `items`/`qtds`/`visitas` e chama `setPhase(2)`. O componente `RegistrarPedidoSessao` monta e crashea com o erro de reduce. Fix defensivo sugerido no HANDOFF.md.

---

## Commits pendentes (código modificado, não commitado)

```bash
cd "C:\Users\eduke\Solução Compras"
git add src/renderer/src/screens/Compras.jsx src/renderer/src/services/sessoes.js supabase/migrations/016_compradores_pdf_info.sql HANDOFF.md
git commit -m "feat: PDF tabular horizontal + corrige retomar sessão (Phase 2)"
git push
```

---

## Migration pendente no Supabase

```sql
ALTER TABLE compradores
  ADD COLUMN IF NOT EXISTS fantasia  TEXT,
  ADD COLUMN IF NOT EXISTS ie        TEXT,
  ADD COLUMN IF NOT EXISTS email     TEXT,
  ADD COLUMN IF NOT EXISTS telefone  TEXT,
  ADD COLUMN IF NOT EXISTS endereco  TEXT;
```

---

## Arquivos-chave

- `Compras.jsx` — ~3630 linhas, tudo nele: 5 phases + todos os subcomponentes + geração de PDF
- `Compras.module.css` — ~2400 linhas
- `services/pedidos.js` — CRUD pedidos, itens, visitas
- `services/sessoes.js` — CRUD sessões + normalizeVisitas
- `contexts/AuthContext.jsx` — user, comprador, is_editor
- `constants/grades.js` — GRADE_DEFINITIONS, tamanhosDeTipoGrade

**Why:** HANDOFF.md no root do projeto tem detalhe completo de cada próximo passo.

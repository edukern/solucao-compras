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

## Estado (atualizado 2026-06-19)

- **Bug de retomar sessão (reduce undefined) — RESOLVIDO** (commit "corrige retomar sessão Phase 2"). `handleRetomarSessao` fica em `Compras.jsx` ~l4441 (o ~3399 dos docs antigos está desatualizado).
- **Migration de compradores** (fantasia/ie/email/telefone/endereco) — **aplicada** (o código já lê esses campos no retomar).
- **Path do projeto:** `D:\projetos\solucao-compras` (drive D:). O antigo `C:\Users\eduke\Solução Compras` não vale mais.
- **Git:** commito normalmente (o hook só bloqueia comandos destrutivos, não `git add/commit`).
- **Sessão fechada (badge `fechada_em`)** e **Agregador consumindo `hist_empresa_grade`** — ambos implementados (jun/2026).

Para o estado vivo de cada frente, ver `HANDOFF.md` na raiz e `HANDOFF-IMPORTACAO-26-2.md`.

---

## Arquivos-chave

- `Compras.jsx` — ~3600+ linhas: 5 phases + subcomponentes + geração de PDF
- `Compras.module.css`
- `services/pedidos.js` — CRUD pedidos, itens, visitas
- `services/sessoes.js` — CRUD sessões + normalizeVisitas
- `contexts/AuthContext.jsx` — user, comprador, is_editor
- `constants/grades.js` — GRADE_DEFINITIONS, tamanhosDeTipoGrade

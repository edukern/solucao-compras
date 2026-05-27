# HANDOFF — Solução Compras

> Última atualização: 2026-05-26 — Sessão 9 (migração core web executada + infra Supabase/Cloudflare)

---

## Prompt para colar na nova sessão

> Estou continuando o desenvolvimento da **Solução Compras** — app de gestão de pedidos de compra para a rede de 8 lojas Irmãos Backes. Na última sessão concluímos a migração Electron → Web App com Supabase + Cloudflare Pages. O app está no ar em **https://bolt-compras.pages.dev**. Leia o HANDOFF.md antes de qualquer ação.

---

## ✅ O que foi concluído nesta sessão (Sessão 9)

1. **Executadas todas as 7 tasks do plano** `docs/superpowers/plans/2026-05-26-migracao-core-web.md`
2. **Schema Supabase criado** — 10 tabelas + RLS + políticas via Management API
3. **Camada de serviços** — 9 arquivos em `src/renderer/src/services/` substituindo `window.api.*`
4. **Auth Supabase** — `AuthContext.jsx`, `Login.jsx`, guard de sessão em `App.jsx`, botão "Sair" no Sidebar
5. **Compras.jsx e Planejamento.jsx** migrados — PDF via Blob download, import via `<input type="file">`
6. **GitHub Actions keep-alive** — `.github/workflows/keepalive.yml` (ping Supabase a cada 4 dias)
7. **Cloudflare Pages** — projeto `bolt-compras`, env vars configuradas, **URL: https://bolt-compras.pages.dev**
8. **GitHub Actions deploy** — `.github/workflows/deploy-web.yml` auto-deploya em push para `main`
9. **GitHub Secrets** configurados: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
10. **Adendo de auto-cadastro** adicionado ao plano de migração — fluxo `SelecionarLoja.jsx` documentado

---

## Estado atual da infraestrutura

| Componente | Status |
|---|---|
| Supabase (banco) | ✅ Online — `bhxpkysueyoblizkvomb.supabase.co` |
| Supabase Auth | ✅ Configurado — zero usuários cadastrados (placeholder deletados) |
| Cloudflare Pages | ✅ `https://bolt-compras.pages.dev` |
| GitHub Actions deploy | ✅ Roda em push para `main` (~2 min) |
| GitHub Actions keep-alive | ✅ Cron a cada 4 dias |
| Electron (app desktop) | ✅ Ainda funcional na branch `release/v1.1.13` / SQLite local |

---

## ⏳ Próximos passos (em ordem de prioridade)

### 1. Auto-cadastro de usuários (PRÓXIMA FEATURE)

O plano completo está no adendo de `docs/superpowers/plans/2026-05-26-migracao-core-web.md`.

Resumo: criar `SelecionarLoja.jsx` + adicionar sign-up no Login + lógica de vínculo comprador↔user.

Fluxo no `App.jsx`:
```
user === null       → <Login />         (sign-in + link para sign-up)
user + sem loja     → <SelecionarLoja /> (usuário escolhe qual loja é)
user + loja ok      → app normal
```

### 2. Migrar Relatórios para Supabase

`Relatorios.jsx`, `PorFornecedor.jsx`, `PorSegmentacao.jsx` ainda usam `window.api.*` — funcionam no Electron mas não no web app.

### 3. Migrar Configurações para Supabase

`Configuracoes.jsx` ainda usa `window.api.*`.

### 4. Commitar mudanças locais pendentes

Há 4 arquivos modificados não commitados (do redesign anterior):
- `electron/main/db/pedidos.js` — campos markup_pct, preco_venda, cor, detalhe
- `electron/main/db/schema.js` — migrações SQLite para esses campos
- `src/renderer/src/screens/Compras.jsx` — redesign UI
- `src/renderer/src/screens/Compras.module.css` — estilos do redesign

### 5. Import histórico dos xlsx (futura sessão)

Script Node.js que lê os 3.000 xlsx de `Pedidos/` e popula as tabelas `hist_*` no Supabase.

---

## Decisões técnicas importantes

- **Supabase PAT** (`sbp_aef62d...`) e **service role key** (JWT) foram usados para setup; não estão no código
- **Env vars** de produção ficam no Cloudflare Pages (configuradas via API); localmente em `.env.local` (não commitado)
- **Vite VITE_ vars** são embutidas no bundle em build-time, não em runtime — o Cloudflare serve as vars corretas
- **`window.api` não existe no browser** — qualquer tela que ainda use isso precisa ser migrada antes de ir ao ar
- **`sessoes.create()`** aceita `compradores_ids[]` e cria visitas atomicamente no Supabase
- **`segmentacoesService.findOrCreate()`** retorna objeto completo, não apenas o ID — usar `.id` após chamar

---

## Arquivos-chave

| Arquivo | Papel |
|---|---|
| `src/renderer/src/lib/supabase.js` | Cliente Supabase (usa env vars) |
| `src/renderer/src/contexts/AuthContext.jsx` | Sessão de auth global |
| `src/renderer/src/services/*.js` | Camada de dados (substitui `window.api`) |
| `src/renderer/src/screens/Login.jsx` | Tela de login |
| `supabase/migrations/` | Schema SQL (já executado no Supabase) |
| `.github/workflows/deploy-web.yml` | CI/CD Cloudflare Pages |
| `.github/workflows/keepalive.yml` | Keep-alive Supabase free tier |
| `scripts/migrate.mjs` | Script de migração (já rodado, guardar para referência) |
| `scripts/create-users.mjs` | Script de criação de usuários (já rodado e revertido) |

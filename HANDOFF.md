# HANDOFF — Solução Compras
Data: 2026-06-12

---

## Estado atual

Bug de login do Bolt RH resolvido. Estética alinhada ao Bolt Compras.
Design system iniciado em `src/renderer/src/design/tokens.js`.

---

## Credenciais do módulo RH

- **URL produção:** https://bolt-compras.pages.dev/rh
- **Login admin:** gptlojaspontoe@gmail.com / Backes2024!
- **Supabase projeto:** bhxpkysueyoblizkvomb
- **Env vars Vercel:** SUPABASE_URL, SUPABASE_SERVICE_KEY, RH_JWT_SECRET, RH_ENCRYPTION_KEY, RH_HMAC_KEY — todas configuradas

---

## Arquitetura de deploy

- **Frontend (Bolt Compras + Bolt RH):** Cloudflare Pages → `bolt-compras.pages.dev`
- **API serverless:** Vercel → `solucao-compras-demo.vercel.app/api/*`
- **Proxy:** `functions/api/[[path]].js` no CF Pages encaminha `/api/*` para a Vercel

---

## Pendências técnicas

1. **Rate limiting** — implementado em-memória (`_rh-lib.js`). Para produção com múltiplos usuários, migrar para Upstash Redis + `rate-limiter-flexible` (persistente entre instâncias).
2. **Migração progressiva dos tokens de design** — `src/renderer/src/design/tokens.js` criado. Aplicar nos componentes conforme forem tocados.

---

## Arquivos relevantes

- `api/auth-rh.js` — login/logout/verificar sessão (rate limit incluído)
- `api/_rh-lib.js` — helpers: sb(), signToken(), authenticate(), checkRateLimit()
- `src/renderer/src/screens/RhApp.jsx` — layout + sidebar Bolt RH
- `src/renderer/src/design/tokens.js` — design system tokens
- `functions/api/[[path]].js` — proxy CF Pages → Vercel

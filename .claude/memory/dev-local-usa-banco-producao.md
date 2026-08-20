---
name: dev-local-usa-banco-producao
description: Rodar npm run dev localmente conecta no MESMO Supabase de produção — não há staging
metadata:
  type: project
---

Não existe ambiente de staging neste projeto. `npm run dev` local lê `VITE_SUPABASE_URL`
de `.env.local`, que aponta para o mesmo projeto Supabase de produção
(`bhxpkysueyoblizkvomb`) usado por `bolt-compras.pages.dev`. Rodar local só protege o
visual/console — qualquer escrita feita testando localmente grava dado real.

**Why:** descoberto durante a implementação do botão de tamanho extra em pedidos
(2026-08-20) — não dá pra "testar sem risco" localmente, e Claude não tem credencial de
login de usuário real pra fazer smoke-test end-to-end sozinho.

**How to apply:** antes de confiar numa mudança que grava em `pedidos`/`pedido_itens`,
testar com uma sessão descartável (fornecedor "ZZ TESTE") e apagar depois — nunca usar
uma sessão real da coleção corrente pra testar. Ver também [[pedido-itens-tamanho-texto-livre]].

---
name: colaboracao-scheila-branch-protection
description: Acesso da Scheila ao repo — main protegida (PR+build+1 review), preview de PR descartado (sem staging), admin tem bypass
metadata:
  type: project
---

Eduardo vai dar acesso à **Scheila** (funcionária do CD) para mexer no sistema via Claude na máquina dela, "cuidando para não quebrar nada". Desenho de segurança em 3 camadas:

- **Camada 1 (proativa):** agente `revisor-impacto` viaja no clone (deixou de ser gitignored, commit `9041443`) → o Claude da Scheila roda a análise de impacto antes de tocar schema/serviço/dados, via regra no `CLAUDE.md`.
- **Camada 2 (gate de build):** `.github/workflows/pr-check.yml` builda todo PR. Marcado como check **obrigatório** na proteção da `main`.
- **Camada 3 (preview de PR): DESCARTADA.** Não existe Supabase de staging → o preview buildaria com as credenciais de produção (fallback hardcoded nos workflows) e a URL escreveria no banco real. Seria "produção fantasiada de sandbox" — o oposto do "ambiente de teste". A Scheila valida mudança visual no `npm run dev` local (mesmo app). Só reconsiderar **se** criarmos staging (ver [[migracao-27-1-para-26-2]] não, é frente própria).

**Proteção da `main`** (aplicada 19/06 via `gh api branches/main/protection`):
- PR obrigatório + **1 aprovação** do Eduardo + check `build` verde + branch up-to-date (`strict`).
- `dismiss_stale_reviews`, `required_conversation_resolution`, sem force-push, sem deletar branch.
- **`enforce_admins: false`** de propósito: Eduardo (dono/admin) continua podendo `git push` direto na `main` (seu fluxo push→deploy não muda). Só a Scheila (não-admin) fica presa ao PR. Para também prender o Eduardo, ligar `enforce_admins`.
- Reverter tudo: `gh api -X DELETE repos/{owner}/{repo}/branches/main/protection`.

**Pendências do Eduardo (GitHub, fora do código):** adicionar a Scheila como colaboradora (write); ela clona, instala Claude Code, recebe agente+regras no clone.

**Cuidado futuro (P3 da revisão):** se algum dia criar o `pr-preview.yml`, NÃO copiar o fallback de credencial de prod (`|| 'https://bhxpkysueyoblizkvomb...'`) — forçar secret de preview, senão cai silenciosamente em produção.

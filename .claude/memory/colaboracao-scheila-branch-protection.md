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

**Repo agora é PRIVADO** (era público; tinha conteúdo pessoal/interno exposto — análise de carreira do Eduardo foi movida pra memória pessoal fora do repo). Visibilidade mudada via `gh repo edit --visibility private` em 19/06.

**A Scheila usa a CONTA DA EMPRESA no GitHub: `lojaspontoe`** (já existe, e-mail da conta = gptlojaspontoe@gmail.com) — não cria conta pessoal. Implicação: o "autor" dos PRs/commits dela aparece como `lojaspontoe` (empresa), não como "Scheila" — não dá pra rastrear por pessoa pelo histórico. Aceitável por ora; se um dia quiser rastreio por pessoa, cada um precisa do próprio login.

**Estado final do acesso (19/06):**
- Colaboradores do repo: `edukern` (admin, Eduardo) + **`lojaspontoe` (Write, aceito)**. Sem convites pendentes.
- Um convite solto para `connorfinan95` (Write) foi **cancelado** (Eduardo tinha mandado mas não precisava).
- **Setup da máquina dela:** prompt pronto em `docs/SETUP-SCHEILA.md` — ela cola no Claude Code dela e ele faz o setup inteiro (confere git/node, login GitHub como `lojaspontoe`, clona, `npm install`, cria `.env.local`, `npm run dev`). Guia de uso diário em `CONTRIBUTING.md` (linguagem simples, sem inglês/jargão).

**Pendência (lado da Scheila):** rodar o setup na máquina dela e abrir o 1º PR. Nada pendente do lado do Eduardo no GitHub.

**Cuidado futuro (P3 da revisão):** se algum dia criar o `pr-preview.yml`, NÃO copiar o fallback de credencial de prod (`|| 'https://bhxpkysueyoblizkvomb...'`) — forçar secret de preview, senão cai silenciosamente em produção.

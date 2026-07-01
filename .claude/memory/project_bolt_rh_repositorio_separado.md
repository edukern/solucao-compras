---
name: bolt-rh-repositorio-separado
description: "O Bolt RH real (vagas/candidatos) roda num projeto Vercel separado (hr-solution), nao no api/ deste repo"
metadata:
  type: project
---

O módulo Bolt RH que o Eduardo realmente usa hoje **não é** o código em `api/_rh-lib.js`,
`api/vagas.js`, `api/candidatos.js` etc. deste repositório (`solucao-compras`).

O RH real roda num **projeto Vercel separado chamado `hr-solution`**
(domínios `bolt-rh.vercel.app` e `hr-solution-sigma.vercel.app`), com repositório e
histórico de commits próprios (ex.: "feat: ponte de vendas (robô CD → Supabase) p/ ligar
Meta/Ticket/Comissão"), sem relação com o código deste repo.

**Why:** `.claude/CLAUDE.md` deste repo descreve "Bolt RH" como sub-produto embutido no
mesmo app (`RhApp`, `api/vagas.js`, `api/_rh-lib.js` etc.) — essa documentação está
desatualizada. O `functions/api/[[path]].js` daqui até proxya para
`https://solucao-compras-demo.vercel.app`, mas isso não é o RH em uso; é resquício de uma
versão antiga/mock.

**How to apply:** Qualquer mudança de segurança/bug fix pedida para "o RH" deve ser
verificada primeiro: é sobre o projeto `hr-solution` (repo separado) ou sobre esse código
legado dentro de `solucao-compras`? Antes de assumir que `api/_rh-lib.js` está em produção,
perguntar ao Eduardo ou confirmar o domínio real. Correções feitas em `api/_rh-lib.js`
neste repo (ex.: fail-closed do `RH_JWT_SECRET`) não têm efeito prático até isso ser
esclarecido — não vale a pena investir mais tempo nesse arquivo sem confirmação.

---
name: feedback-release-verification
description: "Após publicar release, sempre verificar se saiu como Latest e não como Draft antes de declarar sucesso"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 9462121d-bed6-4d8e-a1fb-cabf79790322
---

Após qualquer `git push --tags` ou build de release, rodar `gh release list` imediatamente para confirmar que a release aparece como **Latest** e não como **Draft**.

**Why:** O electron-builder cria releases como Draft por padrão quando `releaseType` não está configurado. O auto-updater ignora drafts, então o usuário fica preso na versão antiga mesmo com o build bem-sucedido. Isso causou retrabalho desnecessário.

**How to apply:** Em qualquer fluxo de publicação neste projeto (bump de versão → tag → push), sempre fechar o loop com `gh release list --limit 3` e confirmar `Latest` antes de reportar sucesso.

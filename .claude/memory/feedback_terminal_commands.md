---
name: Incluir caminho da pasta nos comandos de terminal
description: Sempre incluir o cd da pasta do projeto nos comandos de terminal
type: feedback
originSessionId: f687832f-5a1f-497d-a13d-908c1f55cf13
---
Sempre incluir `cd "C:\Users\eduke\Solução Compras"` como primeiro passo em qualquer sequência de comandos de terminal, mesmo que pareça óbvio.

**Why:** O usuário pediu explicitamente — facilita copiar e executar sem precisar navegar manualmente.

**How to apply:** Em qualquer instrução com `npm run ...`, `git ...`, ou outros comandos do projeto, começar com o `cd` para a pasta certa.

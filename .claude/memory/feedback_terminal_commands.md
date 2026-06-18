---
name: feedback_terminal_commands
description: Como formatar comandos de terminal para o Eduardo rodar no PC dele (Windows, drive D:)
metadata:
  type: feedback
---

Quando eu passar comandos para o **Eduardo rodar no terminal do PC dele**, o projeto fica em **`D:\projetos\solucao-compras`** (drive D:, não C:).

**Regra crítica — trocar de drive no `cmd`:** o `cmd` NÃO muda de C: para D: com `cd D:\...` simples. Sempre usar `/d`:
```
cd /d D:\projetos\solucao-compras
```
(ou `D:` e depois `cd \projetos\solucao-compras`).

**Barras:** caminho Windows usa **barra invertida `\`** (`D:\projetos\solucao-compras`). No Git Bash, `/d/projetos/solucao-compras`.

**Why:** eu errei isso repetidas vezes — mandei `cd D:\...` sem `/d` (não abre a pasta) e às vezes a barra trocada. É fricção boba que se repete e irrita.

**How to apply:** todo comando de terminal para o Eduardo começa com `cd /d D:\projetos\solucao-compras` (cmd) e usa `\`. Para scripts node: `node scripts\<arquivo>.js`.

Nota: comandos que EU rodo via ferramenta Bash são POSIX (Git Bash) e usam `/d/projetos/solucao-compras` — isto aqui é só para o que mando o Eduardo digitar no terminal dele.

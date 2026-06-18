---
name: sessao-fechada-definicao
description: Definição de quando uma sessão é "fechada" (para futura separação aberta/fechada no histórico)
metadata:
  type: project
---

Decisão do Eduardo (18/06/2026) sobre o que torna uma sessão "fechada", para a futura feature de separar sessões abertas × fechadas na lista do Histórico (Phase 0):

A sessão é considerada **fechada quando a pessoa clica em "Fechar sessão"**. Se depois ela reabrir a edição, volta a ser **aberta**.

**Why:** hoje não existe campo de status em `sessoes` — o botão "Fechar sessão" só leva à Phase 3 (PDFs), não persiste estado. Para agrupar aberto/fechado é preciso materializar esse estado.

**How to apply:** quando for implementar, adicionar um campo de status/flag em `sessoes` (ex.: `fechada_em timestamp`), setado ao clicar em Fechar sessão e limpo ao reabrir a edição (Retomar/editar). Passar pelo [[revisor-impacto]] antes — mexe em schema + fluxo de pedidos. Relacionado ao trabalho de ordenação da lista de sessões.

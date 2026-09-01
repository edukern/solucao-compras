---
name: reposicao-revisao-estado
description: Tela "Reposição" (RevisaoReposicao) — o que ela faz hoje, schema, e as decisões de design não-óbvias. Feita em PRs #19–#26 entre 20/08 e 01/09/2026.
metadata:
  type: project
---

## O que a tela faz (produção, 01/09/2026)

`src/renderer/src/screens/RevisaoReposicao.jsx` + `reposicaoGrade.js` (helpers puros, testados) + `services/reposicao.js` + `lib/pdfHelpers.js` (`gerarPDFReposicao`/`montarHTMLReposicao`).

Revisa rascunhos de pedido de reposição que o **ponto-e-stock** grava via RPC `salvar_pedido_reposicao` (tabelas `pedidos_reposicao` / `pedido_reposicao_itens`). O comprador (só `is_editor`; item some do menu p/ quem não é) pode:
- **editar qtd** por (referencia, tamanho), inclusive **completar a grade** além da sugestão (cria linha nova, `qtd_sugerida=0`);
- **escolher a grade** num seletor (ver decisão abaixo);
- **editar o custo** (`valor_unitario`) — um por referência, gravado em TODAS as linhas da ref no mesmo upsert;
- marcar `revisado` / `descartado`;
- gerar **2 PDFs**: interno e fornecedor.

Visual = **cópia** da tabela do Compras (Registrar Pedidos / Por referência): classes `.itemsTable`/`.itemRow`/`.gradeInline*` copiadas de `Compras.module.css`. Navegação por teclado = `handleEnterOnInput` do Compras (Enter/Tab anda pelos campos, fim da linha abre a próxima ref).

## Schema (migrações 030–035, TODAS aplicadas em produção)

`pedido_reposicao_itens`: id, pedido_reposicao_id, referencia, tamanho, qtd (**check 0..9999** desde 035), qtd_sugerida, vendido_periodo, estoque_cd, ja_pedido, **nome, tipo, classe, colecao, reffornecedor, codigo_ponto_e** (032/033), **foto_url, tipo_grade** (033), **valor_unitario numeric(10,2)** (034). unique (pedido_reposicao_id, referencia, tamanho).

**035 (PR #25):** `qtd` passou de `> 0` para `>= 0`. `qtd 0` numa linha = "não repor este tamanho" (mantém `qtd_sugerida` ao lado; some do PDF e não soma no total). A RPC `salvar_pedido_reposicao` **mantém** a recusa de `qtd <= 0` no payload do ponto-e-stock (feed externo continua exigindo positivo). `editState` em `reposicaoGrade.js`: `0` em linha existente agora é `dirty` (grava 0); campo em branco numa linha existente segue `invalid`.

A RPC lê todos esses campos do payload; **todos opcionais** — ausente/null/vazio não recusa a carga. `valor_unitario` também recusa texto/negativo com mensagem própria. Ramo `on conflict (origem_key) do nothing` **nunca faz backfill** — rascunho antigo fica com os campos novos NULL.

Gravação da tela = **um `upsert` único** por chave natural `(pedido_reposicao_id, referencia, tamanho)` em `salvarQuantidades`. Nada de gravação item a item.

## Decisões de design não-óbvias

1. **Grade derivada, não recebida.** O `tipo_grade` do ERP é "GENÉRICO" em ~97% dos produtos (conferido no banco `controle`). Então a tela **adivinha** a grade por `classe` (AD/EX/INF/JUV) + o conjunto de tamanhos que chegaram — `classe` resolve INF1/JUV1/AD (mesmos tamanhos), os labels resolvem AD/AD1/AD2. Seletor de grade pro comprador corrigir; a escolha grava em `tipo_grade`. Ver `adivinharGrade` em `reposicaoGrade.js`. **Só grava `tipo_grade` quando o comprador mexe no seletor** — nunca o palpite (senão o aviso "confira" some sozinho).
2. **Reposição não tem loja/visita/fornecedor.** A `marca` (SCHRAMM, KEEPER, BELLA…) faz o papel de fornecedor/destinatário. Um documento só (não por loja).
3. **PDF fornecedor** — remetente/faturamento = linha de `compradores` **id 1 (Backes Art. Vestuário)**, confirmado pelo Eduardo. Nº do pedido = 8 primeiros chars do id do rascunho. Não há endereço da marca destinatária (não existe cadastro).
4. **PDF fornecedor usa allow-list de campos** (não block-list): Referência (=reffornecedor) · Produto (tipo·classe·MASC/FEM) · tamanhos/Qtd · R$ un. · Total. Nunca `codigo_ponto_e` nem `qtd_sugerida`. Interno mostra o `codigo_ponto_e`. **Nenhum dos dois** mostra Vendido/Estoque CD/Já pedido (tirado a pedido do Eduardo — não pertence ao pedido).
5. Botões de PDF travados enquanto houver alteração não salva.
6. **Grade aberta esconde colunas de tamanho sem dado** (PR #25) enquanto o revisor não escolher a grade no seletor — grade adivinhada errada (ex.: produto UNI que caiu em "BB", tamanhos reais `0`/`FEM`/`MASC`) desenhava 4 colunas vazias + uma coluna oculta com peças, fazendo o Total parecer errado ("80+140=243"). Escolher a grade no seletor **ou** o link "+ mostrar todos os N tamanhos da grade" (PR #26) volta a mostrar a régua completa. O Total é somado sobre a régua canônica inteira (colunas ocultas são sempre 0, então bate). **Todos os rascunhos atuais** têm descasamento grade × tamanhos.
7. **Campos de qtd/custo selecionam o conteúdo ao focar** (PR #25) — a sugestão vem preenchida com valor real (no Compras começa vazio), então sem `select()` no `onFocus` digitar concatenava ("0"+6="60").
8. **Melhorias de fluxo da auditoria heurística (PR #26).** `services/reposicao.js` ganhou `reabrir(id, statusAtual)` (revisado/descartado → rascunho, limpa revisado_por/em; RLS é `auth_full_access`, sem trava por editor no banco) e `contarRascunhos()`. Na tela: contador de rascunhos no item "Reposição" do menu (Sidebar, refetch a cada troca de tela); "Reabrir" nos cards revisado/descartado; guarda de "alterações não salvas" no Voltar; conflito de save **mantém** os campos digitados (só atualiza a base); barra de total geral (refs/peças/R$) ao vivo; "Descartar" no detalhe pede confirmação; após "Marcar como revisado" a tela **fica** (vira read-only) com banner de sucesso apontando pro PDF em vez de voltar pra lista; sugestão-fantasma ("sug. N") por tamanho quando o valor difere; "Expandir todas as grades"; `alert()` de status virou banner; `abaStatus` subiu pro orquestrador (não reseta mais pra "Rascunho" a cada ação). Nada de schema.

## Pendente (do lado de fora deste repo)

- **ponto-e-stock**: passar a mandar `valor_unitario` (custo `vlrunit` do ERP) no payload da RPC. Prompt já entregue ao Eduardo. `foto_url`/`tipo_grade`/`nome`/etc. o Stock já manda (desde 31/08).
- Smoke test logado da tela (sem credencial de editor nas sessões de Claude).
- Limpeza opcional em produção: tabelas `backup_pedido_reposicao_itens_20260901` / `backup_pedidos_reposicao_20260901`; rascunhos de teste "TESTE smoke ponto-e-stock" / "TESTE idempotencia" / "KEEPER" (teste-comparacao).

Relacionado: [[project_ponto_e_stock_integracao]], [[dev-local-usa-banco-producao]], [[pedido-itens-tamanho-texto-livre]].

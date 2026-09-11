# HANDOFF — Solução Compras
Atualizado: 2026-09-11

## 🟡 FRENTE EM ANDAMENTO — PDF de Reposição: falta ICMS, cabeçalho limitado, "dados errados"

Pedido do Eduardo (11/09): ao enviar pedidos do stock pro compras (tela `RevisaoReposicao` /
"seção de recompra"), o PDF pro fornecedor tem 3 problemas. PDF real anexado por ele:
`C:\Users\CLIENTE\Downloads\Reposição ZEE RUCCI — 54A7A662.pdf` (também copiado em
`.claude/memory/` não — ficou só no Downloads, não versionado).

**Já apurado (código, sem precisar rodar nada):**
1. **ICMS não existe em Reposição, ponto nenhum** — nem coluna no banco
   (`pedido_reposicao_itens`/`pedidos_reposicao`, migrações 030–036), nem UI, nem em
   `services/reposicao.js`. No fluxo normal de Compras, `icms_pct` é por item de `pedidos`
   (`001_schema_inicial.sql:89`) e `icms_credito_pct` é padrão do **fornecedor**
   (`008_fornecedores_padrao.sql:8`). Reposição não tem `fornecedor_id` — usa `marca` (texto
   livre) no lugar. **Isso é feature nova, não bug** — precisa decidir com o Eduardo se é (a)
   só puxar o `icms_credito_pct` já cadastrado do fornecedor cujo nome bate com a `marca` do
   pedido (leitura, sem migração), ou (b) um campo de ICMS% por item que o comprador digita na
   tela de revisão (schema novo + UI nova, mais trabalho e exige `revisor-impacto` antes).
2. **Cabeçalho confirmado limitado** — `montarHTMLReposicao` em
   `src/renderer/src/lib/pdfHelpers.js:983-998` só mostra: título, marca, nº pedido, data,
   gerado por, janela de dias, e (só na versão fornecedor) nome/CNPJ/IE/endereço/cidade do CD
   remetente (comprador id 1, Backes). Não tem: condição de pagamento, frete, transportadora,
   observação — campos que o PDF normal de Compras já tem. Fix de baixo risco (só exibição),
   dá pra fazer sem aprovação prévia formal.
3. **"Dados errados"** — NÃO CONFIRMADO ainda. Rodei `pdftotext -layout` no PDF real e a
   tabela saiu com preço/total aparentemente "um passo acima" da linha da referência — mas isso
   é um artefato clássico de extração de texto em tabela com células de altura variável
   (produto com nome longo quebra em 2 linhas), não prova de bug real no HTML/CSS da tabela
   (que usa `<tr>`/`<td>` normais — colunas da MESMA linha não têm como desalinhar entre si
   numa tabela HTML real, só entre linhas visualmente se o olho escorregar). Não consegui abrir
   o PDF de verdade no navegador pra conferir visualmente (ferramenta de browser bloqueia abrir
   arquivo local; não há `pdftoppm`/`magick`/`gs` nesta máquina pra converter em imagem; MCP
   `markitdown` não está disponível nesta sessão). **Preciso que o Eduardo mande um print
   marcando qual referência/coluna está com o dado errado**, ou descreva especificamente (ex.:
   "a cor da linha ZR0201-001 é a da linha de cima").

**Próximo passo:** perguntar ao Eduardo (a) qual dos dois formatos de ICMS ele quer, (b) o
print/detalhe do "dado errado". Só depois disso implementar. `pdfHelpers.js` (cabeçalho) e
schema de reposição (se for ICMS por item) são os pontos de código.

> Frentes anteriores (acesso da Scheila, migração de coleção 27/1→26/2, sync Macle) foram
> confirmadas como resolvidas e removidas deste handoff. Detalhes históricos continuam em
> `.claude/memory/` se precisar consultar depois.

---

## ✅ FRENTE — Rascunho de pedido de reposição (ponto-e-stock → solucao-compras) — CONCLUÍDA

Migração `030_pedidos_reposicao.sql` aplicada em produção (testada via HTTP com a chave anon:
idempotência, soma de itens duplicados, recusa de carga inválida). PR [#11](https://github.com/edukern/solucao-compras/pull/11)
(migração) e [#12](https://github.com/edukern/solucao-compras/pull/12) (tela `RevisaoReposicao`)
mergeados e no ar em `bolt-compras.pages.dev`. Tela confirmada funcionando (menu lateral,
3 abas, estado vazio correto).

**Pendente — mas do lado de FORA deste repo:** no projeto `ponto-e-stock`, colar
`SUPABASE_URL`/`SUPABASE_ANON_KEY` no `.env` de lá e ajustar o código que lê o retorno da
função (agora devolve 4 valores: `id, criado, status, itens_gravados` — antes eram 2). Ação do
Eduardo na sessão de Claude que roda naquele projeto, não algo que dá pra fazer daqui.

## ✅ FRENTE — Fix tamanho fora da grade + campo Obs + PDF — CONCLUÍDA

PR [#14](https://github.com/edukern/solucao-compras/pull/14): parava de descartar
silenciosamente quantidade digitada num tamanho fora da grade cadastrada ao salvar (achado
pelo `revisor-impacto`); campo Obs. movido pro formulário principal de "Adicionar refs"; PDF
ganha coluna própria pra Cor/Detalhe e Obs quando sobra espaço (evita quebra de linha na
referência). Mergeado e deployado.

**Risco aceito, registrado no commit:** `Agregador.jsx` e `relatorios/PorSegmentacao.jsx`
ainda constroem a lista de tamanhos só a partir da grade canônica (não pegam tamanho extra) —
são telas de relatório interno, não documento que sai pro fornecedor. P2, não corrigido agora.

## ✅ FRENTE — Revogação de permissões da role anon — CONCLUÍDA

PR [#13](https://github.com/edukern/solucao-compras/pull/13): revoga `TRUNCATE`/`REFERENCES`/
`TRIGGER` que a role `anon` do Supabase tinha por padrão em todas as tabelas do schema
`public`. Mergeado e deployado.

---

## 🟡 FRENTE (PENDENTE, sem dono definido) — Importação 26/2

Handoff dedicado: `HANDOFF-IMPORTACAO-26-2.md` (raiz, se ainda existir) e
`.claude/memory/project_importacao_26_2.md`. Resumo: FEMMINART já gravado (sessão 40, 10654
peças). Achado crítico ainda não resolvido: fornecedores DUPLICADOS no cadastro (Aconchego do
Bebê, Rakels — já existem no Bolt sob nome com grafia variante) fazem o relatório de cobertura
mostrar "gap" falso. **Antes do próximo `--apply`**, o guard de `docs/importar-26-2/apply.js`
precisa (a) casar nome sem acento/pontuação e (b) abortar se qualquer linha-irmã do fornecedor
já tiver dado na coleção — sem isso um apply às cegas duplicaria pedidos.

## 🟡 FRENTE (PENDENTE, sem dono definido) — Sync Macle → Supabase / macle-integrations

`.claude/memory/project_ponto_e_stock_integracao.md` tem o estado completo. Resumo: projeto
`macle-integrations` criado (21/06) pra virar a camada compartilhada de leitura do ERP
`controle`, hoje lida em paralelo por `solucao-compras/scripts/sync-controle.js` (agregado
grosso) e pelo `ponto-e-stock` (fino, por segmento). Migração do `sync-controle.js` pra lá
ainda não aconteceu — ele segue rodando aqui por ora. Sem prazo definido.

---

## 📁 Onde olhar primeiro numa sessão nova

- `.claude/memory/MEMORY.md` — índice de memória do projeto, git-tracked.
- Skill `onde-parei` (instalada globalmente em `~/.claude/skills/onde-parei/`) — resume
  qualquer transcript `.jsonl` de sessão anterior sem precisar ler o arquivo bruto.

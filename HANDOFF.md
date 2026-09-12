# HANDOFF — Solução Compras
Atualizado: 2026-09-11

## ✅ FRENTE — PDF de Reposição/Compras: cabeçalho limitado + rótulo "Cor" — CONCLUÍDA (commit `72ff5fd`, 11/09)

Pedido do Eduardo: PDF de Reposição (`RevisaoReposicao` / "seção de recompra") sem ICMS,
cabeçalho pobre, "dados errados" na coluna Cor. Investigação completa: ver
[[reposicao-revisao-estado]] (seção nova) e commit `72ff5fd`. Resumo do que era e do que foi:

1. **Cabeçalho pobre era bug real, e não só na Reposição — no Compras normal também.**
   `FecharSessao.jsx` (`handleGerarPDFs`) inicializava o modal de PDF (cond. pagamento, frete,
   vendedor) só a partir de `sessao.*`, nunca caindo pro `fornFull.*_padrao`
   (`cond_pag_padrao`/`frete_padrao`/`vendedor_padrao`) que a migração 008 criou exatamente pra
   isso. O modal GRAVA esses padrões (linha 78-85 de antes) mas nunca os LÊ de volta — então
   nenhuma sessão nova nunca se beneficiava do "padrão" salvo antes, todo mundo tinha que
   redigitar cond.pag/frete/vendedor pra cada sessão, pra sempre. **Corrigido** — agora cai pro
   padrão do fornecedor quando a sessão ainda não tem valor próprio. Efeito colateral: depois
   que algum comprador preencher esses campos uma vez pra um fornecedor, as próximas sessões
   com o mesmo fornecedor já vêm com cabeçalho cheio sozinhas.
2. **Coluna "Cor" da Reposição renomeada pra "Cor/Detalhe"** — o texto ali vem do que sobra do
   campo `nome` que o ponto-e-stock manda depois do código da referência
   (`CALCINHA AD FEM ZR0801-006 MODELADORA` → mostra "MODELADORA"). Às vezes é cor de verdade
   (ex. "ROSA"), às vezes é detalhe de produto (MODELADORA, FAIXA, AMAMENTAÇÃO) — o dado não
   está errado, só o rótulo "Cor" sozinho enganava. "Cor/Detalhe" é o mesmo termo que o PDF do
   Compras normal já usa pra essa mesma ambiguidade (PR #14).
3. **ICMS e o vínculo fornecedor da Reposição ficaram de fora desta rodada** — ver frente
   pendente abaixo, depende de mudança no `ponto-e-stock` primeiro.

## ✅ FRENTE — Banco pronto pra receber cor e marca_codigo — CONCLUÍDA (migração 037, aplicada 12/09)

`cor` (por item) e `p_marca_codigo` (por pedido) já podem ser mandados pelo `ponto-e-stock` —
aplicado em produção com backup prévio, ensaio em transação com ROLLBACK e smoke test HTTP
real (chave anon, formato antigo e novo) antes de ir pro ar. Revisado pelo `revisor-impacto`
(achou um P0 real: `CREATE OR REPLACE` com lista de argumentos diferente vira uma SEGUNDA
função em vez de substituir a antiga — corrigido com `DROP FUNCTION` explícito antes).

**Liberado pro `ponto-e-stock` a partir de agora (12/09/2026):**
- `cor` dentro de cada item — pode mandar a qualquer momento, já está pronto.
- `p_marca_codigo` como parâmetro do pedido (irmão de `p_marca`, não vai dentro do item) —
  também já pode mandar, a migração que precisava estar no ar antes já está.
- Validação nova: se a mesma referência+tamanho vier com 2 cores diferentes na mesma carga,
  a RPC recusa a carga inteira com mensagem própria (em vez de misturar as cores numa linha
  só) — se acontecer, o rascunho daquele dia não entra até corrigir do lado do Stock.

**Ainda NÃO fizemos** (fica pra quando tiver uso real): a tela de Revisão e o PDF ainda não
leem `cor`/`marca_codigo` — o PDF continua caindo no `corDoNome()` (adivinha pelo `nome`) até
alguém consumir a coluna nova. `marca_codigo` não tem link automático com `fornecedores`
ainda (falta `fornecedores.codigo_erp` + resolver duplicata ZEE RUCCI/ZEERUCCI ids 482/563).

## 🟡 FRENTE PENDENTE (do lado de FORA deste repo) — ponto-e-stock precisa mandar cor e fornecedor de verdade

Pra Reposição ficar de fato igual ao Compras normal (ICMS, cond.pag, frete, transportadora,
cor real), falta o `ponto-e-stock` mandar 2 coisas que hoje não manda. Texto pronto pra colar
na sessão de Claude que roda naquele projeto:

> No pedido de reposição (RPC `salvar_pedido_reposicao`), preciso de 2 campos novos e
> opcionais no payload de cada item, além do que já é mandado hoje:
>
> 1. **`cor`** — a cor real da peça (ex. "ROSA", "PRETO"), vinda do cadastro do produto no
>    ERP. Hoje o campo `nome` que vocês mandam concatena tudo
>    (`"CALCINHA AD FEM ZR0801-006 MODELADORA"`) e o Compras tenta adivinhar a cor pegando o
>    que sobra depois do código da referência — mas às vezes esse resto é a cor de verdade e
>    às vezes é um detalhe de produto (MODELADORA, FAIXA, AMAMENTAÇÃO), sem jeito de
>    diferenciar só pelo texto. Se o cadastro do produto no ERP não tiver uma cor única e limpa
>    pra esse SKU, pode mandar vazio — vazio é melhor que chutar errado.
> 2. **Um identificador estável do fornecedor** (o código do fornecedor no ERP, tipo
>    `codfornecedor`) — hoje só mandam `marca` (texto livre tipo "ZEE RUCCI"). O Compras tem
>    cadastro de fornecedor com condição de pagamento/frete/transportadora/ICMS padrão, mas
>    bater isso com a `marca` por nome é arriscado: já achei a mesma marca cadastrada 2x com
>    grafia diferente aqui (`ZEE RUCCI` e `ZEERUCCI` são registros diferentes). Com um código
>    estável dá pra linkar direito, sem chute por nome.
>
> Não muda nada do que já é mandado hoje — são só 2 campos novos, opcionais, no mesmo payload.

**Do lado de cá, depois que isso chegar:** vai precisar de uma migração nova (colunas `cor` e
`fornecedor_ref_erp` em `pedido_reposicao_itens`/`pedidos_reposicao`) + ajuste no
`pdfHelpers.js` pra usar isso — isso sim passa pelo `revisor-impacto` antes de implementar
(schema + fluxo de pedidos), padrão do projeto.

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

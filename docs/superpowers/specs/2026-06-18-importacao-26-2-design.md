# Importação 26/2 — Planilhas do sistema antigo como fonte de verdade

**Data:** 2026-06-18
**Status:** Design aprovado para revisão
**Autor:** Eduardo + Claude

## Problema

O sistema novo (Bolt Compras) roda em paralelo com o sistema antigo (planilhas Excel) durante a fase de validação. A coleção 26/2 (rotulada **incorretamente como "27/1"** no Bolt, coleção `id=1`) tem dados nos dois lugares, mas o Bolt é um subconjunto incompleto do antigo por dois motivos:

1. **Bug de persistência de referências duplicadas** — algumas referências não foram salvas no Bolt.
2. **Pedidos feitos só no sistema antigo** — pedidos inteiros que nunca foram lançados no Bolt.

As planilhas do sistema antigo são a **fonte de verdade completa**: todo pedido de 26/2 está nelas. Não existe pedido que exista só no Bolt (confirmado pelo usuário). Logo, **planilha ⊇ Bolt**.

## Objetivo

1. Importar as 42 planilhas de 26/2 como o dado real em `pedidos`/`pedido_itens`, com a planilha vencendo qualquer divergência.
2. Produzir um **comparativo** dos gaps planilha→Bolt em 3 categorias (pedido inteiro faltando / referência faltando / divergência de quantidade).
3. Corrigir o rótulo da coleção no Bolt de "27/1" para "26/2".

Restrição central: **a importação é crítica e não pode corromper dado**. Toda a arquitetura é desenhada em torno de garantias mecânicas de segurança, não de cuidado manual.

## Escopo

- **Dentro:** coleção 26/2 apenas (Bolt `colecao_id=1`). As 8 lojas/compradores que o Bolt conhece (`compradores.id` 1–8).
- **Fora (por ora):** coleções históricas 2015–2025 (já tratadas como `hist_*` agregado, fora deste trabalho). Lojas extras do Formato B (ver Pendência aberta).

## Dados de entrada

42 planilhas `.xlsx`, uma por fornecedor, extraídas de 2 zips para `Pedidos/26-2-import/`. Datadas mai–jun/2026. Três layouts:

### Formato A — "multi-aba / Elite" (36 arquivos)
Abas: `CAD_GRADE`, `CAD_CLASSE`, `CAD_PRODUTOS`, `PEDIDO` + pares `SOMA_*` / aba-de-loja:
`BACKES_ART`, `BACKES_PROG_1`, `BACKES_PROG_2`, `RAFAEL_J_BACKES`, `RAFAEL_FILIAL_1`, `RAFAEL_FILIAL_2`, `STREIT_CONF`, `FMV_STREIT_CONF` (8 lojas, nomes de aba = chave direta).
`CAD_GRADE` define as grades (linha = classificação, T1..T10 = tamanhos). É o formato que `docs/importar-elite.js` já parseia.

### Formato B — "Pedido / nomes" (5 arquivos)
`FEMMINART 09-06-26.xlsx`, `FEMMINART PROGRAMACAO 09-06-26.xlsx`, `INTIMA FLOR 09-06-2026.xlsx`, `Lupo 07-06-26.xlsx`, `SCHRAMM 06-06-26.xlsx`.
Aba `Pedido` = cabeçalho do fornecedor + catálogo (linha 10 = header `Referencia|Produto|ICMS|R$ un.|R$ Liq.|<tamanhos>`, itens a partir da 11). Abas por loja com **nomes de pessoa**: `CD`, `CD Prog 1`, `CD Prog 2`, `Elisangela`, `Alexandre`, `Rafael`, `Streit`, `FMV` + extras (ver pendência). Na aba de loja, tamanhos na linha 11, header `Referencia` na 12, itens a partir da 13.

### Formato C — "reduzido" (Mormaii Calçados — 1 arquivo)
Só `Pedido, CD, CD Prog 1, CD Prog 2`. Subconjunto do Formato B sem as demais lojas.

## Mapa de abas → comprador (8 lojas do Bolt)

| comprador_id | nome (seed) | Aba Formato A | Aba Formato B |
|---|---|---|---|
| 1 | Backes Art. Vestuário | `BACKES_ART` | `CD` |
| 2 | Backes Programação 1 | `BACKES_PROG_1` | `CD Prog 1` |
| 3 | Backes Programação 2 | `BACKES_PROG_2` | `CD Prog 2` |
| 4 | Rafael J. Backes | `RAFAEL_J_BACKES` | `Rafael` |
| 5 | Rafael Filial 1 | `RAFAEL_FILIAL_1` | `Elisangela` |
| 6 | Rafael Filial 2 | `RAFAEL_FILIAL_2` | `Alexandre` |
| 7 | Streit Conf | `STREIT_CONF` | `Streit` |
| 8 | FMV Streit Conf | `FMV_STREIT_CONF` | `FMV` |

> Observação: a correspondência nome-de-pessoa → loja (Elisangela=Filial 1, Alexandre=Filial 2, Rafael=J. Backes) segue o `LOJA_MAP` de `docs/importar-historico.js` e precisa ser **confirmada na validação de amostra** antes do lote (risco: trocar Filial 1 ↔ Filial 2). A normalização da grade (detectar `tipo_grade` pelo conjunto de tamanhos) reaproveita `GRADE_DEFS` de `docs/importar-elite.js`, espelho de `src/renderer/src/constants/grades.js`.

## Modelo normalizado (saída do parser)

Cada item parseado:
```
{ arquivo, fornecedor_nome, fornecedor_id, comprador_id,
  referencia, produto, valor_unitario, valor_liquido, icms_pct,
  tipo_grade, classificacao, grade: { [tamanho]: qtd } }
```
Itens com grade toda zerada são descartados (não viram pedido).

## Schema-alvo

`sessoes (colecao_id, fornecedor_id, data_visita) → visitas (sessao_id, comprador_id) → pedidos (visita_id, comprador_id, segmentacao_id, referencia, valores…) → pedido_itens (pedido_id, tamanho, qtd)`.
Chave de unicidade do pedido: `(visita_id, referencia, variante_key)` — mesma usada por `pedidos.salvarBatch`. `variante_key` default `''`.
Cada planilha → uma `sessao` (matched/criada por `fornecedor_id + colecao_id=1`). Cada loja com itens → uma `visita`.

## Arquitetura — 4 etapas

### 1. Parser (`docs/importar-26-2/parse.js`)
Lê as 42 planilhas, detecta o formato pelas abas, normaliza para o modelo acima. Pura leitura de arquivo; nenhuma conexão ao banco. Saída: `docs/importar-26-2/staging.json` + totais por (arquivo, loja).

### 2. Staging (`docs/importar-26-2/stage.js`)
Carrega `staging.json` numa tabela `import_2622_staging` no Supabase (e mantém o JSON como artefato versionável). Nada toca `pedidos` ainda. Permite re-rodar o diff sem reler os 42 arquivos.

### 3. Diff / reconciliação (`docs/importar-26-2/diff.js`)
Compara staging × Bolt no grão `(fornecedor_id, comprador_id, referencia, tamanho)`. Classifica cada gap:
- **A. Pedido inteiro faltando** — `(fornecedor, comprador, referencia)` existe no staging, não no Bolt.
- **B. Referência faltando** — o par fornecedor/comprador existe no Bolt, mas a referência não (sintoma do bug de duplicadas).
- **C. Divergência de quantidade** — mesma referência nos dois, `qtd` ou tamanhos diferentes.

Saída: `docs/importar-26-2/relatorio.csv` + resumo legível (contagens por categoria e por fornecedor).

### 4. Apply (`docs/importar-26-2/apply.js`)
**Default = dry-run (zero escrita).** Só grava com `--apply`. Decisão do usuário: **planilha vence** → insere faltantes (A, B) e sobrescreve divergências (C) pelo valor da planilha. Sobrescrita reusa o padrão upsert + replace de itens do `pedidos.salvarBatch`.

## Correção do rótulo da coleção

Como parte do apply (passo isolado, idempotente): `UPDATE colecoes SET nome='26/2' WHERE id=1 AND nome='27/1';`. Verificado contra o seed/migrations antes de aplicar para não colidir com uma "26/2" já existente.

## Camadas de segurança (garantias mecânicas)

1. **Backup antes de qualquer escrita** — dump de `visitas`/`pedidos`/`pedido_itens` da coleção em arquivo + tabela `pedidos_backup_2622`. Rollback = restaurar o snapshot.
2. **Dry-run por padrão** — escrita só com `--apply` explícito.
3. **Checksum de totais em 3 pontos** — peças por fornecedor/loja batem entre planilha original, modelo parseado e banco pós-apply; divergência inesperada **aborta**.
4. **Validação de amostra antes do lote** — Elite (A) + FEMMINART (B) conferidas célula a célula com o usuário antes de liberar as 42.
5. **Rollout faseado** — 1 fornecedor primeiro (Elite), conferido no Bolt, depois os 41.
6. **Idempotência** — apply repetido dá o mesmo resultado (chave `visita_id+referencia+variante_key`).
7. **Trilha de auditoria** — CSV com valor-antes/valor-depois por inserção e sobrescrita; nenhum valor antigo se perde.
8. **Freio de divergência** — nº de sobrescritas acima de um limiar esperado para o script e avisa antes de tocar no banco.

Pior caso de falha: o script aborta sem gravar, ou restaura-se o snapshot. Nenhum caminho leva a corrupção silenciosa.

## Pendência aberta (não bloqueia o núcleo)

As 5 planilhas do Formato B têm 7 abas de loja além das 8 do Bolt: **Nilson, Flavia, Clovis, Marcia, Arnoldo, Gambeta, Paulinho**, todas preenchidas — mas com totais que em vários arquivos replicam exatamente uma aba base (possível cópia de modelo, não pedido real). Eduardo está confirmando com a equipe se são lojas do grupo (a importar, exigindo cadastro de novos `compradores`) ou de outros participantes da central (a ignorar). O parser isola essas abas atrás de uma flag; a resposta liga/desliga sem refazer nada. **Default atual: fora de escopo, listadas no relatório como "lojas sem contraparte".**

## Critérios de sucesso

- Total de peças por fornecedor/loja no Bolt pós-apply == total da planilha (checksum verde) para as 8 lojas.
- Relatório lista 100% dos gaps nas 3 categorias antes do apply.
- Coleção `id=1` renomeada para "26/2".
- Apply re-executável sem duplicar dado.
- Snapshot de backup existente e restaurável.

## Fora de escopo

- Coleções históricas 2015–2025.
- Corrigir o bug de persistência de duplicadas no app (este trabalho remedia o dado, não a causa).
- Lojas extras do Formato B (até confirmação da equipe).

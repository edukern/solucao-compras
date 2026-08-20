---
name: project-importacao-26-2
description: Estado e fatos críticos da importação das planilhas 26/2 para o Bolt
metadata:
  type: project
---

Importação das 42 planilhas da coleção 26/2 (`Pedidos/26-2-import/`) para `pedidos`/`pedido_itens` do Bolt. Plano: `docs/superpowers/plans/2026-06-18-importacao-26-2.md`. Scripts em `docs/importar-26-2/`.

Fatos não-óbvios descobertos na execução (2026-06-18):

- **Coleção alvo = `colecao_id = 1`**, hoje rotulada "27/1" (estação verão, ano 2027) — rótulo deslocado, é na verdade a 26/2 (datas das sessões batem com as planilhas: maio–junho/2026). Renomear é a Task 9.
- **RLS bloqueia o anon key** (permission denied em `sessoes`). Leituras/escritas exigem `SUPABASE_SERVICE_KEY` do `.env.local` (a var chama-se `SUPABASE_SERVICE_KEY`, não `..._ROLE_KEY`; `db.js` aceita as duas).
- **Mapa de lojas: o plano e o handoff erraram 4↔6.** Verdade (tabela `compradores`, tem CNPJ): **4 = Rafael Filial 2, 5 = Rafael Filial 1, 6 = Rafael J. Backes**. `importar-elite.js` estava certo. Corrigido em `lojas.js`. O vínculo pessoa→loja do Formato B (Elisangela=5, Alexandre=4, Rafael=6) ainda precisa confirmação na validação de amostra.
- **Chave de casamento = ref-BASE** (token antes do primeiro espaço/underscore). O Bolt guarda grade/cor sufixando a `referencia` (ex.: `1052 EX`, `1052 PRETO_JUV`, `1200 CHUMBO_PP`) — herança do `importar-elite.js`. A planilha tem só a ref pura (`1052`). Comparar por `(comprador_id, ref_base)` reconcilia perfeitamente.
- **ELITE já está 100% importada e correta** (fornecedor_id 32): relatório read-only `report-elite.js` deu 3438 peças planilha = 3438 Bolt, 0 divergências, bate loja a loja. Nada a gravar para Elite.
- **O trabalho real são os fornecedores ainda ausentes** (ex.: FEMMINART id 690 tem 0 pedidos na coleção 1). Próximo: parser Formato B/C + relatório de cobertura read-only de todos os 42 → aplicar só as lacunas, fornecedor a fornecedor, com backup+dry-run.
- **2 formatos confirmados:** A (Elite, T/Q intercalado: ref,produto,(T,Q)×10, col23=valor, col27=preço); B (FEMMINART, colunas fixas: tamanhos no header da linha "Referencia", cols Quant/R$ a ignorar). Formato C (Mormaii Calçados) a confirmar.
- Há 1 sessão com data outlier `2026-09-08` na coleção 1 — investigar se relevante.

Regra do Eduardo: importação não pode dar errado; ele prefere **relatório read-only primeiro, decidir depois**. Respeitar todos os checkpoints `--apply`. Ele se sobrecarrega com excesso de opções técnicas — **simplifique, decida por ele nos pontos de alta certeza, e traga listas mastigadas** em vez de N alternativas.

Sessão #11 (2026-06-18) — primeira escrita real no banco:
- **FEMMINART GRAVADO** (sessão id 40, fornecedor_id 690): 7 visitas, 238 pedidos, 10654 peças, classificação **AD/AD1**, tamanhos **46/48/50/52**. Confere com a planilha. `docs/importar-26-2/apply.js` (dry-run default, `--apply`, `--fornecedor=`, `--rotulo-acima`) + `backup.js` criados.
- **Backup feito**: JSON em `out/backup-<ts>/` + tabelas `*_backup_2622` no Supabase (snapshot de sessoes/visitas/pedidos/pedido_itens/segmentacoes pré-FEMMINART).
- **Rótulo de tamanho Formato B RESOLVIDO**: sutiã usa **número de banda (46/48/50/52)**, não P/M/G/GG. O default P/M/G/GG fazia `detectarGrade` cair em **PP (grade de bebê RN/P/M/G/GG)** — erro. Número → AD, consistente com a lingerie adulta já no Bolt (ex.: SCHRAMM SUTIA=AD). Parser ganhou opção `rotuloTamanhoB:'acima'` (default inalterado); apply usa `--rotulo-acima`.
- **`detectarGrade` é um CHUTE pelos tamanhos** e erra com letras ambíguas. Imports anteriores (SCHRAMM etc.) usaram a grade autoritativa da planilha, por isso ficaram certos. Cuidado ao confiar no chute.
- **ACHADO CRÍTICO — fornecedores DUPLICADOS no cadastro.** Vários "GAP_TOTAL" da cobertura são **falsos positivos já importados** sob nome variante. O `report-cobertura.js` casa por nome sem remover acento/pontuação (`norm()`), então erra:
  - Aconchego do Bebê: já no Bolt em **id 9 `ACONCHEGO DO BEBE` (773 pç)**; planilha casa com id 594 `ACONCHEGO DO BEBÊ` (vazio).
  - Rakels: já no Bolt em **id 587 ``RAKEL`S`` (1135 pç)**; planilha casa com id 642 `RAKELS` (vazio).
  - Mormaii: 3211 pç em id 512 `MORMAII CONF.`; ambíguo (confecção × calçados, várias linhas).
  - Lupo/Íntima Flor: GAP real mas com linhas duplicadas no cadastro.
  - **FEMMINART era limpo** (linha única id 690) — por isso seguro.
- **PENDENTE antes do próximo `--apply`**: blindar o guard do `apply.js` para (a) casar nome **sem acento/pontuação** e (b) abortar se QUALQUER linha-irmã do fornecedor tiver dados na coleção 1 (hoje só checa a fid exata casada). E re-rodar a cobertura com matching robusto para separar GAP real de já-importado. Sem isso, rollout cego duplicaria dados.

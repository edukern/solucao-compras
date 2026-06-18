# HANDOFF — Importação 26/2 (planilhas do sistema antigo → Bolt)
Data: 2026-06-18 | Sessão #11

> ## ⏱ ATUALIZAÇÃO Sessão #11 — fim (leia primeiro)
>
> **Git:** trabalho está em `main` (commits locais, NÃO pushados): `144dfa3` (apply/backup/FEMMINART)
> e `dcce7bc` (revisor de impacto + saude.js). O branch `safeguards-perda-dados` é antigo e NÃO tem
> esse trabalho — ignore a menção a ele no handoff antigo abaixo.
>
> ### Feito nesta sessão
> - **FEMMINART GRAVADO** (1ª escrita real): sessão id 40, fornecedor_id 690 · 7 visitas · 238 pedidos ·
>   **10654 peças** · classificação **AD/AD1** · tamanhos **46/48/50/52**. Conferido direto no SQL.
> - **Backup antes da escrita:** JSON em `docs/importar-26-2/out/backup-<ts>/` + tabelas `*_backup_2622` no Supabase.
> - **Rótulo Formato B resolvido:** sutiã = número de banda (46/48/50/52), não P/M/G/GG (este caía em
>   grade **PP=bebê**, errado). `apply.js --rotulo-acima` ativa isso; parser ganhou opção `rotuloTamanhoB:'acima'`.
> - **`saude.js`** (novo, re-executável): `node saude.js` → estado do Bolt + reconciliação planilha×Bolt +
>   `out/SAUDE-BOLT.md`. Hoje: Bolt tem 51312 peças; 9 fornecedores fecham; 23 ainda fora; 10 DIVERGE.
> - **Revisor de impacto** (novo): agente `.claude/agents/revisor-impacto.md` + regra no `CLAUDE.md`
>   (rodar análise 1ª/2ª/3ª ordem antes de mudança que toque schema/serviço/dados/deploy).
>
> ### 🚨 NÃO rodar rollout cego — fornecedores DUPLICADOS
> `report-cobertura.js` casa nome SEM tirar acento/pontuação → falsos "GAP_TOTAL" que já estão importados:
> Aconchego (já no id 9, 773pç) · Rakels (id 587, 1135pç) · Mormaii (id 512 CONF., 3211pç) · Lupo/Íntima Flor (linhas dup).
> Antes do próximo `--apply`: blindar o guard do `apply.js` p/ casar sem acento/pontuação e abortar se
> QUALQUER linha-irmã do fornecedor tiver dados na coleção 1 (hoje só checa a fid exata). (O `saude.js` já usa esse matching robusto — espelhar nele.)
>
> ### ▶️ Próximos passos (em ordem, quando retomar)
> 1. **Decisões pendentes com o Eduardo** (ele vai repassar à equipe — lista já entregue no chat):
>    fornecedores a cadastrar (18: AGGY, BEAVER, CHARMS, DOBELLE, DOCE MEL, ESTILO A, FATAL SUL,
>    JEITO FASHION, KANOA, LINDA BEL, LOOK CHIC, PONTO IGUI, PURO MAR, RECOLLETA, ROYACK, SHAPE, SOLRAC;
>    DECIZAO = arquivo vazio, ignorar); qual Mormaii×qual planilha; Lupo é 1 ou vários; como tratar os
>    arquivos "Programação" (FEMMINART/LZT/Mormaii Programação = pedido separado do mesmo fornecedor?);
>    Urban City tem +2 no Bolt que na planilha (alguém lançou direto?).
> 2. **Blindar o guard do `apply.js`** (item acima) ANTES de qualquer novo `--apply`.
> 3. **Refinar `saude.js`**: os arquivos "Programação" hoje casam com o fornecedor base e geram diff gigante
>    falso (FEMMINART PROG +9920, LZT PROG +10018, Mormaii +1751). Tratar como pedido separado, não comparar com a base.
> 4. **GAP real restante** (depois de cadastro+guard): Doce Glamour (4406, tem sessão vazia id 448), Íntima Flor (5458),
>    Lupo (4743), + os 18 após cadastrados.
> 5. **Divergências PARCIAL pequenas** (diff item-a-item, read-only, antes de decidir mexer): Trajadinhos −189,
>    SCHRAMM −74, Desayner −61, Tanise −3, Marco Têxtil −3, Aconchego +2, Urban City +2.
> 6. Task 9: renomear rótulo coleção 1 "27/1" → "26/2".
>
> ### Ofertas em aberto (Eduardo não decidiu ainda)
> - Destravar `.gitignore` p/ `.claude/agents/` e `.claude/memory/` viajarem entre máquinas (hoje o agente
>   revisor só existe nesta máquina; a regra no CLAUDE.md já viaja).
> - Demonstrar o revisor numa mudança real: pôr trava de unicidade no cadastro de fornecedor (raiz dos duplicados).
> - 2ª salvaguarda (separada): conferência automática pré-deploy do app (a dor "quebra quando vou usar" é de código/deploy, não dos dados).
>
> ---
> _Abaixo: handoff das Sessões #10 e anteriores (contexto que ainda vale; ignore "branch safeguards-perda-dados")._

> ⚠️ Existe outra `HANDOFF.md` na raiz, de tema diferente (Sync Macle → Supabase). **Não apagar/sobrescrever.** Este arquivo é só da importação 26/2.

---

## Estado atual

**Tasks 1–4 do plano feitas + parser A/B + relatórios read-only. NENHUMA escrita no banco ainda.**
Branch: `safeguards-perda-dados` (commits locais, não pushados). Acesso ao banco via `SUPABASE_SERVICE_KEY` (RLS bloqueia anon).

Commitado em `docs/importar-26-2/`:
- `lib/env.js`, `lib/db.js`, `check-db.js` (Task 1 — visibilidade OK: 19 sessões / 3395 pedidos / 40658 peças na coleção 1)
- `lib/grades.js` (+test), `lib/lojas.js` (+test) — **mapa de lojas CORRIGIDO** (ver decisões)
- `lib/parse-planilha.js` — parser Formato A (T/Q intercalado) e B (colunas fixas)
- `report-elite.js`, `report-cobertura.js`, `report-femminart.js` — relatórios read-only

Artefatos gerados em `docs/importar-26-2/out/` (NÃO versionados): `report-elite.csv`, `report-cobertura.csv`.

---

## 🧠 Decisões desta sessão (não estão óbvias no código)

1. **Coleção 1 = 26/2 confirmado pelas DATAS** (sessões 2026-05/06 batem com as planilhas). Rótulo "27/1" é o equívoco a corrigir (Task 9). Há 1 sessão outlier `2026-09-08`.
2. **Mapa de lojas: o plano e o handoff antigos erravam 4↔6.** Verdade (tabela `compradores`, com CNPJ): **4=Rafael Filial 2, 5=Rafael Filial 1, 6=Rafael J. Backes.** `importar-elite.js` estava certo. Já corrigido em `lojas.js`.
3. **Casamento por ref-BASE** (token antes do 1º espaço/underscore). O Bolt sufixa a `referencia` com grade/cor (`1052 EX`, `1200 CHUMBO_PP`) — herança do `importar-elite.js`. Planilha tem ref pura. Comparar por `(comprador_id, ref_base)` reconcilia 100%.
4. **Estratégia de escrita (revisão do plano):** por fornecedor, planilha vence. Para **GAP_TOTAL é inserção pura** (0 no Bolt, nada a sobrescrever). Para os já-existentes com divergência, o caminho aprovado é **apagar e reinserir o fornecedor inteiro** da planilha (replicando a lógica do `importar-elite.js`: segmentacao por classificacao|tipo_produto|classe|tipo_grade, valor/preço, sufixo `_tipo_grade` em refs multi-grade). Backup + dry-run + rollout 1-a-1 antes.
5. **Eduardo aprovou começar pelos GAP_TOTAL** e confirmou o vínculo pessoa→loja do Formato B: **Elisangela=Filial 1(5), Alexandre=Filial 2(4), Rafael=J.Backes(6)** ("pode seguir").
6. **PENDENTE (decidir na retomada): rótulo de tamanho do Formato B.** Sutiãs têm 2 rótulos p/ as mesmas colunas: `P/M/G/GG` (cabeçalho) e `46/48/50/52` (linha acima). Peças idênticas. **DEFAULT adotado se ele não responder: gravar P/M/G/GG (como o parser já faz).** Eduardo não decidiu.
7. **SEM_CADASTRO:** Eduardo quer que EU investigue primeiro (conferir se nome só diverge vs. realmente falta cadastro; mapear os 3 "Programação" ao fornecedor base) e gere lista; ele decide o cadastro.

---

## 📊 Resultado do relatório de cobertura (read-only) dos 42 arquivos

- **JÁ IMPORTADO (6, peças batem):** Caw, **Elite (3438)**, LZT, Mezul, Olho Fatal, Victor Marcel.
- **GAP_TOTAL (7, 0 no Bolt → inserir):** Aconchego do Bebê (771), Doce Glamour (4406), **FEMMINART (10654)**, INTIMA FLOR (5458), Lupo (4743), Mormaii (1460), Rakels (1135).
- **PARCIAL (6, conferir):** Trajadinhos (1723/1534), SCHRAMM (5585/5511), Desayner (1752/1691), Marco Textil (856/853), Tanise (3884/3881), **Urban City (689/691 — Bolt tem +2, quebra "planilha ⊇ Bolt")**.
- **SEM_CADASTRO (23):** AGGY, BEAVER, Biogás, CHARMS, DOBELLE, DOCE MEL, ESTILO A, FATAL SUL, JEITO FASHION, KANOA, LINDA BEL, LOOK CHIC, PURO MAR, RECOLLETA, ROYACK, SHAPE, SOLRAC, PONTO IGUI, Mormaii Calçados, LZT Programação, Mormaii Programação, FEMMINART PROGRAMACAO, **DECIZAO (0 peças — arquivo vazio/sem fornecedor)**.

FEMMINART validado célula-a-célula: parser bate com a coluna "Quant" em todas as amostras. 7 lojas, 10654 peças.

---

## ⏳ Próximos passos (em ordem)

1. **Criar `apply.js`** (ainda não existe). Modo dry-run default; `--apply`; `--fornecedor="X"`; exige `usingServiceRole`. Para GAP_TOTAL = só insert. Replicar: ensureSessao (colecao 1, fornecedor_id, data do nome do arquivo), visitas por comprador, segmentacoes (criar se faltar), pedidos (referencia c/ sufixo `_tipo_grade` quando a ref-base repete em grades diferentes p/ o mesmo comprador), pedido_itens. Espelhar `docs/importar-elite.js` e `src/renderer/src/services/pedidos.js` (salvarBatch).
2. **Criar `backup.js`** (Task 6) e rodar ANTES de qualquer escrita. Rodar também o SQL de backup no Supabase (tabelas `*_backup_2622`).
3. **FEMMINART:** dry-run → conferir → `--apply --fornecedor="FEMMINART"` → `node report-cobertura.js` deve mostrar FEMMINART = JA_IMPORTADO.
4. **Demais GAP_TOTAL:** Aconchego, Doce Glamour, INTIMA FLOR, Lupo, Mormaii, Rakels (um a um).
5. **Investigar SEM_CADASTRO** (nomes + 3 Programação) → lista p/ Eduardo cadastrar.
6. **Diff item-a-item dos PARCIAL** (especialmente Urban City +2 e Trajadinhos −189) read-only, antes de decidir apagar-e-reinserir.
7. **Task 9:** `fix-rotulo.js` renomear 27/1 → 26/2 (idempotente, --apply).

---

## 📁 Arquivos que importam

| Caminho | O quê |
|---|---|
| `docs/importar-26-2/lib/parse-planilha.js` | Parser A+B (landmark-based). Formato A: T/Q; B: colunas fixas + oráculo "Quant". |
| `docs/importar-26-2/report-cobertura.js` + `out/report-cobertura.csv` | Mapa completo dos 42 (status por fornecedor). |
| `docs/importar-26-2/report-elite.js` / `report-femminart.js` | Validações read-only por fornecedor. |
| `docs/importar-elite.js` | **Referência canônica** da transformação que gerou o Bolt (grade→segmentacao, sufixo `_tipo_grade`, col23=valor, col27=preço). |
| `docs/superpowers/plans/2026-06-18-importacao-26-2.md` | Plano original (Tasks 5–10 ainda úteis: backup, diff, apply, fix-rotulo, runbook). Atenção: o apply do plano casa por referencia exata — usar ref-base/estratégia revisada. |
| `.claude/memory/project_importacao_26_2.md` | Memória com os fatos críticos (escrita em disco; `.claude` está gitignored — não versionada). |

**Banco:** projeto `bhxpkysueyoblizkvomb`, coleção alvo `colecao_id=1`. `.env.local` tem `SUPABASE_SERVICE_KEY` (db.js já aceita). Constraint: `pedidos(visita_id, referencia, variante_key)` único.

**Git:** trabalho no branch local `safeguards-perda-dados` (não pushado). `main` foi restaurado para `origin/main`. `.claude/` é gitignored apesar do CLAUDE.md pedir memória versionada — resolver `.gitignore` depois se quiser portabilidade.

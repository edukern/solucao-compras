# HANDOFF — Importação 26/2 (planilhas do sistema antigo → Bolt)
Data: 2026-06-18 | Sessão #8

> ⚠️ Existe outra `HANDOFF.md` na raiz, de tema diferente (Sync Macle → Supabase), com passos ainda pendentes. **Não apagar.** Este arquivo é só da importação 26/2.

---

## Estado atual

Brainstorming + spec + plano de implementação **escritos, revisados e commitados**. **Nenhum código de importação foi escrito ainda.** Nenhuma escrita no banco aconteceu.

- Spec: `docs/superpowers/specs/2026-06-18-importacao-26-2-design.md`
- Plano (10 tasks bite-sized, TDD, checkpoints): `docs/superpowers/plans/2026-06-18-importacao-26-2.md`
- Planilhas já extraídas: `Pedidos/26-2-import/` (42 arquivos `.xlsx`)

O método de execução escolhido foi **Subagent-Driven Development** (skill `superpowers:subagent-driven-development`) — parado logo no início, antes de despachar o primeiro subagente.

---

## ⏳ Próximos passos (em ordem)

1. **Executar o plano** `docs/superpowers/plans/2026-06-18-importacao-26-2.md` task por task (Task 1 → 10). Pode ser via subagent-driven-development ou inline.
2. **Task 1 é a porta de entrada e um gate:** roda `node docs/importar-26-2/check-db.js` para provar empiricamente se o **anon key enxerga TODOS os pedidos** da coleção 1. Se não enxergar (RLS), **pedir ao Eduardo a `SUPABASE_SERVICE_ROLE_KEY`** (Supabase → Settings → API) e adicionar ao `.env.local`. Qualquer `--apply` exige essa key.
3. **Validação de amostra (Task 5) é checkpoint humano obrigatório:** conferir Elite (formato A) + FEMMINART (formato B) célula a célula antes de qualquer escrita.
4. **Rollout faseado (Task 10):** aplicar **Elite primeiro** (`apply.js --apply --fornecedor="Elite"`), conferir no Bolt, só então o lote.
5. **Pendência aberta com a equipe:** confirmar se as 7 lojas extras do Formato B (Nilson, Flavia, Clovis, Marcia, Arnoldo, Gambeta, Paulinho) entram. Default = fora de escopo. Mensagem para encaminhar já foi redigida (está no histórico da conversa anterior; se necessário, reescrever a partir da nota no spec).

---

## 🧠 Decisões técnicas que não estão no código (afetam o próximo passo)

- **Planilha = fonte de verdade absoluta.** Confirmado: planilha ⊇ Bolt (não existe pedido só no Bolt). Em divergência de quantidade, **a planilha vence** (sobrescreve). Decisão do Eduardo: processo não pode ser cognitivamente pesado — não perguntar item a item.
- **Coleção alvo = `colecao_id = 1`**, hoje rotulada "27/1", **deve ser renomeada para "26/2"** (Task 9). Não usar o nome da coleção como chave de casamento — o rótulo está deslocado.
- **8 lojas do Bolt = compradores id 1–8.** Mapa aba→comprador no Formato B usa nomes de pessoa: Elisangela=Filial 1 (5), Alexandre=Filial 2 (6), Rafael=Rafael J. Backes (4). **Esse mapeamento é o maior risco de troca — confirmar na validação de amostra.**
- **3 formatos de planilha:** A (multi-aba/Elite, 36 arq), B (Pedido/nomes, 5 arq: FEMMINART, FEMMINART PROGRAMACAO, INTIMA FLOR, Lupo, SCHRAMM), C (reduzido, Mormaii Calçados). Parser usa detecção por landmarks, não offsets fixos.
- **Oráculo de validação:** no Formato A, as abas `SOMA_*` são os totais que a própria planilha calculou — usadas como checksum independente do parser.
- **Staging = `out/staging.json`** (não tabela no banco — desvio consciente do spec, YAGNI).
- **Criticidade:** Eduardo enfatizou que a importação não pode dar errado. Por isso o plano embute 8 camadas de segurança (backup, dry-run default, checksum em 3 pontos, validação de amostra, rollout faseado, idempotência, auditoria antes/depois, freio de divergência). Respeitar todos os checkpoints `--apply`.

---

## 📁 Arquivos que importam para a próxima tarefa

| Caminho | O que é |
|---|---|
| `docs/superpowers/plans/2026-06-18-importacao-26-2.md` | **O plano a executar.** Contém todo o código pronto por task. |
| `docs/superpowers/specs/2026-06-18-importacao-26-2-design.md` | Spec/design (o "porquê"). |
| `Pedidos/26-2-import/*.xlsx` | As 42 planilhas extraídas (fonte). |
| `docs/importar-elite.js` | Referência: GRADE_DEFS e parsing do Formato A. |
| `docs/importar-historico.js` | Referência: LOJA_MAP (nomes→loja) e os 2 formatos legados. |
| `docs/importar-fornecedores.js` | Referência: cadastro/nomes de fornecedores (alguns podem faltar). |
| `src/renderer/src/services/pedidos.js` | `salvarBatch`: padrão upsert `(visita_id, referencia, variante_key)` + replace de itens. O apply replica isso. |
| `.env.local` | Credenciais Supabase. Hook bloqueia leitura via `cat`; scripts leem direto. Pode faltar `SUPABASE_SERVICE_ROLE_KEY`. |

**Supabase:** projeto `bhxpkysueyoblizkvomb`. Schema: `sessoes → visitas → pedidos → pedido_itens`. Constraint: `pedidos(visita_id, referencia, variante_key)` único.

**Ambiente:** Windows, sem `supabase` CLI nem `psql`. Node + `xlsx` + `@supabase/supabase-js` instalados; **sem `dotenv`** (plano inclui loader próprio).

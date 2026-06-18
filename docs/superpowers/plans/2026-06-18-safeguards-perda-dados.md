# Salvaguardas contra perda de dados — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar de raiz as classes de erro que causam perda de dados no Bolt Compras (sobrescrita do organizador, delete sem transação, quantidades só no navegador, migração durante uso, falhas silenciosas).

**Architecture:** Inverter a fonte da verdade do navegador para o banco. Gravações de itens passam a ser atômicas (RPC transacional no Postgres). Quantidades são persistidas continuamente com saves por delta na granularidade (visita, referencia) e concorrência otimística via `updated_at`. O fechamento de sessão só lê do banco. Histórico append-only por trigger é a rede de segurança (sem PITR, plano free). Spec completo: `docs/superpowers/specs/2026-06-18-safeguards-perda-dados-design.md`.

**Tech Stack:** React 18 + Vite, Supabase (Postgres + RLS), Vitest (node env), pg_cron.

---

## Realidade de teste (ler antes de começar)

- **Lógica pura** (delta, merge, reconciliação): TDD real com Vitest em `tests/**/*.test.js` (ambiente node, sem banco). Os testes existentes do repo usam SQLite/Electron antigo — **não** reaproveitar esse harness aqui; os novos testes são de funções puras, sem dependência de DB.
- **SQL (migrations, RPC, triggers)**: não há `supabase` CLI nesta máquina. Aplicar via **SQL editor do Supabase** (projeto `bhxpkysueyoblizkvomb`) ou MCP. Cada task SQL traz a query de verificação a rodar logo após aplicar.
- **Integração no `Compras.jsx`**: verificação manual no preview (`npm run dev`), seguindo os passos descritos em cada task.
- Comandos de teste JS: `npm run test` (roda tudo) ou `npx vitest run tests/<arquivo>.test.js` (um arquivo).

---

## File Structure

**Novos arquivos:**
- `supabase/migrations/022_pedidos_updated_at.sql` — coluna `updated_at` + trigger em `pedidos` e `pedido_itens`
- `supabase/migrations/023_historico_append_only.sql` — tabelas de histórico + triggers + poda `pg_cron`
- `supabase/migrations/024_rpc_salvar_pedidos.sql` — RPCs atômicas com detecção de conflito
- `supabase/migrations/025_app_config_manutencao.sql` — tabela `app_config` + flag `manutencao`
- `src/renderer/src/services/pedidoMerge.js` — lógica pura: `computeItensDelta` (base do save por delta)
- `tests/pedido-merge.test.js` — testes unitários da lógica pura
- `src/renderer/src/services/appConfig.js` — leitura da flag `manutencao`
- `src/renderer/src/hooks/useBeforeUnload.js` — guarda de fechamento de aba
- `src/renderer/src/components/SaveStatus.jsx` + `.module.css` — indicador de status de salvamento
- `docs/MIGRACOES.md` — protocolo de migração segura

**Arquivos modificados:**
- `src/renderer/src/services/pedidos.js` — métodos passam a chamar RPC; novo `salvarQuantidadesDelta`
- `src/renderer/src/screens/Compras.jsx` — auto-save de quantidades, recovery por reconciliação, fechar lê do banco, beforeunload, status de save, faixa de manutenção

---

# FASE A — Gravação atômica via RPC (elimina risco #2)

### Task A1: Migration — `updated_at` em pedidos e pedido_itens

**Files:**
- Create: `supabase/migrations/022_pedidos_updated_at.sql`

- [ ] **Step 1: Escrever a migration**

```sql
-- 022: updated_at em pedidos e pedido_itens (concorrência otimística + recovery)
-- Aditiva e retrocompatível: coluna nova com default, nenhuma coluna removida/renomeada.

ALTER TABLE pedidos       ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE pedido_itens  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_updated_at ON pedidos;
CREATE TRIGGER trg_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_pedido_itens_updated_at ON pedido_itens;
CREATE TRIGGER trg_pedido_itens_updated_at
  BEFORE UPDATE ON pedido_itens
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

- [ ] **Step 2: Aplicar no Supabase (SQL editor do projeto `bhxpkysueyoblizkvomb`) e verificar**

Rodar logo após aplicar:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'pedidos' AND column_name = 'updated_at';
```

Esperado: 1 linha, `updated_at | timestamp with time zone`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/022_pedidos_updated_at.sql
git commit -m "feat(db): add updated_at + trigger to pedidos and pedido_itens"
```

---

### Task A2: Migration — RPCs atômicas de gravação

**Files:**
- Create: `supabase/migrations/024_rpc_salvar_pedidos.sql`

> Nota: o número 023 é reservado para o histórico (Fase H), mas as RPCs (024) não dependem dele — aplicar 024 antes de 023 é seguro. Mantemos a numeração por área.

- [ ] **Step 1: Escrever a migration com as duas funções**

```sql
-- 024: RPCs atômicas para gravação de pedidos + itens.
-- Substituem o padrão JS "delete itens + insert itens" por uma transação única.
-- security definer: roda como owner, contornando a granularidade de RLS de leitura,
-- mas só é executável por authenticated (grant abaixo).

-- salvar_pedidos_visita: upsert dos pedidos da visita + replace atômico dos itens.
-- p_payload: jsonb array de objetos:
--   { referencia, variante_key, segmentacao_id, valor_unitario, desconto_pct,
--     icms_pct, markup_pct, preco_venda, cor, detalhe, obs,
--     itens: [ { tamanho, qtd } ] }
CREATE OR REPLACE FUNCTION salvar_pedidos_visita(
  p_visita_id bigint,
  p_payload   jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r        jsonb;
  v_ped_id bigint;
BEGIN
  FOR r IN SELECT * FROM jsonb_array_elements(p_payload)
  LOOP
    INSERT INTO pedidos (
      visita_id, referencia, variante_key, segmentacao_id,
      valor_unitario, desconto_pct, icms_pct, markup_pct, preco_venda,
      cor, detalhe, obs
    ) VALUES (
      p_visita_id,
      r->>'referencia',
      COALESCE(r->>'variante_key', ''),
      (r->>'segmentacao_id')::bigint,
      COALESCE((r->>'valor_unitario')::numeric, 0),
      COALESCE((r->>'desconto_pct')::numeric, 0),
      COALESCE((r->>'icms_pct')::numeric, 0),
      COALESCE((r->>'markup_pct')::numeric, 0),
      COALESCE((r->>'preco_venda')::numeric, 0),
      COALESCE(r->>'cor', ''),
      COALESCE(r->>'detalhe', ''),
      COALESCE(r->>'obs', '')
    )
    ON CONFLICT (visita_id, referencia, variante_key) DO UPDATE SET
      segmentacao_id = EXCLUDED.segmentacao_id,
      valor_unitario = EXCLUDED.valor_unitario,
      desconto_pct   = EXCLUDED.desconto_pct,
      icms_pct       = EXCLUDED.icms_pct,
      markup_pct     = EXCLUDED.markup_pct,
      preco_venda    = EXCLUDED.preco_venda,
      cor            = EXCLUDED.cor,
      detalhe        = EXCLUDED.detalhe,
      obs            = EXCLUDED.obs
    RETURNING id INTO v_ped_id;

    -- replace dos itens deste pedido, tudo na mesma transação
    DELETE FROM pedido_itens WHERE pedido_id = v_ped_id;
    INSERT INTO pedido_itens (pedido_id, tamanho, qtd)
    SELECT v_ped_id, (it->>'tamanho'), (it->>'qtd')::int
    FROM jsonb_array_elements(COALESCE(r->'itens', '[]'::jsonb)) it
    WHERE (it->>'qtd')::int > 0;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION salvar_pedidos_visita(bigint, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION salvar_pedidos_visita(bigint, jsonb) TO authenticated;
```

- [ ] **Step 2: Aplicar no Supabase e verificar a função existe**

```sql
SELECT proname, pg_get_function_identity_arguments(oid) AS args
FROM pg_proc WHERE proname = 'salvar_pedidos_visita';
```

Esperado: 1 linha, `salvar_pedidos_visita | p_visita_id bigint, p_payload jsonb`.

- [ ] **Step 3: Teste manual de atomicidade no SQL editor**

Substitua `<VID>` por um `visita_id` real de teste e `<SEG>` por um `segmentacao_id` real:

```sql
SELECT salvar_pedidos_visita(<VID>, '[
  {"referencia":"TST-RPC","variante_key":"","segmentacao_id":<SEG>,
   "valor_unitario":10,"itens":[{"tamanho":"P","qtd":3},{"tamanho":"M","qtd":2}]}
]'::jsonb);

SELECT pi.tamanho, pi.qtd
FROM pedidos p JOIN pedido_itens pi ON pi.pedido_id = p.id
WHERE p.visita_id = <VID> AND p.referencia = 'TST-RPC' ORDER BY pi.tamanho;
```

Esperado: 2 linhas (M=2, P=3). Limpe depois: `DELETE FROM pedidos WHERE referencia='TST-RPC';`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/024_rpc_salvar_pedidos.sql
git commit -m "feat(db): atomic salvar_pedidos_visita RPC (transactional item replace)"
```

---

### Task A3: Serviço JS chama a RPC em `salvarPedidosVisita`

**Files:**
- Modify: `src/renderer/src/services/pedidos.js:140-171`

- [ ] **Step 1: Substituir o corpo de `salvarPedidosVisita` pela chamada RPC**

Trocar todo o método `salvarPedidosVisita` (linhas ~140-171) por:

```js
  // Salva pedidos de uma visita específica de forma atômica (RPC transacional).
  // updates: array de { referencia, variante_key, segmentacao_id, valor_unitario,
  //   desconto_pct, icms_pct, markup_pct, preco_venda, cor, detalhe, obs, itens:[{tamanho,qtd}] }
  async salvarPedidosVisita(visitaId, updates) {
    const payload = updates.map(({ itens, ...fields }) => ({
      variante_key: '',
      ...fields,
      itens: (itens ?? []).filter(i => i.qtd > 0),
    }))
    const { error } = await supabase.rpc('salvar_pedidos_visita', {
      p_visita_id: visitaId,
      p_payload: payload,
    })
    if (error) throw error
  },
```

- [ ] **Step 2: Verificar build/typecheck não quebra**

Run: `npm run build`
Expected: build conclui sem erro.

- [ ] **Step 3: Verificação manual no preview (Phase 5 — Preencher minha loja)**

Run: `npm run dev` → abrir uma sessão liberada → preencher uma grade de loja → Salvar.
Esperado: salva sem erro; recarregar a página mantém as quantidades. Conferir no Supabase que `pedido_itens` tem as linhas.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/services/pedidos.js
git commit -m "refactor(pedidos): salvarPedidosVisita uses atomic RPC"
```

---

> **Nota sobre `salvarBatch`:** o método antigo `salvarBatch` (delete+insert não
> atômico) é o caminho de fechamento atual. Ele **não** é refatorado aqui porque a
> Fase D o aposenta: o fechamento passa a ler do banco em vez de regravar. A remoção
> de `salvarBatch` está na Task D1.

---

# FASE B+C — Saves por delta, concorrência e persistência contínua (elimina #1 parte 1, #3, #6)

### Task B1: Lógica pura de delta e merge — testes primeiro

**Files:**
- Create: `tests/pedido-merge.test.js`
- Create: `src/renderer/src/services/pedidoMerge.js`

- [ ] **Step 1: Escrever os testes que falham**

```js
import { describe, it, expect } from 'vitest'
import { computeItensDelta } from '../src/renderer/src/services/pedidoMerge.js'

describe('computeItensDelta', () => {
  it('returns only refs whose item map changed', () => {
    const prev = { 'A|': { 1: { P: 2 } }, 'B|': { 1: { M: 3 } } }
    const next = { 'A|': { 1: { P: 2 } }, 'B|': { 1: { M: 4 } } }
    const delta = computeItensDelta(prev, next)
    expect(delta).toEqual(['B|'])
  })

  it('detects a newly added ref', () => {
    const prev = {}
    const next = { 'A|': { 1: { P: 1 } } }
    expect(computeItensDelta(prev, next)).toEqual(['A|'])
  })

  it('detects removal of a size', () => {
    const prev = { 'A|': { 1: { P: 1, M: 2 } } }
    const next = { 'A|': { 1: { P: 1 } } }
    expect(computeItensDelta(prev, next)).toEqual(['A|'])
  })

  it('returns empty when nothing changed', () => {
    const prev = { 'A|': { 1: { P: 1 } } }
    const next = { 'A|': { 1: { P: 1 } } }
    expect(computeItensDelta(prev, next)).toEqual([])
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falham**

Run: `npx vitest run tests/pedido-merge.test.js`
Expected: FAIL — "does not provide an export named 'computeItensDelta'".

- [ ] **Step 3: Implementar `pedidoMerge.js`**

```js
// Lógica pura de concorrência de quantidades. Sem dependência de Supabase/React.
// qtds shape: { [localId]: { [visitaId]: { [tamanho]: qty } } }

// Retorna a lista de localIds cujo mapa de itens mudou entre prev e next.
// Base do auto-save por delta: grava só o que mudou, na granularidade (ref) por visita.
export function computeItensDelta(prev, next) {
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})])
  const changed = []
  for (const k of keys) {
    if (JSON.stringify(prev?.[k] ?? null) !== JSON.stringify(next?.[k] ?? null)) changed.push(k)
  }
  return changed
}
```

> Modelo de concorrência inicial: última escrita vence por (visita, ref). O delta em
> (visita, ref) já elimina colisão entre lojas diferentes e refs diferentes — o caso real
> de "os dois ao mesmo tempo". Merge fino no nível do tamanho (mesma ref, mesmo segundo)
> é evolução futura documentada no spec; não implementado aqui para não adicionar leitura
> extra por ciclo de save sem necessidade comprovada.

- [ ] **Step 4: Rodar os testes**

Run: `npx vitest run tests/pedido-merge.test.js`
Expected: PASS (todos).

- [ ] **Step 5: Commit**

```bash
git add tests/pedido-merge.test.js src/renderer/src/services/pedidoMerge.js
git commit -m "feat(pedidos): pure delta/merge/reconcile logic with unit tests"
```

---

### Task B2: Serviço — `salvarQuantidadesDelta` (grava só refs alteradas)

**Files:**
- Modify: `src/renderer/src/services/pedidos.js` (adicionar método novo após `salvarPedidosVisita`)

- [ ] **Step 1: Adicionar o método**

Este método grava, para uma visita, apenas os pedidos cujas refs mudaram. Recebe os mesmos `updates` de `salvarPedidosVisita` mas já filtrados pelo caller via `computeItensDelta`. Reusa a RPC atômica:

```js
  // Grava apenas os pedidos (refs) que mudaram para esta visita, via RPC atômica.
  // Mesmo formato de updates de salvarPedidosVisita.
  async salvarQuantidadesDelta(visitaId, updatesAlterados) {
    if (!updatesAlterados.length) return
    return this.salvarPedidosVisita(visitaId, updatesAlterados)
  },
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: build sem erro.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/services/pedidos.js
git commit -m "feat(pedidos): salvarQuantidadesDelta for changed-only writes"
```

---

### Task B3: Phase 2 auto-save persiste quantidades por delta

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` — auto-save effect (~l687-700), helpers do `RegistrarPedidoSessao`

Contexto: hoje o effect de auto-save (deps `[items]`) chama `handleSalvarSessao` que grava só refs na visita do organizador. Vamos adicionar persistência de quantidades por delta para **todas as visitas**, guardando o último snapshot salvo para calcular o delta.

- [ ] **Step 1: Importar a lógica pura no topo do arquivo**

Adicionar perto dos outros imports de services:

```js
import { computeItensDelta } from '../services/pedidoMerge'
```

- [ ] **Step 2: Adicionar refs de controle dentro de `RegistrarPedidoSessao`**

Junto aos outros `useRef` (perto de `autoSaveRef`, ~l622):

```js
  const lastSavedQtdsRef = useRef({})   // snapshot {localId: {visitaId: {tam: qty}}} já confirmado no banco
  const qtdSaveTimerRef  = useRef(null)
```

- [ ] **Step 3: Adicionar função que monta o payload de uma ref para uma visita**

Adicionar dentro de `RegistrarPedidoSessao`, perto dos helpers de total (~l744):

```js
  function buildUpdateParaVisita(item, visitaId) {
    const lojaTams = qtds[item.localId]?.[visitaId] ?? {}
    const itens = tamanhosDeTipoGrade(item.tipo_grade)
      .map(tam => ({ tamanho: tam, qtd: parseInt(lojaTams[tam]) || 0 }))
      .filter(i => i.qtd > 0)
    const num = s => parseFloat((s ?? '').replace(',', '.')) || 0
    return {
      referencia: item.ref, variante_key: item.variante_key ?? '',
      segmentacao_id: item._segId,   // preenchido no Step 4
      valor_unitario: num(item.valor), desconto_pct: num(sessaoDesconto),
      icms_pct: num(item.icms_pct), markup_pct: num(item.markup_pct),
      preco_venda: num(item.preco_venda),
      cor: item.cor || '', detalhe: item.detalhe || '', obs: item.obs || '',
      itens,
    }
  }
```

- [ ] **Step 4: Adicionar o effect de auto-save de quantidades por delta**

Logo após o effect de auto-save de refs (~l700). Ele resolve `segmentacao_id` por item, calcula o delta de `qtds` desde o último save e grava só o que mudou, por visita:

```js
  // Auto-save de QUANTIDADES por delta (debounce 2s) — banco como fonte da verdade
  useEffect(() => {
    if (!sessao?.id || !items.length) return
    if (qtdSaveTimerRef.current) clearTimeout(qtdSaveTimerRef.current)
    qtdSaveTimerRef.current = setTimeout(async () => {
      try {
        const changedIds = computeItensDelta(lastSavedQtdsRef.current, qtds)
        if (!changedIds.length) return
        setSaveState('saving')
        // resolve segmentacao_id por item alterado
        const itemById = Object.fromEntries(items.map(i => [i.localId, i]))
        for (const item of Object.values(itemById)) {
          if (item._segId) continue
          const classDef = GRADE_DEFINITIONS[item.tipo_grade]
          if (!classDef) continue
          const seg = await segmentacoesService.findOrCreate({
            classificacao: classDef.classificacao, tipo_produto: item.tipo_produto,
            classe: item.classe, tipo_grade: item.tipo_grade, estacao: colEstacao ?? 'inverno',
          })
          item._segId = seg.id
        }
        // por visita, grava só as refs alteradas
        for (const v of visitas) {
          const updates = changedIds
            .map(id => itemById[id])
            .filter(it => it && it._segId)
            .map(it => buildUpdateParaVisita(it, v.id))
          if (updates.length) await pedidosService.salvarQuantidadesDelta(v.id, updates)
        }
        lastSavedQtdsRef.current = JSON.parse(JSON.stringify(qtds))
        setSaveState('saved')
      } catch (e) {
        setSaveState('error')
        setError(`Falha ao salvar quantidades: ${e.message}`)
      }
    }, 2000)
    return () => clearTimeout(qtdSaveTimerRef.current)
  }, [qtds])
```

- [ ] **Step 5: Declarar `saveState` no componente**

Junto aos outros `useState` de `RegistrarPedidoSessao`:

```js
  const [saveState, setSaveState] = useState('idle')  // idle | saving | saved | error
```

- [ ] **Step 6: Seed do snapshot ao carregar (Retomar)**

No bloco que inicializa via `initialQtds` (recovery/Retomar), após `setQtds(...)`, semear o snapshot para não regravar tudo de cara. Localizar onde `initialQtds` é aplicado e adicionar:

```js
  // dentro do useEffect/inicialização que aplica initialQtds:
  lastSavedQtdsRef.current = JSON.parse(JSON.stringify(initialQtds ?? {}))
```

- [ ] **Step 7: Verificação manual (a defesa central)**

Run: `npm run dev`
1. Abrir sessão, adicionar 1 ref, digitar quantidades em 2 lojas. Aguardar 2s (status → ✓ Salvo).
2. Dar **F5**. Esperado: as quantidades **voltam** (vindas do banco), não somem.
3. No Supabase, conferir `pedido_itens` com as quantidades.

- [ ] **Step 8: Commit**

```bash
git add src/renderer/src/screens/Compras.jsx
git commit -m "feat(phase2): continuous delta auto-save of quantities to DB"
```

---

### Task B4: Recovery por reconciliação (remove heurística frágil)

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` — recovery effect (~l4256-4291)

Contexto: a verificação atual descarta o recovery por inferência ("tem pedidos salvos?"). Com quantidades sempre no banco, simplificamos: o `localStorage` é só buffer de crash; banco vence salvo se o local for estritamente mais novo.

- [ ] **Step 1: Gravar timestamp no auto-save local**

No effect de auto-save local (~l690), incluir `savedAt`:

```js
    localStorage.setItem(RECOVERY_KEY, JSON.stringify({
      sessao_id: sessao.id, items, qtds, activeId, lojaIdx, savedAt: Date.now()
    }))
```

- [ ] **Step 2: Substituir a checagem de descarte do recovery**

Trocar o bloco (~l4266-4269):

```js
        // Auto-limpa apenas se a sessão tem quantidades salvas no banco (foi concluída de verdade)
        const totais = await pedidosService.totaisPorFornecedor(data.sessao_id)
        const temQtdsSalvas = totais.some(v => v.pedidos?.some(p => p.pedido_itens?.some(i => i.qtd > 0)))
        if (temQtdsSalvas) { localStorage.removeItem(key); return null }
```

por:

```js
        // Banco é a fonte da verdade. Buffer local só sobrevive se for estritamente mais novo
        // que o updated_at máximo do banco (crash antes do flush de 2s). Senão, descarta.
        const maxUpdated = await pedidosService.maxUpdatedAt(data.sessao_id)
        if (maxUpdated && (!data.savedAt || data.savedAt <= maxUpdated)) {
          localStorage.removeItem(key); return null
        }
```

- [ ] **Step 3: Adicionar `maxUpdatedAt` ao serviço**

Em `src/renderer/src/services/pedidos.js`:

```js
  // Maior updated_at (ms) entre pedidos da sessão; null se não houver pedidos.
  async maxUpdatedAt(sessao_id) {
    const { data, error } = await supabase
      .from('visitas')
      .select('pedidos(updated_at)')
      .eq('sessao_id', sessao_id)
    if (error) throw error
    let max = null
    for (const v of data ?? []) {
      for (const p of v.pedidos ?? []) {
        const t = new Date(p.updated_at).getTime()
        if (max === null || t > max) max = t
      }
    }
    return max
  },
```

- [ ] **Step 4: Verificação manual**

Run: `npm run dev`
1. Preencher quantidades, aguardar ✓ Salvo, F5 → dados voltam, **sem** banner de recovery (porque banco está em dia).
2. Simular crash: preencher, e antes dos 2s fechar a aba e reabrir → banner de recovery aparece com os dados locais mais novos.

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/screens/Compras.jsx src/renderer/src/services/pedidos.js
git commit -m "feat(recovery): reconcile localStorage vs DB by timestamp, DB authoritative"
```

---

# FASE D — Fechar sessão lê do banco, sem regravar (elimina #1 parte 2)

### Task D1: `handleFechar` busca estado fresco do banco para os PDFs

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` — `handleFechar` (~l1089-1147)

Contexto: como as quantidades já estão sempre no banco (Fase B/C), o fechamento não deve regravar todas as lojas a partir do estado local. Deve garantir o flush do delta pendente e então ler do banco.

- [ ] **Step 1: Reescrever `handleFechar`**

```js
  async function handleFechar() {
    setSaving(true)
    setError(null)
    try {
      // 1. Flush de qualquer delta pendente (garante que o que está na tela foi gravado)
      if (qtdSaveTimerRef.current) clearTimeout(qtdSaveTimerRef.current)
      const changedIds = computeItensDelta(lastSavedQtdsRef.current, qtds)
      if (changedIds.length) {
        const itemById = Object.fromEntries(items.map(i => [i.localId, i]))
        for (const item of Object.values(itemById)) {
          if (item._segId) continue
          const classDef = GRADE_DEFINITIONS[item.tipo_grade]
          if (!classDef) continue
          const seg = await segmentacoesService.findOrCreate({
            classificacao: classDef.classificacao, tipo_produto: item.tipo_produto,
            classe: item.classe, tipo_grade: item.tipo_grade, estacao: colEstacao ?? 'inverno',
          })
          item._segId = seg.id
        }
        for (const v of visitas) {
          const updates = changedIds.map(id => itemById[id]).filter(it => it && it._segId)
            .map(it => buildUpdateParaVisita(it, v.id))
          if (updates.length) await pedidosService.salvarQuantidadesDelta(v.id, updates)
        }
        lastSavedQtdsRef.current = JSON.parse(JSON.stringify(qtds))
      }
      // 2. Ler o estado fresco do banco (inclui o que as lojas preencheram em paralelo)
      const visitasComPedidos = await pedidosService.itensPorFornecedor(sessao.id)
      const pedidosFresh = visitasComPedidos.flatMap(v =>
        (v.pedidos ?? []).map(p => ({
          ...p,
          comprador_nome: visitas.find(x => x.id === v.id)?.comprador_nome ?? '',
          classificacao: p.segmentacao?.classificacao, tipo_produto: p.segmentacao?.tipo_produto,
          classe: p.segmentacao?.classe, tipo_grade: p.segmentacao?.tipo_grade,
        }))
      )
      localStorage.removeItem(RECOVERY_KEY)
      onFechar(pedidosFresh)
    } catch (e) {
      setError(`Erro ao fechar sessão: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }
```

- [ ] **Step 2: Conferir o consumo em `FecharSessao` (Phase 3)**

Ler `FecharSessao` (~l3047) e confirmar que ele usa `pedidos: pedidosProp` com os campos acima (`comprador_nome`, `classificacao`, `tipo_grade`, `itens`). Ajustar o mapeamento do Step 1 se algum campo usado pela tela faltar. (Verificação de leitura — sem mudança se já bate.)

- [ ] **Step 3: Remover o `salvarBatch` agora órfão**

Confirmar que mais nada usa `salvarBatch`:

Run: `git grep -n "salvarBatch" src/`
Expected: nenhuma ocorrência fora da definição em `pedidos.js` (o antigo chamador em `handleFechar` foi substituído no Step 1).

Remover o método `salvarBatch` inteiro de `src/renderer/src/services/pedidos.js` (o bloco `async salvarBatch(batch, sessao_id) { ... }`, ~l4-72). Ele continha o `delete + insert` não atômico (risco #2) e não tem mais chamador.

- [ ] **Step 4: Verificação manual do cenário crítico (sobrescrita)**

Run: `npm run dev` em duas abas/navegadores:
1. Aba A (organizador, Phase 2): abrir sessão com 1 ref, **sem** preencher a Loja X.
2. Aba B (Loja X, Phase 5): preencher a grade da Loja X, Salvar.
3. Aba A: menu `⋯` → Gerar PDFs.
4. Esperado: o PDF / Fase 3 da Loja X **mantém** o que a Loja B preencheu. Antes da correção, sumiria.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/screens/Compras.jsx
git commit -m "fix(phase2): close session reads fresh DB state, never overwrites store fills"
```

---

# FASE G — Status de salvamento visível (falhas não silenciosas)

### Task G1: Componente `SaveStatus`

**Files:**
- Create: `src/renderer/src/components/SaveStatus.jsx`
- Create: `src/renderer/src/components/SaveStatus.module.css`

- [ ] **Step 1: Criar o componente**

```jsx
import styles from './SaveStatus.module.css'

// state: 'idle' | 'saving' | 'saved' | 'error'
export default function SaveStatus({ state, onRetry }) {
  if (state === 'idle') return null
  if (state === 'saving') return <span className={styles.saving}>Salvando…</span>
  if (state === 'saved')  return <span className={styles.saved}>✓ Salvo</span>
  return (
    <span className={styles.error}>
      ⚠ Falha ao salvar
      {onRetry && <button className={styles.retry} onClick={onRetry}>tentar de novo</button>}
    </span>
  )
}
```

- [ ] **Step 2: Criar o CSS**

```css
.saving { color: var(--text-secondary, #aaa); font-size: 13px; }
.saved  { color: var(--green, #3fa45b); font-size: 13px; }
.error  { color: var(--red, #e05252); font-size: 13px; display: inline-flex; gap: 6px; align-items: center; }
.retry  { background: none; border: 1px solid currentColor; border-radius: 4px;
          color: inherit; cursor: pointer; font-size: 12px; padding: 1px 6px; }
```

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/components/SaveStatus.jsx src/renderer/src/components/SaveStatus.module.css
git commit -m "feat(ui): SaveStatus indicator component"
```

---

### Task G2: Plugar `SaveStatus` na barra da Phase 2

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` — top bar da Phase 2 (~l1304-1348)

- [ ] **Step 1: Importar e adicionar retry**

No topo:

```js
import SaveStatus from '../components/SaveStatus'
```

Adicionar uma função de retry dentro de `RegistrarPedidoSessao` (força um novo ciclo de delta):

```js
  function retrySalvarQtds() {
    lastSavedQtdsRef.current = {}   // força recomputar tudo como delta
    setQtds(q => ({ ...q }))        // dispara o effect de auto-save
  }
```

- [ ] **Step 2: Renderizar o indicador na top bar**

Dentro de `phase2TopBar`, antes do `div` do menu `⋯` (~l1316):

```jsx
        <SaveStatus state={saveState} onRetry={saveState === 'error' ? retrySalvarQtds : undefined} />
```

- [ ] **Step 3: Verificação manual**

Run: `npm run dev` → digitar quantidades → ver "Salvando…" depois "✓ Salvo". Para testar erro: desligar a internet, digitar → ver "⚠ Falha ao salvar — tentar de novo".

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/screens/Compras.jsx
git commit -m "feat(phase2): visible save status with retry in top bar"
```

---

### Task G3: Plugar `SaveStatus` na Phase 5 (Preencher minha loja)

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` — `PreencherMinhaLoja` (~l2877) e seu `handleSalvar` (~l3827)

- [ ] **Step 1: Mapear estados existentes para o indicador**

`PreencherMinhaLoja` já tem `saving`, `saved`, `error`. Derivar um único `saveState`:

```js
  const saveState5 = saving ? 'saving' : error ? 'error' : saved ? 'saved' : 'idle'
```

- [ ] **Step 2: Renderizar perto do botão Salvar (~l3883)**

```jsx
        <SaveStatus state={saveState5} onRetry={error ? handleSalvar : undefined} />
```

- [ ] **Step 3: Verificação manual**

Run: `npm run dev` → Phase 5 → preencher e Salvar → ver "✓ Salvo".

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/screens/Compras.jsx
git commit -m "feat(phase5): visible save status with retry"
```

---

# FASE F — Aviso ao fechar aba com dados não salvos

### Task F1: Hook `useBeforeUnload`

**Files:**
- Create: `src/renderer/src/hooks/useBeforeUnload.js`

- [ ] **Step 1: Criar o hook**

```js
import { useEffect } from 'react'

// Avisa o usuário ao tentar fechar/recarregar a aba enquanto `when` for true.
export function useBeforeUnload(when) {
  useEffect(() => {
    if (!when) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [when])
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/src/hooks/useBeforeUnload.js
git commit -m "feat(hooks): useBeforeUnload guard"
```

---

### Task F2: Ativar o aviso na Phase 2 quando houver delta pendente

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` — `RegistrarPedidoSessao`

- [ ] **Step 1: Importar e usar**

No topo:

```js
import { useBeforeUnload } from '../hooks/useBeforeUnload'
```

Dentro de `RegistrarPedidoSessao`, calcular "sujo" e ativar a guarda:

```js
  const temDeltaPendente = saveState === 'saving' ||
    computeItensDelta(lastSavedQtdsRef.current, qtds).length > 0
  useBeforeUnload(temDeltaPendente)
```

- [ ] **Step 2: Verificação manual**

Run: `npm run dev` → digitar uma quantidade e, **antes** de aparecer "✓ Salvo", tentar fechar a aba → o navegador mostra o aviso de "sair do site?". Após "✓ Salvo", fechar não mostra aviso.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/screens/Compras.jsx
git commit -m "feat(phase2): warn before unload when there are unsaved quantities"
```

---

# FASE E — Protocolo de migração + modo manutenção

### Task E1: Documento de protocolo de migração

**Files:**
- Create: `docs/MIGRACOES.md`

- [ ] **Step 1: Escrever o documento**

```markdown
# Protocolo de Migração — Bolt Compras (produção)

O app roda em produção com uso real. Migrações de schema seguem estas regras
para nunca corromper dados de quem está usando.

## Regra 1 — Migrações são sempre aditivas (expand-contract)
- Pode: `ADD COLUMN ... DEFAULT`, criar tabela/índice/constraint nova, criar função.
- Nunca na mesma migração que mantém o app no ar: `DROP COLUMN`, `RENAME COLUMN`,
  mudar tipo de coluna em uso, `DROP`/alterar constraint usada por escrita ativa.
- Remoção de algo antigo só depois que nenhuma versão do app usa mais (fase "contract",
  em migração separada e posterior).

## Regra 2 — Migração pesada roda em modo manutenção
1. Ligar o modo manutenção: `UPDATE app_config SET manutencao = true WHERE id = 1;`
2. Aguardar ~30s (clientes detectam e param de gravar).
3. Aplicar a migração no SQL editor do Supabase.
4. Rodar a query de verificação da migração.
5. Desligar: `UPDATE app_config SET manutencao = false WHERE id = 1;`

## Regra 3 — Janela de baixo uso
Preferir aplicar à noite/fim de semana. Avisar os usuários quando possível.

## Regra 4 — Verificação obrigatória
Toda migração tem uma query de verificação que confirma o efeito esperado,
rodada imediatamente após aplicar.
```

- [ ] **Step 2: Commit**

```bash
git add docs/MIGRACOES.md
git commit -m "docs: safe migration protocol for production"
```

---

### Task E2: Migration — tabela `app_config` com flag de manutenção

**Files:**
- Create: `supabase/migrations/025_app_config_manutencao.sql`

- [ ] **Step 1: Escrever a migration**

```sql
-- 025: app_config singleton com flag de manutenção. Leitura pública (authenticated),
-- escrita só por admin (via dashboard). RLS habilitado.

CREATE TABLE IF NOT EXISTS app_config (
  id         smallint PRIMARY KEY DEFAULT 1,
  manutencao boolean  NOT NULL DEFAULT false,
  mensagem   text     NOT NULL DEFAULT 'Sistema em manutenção — salve seu trabalho.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_config_singleton CHECK (id = 1)
);

INSERT INTO app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS app_config_read ON app_config;
CREATE POLICY app_config_read ON app_config
  FOR SELECT USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Aplicar e verificar**

```sql
SELECT id, manutencao FROM app_config;
```

Esperado: 1 linha, `1 | false`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/025_app_config_manutencao.sql
git commit -m "feat(db): app_config table with maintenance flag"
```

---

### Task E3: Serviço + faixa de manutenção no app

**Files:**
- Create: `src/renderer/src/services/appConfig.js`
- Modify: `src/renderer/src/screens/Compras.jsx` — bloquear gravação + faixa quando manutenção

- [ ] **Step 1: Criar o serviço**

```js
import { supabase } from '../lib/supabase'

export const appConfig = {
  async get() {
    const { data, error } = await supabase
      .from('app_config').select('manutencao, mensagem').eq('id', 1).single()
    if (error) throw error
    return data
  },
}
```

- [ ] **Step 2: Ler a flag no `Compras` (orchestrator) e propagar**

Em `Compras` (~l4204), adicionar estado e polling leve (a cada 30s):

```js
  const [manutencao, setManutencao] = useState(null)  // null | {manutencao, mensagem}
  useEffect(() => {
    let alive = true
    const load = () => appConfig.get().then(c => { if (alive) setManutencao(c) }).catch(() => {})
    load()
    const t = setInterval(load, 30000)
    return () => { alive = false; clearInterval(t) }
  }, [])
```

Import no topo: `import { appConfig } from '../services/appConfig'`

- [ ] **Step 3: Renderizar a faixa quando ligado**

No JSX do `Compras`, logo no início do container principal:

```jsx
      {manutencao?.manutencao && (
        <div style={{
          background: 'var(--red, #e05252)', color: '#fff', padding: '8px 16px',
          textAlign: 'center', fontWeight: 600, fontSize: 14
        }}>
          {manutencao.mensagem}
        </div>
      )}
```

- [ ] **Step 4: Bloquear o auto-save de quantidades durante manutenção**

Passar `manutencao` como prop para `RegistrarPedidoSessao` (no JSX da Phase 2, ~l4572) e, no effect de auto-save de quantidades (Task B3, Step 4), adicionar guarda no início do timeout:

```js
        if (manutencaoAtiva) { setSaveState('idle'); return }
```

(onde `manutencaoAtiva` é a prop booleana derivada de `manutencao?.manutencao`.)

- [ ] **Step 5: Verificação manual**

Run: `npm run dev`. No Supabase: `UPDATE app_config SET manutencao = true WHERE id = 1;`
Esperado: em até 30s a faixa vermelha aparece e digitar quantidades não grava. Desligar: faixa some, gravação volta.

- [ ] **Step 6: Commit**

```bash
git add src/renderer/src/services/appConfig.js src/renderer/src/screens/Compras.jsx
git commit -m "feat(app): maintenance banner blocks writes during migrations"
```

---

# FASE H — Histórico append-only (rede de segurança)

### Task H1: Migration — tabelas de histórico + triggers + poda

**Files:**
- Create: `supabase/migrations/023_historico_append_only.sql`

- [ ] **Step 1: Escrever a migration**

```sql
-- 023: histórico append-only de pedidos e pedido_itens. Rede de segurança no plano
-- free (sem PITR). Toda UPDATE/DELETE grava a linha ANTERIOR. Poda diária via pg_cron.

CREATE TABLE IF NOT EXISTS pedidos_historico (
  hist_id    bigserial PRIMARY KEY,
  op         text NOT NULL,                 -- 'UPDATE' | 'DELETE'
  registrado_em timestamptz NOT NULL DEFAULT now(),
  pedido_id  bigint,
  dados      jsonb NOT NULL                 -- linha anterior completa
);

CREATE TABLE IF NOT EXISTS pedido_itens_historico (
  hist_id    bigserial PRIMARY KEY,
  op         text NOT NULL,
  registrado_em timestamptz NOT NULL DEFAULT now(),
  item_id    bigint,
  dados      jsonb NOT NULL
);

CREATE OR REPLACE FUNCTION log_pedidos_historico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO pedidos_historico (op, pedido_id, dados)
  VALUES (TG_OP, OLD.id, to_jsonb(OLD));
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION log_pedido_itens_historico()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO pedido_itens_historico (op, item_id, dados)
  VALUES (TG_OP, OLD.id, to_jsonb(OLD));
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_hist ON pedidos;
CREATE TRIGGER trg_pedidos_hist
  AFTER UPDATE OR DELETE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION log_pedidos_historico();

DROP TRIGGER IF EXISTS trg_pedido_itens_hist ON pedido_itens;
CREATE TRIGGER trg_pedido_itens_hist
  AFTER UPDATE OR DELETE ON pedido_itens
  FOR EACH ROW EXECUTE FUNCTION log_pedido_itens_historico();

-- Poda diária: manter 60 dias (respeita o limite de 500MB do free tier)
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION podar_historico()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM pedidos_historico       WHERE registrado_em < now() - interval '60 days';
  DELETE FROM pedido_itens_historico  WHERE registrado_em < now() - interval '60 days';
$$;

SELECT cron.schedule('podar-historico', '0 4 * * *', 'SELECT podar_historico()');
```

- [ ] **Step 2: Aplicar e verificar triggers + cron**

```sql
SELECT tgname FROM pg_trigger WHERE tgname IN ('trg_pedidos_hist','trg_pedido_itens_hist');
SELECT jobname, schedule FROM cron.job WHERE jobname = 'podar-historico';
```

Esperado: 2 triggers; 1 job `podar-historico | 0 4 * * *`.

- [ ] **Step 3: Teste manual do histórico**

```sql
-- pegue um pedido_itens existente, atualize e confirme que a linha anterior foi logada
UPDATE pedido_itens SET qtd = qtd WHERE id = (SELECT id FROM pedido_itens LIMIT 1);
SELECT count(*) FROM pedido_itens_historico;
```

Esperado: count ≥ 1.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/023_historico_append_only.sql
git commit -m "feat(db): append-only history + pg_cron prune as data-loss safety net"
```

---

## Verificação final (end-to-end)

- [ ] **Cenário 1 — F5 não perde quantidades:** preencher, ✓ Salvo, F5 → dados voltam.
- [ ] **Cenário 2 — organizador não sobrescreve loja:** loja preenche em paralelo, organizador Gera PDFs → fill da loja preservado.
- [ ] **Cenário 3 — falha visível:** desligar rede, digitar → "⚠ Falha ao salvar"; religar, "tentar de novo" → "✓ Salvo".
- [ ] **Cenário 4 — aviso ao sair:** digitar e fechar aba antes de salvar → aviso do navegador.
- [ ] **Cenário 5 — manutenção:** ligar flag → faixa aparece, gravação bloqueada.
- [ ] **Cenário 6 — histórico:** após edições, `pedido_itens_historico` tem registros.
- [ ] **Deploy:** `git push` (o deploy Cloudflare/Vercel publica `main`).

---

## Push final

```bash
git push
```

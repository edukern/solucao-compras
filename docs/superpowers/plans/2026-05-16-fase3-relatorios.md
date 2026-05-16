# Fase 3 — Tela de Relatórios: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Relatórios" screen with two functional report types — Por Fornecedor (list → detail) and Por Segmentação (filter → list → detail) — converging on the same supplier detail view with projection vs. purchased breakdown.

**Architecture:** Shell component (`Relatorios.jsx`) holds all navigation state (active sub-report, selected supplier, segment filter) and passes it down as props. Two sub-reports live in `src/renderer/src/screens/relatorios/`. Two new DB methods are added to `pedidos.js` and wired through IPC + preload with no schema changes.

**Tech Stack:** React 18 + CSS Modules + better-sqlite3 (via existing IPC pattern) + Vitest for DB-layer tests.

---

### Task 1: DB — add `totaisPorFornecedor` and `itensPorFornecedor`

**Files:**
- Modify: `electron/main/db/pedidos.js`
- Test: `tests/pedidos.test.js`

- [ ] **Step 1: Write the failing tests**

Add at the bottom of `tests/pedidos.test.js` (keep existing tests intact):

```js
describe('totaisPorFornecedor', () => {
  it('returns suppliers with order totals for a collection', () => {
    const seg2Id = seg.create({ classificacao: 'EX', tipo_produto: 'CALCA', classe: 'MASC', estacao: 'VERAO' })
    const forn2Id = forn.create({ nome: 'XYZ', contato: '' })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }, { tamanho: 'M', qtd_pedida: 20 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: seg2Id,
      data_pedido: '2026-05-16', valor_unitario: 80.00,
      itens: [{ tamanho: 'P', qtd_pedida: 5 }]
    })
    ped.salvar({ fornecedor_id: forn2Id, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 60.00,
      itens: [{ tamanho: 'G', qtd_pedida: 15 }]
    })
    const rows = ped.totaisPorFornecedor(colId)
    expect(rows).toHaveLength(2)
    const abc = rows.find(r => r.fornecedor_id === fornId)
    expect(abc.num_skus).toBe(2)
    expect(abc.total_pecas).toBe(35)
    expect(abc.total_valor).toBeCloseTo(10*50 + 20*50 + 5*80)
    const xyz = rows.find(r => r.fornecedor_id === forn2Id)
    expect(xyz.num_skus).toBe(1)
    expect(xyz.total_pecas).toBe(15)
  })

  it('filters by segmentacao_id when segId is provided', () => {
    const seg2Id = seg.create({ classificacao: 'EX', tipo_produto: 'CALCA', classe: 'MASC', estacao: 'VERAO' })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: seg2Id,
      data_pedido: '2026-05-16', valor_unitario: 80.00,
      itens: [{ tamanho: 'M', qtd_pedida: 5 }]
    })
    const rows = ped.totaisPorFornecedor(colId, segId)
    expect(rows).toHaveLength(1)
    expect(rows[0].total_pecas).toBe(10)
  })

  it('returns empty array when collection has no orders', () => {
    const rows = ped.totaisPorFornecedor(colId)
    expect(rows).toHaveLength(0)
  })
})

describe('itensPorFornecedor', () => {
  it('returns segmentacoes with comprado totals for a supplier in a collection', () => {
    const seg2Id = seg.create({ classificacao: 'EX', tipo_produto: 'CALCA', classe: 'MASC', estacao: 'VERAO' })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }, { tamanho: 'M', qtd_pedida: 20 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: seg2Id,
      data_pedido: '2026-05-16', valor_unitario: 80.00,
      itens: [{ tamanho: 'P', qtd_pedida: 5 }]
    })
    const rows = ped.itensPorFornecedor(fornId, colId)
    expect(rows).toHaveLength(2)
    const ad = rows.find(r => r.segmentacao_id === segId)
    expect(ad.classificacao).toBe('AD')
    expect(ad.tipo_produto).toBe('BERMUDA')
    expect(ad.classe).toBe('FEM')
    expect(ad.total_comprado).toBe(30)
    const ex = rows.find(r => r.segmentacao_id === seg2Id)
    expect(ex.total_comprado).toBe(5)
  })

  it('accumulates across multiple order dates for same supplier+seg', () => {
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-10', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 15 }]
    })
    const rows = ped.itensPorFornecedor(fornId, colId)
    expect(rows).toHaveLength(1)
    expect(rows[0].total_comprado).toBe(25)
  })

  it('returns empty array for supplier with no orders in that collection', () => {
    const rows = ped.itensPorFornecedor(fornId, colId)
    expect(rows).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
npm test -- tests/pedidos.test.js
```

Expected: new tests FAIL with `ped.totaisPorFornecedor is not a function` (or similar).

- [ ] **Step 3: Implement the two DB methods**

Replace the contents of `electron/main/db/pedidos.js` with:

```js
export function makePedidos(db) {
  const insertItem = db.prepare(`
    INSERT INTO pedidos (fornecedor_id, colecao_id, segmentacao_id, data_pedido, tamanho, qtd_pedida, valor_unitario)
    VALUES (@fornecedor_id, @colecao_id, @segmentacao_id, @data_pedido, @tamanho, @qtd_pedida, @valor_unitario)
  `)

  const saveAll = db.transaction((base, itens) => {
    for (const item of itens) {
      insertItem.run({ ...base, ...item })
    }
  })

  const totaisBySegCol = db.prepare(`
    SELECT tamanho, SUM(qtd_pedida) AS total_pedido
    FROM pedidos WHERE segmentacao_id = ? AND colecao_id = ?
    GROUP BY tamanho
  `)

  const byColecao = db.prepare(`SELECT * FROM pedidos WHERE colecao_id = ? ORDER BY data_pedido DESC`)

  const visitas = db.prepare(`
    SELECT p.fornecedor_id, f.nome AS fornecedor_nome, p.data_pedido,
           SUM(p.qtd_pedida) AS total_pecas,
           SUM(p.qtd_pedida * p.valor_unitario) AS total_valor
    FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id
    WHERE p.colecao_id = ?
    GROUP BY p.fornecedor_id, p.data_pedido
    ORDER BY p.data_pedido DESC
  `)

  const totaisForn = db.prepare(`
    SELECT f.id AS fornecedor_id, f.nome AS fornecedor_nome,
           COUNT(DISTINCT p.segmentacao_id) AS num_skus,
           SUM(p.qtd_pedida) AS total_pecas,
           SUM(p.qtd_pedida * p.valor_unitario) AS total_valor
    FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id
    WHERE p.colecao_id = ?
    GROUP BY p.fornecedor_id ORDER BY f.nome
  `)

  const totaisFornBySeg = db.prepare(`
    SELECT f.id AS fornecedor_id, f.nome AS fornecedor_nome,
           COUNT(DISTINCT p.segmentacao_id) AS num_skus,
           SUM(p.qtd_pedida) AS total_pecas,
           SUM(p.qtd_pedida * p.valor_unitario) AS total_valor
    FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id
    WHERE p.colecao_id = ? AND p.segmentacao_id = ?
    GROUP BY p.fornecedor_id ORDER BY f.nome
  `)

  const itensForn = db.prepare(`
    SELECT s.id AS segmentacao_id,
           s.classificacao, s.tipo_produto, s.classe,
           SUM(p.qtd_pedida) AS total_comprado
    FROM pedidos p JOIN segmentacoes s ON s.id = p.segmentacao_id
    WHERE p.fornecedor_id = ? AND p.colecao_id = ?
    GROUP BY p.segmentacao_id
    ORDER BY s.classificacao, s.tipo_produto, s.classe
  `)

  return {
    salvar({ fornecedor_id, colecao_id, segmentacao_id, data_pedido, valor_unitario, itens }) {
      saveAll({ fornecedor_id, colecao_id, segmentacao_id, data_pedido, valor_unitario }, itens)
    },
    getTotaisPorTamanho(segId, colId) {
      return totaisBySegCol.all(segId, colId)
    },
    listarPorColecao(colId) {
      return byColecao.all(colId)
    },
    listarVisitas(colId) {
      return visitas.all(colId)
    },
    totaisPorFornecedor(colId, segId = null) {
      return segId !== null ? totaisFornBySeg.all(colId, segId) : totaisForn.all(colId)
    },
    itensPorFornecedor(fornId, colId) {
      return itensForn.all(fornId, colId)
    }
  }
}
```

- [ ] **Step 4: Run tests to verify all pass**

```
npm test -- tests/pedidos.test.js
```

Expected: all tests PASS (original 4 + new 6 = 10 total in pedidos suite).

- [ ] **Step 5: Run full test suite to check for regressions**

```
npm test
```

Expected: all 38+ tests PASS.

- [ ] **Step 6: Commit**

```
git add electron/main/db/pedidos.js tests/pedidos.test.js
git commit -m "feat: add totaisPorFornecedor and itensPorFornecedor DB methods"
```

---

### Task 2: IPC + preload wiring

**Files:**
- Modify: `electron/main/index.js`
- Modify: `electron/preload/index.js`

- [ ] **Step 1: Add IPC handlers in `electron/main/index.js`**

Find the `// Pedidos` block and add two lines after the existing handlers:

```js
  // Pedidos
  ipcMain.handle('pedidos:salvar',                (_, d)           => ped.salvar(d))
  ipcMain.handle('pedidos:totaisPorTamanho',      (_, segId, colId) => ped.getTotaisPorTamanho(segId, colId))
  ipcMain.handle('pedidos:listarVisitas',         (_, colId)        => ped.listarVisitas(colId))
  ipcMain.handle('pedidos:listarPorColecao',      (_, colId)        => ped.listarPorColecao(colId))
  ipcMain.handle('pedidos:totaisPorFornecedor',   (_, colId, segId) => ped.totaisPorFornecedor(colId, segId ?? null))
  ipcMain.handle('pedidos:itensPorFornecedor',    (_, fornId, colId) => ped.itensPorFornecedor(fornId, colId))
```

- [ ] **Step 2: Add preload entries in `electron/preload/index.js`**

Inside the `pedidos:` object, add two entries:

```js
  pedidos: {
    salvar:                (d)            => ipcRenderer.invoke('pedidos:salvar', d),
    totaisPorTamanho:      (segId, colId) => ipcRenderer.invoke('pedidos:totaisPorTamanho', segId, colId),
    listarVisitas:         (colId)        => ipcRenderer.invoke('pedidos:listarVisitas', colId),
    listarPorColecao:      (colId)        => ipcRenderer.invoke('pedidos:listarPorColecao', colId),
    totaisPorFornecedor:   (colId, segId) => ipcRenderer.invoke('pedidos:totaisPorFornecedor', colId, segId),
    itensPorFornecedor:    (fornId, colId) => ipcRenderer.invoke('pedidos:itensPorFornecedor', fornId, colId),
  },
```

- [ ] **Step 3: Run full test suite (IPC layer is not unit-tested but ensure no breakage)**

```
npm test
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```
git add electron/main/index.js electron/preload/index.js
git commit -m "feat: expose totaisPorFornecedor and itensPorFornecedor via IPC"
```

---

### Task 3: App routing — Sidebar + App.jsx

**Files:**
- Modify: `src/renderer/src/components/Sidebar.jsx`
- Modify: `src/renderer/src/App.jsx`

- [ ] **Step 1: Add `relatorios` to NAV_ITEMS in Sidebar.jsx**

Replace the `NAV_ITEMS` array:

```js
const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '◉' },
  { id: 'planejamento', label: 'Planejamento', icon: '🎯' },
  { id: 'compras',      label: 'Compras',      icon: '🛍️' },
  { id: 'relatorios',   label: 'Relatórios',   icon: '📊' },
]
```

- [ ] **Step 2: Add `relatorios` screen to App.jsx**

Replace the import block and SCREENS object:

```js
import { useState, useEffect } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'
import Relatorios from './screens/Relatorios'

const SCREENS = {
  dashboard:    () => <Dashboard />,
  planejamento: () => <Planejamento />,
  compras:      () => <Compras />,
  relatorios:   () => <Relatorios />,
}
```

- [ ] **Step 3: Commit (file won't compile yet — Relatorios.jsx doesn't exist, but that's fine for a WIP commit after next task)**

Skip commit here — commit together with Task 4.

---

### Task 4: Relatorios.jsx shell + CSS

**Files:**
- Create: `src/renderer/src/screens/Relatorios.jsx`
- Create: `src/renderer/src/screens/Relatorios.module.css`

- [ ] **Step 1: Create `Relatorios.module.css`**

```css
.container {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  width: 180px;
  min-width: 180px;
  border-right: 1px solid var(--border);
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--bg-secondary);
}

.sidebarBtn {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 0;
  transition: background 0.15s, color 0.15s;
}

.sidebarBtn:hover:not(.disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebarBtn.active {
  background: var(--accent-subtle);
  color: var(--accent);
  font-weight: 600;
}

.sidebarBtn.disabled {
  opacity: 0.4;
  cursor: default;
}

.soon {
  font-size: 0.65rem;
  color: var(--text-muted);
  margin-left: 4px;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 1.5rem;
}
```

- [ ] **Step 2: Create `Relatorios.jsx`**

```jsx
import { useState } from 'react'
import PorFornecedor from './relatorios/PorFornecedor'
import PorSegmentacao from './relatorios/PorSegmentacao'
import styles from './Relatorios.module.css'

const REPORTS = [
  { id: 'por_fornecedor',  label: 'Por Fornecedor',     disabled: false },
  { id: 'por_segmentacao', label: 'Por Segmentação',    disabled: false },
  { id: 'curva_abc',       label: 'Curva ABC',          disabled: true  },
  { id: 'quebra_estoque',  label: 'Quebra de Estoque',  disabled: true  },
]

export default function Relatorios() {
  const [activeReport, setActiveReport] = useState('por_fornecedor')
  const [selectedForn, setSelectedForn] = useState(null)   // { id, nome }
  const [segFilter,    setSegFilter]    = useState(null)   // { segId, classificacao, tipo_produto, classe }

  function handleSelectFornFromSeg(forn, seg) {
    setSelectedForn(forn)
    setSegFilter(seg)
    setActiveReport('por_fornecedor')
  }

  function handleClearSegFilter() {
    setSegFilter(null)
  }

  function handleClearForn() {
    setSelectedForn(null)
    setSegFilter(null)
  }

  function handleSwitchReport(id) {
    if (id === activeReport) return
    setActiveReport(id)
    setSelectedForn(null)
    setSegFilter(null)
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        {REPORTS.map(r => (
          <button
            key={r.id}
            className={[
              styles.sidebarBtn,
              activeReport === r.id ? styles.active : '',
              r.disabled ? styles.disabled : '',
            ].join(' ')}
            onClick={() => !r.disabled && handleSwitchReport(r.id)}
          >
            {r.label}
            {r.disabled && <span className={styles.soon}>Em breve</span>}
          </button>
        ))}
      </aside>

      <div className={styles.content}>
        {activeReport === 'por_fornecedor' && (
          <PorFornecedor
            selectedForn={selectedForn}
            segFilter={segFilter}
            onSelectForn={forn => setSelectedForn(forn)}
            onClearForn={handleClearForn}
            onClearSegFilter={handleClearSegFilter}
          />
        )}
        {activeReport === 'por_segmentacao' && (
          <PorSegmentacao onSelectForn={handleSelectFornFromSeg} />
        )}
        {activeReport === 'curva_abc' && (
          <p style={{ color: 'var(--text-secondary)' }}>Em breve.</p>
        )}
        {activeReport === 'quebra_estoque' && (
          <p style={{ color: 'var(--text-secondary)' }}>Em breve.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create placeholder sub-report files so the app compiles**

Create `src/renderer/src/screens/relatorios/PorFornecedor.jsx`:

```jsx
export default function PorFornecedor() {
  return <p>Por Fornecedor — em construção</p>
}
```

Create `src/renderer/src/screens/relatorios/PorSegmentacao.jsx`:

```jsx
export default function PorSegmentacao() {
  return <p>Por Segmentação — em construção</p>
}
```

- [ ] **Step 4: Verify the app compiles and the Relatórios nav item appears**

Run `npm run dev` and click "Relatórios" in the sidebar. Both placeholder texts should render. Stop the dev server.

- [ ] **Step 5: Commit**

```
git add src/renderer/src/screens/Relatorios.jsx src/renderer/src/screens/Relatorios.module.css
git add src/renderer/src/screens/relatorios/PorFornecedor.jsx src/renderer/src/screens/relatorios/PorSegmentacao.jsx
git add src/renderer/src/components/Sidebar.jsx src/renderer/src/App.jsx
git commit -m "feat: add Relatorios shell with internal sidebar and nav routing"
```

---

### Task 5: PorFornecedor.jsx — list + detail views

**Files:**
- Modify: `src/renderer/src/screens/relatorios/PorFornecedor.jsx`
- Create: `src/renderer/src/screens/relatorios/PorFornecedor.module.css`

This component receives from `Relatorios.jsx`:
- `selectedForn` — `{ id, nome }` or `null` (null = show list)
- `segFilter` — `{ segId, classificacao, tipo_produto, classe }` or `null`
- `onSelectForn(forn)` — called when user clicks a row in list
- `onClearForn()` — called when user clicks ← back in detail
- `onClearSegFilter()` — called when user clicks "Ver todas as segmentações" in detail

- [ ] **Step 1: Create `PorFornecedor.module.css`**

```css
/* List view */
.searchBar {
  width: 100%;
  max-width: 340px;
  margin-bottom: 1rem;
  padding: 0.45rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  border-bottom: 2px solid var(--accent);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.table tbody tr:hover {
  background: var(--bg-hover);
  cursor: pointer;
}

.numCol {
  text-align: right;
  color: var(--text-secondary);
}

.empty {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* Detail view */
.detailHeader {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.backBtn {
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.35rem 0.65rem;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
}

.backBtn:hover {
  color: var(--text-primary);
  border-color: var(--accent);
}

.detailTitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.detailTotals {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.clearSegBtn {
  margin-left: auto;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.3rem 0.65rem;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
}

.clearSegBtn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.pills {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.pill {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: background 0.12s, color 0.12s;
}

.pill.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  max-width: 480px;
}

.card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.cardLabel {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.cardValue {
  font-size: 1.25rem;
  font-weight: 700;
}

.cardValue.proj   { color: var(--color-proj, #a78bfa); }
.cardValue.bought { color: var(--color-bought, #34d399); }
.cardValue.saldo  { color: var(--color-saldo, #fbbf24); }

.groupSep {
  padding: 0.4rem 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.pctGood { color: var(--color-bought, #34d399); }
.pctWarn { color: var(--color-saldo, #fbbf24); }
```

- [ ] **Step 2: Implement `PorFornecedor.jsx` — list view**

Replace the placeholder file:

```jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useCollection } from '../../contexts/CollectionContext'
import styles from './PorFornecedor.module.css'

export default function PorFornecedor({ selectedForn, segFilter, onSelectForn, onClearForn, onClearSegFilter }) {
  const { active } = useCollection()

  const [list,   setList]   = useState([])
  const [search, setSearch] = useState('')

  const [items,      setItems]      = useState([])   // itensPorFornecedor rows
  const [projecoes,  setProjecoes]  = useState({})   // { [segId]: totalProjetado }
  const [activePills, setActivePills] = useState({ class: new Set(), tipo: new Set() })

  // Load list
  useEffect(() => {
    if (!active) return
    window.api.pedidos.totaisPorFornecedor(active.id).then(setList)
  }, [active?.id])

  // Load detail
  const loadDetail = useCallback(async (fornId, colId) => {
    const rows = await window.api.pedidos.itensPorFornecedor(fornId, colId)
    setItems(rows)
    const projMap = {}
    await Promise.all(rows.map(async r => {
      const proj = await window.api.projecoes.get(r.segmentacao_id, colId)
      projMap[r.segmentacao_id] = proj.reduce((s, p) => s + p.qtd_ajustada, 0)
    }))
    setProjecoes(projMap)
    // Initialize pills: all active, or pre-filter from segFilter
    const classes = new Set(rows.map(r => r.classificacao))
    const tipos   = new Set(rows.map(r => r.tipo_produto))
    setActivePills({ class: classes, tipo: tipos })
  }, [])

  useEffect(() => {
    if (!selectedForn || !active) return
    loadDetail(selectedForn.id, active.id)
  }, [selectedForn?.id, active?.id, loadDetail])

  // Apply segFilter after items load
  useEffect(() => {
    if (!segFilter || items.length === 0) return
    setActivePills({
      class: new Set([segFilter.classificacao]),
      tipo:  new Set([segFilter.tipo_produto]),
    })
  }, [segFilter, items])

  const filteredList = useMemo(() => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(r => r.fornecedor_nome.toLowerCase().includes(q))
  }, [list, search])

  const allClasses = useMemo(() => [...new Set(items.map(r => r.classificacao))].sort(), [items])
  const allTipos   = useMemo(() => [...new Set(items.map(r => r.tipo_produto))].sort(), [items])

  const filteredItems = useMemo(() => {
    return items.filter(r => activePills.class.has(r.classificacao) && activePills.tipo.has(r.tipo_produto))
  }, [items, activePills])

  function togglePill(set, value) {
    setActivePills(prev => {
      const next = new Set(prev[set])
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, [set]: next }
    })
  }

  // Summary totals (filtered)
  const totalProj    = filteredItems.reduce((s, r) => s + (projecoes[r.segmentacao_id] ?? 0), 0)
  const totalComprado = filteredItems.reduce((s, r) => s + r.total_comprado, 0)
  const totalSaldo   = Math.max(0, totalProj - totalComprado)

  // Group filtered items: classificacao → tipo → [rows]
  const grouped = useMemo(() => {
    const map = new Map()
    for (const r of filteredItems) {
      const key = `${r.classificacao}|${r.tipo_produto}`
      if (!map.has(key)) map.set(key, { classificacao: r.classificacao, tipo_produto: r.tipo_produto, rows: [] })
      map.get(key).rows.push(r)
    }
    return [...map.values()].sort((a, b) =>
      a.classificacao.localeCompare(b.classificacao) || a.tipo_produto.localeCompare(b.tipo_produto)
    )
  }, [filteredItems])

  if (!active) return <p className={styles.empty}>Selecione uma coleção ativa.</p>

  // ── DETAIL VIEW ───────────────────────────────────────────────
  if (selectedForn) {
    return (
      <div>
        <div className={styles.detailHeader}>
          <button className={styles.backBtn} onClick={onClearForn}>← Voltar</button>
          <span className={styles.detailTitle}>{selectedForn.nome}</span>
          <span className={styles.detailTotals}>
            {filteredItems.length} SKUs · {totalComprado} pç
          </span>
          {segFilter && (
            <button className={styles.clearSegBtn} onClick={onClearSegFilter}>
              Ver todas as segmentações
            </button>
          )}
        </div>

        <div className={styles.pills}>
          {allClasses.map(c => (
            <button
              key={c}
              className={`${styles.pill} ${activePills.class.has(c) ? styles.active : ''}`}
              onClick={() => togglePill('class', c)}
            >
              {c}
            </button>
          ))}
          {allTipos.map(t => (
            <button
              key={t}
              className={`${styles.pill} ${activePills.tipo.has(t) ? styles.active : ''}`}
              onClick={() => togglePill('tipo', t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Projeção</div>
            <div className={`${styles.cardValue} ${styles.proj}`}>{totalProj}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Comprado</div>
            <div className={`${styles.cardValue} ${styles.bought}`}>{totalComprado}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Saldo</div>
            <div className={`${styles.cardValue} ${styles.saldo}`}>{totalSaldo}</div>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Segmentação</th>
              <th className={styles.numCol}>Projeção</th>
              <th className={styles.numCol}>Comprado</th>
              <th className={styles.numCol}>Saldo</th>
              <th className={styles.numCol}>%</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map(g => {
              const groupProj    = g.rows.reduce((s, r) => s + (projecoes[r.segmentacao_id] ?? 0), 0)
              const groupComprado = g.rows.reduce((s, r) => s + r.total_comprado, 0)
              const groupSaldo   = Math.max(0, groupProj - groupComprado)
              const groupPct     = groupProj > 0 ? Math.min(100, Math.round(groupComprado / groupProj * 100)) : 0
              return (
                <>
                  <tr key={`sep-${g.classificacao}-${g.tipo_produto}`}>
                    <td colSpan={5} className={styles.groupSep}>
                      {g.classificacao} — {g.tipo_produto}
                    </td>
                  </tr>
                  {g.rows.map(r => {
                    const proj    = projecoes[r.segmentacao_id] ?? 0
                    const saldo   = Math.max(0, proj - r.total_comprado)
                    const pct     = proj > 0 ? Math.min(100, Math.round(r.total_comprado / proj * 100)) : 0
                    return (
                      <tr key={r.segmentacao_id}>
                        <td>{r.classe}</td>
                        <td className={styles.numCol}>{proj}</td>
                        <td className={styles.numCol}>{r.total_comprado}</td>
                        <td className={styles.numCol}>{saldo}</td>
                        <td className={`${styles.numCol} ${pct >= 80 ? styles.pctGood : styles.pctWarn}`}>{pct}%</td>
                      </tr>
                    )
                  })}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // ── LIST VIEW ─────────────────────────────────────────────────
  return (
    <div>
      <input
        type="search"
        className={styles.searchBar}
        placeholder="Buscar fornecedor…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filteredList.length === 0 ? (
        <p className={styles.empty}>Nenhum fornecedor com pedidos nesta coleção.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th className={styles.numCol}>SKUs</th>
              <th className={styles.numCol}>Peças</th>
              <th className={styles.numCol}>Valor total</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map(r => (
              <tr key={r.fornecedor_id} onClick={() => onSelectForn({ id: r.fornecedor_id, nome: r.fornecedor_nome })}>
                <td>{r.fornecedor_nome}</td>
                <td className={styles.numCol}>{r.num_skus}</td>
                <td className={styles.numCol}>{r.total_pecas}</td>
                <td className={styles.numCol}>
                  {r.total_valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```
git add src/renderer/src/screens/relatorios/PorFornecedor.jsx src/renderer/src/screens/relatorios/PorFornecedor.module.css
git commit -m "feat: implement PorFornecedor list and detail views"
```

---

### Task 6: PorSegmentacao.jsx — filter + supplier list

**Files:**
- Modify: `src/renderer/src/screens/relatorios/PorSegmentacao.jsx`
- Create: `src/renderer/src/screens/relatorios/PorSegmentacao.module.css`

This component receives:
- `onSelectForn(forn, seg)` — called with `{ id, nome }` and `{ segId, classificacao, tipo_produto, classe }` when user clicks a supplier

- [ ] **Step 1: Create `PorSegmentacao.module.css`**

```css
.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.filters select {
  padding: 0.45rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 140px;
}

.filters select:disabled {
  opacity: 0.5;
}

.hint {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  border-bottom: 2px solid var(--accent);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.table tbody tr:hover {
  background: var(--bg-hover);
  cursor: pointer;
}

.numCol {
  text-align: right;
  color: var(--text-secondary);
}
```

- [ ] **Step 2: Implement `PorSegmentacao.jsx`**

Replace the placeholder file:

```jsx
import { useState, useEffect, useMemo } from 'react'
import { useCollection } from '../../contexts/CollectionContext'
import styles from './PorSegmentacao.module.css'

export default function PorSegmentacao({ onSelectForn }) {
  const { active } = useCollection()

  const [segs,     setSegs]     = useState([])
  const [selClass, setSelClass] = useState('')
  const [selTipo,  setSelTipo]  = useState('')
  const [selClasse, setSelClasse] = useState('')
  const [results,  setResults]  = useState([])

  useEffect(() => {
    window.api.segmentacoes.list().then(setSegs)
  }, [])

  const classificacoes = useMemo(() => [...new Set(segs.map(s => s.classificacao))].sort(), [segs])
  const tipos  = useMemo(() =>
    [...new Set(segs.filter(s => s.classificacao === selClass).map(s => s.tipo_produto))].sort(),
    [segs, selClass]
  )
  const classes = useMemo(() =>
    [...new Set(segs.filter(s => s.classificacao === selClass && s.tipo_produto === selTipo).map(s => s.classe))].sort(),
    [segs, selClass, selTipo]
  )

  const selectedSeg = useMemo(() =>
    segs.find(s => s.classificacao === selClass && s.tipo_produto === selTipo && s.classe === selClasse) ?? null,
    [segs, selClass, selTipo, selClasse]
  )

  useEffect(() => {
    if (!active || !selectedSeg) { setResults([]); return }
    window.api.pedidos.totaisPorFornecedor(active.id, selectedSeg.id).then(setResults)
  }, [active?.id, selectedSeg?.id])

  function handleClass(v)  { setSelClass(v); setSelTipo(''); setSelClasse('') }
  function handleTipo(v)   { setSelTipo(v);  setSelClasse('') }

  const hasFilter = selClass !== ''

  return (
    <div>
      <div className={styles.filters}>
        <select value={selClass} onChange={e => handleClass(e.target.value)}>
          <option value="">Classificação</option>
          {classificacoes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selTipo} onChange={e => handleTipo(e.target.value)} disabled={!selClass}>
          <option value="">Tipo de produto</option>
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={selClasse} onChange={e => setSelClasse(e.target.value)} disabled={!selTipo}>
          <option value="">Classe</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {!hasFilter && (
        <p className={styles.hint}>Selecione uma segmentação para ver os fornecedores.</p>
      )}

      {hasFilter && results.length === 0 && selectedSeg && (
        <p className={styles.hint}>Nenhum fornecedor com pedidos para essa segmentação.</p>
      )}

      {results.length > 0 && selectedSeg && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th className={styles.numCol}>SKUs</th>
              <th className={styles.numCol}>Peças</th>
            </tr>
          </thead>
          <tbody>
            {results.map(r => (
              <tr
                key={r.fornecedor_id}
                onClick={() => onSelectForn(
                  { id: r.fornecedor_id, nome: r.fornecedor_nome },
                  { segId: selectedSeg.id, classificacao: selectedSeg.classificacao,
                    tipo_produto: selectedSeg.tipo_produto, classe: selectedSeg.classe }
                )}
              >
                <td>{r.fornecedor_nome}</td>
                <td className={styles.numCol}>{r.num_skus}</td>
                <td className={styles.numCol}>{r.total_pecas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```
git add src/renderer/src/screens/relatorios/PorSegmentacao.jsx src/renderer/src/screens/relatorios/PorSegmentacao.module.css
git commit -m "feat: implement PorSegmentacao filter and supplier list"
```

---

### Task 7: End-to-end smoke test

**Files:** none (manual verification)

- [ ] **Step 1: Start dev server**

```
npm run dev
```

- [ ] **Step 2: Test Por Fornecedor — list → detail**

1. Navigate to "Relatórios" in the sidebar
2. "Por Fornecedor" should be active by default
3. If there are orders in the active collection: a table of suppliers appears with SKUs, peças, valor total
4. Click a supplier row: detail view opens with supplier name in the header, summary cards, grouped table
5. Pills for classificação/tipo appear; clicking one deselects it and removes those rows from the table + recalculates cards
6. Click "← Voltar": returns to list view

- [ ] **Step 3: Test Por Segmentação → detail with pre-filter**

1. Click "Por Segmentação" in internal sidebar
2. Message "Selecione uma segmentação para ver os fornecedores." appears
3. Select Classificação → Tipo → Classe: supplier list appears
4. Click a supplier: navigates to Por Fornecedor detail with only the matching classificação+tipo pill active
5. "Ver todas as segmentações" button appears; clicking it activates all pills

- [ ] **Step 4: Test Curva ABC and Quebra de Estoque placeholders**

Click both: they should appear grayed out with "Em breve" labels and show "Em breve." in the content area without error.

- [ ] **Step 5: Run full test suite one final time**

```
npm test
```

Expected: all tests PASS.

- [ ] **Step 6: Final commit if any adjustments were made during smoke test**

```
git add -p
git commit -m "fix: smoke test adjustments for Relatorios screen"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Nova rota `relatorios` no Sidebar + App.jsx | Task 3 |
| Sidebar interna com 4 tipos | Task 4 |
| Curva ABC + Quebra de Estoque desabilitados com "Em breve" | Task 4 |
| Por Fornecedor: lista com search bar + nome · SKUs · peças · valor | Task 5 |
| Por Fornecedor: detalhe com pills filtro (classificação + tipo) | Task 5 |
| Por Fornecedor: cards projeção / comprado / saldo | Task 5 |
| Por Fornecedor: tabela agrupada por CLASSIFICAÇÃO — TIPO | Task 5 |
| Fórmulas: Saldo = max(0, proj−compr), % = min(100, round(compr/proj×100)) | Task 5 |
| Por Segmentação: filtros em cascata (3 selects) | Task 6 |
| Por Segmentação: lista fornecedores (nome · SKUs · peças) | Task 6 |
| Navegação PorSegmentacao → PorFornecedor com filtro pré-aplicado | Tasks 4+5+6 |
| Botão "Ver todas as segmentações" remove filtro | Task 5 |
| DB: totaisPorFornecedor + itensPorFornecedor | Task 1 |
| IPC + preload novos canais | Task 2 |

**Placeholder scan:** No TBDs or incomplete sections found.

**Type consistency:** `selectedForn` shape `{ id, nome }` used consistently in Tasks 4 and 5. `segFilter` shape `{ segId, classificacao, tipo_produto, classe }` used consistently in Tasks 4, 5, and 6. DB method names (`totaisPorFornecedor`, `itensPorFornecedor`) consistent across Tasks 1, 2, and renderer calls in Tasks 5 and 6.

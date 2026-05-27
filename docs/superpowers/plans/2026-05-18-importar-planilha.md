# Importar Planilha Histórica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the user to import Miche's historical Excel spreadsheet (`ANALISE DE INVERNO.xlsx`) into the `grade_historica` SQLite table so the app can compute buying projections.

**Architecture:** A new `electron/main/importar.js` module handles all parsing and orchestration (pure functions, no file I/O in the hot path so they are unit-testable). An `importBatch` transaction is added to `grades.js` for efficient bulk upserts. A `grades:importar` IPC handler wires everything to the renderer. A collapsible section in `Planejamento.jsx` exposes the UI: the user picks the target coleção, selects a file, and sees a brief success/error summary.

**Tech Stack:** Electron + React + Vite (electron-vite), better-sqlite3, SheetJS (`xlsx` — already a devDependency at v0.18.5, needs promoting to `dependencies` for the packaged app), Vitest for unit tests.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `electron/main/importar.js` | Parse xlsx buffer → product blocks; orchestrate DB writes |
| Create | `tests/importar.test.js` | Unit tests for parser (no file I/O, no DB) |
| Modify | `electron/main/db/grades.js` | Add `importBatch(items)` transaction |
| Modify | `electron/main/index.js` | Add `grades:importar` IPC handler + import statement |
| Modify | `electron/preload/index.js` | Expose `window.api.grades.importar` |
| Modify | `src/renderer/src/screens/Planejamento.jsx` | Import UI section (state + handler + JSX) |
| Modify | `src/renderer/src/screens/Planejamento.module.css` | CSS for import section |
| Modify | `package.json` | Move `xlsx` from `devDependencies` to `dependencies` |

---

## Task 1: Move `xlsx` to production dependencies

**Files:**
- Modify: `package.json`

`xlsx` is currently in `devDependencies`. The main process (which runs in the packaged Electron app, not just in dev) needs it at runtime. It must live in `dependencies`.

- [ ] **Step 1: Edit `package.json`**

Remove `"xlsx": "^0.18.5"` from `devDependencies` and add it to `dependencies`:

```json
"dependencies": {
  "@electron-toolkit/preload": "^3.0.1",
  "@electron-toolkit/utils": "^3.0.0",
  "@supabase/supabase-js": "^2.105.4",
  "better-sqlite3": "^12.10.0",
  "electron-updater": "^6.8.3",
  "xlsx": "^0.18.5"
},
```

And remove `"xlsx": "^0.18.5"` from `devDependencies`.

- [ ] **Step 2: Verify the change**

```bash
cd "C:/Users/eduke/Solução Compras"
node -e "const p = JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('dep:', p.dependencies.xlsx, 'dev:', p.devDependencies.xlsx)"
```

Expected output:
```
dep: ^0.18.5 dev: undefined
```

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: move xlsx to production dependencies"
```

---

## Task 2: Add `importBatch` to `grades.js`

**Files:**
- Modify: `electron/main/db/grades.js`

Add a single-transaction bulk upsert method. It takes an array of `{ segmentacao_id, colecao_id, rows }` objects and calls the existing `upsert` prepared statement for each row — reusing the exact same SQL that `saveMany` already uses.

- [ ] **Step 1: Write the failing test in `tests/grades.test.js`**

Open `tests/grades.test.js` and add this test inside the existing `describe('grades', ...)` block (after the last `it(...)`):

```js
it('importBatch upserts rows across multiple segmentacoes in one call', () => {
  const segId2 = seg.create({ classificacao: 'AD', tipo_produto: 'CAMISETA', classe: 'MASC', tipo_grade: 'AD', estacao: 'VERAO' })
  const colId2 = col.create({ nome: 'Inverno 2024', estacao: 'inverno', ano: 2024 }).id

  gr.importBatch([
    {
      segmentacao_id: segId,
      colecao_id: colId,
      rows: [
        { tamanho: 'P', ordem: 0, qtd_comprada: 10, qtd_vendida: 8, qtd_estoque: 2 },
        { tamanho: 'M', ordem: 1, qtd_comprada: 20, qtd_vendida: 18, qtd_estoque: 2 },
      ]
    },
    {
      segmentacao_id: segId2,
      colecao_id: colId2,
      rows: [
        { tamanho: 'G', ordem: 2, qtd_comprada: 5, qtd_vendida: 5, qtd_estoque: 0 },
      ]
    }
  ])

  const rows1 = gr.getGrade(segId, colId)
  expect(rows1).toHaveLength(2)
  expect(rows1[0].qtd_comprada).toBe(10)

  const rows2 = gr.getGrade(segId2, colId2)
  expect(rows2).toHaveLength(1)
  expect(rows2[0].tamanho).toBe('G')
})

it('importBatch upserts (overwrites) on conflict', () => {
  gr.saveGrade(segId, colId, [
    { tamanho: 'P', ordem: 0, qtd_comprada: 100, qtd_vendida: 80, qtd_estoque: 20 }
  ])
  gr.importBatch([{
    segmentacao_id: segId,
    colecao_id: colId,
    rows: [{ tamanho: 'P', ordem: 0, qtd_comprada: 999, qtd_vendida: 0, qtd_estoque: 0 }]
  }])
  const rows = gr.getGrade(segId, colId)
  expect(rows).toHaveLength(1)
  expect(rows[0].qtd_comprada).toBe(999)
})
```

- [ ] **Step 2: Run the test — expect failure**

```bash
cd "C:/Users/eduke/Solução Compras"
npx vitest run tests/grades.test.js --reporter=verbose
```

Expected: two tests fail with `gr.importBatch is not a function`.

- [ ] **Step 3: Implement `importBatch` in `electron/main/db/grades.js`**

Replace the entire file content with:

```js
export function makeGrades(db) {
  const upsert = db.prepare(`
    INSERT INTO grade_historica (segmentacao_id, colecao_id, tamanho, ordem, qtd_comprada, qtd_vendida, qtd_estoque)
    VALUES (@segmentacao_id, @colecao_id, @tamanho, @ordem, @qtd_comprada, @qtd_vendida, @qtd_estoque)
    ON CONFLICT(segmentacao_id, colecao_id, tamanho) DO UPDATE SET
      ordem = excluded.ordem,
      qtd_comprada = excluded.qtd_comprada,
      qtd_vendida = excluded.qtd_vendida,
      qtd_estoque = excluded.qtd_estoque
  `)

  const saveMany = db.transaction((segId, colId, rows) => {
    for (const r of rows) {
      upsert.run({ segmentacao_id: segId, colecao_id: colId, ...r })
    }
  })

  const importBatchTx = db.transaction((items) => {
    for (const { segmentacao_id, colecao_id, rows } of items) {
      for (const r of rows) {
        upsert.run({ segmentacao_id, colecao_id, ...r })
      }
    }
  })

  const bySegCol = db.prepare(
    `SELECT * FROM grade_historica WHERE segmentacao_id = ? AND colecao_id = ? ORDER BY ordem`
  )

  return {
    saveGrade(segId, colId, rows) {
      saveMany(segId, colId, rows)
    },
    getGrade(segId, colId) {
      return bySegCol.all(segId, colId)
    },
    importBatch(items) {
      importBatchTx(items)
    },
  }
}
```

- [ ] **Step 4: Run tests — expect all to pass**

```bash
cd "C:/Users/eduke/Solução Compras"
npx vitest run tests/grades.test.js --reporter=verbose
```

Expected: all 5 tests PASS (3 existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add electron/main/db/grades.js tests/grades.test.js
git commit -m "feat: add importBatch to grades module"
```

---

## Task 3: Create `electron/main/importar.js` (parser module)

**Files:**
- Create: `electron/main/importar.js`
- Create: `tests/importar.test.js`

The parser is a set of pure functions that operate on the raw 2D array produced by SheetJS — no file I/O in the pure functions, making them fully unit-testable. `importarPlanilha` wraps the pure functions and does the file read + DB writes.

- [ ] **Step 1: Write the test file `tests/importar.test.js`**

Create the file with the following content:

```js
import { describe, it, expect } from 'vitest'
import { parseProdutoNome, detectGrade, parsePlanilhaRows } from '../electron/main/importar.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRow(col2, nomeProduto, qtdsByCol = {}) {
  const row = new Array(73).fill(0)
  row[2] = col2
  if (nomeProduto) row[1] = nomeProduto
  for (const [col, val] of Object.entries(qtdsByCol)) {
    row[Number(col)] = val
  }
  return row
}

// Minimal fixture: 3 header rows + 1 product block (CALCA FEM, AD grade cols 24-29)
// plus a blank separator row (row index 7)
const AD_QTDS = { 24: 10, 25: 20, 26: 30, 27: 15, 28: 5, 29: 0 }
const AD_VENDA = { 24: 8,  25: 18, 26: 25, 27: 12, 28: 4, 29: 0 }
const AD_EST   = { 24: 2,  25: 2,  26: 5,  27: 3,  28: 1, 29: 0 }

const FIXTURE_ROWS = [
  new Array(73).fill(0), // row 0 — CR header
  new Array(73).fill(0), // row 1 — grade labels
  new Array(73).fill(0), // row 2 — tamanho labels
  makeRow('Compra',  'CALCA FEM', AD_QTDS),
  makeRow('Venda',   null,        AD_VENDA),
  makeRow('Estoque', null,        AD_EST),
  makeRow('Pedido',  null,        { 24: 12, 25: 24 }),
  new Array(73).fill(0), // blank separator
]

// ---------------------------------------------------------------------------
// parseProdutoNome
// ---------------------------------------------------------------------------

describe('parseProdutoNome', () => {
  it('extracts tipo_produto and classe FEM', () => {
    const r = parseProdutoNome('CALCA FEM')
    expect(r).toEqual({ tipo_produto: 'CALCA', classe: 'FEM' })
  })

  it('extracts tipo_produto with multiple words', () => {
    const r = parseProdutoNome('CALCA JE FEM')
    expect(r).toEqual({ tipo_produto: 'CALCA JE', classe: 'FEM' })
  })

  it('extracts classe MASC', () => {
    const r = parseProdutoNome('BASICA MASC')
    expect(r).toEqual({ tipo_produto: 'BASICA', classe: 'MASC' })
  })

  it('extracts classe UNI', () => {
    const r = parseProdutoNome('ROUPAO UNI')
    expect(r).toEqual({ tipo_produto: 'ROUPAO', classe: 'UNI' })
  })

  it('defaults classe to UNI when last word is not FEM/MASC/UNI', () => {
    const r = parseProdutoNome('BERMUDA')
    expect(r).toEqual({ tipo_produto: 'BERMUDA', classe: 'UNI' })
  })

  it('uppercases the input', () => {
    const r = parseProdutoNome('calca fem')
    expect(r).toEqual({ tipo_produto: 'CALCA', classe: 'FEM' })
  })

  it('returns null for falsy input', () => {
    expect(parseProdutoNome(null)).toBeNull()
    expect(parseProdutoNome('')).toBeNull()
    expect(parseProdutoNome(0)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// detectGrade
// ---------------------------------------------------------------------------

describe('detectGrade', () => {
  it('detects AD grade from cols 24-29', () => {
    const row = new Array(73).fill(0)
    row[25] = 10
    const range = detectGrade(row)
    expect(range.tipo_grade).toBe('AD')
  })

  it('detects PP grade from cols 3-7', () => {
    const row = new Array(73).fill(0)
    row[4] = 5
    const range = detectGrade(row)
    expect(range.tipo_grade).toBe('PP')
  })

  it('detects EX grade from cols 30-39', () => {
    const row = new Array(73).fill(0)
    row[35] = 3
    const range = detectGrade(row)
    expect(range.tipo_grade).toBe('EX')
  })

  it('returns null when all grade cols are zero', () => {
    const row = new Array(73).fill(0)
    // put a value in a non-grade col (e.g. col 0)
    row[0] = 99
    expect(detectGrade(row)).toBeNull()
  })

  it('returns first matching grade range when multiple have values', () => {
    const row = new Array(73).fill(0)
    row[3] = 1   // PP col
    row[25] = 2  // AD col
    // PP range comes first in GRADE_RANGES so it should win
    const range = detectGrade(row)
    expect(range.tipo_grade).toBe('PP')
  })
})

// ---------------------------------------------------------------------------
// parsePlanilhaRows
// ---------------------------------------------------------------------------

describe('parsePlanilhaRows', () => {
  it('parses a single product block correctly', () => {
    const blocks = parsePlanilhaRows(FIXTURE_ROWS)
    expect(blocks).toHaveLength(1)
    const b = blocks[0]
    expect(b.nome).toBe('CALCA FEM')
    expect(b.compraRow[24]).toBe(10)
    expect(b.vendaRow[24]).toBe(8)
    expect(b.estoqueRow[24]).toBe(2)
  })

  it('ignores the Pedido row (not exposed on block)', () => {
    const blocks = parsePlanilhaRows(FIXTURE_ROWS)
    // block has no pedidoRow property — Pedido row is skipped
    expect(blocks[0].pedidoRow).toBeUndefined()
  })

  it('skips rows that are not Compra-type', () => {
    const rowsWithJunk = [
      new Array(73).fill(0), // row 0
      new Array(73).fill(0), // row 1
      new Array(73).fill(0), // row 2
      makeRow('Subtotal', null, {}),  // junk row — no col 1 product name
      ...FIXTURE_ROWS.slice(3),
    ]
    const blocks = parsePlanilhaRows(rowsWithJunk)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].nome).toBe('CALCA FEM')
  })

  it('parses multiple product blocks', () => {
    const rows = [
      new Array(73).fill(0), // row 0
      new Array(73).fill(0), // row 1
      new Array(73).fill(0), // row 2
      makeRow('Compra',  'CALCA FEM',   { 24: 10 }),
      makeRow('Venda',   null,          { 24: 8  }),
      makeRow('Estoque', null,          { 24: 2  }),
      makeRow('Pedido',  null,          {}),
      new Array(73).fill(0),
      makeRow('Compra',  'BERMUDA MASC', { 40: 5  }),
      makeRow('Venda',   null,           { 40: 4  }),
      makeRow('Estoque', null,           { 40: 1  }),
      makeRow('Pedido',  null,           {}),
    ]
    const blocks = parsePlanilhaRows(rows)
    expect(blocks).toHaveLength(2)
    expect(blocks[1].nome).toBe('BERMUDA MASC')
    expect(blocks[1].compraRow[40]).toBe(5)
  })

  it('handles missing Venda/Estoque rows gracefully (sets them to null)', () => {
    const rows = [
      new Array(73).fill(0),
      new Array(73).fill(0),
      new Array(73).fill(0),
      makeRow('Compra', 'CALCA FEM', { 24: 10 }),
      // no Venda/Estoque rows — just another Compra immediately after
      makeRow('Compra', 'BERMUDA MASC', { 40: 5 }),
      makeRow('Venda',  null, { 40: 4 }),
      makeRow('Estoque',null, { 40: 1 }),
      makeRow('Pedido', null, {}),
    ]
    const blocks = parsePlanilhaRows(rows)
    // First block: vendaRow and estoqueRow will be null (next row is Compra, not Venda)
    expect(blocks[0].vendaRow).toBeNull()
    expect(blocks[0].estoqueRow).toBeNull()
    // Second block parses normally
    expect(blocks[1].nome).toBe('BERMUDA MASC')
  })
})
```

- [ ] **Step 2: Run the test — expect failure (module not found)**

```bash
cd "C:/Users/eduke/Solução Compras"
npx vitest run tests/importar.test.js --reporter=verbose
```

Expected: fails with `Cannot find module '../electron/main/importar.js'`.

- [ ] **Step 3: Create `electron/main/importar.js`**

Create the file with the following content:

```js
// electron/main/importar.js
import * as XLSX from 'xlsx'
import { readFileSync } from 'fs'

const GRADE_RANGES = [
  { tipo_grade: 'PP',  tamanhos: ['RN','P','M','G','GG'],                                          cols: [3,4,5,6,7] },
  { tipo_grade: 'BB',  tamanhos: ['1','2','3','4'],                                                 cols: [8,9,10,11] },
  { tipo_grade: 'INF', tamanhos: ['2','4','6','8','10','12'],                                       cols: [12,13,14,15,16,17] },
  { tipo_grade: 'JUV', tamanhos: ['10','12','14','16','18','20'],                                    cols: [18,19,20,21,22,23] },
  { tipo_grade: 'AD',  tamanhos: ['PP','P','M','G','GG','XG'],                                      cols: [24,25,26,27,28,29] },
  { tipo_grade: 'EX',  tamanhos: ['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10'],              cols: [30,31,32,33,34,35,36,37,38,39] },
  { tipo_grade: 'AD1', tamanhos: ['34','36','38','40','42','44','46','48','50','52'],                cols: [40,41,42,43,44,45,46,47,48,49] },
  { tipo_grade: 'EX1', tamanhos: ['46','48','50','52','54','56','58','60','62','64'],                cols: [50,51,52,53,54,55,56,57,58,59] },
  { tipo_grade: 'AD2', tamanhos: ['1','2','3','4','5'],                                              cols: [60,61,62,63,64] },
  { tipo_grade: 'EX2', tamanhos: ['6','7','8','9','10'],                                             cols: [65,66,67,68,69] },
  { tipo_grade: 'U',   tamanhos: ['F','M','U'],                                                      cols: [70,71,72] },
]

const GRADE_CLASSIFICACAO = {
  PP:  'PP',
  BB:  'BB',
  INF: 'INF',
  JUV: 'JUV',
  AD:  'AD', AD1: 'AD',  AD2: 'AD',
  EX:  'EX', EX1: 'EX',  EX2: 'EX',
  U:   'U',
}

/**
 * Splits a raw product name into tipo_produto + classe.
 * Returns null for falsy input.
 * Defaults classe to 'UNI' when the last word is not FEM / MASC / UNI.
 *
 * @param {string|null|undefined} nome
 * @returns {{ tipo_produto: string, classe: string } | null}
 */
export function parseProdutoNome(nome) {
  if (!nome) return null
  const parts = String(nome).trim().toUpperCase().split(/\s+/)
  if (parts.length === 0) return null
  const last = parts[parts.length - 1]
  if (['FEM', 'MASC', 'UNI'].includes(last)) {
    return { tipo_produto: parts.slice(0, -1).join(' '), classe: last }
  }
  return { tipo_produto: parts.join(' '), classe: 'UNI' }
}

/**
 * Given a raw spreadsheet row (length 73), returns the first GRADE_RANGES entry
 * that has at least one non-zero value among its grade columns.
 * Returns null if no grade columns contain data.
 *
 * @param {Array} row
 * @returns {{ tipo_grade: string, tamanhos: string[], cols: number[] } | null}
 */
export function detectGrade(row) {
  for (const range of GRADE_RANGES) {
    if (range.cols.some(c => (Number(row[c]) || 0) > 0)) return range
  }
  return null
}

/**
 * Parses the raw 2D array (output of XLSX.utils.sheet_to_json with header:1)
 * into product blocks. Skips the 3-row header. Groups rows in sets of 4:
 * Compra / Venda / Estoque / Pedido (Pedido is skipped).
 *
 * @param {Array[]} rows  - 2D array, rows[i][j] = cell value
 * @returns {Array<{ nome: string, compraRow: Array, vendaRow: Array|null, estoqueRow: Array|null }>}
 */
export function parsePlanilhaRows(rows) {
  const blocks = []
  let i = 3 // skip 3 header rows

  while (i < rows.length) {
    const tipo = String(rows[i]?.[2] ?? '').trim().toLowerCase()
    if (tipo === 'compra' && rows[i][1]) {
      const nome      = rows[i][1]
      const compraRow = rows[i]

      const nextTipo1 = String(rows[i + 1]?.[2] ?? '').trim().toLowerCase()
      const nextTipo2 = String(rows[i + 2]?.[2] ?? '').trim().toLowerCase()

      const vendaRow   = nextTipo1 === 'venda'   ? rows[i + 1] : null
      const estoqueRow = nextTipo2 === 'estoque' ? rows[i + 2] : null

      blocks.push({ nome, compraRow, vendaRow, estoqueRow })
      i += 4 // skip compra + venda + estoque + pedido
      continue
    }
    i++
  }

  return blocks
}

/**
 * Reads a buffer (xlsx file bytes), parses the first sheet,
 * and returns product blocks via parsePlanilhaRows.
 *
 * @param {Buffer} buffer
 * @returns {ReturnType<typeof parsePlanilhaRows>}
 */
export function parsePlanilha(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: 0 })
  return parsePlanilhaRows(rows)
}

/**
 * Main entry point called from the IPC handler.
 * Reads the file, parses product blocks, resolves/creates segmentacao IDs,
 * builds grade rows, and calls gr.importBatch in one transaction.
 *
 * @param {{ filePath: string, colecaoId: number, estacao: string, seg: object, gr: object }} options
 * @returns {{ imported: number, skipped: number, errors: string[] }}
 */
export function importarPlanilha({ filePath, colecaoId, estacao, seg, gr }) {
  const buffer = readFileSync(filePath)
  const blocks = parsePlanilha(buffer)

  let imported = 0
  let skipped  = 0
  const errors = []
  const batchItems = []

  for (const block of blocks) {
    const parsed = parseProdutoNome(block.nome)
    if (!parsed) { skipped++; continue }
    const { tipo_produto, classe } = parsed

    const range = detectGrade(block.compraRow)
    if (!range) { skipped++; continue }

    const { tipo_grade, tamanhos, cols } = range
    const classificacao = GRADE_CLASSIFICACAO[tipo_grade]
    if (!classificacao) { skipped++; continue }

    let segId
    try {
      segId = seg.findOrCreate({ classificacao, tipo_produto, classe, tipo_grade, estacao: estacao ?? 'inverno' })
    } catch (e) {
      errors.push(`${block.nome}: ${e.message}`)
      continue
    }

    const gradeRows = tamanhos
      .map((tamanho, idx) => ({
        tamanho,
        ordem:        idx,
        qtd_comprada: Number(block.compraRow[cols[idx]])     || 0,
        qtd_vendida:  Number(block.vendaRow?.[cols[idx]])    || 0,
        qtd_estoque:  Number(block.estoqueRow?.[cols[idx]])  || 0,
      }))
      .filter(r => r.qtd_comprada > 0 || r.qtd_vendida > 0 || r.qtd_estoque > 0)

    if (!gradeRows.length) { skipped++; continue }

    batchItems.push({ segmentacao_id: segId, colecao_id: colecaoId, rows: gradeRows })
    imported++
  }

  if (batchItems.length > 0) {
    gr.importBatch(batchItems)
  }

  return { imported, skipped, errors }
}
```

- [ ] **Step 4: Run the tests — expect all to pass**

```bash
cd "C:/Users/eduke/Solução Compras"
npx vitest run tests/importar.test.js --reporter=verbose
```

Expected: all tests PASS.

- [ ] **Step 5: Run the full test suite to confirm nothing broke**

```bash
cd "C:/Users/eduke/Solução Compras"
npm test
```

Expected: all existing tests still pass, new tests pass, no failures.

- [ ] **Step 6: Commit**

```bash
git add electron/main/importar.js tests/importar.test.js
git commit -m "feat: add xlsx parser and importarPlanilha orchestrator"
```

---

## Task 4: Wire IPC handler (`electron/main/index.js`)

**Files:**
- Modify: `electron/main/index.js`

Add the import for `importarPlanilha` at the top and a new IPC handler for `grades:importar`. The handler receives `filePath`, `colecaoId`, and `estacao` from the renderer; resolves the coleção's `estacao` field in the main process using the `col` module's `getById` method (already available); and calls `importarPlanilha`.

> Note: `index.js` already imports `xlsx` at the top for `fornecedores:importarArquivo`. That import remains untouched.

- [ ] **Step 1: Add the import statement**

In `electron/main/index.js`, add this line immediately after the existing `import * as XLSX from 'xlsx'` line (line 16):

```js
import { importarPlanilha } from './importar.js'
```

The top of the file should now look like:

```js
// electron/main/index.js
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { autoUpdater } from 'electron-updater'
import { getDb } from './db/connection.js'
import { runMigrations } from './db/schema.js'
import { makeColecoes } from './db/colecoes.js'
import { makeSegmentacoes } from './db/segmentacoes.js'
import { makeGrades } from './db/grades.js'
import { makeProjecoes } from './db/projecoes.js'
import { makeFornecedores } from './db/fornecedores.js'
import { makeCompradores } from './db/compradores.js'
import { makePedidos } from './db/pedidos.js'
import { makeSessoes } from './db/sessoes.js'
import fs from 'fs'
import * as XLSX from 'xlsx'
import { importarPlanilha } from './importar.js'
```

- [ ] **Step 2: Add the IPC handler**

In `electron/main/index.js`, find the `// Grades` comment block (currently lines 64-66):

```js
  // Grades
  ipcMain.handle('grades:save',  (_, segId, colId, rows) => gr.saveGrade(segId, colId, rows))
  ipcMain.handle('grades:get',   (_, segId, colId) => gr.getGrade(segId, colId))
```

Replace it with:

```js
  // Grades
  ipcMain.handle('grades:save',  (_, segId, colId, rows) => gr.saveGrade(segId, colId, rows))
  ipcMain.handle('grades:get',   (_, segId, colId) => gr.getGrade(segId, colId))
  ipcMain.handle('grades:importar', (_, filePath, colecaoId, estacao) => {
    return importarPlanilha({ filePath, colecaoId, estacao, seg, gr })
  })
```

- [ ] **Step 3: Commit**

```bash
git add electron/main/index.js
git commit -m "feat: add grades:importar IPC handler"
```

---

## Task 5: Expose `window.api.grades.importar` in preload

**Files:**
- Modify: `electron/preload/index.js`

- [ ] **Step 1: Add `importar` to the grades object**

In `electron/preload/index.js`, find the `grades` section (lines 18-21):

```js
  grades: {
    save: (segId, colId, rows) => ipcRenderer.invoke('grades:save', segId, colId, rows),
    get:  (segId, colId)       => ipcRenderer.invoke('grades:get', segId, colId),
  },
```

Replace it with:

```js
  grades: {
    save:     (segId, colId, rows)          => ipcRenderer.invoke('grades:save', segId, colId, rows),
    get:      (segId, colId)                => ipcRenderer.invoke('grades:get', segId, colId),
    importar: (filePath, colecaoId, estacao) => ipcRenderer.invoke('grades:importar', filePath, colecaoId, estacao),
  },
```

- [ ] **Step 2: Commit**

```bash
git add electron/preload/index.js
git commit -m "feat: expose window.api.grades.importar in preload"
```

---

## Task 6: Add import UI to `Planejamento.jsx`

**Files:**
- Modify: `src/renderer/src/screens/Planejamento.jsx`

Add state variables, `handleImportar` async function, and the collapsible import section JSX. The section appears above the warning banner and the existing `<div className={styles.panel}>`.

- [ ] **Step 1: Add state variables**

In `Planejamento.jsx`, find the existing state declarations block (currently lines 15-21):

```js
  const [segs,      setSegs]      = useState([])
  const [segId,     setSegId]     = useState(null)
  const [metodo,    setMetodo]    = useState('media_simples')
  const [rows,      setRows]      = useState([])
  const [baseNomes, setBaseNomes] = useState(['', ''])
  const [warning,   setWarning]   = useState(null)
  const [saved,     setSaved]     = useState(false)
```

Replace with:

```js
  const [segs,        setSegs]        = useState([])
  const [segId,       setSegId]       = useState(null)
  const [metodo,      setMetodo]      = useState('media_simples')
  const [rows,        setRows]        = useState([])
  const [baseNomes,   setBaseNomes]   = useState(['', ''])
  const [warning,     setWarning]     = useState(null)
  const [saved,       setSaved]       = useState(false)
  const [importColId, setImportColId] = useState('')
  const [importing,   setImporting]   = useState(false)
  const [importResult,setImportResult]= useState(null) // { imported, skipped, errors }
```

- [ ] **Step 2: Add `handleImportar` function**

In `Planejamento.jsx`, find the `handleSave` function (currently lines 95-102):

```js
  async function handleSave() {
    if (!segId || !active || rows.length === 0) return
```

Add the new function **before** `handleSave` (insert between `handleRestore` and `handleSave`):

```js
  async function handleImportar() {
    if (!importColId) return
    const filePath = await window.api.dialog.openFile({
      title: 'Selecionar planilha da Miche',
      filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
      properties: ['openFile'],
    })
    if (!filePath) return
    setImporting(true)
    setImportResult(null)
    try {
      const colecao = collections.find(c => c.id === Number(importColId))
      const result = await window.api.grades.importar(
        filePath,
        Number(importColId),
        colecao?.estacao ?? 'inverno'
      )
      setImportResult(result)
      // Reload grade data for current segmentação so the table refreshes
      if (segId) loadPlanejamento(segId, metodo)
    } catch (e) {
      setImportResult({ imported: 0, skipped: 0, errors: [String(e)] })
    } finally {
      setImporting(false)
    }
  }

```

- [ ] **Step 3: Add the import section JSX**

In `Planejamento.jsx`, find the opening of the returned JSX (line 108):

```jsx
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Planejamento{active ? ` — ${active.nome}` : ''}</h1>

      {warning && <div className={styles.warning}>{warning}</div>}
```

Replace with:

```jsx
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Planejamento{active ? ` — ${active.nome}` : ''}</h1>

      <details className={styles.importSection}>
        <summary className={styles.importSummary}>Importar histórico da planilha</summary>
        <div className={styles.importBody}>
          <div className={styles.importRow}>
            <label className={styles.importLabel}>Coleção:</label>
            <select value={importColId} onChange={e => setImportColId(e.target.value)}>
              <option value="">Selecione a coleção…</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <button
              className={styles.btnImportar}
              disabled={!importColId || importing}
              onClick={handleImportar}
            >
              {importing ? 'Importando…' : 'Escolher arquivo e importar →'}
            </button>
          </div>
          {importResult && (
            <div className={importResult.errors.length ? styles.importError : styles.importSuccess}>
              {importResult.errors.length === 0
                ? `✓ ${importResult.imported} produto(s) importado(s)${importResult.skipped > 0 ? `, ${importResult.skipped} ignorado(s)` : ''}.`
                : `${importResult.imported} importado(s), ${importResult.skipped} ignorado(s). Erros: ${importResult.errors.slice(0, 3).join('; ')}`
              }
            </div>
          )}
        </div>
      </details>

      {warning && <div className={styles.warning}>{warning}</div>}
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/screens/Planejamento.jsx
git commit -m "feat: add import histórico section to Planejamento"
```

---

## Task 7: Add CSS for the import section

**Files:**
- Modify: `src/renderer/src/screens/Planejamento.module.css`

- [ ] **Step 1: Append CSS rules**

In `Planejamento.module.css`, append the following to the end of the file (after the last `.placeholder` rule):

```css

/* ── Import histórico section ─────────────────────────────────────── */
.importSection {
  margin-bottom: 1.25rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card);
}

.importSummary {
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  list-style: none;
  user-select: none;
}
.importSummary::-webkit-details-marker { display: none; }
.importSummary::before { content: '▶  '; font-size: 0.7rem; }
details[open] .importSummary::before { content: '▼  '; }

.importBody {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
}

.importRow {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.importLabel {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.btnImportar {
  padding: 0.4rem 0.9rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btnImportar:disabled { opacity: 0.4; cursor: not-allowed; }

.importSuccess {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--green, #2a9d5c);
}
.importError {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--red, #c00);
}
```

- [ ] **Step 2: Run the full test suite one last time**

```bash
cd "C:/Users/eduke/Solução Compras"
npm test
```

Expected: all tests pass with no failures.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/screens/Planejamento.module.css
git commit -m "feat: add CSS for import histórico section"
```

---

## Self-Review

### 1. Spec coverage

| Spec requirement | Covered by |
|---|---|
| Parse 75-column xlsx format | Task 3 — `parsePlanilha` + `parsePlanilhaRows` |
| Row 0–2 headers skipped | Task 3 — `parsePlanilhaRows` starts at `i = 3` |
| Groups of 4 rows per product (Compra/Venda/Estoque/Pedido) | Task 3 — block detection with `i += 4` |
| Pedido row skipped | Task 3 — not exposed on block; confirmed by test |
| Product name → `tipo_produto` + `classe` | Task 3 — `parseProdutoNome` |
| `GRADE_RANGES` column map | Task 3 — defined verbatim in `importar.js` |
| `GRADE_CLASSIFICACAO` mapping | Task 3 — defined in `importar.js` |
| `seg.findOrCreate` call | Task 3 — `importarPlanilha` calls `seg.findOrCreate` |
| `gr.importBatch` transaction | Task 2 — added to `grades.js` |
| Rows with all-zero quantities skipped | Task 3 — `.filter(r => ...)` |
| `grades:importar` IPC handler | Task 4 |
| `window.api.grades.importar` in preload | Task 5 |
| Collapsible import section in `Planejamento.jsx` | Task 6 |
| Coleção picker, file dialog, feedback message | Task 6 |
| Reload projection table after import | Task 6 — `loadPlanejamento(segId, metodo)` after success |
| CSS for import section | Task 7 |
| `xlsx` in production deps | Task 1 |
| Unit tests for parser functions | Task 3 — `tests/importar.test.js` |
| No tests for `importarPlanilha` directly (file I/O + DB) | Confirmed — only pure functions tested |

### 2. Placeholder scan

No TBDs, no "implement later", no "add validation" without showing code. All code blocks are complete.

### 3. Type consistency

- `importBatch(items)` — defined in Task 2, called in Task 3 (`gr.importBatch(batchItems)`). Consistent.
- `parsePlanilhaRows` — defined and exported in Task 3, imported in test file in Task 3. Consistent.
- `parseProdutoNome` — defined and exported in Task 3, tested in Task 3. Consistent.
- `detectGrade` — defined and exported in Task 3, tested in Task 3. Consistent.
- `parsePlanilha` — defined in Task 3, called by `importarPlanilha` in Task 3. Not directly tested (wraps file I/O + pure fn). Consistent.
- `window.api.grades.importar(filePath, colecaoId, estacao)` — preload signature (Task 5) matches call site in `handleImportar` (Task 6). Consistent.
- `grades:importar` IPC channel name — handler (Task 4) matches invocation (Task 5). Consistent.
- `importResult` state shape `{ imported, skipped, errors }` — set by `handleImportar` from IPC return value (Task 6), read in JSX (Task 6). `importarPlanilha` returns exactly this shape (Task 3). Consistent.

# Solução Compras — Fase 1: Fundação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Electron app abre, SQLite inicializa com schema completo, todos os módulos CRUD têm testes passando, e `window.api` expõe a API completa para o renderer — sem nenhuma UI ainda.

**Architecture:** Main process (Node.js) owns SQLite via better-sqlite3. Preload script exposes a typed `window.api` object via contextBridge. Each DB module is a plain JS object with synchronous functions — no async, no ORM. Tests run against an in-memory SQLite DB (`:memory:`). Renderer will consume `window.api` exclusively in later phases.

**Tech Stack:** electron-vite · better-sqlite3 · Vitest (Node environment) · @electron/rebuild

---

## File Map

```
solucao-compras/
├── package.json
├── electron.vite.config.mjs
├── electron/
│   ├── main/
│   │   ├── index.js              # Main process: window, IPC handlers, DB init
│   │   └── db/
│   │       ├── connection.js     # Opens/returns the better-sqlite3 instance
│   │       ├── schema.js         # CREATE TABLE + runMigrations()
│   │       ├── colecoes.js       # Collections CRUD
│   │       ├── segmentacoes.js   # Segmentations CRUD
│   │       ├── grades.js         # Historical grades CRUD
│   │       ├── projecoes.js      # Projections CRUD + projection calculation
│   │       ├── fornecedores.js   # Suppliers CRUD
│   │       └── pedidos.js        # Purchase orders CRUD
│   └── preload/
│       └── index.js              # contextBridge → window.api
├── src/                          # Renderer placeholder (Phase 2)
│   ├── main.jsx
│   └── App.jsx
└── tests/
    ├── setup.js                  # In-memory DB factory
    ├── colecoes.test.js
    ├── segmentacoes.test.js
    ├── grades.test.js
    ├── projecoes.test.js
    ├── fornecedores.test.js
    └── pedidos.test.js
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `electron.vite.config.mjs`
- Create: `src/main.jsx` (placeholder)
- Create: `src/App.jsx` (placeholder)
- Create: `electron/main/index.js` (minimal)
- Create: `electron/preload/index.js` (minimal)

- [ ] **Step 1: Scaffold with electron-vite**

```bash
cd "C:\Users\eduke\Solução Compras"
npm create @quick-start/electron@latest . -- --template react --skip-git
```

When prompted:
- Package name: `solucao-compras`
- Template: `react`

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install better-sqlite3
npm install --save-dev @electron/rebuild vitest @vitest/coverage-v8
```

- [ ] **Step 3: Rebuild better-sqlite3 for Electron's Node version**

```bash
npx electron-rebuild -f -w better-sqlite3
```

Expected output: `✔ Rebuild Complete`

- [ ] **Step 4: Configure vitest in `package.json`**

Add to `package.json` (merge into existing, don't replace):

```json
{
  "scripts": {
    "test": "vitest run --reporter=verbose",
    "test:watch": "vitest"
  },
  "vitest": {
    "environment": "node",
    "include": ["tests/**/*.test.js"]
  }
}
```

- [ ] **Step 5: Verify app opens**

```bash
npm run dev
```

Expected: Electron window opens with default Vite + React page. Close it.

- [ ] **Step 6: Verify tests run (empty)**

```bash
npm test
```

Expected: `No test files found` or 0 tests — no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Electron + React + better-sqlite3"
```

---

## Task 2: Database Connection + Schema

**Files:**
- Create: `electron/main/db/connection.js`
- Create: `electron/main/db/schema.js`
- Create: `tests/setup.js`

- [ ] **Step 1: Write `connection.js`**

```js
// electron/main/db/connection.js
import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'

let _db = null

export function getDb() {
  if (!_db) {
    const dbPath = path.join(app.getPath('userData'), 'solucao-compras.db')
    _db = new Database(dbPath)
    _db.pragma('journal_mode = WAL')
    _db.pragma('foreign_keys = ON')
  }
  return _db
}

export function setDb(db) {
  _db = db
}
```

- [ ] **Step 2: Write `schema.js`**

```js
// electron/main/db/schema.js
export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS colecoes (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      estacao   TEXT NOT NULL CHECK(estacao IN ('verao','inverno')),
      ano       INTEGER NOT NULL,
      status    TEXT NOT NULL DEFAULT 'planejamento'
                     CHECK(status IN ('planejamento','em_compra','finalizada'))
    );

    CREATE TABLE IF NOT EXISTS segmentacoes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      classificacao   TEXT NOT NULL,
      tipo_produto    TEXT NOT NULL,
      classe          TEXT NOT NULL,
      estacao         TEXT NOT NULL,
      UNIQUE(classificacao, tipo_produto, classe)
    );

    CREATE TABLE IF NOT EXISTS grade_historica (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      tamanho         TEXT NOT NULL,
      ordem           INTEGER NOT NULL DEFAULT 0,
      qtd_comprada    INTEGER NOT NULL DEFAULT 0,
      qtd_vendida     INTEGER NOT NULL DEFAULT 0,
      qtd_estoque     INTEGER NOT NULL DEFAULT 0,
      UNIQUE(segmentacao_id, colecao_id, tamanho)
    );

    CREATE TABLE IF NOT EXISTS projecoes (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      tamanho         TEXT NOT NULL,
      ordem           INTEGER NOT NULL DEFAULT 0,
      qtd_projetada   INTEGER NOT NULL DEFAULT 0,
      qtd_ajustada    INTEGER NOT NULL DEFAULT 0,
      metodo          TEXT NOT NULL DEFAULT 'media_simples'
                           CHECK(metodo IN ('media_simples','media_ponderada','manual')),
      UNIQUE(segmentacao_id, colecao_id, tamanho)
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nome    TEXT NOT NULL,
      contato TEXT
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id   INTEGER NOT NULL REFERENCES fornecedores(id),
      colecao_id      INTEGER NOT NULL REFERENCES colecoes(id),
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      data_pedido     TEXT NOT NULL,
      tamanho         TEXT NOT NULL,
      qtd_pedida      INTEGER NOT NULL DEFAULT 0,
      valor_unitario  REAL NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_grade_seg_col
      ON grade_historica(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_proj_seg_col
      ON projecoes(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_col
      ON pedidos(colecao_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_seg_col
      ON pedidos(segmentacao_id, colecao_id);
  `)
}
```

- [ ] **Step 3: Write `tests/setup.js`**

```js
// tests/setup.js
import Database from 'better-sqlite3'
import { runMigrations } from '../electron/main/db/schema.js'

export function makeDb() {
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  return db
}
```

- [ ] **Step 4: Write schema smoke test**

```js
// tests/schema.test.js
import { describe, it, expect } from 'vitest'
import { makeDb } from './setup.js'

describe('schema', () => {
  it('creates all tables', () => {
    const db = makeDb()
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map(r => r.name)
    expect(tables).toContain('colecoes')
    expect(tables).toContain('segmentacoes')
    expect(tables).toContain('grade_historica')
    expect(tables).toContain('projecoes')
    expect(tables).toContain('fornecedores')
    expect(tables).toContain('pedidos')
  })

  it('enforces foreign keys', () => {
    const db = makeDb()
    expect(() =>
      db.prepare('INSERT INTO grade_historica (segmentacao_id, colecao_id, tamanho, ordem) VALUES (999, 999, "P", 0)').run()
    ).toThrow()
  })
})
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npm test
```

Expected: `schema > creates all tables ✓` and `schema > enforces foreign keys ✓`

- [ ] **Step 6: Commit**

```bash
git add electron/main/db/connection.js electron/main/db/schema.js tests/
git commit -m "feat: database schema + in-memory test setup"
```

---

## Task 3: Collections CRUD

**Files:**
- Create: `electron/main/db/colecoes.js`
- Create: `tests/colecoes.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// tests/colecoes.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'

let db, col

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
})

describe('colecoes', () => {
  it('creates a collection and returns it by id', () => {
    const id = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
    const c = col.getById(id)
    expect(c.nome).toBe('Verão 2026')
    expect(c.estacao).toBe('verao')
    expect(c.status).toBe('planejamento')
  })

  it('lists all collections', () => {
    col.create({ nome: 'Verão 2025', estacao: 'verao', ano: 2025 })
    col.create({ nome: 'Inverno 2025', estacao: 'inverno', ano: 2025 })
    expect(col.list()).toHaveLength(2)
  })

  it('updates status', () => {
    const id = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
    col.setStatus(id, 'em_compra')
    expect(col.getById(id).status).toBe('em_compra')
  })

  it('rejects invalid estacao', () => {
    expect(() =>
      col.create({ nome: 'X', estacao: 'outono', ano: 2026 })
    ).toThrow()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test tests/colecoes.test.js
```

Expected: FAIL with `Cannot find module '../electron/main/db/colecoes.js'`

- [ ] **Step 3: Implement `colecoes.js`**

```js
// electron/main/db/colecoes.js
export function makeColecoes(db) {
  const insert = db.prepare(
    `INSERT INTO colecoes (nome, estacao, ano) VALUES (@nome, @estacao, @ano)`
  )
  const byId = db.prepare(`SELECT * FROM colecoes WHERE id = ?`)
  const all = db.prepare(`SELECT * FROM colecoes ORDER BY ano DESC, estacao`)
  const updateStatus = db.prepare(`UPDATE colecoes SET status = ? WHERE id = ?`)

  return {
    create({ nome, estacao, ano }) {
      return insert.run({ nome, estacao, ano }).lastInsertRowid
    },
    getById(id) {
      return byId.get(id)
    },
    list() {
      return all.all()
    },
    setStatus(id, status) {
      updateStatus.run(status, id)
    }
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test tests/colecoes.test.js
```

Expected: 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add electron/main/db/colecoes.js tests/colecoes.test.js
git commit -m "feat: colecoes CRUD"
```

---

## Task 4: Segmentations CRUD

**Files:**
- Create: `electron/main/db/segmentacoes.js`
- Create: `tests/segmentacoes.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/segmentacoes.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'

let db, seg

beforeEach(() => {
  db = makeDb()
  seg = makeSegmentacoes(db)
})

describe('segmentacoes', () => {
  it('creates and retrieves a segmentation', () => {
    const id = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    const s = seg.getById(id)
    expect(s.classificacao).toBe('AD')
    expect(s.tipo_produto).toBe('BERMUDA')
  })

  it('enforces unique (classificacao, tipo_produto, classe)', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    expect(() =>
      seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    ).toThrow()
  })

  it('lists all segmentations', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    seg.create({ classificacao: 'EX', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    expect(seg.list()).toHaveLength(2)
  })

  it('lists filtered by classificacao', () => {
    seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    seg.create({ classificacao: 'EX', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
    expect(seg.listByClass('AD')).toHaveLength(1)
  })

  it('upserts — returns existing id if already exists', () => {
    const id1 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CAMISETA', classe: 'MASC', estacao: 'ANO TODO' })
    const id2 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CAMISETA', classe: 'MASC', estacao: 'ANO TODO' })
    expect(id1).toBe(id2)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test tests/segmentacoes.test.js
```

- [ ] **Step 3: Implement**

```js
// electron/main/db/segmentacoes.js
export function makeSegmentacoes(db) {
  const insert = db.prepare(
    `INSERT INTO segmentacoes (classificacao, tipo_produto, classe, estacao)
     VALUES (@classificacao, @tipo_produto, @classe, @estacao)`
  )
  const byId = db.prepare(`SELECT * FROM segmentacoes WHERE id = ?`)
  const all = db.prepare(
    `SELECT * FROM segmentacoes ORDER BY classificacao, tipo_produto, classe`
  )
  const byClass = db.prepare(
    `SELECT * FROM segmentacoes WHERE classificacao = ? ORDER BY tipo_produto, classe`
  )
  const findExact = db.prepare(
    `SELECT id FROM segmentacoes WHERE classificacao = @classificacao
     AND tipo_produto = @tipo_produto AND classe = @classe`
  )

  return {
    create(data) {
      return insert.run(data).lastInsertRowid
    },
    getById(id) {
      return byId.get(id)
    },
    list() {
      return all.all()
    },
    listByClass(classificacao) {
      return byClass.all(classificacao)
    },
    upsert(data) {
      const existing = findExact.get(data)
      if (existing) return existing.id
      return insert.run(data).lastInsertRowid
    }
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test tests/segmentacoes.test.js
```

- [ ] **Step 5: Commit**

```bash
git add electron/main/db/segmentacoes.js tests/segmentacoes.test.js
git commit -m "feat: segmentacoes CRUD"
```

---

## Task 5: Historical Grades CRUD

**Files:**
- Create: `electron/main/db/grades.js`
- Create: `tests/grades.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/grades.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeGrades } from '../electron/main/db/grades.js'

let db, col, seg, gr, colId, segId

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
  seg = makeSegmentacoes(db)
  gr = makeGrades(db)
  colId = col.create({ nome: 'Verão 2025', estacao: 'verao', ano: 2025 })
  segId = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
})

describe('grades', () => {
  it('saves and retrieves grade for a segmentation+collection', () => {
    gr.saveGrade(segId, colId, [
      { tamanho: 'P', ordem: 0, qtd_comprada: 100, qtd_vendida: 80, qtd_estoque: 20 },
      { tamanho: 'M', ordem: 1, qtd_comprada: 200, qtd_vendida: 180, qtd_estoque: 20 },
    ])
    const rows = gr.getGrade(segId, colId)
    expect(rows).toHaveLength(2)
    expect(rows[0].tamanho).toBe('P')
    expect(rows[0].qtd_comprada).toBe(100)
  })

  it('upserts on conflict (same seg+col+tamanho)', () => {
    gr.saveGrade(segId, colId, [{ tamanho: 'P', ordem: 0, qtd_comprada: 100, qtd_vendida: 80, qtd_estoque: 20 }])
    gr.saveGrade(segId, colId, [{ tamanho: 'P', ordem: 0, qtd_comprada: 150, qtd_vendida: 90, qtd_estoque: 60 }])
    const rows = gr.getGrade(segId, colId)
    expect(rows).toHaveLength(1)
    expect(rows[0].qtd_comprada).toBe(150)
  })

  it('returns rows ordered by ordem', () => {
    gr.saveGrade(segId, colId, [
      { tamanho: 'GG', ordem: 3, qtd_comprada: 50, qtd_vendida: 40, qtd_estoque: 10 },
      { tamanho: 'P',  ordem: 0, qtd_comprada: 100, qtd_vendida: 80, qtd_estoque: 20 },
    ])
    const rows = gr.getGrade(segId, colId)
    expect(rows[0].tamanho).toBe('P')
    expect(rows[1].tamanho).toBe('GG')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test tests/grades.test.js
```

- [ ] **Step 3: Implement**

```js
// electron/main/db/grades.js
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

  const bySegCol = db.prepare(
    `SELECT * FROM grade_historica WHERE segmentacao_id = ? AND colecao_id = ? ORDER BY ordem`
  )

  return {
    saveGrade(segId, colId, rows) {
      saveMany(segId, colId, rows)
    },
    getGrade(segId, colId) {
      return bySegCol.all(segId, colId)
    }
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test tests/grades.test.js
```

- [ ] **Step 5: Commit**

```bash
git add electron/main/db/grades.js tests/grades.test.js
git commit -m "feat: grade_historica CRUD"
```

---

## Task 6: Projections (Business Logic — Critical)

**Files:**
- Create: `electron/main/db/projecoes.js`
- Create: `tests/projecoes.test.js`

This is the core business rule: `projection = average of last 2 equivalent collections per size`.

- [ ] **Step 1: Write failing tests**

```js
// tests/projecoes.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeGrades } from '../electron/main/db/grades.js'
import { makeProjecoes } from '../electron/main/db/projecoes.js'

let db, col, seg, gr, proj
let colV24, colV25, colV26, segId

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
  seg = makeSegmentacoes(db)
  gr = makeGrades(db)
  proj = makeProjecoes(db)

  colV24 = col.create({ nome: 'Verão 2024', estacao: 'verao', ano: 2024 })
  colV25 = col.create({ nome: 'Verão 2025', estacao: 'verao', ano: 2025 })
  colV26 = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
  segId = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })

  gr.saveGrade(segId, colV24, [
    { tamanho: 'P', ordem: 0, qtd_comprada: 100, qtd_vendida: 90, qtd_estoque: 10 },
    { tamanho: 'M', ordem: 1, qtd_comprada: 200, qtd_vendida: 180, qtd_estoque: 20 },
    { tamanho: 'G', ordem: 2, qtd_comprada: 150, qtd_vendida: 130, qtd_estoque: 20 },
  ])
  gr.saveGrade(segId, colV25, [
    { tamanho: 'P', ordem: 0, qtd_comprada: 120, qtd_vendida: 110, qtd_estoque: 10 },
    { tamanho: 'M', ordem: 1, qtd_comprada: 240, qtd_vendida: 220, qtd_estoque: 20 },
    { tamanho: 'G', ordem: 2, qtd_comprada: 180, qtd_vendida: 160, qtd_estoque: 20 },
  ])
})

describe('projecoes - calcular', () => {
  it('calculates simple average from 2 previous equivalent collections', () => {
    // P: (100+120)/2 = 110, M: (200+240)/2 = 220, G: (150+180)/2 = 165
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    expect(rows.find(r => r.tamanho === 'P').qtd_projetada).toBe(110)
    expect(rows.find(r => r.tamanho === 'M').qtd_projetada).toBe(220)
    expect(rows.find(r => r.tamanho === 'G').qtd_projetada).toBe(165)
  })

  it('calculates weighted average (0.4 * n-2 + 0.6 * n-1)', () => {
    // P: 0.4*100 + 0.6*120 = 40+72 = 112, M: 0.4*200 + 0.6*240 = 80+144 = 224
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_ponderada')
    expect(rows.find(r => r.tamanho === 'P').qtd_projetada).toBe(112)
    expect(rows.find(r => r.tamanho === 'M').qtd_projetada).toBe(224)
  })

  it('rounds results to nearest integer', () => {
    // P: (100+121)/2 = 110.5 → 111
    gr.saveGrade(segId, colV25, [
      { tamanho: 'P', ordem: 0, qtd_comprada: 121, qtd_vendida: 110, qtd_estoque: 11 },
      { tamanho: 'M', ordem: 1, qtd_comprada: 240, qtd_vendida: 220, qtd_estoque: 20 },
      { tamanho: 'G', ordem: 2, qtd_comprada: 180, qtd_vendida: 160, qtd_estoque: 20 },
    ])
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    expect(rows.find(r => r.tamanho === 'P').qtd_projetada).toBe(111)
  })
})

describe('projecoes - salvar e ajustar', () => {
  it('saves calculated projection with qtd_ajustada = qtd_projetada', () => {
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    proj.salvar(segId, colV26, rows, 'media_simples')
    const saved = proj.getProjecao(segId, colV26)
    expect(saved.find(r => r.tamanho === 'P').qtd_ajustada).toBe(110)
  })

  it('allows manual adjustment of individual sizes', () => {
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    proj.salvar(segId, colV26, rows, 'media_simples')
    proj.ajustar(segId, colV26, 'P', 90)
    const saved = proj.getProjecao(segId, colV26)
    expect(saved.find(r => r.tamanho === 'P').qtd_ajustada).toBe(90)
    expect(saved.find(r => r.tamanho === 'P').qtd_projetada).toBe(110)
  })

  it('restores calculated value on reset', () => {
    const rows = proj.calcular(segId, colV26, [colV24, colV25], 'media_simples')
    proj.salvar(segId, colV26, rows, 'media_simples')
    proj.ajustar(segId, colV26, 'P', 90)
    proj.restaurar(segId, colV26, 'P')
    const saved = proj.getProjecao(segId, colV26)
    expect(saved.find(r => r.tamanho === 'P').qtd_ajustada).toBe(110)
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test tests/projecoes.test.js
```

- [ ] **Step 3: Implement**

```js
// electron/main/db/projecoes.js
export function makeProjecoes(db) {
  const upsert = db.prepare(`
    INSERT INTO projecoes (segmentacao_id, colecao_id, tamanho, ordem, qtd_projetada, qtd_ajustada, metodo)
    VALUES (@segmentacao_id, @colecao_id, @tamanho, @ordem, @qtd_projetada, @qtd_ajustada, @metodo)
    ON CONFLICT(segmentacao_id, colecao_id, tamanho) DO UPDATE SET
      qtd_projetada = excluded.qtd_projetada,
      qtd_ajustada  = excluded.qtd_ajustada,
      metodo        = excluded.metodo
  `)

  const updateAjustada = db.prepare(`
    UPDATE projecoes SET qtd_ajustada = ?
    WHERE segmentacao_id = ? AND colecao_id = ? AND tamanho = ?
  `)

  const resetAjustada = db.prepare(`
    UPDATE projecoes SET qtd_ajustada = qtd_projetada
    WHERE segmentacao_id = ? AND colecao_id = ? AND tamanho = ?
  `)

  const bySegCol = db.prepare(`
    SELECT * FROM projecoes WHERE segmentacao_id = ? AND colecao_id = ? ORDER BY ordem
  `)

  const gradeBySegCol = db.prepare(`
    SELECT tamanho, ordem, qtd_comprada FROM grade_historica
    WHERE segmentacao_id = ? AND colecao_id = ? ORDER BY ordem
  `)

  const saveMany = db.transaction((segId, colId, rows, metodo) => {
    for (const r of rows) {
      upsert.run({ segmentacao_id: segId, colecao_id: colId, metodo, ...r })
    }
  })

  return {
    calcular(segId, targetColId, baseColIds, metodo) {
      const [idN2, idN1] = baseColIds
      const gradeN2 = gradeBySegCol.all(segId, idN2)
      const gradeN1 = gradeBySegCol.all(segId, idN1)

      const mapN1 = Object.fromEntries(gradeN1.map(r => [r.tamanho, r]))
      const mapN2 = Object.fromEntries(gradeN2.map(r => [r.tamanho, r]))
      const allTamanhos = [...new Set([...gradeN2.map(r => r.tamanho), ...gradeN1.map(r => r.tamanho)])]

      return allTamanhos.map(tamanho => {
        const n2 = mapN2[tamanho]?.qtd_comprada ?? 0
        const n1 = mapN1[tamanho]?.qtd_comprada ?? 0
        const ordem = mapN1[tamanho]?.ordem ?? mapN2[tamanho]?.ordem ?? 0

        let qtd_projetada
        if (metodo === 'media_ponderada') {
          qtd_projetada = Math.round(n2 * 0.4 + n1 * 0.6)
        } else {
          qtd_projetada = Math.round((n2 + n1) / 2)
        }

        return { tamanho, ordem, qtd_projetada, qtd_ajustada: qtd_projetada }
      })
    },

    salvar(segId, colId, rows, metodo) {
      saveMany(segId, colId, rows, metodo)
    },

    getProjecao(segId, colId) {
      return bySegCol.all(segId, colId)
    },

    ajustar(segId, colId, tamanho, novaQtd) {
      updateAjustada.run(novaQtd, segId, colId, tamanho)
    },

    restaurar(segId, colId, tamanho) {
      resetAjustada.run(segId, colId, tamanho)
    }
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm test tests/projecoes.test.js
```

Expected: 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add electron/main/db/projecoes.js tests/projecoes.test.js
git commit -m "feat: projection calculation (simple avg, weighted avg, manual adjust)"
```

---

## Task 7: Suppliers + Purchase Orders CRUD

**Files:**
- Create: `electron/main/db/fornecedores.js`
- Create: `electron/main/db/pedidos.js`
- Create: `tests/fornecedores.test.js`
- Create: `tests/pedidos.test.js`

- [ ] **Step 1: Write failing tests for fornecedores**

```js
// tests/fornecedores.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeFornecedores } from '../electron/main/db/fornecedores.js'

let db, forn
beforeEach(() => { db = makeDb(); forn = makeFornecedores(db) })

describe('fornecedores', () => {
  it('creates and retrieves supplier', () => {
    const id = forn.create({ nome: 'ABC Confecções', contato: '(47) 99999-0000' })
    expect(forn.getById(id).nome).toBe('ABC Confecções')
  })

  it('lists all suppliers', () => {
    forn.create({ nome: 'ABC', contato: '' })
    forn.create({ nome: 'XYZ', contato: '' })
    expect(forn.list()).toHaveLength(2)
  })

  it('updates supplier', () => {
    const id = forn.create({ nome: 'ABC', contato: '' })
    forn.update(id, { nome: 'ABC Ltda', contato: '99' })
    expect(forn.getById(id).nome).toBe('ABC Ltda')
  })
})
```

- [ ] **Step 2: Write failing tests for pedidos**

```js
// tests/pedidos.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { makeDb } from './setup.js'
import { makeColecoes } from '../electron/main/db/colecoes.js'
import { makeSegmentacoes } from '../electron/main/db/segmentacoes.js'
import { makeFornecedores } from '../electron/main/db/fornecedores.js'
import { makePedidos } from '../electron/main/db/pedidos.js'

let db, col, seg, forn, ped
let colId, segId, fornId

beforeEach(() => {
  db = makeDb()
  col = makeColecoes(db)
  seg = makeSegmentacoes(db)
  forn = makeFornecedores(db)
  ped = makePedidos(db)
  colId = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
  segId = seg.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
  fornId = forn.create({ nome: 'ABC', contato: '' })
})

describe('pedidos', () => {
  it('saves a purchase order (multiple sizes) and retrieves total bought per size', () => {
    ped.salvar({
      fornecedor_id: fornId,
      colecao_id: colId,
      segmentacao_id: segId,
      data_pedido: '2026-05-16',
      valor_unitario: 49.90,
      itens: [
        { tamanho: 'P', qtd_pedida: 30 },
        { tamanho: 'M', qtd_pedida: 50 },
      ]
    })
    const totais = ped.getTotaisPorTamanho(segId, colId)
    expect(totais.find(r => r.tamanho === 'P').total_pedido).toBe(30)
    expect(totais.find(r => r.tamanho === 'M').total_pedido).toBe(50)
  })

  it('accumulates quantities from multiple orders for same seg+col+size', () => {
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-10', valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd_pedida: 20 }]
    })
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd_pedida: 15 }]
    })
    const totais = ped.getTotaisPorTamanho(segId, colId)
    expect(totais.find(r => r.tamanho === 'P').total_pedido).toBe(35)
  })

  it('calculates valor_total of a pedido correctly', () => {
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 50.00,
      itens: [{ tamanho: 'P', qtd_pedida: 10 }, { tamanho: 'M', qtd_pedida: 20 }]
    })
    // total = (10 + 20) * 50 = 1500
    const pedidos = ped.listarPorColecao(colId)
    const total = pedidos.reduce((s, p) => s + p.qtd_pedida * p.valor_unitario, 0)
    expect(total).toBe(1500)
  })

  it('lists pedidos grouped as visitas (by supplier + date)', () => {
    ped.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId,
      data_pedido: '2026-05-16', valor_unitario: 49.90,
      itens: [{ tamanho: 'P', qtd_pedida: 20 }, { tamanho: 'M', qtd_pedida: 30 }]
    })
    const visitas = ped.listarVisitas(colId)
    expect(visitas).toHaveLength(1)
    expect(visitas[0].total_pecas).toBe(50)
    expect(visitas[0].total_valor).toBeCloseTo(50 * 49.90)
  })
})
```

- [ ] **Step 3: Run both — expect FAIL**

```bash
npm test tests/fornecedores.test.js tests/pedidos.test.js
```

- [ ] **Step 4: Implement `fornecedores.js`**

```js
// electron/main/db/fornecedores.js
export function makeFornecedores(db) {
  const insert = db.prepare(`INSERT INTO fornecedores (nome, contato) VALUES (@nome, @contato)`)
  const byId = db.prepare(`SELECT * FROM fornecedores WHERE id = ?`)
  const all = db.prepare(`SELECT * FROM fornecedores ORDER BY nome`)
  const upd = db.prepare(`UPDATE fornecedores SET nome = @nome, contato = @contato WHERE id = @id`)

  return {
    create({ nome, contato = '' }) {
      return insert.run({ nome, contato }).lastInsertRowid
    },
    getById(id) { return byId.get(id) },
    list() { return all.all() },
    update(id, { nome, contato }) { upd.run({ id, nome, contato }) }
  }
}
```

- [ ] **Step 5: Implement `pedidos.js`**

```js
// electron/main/db/pedidos.js
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
    }
  }
}
```

- [ ] **Step 6: Run — expect PASS**

```bash
npm test tests/fornecedores.test.js tests/pedidos.test.js
```

- [ ] **Step 7: Commit**

```bash
git add electron/main/db/fornecedores.js electron/main/db/pedidos.js tests/
git commit -m "feat: fornecedores + pedidos CRUD"
```

---

## Task 8: IPC Bridge

**Files:**
- Modify: `electron/main/index.js`
- Modify: `electron/preload/index.js`

Wire all DB modules to IPC handlers and expose via `window.api`.

- [ ] **Step 1: Update `electron/main/index.js`**

```js
// electron/main/index.js
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { getDb } from './db/connection.js'
import { runMigrations } from './db/schema.js'
import { makeColecoes } from './db/colecoes.js'
import { makeSegmentacoes } from './db/segmentacoes.js'
import { makeGrades } from './db/grades.js'
import { makeProjecoes } from './db/projecoes.js'
import { makeFornecedores } from './db/fornecedores.js'
import { makePedidos } from './db/pedidos.js'
import fs from 'fs'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  const db = getDb()
  runMigrations(db)

  const col  = makeColecoes(db)
  const seg  = makeSegmentacoes(db)
  const gr   = makeGrades(db)
  const proj = makeProjecoes(db)
  const forn = makeFornecedores(db)
  const ped  = makePedidos(db)

  // Colecoes
  ipcMain.handle('colecoes:list',      () => col.list())
  ipcMain.handle('colecoes:create',    (_, d) => col.create(d))
  ipcMain.handle('colecoes:setStatus', (_, id, status) => col.setStatus(id, status))

  // Segmentacoes
  ipcMain.handle('segmentacoes:list',    () => seg.list())
  ipcMain.handle('segmentacoes:create',  (_, d) => seg.create(d))
  ipcMain.handle('segmentacoes:upsert',  (_, d) => seg.upsert(d))

  // Grades
  ipcMain.handle('grades:save',  (_, segId, colId, rows) => gr.saveGrade(segId, colId, rows))
  ipcMain.handle('grades:get',   (_, segId, colId) => gr.getGrade(segId, colId))

  // Projecoes
  ipcMain.handle('projecoes:calcular',  (_, segId, colId, baseIds, metodo) => proj.calcular(segId, colId, baseIds, metodo))
  ipcMain.handle('projecoes:salvar',    (_, segId, colId, rows, metodo) => proj.salvar(segId, colId, rows, metodo))
  ipcMain.handle('projecoes:get',       (_, segId, colId) => proj.getProjecao(segId, colId))
  ipcMain.handle('projecoes:ajustar',   (_, segId, colId, tamanho, qtd) => proj.ajustar(segId, colId, tamanho, qtd))
  ipcMain.handle('projecoes:restaurar', (_, segId, colId, tamanho) => proj.restaurar(segId, colId, tamanho))

  // Fornecedores
  ipcMain.handle('fornecedores:list',   () => forn.list())
  ipcMain.handle('fornecedores:create', (_, d) => forn.create(d))
  ipcMain.handle('fornecedores:update', (_, id, d) => forn.update(id, d))

  // Pedidos
  ipcMain.handle('pedidos:salvar',         (_, d) => ped.salvar(d))
  ipcMain.handle('pedidos:totaisPorTamanho', (_, segId, colId) => ped.getTotaisPorTamanho(segId, colId))
  ipcMain.handle('pedidos:listarVisitas',  (_, colId) => ped.listarVisitas(colId))
  ipcMain.handle('pedidos:listarPorColecao', (_, colId) => ped.listarPorColecao(colId))

  // Backup / Restore
  ipcMain.handle('backup:export', async () => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Exportar backup',
      defaultPath: `solucao-compras-backup-${new Date().toISOString().slice(0,10)}.db`,
      filters: [{ name: 'Database', extensions: ['db'] }]
    })
    if (!filePath) return false
    fs.copyFileSync(db.name, filePath)
    return true
  })

  ipcMain.handle('backup:import', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Restaurar backup',
      filters: [{ name: 'Database', extensions: ['db'] }],
      properties: ['openFile']
    })
    if (!filePaths.length) return false
    db.close()
    fs.copyFileSync(filePaths[0], db.name)
    app.relaunch()
    app.exit(0)
    return true
  })

  ipcMain.handle('dialog:openFile', async (_, options) => {
    const result = await dialog.showOpenDialog(options)
    return result.filePaths[0] ?? null
  })

  createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
```

- [ ] **Step 2: Update `electron/preload/index.js`**

```js
// electron/preload/index.js
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  colecoes: {
    list:      ()           => ipcRenderer.invoke('colecoes:list'),
    create:    (d)          => ipcRenderer.invoke('colecoes:create', d),
    setStatus: (id, status) => ipcRenderer.invoke('colecoes:setStatus', id, status),
  },
  segmentacoes: {
    list:   ()  => ipcRenderer.invoke('segmentacoes:list'),
    create: (d) => ipcRenderer.invoke('segmentacoes:create', d),
    upsert: (d) => ipcRenderer.invoke('segmentacoes:upsert', d),
  },
  grades: {
    save: (segId, colId, rows) => ipcRenderer.invoke('grades:save', segId, colId, rows),
    get:  (segId, colId)       => ipcRenderer.invoke('grades:get', segId, colId),
  },
  projecoes: {
    calcular:  (segId, colId, baseIds, metodo) => ipcRenderer.invoke('projecoes:calcular', segId, colId, baseIds, metodo),
    salvar:    (segId, colId, rows, metodo)    => ipcRenderer.invoke('projecoes:salvar', segId, colId, rows, metodo),
    get:       (segId, colId)                  => ipcRenderer.invoke('projecoes:get', segId, colId),
    ajustar:   (segId, colId, tamanho, qtd)   => ipcRenderer.invoke('projecoes:ajustar', segId, colId, tamanho, qtd),
    restaurar: (segId, colId, tamanho)         => ipcRenderer.invoke('projecoes:restaurar', segId, colId, tamanho),
  },
  fornecedores: {
    list:   ()       => ipcRenderer.invoke('fornecedores:list'),
    create: (d)      => ipcRenderer.invoke('fornecedores:create', d),
    update: (id, d)  => ipcRenderer.invoke('fornecedores:update', id, d),
  },
  pedidos: {
    salvar:           (d)          => ipcRenderer.invoke('pedidos:salvar', d),
    totaisPorTamanho: (segId, colId) => ipcRenderer.invoke('pedidos:totaisPorTamanho', segId, colId),
    listarVisitas:    (colId)      => ipcRenderer.invoke('pedidos:listarVisitas', colId),
    listarPorColecao: (colId)      => ipcRenderer.invoke('pedidos:listarPorColecao', colId),
  },
  backup: {
    export: () => ipcRenderer.invoke('backup:export'),
    import: () => ipcRenderer.invoke('backup:import'),
  },
  dialog: {
    openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  }
})
```

- [ ] **Step 3: Verify all tests still pass**

```bash
npm test
```

Expected: all previous tests still passing (IPC doesn't affect DB unit tests).

- [ ] **Step 4: Verify app still opens**

```bash
npm run dev
```

Expected: Electron window opens. No errors in terminal.

- [ ] **Step 5: Commit**

```bash
git add electron/main/index.js electron/preload/index.js
git commit -m "feat: IPC bridge — window.api wired to all DB modules"
```

---

## Phase 1 Complete ✓

At this point:
- `npm test` → all tests passing (schema, colecoes, segmentacoes, grades, projecoes, fornecedores, pedidos)
- `npm run dev` → Electron opens, DB initializes at `%APPDATA%/solucao-compras/solucao-compras.db`
- `window.api` available in DevTools console with all methods
- No UI yet — that's Phase 2

**Verification (run in Electron DevTools console):**
```js
await window.api.colecoes.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
// → 1
await window.api.colecoes.list()
// → [{ id: 1, nome: 'Verão 2026', estacao: 'verao', ano: 2026, status: 'planejamento' }]
```

# Visitas + Pedidos por Comprador Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the purchase model around "visitas" (supplier visits) so that each buyer (comprador) who participates in a visit gets their own independent order (pedido) with PDF, eliminating the distribution phase and all 5 known critical bugs.

**Architecture:** Introduce a `visitas` table as the grouper (fornecedor + date + colecao). Each `pedido` is a header (comprador + pricing + commercial terms) linked to a visita. Quantities per size live in `pedido_itens`. The Compras screen becomes a 3-phase wizard: (1) start visit, (2) add orders per buyer, (3) close visit and generate one PDF per buyer.

**Tech Stack:** better-sqlite3 (synchronous SQLite), Electron IPC via contextBridge, React + CSS Modules, electron-vite build

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `electron/main/db/schema.js` | Modify | Add tipo_grade migration, drop old pedidos, create visitas + new pedidos + pedido_itens |
| `electron/main/db/colecoes.js` | Modify | `create()` returns full object (bug fix) |
| `electron/main/db/segmentacoes.js` | Modify | Add tipo_grade to all queries + upsert |
| `electron/main/db/visitas.js` | Create | CRUD for visitas table |
| `electron/main/db/pedidos.js` | Rewrite | salvar with transaction, byVisita, totaisPorTamanho |
| `electron/main/index.js` | Modify | Add visitas IPC, update pedidos IPC, remove deprecated handlers |
| `electron/preload/index.js` | Modify | Expose window.api.visitas, update window.api.pedidos |
| `demo/src/mockApi.js` | Rewrite | Add visitas namespace, redesign pedidos to match new contract |
| `src/renderer/src/screens/Compras.jsx` | Rewrite | 3-phase wizard (IniciarVisita / RegistrarPedido / FecharVisita) |
| `src/renderer/src/screens/Compras.module.css` | Modify | Add styles for new wizard phases |
| `seed-test.cjs` | Modify | Update segmentacoes (tipo_grade), use new visitas+pedidos+pedido_itens schema |

---

## Task 1: Schema Migration

**Files:**
- Modify: `electron/main/db/schema.js`

- [ ] **Step 1: Write the test (schema detection)**

Create `electron/main/db/__tests__/schema.test.js`:

```js
import Database from 'better-sqlite3'
import { runMigrations } from '../schema.js'

test('schema migration adds tipo_grade and new tables', () => {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db)

  const segCols = db.pragma('table_info(segmentacoes)').map(c => c.name)
  expect(segCols).toContain('tipo_grade')

  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map(r => r.name)
  expect(tables).toContain('visitas')
  expect(tables).toContain('pedido_itens')

  // pedidos should NOT have 'tamanho' column
  const pedCols = db.pragma('table_info(pedidos)').map(c => c.name)
  expect(pedCols).not.toContain('tamanho')
  expect(pedCols).toContain('visita_id')
  expect(pedCols).toContain('comprador_id')
})

test('migration is idempotent — safe to run twice', () => {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  expect(() => runMigrations(db)).not.toThrow()
})

test('migration preserves existing segmentacoes rows', () => {
  const db = new Database(':memory:')
  runMigrations(db)
  db.prepare(`INSERT INTO segmentacoes (classificacao, tipo_produto, classe, estacao, tipo_grade)
    VALUES ('AD','CALCA','MASC','inverno','AD')`).run()
  runMigrations(db) // run again — should not throw
  const rows = db.prepare(`SELECT * FROM segmentacoes`).all()
  expect(rows).toHaveLength(1)
  expect(rows[0].tipo_grade).toBe('AD')
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd "C:\Users\eduke\Solução Compras" && npm test -- schema
```

Expected: FAIL — `tipo_grade` not found, `visitas` not found.

- [ ] **Step 3: Rewrite schema.js**

Replace entire content of `electron/main/db/schema.js`:

```js
export function runMigrations(db) {
  // Base tables — unchanged
  db.exec(`
    CREATE TABLE IF NOT EXISTS colecoes (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      estacao   TEXT NOT NULL CHECK(estacao IN ('verao','inverno')),
      ano       INTEGER NOT NULL,
      status    TEXT NOT NULL DEFAULT 'planejamento'
                     CHECK(status IN ('planejamento','em_compra','finalizada'))
    );

    CREATE TABLE IF NOT EXISTS fornecedores (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nome      TEXT NOT NULL,
      contato   TEXT,
      categoria TEXT
    );

    CREATE TABLE IF NOT EXISTS compradores (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      nome    TEXT NOT NULL,
      cnpj    TEXT,
      cidade  TEXT
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
  `)

  // Segmentacoes: recreate if tipo_grade is missing
  const segCols = db.pragma('table_info(segmentacoes)').map(c => c.name)
  if (!segCols.includes('tipo_grade')) {
    if (segCols.length > 0) {
      // Migrate existing rows — copy with default tipo_grade 'AD'
      db.exec(`
        ALTER TABLE segmentacoes RENAME TO _seg_old;
        CREATE TABLE segmentacoes (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          classificacao   TEXT NOT NULL,
          tipo_produto    TEXT NOT NULL,
          classe          TEXT NOT NULL,
          tipo_grade      TEXT NOT NULL DEFAULT 'AD',
          estacao         TEXT NOT NULL,
          UNIQUE(classificacao, tipo_produto, classe, tipo_grade)
        );
        INSERT INTO segmentacoes (id, classificacao, tipo_produto, classe, tipo_grade, estacao)
          SELECT id, classificacao, tipo_produto, classe, 'AD', estacao FROM _seg_old;
        DROP TABLE _seg_old;
      `)
    } else {
      db.exec(`
        CREATE TABLE IF NOT EXISTS segmentacoes (
          id              INTEGER PRIMARY KEY AUTOINCREMENT,
          classificacao   TEXT NOT NULL,
          tipo_produto    TEXT NOT NULL,
          classe          TEXT NOT NULL,
          tipo_grade      TEXT NOT NULL DEFAULT 'AD',
          estacao         TEXT NOT NULL,
          UNIQUE(classificacao, tipo_produto, classe, tipo_grade)
        );
      `)
    }
  }

  // Drop old flat pedidos if it has tamanho column (old schema)
  const pedCols = db.pragma('table_info(pedidos)').map(c => c.name)
  if (pedCols.includes('tamanho')) {
    db.exec(`DROP TABLE IF EXISTS pedidos`)
  }

  // New purchase tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitas (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
      colecao_id    INTEGER NOT NULL REFERENCES colecoes(id),
      data_visita   TEXT NOT NULL,
      vendedor      TEXT,
      cond_pag      TEXT,
      frete         TEXT,
      obs           TEXT
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      visita_id       INTEGER NOT NULL REFERENCES visitas(id),
      comprador_id    INTEGER NOT NULL REFERENCES compradores(id),
      segmentacao_id  INTEGER NOT NULL REFERENCES segmentacoes(id),
      valor_unitario  REAL NOT NULL DEFAULT 0,
      desconto_pct    REAL NOT NULL DEFAULT 0,
      transportadora  TEXT,
      nota_fiscal     TEXT,
      obs             TEXT
    );

    CREATE TABLE IF NOT EXISTS pedido_itens (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
      tamanho   TEXT NOT NULL,
      qtd       INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_grade_seg_col
      ON grade_historica(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_proj_seg_col
      ON projecoes(segmentacao_id, colecao_id);
    CREATE INDEX IF NOT EXISTS idx_visitas_col
      ON visitas(colecao_id);
    CREATE INDEX IF NOT EXISTS idx_pedidos_visita
      ON pedidos(visita_id);
    CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido
      ON pedido_itens(pedido_id);
  `)

  // Add categoria to fornecedores if upgrading from very old schema
  try { db.exec(`ALTER TABLE fornecedores ADD COLUMN categoria TEXT`) } catch {}
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
cd "C:\Users\eduke\Solução Compras" && npm test -- schema
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```
git add electron/main/db/schema.js electron/main/db/__tests__/schema.test.js
git commit -m "feat(schema): add tipo_grade, visitas, pedido_itens — redesign pedidos"
```

---

## Task 2: Fix colecoes.js + segmentacoes.js

**Files:**
- Modify: `electron/main/db/colecoes.js`
- Modify: `electron/main/db/segmentacoes.js`

- [ ] **Step 1: Write tests**

Create `electron/main/db/__tests__/colecoes.test.js`:

```js
import Database from 'better-sqlite3'
import { runMigrations } from '../schema.js'
import { makeColecoes } from '../colecoes.js'

function setup() {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  return makeColecoes(db)
}

test('create returns full object, not just id', () => {
  const col = setup()
  const result = col.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
  expect(result).toMatchObject({ id: 1, nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
  expect(typeof result).toBe('object')
})

test('list returns created collections', () => {
  const col = setup()
  col.create({ nome: 'Inverno 2026', estacao: 'inverno', ano: 2026 })
  const list = col.list()
  expect(list).toHaveLength(1)
  expect(list[0].nome).toBe('Inverno 2026')
})
```

Create `electron/main/db/__tests__/segmentacoes.test.js`:

```js
import Database from 'better-sqlite3'
import { runMigrations } from '../schema.js'
import { makeSegmentacoes } from '../segmentacoes.js'

function setup() {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  return makeSegmentacoes(db)
}

test('create includes tipo_grade', () => {
  const seg = setup()
  const id = seg.create({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
  const row = seg.getById(id)
  expect(row.tipo_grade).toBe('AD')
})

test('upsert deduplicates by all 4 key fields including tipo_grade', () => {
  const seg = setup()
  const id1 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
  const id2 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
  expect(id1).toBe(id2)
})

test('upsert allows same (class, tipo_produto, classe) with different tipo_grade', () => {
  const seg = setup()
  const id1 = seg.upsert({ classificacao: 'EX', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'EX', estacao: 'inverno' })
  const id2 = seg.upsert({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
  expect(id1).not.toBe(id2)
})

test('list returns tipo_grade for all rows', () => {
  const seg = setup()
  seg.create({ classificacao: 'INF', tipo_produto: 'VESTIDO', classe: 'FEM', tipo_grade: 'INF', estacao: 'verao' })
  const list = seg.list()
  expect(list[0].tipo_grade).toBe('INF')
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd "C:\Users\eduke\Solução Compras" && npm test -- colecoes segmentacoes
```

Expected: `create returns full object` fails, `tipo_grade` tests fail.

- [ ] **Step 3: Fix colecoes.js**

Replace entire content of `electron/main/db/colecoes.js`:

```js
export function makeColecoes(db) {
  const insert = db.prepare(
    `INSERT INTO colecoes (nome, estacao, ano) VALUES (@nome, @estacao, @ano)`
  )
  const byId = db.prepare(`SELECT * FROM colecoes WHERE id = ?`)
  const all = db.prepare(`SELECT * FROM colecoes ORDER BY ano DESC, estacao`)
  const updateStatus = db.prepare(`UPDATE colecoes SET status = ? WHERE id = ?`)

  return {
    create({ nome, estacao, ano }) {
      const id = insert.run({ nome, estacao, ano }).lastInsertRowid
      return byId.get(id)
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

- [ ] **Step 4: Fix segmentacoes.js**

Replace entire content of `electron/main/db/segmentacoes.js`:

```js
export function makeSegmentacoes(db) {
  const insert = db.prepare(
    `INSERT INTO segmentacoes (classificacao, tipo_produto, classe, tipo_grade, estacao)
     VALUES (@classificacao, @tipo_produto, @classe, @tipo_grade, @estacao)`
  )
  const byId = db.prepare(`SELECT * FROM segmentacoes WHERE id = ?`)
  const all = db.prepare(
    `SELECT * FROM segmentacoes ORDER BY classificacao, tipo_produto, classe`
  )
  const byClass = db.prepare(
    `SELECT * FROM segmentacoes WHERE classificacao = ? ORDER BY tipo_produto, classe`
  )
  const findExact = db.prepare(
    `SELECT id FROM segmentacoes
     WHERE classificacao = @classificacao AND tipo_produto = @tipo_produto
       AND classe = @classe AND tipo_grade = @tipo_grade`
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

- [ ] **Step 5: Run tests to verify they pass**

```
cd "C:\Users\eduke\Solução Compras" && npm test -- colecoes segmentacoes
```

Expected: all 5 tests pass.

- [ ] **Step 6: Commit**

```
git add electron/main/db/colecoes.js electron/main/db/segmentacoes.js electron/main/db/__tests__/colecoes.test.js electron/main/db/__tests__/segmentacoes.test.js
git commit -m "fix(db): colecoes.create returns object; segmentacoes includes tipo_grade"
```

---

## Task 3: Create visitas.js + Rewrite pedidos.js

**Files:**
- Create: `electron/main/db/visitas.js`
- Rewrite: `electron/main/db/pedidos.js`

- [ ] **Step 1: Write tests**

Create `electron/main/db/__tests__/visitas-pedidos.test.js`:

```js
import Database from 'better-sqlite3'
import { runMigrations } from '../schema.js'
import { makeColecoes } from '../colecoes.js'
import { makeFornecedores } from '../fornecedores.js'
import { makeCompradores } from '../compradores.js'
import { makeSegmentacoes } from '../segmentacoes.js'
import { makeVisitas } from '../visitas.js'
import { makePedidos } from '../pedidos.js'

function setup() {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db)

  const col  = makeColecoes(db)
  const forn = makeFornecedores(db)
  const comp = makeCompradores(db)
  const seg  = makeSegmentacoes(db)
  const vis  = makeVisitas(db)
  const ped  = makePedidos(db)

  const colecao = col.create({ nome: 'Inverno 2026', estacao: 'inverno', ano: 2026 })
  const fornecedor = forn.create({ nome: 'LUNENDER', contato: '', categoria: 'CONFECCOES' })
  const comprador1 = comp.create({ nome: 'Irmãos Backes', cnpj: '08.889.201/0001-01', cidade: 'Três Coroas/RS' })
  const comprador2 = comp.create({ nome: 'Samuel Backes', cnpj: '15.563.106/0001-70', cidade: 'Três Coroas/RS' })
  const segId = seg.create({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })

  return { db, col, vis, ped, colecao, fornecedor, comprador1, comprador2, segId }
}

test('visitas.create returns full object', () => {
  const { vis, colecao, fornecedor } = setup()
  const visita = vis.create({
    fornecedor_id: fornecedor.id,
    colecao_id: colecao.id,
    data_visita: '2026-05-17',
    vendedor: 'Maria',
    cond_pag: '30 dias',
    frete: 'CIF',
    obs: ''
  })
  expect(visita).toMatchObject({ id: 1, fornecedor_id: fornecedor.id })
  expect(visita.fornecedor_nome).toBe('LUNENDER')
})

test('visitas.list returns visits with fornecedor name', () => {
  const { vis, colecao, fornecedor } = setup()
  vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' })
  const list = vis.list(colecao.id)
  expect(list).toHaveLength(1)
  expect(list[0].fornecedor_nome).toBe('LUNENDER')
})

test('pedidos.salvar creates header + itens, returns with itens', () => {
  const { vis, ped, colecao, fornecedor, comprador1, segId } = setup()
  const visita = vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: 'Maria', cond_pag: '30 dias', frete: 'CIF', obs: '' })

  const pedido = ped.salvar({
    visita_id: visita.id,
    comprador_id: comprador1.id,
    segmentacao_id: segId,
    valor_unitario: 45.00,
    desconto_pct: 0,
    transportadora: '',
    nota_fiscal: '',
    obs: '',
    itens: [
      { tamanho: 'PP', qtd: 10 },
      { tamanho: 'P',  qtd: 20 },
      { tamanho: 'M',  qtd: 15 },
    ]
  })

  expect(pedido.id).toBeDefined()
  expect(pedido.itens).toHaveLength(3)
  expect(pedido.itens.find(i => i.tamanho === 'M').qtd).toBe(15)
})

test('pedidos.byVisita returns all orders with buyer info and items', () => {
  const { vis, ped, colecao, fornecedor, comprador1, comprador2, segId } = setup()
  const visita = vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' })

  ped.salvar({ visita_id: visita.id, comprador_id: comprador1.id, segmentacao_id: segId, valor_unitario: 45, desconto_pct: 0, transportadora: '', nota_fiscal: '', obs: '', itens: [{ tamanho: 'M', qtd: 10 }] })
  ped.salvar({ visita_id: visita.id, comprador_id: comprador2.id, segmentacao_id: segId, valor_unitario: 45, desconto_pct: 0, transportadora: '', nota_fiscal: '', obs: '', itens: [{ tamanho: 'M', qtd: 5 }] })

  const pedidos = ped.byVisita(visita.id)
  expect(pedidos).toHaveLength(2)
  expect(pedidos[0].comprador_nome).toBeDefined()
  expect(pedidos[0].itens.length).toBeGreaterThan(0)
})

test('pedidos.totaisPorTamanho aggregates across all buyers and visits', () => {
  const { vis, ped, colecao, fornecedor, comprador1, comprador2, segId } = setup()
  const v1 = vis.create({ fornecedor_id: fornecedor.id, colecao_id: colecao.id, data_visita: '2026-05-17', vendedor: '', cond_pag: '', frete: '', obs: '' })

  ped.salvar({ visita_id: v1.id, comprador_id: comprador1.id, segmentacao_id: segId, valor_unitario: 45, desconto_pct: 0, transportadora: '', nota_fiscal: '', obs: '', itens: [{ tamanho: 'M', qtd: 10 }] })
  ped.salvar({ visita_id: v1.id, comprador_id: comprador2.id, segmentacao_id: segId, valor_unitario: 45, desconto_pct: 0, transportadora: '', nota_fiscal: '', obs: '', itens: [{ tamanho: 'M', qtd: 5 }] })

  const totais = ped.totaisPorTamanho(segId, colecao.id)
  const mRow = totais.find(r => r.tamanho === 'M')
  expect(mRow.total_pedido).toBe(15) // 10 + 5
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
cd "C:\Users\eduke\Solução Compras" && npm test -- visitas-pedidos
```

Expected: FAIL — `visitas.js` doesn't exist, `pedidos.js` has wrong interface.

- [ ] **Step 3: Create visitas.js**

Create `electron/main/db/visitas.js`:

```js
export function makeVisitas(db) {
  const insert = db.prepare(`
    INSERT INTO visitas (fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs)
    VALUES (@fornecedor_id, @colecao_id, @data_visita, @vendedor, @cond_pag, @frete, @obs)
  `)

  const byId = db.prepare(`
    SELECT v.*, f.nome AS fornecedor_nome
    FROM visitas v JOIN fornecedores f ON f.id = v.fornecedor_id
    WHERE v.id = ?
  `)

  const byColecao = db.prepare(`
    SELECT v.*, f.nome AS fornecedor_nome,
           COUNT(p.id) AS num_pedidos
    FROM visitas v
    JOIN fornecedores f ON f.id = v.fornecedor_id
    LEFT JOIN pedidos p ON p.visita_id = v.id
    WHERE v.colecao_id = ?
    GROUP BY v.id
    ORDER BY v.data_visita DESC
  `)

  return {
    create(data) {
      const id = insert.run(data).lastInsertRowid
      return byId.get(id)
    },
    list(colId) {
      return byColecao.all(colId)
    },
    getById(id) {
      return byId.get(id)
    }
  }
}
```

- [ ] **Step 4: Rewrite pedidos.js**

Replace entire content of `electron/main/db/pedidos.js`:

```js
export function makePedidos(db) {
  const insertHeader = db.prepare(`
    INSERT INTO pedidos
      (visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct,
       transportadora, nota_fiscal, obs)
    VALUES
      (@visita_id, @comprador_id, @segmentacao_id, @valor_unitario, @desconto_pct,
       @transportadora, @nota_fiscal, @obs)
  `)

  const insertItem = db.prepare(`
    INSERT INTO pedido_itens (pedido_id, tamanho, qtd) VALUES (?, ?, ?)
  `)

  const salvarTx = db.transaction((header, itens) => {
    const id = insertHeader.run(header).lastInsertRowid
    for (const item of itens) {
      insertItem.run(id, item.tamanho, item.qtd)
    }
    return id
  })

  const byId = db.prepare(`SELECT * FROM pedidos WHERE id = ?`)
  const itensByPedido = db.prepare(`SELECT * FROM pedido_itens WHERE pedido_id = ? ORDER BY tamanho`)

  const byVisita = db.prepare(`
    SELECT p.*,
           c.nome AS comprador_nome, c.cnpj, c.cidade,
           s.classificacao, s.tipo_produto, s.classe, s.tipo_grade
    FROM pedidos p
    JOIN compradores c ON c.id = p.comprador_id
    JOIN segmentacoes s ON s.id = p.segmentacao_id
    WHERE p.visita_id = ?
    ORDER BY c.nome, s.tipo_produto
  `)

  const totaisPorTamanho = db.prepare(`
    SELECT pi.tamanho, SUM(pi.qtd) AS total_pedido
    FROM pedido_itens pi
    JOIN pedidos p ON p.id = pi.pedido_id
    JOIN visitas v ON v.id = p.visita_id
    WHERE p.segmentacao_id = ? AND v.colecao_id = ?
    GROUP BY pi.tamanho
  `)

  return {
    salvar({ visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct = 0,
             transportadora = '', nota_fiscal = '', obs = '', itens }) {
      const id = salvarTx(
        { visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct,
          transportadora, nota_fiscal, obs },
        itens
      )
      return { ...byId.get(id), itens: itensByPedido.all(id) }
    },
    byVisita(visitaId) {
      const pedidos = byVisita.all(visitaId)
      return pedidos.map(p => ({ ...p, itens: itensByPedido.all(p.id) }))
    },
    totaisPorTamanho(segId, colId) {
      return totaisPorTamanho.all(segId, colId)
    }
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```
cd "C:\Users\eduke\Solução Compras" && npm test -- visitas-pedidos
```

Expected: 5 tests pass.

- [ ] **Step 6: Commit**

```
git add electron/main/db/visitas.js electron/main/db/pedidos.js electron/main/db/__tests__/visitas-pedidos.test.js
git commit -m "feat(db): create visitas.js, rewrite pedidos.js with header+itens model"
```

---

## Task 4: Update IPC (index.js + preload/index.js)

**Files:**
- Modify: `electron/main/index.js`
- Modify: `electron/preload/index.js`

- [ ] **Step 1: Update electron/main/index.js**

Replace file content:

```js
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { getDb } from './db/connection.js'
import { runMigrations } from './db/schema.js'
import { makeColecoes } from './db/colecoes.js'
import { makeSegmentacoes } from './db/segmentacoes.js'
import { makeGrades } from './db/grades.js'
import { makeProjecoes } from './db/projecoes.js'
import { makeFornecedores } from './db/fornecedores.js'
import { makeCompradores } from './db/compradores.js'
import { makeVisitas } from './db/visitas.js'
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

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
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
  const comp = makeCompradores(db)
  const vis  = makeVisitas(db)
  const ped  = makePedidos(db)

  // Colecoes
  ipcMain.handle('colecoes:list',      () => col.list())
  ipcMain.handle('colecoes:create',    (_, d) => col.create(d))
  ipcMain.handle('colecoes:setStatus', (_, id, status) => col.setStatus(id, status))

  // Segmentacoes
  ipcMain.handle('segmentacoes:list',   () => seg.list())
  ipcMain.handle('segmentacoes:create', (_, d) => seg.create(d))
  ipcMain.handle('segmentacoes:upsert', (_, d) => seg.upsert(d))

  // Grades
  ipcMain.handle('grades:save', (_, segId, colId, rows) => gr.saveGrade(segId, colId, rows))
  ipcMain.handle('grades:get',  (_, segId, colId) => gr.getGrade(segId, colId))

  // Projecoes
  ipcMain.handle('projecoes:calcular',  (_, segId, colId, baseIds, metodo) => proj.calcular(segId, colId, baseIds, metodo))
  ipcMain.handle('projecoes:salvar',    (_, segId, colId, rows, metodo)    => proj.salvar(segId, colId, rows, metodo))
  ipcMain.handle('projecoes:get',       (_, segId, colId)                  => proj.getProjecao(segId, colId))
  ipcMain.handle('projecoes:ajustar',   (_, segId, colId, tamanho, qtd)   => proj.ajustar(segId, colId, tamanho, qtd))
  ipcMain.handle('projecoes:restaurar', (_, segId, colId, tamanho)         => proj.restaurar(segId, colId, tamanho))

  // Fornecedores
  ipcMain.handle('fornecedores:list',   () => forn.list())
  ipcMain.handle('fornecedores:create', (_, d)      => forn.create(d))
  ipcMain.handle('fornecedores:update', (_, id, d)  => forn.update(id, d))

  // Compradores
  ipcMain.handle('compradores:list',   () => comp.list())
  ipcMain.handle('compradores:create', (_, d) => comp.create(d))

  // Visitas
  ipcMain.handle('visitas:create', (_, d)     => vis.create(d))
  ipcMain.handle('visitas:list',   (_, colId) => vis.list(colId))
  ipcMain.handle('visitas:byId',   (_, id)    => vis.getById(id))

  // Pedidos
  ipcMain.handle('pedidos:salvar',          (_, d)            => ped.salvar(d))
  ipcMain.handle('pedidos:byVisita',        (_, visitaId)     => ped.byVisita(visitaId))
  ipcMain.handle('pedidos:totaisPorTamanho',(_, segId, colId) => ped.totaisPorTamanho(segId, colId))

  // Backup / Restore
  ipcMain.handle('backup:export', async () => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Exportar backup',
      defaultPath: `solucao-compras-backup-${new Date().toISOString().slice(0,10)}.db`,
      filters: [{ name: 'Database', extensions: ['db'] }]
    })
    if (!filePath) return false
    fs.copyFileSync(db.filename, filePath)
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
    fs.copyFileSync(filePaths[0], db.filename)
    for (const ext of ['-wal', '-shm']) {
      try { fs.unlinkSync(db.filename + ext) } catch {}
    }
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

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
```

- [ ] **Step 2: Update electron/preload/index.js**

Replace file content:

```js
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
    list:   ()      => ipcRenderer.invoke('fornecedores:list'),
    create: (d)     => ipcRenderer.invoke('fornecedores:create', d),
    update: (id, d) => ipcRenderer.invoke('fornecedores:update', id, d),
  },
  compradores: {
    list:   ()  => ipcRenderer.invoke('compradores:list'),
    create: (d) => ipcRenderer.invoke('compradores:create', d),
  },
  visitas: {
    create: (d)     => ipcRenderer.invoke('visitas:create', d),
    list:   (colId) => ipcRenderer.invoke('visitas:list', colId),
    byId:   (id)    => ipcRenderer.invoke('visitas:byId', id),
  },
  pedidos: {
    salvar:          (d)            => ipcRenderer.invoke('pedidos:salvar', d),
    byVisita:        (visitaId)     => ipcRenderer.invoke('pedidos:byVisita', visitaId),
    totaisPorTamanho:(segId, colId) => ipcRenderer.invoke('pedidos:totaisPorTamanho', segId, colId),
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

- [ ] **Step 3: Run tests (all should still pass)**

```
cd "C:\Users\eduke\Solução Compras" && npm test
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```
git add electron/main/index.js electron/preload/index.js
git commit -m "feat(ipc): expose visitas handlers, update pedidos to new contract"
```

---

## Task 5: Rewrite demo/src/mockApi.js

**Files:**
- Rewrite: `demo/src/mockApi.js`

The mock must match the same API contract as the Electron preload so demo and desktop behave identically.

- [ ] **Step 1: Rewrite demo/src/mockApi.js**

Replace entire content of `demo/src/mockApi.js`:

```js
// demo/src/mockApi.js — in-memory mock matching the Electron window.api contract

let nextId = 100

function uid() { return nextId++ }

// ── Seed data ──────────────────────────────────────────────────────────────

const colecoesList = [
  { id: 1, nome: 'Inverno 2026/1', estacao: 'inverno', ano: 2026, status: 'em_compra' }
]

const segmentacoesList = [
  { id: 1, classificacao: 'AD', tipo_produto: 'BERMUDA',  classe: 'FEM',  tipo_grade: 'AD',  estacao: 'inverno' },
  { id: 2, classificacao: 'AD', tipo_produto: 'CALCA',    classe: 'MASC', tipo_grade: 'AD',  estacao: 'inverno' },
  { id: 3, classificacao: 'EX', tipo_produto: 'BLUSINHA', classe: 'FEM',  tipo_grade: 'EX',  estacao: 'inverno' },
  { id: 4, classificacao: 'INF',tipo_produto: 'VESTIDO',  classe: 'FEM',  tipo_grade: 'INF', estacao: 'inverno' },
]

const fornecedoresList = [
  { id: 1, nome: 'LUNENDER',   contato: '', categoria: 'CONFECCOES' },
  { id: 2, nome: 'GANGSTER',   contato: '', categoria: 'ACESSORIOS'  },
  { id: 3, nome: 'FAKINI',     contato: '', categoria: 'CONFECCOES' },
  { id: 4, nome: 'ROVITEX',    contato: '', categoria: 'CONFECCOES' },
  { id: 5, nome: 'BIOGAS',     contato: '', categoria: 'CONFECCOES' },
  { id: 6, nome: 'CROCKER',    contato: '', categoria: 'CONFECCOES' },
  { id: 7, nome: 'HUTTZ',      contato: '', categoria: 'CONFECCOES' },
  { id: 8, nome: 'MOONCITY',   contato: '', categoria: 'CONFECCOES' },
]

const compradoresList = [
  { id: 1, nome: 'Irmãos Backes',        cnpj: '08.889.201/0001-01', cidade: 'Três Coroas/RS' },
  { id: 2, nome: 'Samuel Paulo Backes',  cnpj: '15.563.106/0001-70', cidade: 'Três Coroas/RS' },
  { id: 3, nome: 'PSM Backes',           cnpj: '28.010.922/0001-07', cidade: 'Igrejinha/RS'   },
  { id: 4, nome: 'Alexandre Backes',     cnpj: '06.284.903/0001-28', cidade: ''               },
  { id: 5, nome: 'Elisangela M. Backes', cnpj: '13.706.244/0001-36', cidade: 'Santa Maria do Herval/RS' },
  { id: 6, nome: 'Rafael J. Backes',     cnpj: '46.348.002/0001-77', cidade: 'Rolante/RS'     },
  { id: 7, nome: 'Streit Conf',          cnpj: '10.206.469/0001-35', cidade: 'Riozinho/RS'    },
  { id: 8, nome: 'FMV Streit Conf',      cnpj: '20.354.516/0001-41', cidade: 'Rolante/RS'     },
]

const projecoesList = [
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'PP', qtd_ajustada: 50, qtd_projetada: 50 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'P',  qtd_ajustada: 80, qtd_projetada: 80 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'M',  qtd_ajustada: 60, qtd_projetada: 60 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'G',  qtd_ajustada: 40, qtd_projetada: 40 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'GG', qtd_ajustada: 20, qtd_projetada: 20 },
  { segmentacao_id: 1, colecao_id: 1, tamanho: 'XG', qtd_ajustada: 10, qtd_projetada: 10 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'PP', qtd_ajustada: 40, qtd_projetada: 40 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'P',  qtd_ajustada: 70, qtd_projetada: 70 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'M',  qtd_ajustada: 50, qtd_projetada: 50 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'G',  qtd_ajustada: 30, qtd_projetada: 30 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'GG', qtd_ajustada: 20, qtd_projetada: 20 },
  { segmentacao_id: 2, colecao_id: 1, tamanho: 'XG', qtd_ajustada: 10, qtd_projetada: 10 },
  { segmentacao_id: 3, colecao_id: 1, tamanho: 'G1', qtd_ajustada: 30, qtd_projetada: 30 },
  { segmentacao_id: 3, colecao_id: 1, tamanho: 'G2', qtd_ajustada: 40, qtd_projetada: 40 },
  { segmentacao_id: 3, colecao_id: 1, tamanho: 'G3', qtd_ajustada: 35, qtd_projetada: 35 },
]

const visitasList = []
const pedidosList = []
const pedidoItensList = []

// ── Helpers ────────────────────────────────────────────────────────────────

function delay(ms = 40) { return new Promise(r => setTimeout(r, ms)) }

function totaisPorTamanhoCalc(segId, colId) {
  const pedIds = pedidosList
    .filter(p => p.segmentacao_id === segId)
    .filter(p => {
      const v = visitasList.find(v => v.id === p.visita_id)
      return v && v.colecao_id === colId
    })
    .map(p => p.id)

  const map = {}
  for (const item of pedidoItensList) {
    if (pedIds.includes(item.pedido_id)) {
      map[item.tamanho] = (map[item.tamanho] ?? 0) + item.qtd
    }
  }
  return Object.entries(map).map(([tamanho, total_pedido]) => ({ tamanho, total_pedido }))
}

function enrichVisita(v) {
  const forn = fornecedoresList.find(f => f.id === v.fornecedor_id)
  const numPedidos = pedidosList.filter(p => p.visita_id === v.id).length
  return { ...v, fornecedor_nome: forn?.nome ?? '', num_pedidos: numPedidos }
}

function enrichPedido(p) {
  const comp = compradoresList.find(c => c.id === p.comprador_id)
  const seg  = segmentacoesList.find(s => s.id === p.segmentacao_id)
  const itens = pedidoItensList.filter(i => i.pedido_id === p.id)
  return {
    ...p,
    comprador_nome: comp?.nome ?? '',
    cnpj:   comp?.cnpj ?? '',
    cidade: comp?.cidade ?? '',
    classificacao: seg?.classificacao ?? '',
    tipo_produto:  seg?.tipo_produto ?? '',
    classe:        seg?.classe ?? '',
    tipo_grade:    seg?.tipo_grade ?? '',
    itens,
  }
}

// ── API ────────────────────────────────────────────────────────────────────

export const mockApi = {
  colecoes: {
    async list() {
      await delay()
      return [...colecoesList]
    },
    async create(dados) {
      await delay()
      const nova = { id: uid(), status: 'planejamento', ...dados }
      colecoesList.push(nova)
      return nova
    },
    async setStatus(id, status) {
      await delay()
      const c = colecoesList.find(c => c.id === id)
      if (c) c.status = status
    },
  },

  segmentacoes: {
    async list() {
      await delay()
      return [...segmentacoesList]
    },
    async create(d) {
      await delay()
      const nova = { id: uid(), ...d }
      segmentacoesList.push(nova)
      return nova.id
    },
    async upsert(d) {
      await delay()
      const existing = segmentacoesList.find(s =>
        s.classificacao === d.classificacao &&
        s.tipo_produto  === d.tipo_produto  &&
        s.classe        === d.classe        &&
        s.tipo_grade    === d.tipo_grade
      )
      if (existing) return existing.id
      const nova = { id: uid(), ...d }
      segmentacoesList.push(nova)
      return nova.id
    },
  },

  grades: {
    async save() { await delay() },
    async get()  { await delay(); return [] },
  },

  projecoes: {
    async get(segId, colId) {
      await delay()
      return projecoesList.filter(p => p.segmentacao_id === segId && p.colecao_id === colId)
    },
    async calcular() { await delay(); return [] },
    async salvar()   { await delay() },
    async ajustar()  { await delay() },
    async restaurar(){ await delay() },
  },

  fornecedores: {
    async list() {
      await delay()
      return [...fornecedoresList]
    },
    async create(d) {
      await delay()
      const f = { id: uid(), contato: '', categoria: '', ...d }
      fornecedoresList.push(f)
      return f
    },
    async update(id, d) {
      await delay()
      const idx = fornecedoresList.findIndex(f => f.id === id)
      if (idx !== -1) fornecedoresList[idx] = { ...fornecedoresList[idx], ...d }
    },
  },

  compradores: {
    async list() {
      await delay()
      return [...compradoresList]
    },
    async create(d) {
      await delay()
      const c = { id: uid(), cnpj: '', cidade: '', ...d }
      compradoresList.push(c)
      return c
    },
  },

  visitas: {
    async create(d) {
      await delay()
      const forn = fornecedoresList.find(f => f.id === d.fornecedor_id)
      const v = { id: uid(), ...d, fornecedor_nome: forn?.nome ?? '', num_pedidos: 0 }
      visitasList.push(v)
      return v
    },
    async list(colId) {
      await delay()
      return visitasList
        .filter(v => v.colecao_id === colId)
        .map(enrichVisita)
        .sort((a, b) => b.data_visita.localeCompare(a.data_visita))
    },
    async byId(id) {
      await delay()
      const v = visitasList.find(v => v.id === id)
      return v ? enrichVisita(v) : null
    },
  },

  pedidos: {
    async salvar({ visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct = 0,
                   transportadora = '', nota_fiscal = '', obs = '', itens }) {
      await delay()
      const id = uid()
      pedidosList.push({ id, visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct, transportadora, nota_fiscal, obs })
      for (const item of itens) {
        pedidoItensList.push({ id: uid(), pedido_id: id, tamanho: item.tamanho, qtd: item.qtd })
      }
      return enrichPedido(pedidosList.find(p => p.id === id))
    },
    async byVisita(visitaId) {
      await delay()
      return pedidosList
        .filter(p => p.visita_id === visitaId)
        .map(enrichPedido)
    },
    async totaisPorTamanho(segId, colId) {
      await delay()
      return totaisPorTamanhoCalc(segId, colId)
    },
  },

  backup: {
    async export() { return false },
    async import() { return false },
  },

  dialog: {
    async openFile() { return null },
  },
}
```

- [ ] **Step 2: Verify demo still starts**

```
cd "C:\Users\eduke\Solução Compras\demo" && npm run dev
```

Open `http://localhost:5174` in browser. Expected: app loads, Compras screen accessible, no console errors.

- [ ] **Step 3: Commit**

```
git add demo/src/mockApi.js
git commit -m "feat(demo): rewrite mockApi with visitas+pedidos redesign, 8 compradores"
```

---

## Task 6: Rewrite Compras.jsx + update seed-test.cjs

**Files:**
- Rewrite: `src/renderer/src/screens/Compras.jsx`
- Modify: `src/renderer/src/screens/Compras.module.css`
- Modify: `seed-test.cjs`

### Phase 1 — IniciarVisita
User selects fornecedor, date, vendedor, cond_pag, frete. Then picks which compradores are present (checkboxes). Clicks "Iniciar Visita" → creates visita record, advances to Phase 2.

### Phase 2 — RegistrarPedido
Top bar shows: fornecedor | date. Below: select comprador (dropdown of those present in this visit) + select segmentação. Grade table. Header fields per pedido (valor, desconto, transportadora, NF, obs). "Adicionar pedido" saves and shows in the list below. "Fechar visita" when done adding.

### Phase 3 — FecharVisita
Lists all pedidos grouped by comprador. Button "Gerar PDFs" opens a window with one page per comprador's orders. Each PDF page = one comprador's header info + their size/qty table.

- [ ] **Step 1: Rewrite Compras.jsx**

Replace entire content of `src/renderer/src/screens/Compras.jsx`:

```jsx
import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import SegmentacaoSelect from '../components/SegmentacaoSelect'
import { GRADE_LABEL, GRADE_SIZES } from '../utils/gradeConfig'
import styles from './Compras.module.css'

const fmt = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = iso => { if (!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}` }
const today = () => new Date().toISOString().slice(0, 10)

// ─── Phase 1: Start Visit ─────────────────────────────────────────────────

function IniciarVisita({ forns, compradores, colId, onStart }) {
  const [fornId,      setFornId]      = useState('')
  const [data,        setData]        = useState(today())
  const [vendedor,    setVendedor]    = useState('')
  const [condPag,     setCondPag]     = useState('')
  const [frete,       setFrete]       = useState('')
  const [presentes,   setPresentes]   = useState([])
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState(null)

  function togglePresente(id) {
    setPresentes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleStart() {
    if (!fornId || presentes.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const visita = await window.api.visitas.create({
        fornecedor_id: Number(fornId),
        colecao_id: colId,
        data_visita: data,
        vendedor,
        cond_pag: condPag,
        frete,
        obs: ''
      })
      const compradoresPresentes = compradores.filter(c => presentes.includes(c.id))
      onStart(visita, compradoresPresentes)
    } catch {
      setError('Erro ao iniciar visita.')
    } finally {
      setSaving(false)
    }
  }

  const canStart = fornId && presentes.length > 0 && !saving

  return (
    <div className={styles.phase}>
      <h2 className={styles.phaseTitle}>Fase 1 — Iniciar Visita ao Fornecedor</h2>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span className={styles.label}>Fornecedor</span>
          <select value={fornId} onChange={e => setFornId(e.target.value)}>
            <option value="">Selecione…</option>
            {forns.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Data da visita</span>
          <input type="date" value={data} onChange={e => setData(e.target.value)} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Vendedor</span>
          <input type="text" placeholder="Nome do vendedor" value={vendedor}
            onChange={e => setVendedor(e.target.value)} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Cond. pagamento</span>
          <input type="text" placeholder="Ex: 30/60 dias" value={condPag}
            onChange={e => setCondPag(e.target.value)} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Frete</span>
          <select value={frete} onChange={e => setFrete(e.target.value)}>
            <option value="">—</option>
            <option value="CIF">CIF</option>
            <option value="FOB">FOB</option>
          </select>
        </div>
      </div>

      <div className={styles.presentesSection}>
        <span className={styles.label}>Compradores presentes nesta visita</span>
        <div className={styles.checkGrid}>
          {compradores.map(c => (
            <label key={c.id} className={styles.checkItem}>
              <input type="checkbox" checked={presentes.includes(c.id)}
                onChange={() => togglePresente(c.id)} />
              <span>{c.nome}</span>
              {c.cidade && <span className={styles.cidade}>{c.cidade}</span>}
            </label>
          ))}
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.phaseActions}>
        <button className={styles.btnPrimary} disabled={!canStart} onClick={handleStart}>
          Iniciar Visita →
        </button>
      </div>
    </div>
  )
}

// ─── Phase 2: Register Orders ─────────────────────────────────────────────

function RegistrarPedido({ visita, compradores, segs, colId, onFechar }) {
  const [pedidosSalvos, setPedidosSalvos] = useState([])
  const [compradorId,   setCompradorId]   = useState(compradores[0]?.id ?? '')
  const [segId,         setSegId]         = useState(null)
  const [proj,          setProj]          = useState([])
  const [totais,        setTotais]        = useState([])
  const [qtds,          setQtds]          = useState({})
  const [valor,         setValor]         = useState('')
  const [desconto,      setDesconto]      = useState('')
  const [transportadora,setTransportadora]= useState('')
  const [notaFiscal,    setNotaFiscal]    = useState('')
  const [obs,           setObs]           = useState('')
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState(null)

  useEffect(() => {
    if (!segId || !colId) { setProj([]); setTotais([]); setQtds({}); return }
    Promise.all([
      window.api.projecoes.get(segId, colId),
      window.api.pedidos.totaisPorTamanho(segId, colId),
    ]).then(([p, t]) => { setProj(p); setTotais(t); setQtds({}) })
  }, [segId, colId])

  const getComprado = t => totais.find(r => r.tamanho === t)?.total_pedido ?? 0
  const getSaldo    = (t, pj) => Math.max(0, pj - getComprado(t))

  function handleQty(tamanho, raw) {
    const val = parseInt(raw, 10)
    setQtds(prev => ({ ...prev, [tamanho]: isNaN(val) || val < 0 ? 0 : val }))
  }

  const totalQtd    = Object.values(qtds).reduce((s, q) => s + q, 0)
  const valorNum    = parseFloat(valor.replace(',', '.')) || 0
  const descontoNum = Math.min(100, Math.max(0, parseFloat(desconto.replace(',', '.')) || 0))
  const valorBruto  = totalQtd * valorNum
  const valorLiq    = valorBruto * (1 - descontoNum / 100)

  const selectedSeg = segs.find(s => s.id === segId)
  const canAdd = !saving && compradorId && segId && totalQtd > 0 && valorNum > 0

  async function handleAdicionar() {
    const itens = proj
      .map(r => ({ tamanho: r.tamanho, qtd: qtds[r.tamanho] ?? 0 }))
      .filter(i => i.qtd > 0)
    if (!itens.length) return

    setSaving(true)
    setError(null)
    try {
      const pedido = await window.api.pedidos.salvar({
        visita_id:      visita.id,
        comprador_id:   Number(compradorId),
        segmentacao_id: segId,
        valor_unitario: valorNum,
        desconto_pct:   descontoNum,
        transportadora,
        nota_fiscal:    notaFiscal,
        obs,
        itens,
      })
      setPedidosSalvos(prev => [...prev, pedido])
      const newTotais = await window.api.pedidos.totaisPorTamanho(segId, colId)
      setTotais(newTotais)
      setQtds({})
      setValor('')
      setDesconto('')
      setTransportadora('')
      setNotaFiscal('')
      setObs('')
    } catch {
      setError('Erro ao salvar pedido.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.phase}>
      <div className={styles.visitaBanner}>
        <strong>{visita.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(visita.data_visita)}</span>
        {visita.vendedor && <><span className={styles.dot}>·</span><span>Vendedor: {visita.vendedor}</span></>}
        {visita.cond_pag && <><span className={styles.dot}>·</span><span>{visita.cond_pag}</span></>}
        {visita.frete    && <><span className={styles.dot}>·</span><span>Frete: {visita.frete}</span></>}
      </div>

      <h2 className={styles.phaseTitle}>Fase 2 — Registrar Pedidos</h2>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span className={styles.label}>Comprador</span>
          <select value={compradorId} onChange={e => setCompradorId(Number(e.target.value))}>
            {compradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Segmentação</span>
          <SegmentacaoSelect segs={segs} value={segId} onChange={setSegId} />
        </div>
        {selectedSeg?.tipo_grade && (
          <div className={styles.field} style={{ alignSelf: 'flex-end' }}>
            <span className={styles.gradeBadge}>
              Grade: {GRADE_LABEL[selectedSeg.tipo_grade] ?? selectedSeg.tipo_grade}
            </span>
          </div>
        )}
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <span className={styles.label}>Valor unitário (R$)</span>
          <input type="text" placeholder="0,00" value={valor}
            onChange={e => setValor(e.target.value)} style={{ width: 90 }} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Desconto (%)</span>
          <input type="text" placeholder="0" value={desconto}
            onChange={e => setDesconto(e.target.value)} style={{ width: 64 }} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Transportadora</span>
          <input type="text" placeholder="Nome" value={transportadora}
            onChange={e => setTransportadora(e.target.value)} style={{ width: 150 }} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Nota fiscal</span>
          <input type="text" placeholder="Nº NF" value={notaFiscal}
            onChange={e => setNotaFiscal(e.target.value)} style={{ width: 90 }} />
        </div>
        <div className={`${styles.field} ${styles.fieldGrow}`}>
          <span className={styles.label}>Observações</span>
          <input type="text" placeholder="Obs…" value={obs}
            onChange={e => setObs(e.target.value)} />
        </div>
      </div>

      {!segId && <div className={styles.placeholder}>Selecione uma segmentação para ver a grade.</div>}
      {segId && proj.length === 0 && (
        <div className={styles.placeholder}>Sem projeção para esta segmentação. Acesse Planejamento primeiro.</div>
      )}
      {segId && proj.length > 0 && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tamanho</th>
                  <th style={{ color: 'var(--purple)' }}>Projeção</th>
                  <th style={{ color: 'var(--green)' }}>Já comprado</th>
                  <th style={{ color: 'var(--yellow)' }}>Saldo</th>
                  <th>Qtd neste pedido</th>
                </tr>
              </thead>
              <tbody>
                {proj.map(r => {
                  const comprado = getComprado(r.tamanho)
                  const saldo    = getSaldo(r.tamanho, r.qtd_ajustada)
                  return (
                    <tr key={r.tamanho}>
                      <td>{r.tamanho}</td>
                      <td style={{ color: 'var(--purple)' }}>{r.qtd_ajustada}</td>
                      <td style={{ color: 'var(--green)' }}>{comprado}</td>
                      <td>{saldo === 0 ? <span className={styles.checkCell}>0 ✓</span> : <span style={{ color: 'var(--yellow)' }}>{saldo}</span>}</td>
                      <td>
                        <input type="number" min="0" className={styles.qtyInput}
                          value={qtds[r.tamanho] ?? 0}
                          onChange={e => handleQty(r.tamanho, e.target.value)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td style={{ color: 'var(--purple)' }}>{proj.reduce((s,r) => s + r.qtd_ajustada, 0)}</td>
                  <td style={{ color: 'var(--green)' }}>{totais.reduce((s,r) => s + r.total_pedido, 0)}</td>
                  <td>{proj.reduce((s,r) => s + getSaldo(r.tamanho, r.qtd_ajustada), 0)}</td>
                  <td>{totalQtd}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={styles.tableFooter}>
            <div className={styles.totals}>
              <span>Bruto: <strong>R$ {fmt(valorBruto)}</strong></span>
              {descontoNum > 0 && <span style={{ color: 'var(--text-muted)' }}>Desconto {descontoNum}%: <strong>− R$ {fmt(valorBruto - valorLiq)}</strong></span>}
              <span>Líquido: <strong className={styles.totalValue}>R$ {fmt(valorLiq)}</strong></span>
            </div>
            <div className={styles.actions}>
              {error && <span className={styles.inlineError}>{error}</span>}
              <button className={styles.btnPrimary} disabled={!canAdd} onClick={handleAdicionar}>
                + Adicionar pedido
              </button>
            </div>
          </div>
        </>
      )}

      {pedidosSalvos.length > 0 && (
        <div className={styles.pedidosSalvos}>
          <div className={styles.pedidosSalvosTitle}>Pedidos registrados nesta visita ({pedidosSalvos.length})</div>
          {pedidosSalvos.map((p, i) => {
            const comp = compradores.find(c => c.id === p.comprador_id)
            const seg  = segs.find(s => s.id === p.segmentacao_id)
            const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
            const totalV = totalQ * p.valor_unitario * (1 - p.desconto_pct / 100)
            return (
              <div key={i} className={styles.pedidoRow}>
                <strong>{comp?.nome ?? `Comprador #${p.comprador_id}`}</strong>
                <span className={styles.dot}>·</span>
                <span>{seg ? `${seg.classificacao} ${seg.tipo_produto} ${seg.classe}` : `Seg #${p.segmentacao_id}`}</span>
                <span className={styles.dot}>·</span>
                <span>{p.itens.map(i => `${i.tamanho}:${i.qtd}`).join(' ')}</span>
                <span className={styles.dot}>·</span>
                <span>R$ {fmt(totalV)}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.phaseActions}>
        <button className={styles.btnSecondary} disabled={pedidosSalvos.length === 0}
          onClick={() => onFechar(pedidosSalvos)}>
          Fechar visita e gerar PDFs →
        </button>
      </div>
    </div>
  )
}

// ─── Phase 3: Close Visit + PDFs ──────────────────────────────────────────

function FecharVisita({ visita, compradores, segs, pedidos, onNovaVisita }) {
  const dateStr = new Date().toLocaleDateString('pt-BR')

  function handleGerarPDFs() {
    const compradoresComPedidos = compradores.filter(c =>
      pedidos.some(p => p.comprador_id === c.id)
    )

    const ordersHtml = compradoresComPedidos.map((comp, idx) => {
      const compPedidos = pedidos.filter(p => p.comprador_id === comp.id)
      const isLast = idx === compradoresComPedidos.length - 1

      const pedidosHtml = compPedidos.map(p => {
        const seg = segs.find(s => s.id === p.segmentacao_id)
        const segLabel = seg
          ? `${seg.classificacao} — ${seg.tipo_produto} — ${seg.classe} (Grade ${GRADE_LABEL[seg.tipo_grade] ?? seg.tipo_grade ?? ''})`
          : `Segmentação #${p.segmentacao_id}`
        const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
        const totalV = totalQ * p.valor_unitario * (1 - p.desconto_pct / 100)

        const rowsHtml = p.itens.filter(i => i.qtd > 0).map(i =>
          `<tr><td style="text-align:left; padding:5px 10px;">${i.tamanho}</td><td style="text-align:right; padding:5px 10px;">${i.qtd}</td></tr>`
        ).join('')

        return `
          <div class="seg-block">
            <div class="seg-title">${segLabel}</div>
            <table>
              <thead><tr><th style="text-align:left;">Tamanho</th><th>Quantidade</th></tr></thead>
              <tbody>${rowsHtml}</tbody>
              <tfoot>
                <tr>
                  <td style="text-align:left; font-weight:bold; border-top:2px solid #aaa; padding:5px 10px;">Total</td>
                  <td style="font-weight:bold; border-top:2px solid #aaa; padding:5px 10px; text-align:right;">${totalQ}</td>
                </tr>
              </tfoot>
            </table>
            <div class="totals">
              <div>Valor unitário: <strong>R$ ${p.valor_unitario.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
              ${p.desconto_pct > 0 ? `<div>Desconto: <strong>${p.desconto_pct}%</strong></div>` : ''}
              <div style="font-size:14px; margin-top:4px;">Valor líquido: <strong>R$ ${totalV.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div>
            </div>
            ${p.transportadora ? `<div class="obs-row">Transportadora: ${p.transportadora}</div>` : ''}
            ${p.nota_fiscal    ? `<div class="obs-row">Nota fiscal: ${p.nota_fiscal}</div>` : ''}
            ${p.obs            ? `<div class="obs-row">Obs: ${p.obs}</div>` : ''}
          </div>`
      }).join('')

      return `
        <div class="order"${isLast ? ' style="page-break-after:avoid;"' : ''}>
          <h1>PEDIDO DE COMPRA</h1>
          <p style="font-size:10px; color:#888; margin-bottom:12px;">Gerado em: ${dateStr}</p>

          <div class="section">
            <div class="section-title">Fornecedor</div>
            <div class="row"><span class="lbl">Fornecedor:</span><span>${visita.fornecedor_nome}</span></div>
            ${visita.vendedor ? `<div class="row"><span class="lbl">Vendedor:</span><span>${visita.vendedor}</span></div>` : ''}
            <div class="row"><span class="lbl">Data pedido:</span><span>${fmtDate(visita.data_visita)}</span></div>
            ${visita.cond_pag ? `<div class="row"><span class="lbl">Cond. pag.:</span><span>${visita.cond_pag}</span></div>` : ''}
            ${visita.frete    ? `<div class="row"><span class="lbl">Frete:</span><span>${visita.frete}</span></div>` : ''}
          </div>

          <div class="section" style="border-top:1px solid #ddd; padding-top:10px;">
            <div class="section-title">Comprador</div>
            <div class="row"><span class="lbl">Nome:</span><span><strong>${comp.nome}</strong></span></div>
            <div class="row"><span class="lbl">CNPJ:</span><span>${comp.cnpj}</span></div>
            ${comp.cidade ? `<div class="row"><span class="lbl">Cidade:</span><span>${comp.cidade}</span></div>` : ''}
          </div>

          ${pedidosHtml}

          <div class="footer">Gerado por Solução Compras — ${dateStr}</div>
        </div>`
    }).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pedidos — ${visita.fornecedor_nome} — ${fmtDate(visita.data_visita)}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; margin: 0; }
    .order { padding: 24px; page-break-after: always; }
    .order:last-child { page-break-after: avoid; }
    h1 { font-size: 16px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 4px; }
    .section { margin: 12px 0; }
    .section-title { font-weight:bold; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#555; margin-bottom:6px; }
    .row { display: flex; gap: 24px; margin-bottom: 4px; }
    .lbl { font-weight: bold; min-width: 120px; }
    .seg-block { margin: 16px 0; border-top: 1px solid #ddd; padding-top: 10px; }
    .seg-title { font-weight: bold; font-size: 11px; color: #333; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: right; }
    th:first-child, td:first-child { text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    .totals { margin-top: 10px; text-align: right; line-height: 1.7; }
    .obs-row { margin-top: 4px; font-size: 11px; color: #555; }
    .footer { margin-top: 24px; font-size: 10px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
    @media print { @page { margin: 15mm; } }
  </style>
</head>
<body>${ordersHtml}</body>
</html>`

    const win = window.open('', '_blank')
    if (!win) { alert('Bloqueador de pop-ups ativo. Permita pop-ups para este site.'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    win.addEventListener('load', () => win.print())
  }

  const compradoresComPedidos = compradores.filter(c => pedidos.some(p => p.comprador_id === c.id))
  const totalGeral = pedidos.reduce((s, p) => {
    const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
    return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
  }, 0)

  return (
    <div className={styles.phase}>
      <div className={styles.visitaBanner}>
        <strong>{visita.fornecedor_nome}</strong>
        <span className={styles.dot}>·</span>
        <span>{fmtDate(visita.data_visita)}</span>
        <span className={styles.dot}>·</span>
        <span>{pedidos.length} pedido(s) · {compradoresComPedidos.length} comprador(es)</span>
      </div>

      <h2 className={styles.phaseTitle}>Fase 3 — Resumo da Visita</h2>

      <div className={styles.resumoGrid}>
        {compradoresComPedidos.map(comp => {
          const compPedidos = pedidos.filter(p => p.comprador_id === comp.id)
          const totalComp = compPedidos.reduce((s, p) => {
            const q = p.itens.reduce((s2, i) => s2 + i.qtd, 0)
            return s + q * p.valor_unitario * (1 - p.desconto_pct / 100)
          }, 0)
          return (
            <div key={comp.id} className={styles.resumoCard}>
              <div className={styles.resumoCardHeader}>{comp.nome}</div>
              {compPedidos.map((p, i) => {
                const seg = segs.find(s => s.id === p.segmentacao_id)
                const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
                return (
                  <div key={i} className={styles.resumoItem}>
                    <span>{seg ? `${seg.tipo_produto} ${seg.classe}` : `Seg #${p.segmentacao_id}`}</span>
                    <span>{totalQ} pç</span>
                  </div>
                )
              })}
              <div className={styles.resumoTotal}>R$ {fmt(totalComp)}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.resumoGeralTotal}>
        Total geral: <strong>R$ {fmt(totalGeral)}</strong>
      </div>

      <div className={styles.phaseActions}>
        <button className={styles.btnSecondary} onClick={onNovaVisita}>
          ← Nova visita
        </button>
        <button className={styles.btnPrimary} onClick={handleGerarPDFs}>
          Gerar PDFs ({compradoresComPedidos.length})
        </button>
      </div>
    </div>
  )
}

// ─── Orchestrator ─────────────────────────────────────────────────────────

export default function Compras() {
  const { active } = useCollection()
  const [segs,        setSegs]        = useState([])
  const [forns,       setForns]       = useState([])
  const [compradores, setCompradores] = useState([])
  const [phase,       setPhase]       = useState(1)
  const [visita,      setVisita]      = useState(null)
  const [compPresentes, setCompPresentes] = useState([])
  const [pedidosFechados, setPedidosFechados] = useState([])

  useEffect(() => {
    Promise.all([
      window.api.segmentacoes.list(),
      window.api.fornecedores.list(),
      window.api.compradores.list(),
    ]).then(([s, f, c]) => { setSegs(s); setForns(f); setCompradores(c) })
  }, [])

  function handleStart(novaVisita, presentes) {
    setVisita(novaVisita)
    setCompPresentes(presentes)
    setPhase(2)
  }

  function handleFechar(pedidos) {
    setPedidosFechados(pedidos)
    setPhase(3)
  }

  function handleNovaVisita() {
    setVisita(null)
    setCompPresentes([])
    setPedidosFechados([])
    setPhase(1)
  }

  if (!active) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Compras</h1>
        <div className={styles.placeholder}>Selecione uma coleção ativa na barra lateral.</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Compras — {active.nome}</h1>
      <div className={styles.stepBar}>
        {['Iniciar visita', 'Registrar pedidos', 'Gerar PDFs'].map((label, i) => (
          <div key={i} className={`${styles.step} ${phase === i + 1 ? styles.stepActive : ''} ${phase > i + 1 ? styles.stepDone : ''}`}>
            <span className={styles.stepNum}>{i + 1}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {phase === 1 && (
        <IniciarVisita
          forns={forns}
          compradores={compradores}
          colId={active.id}
          onStart={handleStart}
        />
      )}
      {phase === 2 && visita && (
        <RegistrarPedido
          visita={visita}
          compradores={compPresentes}
          segs={segs}
          colId={active.id}
          onFechar={handleFechar}
        />
      )}
      {phase === 3 && visita && (
        <FecharVisita
          visita={visita}
          compradores={compPresentes}
          segs={segs}
          pedidos={pedidosFechados}
          onNovaVisita={handleNovaVisita}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update Compras.module.css**

Add these new styles to the existing `src/renderer/src/screens/Compras.module.css` (keep all existing rules, append at the end):

```css
/* Phase wizard */
.stepBar {
  display: flex;
  gap: 0;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}
.step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  font-size: 0.82rem;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
}
.step:last-child { border-right: none; }
.stepActive {
  color: var(--accent-light);
  background: rgba(99,102,241,0.1);
  font-weight: 600;
}
.stepDone {
  color: var(--green);
}
.stepNum {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.3rem;
  height: 1.3rem;
  border-radius: 50%;
  background: var(--bg-hover);
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}
.stepActive .stepNum { background: rgba(99,102,241,0.25); color: var(--accent-light); }
.stepDone .stepNum   { background: rgba(34,197,94,0.15);  color: var(--green); }

.phase {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.phaseTitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.phaseActions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Visit banner (phases 2+3) */
.visitaBanner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-hover);
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}
.visitaBanner strong { color: var(--text-primary); }
.dot { color: var(--text-muted); }

/* Form */
.formGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  align-items: flex-start;
}
.label {
  display: block;
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.2rem;
}
.fieldGrow { flex: 1; min-width: 160px; }

/* Compradores checkboxes */
.presentesSection {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.checkGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
}
.checkItem {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  cursor: pointer;
}
.cidade {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* Buttons */
.btnPrimary {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  cursor: pointer;
}
.btnPrimary:hover:not(:disabled) { filter: brightness(1.1); }
.btnPrimary:disabled { opacity: 0.45; cursor: not-allowed; }

.btnSecondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  cursor: pointer;
}
.btnSecondary:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
.btnSecondary:disabled { opacity: 0.45; cursor: not-allowed; }

/* Pedidos salvos list */
.pedidosSalvos {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.pedidosSalvosTitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.15rem;
}
.pedidoRow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.83rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}
.pedidoRow strong { color: var(--text-primary); }

.tableFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.totals {
  display: flex;
  gap: 1.25rem;
  font-size: 0.85rem;
  flex-wrap: wrap;
}
.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.inlineError {
  font-size: 0.8rem;
  color: var(--red, #f87171);
}

/* Phase 3 summary */
.resumoGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.resumoCard {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.75rem;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.resumoCardHeader {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.35rem;
  margin-bottom: 0.25rem;
}
.resumoItem {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary);
  gap: 0.5rem;
}
.resumoTotal {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--green);
  text-align: right;
  border-top: 1px solid var(--border);
  padding-top: 0.3rem;
  margin-top: 0.2rem;
}
.resumoGeralTotal {
  font-size: 0.9rem;
  text-align: right;
  color: var(--text-secondary);
}
.resumoGeralTotal strong { color: var(--text-primary); font-size: 1rem; }
```

- [ ] **Step 3: Update seed-test.cjs**

Replace entire content of `seed-test.cjs`:

```js
const Database = require('better-sqlite3')
const path = require('path')
const os = require('os')

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'solucao-compras', 'solucao-compras.db')
console.log('Abrindo banco:', dbPath)

const db = new Database(dbPath)
db.pragma('foreign_keys = ON')

// Coleção
const col = db.prepare(`INSERT OR IGNORE INTO colecoes (nome, estacao, ano, status) VALUES (?, ?, ?, ?)`).run('Inverno 2026', 'inverno', 2026, 'em_compra')
const colId = col.lastInsertRowid || db.prepare(`SELECT id FROM colecoes WHERE nome = ?`).get('Inverno 2026').id

// Fornecedores (64 — coleção 2026/1)
const insertForn = db.prepare(`INSERT OR IGNORE INTO fornecedores (nome, contato, categoria) VALUES (?, ?, ?)`)
const fornecedores = [
  ['APPLICATO','','CONFECCOES'],['AQUECCE','','CONFECCOES'],['AUTENTICADA','','CONFECCOES'],
  ['BALBOA','','CONFECCOES'],['BICHO BAGUNCA','','CONFECCOES'],['BIOGAS','','CONFECCOES'],
  ['BLUE MACAW','','CONFECCOES'],['BRUNA','','CONFECCOES'],['CATOLELE','','CONFECCOES'],
  ['CAW','','CONFECCOES'],['CIA CORPO','','CONFECCOES'],['COSTAO','','CONFECCOES'],
  ['COTTON E COTTON','','CONFECCOES'],['CROCKER','','CONFECCOES'],['DANKA','','CONFECCOES'],
  ['DESAYNER','','CONFECCOES'],['DIANFA','','CONFECCOES'],['DIXIE','','CONFECCOES'],
  ['DOCE GLAMOUR','','CONFECCOES'],['DOLCE ROSE','','CONFECCOES'],['ED VERTIDO','','CONFECCOES'],
  ['ETERNITY','','CONFECCOES'],['FAKINI','','CONFECCOES'],['FANIKITUS','','CONFECCOES'],
  ['FARAELLI','','CONFECCOES'],['FELICITA','','CONFECCOES'],['FR TEXTIL','','CONFECCOES'],
  ['GIRAFFE','','CONFECCOES'],['HIRLOGS','','CONFECCOES'],['HUTTZ','','CONFECCOES'],
  ['IZITEX','','CONFECCOES'],['LEPOQUE','','CONFECCOES'],['LOTUS','','CONFECCOES'],
  ['LUCKYS','','CONFECCOES'],['LUNENDER','','CONFECCOES'],['LUSSAN','','CONFECCOES'],
  ['LZT','','CONFECCOES'],['MARCO TEXTIL','','CONFECCOES'],['MARU','','CONFECCOES'],
  ['MOONCITY','','CONFECCOES'],['OLHO FATAL','','CONFECCOES'],['OLIVEIRA MALHAS','','CONFECCOES'],
  ['OVERCOR','','CONFECCOES'],['PATY MODAS','','CONFECCOES'],['RALA KIDS','','CONFECCOES'],
  ['RCA','','CONFECCOES'],['ROLU','','CONFECCOES'],['ROSA BELLA','','CONFECCOES'],
  ['ROVITEX','','CONFECCOES'],['SBA','','CONFECCOES'],['SEA BRAZIL','','CONFECCOES'],
  ['SFIGMOS','','CONFECCOES'],['SHILMAR','','CONFECCOES'],['SIGOSTA','','CONFECCOES'],
  ['TANISE','','CONFECCOES'],['TEEZZ','','CONFECCOES'],['TILE SUL','','CONFECCOES'],
  ['TRAJADINHOS','','CONFECCOES'],['TRE FIORI','','CONFECCOES'],['URBAN CITY','','CONFECCOES'],
  ['VIVA VIDA','','CONFECCOES'],['GANGSTER','','ACESSORIOS'],['MORMAII','','CALCADOS'],
  ['ACONCHEGO DO BEBE','','CAMA-MESA-BANHO'],
]
for (const [nome, contato, categoria] of fornecedores) insertForn.run(nome, contato, categoria)

// Compradores
const insertComp = db.prepare(`INSERT OR IGNORE INTO compradores (nome, cnpj, cidade) VALUES (?, ?, ?)`)
const compradores = [
  ['Irmãos Backes',       '08.889.201/0001-01', 'Três Coroas/RS'],
  ['Samuel Paulo Backes', '15.563.106/0001-70', 'Três Coroas/RS'],
  ['PSM Backes',          '28.010.922/0001-07', 'Igrejinha/RS'],
  ['Alexandre Backes',    '06.284.903/0001-28', ''],
  ['Elisangela M. Backes','13.706.244/0001-36', 'Santa Maria do Herval/RS'],
  ['Rafael J. Backes',    '46.348.002/0001-77', 'Rolante/RS'],
  ['Streit Conf',         '10.206.469/0001-35', 'Riozinho/RS'],
  ['FMV Streit Conf',     '20.354.516/0001-41', 'Rolante/RS'],
]
for (const [nome, cnpj, cidade] of compradores) insertComp.run(nome, cnpj, cidade)

// Segmentações (inclui tipo_grade)
const insertSeg = db.prepare(`INSERT OR IGNORE INTO segmentacoes (classificacao, tipo_produto, classe, tipo_grade, estacao) VALUES (?, ?, ?, ?, ?)`)
insertSeg.run('AD', 'BERMUDA', 'FEM',  'AD',  'inverno')
insertSeg.run('AD', 'CALCA',   'MASC', 'AD',  'inverno')
insertSeg.run('EX', 'BLUSINHA','FEM',  'EX',  'inverno')
insertSeg.run('INF','VESTIDO', 'FEM',  'INF', 'inverno')

function getSegId(cl, tp, cls) {
  return db.prepare(`SELECT id FROM segmentacoes WHERE classificacao=? AND tipo_produto=? AND classe=?`).get(cl, tp, cls).id
}
function getFornId(nome) {
  return db.prepare(`SELECT id FROM fornecedores WHERE nome = ?`).get(nome).id
}
function getCompId(nome) {
  return db.prepare(`SELECT id FROM compradores WHERE nome = ?`).get(nome).id
}

const seg1 = getSegId('AD', 'BERMUDA', 'FEM')
const seg2 = getSegId('AD', 'CALCA',   'MASC')
const seg3 = getSegId('EX', 'BLUSINHA','FEM')
const fLun  = getFornId('LUNENDER')
const fGang = getFornId('GANGSTER')
const cIrm  = getCompId('Irmãos Backes')
const cSam  = getCompId('Samuel Paulo Backes')

// Projeções
const insertProj = db.prepare(`INSERT OR REPLACE INTO projecoes (segmentacao_id, colecao_id, tamanho, qtd_ajustada) VALUES (?, ?, ?, ?)`)
insertProj.run(seg1, colId, 'PP', 50); insertProj.run(seg1, colId, 'P', 80); insertProj.run(seg1, colId, 'M', 60); insertProj.run(seg1, colId, 'G', 40); insertProj.run(seg1, colId, 'GG', 20); insertProj.run(seg1, colId, 'XG', 10)
insertProj.run(seg2, colId, 'PP', 40); insertProj.run(seg2, colId, 'P', 70); insertProj.run(seg2, colId, 'M', 50); insertProj.run(seg2, colId, 'G', 30); insertProj.run(seg2, colId, 'GG', 20); insertProj.run(seg2, colId, 'XG', 10)
insertProj.run(seg3, colId, 'G1', 30); insertProj.run(seg3, colId, 'G2', 40); insertProj.run(seg3, colId, 'G3', 35)

// Visita de exemplo
const visita = db.prepare(`INSERT INTO visitas (fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(fLun, colId, '2026-05-17', 'Maria', '30/60 dias', 'CIF', '')
const visitaId = visita.lastInsertRowid

// Pedidos com pedido_itens
const insertPed = db.prepare(`INSERT INTO pedidos (visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct, transportadora, nota_fiscal, obs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
const insertItem = db.prepare(`INSERT INTO pedido_itens (pedido_id, tamanho, qtd) VALUES (?, ?, ?)`)

const pedIrm = insertPed.run(visitaId, cIrm, seg1, 45.00, 0, '', '', '').lastInsertRowid
insertItem.run(pedIrm, 'PP', 10); insertItem.run(pedIrm, 'P', 20); insertItem.run(pedIrm, 'M', 15); insertItem.run(pedIrm, 'G', 10)

const pedSam = insertPed.run(visitaId, cSam, seg1, 45.00, 0, '', '', '').lastInsertRowid
insertItem.run(pedSam, 'PP', 5); insertItem.run(pedSam, 'P', 8); insertItem.run(pedSam, 'M', 6); insertItem.run(pedSam, 'G', 4)

const pedSam2 = insertPed.run(visitaId, cSam, seg2, 55.00, 5, '', '', '').lastInsertRowid
insertItem.run(pedSam2, 'P', 12); insertItem.run(pedSam2, 'M', 18); insertItem.run(pedSam2, 'G', 10)

console.log('✓ Dados de teste criados:')
console.log('  Coleção: Inverno 2026 (id', colId + ')')
console.log('  64 fornecedores, 8 compradores, 4 segmentações')
console.log('  1 visita com 3 pedidos (Irmãos Backes + Samuel x2)')
db.close()
```

- [ ] **Step 4: Run all tests**

```
cd "C:\Users\eduke\Solução Compras" && npm test
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
git add src/renderer/src/screens/Compras.jsx src/renderer/src/screens/Compras.module.css seed-test.cjs
git commit -m "feat(compras): rewrite Compras screen as 3-phase wizard; update seed-test.cjs"
```

---

## Task 7: Smoke Test + Build

**Files:** none

- [ ] **Step 1: Run full test suite**

```
cd "C:\Users\eduke\Solução Compras" && npm test
```

Expected: all tests pass.

- [ ] **Step 2: Start Electron dev mode**

```
cd "C:\Users\eduke\Solução Compras" && npm run dev
```

Manual check:
- App opens
- Create a new collection in sidebar (verify it returns full object, not crashes)
- Go to Compras tab
- Phase 1: select fornecedor, set date, select 2+ compradores, click "Iniciar Visita" → advances to Phase 2
- Phase 2: select a comprador, select segmentação, enter qtds + valor → "Adicionar pedido" → appears in list
- Phase 2: add another pedido for different comprador → "Fechar visita" → Phase 3
- Phase 3: cards show per-comprador summary → "Gerar PDFs" → window opens with correct per-comprador pages
- "Nova visita" returns to Phase 1

- [ ] **Step 3: Run seed and verify data**

```
cd "C:\Users\eduke\Solução Compras" && node seed-test.cjs
```

Expected: `✓ Dados de teste criados` with no errors.

- [ ] **Step 4: Build installer**

```
cd "C:\Users\eduke\Solução Compras" && npm run build:win
```

Expected: `dist-electron\Solução Compras Setup 1.0.0.exe` created.

- [ ] **Step 5: Final commit**

```
git add -A
git commit -m "chore: smoke test and build verified — visitas+pedidos redesign complete"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Each buyer gets their own independent order (pedido) — Task 6 Phase 2
- ✅ PDF per buyer — Task 6 Phase 3 `handleGerarPDFs`
- ✅ Buyers selectable per visit (not always all) — Task 6 Phase 1 checkboxes
- ✅ Commercial terms (vendedor, cond_pag, frete) shared at visit level — Tasks 3+6
- ✅ tipo_grade in segmentacoes — Tasks 1+2
- ✅ colecoes.create() returns full object — Task 2
- ✅ setTimeout replaced with `addEventListener('load', ...)` — Task 6 Phase 3
- ✅ All 5 critical bugs fixed by new schema design

**Bug fixes confirmed by schema:**
- Bug 1 (colecoes.create returns ID): Fixed in Task 2
- Bug 2 (segmentacoes missing tipo_grade): Fixed in Tasks 1+2
- Bug 3 (pedidos missing 7 fields): Eliminated — fields now at visit level in schema
- Bug 4 (distribution has no persistence): Eliminated — each comprador has their own pedido
- Bug 5 (setTimeout for PDF): Fixed in Task 6 Phase 3

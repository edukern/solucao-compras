# Code Review Request — Solução Compras

**Who wrote this:** Edu Kern — not a software engineer by background. Product and operations person who has been building with AI assistance (Claude Code) as the co-developer. I understand what the code does, reason about trade-offs, and made every architectural decision, but I did not write most of it by hand.

**What I want:** Honest feedback. I'm not looking for reassurance. If something is wrong, fragile, or embarrassing, I want to know. I've flagged the specific questions I'm uncertain about at the bottom, but feel free to ignore the structure and just tell me what you see.

---

## What this is

A Windows desktop app for a fashion retail buyer managing seasonal collection purchases. The buyer (Samuel) visits suppliers during trade shows, records orders for multiple stores per visit, and needs projections comparing what he planned to buy vs what he's actually ordered.

It runs entirely offline during trade shows. The only internet-dependent piece is a communication screen (Pendências) backed by Supabase — used as a rough Q&A channel between Samuel and me during development.

**Stack:**
- Electron + React/Vite (renderer) + better-sqlite3 (main process)
- SQLite for all business data — local file, never leaves the machine
- electron-updater + GitHub Actions for auto-update on release
- PDF generation via `window.print()` into a hidden iframe
- Vercel + Supabase only for the Pendências communication screen

**Test suite:** 90 tests, Vitest, all in-memory SQLite databases.

---

## Repository structure

```
electron/
  main/
    db/           ← data layer: one module per entity
      schema.js   ← single migration function, runs on every app start
      sessoes.js  ← buying sessions (one per supplier visit)
      pedidos.js  ← purchase orders within a session
      projecoes.js← projected quantities per size
      grades.js   ← size grid definitions (AD, PP, EX, etc.)
      ...
    index.js      ← IPC handlers — bridges renderer ↔ DB
  preload/
    index.js      ← exposes IPC to renderer via contextBridge

src/renderer/src/
  screens/        ← one file per screen
  lib/            ← shared utilities

tests/
  *.test.js       ← one file per DB module
  native/
    index.cjs     ← wrapper to load the correct .node binary for Node.js (not Electron)
  setup.js        ← shared test DB factory
```

---

## Data model

```
colecoes (seasons)
  └── sessoes (one supplier visit, one or more stores)
        └── visitas (one row per store within a session)
              └── pedidos (one order per segmentation per store)
                    └── pedido_itens (one row per size: tamanho, qtd)

segmentacoes (product classifications: class × product type × size grid type)
projecoes (planned buy quantities per segmentation × season × size)
grade_historica (historical sales data, for future projection calculations)
```

`sessoes` owns `fornecedor_id`, `colecao_id`, `data_visita`. `visitas` is now just a join table — `sessao_id` + `comprador_id`. This was the result of a mid-development refactor: the original design had `visitas` carrying all that context, which made it impossible to group multiple stores into a single supplier visit.

---

## The migration strategy — this is probably the thing most likely to raise your eyebrows

All migrations live in a single `runMigrations(db)` function in `schema.js`. It runs on every app start. It uses `PRAGMA table_info(table)` to detect the current schema shape and applies changes only if needed.

There is no migration version table, no numbered files, no rollback.

The function started as "create if not exists" and grew by accretion as the schema evolved. The most recent addition was refactoring `visitas` — splitting out session-level data into a new `sessoes` table. That migration does:

```js
// 1. Create visitas_new with the new shape
// 2. INSERT SELECT from old visitas (only rows that have sessao_id/comprador_id from a prior ADD COLUMN step)
// 3. DROP old visitas
// 4. RENAME visitas_new → visitas
```

The rename-to-same-name trick is intentional: SQLite auto-rewrites FK references in other tables when you rename a table. By keeping the target name `visitas`, `pedidos.visita_id REFERENCES visitas(id)` stays valid without touching the pedidos table. I verified this works but I'm not fully confident I understand *why* SQLite doesn't rewrite it in this case — it seems to only rewrite when the old name disappears.

Idempotency for anything that might conflict on re-run is handled with `try { db.exec(...) } catch {}`. I know this is crude.

---

## The native module test workaround

better-sqlite3 ships a `.node` binary compiled against Electron's Node runtime (currently MODULE_VERSION 133). The test suite runs under system Node.js 24 (MODULE_VERSION 137). This causes a version mismatch error when Vitest loads the module.

Fix: downloaded the Node.js 24 prebuilt from the better-sqlite3 GitHub releases, stored at `tests/native/build/Release/better_sqlite3.node` (gitignored), wrapped it in `tests/native/index.cjs` which passes `{ nativeBinding: '/explicit/path' }` to bypass bindings' auto-detection. Vitest aliases `better-sqlite3` to this wrapper.

The binary is not in the repo. Anyone cloning and running tests needs to download it. There's no script for this yet.

---

## Things I know are rough

- **No TypeScript.** Deliberate — speed during development. But the IPC layer especially (`electron/main/index.js`, `electron/preload/index.js`) has no type safety at all, and the renderer just trusts what comes back.

- **`visitas.js` still exists** as a module in `electron/main/db/`. It's now a thin wrapper that probably shouldn't exist — visitas are fully managed through `sessoes.create()` and `sessoes.cancelar()`. I haven't deleted it because I'm not sure what still imports it.

- **No test for the upgrade path.** The tests all use fresh in-memory databases via `runMigrations`. I have no test that starts with the *old* schema (visitas with fornecedor_id, no sessoes table) and verifies the migration produces the correct result. I know this is a gap.

- **Inline SQL strings everywhere.** No query builder, no ORM. Prepared statements are used consistently, but the queries are bare strings. Some are getting long.

- **PDF via `window.print()`.** It works. It opens the system print dialogue. But it's not generating a proper PDF file programmatically — the user has to select "Save as PDF" in the print dialogue. There are libraries that would generate a proper binary, but the current approach was faster to ship.

- **The Supabase integration is only for one screen.** The Pendências screen (project status + Q&A for Samuel) uses Supabase as a simple key-value store. Everything else is local SQLite. This feels architecturally awkward — two completely different data layers for very different purposes.

---

## Specific questions I'd like your opinion on

1. **Migration strategy** — Is the single-function `PRAGMA table_info` approach workable for a single-user desktop app, or should I implement numbered migrations (e.g. a `schema_version` table and numbered `migrate_001`, `migrate_002` functions)? The app only has one user, so there's no multi-tenant concern, but I do need the migration to work correctly when Samuel updates from any prior version.

2. **The `visitas_new → DROP → RENAME` pattern** — Is there a cleaner way to do this in SQLite that I'm missing? I went through several attempts (including `PRAGMA legacy_alter_table = 1`) before landing on this.

3. **TypeScript** — Worth retrofitting at this stage? The app is functionally complete and mostly stable. I'm not sure the benefit justifies the disruption, but the IPC layer with no types does feel risky.

4. **Test coverage** — What's the highest-value thing missing? I'm testing the DB layer thoroughly but have almost no tests on the renderer side. Given this is an Electron app with a React renderer, I'm not sure what a sensible testing strategy for the UI layer looks like here.

5. **The `salvarBatch` transaction** in `pedidos.js` — it calls `byId.get(id)` inside the batch loop for each inserted order. That's a SELECT inside a transaction that's already doing INSERTs in a loop. Does this cause any concern, or is it fine because SQLite serialises everything?

6. **Anything else you'd stop me on.** I don't know what I don't know.

---

## Running the tests

```bash
# First time only: download the Node.js 24 prebuilt binary for better-sqlite3 v12.10.0
# Place it at: tests/native/build/Release/better_sqlite3.node
# Source: https://github.com/WiseLibs/better-sqlite3/releases/tag/v12.10.0

npm install
npx vitest run
# Expected: 90 tests passing across 13 test files
```

---

*Thanks for the time. No need to be gentle.*

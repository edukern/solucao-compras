# Solução Compras — Fase 2: Interface do Usuário

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App shell com navegação + Dashboard + Planejamento + Compras, comunicando exclusivamente com `window.api` via IPC.

**Architecture:** App.jsx gerencia navegação com `useState` (sem router — YAGNI). `CollectionContext` provê a coleção ativa globalmente via React Context. Cada tela busca dados em `useEffect` via `window.api`. Estilização com CSS Modules + CSS custom properties para temas dark/light. Lógica pura de agregação extraída em `src/renderer/src/utils/` com testes Vitest no ambiente Node já configurado.

**Tech Stack:** React 18 · CSS Modules · Vitest (utils only) · electron-vite (já configurado)

---

## File Map

```
src/renderer/src/
├── main.jsx                           # Modify: trocar assets/main.css → styles/globals.css
├── App.jsx                            # Replace: shell de navegação com dark/light toggle
├── styles/
│   └── globals.css                    # Create: CSS custom properties dark/light + reset
├── contexts/
│   └── CollectionContext.jsx          # Create: coleção ativa + lista de coleções
├── utils/
│   ├── colecoes.js                    # Create: findBaseColecoes(collections, target)
│   └── dashboard.js                  # Create: aggregateSegmentacao, aggregateDashboard
├── components/
│   ├── Sidebar.jsx                    # Create: barra lateral com nav + seletor de coleção
│   ├── Sidebar.module.css
│   └── SegmentacaoSelect.jsx          # Create: seletor cascata (classificação > tipo > classe)
└── screens/
    ├── Dashboard.jsx                  # Create: tela principal com cards + tabela de segmentações
    ├── Dashboard.module.css
    ├── Planejamento.jsx               # Create: tela de revisão e ajuste de projeções
    ├── Planejamento.module.css
    ├── Compras.jsx                    # Create: tela de registro de pedido de compra
    └── Compras.module.css

tests/
├── utils-colecoes.test.js             # Create: testes para findBaseColecoes
└── utils-dashboard.test.js           # Create: testes para aggregateSegmentacao + aggregateDashboard
```

---

## Task 1: CSS Foundation + Utility Functions

**Files:**
- Modify: `src/renderer/src/assets/main.css`
- Create: `src/renderer/src/styles/globals.css`
- Create: `src/renderer/src/utils/colecoes.js`
- Create: `src/renderer/src/utils/dashboard.js`
- Create: `tests/utils-colecoes.test.js`
- Create: `tests/utils-dashboard.test.js`

- [ ] **Step 1: Write failing tests**

```js
// tests/utils-colecoes.test.js
import { describe, it, expect } from 'vitest'
import { findBaseColecoes } from '../src/renderer/src/utils/colecoes.js'

const COLLECTIONS = [
  { id: 1, nome: 'Verão 2024',   estacao: 'verao',   ano: 2024 },
  { id: 2, nome: 'Inverno 2024', estacao: 'inverno', ano: 2024 },
  { id: 3, nome: 'Verão 2025',   estacao: 'verao',   ano: 2025 },
  { id: 4, nome: 'Inverno 2025', estacao: 'inverno', ano: 2025 },
  { id: 5, nome: 'Verão 2026',   estacao: 'verao',   ano: 2026 },
]

describe('findBaseColecoes', () => {
  it('returns 2 previous same-season collections, oldest first [n-2, n-1]', () => {
    const target = COLLECTIONS.find(c => c.id === 5) // Verão 2026
    const base = findBaseColecoes(COLLECTIONS, target)
    expect(base).toHaveLength(2)
    expect(base[0].id).toBe(1) // Verão 2024 = n-2
    expect(base[1].id).toBe(3) // Verão 2025 = n-1
  })

  it('returns at most 2 even when more previous same-season collections exist', () => {
    const many = [
      { id: 10, estacao: 'verao', ano: 2022 },
      { id: 11, estacao: 'verao', ano: 2023 },
      { id: 12, estacao: 'verao', ano: 2024 },
      { id: 13, estacao: 'verao', ano: 2025 },
      { id: 14, estacao: 'verao', ano: 2026 },
    ]
    const base = findBaseColecoes(many, many[4])
    expect(base).toHaveLength(2)
    expect(base[0].id).toBe(12) // 2024
    expect(base[1].id).toBe(13) // 2025
  })

  it('does not include different-season collections', () => {
    const target = COLLECTIONS.find(c => c.id === 5)
    const base = findBaseColecoes(COLLECTIONS, target)
    expect(base.every(c => c.estacao === 'verao')).toBe(true)
  })

  it('returns empty array when no previous same-season collections exist', () => {
    const target = { id: 99, estacao: 'verao', ano: 2023 }
    expect(findBaseColecoes([target], target)).toHaveLength(0)
  })

  it('returns 1 when only one previous same-season collection exists', () => {
    const target = COLLECTIONS.find(c => c.id === 3) // Verão 2025
    const base = findBaseColecoes(COLLECTIONS, target)
    expect(base).toHaveLength(1)
    expect(base[0].id).toBe(1)
  })
})
```

```js
// tests/utils-dashboard.test.js
import { describe, it, expect } from 'vitest'
import { aggregateSegmentacao, aggregateDashboard } from '../src/renderer/src/utils/dashboard.js'

describe('aggregateSegmentacao', () => {
  it('calculates projecao as sum of qtd_ajustada', () => {
    const proj = [
      { tamanho: 'P', qtd_ajustada: 50 },
      { tamanho: 'M', qtd_ajustada: 100 },
    ]
    const result = aggregateSegmentacao(proj, [])
    expect(result.projecao).toBe(150)
    expect(result.comprado).toBe(0)
    expect(result.saldo).toBe(150)
    expect(result.pct).toBe(0)
  })

  it('calculates comprado as sum of total_pedido', () => {
    const proj = [{ tamanho: 'P', qtd_ajustada: 100 }]
    const totais = [{ tamanho: 'P', total_pedido: 60 }]
    const result = aggregateSegmentacao(proj, totais)
    expect(result.comprado).toBe(60)
    expect(result.saldo).toBe(40)
    expect(result.pct).toBe(60)
  })

  it('caps pct at 100 when comprado exceeds projecao', () => {
    const proj = [{ tamanho: 'P', qtd_ajustada: 50 }]
    const totais = [{ tamanho: 'P', total_pedido: 60 }]
    const result = aggregateSegmentacao(proj, totais)
    expect(result.pct).toBe(100)
    expect(result.saldo).toBe(0)
  })

  it('returns pct 0 when projecao is 0', () => {
    const result = aggregateSegmentacao([], [])
    expect(result.projecao).toBe(0)
    expect(result.pct).toBe(0)
  })
})

describe('aggregateDashboard', () => {
  it('sums all segmentacao rows', () => {
    const rows = [
      { projecao: 100, comprado: 60, saldo: 40 },
      { projecao: 200, comprado: 100, saldo: 100 },
    ]
    const result = aggregateDashboard(rows)
    expect(result.totalProjecao).toBe(300)
    expect(result.totalComprado).toBe(160)
    expect(result.totalSaldo).toBe(140)
    expect(result.pctGeral).toBe(53)
  })

  it('returns zeros for empty rows', () => {
    const result = aggregateDashboard([])
    expect(result.totalProjecao).toBe(0)
    expect(result.totalComprado).toBe(0)
    expect(result.pctGeral).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```powershell
cd "C:\Users\eduke\Solução Compras"; npm rebuild better-sqlite3; npx vitest run --reporter=verbose
```

Expected: FAIL on 2 new test files (module not found), existing 27 tests still pass.

- [ ] **Step 3: Implement utility functions**

```js
// src/renderer/src/utils/colecoes.js
export function findBaseColecoes(collections, targetColecao) {
  return collections
    .filter(c => c.estacao === targetColecao.estacao && c.ano < targetColecao.ano)
    .sort((a, b) => b.ano - a.ano)
    .slice(0, 2)
    .reverse()
}
```

```js
// src/renderer/src/utils/dashboard.js
export function aggregateSegmentacao(projRows, pedidoTotais) {
  const projecao = projRows.reduce((s, r) => s + r.qtd_ajustada, 0)
  const comprado = pedidoTotais.reduce((s, r) => s + r.total_pedido, 0)
  const saldo = Math.max(0, projecao - comprado)
  const pct = projecao > 0 ? Math.min(100, Math.round((comprado / projecao) * 100)) : 0
  return { projecao, comprado, saldo, pct }
}

export function aggregateDashboard(rows) {
  const totalProjecao = rows.reduce((s, r) => s + r.projecao, 0)
  const totalComprado = rows.reduce((s, r) => s + r.comprado, 0)
  const totalSaldo = rows.reduce((s, r) => s + r.saldo, 0)
  const pctGeral = totalProjecao > 0 ? Math.min(100, Math.round((totalComprado / totalProjecao) * 100)) : 0
  return { totalProjecao, totalComprado, totalSaldo, pctGeral }
}
```

- [ ] **Step 4: Create CSS globals (replaces the existing main.css)**

Replace `src/renderer/src/assets/main.css` with empty content (we'll import globals.css from main.jsx instead):

```css
/* intentionally empty — styles moved to styles/globals.css */
```

Create `src/renderer/src/styles/globals.css`:

```css
:root {
  --bg-primary:    #0f172a;
  --bg-secondary:  #1e293b;
  --bg-card:       #1e293b;
  --bg-hover:      rgba(255,255,255,0.05);
  --border:        rgba(255,255,255,0.08);
  --text-primary:  #e2e8f0;
  --text-secondary:#94a3b8;
  --text-muted:    #64748b;
  --accent:        #6366f1;
  --accent-light:  #a5b4fc;
  --green:         #86efac;
  --yellow:        #fcd34d;
  --orange:        #fb923c;
  --purple:        #c4b5fd;
  --red:           #f87171;
  --input-bg:      rgba(255,255,255,0.08);
  --input-border:  rgba(255,255,255,0.15);
}

:root.light {
  --bg-primary:    #f1f5f9;
  --bg-secondary:  #ffffff;
  --bg-card:       #ffffff;
  --bg-hover:      rgba(0,0,0,0.04);
  --border:        rgba(0,0,0,0.1);
  --text-primary:  #0f172a;
  --text-secondary:#475569;
  --text-muted:    #94a3b8;
  --input-bg:      #f8fafc;
  --input-border:  #cbd5e1;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button { cursor: pointer; font: inherit; }
select, input { font: inherit; }

select {
  appearance: none;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
}
select:focus { outline: 1px solid var(--accent); }
select:disabled { opacity: 0.4; cursor: not-allowed; }

input[type="number"], input[type="text"], input[type="date"] {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
}
input:focus { outline: 1px solid var(--accent); }

/* Remove number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
input[type="number"] { -moz-appearance: textfield; }
```

- [ ] **Step 5: Run tests — expect all pass**

```powershell
cd "C:\Users\eduke\Solução Compras"; npx vitest run --reporter=verbose
```

Expected: all 29 tests passing (27 existing + 2 new utils files × combined tests).

- [ ] **Step 6: Commit**

```powershell
cd "C:\Users\eduke\Solução Compras"; git add src/renderer/src/styles/ src/renderer/src/utils/ src/renderer/src/assets/main.css tests/utils-colecoes.test.js tests/utils-dashboard.test.js; git commit -m "feat: css globals + utility functions (findBaseColecoes, aggregateDashboard)"
```

---

## Task 2: Collection Context + App Shell

**Files:**
- Modify: `src/renderer/src/main.jsx`
- Replace: `src/renderer/src/App.jsx`
- Create: `src/renderer/src/contexts/CollectionContext.jsx`

- [ ] **Step 1: Replace `src/renderer/src/main.jsx`**

```jsx
// src/renderer/src/main.jsx
import './assets/main.css'
import './styles/globals.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 2: Create `src/renderer/src/contexts/CollectionContext.jsx`**

```jsx
// src/renderer/src/contexts/CollectionContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const CollectionContext = createContext(null)

export function CollectionProvider({ children }) {
  const [collections, setCollections] = useState([])
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    window.api.colecoes.list().then(list => {
      setCollections(list)
      if (list.length > 0) setActiveId(list[0].id)
    })
  }, [])

  const active = collections.find(c => c.id === activeId) ?? null

  return (
    <CollectionContext.Provider value={{ collections, setCollections, active, activeId, setActiveId }}>
      {children}
    </CollectionContext.Provider>
  )
}

export function useCollection() {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be inside CollectionProvider')
  return ctx
}
```

- [ ] **Step 3: Replace `src/renderer/src/App.jsx`**

```jsx
// src/renderer/src/App.jsx
import { useState, useEffect } from 'react'
import { CollectionProvider } from './contexts/CollectionContext'
import Sidebar from './components/Sidebar'
import Dashboard from './screens/Dashboard'
import Planejamento from './screens/Planejamento'
import Compras from './screens/Compras'

const SCREENS = {
  dashboard:    () => <Dashboard />,
  planejamento: () => <Planejamento />,
  compras:      () => <Compras />,
}

export default function App() {
  const [screen, setScreen] = useState('dashboard')
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  const Screen = SCREENS[screen] ?? SCREENS.dashboard

  return (
    <CollectionProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar
          current={screen}
          onNavigate={setScreen}
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        />
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
          <Screen />
        </main>
      </div>
    </CollectionProvider>
  )
}
```

- [ ] **Step 4: Verify tests still pass**

```powershell
cd "C:\Users\eduke\Solução Compras"; npx vitest run --reporter=verbose
```

Expected: all 29 tests still passing.

- [ ] **Step 5: Create placeholder screen files**

`App.jsx` imports the 3 screens that won't exist until Tasks 4–6. Create minimal placeholders now so `npm run dev` works:

```js
// src/renderer/src/screens/Dashboard.jsx   (placeholder — replaced in Task 4)
export default function Dashboard() {
  return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Dashboard em construção</div>
}
```

```js
// src/renderer/src/screens/Planejamento.jsx  (placeholder — replaced in Task 5)
export default function Planejamento() {
  return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Planejamento em construção</div>
}
```

```js
// src/renderer/src/screens/Compras.jsx  (placeholder — replaced in Task 6)
export default function Compras() {
  return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Compras em construção</div>
}
```

- [ ] **Step 6: Verify dev server starts without errors**

```powershell
cd "C:\Users\eduke\Solução Compras"; npm run dev
```

Expected: Electron window opens. Sidebar will be missing (created in Task 3) so there may be an import error for `Sidebar`. That's OK — close the window. The key check is no unresolvable module errors for the screens.

If the app crashes because `./components/Sidebar` is missing, temporarily comment out the Sidebar import in App.jsx and use a placeholder div. You'll restore it in Task 3.

- [ ] **Step 7: Verify tests still pass**

```powershell
cd "C:\Users\eduke\Solução Compras"; npx vitest run --reporter=verbose
```

Expected: all 29 tests still passing.

- [ ] **Step 8: Commit**

```powershell
cd "C:\Users\eduke\Solução Compras"; git add src/renderer/src/main.jsx src/renderer/src/App.jsx src/renderer/src/contexts/ src/renderer/src/screens/; git commit -m "feat: app shell + collection context + placeholder screens"
```

---

## Task 3: Sidebar + SegmentacaoSelect

**Files:**
- Create: `src/renderer/src/components/Sidebar.jsx`
- Create: `src/renderer/src/components/Sidebar.module.css`
- Create: `src/renderer/src/components/SegmentacaoSelect.jsx`

- [ ] **Step 1: Create `Sidebar.module.css`**

```css
/* src/renderer/src/components/Sidebar.module.css */
.sidebar {
  width: 210px;
  min-height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.brand {
  padding: 1.1rem 1rem 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-light);
  border-bottom: 1px solid var(--border);
  letter-spacing: 0.02em;
}

.collectionSection {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.label {
  display: block;
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.35rem;
}

.colSelect {
  width: 100%;
}

.nav {
  flex: 1;
  padding: 0.4rem 0.5rem;
}

.navBtn {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-align: left;
  transition: background 0.12s, color 0.12s;
}
.navBtn:hover { background: var(--bg-hover); color: var(--text-primary); }
.active { background: rgba(99,102,241,0.15) !important; color: var(--accent-light) !important; }

.icon { font-size: 0.9rem; width: 1.2rem; text-align: center; }

.bottom {
  padding: 0.75rem;
  border-top: 1px solid var(--border);
}

.themeBtn {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  width: 100%;
}
.themeBtn:hover { color: var(--text-primary); }
```

- [ ] **Step 2: Create `Sidebar.jsx`**

```jsx
// src/renderer/src/components/Sidebar.jsx
import { useCollection } from '../contexts/CollectionContext'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '◉' },
  { id: 'planejamento', label: 'Planejamento', icon: '🎯' },
  { id: 'compras',      label: 'Compras',      icon: '🛍️' },
]

export default function Sidebar({ current, onNavigate, theme, onToggleTheme }) {
  const { collections, activeId, setActiveId } = useCollection()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>Solução Compras</div>

      <div className={styles.collectionSection}>
        <span className={styles.label}>Coleção ativa</span>
        <select
          className={styles.colSelect}
          value={activeId ?? ''}
          onChange={e => setActiveId(Number(e.target.value))}
        >
          {collections.length === 0 && <option value="">— nenhuma —</option>}
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`${styles.navBtn} ${current === item.id ? styles.active : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.themeBtn} onClick={onToggleTheme}>
          {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro'}
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Create `SegmentacaoSelect.jsx`**

This component is reused in both Planejamento and Compras. It shows 3 cascading dropdowns (classificação → tipo → classe) and calls `onChange(segId)` when all 3 are selected.

```jsx
// src/renderer/src/components/SegmentacaoSelect.jsx
import { useState, useEffect } from 'react'

export default function SegmentacaoSelect({ segs, value, onChange }) {
  const selected = segs.find(s => s.id === value)

  const [selClass, setSelClass] = useState(selected?.classificacao ?? '')
  const [selTipo,  setSelTipo]  = useState(selected?.tipo_produto ?? '')
  const [selClasse, setSelClasse] = useState(selected?.classe ?? '')

  const classificacoes = [...new Set(segs.map(s => s.classificacao))].sort()
  const tipos  = [...new Set(segs.filter(s => s.classificacao === selClass).map(s => s.tipo_produto))].sort()
  const classes = [...new Set(segs.filter(s => s.classificacao === selClass && s.tipo_produto === selTipo).map(s => s.classe))].sort()

  useEffect(() => {
    const seg = segs.find(
      s => s.classificacao === selClass && s.tipo_produto === selTipo && s.classe === selClasse
    )
    onChange(seg?.id ?? null)
  }, [selClass, selTipo, selClasse, segs])

  function handleClass(v) { setSelClass(v); setSelTipo(''); setSelClasse('') }
  function handleTipo(v)  { setSelTipo(v);  setSelClasse('') }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
  )
}
```

- [ ] **Step 4: Verify tests still pass**

```powershell
cd "C:\Users\eduke\Solução Compras"; npx vitest run --reporter=verbose
```

Expected: all 29 tests still passing.

- [ ] **Step 5: Commit**

```powershell
cd "C:\Users\eduke\Solução Compras"; git add src/renderer/src/components/; git commit -m "feat: sidebar + segmentacao cascading selector"
```

---

## Task 4: Dashboard Screen

**Files:**
- Create: `src/renderer/src/screens/Dashboard.jsx`
- Create: `src/renderer/src/screens/Dashboard.module.css`

- [ ] **Step 1: Create `Dashboard.module.css`**

```css
/* src/renderer/src/screens/Dashboard.module.css */
.page { padding: 1.5rem; max-width: 1100px; }

.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.title { font-size: 1.5rem; font-weight: 600; }
.badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  background: rgba(99,102,241,0.2);
  color: var(--accent-light);
}

/* Metric cards */
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
}
.cardLabel {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}
.cardValue { font-size: 2rem; font-weight: 700; line-height: 1.1; }
.cardSub   { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }

/* Progress */
.progressBox {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}
.progressLabel {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}
.bar {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}
.barFill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Segmentation table */
.tableBox {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.table thead tr { border-bottom: 1px solid var(--border); }
.table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.table th:not(:first-child) { text-align: right; }
.table td {
  padding: 0.65rem 1rem;
  border-top: 1px solid var(--border);
}
.table tbody tr:first-child td { border-top: none; }

.segCell { display: flex; align-items: center; gap: 0.4rem; }
.checkMark { color: var(--green); font-weight: 700; font-size: 0.85rem; }
.numCell { text-align: right; color: var(--text-secondary); }
.barCell { display: flex; align-items: center; gap: 0.5rem; }
.pctText { font-size: 0.75rem; color: var(--text-muted); min-width: 36px; text-align: right; }

.rowDone { background: rgba(134,239,172,0.04); }
.rowNone { background: rgba(248,113,113,0.05); }
.rowNone .segCell { color: var(--red); }

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.emptyRow {
  text-align: center !important;
  color: var(--text-muted);
  padding: 2.5rem !important;
}
```

- [ ] **Step 2: Create `Dashboard.jsx`**

```jsx
// src/renderer/src/screens/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { aggregateSegmentacao, aggregateDashboard } from '../utils/dashboard'
import styles from './Dashboard.module.css'

function ProgressBar({ pct, height = 8 }) {
  const safe = Math.min(100, Math.max(0, pct))
  const color = safe >= 100 ? 'var(--green)' : safe > 0 ? 'var(--accent)' : 'var(--red)'
  return (
    <div className={styles.bar} style={{ height }}>
      <div className={styles.barFill} style={{ width: `${safe}%`, background: color }} />
    </div>
  )
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue} style={{ color }}>{value}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { active } = useCollection()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!active) { setRows([]); return }
    setLoading(true)
    loadData(active.id).finally(() => setLoading(false))
  }, [active?.id])

  async function loadData(colId) {
    const segs = await window.api.segmentacoes.list()
    const rowData = await Promise.all(
      segs.map(async seg => {
        const [proj, totais] = await Promise.all([
          window.api.projecoes.get(seg.id, colId),
          window.api.pedidos.totaisPorTamanho(seg.id, colId),
        ])
        return { seg, ...aggregateSegmentacao(proj, totais) }
      })
    )
    setRows(rowData.filter(r => r.projecao > 0))
  }

  if (!active) {
    return (
      <div className={styles.empty}>
        <span>Nenhuma coleção encontrada.</span>
        <span>Crie uma coleção nas configurações para começar.</span>
      </div>
    )
  }

  const { totalProjecao, totalComprado, totalSaldo, pctGeral } = aggregateDashboard(rows)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{active.nome}</h1>
        <span className={styles.badge}>{active.status}</span>
      </div>

      <div className={styles.cards}>
        <MetricCard label="Projeção total"   value={totalProjecao.toLocaleString('pt-BR')} sub="peças"      color="var(--purple)" />
        <MetricCard label="Já comprado"      value={totalComprado.toLocaleString('pt-BR')} sub="peças"      color="var(--green)"  />
        <MetricCard label="Saldo a comprar"  value={totalSaldo.toLocaleString('pt-BR')}    sub="peças"      color="var(--yellow)" />
        <MetricCard label="Progresso"        value={`${pctGeral}%`}                         sub="da coleção" color="var(--accent-light)" />
      </div>

      <div className={styles.progressBox}>
        <div className={styles.progressLabel}>
          <span>Progresso geral da coleção</span>
          <span>{pctGeral}%</span>
        </div>
        <ProgressBar pct={pctGeral} height={10} />
      </div>

      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Segmentação</th>
              <th>Projeção</th>
              <th>Comprado</th>
              <th>Saldo</th>
              <th style={{ minWidth: 140 }}>Progresso</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className={styles.emptyRow}>Carregando…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className={styles.emptyRow}>
                Nenhuma projeção cadastrada para esta coleção.
              </td></tr>
            )}
            {!loading && rows.map(({ seg, projecao, comprado, saldo, pct }) => (
              <tr
                key={seg.id}
                className={pct >= 100 ? styles.rowDone : pct === 0 ? styles.rowNone : ''}
              >
                <td>
                  <div className={styles.segCell}>
                    {pct >= 100 && <span className={styles.checkMark}>✓</span>}
                    <span>{seg.classificacao} · {seg.tipo_produto} · {seg.classe}</span>
                  </div>
                </td>
                <td className={styles.numCell}>{projecao.toLocaleString('pt-BR')}</td>
                <td className={styles.numCell}>{comprado.toLocaleString('pt-BR')}</td>
                <td className={styles.numCell}>{saldo.toLocaleString('pt-BR')}</td>
                <td>
                  <div className={styles.barCell}>
                    <div style={{ flex: 1 }}><ProgressBar pct={pct} /></div>
                    <span className={styles.pctText}>{pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Seed test data via DevTools (for visual verification)**

Run `npm run dev`, open DevTools (Ctrl+Shift+I), run in console:

```js
// Seed: criar coleção + segmentação + projeção simples
const colId = await window.api.colecoes.create({ nome: 'Verão 2026', estacao: 'verao', ano: 2026 })
const segId = await window.api.segmentacoes.create({ classificacao: 'AD', tipo_produto: 'BERMUDA', classe: 'FEM', estacao: 'VERAO' })
// Salvar projeção manualmente
await window.api.projecoes.salvar(segId, colId, [
  { tamanho: 'P', ordem: 0, qtd_projetada: 110, qtd_ajustada: 90 },
  { tamanho: 'M', ordem: 1, qtd_projetada: 220, qtd_ajustada: 200 },
  { tamanho: 'G', ordem: 2, qtd_projetada: 165, qtd_ajustada: 165 },
], 'media_simples')
// Registrar pedido parcial
const fornId = await window.api.fornecedores.create({ nome: 'Fornecedor Teste', contato: '' })
await window.api.pedidos.salvar({ fornecedor_id: fornId, colecao_id: colId, segmentacao_id: segId, data_pedido: '2026-05-16', valor_unitario: 49.90, itens: [{ tamanho: 'P', qtd_pedida: 50 }, { tamanho: 'M', qtd_pedida: 120 }] })
// Reload page
location.reload()
```

Expected in the UI: Dashboard shows Verão 2026 with 1 segmentação com progresso parcial.

- [ ] **Step 4: Verify tests still pass**

```powershell
cd "C:\Users\eduke\Solução Compras"; npx vitest run --reporter=verbose
```

Expected: all 29 tests passing.

- [ ] **Step 5: Commit**

```powershell
cd "C:\Users\eduke\Solução Compras"; git add src/renderer/src/screens/Dashboard.jsx src/renderer/src/screens/Dashboard.module.css; git commit -m "feat: dashboard screen"
```

---

## Task 5: Planejamento Screen

**Files:**
- Create: `src/renderer/src/screens/Planejamento.jsx`
- Create: `src/renderer/src/screens/Planejamento.module.css`

- [ ] **Step 1: Create `Planejamento.module.css`**

```css
/* src/renderer/src/screens/Planejamento.module.css */
.page { padding: 1.5rem; max-width: 900px; }
.title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.25rem; }

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.panelRow {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.panelRow:last-child { border-bottom: none; }

.sectionLabel {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
  min-width: 120px;
}

/* Method pills */
.methods { display: flex; gap: 0.4rem; }
.method {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  padding: 0.2rem 0.65rem;
  font-size: 0.8rem;
}
.method:hover { color: var(--text-primary); }
.methodActive {
  background: rgba(99,102,241,0.2) !important;
  border-color: rgba(99,102,241,0.5) !important;
  color: var(--accent-light) !important;
}

/* Grade table */
.table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.table th {
  padding: 0.6rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  text-align: right;
}
.table th:first-child { text-align: left; }
.table td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.04);
  text-align: right;
  color: var(--text-secondary);
}
.table td:first-child { text-align: left; font-weight: 600; color: var(--text-primary); }
.table tfoot td {
  border-top: 1px solid var(--border);
  font-weight: 600;
  color: var(--text-primary);
}

.adjInput {
  width: 64px;
  text-align: right;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  color: var(--yellow);
  padding: 0.2rem 0.4rem;
  font-size: 0.85rem;
}
.adjInput:focus {
  outline: none;
  border-color: var(--accent);
}
.adjModified { border-color: rgba(99,102,241,0.6) !important; }

/* Actions */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}
.btnSecondary {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}
.btnSecondary:hover { color: var(--text-primary); }
.btnPrimary {
  background: rgba(99,102,241,0.25);
  border: 1px solid rgba(99,102,241,0.5);
  border-radius: 4px;
  color: var(--accent-light);
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}
.btnPrimary:hover { background: rgba(99,102,241,0.35); }

.warning {
  background: rgba(251,146,60,0.1);
  border: 1px solid rgba(251,146,60,0.3);
  border-radius: 6px;
  color: var(--orange);
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.savedBadge {
  font-size: 0.75rem;
  color: var(--green);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.placeholder {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}
```

- [ ] **Step 2: Create `Planejamento.jsx`**

```jsx
// src/renderer/src/screens/Planejamento.jsx
import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import { findBaseColecoes } from '../utils/colecoes'
import SegmentacaoSelect from '../components/SegmentacaoSelect'
import styles from './Planejamento.module.css'

const METODOS = [
  { id: 'media_simples',   label: 'Média simples'   },
  { id: 'media_ponderada', label: 'Média ponderada' },
  { id: 'manual',          label: 'Manual'           },
]

export default function Planejamento() {
  const { active, collections } = useCollection()
  const [segs, setSegs] = useState([])
  const [segId, setSegId] = useState(null)
  const [metodo, setMetodo] = useState('media_simples')
  const [rows, setRows] = useState([])    // { tamanho, ordem, n2, n1, qtd_projetada, qtd_ajustada }
  const [baseNomes, setBaseNomes] = useState(['', ''])
  const [warning, setWarning] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.segmentacoes.list().then(setSegs)
  }, [])

  useEffect(() => {
    if (!active || !segId) { setRows([]); setWarning(null); return }
    setSaved(false)
    loadPlanejamento(segId, metodo)
  }, [active?.id, segId, metodo])

  async function loadPlanejamento(sid, met) {
    setWarning(null)
    const base = findBaseColecoes(collections, active)
    if (base.length < 2) {
      setWarning(
        `São necessárias 2 coleções históricas equivalentes (${active.estacao}). ` +
        `Encontrado: ${base.length}. Importe o histórico antes de planejar.`
      )
      setRows([])
      return
    }
    const [n2Id, n1Id] = [base[0].id, base[1].id]
    const [gradeN2, gradeN1, projSaved, projCalc] = await Promise.all([
      window.api.grades.get(sid, n2Id),
      window.api.grades.get(sid, n1Id),
      window.api.projecoes.get(sid, active.id),
      met !== 'manual' ? window.api.projecoes.calcular(sid, active.id, [n2Id, n1Id], met) : Promise.resolve([]),
    ])

    const savedMap = Object.fromEntries(projSaved.map(r => [r.tamanho, r.qtd_ajustada]))
    const n2Map    = Object.fromEntries(gradeN2.map(r => [r.tamanho, r.qtd_comprada]))
    const n1Map    = Object.fromEntries(gradeN1.map(r => [r.tamanho, r.qtd_comprada]))

    if (met === 'manual') {
      // In manual mode, show current saved rows (or empty)
      const merged = projSaved.map(r => ({
        tamanho: r.tamanho,
        ordem:   r.ordem,
        n2:      n2Map[r.tamanho] ?? 0,
        n1:      n1Map[r.tamanho] ?? 0,
        qtd_projetada: r.qtd_projetada,
        qtd_ajustada:  r.qtd_ajustada,
      }))
      setRows(merged)
    } else {
      const merged = projCalc.map(r => ({
        tamanho: r.tamanho,
        ordem:   r.ordem,
        n2:      n2Map[r.tamanho] ?? 0,
        n1:      n1Map[r.tamanho] ?? 0,
        qtd_projetada: r.qtd_projetada,
        qtd_ajustada:  savedMap[r.tamanho] ?? r.qtd_projetada,
      }))
      setRows(merged)
    }

    setBaseNomes([base[0].nome, base[1].nome])
  }

  function handleAdjust(tamanho, raw) {
    const val = parseInt(raw, 10)
    if (isNaN(val) || val < 0) return
    setSaved(false)
    setRows(prev => prev.map(r => r.tamanho === tamanho ? { ...r, qtd_ajustada: val } : r))
  }

  function handleRestore() {
    setSaved(false)
    setRows(prev => prev.map(r => ({ ...r, qtd_ajustada: r.qtd_projetada })))
  }

  async function handleSave() {
    if (!segId || !active || rows.length === 0) return
    const toSave = rows.map(({ tamanho, ordem, qtd_projetada, qtd_ajustada }) =>
      ({ tamanho, ordem, qtd_projetada, qtd_ajustada })
    )
    await window.api.projecoes.salvar(segId, active.id, toSave, metodo)
    setSaved(true)
  }

  const totalProjetado = rows.reduce((s, r) => s + r.qtd_projetada, 0)
  const totalAjustado  = rows.reduce((s, r) => s + r.qtd_ajustada, 0)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Planejamento{active ? ` — ${active.nome}` : ''}</h1>

      {warning && <div className={styles.warning}>{warning}</div>}

      <div className={styles.panel}>
        {/* Segmentação */}
        <div className={styles.panelRow}>
          <span className={styles.sectionLabel}>Segmentação</span>
          <SegmentacaoSelect segs={segs} value={segId} onChange={setSegId} />
        </div>

        {/* Método */}
        <div className={styles.panelRow}>
          <span className={styles.sectionLabel}>Método</span>
          <div className={styles.methods}>
            {METODOS.map(m => (
              <button
                key={m.id}
                className={`${styles.method} ${metodo === m.id ? styles.methodActive : ''}`}
                onClick={() => setMetodo(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          {rows.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Baseado em: {baseNomes.join(' + ')}
            </span>
          )}
        </div>

        {/* Grade */}
        {!segId && (
          <div className={styles.placeholder}>Selecione uma segmentação para visualizar a projeção.</div>
        )}
        {segId && rows.length === 0 && !warning && (
          <div className={styles.placeholder}>Sem dados históricos para esta segmentação.</div>
        )}
        {segId && rows.length > 0 && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table} style={{ padding: '0.75rem 1rem', display: 'table' }}>
                <thead>
                  <tr>
                    <th>Tamanho</th>
                    <th style={{ color: 'var(--text-secondary)' }}>{baseNomes[0] || 'N-2'}</th>
                    <th style={{ color: 'var(--text-secondary)' }}>{baseNomes[1] || 'N-1'}</th>
                    <th style={{ color: 'var(--purple)' }}>Projeção calc.</th>
                    <th style={{ color: 'var(--yellow)' }}>Ajuste manual</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.tamanho}>
                      <td>{r.tamanho}</td>
                      <td>{r.n2}</td>
                      <td>{r.n1}</td>
                      <td style={{ color: 'var(--purple)', fontWeight: 600 }}>{r.qtd_projetada}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          className={`${styles.adjInput} ${r.qtd_ajustada !== r.qtd_projetada ? styles.adjModified : ''}`}
                          value={r.qtd_ajustada}
                          onChange={e => handleAdjust(r.tamanho, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>{rows.reduce((s, r) => s + r.n2, 0)}</td>
                    <td>{rows.reduce((s, r) => s + r.n1, 0)}</td>
                    <td style={{ color: 'var(--purple)' }}>{totalProjetado}</td>
                    <td style={{ color: 'var(--yellow)', textAlign: 'right' }}>
                      <strong>{totalAjustado}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className={styles.actions}>
              {saved && <span className={styles.savedBadge}>✓ Salvo</span>}
              <button className={styles.btnSecondary} onClick={handleRestore}>
                Restaurar calculado
              </button>
              <button className={styles.btnPrimary} onClick={handleSave}>
                Salvar projeção
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`, navigate to Planejamento. If there is data from Task 4 seed:
- The segmentation selector should show AD / BERMUDA / FEM
- Selecting it should show the grade table (if historical grade data exists — it won't from seed alone)
- Verify: no console errors, dropdowns work, method pills highlight correctly

- [ ] **Step 4: Verify tests still pass**

```powershell
cd "C:\Users\eduke\Solução Compras"; npx vitest run --reporter=verbose
```

Expected: all 29 tests still passing.

- [ ] **Step 5: Commit**

```powershell
cd "C:\Users\eduke\Solução Compras"; git add src/renderer/src/screens/Planejamento.jsx src/renderer/src/screens/Planejamento.module.css; git commit -m "feat: planejamento screen"
```

---

## Task 6: Compras Screen

**Files:**
- Create: `src/renderer/src/screens/Compras.jsx`
- Create: `src/renderer/src/screens/Compras.module.css`

- [ ] **Step 1: Create `Compras.module.css`**

```css
/* src/renderer/src/screens/Compras.module.css */
.page { padding: 1.5rem; max-width: 950px; }
.title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.25rem; }

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.formRow {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.field { display: flex; flex-direction: column; gap: 0.3rem; }
.fieldLabel {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.table th {
  padding: 0.6rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  text-align: right;
}
.table th:first-child { text-align: left; }
.table td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.04);
  text-align: right;
  color: var(--text-secondary);
}
.table td:first-child { text-align: left; font-weight: 600; color: var(--text-primary); }
.table tfoot td {
  border-top: 1px solid var(--border);
  font-weight: 600;
}

.checkCell { color: var(--green); }

.qtyInput {
  width: 64px;
  text-align: right;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 4px;
  color: var(--text-primary);
  padding: 0.2rem 0.4rem;
  font-size: 0.85rem;
}
.qtyInput:focus { outline: none; border-color: var(--accent); }

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
}
.total { font-size: 0.9rem; color: var(--text-secondary); }
.totalValue { color: var(--orange); font-weight: 600; }

.actions { display: flex; gap: 0.5rem; }
.btnCancel {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}
.btnConfirm {
  background: rgba(16,185,129,0.2);
  border: 1px solid rgba(16,185,129,0.4);
  border-radius: 4px;
  color: var(--green);
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}
.btnConfirm:hover { background: rgba(16,185,129,0.3); }
.btnConfirm:disabled { opacity: 0.4; cursor: not-allowed; }

.placeholder {
  padding: 2.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.successBanner {
  background: rgba(134,239,172,0.1);
  border: 1px solid rgba(134,239,172,0.3);
  border-radius: 6px;
  color: var(--green);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
```

- [ ] **Step 2: Create `Compras.jsx`**

```jsx
// src/renderer/src/screens/Compras.jsx
import { useState, useEffect } from 'react'
import { useCollection } from '../contexts/CollectionContext'
import SegmentacaoSelect from '../components/SegmentacaoSelect'
import styles from './Compras.module.css'

export default function Compras() {
  const { active } = useCollection()
  const [segs,    setSegs]    = useState([])
  const [forns,   setForns]   = useState([])
  const [fornId,  setFornId]  = useState('')
  const [segId,   setSegId]   = useState(null)
  const [dataPed, setDataPed] = useState(new Date().toISOString().slice(0, 10))
  const [valor,   setValor]   = useState('')
  const [proj,    setProj]    = useState([])   // { tamanho, qtd_ajustada }
  const [totais,  setTotais]  = useState([])   // { tamanho, total_pedido }
  const [qtds,    setQtds]    = useState({})   // { [tamanho]: number }
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      window.api.segmentacoes.list(),
      window.api.fornecedores.list(),
    ]).then(([s, f]) => { setSegs(s); setForns(f) })
  }, [])

  useEffect(() => {
    if (!active || !segId) { setProj([]); setTotais([]); setQtds({}); return }
    loadGrade(segId, active.id)
  }, [active?.id, segId])

  async function loadGrade(sid, colId) {
    const [projRows, totaisRows] = await Promise.all([
      window.api.projecoes.get(sid, colId),
      window.api.pedidos.totaisPorTamanho(sid, colId),
    ])
    setProj(projRows)
    setTotais(totaisRows)
    setQtds({})
  }

  function getComprado(tamanho) {
    return totais.find(r => r.tamanho === tamanho)?.total_pedido ?? 0
  }

  function getSaldo(tamanho, projecao) {
    return Math.max(0, projecao - getComprado(tamanho))
  }

  function handleQty(tamanho, raw) {
    const val = parseInt(raw, 10)
    setSuccess(false)
    setQtds(prev => ({ ...prev, [tamanho]: isNaN(val) || val < 0 ? 0 : val }))
  }

  const totalQtd   = Object.values(qtds).reduce((s, q) => s + q, 0)
  const valorNum   = parseFloat(valor.replace(',', '.')) || 0
  const totalValor = totalQtd * valorNum

  const canConfirm = fornId && segId && totalQtd > 0 && valorNum > 0 && active

  async function handleConfirm() {
    const itens = proj
      .map(r => ({ tamanho: r.tamanho, qtd_pedida: qtds[r.tamanho] ?? 0 }))
      .filter(i => i.qtd_pedida > 0)
    if (!itens.length) return

    await window.api.pedidos.salvar({
      fornecedor_id:  Number(fornId),
      colecao_id:     active.id,
      segmentacao_id: segId,
      data_pedido:    dataPed,
      valor_unitario: valorNum,
      itens,
    })

    // Reload totais and reset qtds
    const newTotais = await window.api.pedidos.totaisPorTamanho(segId, active.id)
    setTotais(newTotais)
    setQtds({})
    setSuccess(true)
  }

  function handleCancel() {
    setQtds({})
    setSuccess(false)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Registrar Pedido{active ? ` — ${active.nome}` : ''}</h1>

      {success && (
        <div className={styles.successBanner}>✓ Pedido registrado com sucesso.</div>
      )}

      <div className={styles.panel}>
        {/* Form header */}
        <div className={styles.formRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Fornecedor</span>
            <select value={fornId} onChange={e => setFornId(e.target.value)}>
              <option value="">Selecione…</option>
              {forns.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Data do pedido</span>
            <input type="date" value={dataPed} onChange={e => setDataPed(e.target.value)} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Valor unitário (R$)</span>
            <input
              type="text"
              placeholder="0,00"
              value={valor}
              onChange={e => setValor(e.target.value)}
              style={{ width: 90 }}
            />
          </div>
        </div>

        {/* Segmentation row */}
        <div className={styles.formRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Segmentação</span>
            <SegmentacaoSelect segs={segs} value={segId} onChange={setSegId} />
          </div>
        </div>

        {/* Grade table */}
        {!segId && (
          <div className={styles.placeholder}>Selecione uma segmentação para ver a grade.</div>
        )}
        {segId && proj.length === 0 && (
          <div className={styles.placeholder}>
            Sem projeção cadastrada para esta segmentação. Acesse Planejamento primeiro.
          </div>
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
                    const saldo = getSaldo(r.tamanho, r.qtd_ajustada)
                    return (
                      <tr key={r.tamanho}>
                        <td>{r.tamanho}</td>
                        <td style={{ color: 'var(--purple)' }}>{r.qtd_ajustada}</td>
                        <td style={{ color: 'var(--green)' }}>{comprado}</td>
                        <td>
                          {saldo === 0
                            ? <span className={styles.checkCell}>0 ✓</span>
                            : <span style={{ color: 'var(--yellow)' }}>{saldo}</span>
                          }
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className={styles.qtyInput}
                            value={qtds[r.tamanho] ?? 0}
                            onChange={e => handleQty(r.tamanho, e.target.value)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td style={{ color: 'var(--purple)' }}>{proj.reduce((s, r) => s + r.qtd_ajustada, 0)}</td>
                    <td style={{ color: 'var(--green)' }}>{totais.reduce((s, r) => s + r.total_pedido, 0)}</td>
                    <td>{proj.reduce((s, r) => s + getSaldo(r.tamanho, r.qtd_ajustada), 0)}</td>
                    <td>{totalQtd}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className={styles.footer}>
              <div className={styles.total}>
                Valor total do pedido:{' '}
                <span className={styles.totalValue}>
                  R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.actions}>
                <button className={styles.btnCancel} onClick={handleCancel}>Cancelar</button>
                <button className={styles.btnConfirm} onClick={handleConfirm} disabled={!canConfirm}>
                  Confirmar pedido
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify visually**

Run `npm run dev`. Navigate to Compras:
- All 3 dropdowns in header should work
- Segmentation selector should show available segments
- If seed data exists from Task 4: select Fornecedor Teste, select AD/BERMUDA/FEM, enter a unit price, enter quantities — Confirmar should register the order
- After confirming: "Já comprado" column should update, success banner appears

- [ ] **Step 4: Verify tests still pass**

```powershell
cd "C:\Users\eduke\Solução Compras"; npx vitest run --reporter=verbose
```

Expected: all 29 tests still passing.

- [ ] **Step 5: Commit**

```powershell
cd "C:\Users\eduke\Solução Compras"; git add src/renderer/src/screens/Compras.jsx src/renderer/src/screens/Compras.module.css; git commit -m "feat: compras screen"
```

---

## Phase 2 Complete ✓

At this point:
- `npm test` → all 29 tests passing
- `npm run dev` → Electron opens with full UI:
  - Sidebar with navigation and collection selector
  - Dashboard with metric cards + segmentation table + progress bars
  - Planejamento with cascading selector, grade table, method toggle, save
  - Compras with purchase order form, grade grade, confirm
  - Dark/light mode toggle works

**End-to-end smoke test (run in DevTools console after seeding):**

```js
// 1. Check collection loaded
await window.api.colecoes.list()
// → [{id:1, nome:'Verão 2026', ...}]

// 2. Check segmentation list
await window.api.segmentacoes.list()
// → [{id:1, classificacao:'AD', tipo_produto:'BERMUDA', classe:'FEM', ...}]

// 3. Check projection exists
await window.api.projecoes.get(1, 1)
// → [{tamanho:'P', qtd_ajustada:90, ...}, ...]

// 4. Check totals after purchase
await window.api.pedidos.totaisPorTamanho(1, 1)
// → [{tamanho:'P', total_pedido:50}, {tamanho:'M', total_pedido:120}]
```

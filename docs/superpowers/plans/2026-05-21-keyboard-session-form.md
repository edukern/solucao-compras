# Keyboard-First Session Form — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the `IniciarSessao` component in `Compras.jsx` to use a progressive-focus layout with full keyboard navigation (Enter advances, Esc goes back, letter shortcuts for Frete and number shortcuts for Lojas) and a first-time tutorial overlay.

**Architecture:** Pure UI refactor — no changes to IPC, database, or context. Two new React components (`TutorialOverlay` + refactored `IniciarSessao`) replace the existing form grid. State is managed locally with `activeField` tracking which field is active; all other fields render as done/upcoming based on their position relative to `activeField`. Tutorial visibility is persisted in `localStorage`.

**Tech Stack:** React 18, CSS Modules, Electron (renderer process), `localStorage` for tutorial persistence.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/renderer/src/screens/Compras.jsx` | Replace `IniciarSessao` function; add `TutorialOverlay` function above it |
| Modify | `src/renderer/src/screens/Compras.module.css` | Add all new CSS classes for progressive focus form and tutorial overlay |

No other files touched. The orchestrator that renders `<IniciarSessao>` passes the same props — no call-site changes needed.

---

## Task 1: CSS classes

**Files:**
- Modify: `src/renderer/src/screens/Compras.module.css`

- [ ] **Step 1: Append CSS to the end of `Compras.module.css`**

Open `C:\Users\eduke\Solução Compras\src\renderer\src\screens\Compras.module.css` and append the following block at the very end of the file:

```css
/* ── Keyboard-first session form ──────────────────────────────────── */
.kbForm {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}
.kbHeader {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  margin-bottom: 0.25rem;
}
.kbHeaderTitle {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}
.kbProgressWrap {
  flex: 1;
  height: 3px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
}
.kbProgressBar {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 0.3s ease;
}
.kbHelpBtn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.kbHelpBtn:hover { background: var(--border); }

.kbFields {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.kbField {
  padding: 0.65rem 1rem;
  border-left: 3px solid transparent;
  transition: opacity 0.2s, border-color 0.2s, background 0.2s;
  position: relative;
}
.kbField + .kbField { border-top: 1px solid var(--border); }
.kbFieldDone {
  opacity: 0.5;
  cursor: pointer;
}
.kbFieldDone:hover { opacity: 0.75; }
.kbFieldActive {
  border-left-color: var(--accent);
  background: rgba(99, 102, 241, 0.06);
}
.kbFieldUpcoming {
  opacity: 0.2;
  pointer-events: none;
}
.kbFieldLabel {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.kbCheck { color: var(--accent); }
.kbFieldValue {
  font-size: 0.88rem;
  color: var(--text-primary);
}
.kbFieldInput {
  background: transparent;
  border: none;
  border-bottom: 1.5px solid var(--accent);
  color: var(--text-primary);
  font-size: 0.9rem;
  padding: 0.2rem 0;
  outline: none;
  width: 100%;
}
.kbHint {
  margin-top: 0.4rem;
  font-size: 0.65rem;
  color: var(--accent);
  opacity: 0.8;
}
.kbHint kbd {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 0.6rem;
  color: var(--accent);
  font-family: monospace;
}

/* Frete options */
.kbFreteOpts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}
.kbFreteOpt {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  background: var(--bg-hover);
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}
.kbFreteOptOn {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--accent);
  color: var(--accent);
}
.kbKey {
  font-size: 0.62rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: monospace;
  color: var(--accent);
}

/* Lojas grid */
.kbLojaGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  margin-top: 0.4rem;
}
.kbLojaChip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 7px;
  background: var(--bg-hover);
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.kbLojaChipOn {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--accent);
}
.kbLojaNum {
  width: 18px;
  height: 18px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.65rem;
  font-family: monospace;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 700;
}
.kbLojaNumOn {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}
.kbLojaName {
  font-size: 0.78rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kbLojaCity {
  font-size: 0.62rem;
  color: var(--text-muted);
}

/* Fornecedor autocomplete dropdown */
.kbDropdown {
  position: absolute;
  left: 1rem;
  right: 1rem;
  top: calc(100% - 4px);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  z-index: 10;
  overflow: hidden;
}
.kbDropItem {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
}
.kbDropItem:hover { background: var(--bg-hover); }
.kbDropItemFocused {
  background: var(--accent);
  color: white;
}

/* Tutorial overlay */
.kbTutOverlay {
  position: absolute;
  inset: -0.5rem;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: 10px;
  backdrop-filter: blur(2px);
}
.kbTutCard {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  width: 90%;
  max-width: 340px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.kbTutTitle {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}
.kbTutSub {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.kbTutRows {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.25rem;
}
.kbTutRow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.kbTutKeys {
  display: flex;
  gap: 0.25rem;
  min-width: 80px;
  justify-content: flex-end;
  flex-shrink: 0;
}
.kbTutKbd {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-bottom: 2px solid var(--border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.68rem;
  color: var(--accent);
  font-family: monospace;
}
.kbTutDesc {
  font-size: 0.78rem;
  color: var(--text-secondary);
}
.kbTutFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.kbTutSkip {
  font-size: 0.7rem;
  color: var(--text-muted);
  cursor: pointer;
}
.kbTutSkip:hover { color: var(--text-secondary); }
.kbTutDismiss {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 7px;
  padding: 0.45rem 1rem;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
}
```

- [ ] **Step 2: Verify no CSS syntax errors**

Run:
```
cd "C:\Users\eduke\Solução Compras" && npm run dev 2>&1 | head -20
```

Expected: dev server starts without CSS errors. Kill with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git -C "C:\Users\eduke\Solução Compras" add src/renderer/src/screens/Compras.module.css
git -C "C:\Users\eduke\Solução Compras" commit -m "style: add CSS classes for keyboard-first session form"
```

---

## Task 2: TutorialOverlay component

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` (insert before `IniciarSessao` function, around line 13)

- [ ] **Step 1: Insert `TutorialOverlay` function**

In `Compras.jsx`, find the comment line:
```js
// ─── Phase 1: Start Session ───────────────────────────────────────────────
```

Insert the following function **immediately before** that comment:

```jsx
// ─── Tutorial overlay ─────────────────────────────────────────────────────

function TutorialOverlay({ onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.kbTutOverlay}>
      <div className={styles.kbTutCard}>
        <div className={styles.kbTutTitle}>⌨️ Preenchimento por teclado</div>
        <div className={styles.kbTutSub}>Este formulário é otimizado para velocidade.</div>
        <div className={styles.kbTutRows}>
          {[
            { keys: ['Enter'],  desc: 'Avança para o próximo campo' },
            { keys: ['Esc'],    desc: 'Volta ao campo anterior' },
            { keys: ['C', 'F'], desc: 'Frete CIF ou FOB (auto-avança)' },
            { keys: ['1–8'],    desc: 'Seleciona loja participante' },
          ].map(({ keys, desc }) => (
            <div key={desc} className={styles.kbTutRow}>
              <div className={styles.kbTutKeys}>
                {keys.map(k => <kbd key={k} className={styles.kbTutKbd}>{k}</kbd>)}
              </div>
              <div className={styles.kbTutDesc}>{desc}</div>
            </div>
          ))}
        </div>
        <div className={styles.kbTutFooter}>
          <span className={styles.kbTutSkip} onClick={onClose}>Não mostrar novamente</span>
          <button className={styles.kbTutDismiss} onClick={onClose}>
            Entendido <kbd className={styles.kbTutKbd}>Enter</kbd>
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git -C "C:\Users\eduke\Solução Compras" add src/renderer/src/screens/Compras.jsx
git -C "C:\Users\eduke\Solução Compras" commit -m "feat: add TutorialOverlay component"
```

---

## Task 3: Rewrite `IniciarSessao`

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` (lines 15–130, the entire `IniciarSessao` function)

- [ ] **Step 1: Replace the entire `IniciarSessao` function**

Find the existing function (starts at `function IniciarSessao({ forns, compradores, colId, onStart }) {` and ends at the closing `}` before the `// ─── Phase 2` comment around line 131).

Replace the **entire function** with:

```jsx
function IniciarSessao({ forns, compradores, colId, onStart }) {
  const [fornId,         setFornId]         = useState('')
  const [fornFilter,     setFornFilter]     = useState('')
  const [fornFocusIdx,   setFornFocusIdx]   = useState(0)
  const [data,           setData]           = useState(today())
  const [vendedor,       setVendedor]       = useState('')
  const [condPag,        setCondPag]        = useState('')
  const [frete,          setFrete]          = useState('')
  const [transportadora, setTransportadora] = useState('')
  const [obs,            setObs]            = useState('')
  const [lojas,          setLojas]          = useState([])
  const [saving,         setSaving]         = useState(false)
  const [error,          setError]          = useState(null)
  const [activeField,    setActiveField]    = useState('fornecedor')
  const [showTutorial,   setShowTutorial]   = useState(
    () => localStorage.getItem('sessionFormTutorialSeen') !== 'true'
  )
  const activeRef = useRef(null)

  const ORDER = [
    'fornecedor', 'data', 'vendedor', 'condPag', 'frete',
    ...(frete === 'FOB' ? ['transportadora'] : []),
    'lojas',
  ]
  const activeIdx   = ORDER.indexOf(activeField)
  const progressPct = Math.round((activeIdx / (ORDER.length - 1)) * 100)

  const fornFiltered = forns.filter(f =>
    f.nome.toLowerCase().includes(fornFilter.toLowerCase())
  )

  useEffect(() => { activeRef.current?.focus() }, [activeField])

  function stateOf(name) {
    const i = ORDER.indexOf(name)
    if (i === activeIdx) return 'active'
    if (i < activeIdx)   return 'done'
    return 'upcoming'
  }

  function fieldCls(name) {
    const s = stateOf(name)
    return [
      styles.kbField,
      s === 'active'   ? styles.kbFieldActive   : '',
      s === 'done'     ? styles.kbFieldDone     : '',
      s === 'upcoming' ? styles.kbFieldUpcoming : '',
    ].filter(Boolean).join(' ')
  }

  function advance() {
    const next = ORDER[activeIdx + 1]
    if (next) setActiveField(next)
  }

  function goBack() {
    const prev = ORDER[activeIdx - 1]
    if (prev) setActiveField(prev)
  }

  function toggleLoja(id) {
    setLojas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleStart() {
    if (!fornId || lojas.length === 0) return
    setSaving(true)
    setError(null)
    try {
      const sessao = await window.api.sessoes.create({
        fornecedor_id: Number(fornId),
        colecao_id:    colId,
        data_visita:   data,
        vendedor,
        cond_pag:      condPag,
        frete,
        transportadora: frete === 'FOB' ? transportadora : '',
        obs,
      }, lojas)
      const lojasPresentes = compradores.filter(c => lojas.includes(c.id))
      onStart(sessao, lojasPresentes)
    } catch {
      setError('Erro ao iniciar sessão.')
    } finally {
      setSaving(false)
    }
  }

  function dismissTutorial() {
    localStorage.setItem('sessionFormTutorialSeen', 'true')
    setShowTutorial(false)
  }

  // ── Keyboard handlers ────────────────────────────────────────────────────

  function onFornKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFornFocusIdx(i => Math.min(i + 1, fornFiltered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFornFocusIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const sel = fornFiltered[fornFocusIdx] ?? fornFiltered[0]
      if (sel) { setFornId(String(sel.id)); setFornFilter(sel.nome); advance() }
    }
    // Esc on first field: do nothing
  }

  function onTextKey(e) {
    if (e.key === 'Enter')  { e.preventDefault(); advance() }
    if (e.key === 'Escape') { e.preventDefault(); goBack() }
  }

  function onFreteKey(e) {
    const k = e.key.toLowerCase()
    if (k === 'c')          { setFrete('CIF'); setTransportadora(''); advance() }
    else if (k === 'f')     { setFrete('FOB'); advance() }
    else if (e.key === 'Enter')  { setFrete(''); advance() }
    else if (e.key === 'Escape') { goBack() }
  }

  function onLojasKey(e) {
    const n = parseInt(e.key, 10)
    if (n >= 1 && n <= compradores.length) {
      toggleLoja(compradores[n - 1].id)
    } else if (e.key === 'Enter' && lojas.length > 0) {
      handleStart()
    } else if (e.key === 'Escape') {
      goBack()
    }
  }

  // ── Field-label helpers ──────────────────────────────────────────────────

  const FIELD_NAMES = {
    fornecedor:     'Fornecedor',
    data:           'Data da visita',
    vendedor:       'Vendedor',
    condPag:        'Cond. de pagamento',
    frete:          'Frete',
    transportadora: 'Transportadora',
    lojas:          'Lojas participantes',
  }

  function DoneLabel({ name }) {
    return (
      <div className={styles.kbFieldLabel}>
        <span className={styles.kbCheck}>✓</span> {FIELD_NAMES[name]}
      </div>
    )
  }

  function UpcomingLabel({ name }) {
    return <div className={styles.kbFieldLabel}>{FIELD_NAMES[name]}</div>
  }

  const freteDisplay = { CIF: 'CIF', FOB: 'FOB', '': 'Sem frete' }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.kbForm}>

      {/* Header: title + progress bar + help button */}
      <div className={styles.kbHeader}>
        <span className={styles.kbHeaderTitle}>Iniciar Sessão de Compras</span>
        <div className={styles.kbProgressWrap}>
          <div className={styles.kbProgressBar} style={{ width: `${progressPct}%` }} />
        </div>
        <button
          className={styles.kbHelpBtn}
          onClick={() => setShowTutorial(true)}
          title="Ver atalhos de teclado"
        >?</button>
      </div>

      {/* Fields */}
      <div className={styles.kbFields}>

        {/* 1 — Fornecedor */}
        <div
          className={fieldCls('fornecedor')}
          onClick={stateOf('fornecedor') === 'done' ? () => setActiveField('fornecedor') : undefined}
        >
          {stateOf('fornecedor') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.fornecedor}</div>
              <input
                ref={activeRef}
                className={styles.kbFieldInput}
                value={fornFilter}
                onChange={e => { setFornFilter(e.target.value); setFornFocusIdx(0) }}
                onKeyDown={onFornKey}
                placeholder="Digite para buscar…"
                autoComplete="off"
              />
              {fornFilter.length > 0 && fornFiltered.length > 0 && (
                <div className={styles.kbDropdown}>
                  {fornFiltered.slice(0, 6).map((f, i) => (
                    <div
                      key={f.id}
                      className={`${styles.kbDropItem} ${i === fornFocusIdx ? styles.kbDropItemFocused : ''}`}
                      onMouseDown={() => { setFornId(String(f.id)); setFornFilter(f.nome); advance() }}
                    >
                      {f.nome}
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.kbHint}>↑↓ navega · <kbd>Enter</kbd> seleciona</div>
            </>
          ) : stateOf('fornecedor') === 'done' ? (
            <>
              <DoneLabel name="fornecedor" />
              <div className={styles.kbFieldValue}>
                {forns.find(f => String(f.id) === fornId)?.nome ?? '—'}
              </div>
            </>
          ) : (
            <UpcomingLabel name="fornecedor" />
          )}
        </div>

        {/* 2 — Data */}
        <div
          className={fieldCls('data')}
          onClick={stateOf('data') === 'done' ? () => setActiveField('data') : undefined}
        >
          {stateOf('data') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.data}</div>
              <input
                ref={activeRef}
                type="date"
                className={styles.kbFieldInput}
                value={data}
                onChange={e => setData(e.target.value)}
                onKeyDown={onTextKey}
              />
              <div className={styles.kbHint}><kbd>Enter</kbd> confirma · padrão: hoje</div>
            </>
          ) : stateOf('data') === 'done' ? (
            <>
              <DoneLabel name="data" />
              <div className={styles.kbFieldValue}>{fmtDate(data)}</div>
            </>
          ) : (
            <UpcomingLabel name="data" />
          )}
        </div>

        {/* 3 — Vendedor */}
        <div
          className={fieldCls('vendedor')}
          onClick={stateOf('vendedor') === 'done' ? () => setActiveField('vendedor') : undefined}
        >
          {stateOf('vendedor') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.vendedor}</div>
              <input
                ref={activeRef}
                type="text"
                className={styles.kbFieldInput}
                value={vendedor}
                onChange={e => setVendedor(e.target.value)}
                onKeyDown={onTextKey}
                placeholder="Nome do vendedor"
              />
              <div className={styles.kbHint}><kbd>Enter</kbd> avança · <kbd>Esc</kbd> volta</div>
            </>
          ) : stateOf('vendedor') === 'done' ? (
            <>
              <DoneLabel name="vendedor" />
              <div className={styles.kbFieldValue}>{vendedor || '—'}</div>
            </>
          ) : (
            <UpcomingLabel name="vendedor" />
          )}
        </div>

        {/* 4 — Cond. Pagamento */}
        <div
          className={fieldCls('condPag')}
          onClick={stateOf('condPag') === 'done' ? () => setActiveField('condPag') : undefined}
        >
          {stateOf('condPag') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.condPag}</div>
              <input
                ref={activeRef}
                type="text"
                className={styles.kbFieldInput}
                value={condPag}
                onChange={e => setCondPag(e.target.value)}
                onKeyDown={onTextKey}
                placeholder="Ex: 30/60 dias"
              />
              <div className={styles.kbHint}><kbd>Enter</kbd> avança · <kbd>Esc</kbd> volta</div>
            </>
          ) : stateOf('condPag') === 'done' ? (
            <>
              <DoneLabel name="condPag" />
              <div className={styles.kbFieldValue}>{condPag || '—'}</div>
            </>
          ) : (
            <UpcomingLabel name="condPag" />
          )}
        </div>

        {/* 5 — Frete */}
        <div
          className={fieldCls('frete')}
          ref={stateOf('frete') === 'active' ? activeRef : null}
          tabIndex={stateOf('frete') === 'active' ? 0 : undefined}
          onKeyDown={stateOf('frete') === 'active' ? onFreteKey : undefined}
          onClick={stateOf('frete') === 'done' ? () => setActiveField('frete') : undefined}
        >
          {stateOf('frete') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.frete}</div>
              <div className={styles.kbFreteOpts}>
                {[['CIF', 'C'], ['FOB', 'F'], ['', '↵']].map(([val, key]) => (
                  <button
                    key={val || 'none'}
                    className={`${styles.kbFreteOpt} ${frete === val ? styles.kbFreteOptOn : ''}`}
                    onMouseDown={e => {
                      e.preventDefault()
                      setFrete(val)
                      if (val !== 'FOB') setTransportadora('')
                      advance()
                    }}
                  >
                    <span className={styles.kbKey}>{key}</span>
                    {val || 'Sem frete'}
                  </button>
                ))}
              </div>
              <div className={styles.kbHint}>
                <kbd>C</kbd> CIF · <kbd>F</kbd> FOB · <kbd>Enter</kbd> sem frete · <kbd>Esc</kbd> volta
              </div>
            </>
          ) : stateOf('frete') === 'done' ? (
            <>
              <DoneLabel name="frete" />
              <div className={styles.kbFieldValue}>{freteDisplay[frete] ?? '—'}</div>
            </>
          ) : (
            <UpcomingLabel name="frete" />
          )}
        </div>

        {/* 5b — Transportadora (only when FOB) */}
        {frete === 'FOB' && (
          <div
            className={fieldCls('transportadora')}
            onClick={stateOf('transportadora') === 'done' ? () => setActiveField('transportadora') : undefined}
          >
            {stateOf('transportadora') === 'active' ? (
              <>
                <div className={styles.kbFieldLabel}>{FIELD_NAMES.transportadora}</div>
                <input
                  ref={activeRef}
                  type="text"
                  className={styles.kbFieldInput}
                  value={transportadora}
                  onChange={e => setTransportadora(e.target.value)}
                  onKeyDown={onTextKey}
                  placeholder="Nome da transportadora"
                />
                <div className={styles.kbHint}><kbd>Enter</kbd> avança · <kbd>Esc</kbd> volta</div>
              </>
            ) : stateOf('transportadora') === 'done' ? (
              <>
                <DoneLabel name="transportadora" />
                <div className={styles.kbFieldValue}>{transportadora || '—'}</div>
              </>
            ) : (
              <UpcomingLabel name="transportadora" />
            )}
          </div>
        )}

        {/* 6 — Lojas */}
        <div
          className={fieldCls('lojas')}
          ref={stateOf('lojas') === 'active' ? activeRef : null}
          tabIndex={stateOf('lojas') === 'active' ? 0 : undefined}
          onKeyDown={stateOf('lojas') === 'active' ? onLojasKey : undefined}
        >
          {stateOf('lojas') === 'active' ? (
            <>
              <div className={styles.kbFieldLabel}>{FIELD_NAMES.lojas}</div>
              <div className={styles.kbLojaGrid}>
                {compradores.map((c, i) => (
                  <div
                    key={c.id}
                    className={`${styles.kbLojaChip} ${lojas.includes(c.id) ? styles.kbLojaChipOn : ''}`}
                    onMouseDown={() => toggleLoja(c.id)}
                  >
                    <div className={`${styles.kbLojaNum} ${lojas.includes(c.id) ? styles.kbLojaNumOn : ''}`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className={styles.kbLojaName}>{c.nome}</div>
                      {c.cidade && <div className={styles.kbLojaCity}>{c.cidade}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.kbHint}>
                <kbd>1</kbd>–<kbd>8</kbd> seleciona loja participante · <kbd>Enter</kbd> iniciar · <kbd>Esc</kbd> volta
              </div>
            </>
          ) : stateOf('lojas') === 'done' ? (
            <>
              <DoneLabel name="lojas" />
              <div className={styles.kbFieldValue}>{lojas.length} loja(s) selecionada(s)</div>
            </>
          ) : (
            <UpcomingLabel name="lojas" />
          )}
        </div>

      </div>

      {/* Error + fallback submit button */}
      {error && <div className={styles.errorBanner}>{error}</div>}
      <div className={styles.phaseActions}>
        <button
          className={styles.btnPrimary}
          disabled={!fornId || lojas.length === 0 || saving}
          onClick={handleStart}
        >
          Iniciar Sessão →
        </button>
      </div>

      {/* Tutorial overlay */}
      {showTutorial && <TutorialOverlay onClose={dismissTutorial} />}

    </div>
  )
}
```

- [ ] **Step 2: Start dev server and smoke test**

```
cd "C:\Users\eduke\Solução Compras" && npm run dev
```

Open the app. Navigate to **Compras**. With a coleção active, verify:

1. Tutorial overlay appears on first open (close with Enter)
2. Fornecedor field is active — type 2–3 letters, dropdown appears, ↑↓ navigates, Enter selects and advances
3. Data field activates — Enter advances to Vendedor
4. Vendedor → Enter → CondPag → Enter → Frete
5. Frete: press `C` → auto-advances to Lojas (CIF selected)
6. Lojas: press `1` then `2` → chips highlight; Enter → session starts
7. Esc on any field goes back to previous
8. Click the `?` button → tutorial overlay reappears
9. Done fields show value with `✓` and are clickable to re-edit

Kill dev server with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git -C "C:\Users\eduke\Solução Compras" add src/renderer/src/screens/Compras.jsx
git -C "C:\Users\eduke\Solução Compras" commit -m "feat: keyboard-first progressive focus form for IniciarSessao"
```

---

## Self-Review

### 1. Spec coverage

| Spec requirement | Covered by |
|---|---|
| Progressive focus: done/active/upcoming states | Task 3 — `stateOf()` + `fieldCls()` |
| Border-left accent on active field | Task 1 — `.kbFieldActive` |
| 50% opacity on done fields, clickable to re-edit | Task 1 — `.kbFieldDone`; Task 3 — `onClick` on done fields |
| 20% opacity on upcoming, no interaction | Task 1 — `.kbFieldUpcoming` |
| Progress bar in header | Task 1 — `.kbProgressBar`; Task 3 — `progressPct` inline style |
| Fornecedor: type-to-filter, ↑↓, Enter selects | Task 3 — `onFornKey` |
| Data: default today, Enter confirms | Task 3 — `useState(today())`, `onTextKey` |
| Vendedor / CondPag: text, Enter advances | Task 3 — `onTextKey` |
| Frete: C=CIF, F=FOB, Enter=sem frete, auto-advances on C/F | Task 3 — `onFreteKey` |
| Transportadora: only when FOB | Task 3 — `{frete === 'FOB' && ...}` |
| Lojas: 1–8 selects, Enter submits | Task 3 — `onLojasKey` |
| Esc goes back on all fields (except first) | Task 3 — `goBack()` in each handler |
| Tutorial overlay on first open | Task 2+3 — `TutorialOverlay` + `showTutorial` state |
| localStorage persistence | Task 3 — `dismissTutorial()` sets `sessionFormTutorialSeen` |
| Help button `?` always visible | Task 3 — `kbHelpBtn` in header |
| Enter/Esc dismiss tutorial | Task 2 — `useEffect` keydown listener |
| Fallback submit button remains | Task 3 — `btnPrimary` in `phaseActions` |
| No IPC/DB changes | ✓ — `handleStart` unchanged |

### 2. Placeholder scan
None found.

### 3. Type consistency
- `stateOf(name)` returns `'active' | 'done' | 'upcoming'` — used consistently in `fieldCls` and conditional renders
- `advance()` / `goBack()` use `ORDER` array defined in the function scope — `frete` is in closure so `'FOB'` branch is reactive
- CSS class names in JS match exactly what was defined in Task 1

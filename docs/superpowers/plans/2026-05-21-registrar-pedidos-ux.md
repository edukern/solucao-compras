# Registrar Pedidos UX Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melhorar a tela de Registrar Pedidos com 4 mudanças de UX: ocultar o StepBar na fase 2, colapsar o formulário de adição, permitir edição inline de itens, e mover a coluna Auto Distribuir para antes das grades.

**Architecture:** Pure UI refactor em `Compras.jsx` e `Compras.module.css`. Nenhuma alteração em IPC, banco ou contextos. As 4 mudanças são no componente `RegistrarPedidoSessao` e no componente pai (para o StepBar). Novos estados: `showAddForm`, `editingId`, `editForm`.

**Tech Stack:** React 18, CSS Modules, Electron renderer process.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/renderer/src/screens/Compras.module.css` | Novas classes: `.btnEditItem`, `.gradeInlineDist`, `.gradeInlineTotalReadonly`, `.editItemRow` |
| Modify | `src/renderer/src/screens/Compras.jsx` | StepBar condicional; `showAddForm`; `editingId`/`editForm`; reposicionar coluna Dist. |

---

## Task 1: CSS classes

**Files:**
- Modify: `src/renderer/src/screens/Compras.module.css`

- [ ] **Step 1: Append as 4 novas classes ao final de `Compras.module.css`**

Abra `C:\Users\eduke\Solução Compras\src\renderer\src\screens\Compras.module.css` e adicione ao final do arquivo (após o bloco `/* ── Keyboard-first session form ── */` e suas classes):

```css
/* ── Registrar Pedidos UX improvements ───────────────────────────── */
.btnEditItem {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 2px 6px;
  font-size: 0.85rem;
  line-height: 1;
}
.btnEditItem:hover { color: var(--accent); }

.editItemRow td {
  background: rgba(var(--accent-rgb, 99,102,241), 0.04) !important;
  padding: 4px 6px !important;
}
.editItemRow input,
.editItemRow select {
  font-size: 0.82rem;
  padding: 2px 4px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: var(--input-bg);
  color: var(--text-primary);
  width: 100%;
}

.gradeInlineDist {
  min-width: 64px;
  padding: 0.1rem 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.gradeInlineTotalReadonly {
  min-width: 52px;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent-light);
  padding: 0.2rem 0.35rem;
}
```

- [ ] **Step 2: Commit**

```bash
git -C "C:\Users\eduke\Solução Compras" add src/renderer/src/screens/Compras.module.css
git -C "C:\Users\eduke\Solução Compras" commit -m "style: add CSS classes for registrar-pedidos UX improvements"
```

---

## Task 2: Ocultar StepBar na fase 2

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` (linhas ~1658–1667)

O StepBar atual renderiza sempre que `inSession || view === 'nova'`. Precisa renderizar **apenas quando `phase === 1`**.

- [ ] **Step 1: Localizar o bloco do StepBar**

No arquivo `Compras.jsx`, encontre exatamente este bloco (linhas ~1658–1667):

```jsx
      {(inSession || view === 'nova') && (
        <div className={styles.stepBar}>
          {['Iniciar sessão', 'Registrar pedidos', 'Gerar PDFs'].map((label, i) => (
            <div key={i} className={`${styles.step} ${phase === i + 1 ? styles.stepActive : ''} ${phase > i + 1 ? styles.stepDone : ''}`}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
```

- [ ] **Step 2: Substituir pela versão condicional com `phase === 1`**

Substitua o bloco acima por:

```jsx
      {(inSession || view === 'nova') && phase === 1 && (
        <div className={styles.stepBar}>
          {['Iniciar sessão', 'Registrar pedidos', 'Gerar PDFs'].map((label, i) => (
            <div key={i} className={`${styles.step} ${phase === i + 1 ? styles.stepActive : ''} ${phase > i + 1 ? styles.stepDone : ''}`}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
```

A única mudança é `&& phase === 1` adicionado à condição.

- [ ] **Step 3: Commit**

```bash
git -C "C:\Users\eduke\Solução Compras" add src/renderer/src/screens/Compras.jsx
git -C "C:\Users\eduke\Solução Compras" commit -m "feat: hide step bar during phase 2"
```

---

## Task 3: Formulário de adição colapsável

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` (função `RegistrarPedidoSessao`)

- [ ] **Step 1: Adicionar estado `showAddForm` e ref `addFormFirstRef`**

Dentro de `RegistrarPedidoSessao`, após a linha `const firstInputRef = useRef(null)`, adicione:

```js
  const [showAddForm,    setShowAddForm]    = useState(true)
  const addFormFirstRef = useRef(null)
```

- [ ] **Step 2: Adicionar `useEffect` para focar o formulário ao reabrir**

Logo após os `useEffect` existentes (após o bloco que faz `firstInputRef.current?.focus()`), adicione:

```js
  // Foca o primeiro campo do form de adição quando ele é reaberto
  useEffect(() => {
    if (showAddForm && items.length > 0) {
      addFormFirstRef.current?.focus()
    }
  }, [showAddForm])
```

- [ ] **Step 3: Modificar `addItem()` para colapsar o form após adicionar**

Encontre a função `addItem()` atual:

```js
  function addItem() {
    const { ref, tipo_produto, tipo_grade, classe, icms_pct, valor } = form
    if (!tipo_produto.trim() || !tipo_grade) return
    const localId = `item_${Date.now()}_${Math.random()}`
    const novoItem = {
      localId,
      ref: ref.trim(),
      tipo_produto: tipo_produto.trim().toUpperCase(),
      tipo_grade,
      classe,
      icms_pct: icms_pct || '0',
      valor: valor || '',
    }
    setItems(prev => [...prev, novoItem])
    setActiveId(localId)
    setLojaIdx(0)
    setForm(prev => ({ ...prev, ref: '', valor: '' }))
  }
```

Substitua por:

```js
  function addItem() {
    const { ref, tipo_produto, tipo_grade, classe, icms_pct, valor } = form
    if (!tipo_produto.trim() || !tipo_grade) return
    const localId = `item_${Date.now()}_${Math.random()}`
    const novoItem = {
      localId,
      ref: ref.trim(),
      tipo_produto: tipo_produto.trim().toUpperCase(),
      tipo_grade,
      classe,
      icms_pct: icms_pct || '0',
      valor: valor || '',
    }
    setItems(prev => [...prev, novoItem])
    setActiveId(localId)
    setLojaIdx(0)
    setForm(prev => ({ ...prev, ref: '', valor: '' }))
    setShowAddForm(false)
  }
```

- [ ] **Step 4: Tornar o form condicional e adicionar `ref` ao primeiro input**

Encontre a abertura do div do formulário:

```jsx
      <div className={styles.addItemForm}>
```

Substitua por:

```jsx
      {(showAddForm || items.length === 0) && (
      <div className={styles.addItemForm}>
```

E adicione um fechamento correspondente ao `</div>` que fecha o `addItemForm`, logo antes do `{/* ── Items table */}`:

```jsx
      </div>
      )}
```

Ou seja, o bloco completo ficará:
```jsx
      {(showAddForm || items.length === 0) && (
      <div className={styles.addItemForm}>
        ...conteúdo atual...
      </div>
      )}
```

Também adicione `ref={addFormFirstRef}` ao **primeiro input** dentro do form (o input do campo Ref):

```jsx
          <input
            ref={addFormFirstRef}
            type="text"
            className={styles.addItemRef}
            placeholder="Cód. forn."
            value={form.ref}
            onChange={e => setForm(p => ({ ...p, ref: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') addItem() }}
          />
```

- [ ] **Step 5: Adicionar botão "+ Novo item" na área de ações**

Encontre o bloco `phaseActions` no final do return:

```jsx
      <div className={styles.phaseActions}>
        <button
          className={styles.btnSecondary}
          disabled={saving || items.every(it => totalQtdItem(it.localId) === 0)}
          onClick={handleFechar}
        >
          {saving ? 'Salvando…' : 'Fechar sessão e gerar PDFs →'}
        </button>
      </div>
```

Substitua por:

```jsx
      <div className={styles.phaseActions}>
        {!showAddForm && (
          <button
            className={styles.btnSecondary}
            onClick={() => setShowAddForm(true)}
          >
            + Novo item
          </button>
        )}
        <button
          className={styles.btnSecondary}
          disabled={saving || items.every(it => totalQtdItem(it.localId) === 0)}
          onClick={handleFechar}
        >
          {saving ? 'Salvando…' : 'Fechar sessão e gerar PDFs →'}
        </button>
      </div>
```

- [ ] **Step 6: Commit**

```bash
git -C "C:\Users\eduke\Solução Compras" add src/renderer/src/screens/Compras.jsx
git -C "C:\Users\eduke\Solução Compras" commit -m "feat: collapsible add-item form with new-item button"
```

---

## Task 4: Edição inline de itens

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` (função `RegistrarPedidoSessao`)

- [ ] **Step 1: Adicionar estados `editingId` e `editForm`**

Logo após a linha `const [showAddForm, setShowAddForm] = useState(true)` adicionada na Task 3, adicione:

```js
  const [editingId,      setEditingId]      = useState(null)
  const [editForm,       setEditForm]       = useState(null)
```

- [ ] **Step 2: Adicionar funções `startEdit`, `confirmEdit`, `cancelEdit`**

Logo após a função `removeItem(...)`, adicione as três funções:

```js
  function startEdit(item) {
    setEditingId(item.localId)
    setEditForm({
      ref:          item.ref,
      tipo_produto: item.tipo_produto,
      tipo_grade:   item.tipo_grade,
      classe:       item.classe,
      icms_pct:     item.icms_pct,
      valor:        item.valor,
    })
    setActiveId(null)
  }

  function confirmEdit() {
    const original = items.find(it => it.localId === editingId)
    const gradeChanged = original && editForm.tipo_grade !== original.tipo_grade
    setItems(prev => prev.map(it =>
      it.localId === editingId ? { ...it, ...editForm } : it
    ))
    if (gradeChanged) {
      setQtds(prev => { const n = { ...prev }; delete n[editingId]; return n })
    }
    setEditingId(null)
    setEditForm(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(null)
  }
```

- [ ] **Step 3: Substituir a renderização das linhas da tabela para suportar modo edição**

Dentro do `.map(it => { ... })` da tabela, o conteúdo atual começa com `<Fragment key={it.localId}>` e contém a `<tr>` normal e a `<tr>` de expansão de grade.

Encontre a abertura do Fragment e substitua **todo o conteúdo** do map (mantendo o `Fragment` externo) por:

```jsx
              <Fragment key={it.localId}>
                {editingId === it.localId ? (
                  /* ── Linha em modo edição ── */
                  <tr
                    className={styles.editItemRow}
                    onKeyDown={e => {
                      if (e.key === 'Enter') confirmEdit()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  >
                    <td>
                      <input
                        value={editForm.ref}
                        placeholder="Cód. forn."
                        onChange={e => setEditForm(p => ({ ...p, ref: e.target.value }))}
                        style={{ width: 70 }}
                      />
                    </td>
                    <td style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        value={editForm.tipo_produto}
                        placeholder="Produto"
                        list="tipos-produto-list"
                        onChange={e => setEditForm(p => ({ ...p, tipo_produto: e.target.value }))}
                        style={{ width: 110 }}
                      />
                      <select
                        value={editForm.tipo_grade}
                        onChange={e => setEditForm(p => ({ ...p, tipo_grade: e.target.value }))}
                      >
                        {Object.keys(GRADE_DEFINITIONS).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <select
                        value={editForm.classe}
                        onChange={e => setEditForm(p => ({ ...p, classe: e.target.value }))}
                      >
                        <option value="FEM">FEM</option>
                        <option value="MASC">MASC</option>
                        <option value="UNI">UNI</option>
                      </select>
                    </td>
                    <td>
                      <input
                        value={editForm.icms_pct}
                        placeholder="0"
                        onChange={e => setEditForm(p => ({ ...p, icms_pct: e.target.value }))}
                        style={{ width: 45 }}
                      />
                    </td>
                    <td>
                      <input
                        value={editForm.valor}
                        placeholder="0,00"
                        onChange={e => setEditForm(p => ({ ...p, valor: e.target.value }))}
                        style={{ width: 70 }}
                      />
                    </td>
                    <td></td>
                    <td style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        className={styles.btnAdd}
                        style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        onClick={e => { e.stopPropagation(); confirmEdit() }}
                        title="Salvar (Enter)"
                      >✓</button>
                      <button
                        className={styles.btnRemoveItem}
                        onClick={e => { e.stopPropagation(); cancelEdit() }}
                        title="Cancelar (Esc)"
                      >✕</button>
                    </td>
                  </tr>
                ) : (
                  /* ── Linha normal ── */
                  <tr
                    className={`${styles.itemRow} ${isActive ? styles.itemRowActive : ''}`}
                    onClick={() => { setActiveId(isActive ? null : it.localId); setLojaIdx(0) }}
                  >
                    <td>{it.ref || <span className={styles.itemDot}>—</span>}</td>
                    <td>{it.tipo_produto} · {it.tipo_grade} · {it.classe}</td>
                    <td>{it.icms_pct || '0'}%</td>
                    <td>{it.valor ? `R$ ${it.valor}` : <span className={styles.itemDot}>—</span>}</td>
                    <td><strong>{total > 0 ? total : <span className={styles.itemDot}>—</span>}</strong></td>
                    <td style={{ display: 'flex', gap: '0.1rem' }}>
                      <button
                        className={styles.btnEditItem}
                        onClick={e => { e.stopPropagation(); startEdit(it) }}
                        title="Editar item"
                      >✎</button>
                      <button
                        className={styles.btnRemoveItem}
                        onClick={e => removeItem(it.localId, e)}
                        title="Remover item"
                      >✕</button>
                    </td>
                  </tr>
                )}
                {isActive && editingId !== it.localId && (
                  <tr className={styles.gradeExpansionRow}>
                    ...conteúdo existente da expansão de grade, sem alteração...
                  </tr>
                )}
              </Fragment>
```

**Atenção:** na linha `{isActive && editingId !== it.localId && (` — a expansão de grade não aparece enquanto o item está em edição. O conteúdo interno da `gradeExpansionRow` é **exatamente o mesmo** que existe hoje, não muda nada.

A única mudança na condição de abertura é: `{isActive &&` → `{isActive && editingId !== it.localId &&`.

- [ ] **Step 4: Commit**

```bash
git -C "C:\Users\eduke\Solução Compras" add src/renderer/src/screens/Compras.jsx
git -C "C:\Users\eduke\Solução Compras" commit -m "feat: inline item editing with pencil icon"
```

---

## Task 5: Coluna "Dist." antes das grades

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` (bloco de grade expansion dentro de `RegistrarPedidoSessao`)

Esta task reposiciona o `totalDistribInput` de **depois** dos tamanhos para **antes**, e transforma o Total no final em leitura-somente.

- [ ] **Step 1: Atualizar o header da grade**

Encontre o `gradeInlineHeader` atual:

```jsx
                          <div className={styles.gradeInlineHeader}>
                            <div className={styles.gradeInlineLoja}>Loja</div>
                            {tams.map(t => (
                              <div key={t} className={styles.gradeInlineSize}>{t}</div>
                            ))}
                            <div className={styles.gradeInlineTotal}>Total</div>
                          </div>
```

Substitua por:

```jsx
                          <div className={styles.gradeInlineHeader}>
                            <div className={styles.gradeInlineLoja}>Loja</div>
                            <div
                              className={styles.gradeInlineDist}
                              title="Auto Distribuir pela projeção: clique na célula, digite o total e pressione Enter"
                            >Dist.</div>
                            {tams.map(t => (
                              <div key={t} className={styles.gradeInlineSize}>{t}</div>
                            ))}
                            <div className={styles.gradeInlineTotalReadonly}>Total</div>
                          </div>
```

- [ ] **Step 2: Atualizar cada linha de loja — mover input Dist. para antes dos tamanhos**

Dentro do `{visitas.map((v, i) => { ... })}`, encontre a linha de cada visita. Atualmente a ordem é:

```jsx
                              <div className={styles.gradeInlineLoja}>{v.comprador_nome}</div>
                              {tams.map((tam, tamIdx) => (
                                <div key={tam} className={styles.gradeInlineSize}>
                                  <input ... />
                                </div>
                              ))}
                              <div className={styles.gradeInlineTotalCell}>
                                <input
                                  type="number"
                                  min="1"
                                  className={styles.totalDistribInput}
                                  value={targetEditing !== undefined ? targetEditing : (computedTotal || '')}
                                  placeholder={computedTotal || '—'}
                                  title="Digite o total e pressione Enter para distribuir pela projeção de compras"
                                  onChange={e => setDistribTargets(prev => ({ ...prev, [targetKey]: e.target.value }))}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      handleDistribuirTotal(it.localId, v.id, e.target.value)
                                      setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })
                                      e.preventDefault()
                                    } else if (e.key === 'Escape') {
                                      setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })
                                    }
                                  }}
                                  onBlur={() => setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })}
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
```

Substitua por (Dist. vem primeiro, Total somente-leitura no final):

```jsx
                              <div className={styles.gradeInlineLoja}>{v.comprador_nome}</div>
                              <div className={styles.gradeInlineTotalCell}>
                                <input
                                  type="number"
                                  min="1"
                                  tabIndex={-1}
                                  className={styles.totalDistribInput}
                                  value={targetEditing !== undefined ? targetEditing : (computedTotal || '')}
                                  placeholder={computedTotal || '—'}
                                  title="Auto Distribuir: clique, digite o total e pressione Enter"
                                  onChange={e => setDistribTargets(prev => ({ ...prev, [targetKey]: e.target.value }))}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      handleDistribuirTotal(it.localId, v.id, e.target.value)
                                      setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })
                                      e.preventDefault()
                                    } else if (e.key === 'Escape') {
                                      setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })
                                    }
                                  }}
                                  onBlur={() => setDistribTargets(prev => { const n = { ...prev }; delete n[targetKey]; return n })}
                                  onClick={e => e.stopPropagation()}
                                />
                              </div>
                              {tams.map((tam, tamIdx) => (
                                <div key={tam} className={styles.gradeInlineSize}>
                                  <input
                                    ref={tamIdx === 0 && i === lojaIdx ? firstInputRef : null}
                                    type="number"
                                    min="0"
                                    className={styles.qtyInput}
                                    value={getQtd(it.localId, v.id, tam)}
                                    onChange={e => setQtd(it.localId, v.id, tam, e.target.value)}
                                    onFocus={() => setLojaIdx(i)}
                                    onKeyDown={e => handleEnterOnInput(e, tamIdx, i)}
                                    placeholder="0"
                                  />
                                </div>
                              ))}
                              <div className={styles.gradeInlineTotalReadonly}>
                                {computedTotal || '—'}
                              </div>
```

A única diferença funcional é: `tabIndex={-1}` no input Dist., e o Total agora é um `<div>` read-only em vez de input.

- [ ] **Step 3: Atualizar a linha de totais (rodapé quando `visitas.length > 1`)**

Encontre o rodapé da grade expandida:

```jsx
                          {visitas.length > 1 && (
                            <div className={`${styles.gradeInlineRow} ${styles.gradeInlineTotalsRow}`}>
                              <div className={styles.gradeInlineLoja}>Total lojas</div>
                              {tams.map(tam => {
                                const tot = visitas.reduce((s, v2) => s + (parseInt(qtds[it.localId]?.[v2.id]?.[tam]) || 0), 0)
                                return <div key={tam} className={styles.gradeInlineSize}>{tot || ''}</div>
                              })}
                              <div className={styles.gradeInlineTotal}>{totalQtdItem(it.localId) || ''}</div>
                            </div>
                          )}
```

Substitua por:

```jsx
                          {visitas.length > 1 && (
                            <div className={`${styles.gradeInlineRow} ${styles.gradeInlineTotalsRow}`}>
                              <div className={styles.gradeInlineLoja}>Total lojas</div>
                              <div className={styles.gradeInlineDist}></div>
                              {tams.map(tam => {
                                const tot = visitas.reduce((s, v2) => s + (parseInt(qtds[it.localId]?.[v2.id]?.[tam]) || 0), 0)
                                return <div key={tam} className={styles.gradeInlineSize}>{tot || ''}</div>
                              })}
                              <div className={styles.gradeInlineTotalReadonly}>{totalQtdItem(it.localId) || ''}</div>
                            </div>
                          )}
```

A diferença: `<div className={styles.gradeInlineDist}></div>` inserido como placeholder da coluna Dist., e `gradeInlineTotal` substituído por `gradeInlineTotalReadonly`.

- [ ] **Step 4: Commit**

```bash
git -C "C:\Users\eduke\Solução Compras" add src/renderer/src/screens/Compras.jsx
git -C "C:\Users\eduke\Solução Compras" commit -m "feat: move Dist. column before grade sizes, total as read-only"
```

---

## Self-Review

### 1. Spec coverage

| Requisito da spec | Task que implementa |
|---|---|
| StepBar oculto na fase 2 | Task 2 |
| Form colapsa após `addItem()` | Task 3 — `setShowAddForm(false)` em `addItem()` |
| Form visível quando `items.length === 0` | Task 3 — condição `showAddForm \|\| items.length === 0` |
| Botão "+ Novo item" no rodapé | Task 3 — `phaseActions` |
| Foco automático ao reabrir form | Task 3 — `useEffect([showAddForm])` + `addFormFirstRef` |
| Ícone `✎` ao lado do `✕` | Task 4 — linha normal |
| Edição inline com campos pré-preenchidos | Task 4 — `editingId` + `editForm` |
| Grade não expande durante edição | Task 4 — `editingId !== it.localId` na condição |
| Se grade muda → quantidades zeradas | Task 4 — `confirmEdit()` |
| Enter confirma / Esc cancela edição | Task 4 — `onKeyDown` na `<tr>` de edição |
| Coluna Dist. antes das grades | Task 5 — header + linhas de loja |
| `tabIndex={-1}` no input Dist. | Task 5 — atributo no input |
| Total como leitura-somente | Task 5 — `gradeInlineTotalReadonly` div |
| Placeholder da coluna Dist. no rodapé | Task 5 — `gradeInlineDist` vazio no totalsRow |

### 2. Placeholder scan
Nenhum encontrado.

### 3. Type consistency
- `editForm` é sempre o mesmo shape: `{ ref, tipo_produto, tipo_grade, classe, icms_pct, valor }` — igual ao `form` do add (garante compatibilidade com os mesmos inputs)
- `editingId` é `localId` (string) ou `null` — usado consistentemente em `startEdit`, `confirmEdit`, `cancelEdit` e na condição da linha
- `showAddForm` é boolean — `setShowAddForm(false)` em `addItem()`, `setShowAddForm(true)` no botão
- `.gradeInlineDist` e `.gradeInlineTotalReadonly` definidos na Task 1, usados na Task 5
- `.btnEditItem` e `.editItemRow` definidos na Task 1, usados na Task 4

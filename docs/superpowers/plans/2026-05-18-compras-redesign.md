# Compras Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign a tela de Compras (Fase 2) para o fluxo Ref + Produto + Grade + Classe + ICMS, adicionar Enter como atalho na grade, corrigir o total no demo, resolver grades TBD e remover NF/transportadora da UI.

**Architecture:** O `RegistrarPedidoSessao` passa de "sidebar de segmentações pré-cadastradas" para "tabela de itens que o usuário constrói durante a visita, linha a linha como a planilha do fornecedor". Cada linha tem Ref (código do fornecedor) + tipo + grade + classe + preços. Ao salvar, o sistema resolve (findOrCreate) a segmentação automaticamente. O schema do DB ganha `referencia` e `icms_pct` em `pedidos`. NF e transportadora saem da UI (mantidos no schema para compatibilidade retroativa).

**Tech Stack:** React 18, SQLite (better-sqlite3), Electron IPC, Vitest

---

## File Map

| Arquivo | Mudança |
|---------|---------|
| `src/renderer/src/constants/grades.js` | Grades TBD → `tamanhos: ['U']`, confirmar U no mapa |
| `electron/main/db/schema.js` | ADD COLUMN `referencia TEXT`, `icms_pct REAL DEFAULT 0` em `pedidos` |
| `electron/main/db/segmentacoes.js` | Adicionar `findOrCreate(data)` → retorna id |
| `electron/main/db/pedidos.js` | INSERT inclui `referencia` e `icms_pct`; `byVisita` query atualizada |
| `electron/main/index.js` | IPC handler `segmentacoes:findOrCreate` |
| `electron/preload/index.js` | Expor `window.api.segmentacoes.findOrCreate` |
| `src/renderer/src/screens/Compras.jsx` | `RegistrarPedidoSessao` redesenhado; Enter no grade; remove NF/transp da UI |
| `demo/src/mockApi.js` | Adicionar `salvarBatch`, `segmentacoes.findOrCreate`; corrigir bug do total |
| `demo/src/screens/Compras.jsx` | Sincronizar com main (mesma lógica do `handleFechar` usando `salvarBatch`) |
| `demo/src/constants/grades.js` | Mesmo fix que o principal |

---

## Task 1 — Fix grades TBD + confirmar grade U

**Files:**
- Modify: `src/renderer/src/constants/grades.js`
- Modify: `demo/src/constants/grades.js`

- [ ] **Step 1: Atualizar GRADE_DEFINITIONS no principal**

Em `src/renderer/src/constants/grades.js`, substituir as 6 linhas TBD e adicionar grade U:

```js
export const GRADE_DEFINITIONS = {
  PP:    { classificacao: 'PP',    tamanhos: ['RN', 'P', 'M', 'G', 'GG'] },
  BB:    { classificacao: 'BB',    tamanhos: ['1', '2', '3', '4'] },
  INF:   { classificacao: 'INF',   tamanhos: ['2', '4', '6', '8', '10', '12'] },
  JUV:   { classificacao: 'JUV',   tamanhos: ['10', '12', '14', '16', '18', '20'] },
  AD:    { classificacao: 'AD',    tamanhos: ['PP', 'P', 'M', 'G', 'GG', 'XG'] },
  AD1:   { classificacao: 'AD',    tamanhos: ['34', '36', '38', '40', '42', '44', '46', '48', '50', '52'] },
  AD2:   { classificacao: 'AD',    tamanhos: ['1', '2', '3', '4', '5'] },
  EX:    { classificacao: 'EX',    tamanhos: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'] },
  EX1:   { classificacao: 'EX',    tamanhos: ['46', '48', '50', '52', '54', '56', '58', '60', '62', '64'] },
  EX2:   { classificacao: 'EX',    tamanhos: ['6', '7', '8', '9', '10'] },
  U:     { classificacao: 'U',     tamanhos: ['F', 'M', 'U'] },
  CASAL: { classificacao: 'CASAL', tamanhos: ['U'] },
  KING:  { classificacao: 'KING',  tamanhos: ['U'] },
  QUEEN: { classificacao: 'QUEEN', tamanhos: ['U'] },
  SOLT:  { classificacao: 'SOLT',  tamanhos: ['U'] },
  LAR:   { classificacao: 'LAR',   tamanhos: ['U'] },
  GERAL: { classificacao: 'GERAL', tamanhos: ['U'] },
}

export const CLASSIFICACOES = [
  'AD', 'BB', 'CASAL', 'EX', 'GERAL', 'INF', 'JUV', 'KING', 'LAR', 'PP', 'QUEEN', 'SOLT', 'U',
]
```

- [ ] **Step 2: Copiar o mesmo conteúdo para demo/src/constants/grades.js**

O arquivo `demo/src/constants/grades.js` deve ficar idêntico ao principal.

- [ ] **Step 3: Rodar testes para confirmar nenhuma regressão**

```bash
cd "C:\Users\eduke\Solução Compras"
npm test -- --run
```

Expected: todos os testes passam (90+).

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/constants/grades.js demo/src/constants/grades.js
git commit -m "fix: grades TBD → tamanho ['U'], adicionar grade U (F/M/U)"
```

---

## Task 2 — DB: adicionar referencia + icms_pct em pedidos

**Files:**
- Modify: `electron/main/db/schema.js`
- Modify: `electron/main/db/pedidos.js`

- [ ] **Step 1: Adicionar migrations ao final de `runMigrations` em schema.js**

Após o bloco de `// Add categoria to fornecedores...`, adicionar:

```js
// Add referencia and icms_pct to pedidos (introduced 2026-05)
try { db.exec(`ALTER TABLE pedidos ADD COLUMN referencia TEXT`) } catch {}
try { db.exec(`ALTER TABLE pedidos ADD COLUMN icms_pct REAL NOT NULL DEFAULT 0`) } catch {}
```

- [ ] **Step 2: Atualizar `insertHeader` em pedidos.js**

Substituir o `INSERT INTO pedidos` para incluir os dois novos campos:

```js
const insertHeader = db.prepare(`
  INSERT INTO pedidos
    (visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct,
     referencia, icms_pct, obs)
  VALUES
    (@visita_id, @comprador_id, @segmentacao_id, @valor_unitario, @desconto_pct,
     @referencia, @icms_pct, @obs)
`)
```

> Nota: `transportadora` e `nota_fiscal` **não entram mais** no INSERT (removidos da UI). O schema os mantém por retrocompatibilidade mas novos pedidos gravam NULL.

- [ ] **Step 3: Atualizar `salvarBatchTx` para passar os novos campos**

```js
const salvarBatchTx = db.transaction((pedidosData) => {
  const results = []
  for (const { visita_id, comprador_id, segmentacao_id, valor_unitario,
                desconto_pct = 0, referencia = '', icms_pct = 0, obs = '', itens } of pedidosData) {
    const id = insertHeader.run({
      visita_id, comprador_id, segmentacao_id, valor_unitario,
      desconto_pct, referencia, icms_pct, obs
    }).lastInsertRowid
    for (const item of itens) {
      insertItem.run(id, item.tamanho, item.qtd)
    }
    results.push({ ...byId.get(id), itens: itensByPedido.all(id) })
  }
  return results
})
```

- [ ] **Step 4: Atualizar `byVisita` query para incluir novos campos no SELECT**

O `byVisita` já usa `p.*` então pega automaticamente. Mas garantir que `salvar()` também passa `referencia` e `icms_pct`:

```js
salvar({ visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct = 0,
         referencia = '', icms_pct = 0, obs = '', itens }) {
  const id = salvarTx(
    { visita_id, comprador_id, segmentacao_id, valor_unitario, desconto_pct,
      referencia, icms_pct, obs },
    itens
  )
  return { ...byId.get(id), itens: itensByPedido.all(id) }
},
```

- [ ] **Step 5: Rodar testes**

```bash
npm test -- --run
```

Expected: passa sem erros.

- [ ] **Step 6: Commit**

```bash
git add electron/main/db/schema.js electron/main/db/pedidos.js
git commit -m "feat(db): add referencia + icms_pct to pedidos, drop transportadora/nf from UI"
```

---

## Task 3 — segmentacoes.findOrCreate (backend + IPC)

O novo fluxo cria segmentações "on the fly" ao fechar a sessão, baseado no Ref digitado pelo usuário.

**Files:**
- Modify: `electron/main/db/segmentacoes.js`
- Modify: `electron/main/index.js`
- Modify: `electron/preload/index.js`

- [ ] **Step 1: Ler segmentacoes.js para entender a estrutura atual**

```bash
cat "electron/main/db/segmentacoes.js"
```

- [ ] **Step 2: Adicionar `findOrCreate` em segmentacoes.js**

Após os métodos existentes, adicionar (dentro do objeto retornado):

```js
findOrCreate({ classificacao, tipo_produto, classe, tipo_grade, estacao }) {
  const existing = db.prepare(`
    SELECT id FROM segmentacoes
    WHERE classificacao = ? AND tipo_produto = ? AND classe = ? AND tipo_grade = ?
  `).get(classificacao, tipo_produto, classe, tipo_grade)
  if (existing) return existing.id
  const result = db.prepare(`
    INSERT INTO segmentacoes (classificacao, tipo_produto, classe, tipo_grade, estacao)
    VALUES (?, ?, ?, ?, ?)
  `).run(classificacao, tipo_produto, classe, tipo_grade, estacao ?? 'inverno')
  return result.lastInsertRowid
},
```

- [ ] **Step 3: Adicionar handler IPC em electron/main/index.js**

Buscar o bloco de handlers de segmentacoes e adicionar ao lado dos existentes:

```js
ipcMain.handle('segmentacoes:findOrCreate', (_, data) => db.segmentacoes.findOrCreate(data))
```

- [ ] **Step 4: Expor no preload**

Em `electron/preload/index.js`, dentro do objeto `segmentacoes`, adicionar:

```js
findOrCreate: (data) => ipcRenderer.invoke('segmentacoes:findOrCreate', data),
```

- [ ] **Step 5: Rodar testes**

```bash
npm test -- --run
```

- [ ] **Step 6: Commit**

```bash
git add electron/main/db/segmentacoes.js electron/main/index.js electron/preload/index.js
git commit -m "feat(api): segmentacoes.findOrCreate para resolução automática ao salvar pedido"
```

---

## Task 4 — Redesign RegistrarPedidoSessao: tabela de itens (Ref + Produto + Grade + Classe + ICMS)

Esta é a maior mudança. O `RegistrarPedidoSessao` passa de sidebar de segmentações para uma tabela de itens construída pelo usuário durante a visita.

**UI alvo:**
```
┌─ ADICIONAR PRODUTO ────────────────────────────────────────┐
│ Ref: [13827] Produto: [CALCA    ▼] Grade: [AD  ▼]          │
│ Classe: [FEM▼] ICMS: [0]% Valor unit.: [R$ 85,00]          │
│ [+ Adicionar]                                               │
├─────────────────────────────────────────────────────────────┤
│ Ref   │ Produto │ Grade │ Classe │ ICMS │ Valor  │ Peças    │
│ 13827 │ CALCA   │ AD    │ FEM    │  0%  │ 85,00  │ 45  ●   │← selected
│ 13321 │ CALCA   │ AD    │ FEM    │  0%  │ 79,00  │  0      │
├─────────────────────────────────────────────────────────────┤
│ GRADE — 13827 CALCA AD FEM │ [Irmãos Backes] [Samuel P.B.] │
│       PP    P    M    G   GG   XG │ Total                   │
│ Irm. [ 5 ][10 ][15 ][12 ][ 3 ][0 ]│  45                    │
└─────────────────────────────────────────────────────────────┘
```

**Files:**
- Modify: `src/renderer/src/screens/Compras.jsx` (apenas a função `RegistrarPedidoSessao` e `handleFechar`)

- [ ] **Step 1: Definir estrutura de estado**

Dentro de `RegistrarPedidoSessao`, substituir o estado atual pelos seguintes:

```js
// item local: { localId, ref, tipo_produto, tipo_grade, classe, icms_pct, valor, desconto }
const [items,        setItems]        = useState([])
const [activeId,     setActiveId]     = useState(null)   // localId do item selecionado
const [lojaIdx,      setLojaIdx]      = useState(0)
// qtds: { [localId]: { [visitaId]: { [tamanho]: qty } } }
const [qtds,         setQtds]         = useState({})
const [saving,       setSaving]       = useState(false)
const [error,        setError]        = useState(null)
// form para adicionar novo item
const [form,         setForm]         = useState({ ref: '', tipo_produto: '', tipo_grade: 'AD', classe: 'FEM', icms_pct: '', valor: '' })
const RECOVERY_KEY = `SC_RECOVERY_${colId}`
const firstInputRef = useRef(null)
```

Remover: `skuIdx`, `skuConfig`, `projs`, `segs` (segmentacoes pré-carregadas não são mais necessárias na fase 2).

- [ ] **Step 2: Derivar item ativo + tamanhos**

```js
const activeItem = items.find(it => it.localId === activeId) ?? null
const tamanhos   = activeItem ? tamanhosDeTipoGrade(activeItem.tipo_grade) : []
const visita     = visitas[lojaIdx]
```

- [ ] **Step 3: Funções helper (qty, total)**

```js
function getQtd(localId, visitaId, tam) {
  return qtds[localId]?.[visitaId]?.[tam] ?? ''
}

function setQtd(localId, visitaId, tam, raw) {
  const val = raw === '' ? '' : Math.max(0, parseInt(raw, 10) || 0)
  setQtds(prev => ({
    ...prev,
    [localId]: { ...prev[localId], [visitaId]: { ...prev[localId]?.[visitaId], [tam]: val } }
  }))
}

function totalQtdItem(localId) {
  const itemQtds = qtds[localId] ?? {}
  return Object.values(itemQtds).reduce((s, lojaObj) =>
    s + Object.values(lojaObj).reduce((s2, q) => s2 + (parseInt(q) || 0), 0), 0)
}

function totalQtdLoja(localId, visitaId) {
  const loja = qtds[localId]?.[visitaId] ?? {}
  return Object.values(loja).reduce((s, q) => s + (parseInt(q) || 0), 0)
}
```

- [ ] **Step 4: Função addItem**

```js
function addItem() {
  const { ref, tipo_produto, tipo_grade, classe, icms_pct, valor } = form
  if (!tipo_produto.trim() || !tipo_grade) return
  const localId = `item_${Date.now()}_${Math.random()}`
  const novoItem = { localId, ref: ref.trim(), tipo_produto: tipo_produto.trim().toUpperCase(),
                     tipo_grade, classe, icms_pct: icms_pct || '0', valor: valor || '' }
  setItems(prev => [...prev, novoItem])
  setActiveId(localId)
  setLojaIdx(0)
  setForm(prev => ({ ...prev, ref: '', valor: '' })) // limpa ref + valor, mantém tipo/grade/classe
}
```

- [ ] **Step 5: Enter key navigation no grade grid**

O handler abaixo vai em cada `<input>` da grade (não só no último):

```js
function handleEnterOnInput(e, tamIdx) {
  if (e.key !== 'Enter') return
  e.preventDefault()
  // avança para o próximo tamanho
  if (tamIdx < tamanhos.length - 1) {
    const inputs = e.target.closest(`.${styles.gradeRow}`)?.querySelectorAll('input')
    if (inputs?.[tamIdx + 1]) inputs[tamIdx + 1].focus()
    return
  }
  // último tamanho: avança loja ou item
  if (lojaIdx < visitas.length - 1) {
    setLojaIdx(lojaIdx + 1)
  } else {
    const idx = items.findIndex(it => it.localId === activeId)
    if (idx < items.length - 1) {
      setActiveId(items[idx + 1].localId)
      setLojaIdx(0)
    }
  }
}
```

> Nota: o Tab no último input continua funcionando igual (handler `handleTabOnLastInput` adaptado).

- [ ] **Step 6: Auto-save recovery**

```js
useEffect(() => {
  if (!sessao?.id) return
  localStorage.setItem(RECOVERY_KEY, JSON.stringify({ sessao_id: sessao.id, items, qtds, activeId, lojaIdx }))
}, [items, qtds, activeId, lojaIdx])
```

- [ ] **Step 7: Focus first input when active item / loja changes**

```js
useEffect(() => {
  firstInputRef.current?.focus()
}, [activeId, lojaIdx])
```

- [ ] **Step 8: handleFechar — resolve segmentacoes e salva batch**

```js
async function handleFechar() {
  setSaving(true)
  setError(null)
  try {
    const batch = []
    const meta  = []
    for (const item of items) {
      const { localId, ref, tipo_produto, tipo_grade, classe, icms_pct, valor } = item
      const valorNum    = parseFloat((valor ?? '').replace(',', '.')) || 0
      const icmsNum     = parseFloat((icms_pct ?? '').replace(',', '.')) || 0
      const { classificacao } = GRADE_DEFINITIONS[tipo_grade] ?? {}
      if (!classificacao) continue

      const segId = await window.api.segmentacoes.findOrCreate({
        classificacao, tipo_produto, classe, tipo_grade,
        estacao: sessao.colecao_estacao ?? 'inverno',
      })

      for (const v of visitas) {
        const lojaTams = qtds[localId]?.[v.id] ?? {}
        const itens = tamanhosDeTipoGrade(tipo_grade)
          .map(tam => ({ tamanho: tam, qtd: parseInt(lojaTams[tam]) || 0 }))
          .filter(i => i.qtd > 0)
        if (!itens.length) continue
        batch.push({ visita_id: v.id, comprador_id: v.comprador_id, segmentacao_id: segId,
                     valor_unitario: valorNum, desconto_pct: 0,
                     referencia: ref, icms_pct: icmsNum, obs: '', itens })
        meta.push({ comprador_nome: v.comprador_nome, comprador_cnpj: v.comprador_cnpj ?? '',
                    comprador_cidade: v.comprador_cidade ?? '',
                    classificacao, tipo_produto, classe, tipo_grade })
      }
    }
    const salvos = await window.api.pedidos.salvarBatch(batch)
    localStorage.removeItem(RECOVERY_KEY)
    onFechar(salvos.map((p, i) => ({ ...p, ...meta[i] })))
  } catch (err) {
    setError('Erro ao salvar pedidos. Tente novamente.')
  } finally {
    setSaving(false)
  }
}
```

> `GRADE_DEFINITIONS` precisa ser importado: `import { tamanhosDeTipoGrade, GRADE_DEFINITIONS } from '../constants/grades'`

- [ ] **Step 9: JSX — formulário de adição + tabela de itens**

Substituir o bloco `<div className={styles.skuLayout}>` pelo novo layout:

```jsx
{/* Formulário de adição */}
<div className={styles.addItemForm}>
  <input
    type="text"
    placeholder="Ref"
    value={form.ref}
    onChange={e => setForm(p => ({ ...p, ref: e.target.value }))}
    className={styles.addItemRef}
  />
  <input
    list="tipoProdutoList"
    placeholder="Produto"
    value={form.tipo_produto}
    onChange={e => setForm(p => ({ ...p, tipo_produto: e.target.value }))}
    className={styles.addItemProd}
  />
  <datalist id="tipoProdutoList">
    {TIPOS_PRODUTO.map(t => <option key={t} value={t} />)}
  </datalist>
  <select value={form.tipo_grade} onChange={e => setForm(p => ({ ...p, tipo_grade: e.target.value }))}>
    {Object.keys(GRADE_DEFINITIONS).map(g => <option key={g} value={g}>{g}</option>)}
  </select>
  <select value={form.classe} onChange={e => setForm(p => ({ ...p, classe: e.target.value }))}>
    <option value="FEM">FEM</option>
    <option value="MASC">MASC</option>
    <option value="UNI">UNI</option>
  </select>
  <input
    type="text"
    placeholder="ICMS %"
    value={form.icms_pct}
    onChange={e => setForm(p => ({ ...p, icms_pct: e.target.value }))}
    className={styles.addItemIcms}
  />
  <input
    type="text"
    placeholder="R$ Valor"
    value={form.valor}
    onChange={e => setForm(p => ({ ...p, valor: e.target.value }))}
    className={styles.addItemValor}
  />
  <button className={styles.btnAdd} onClick={addItem}
    disabled={!form.tipo_produto.trim() || !form.tipo_grade}>
    + Adicionar
  </button>
</div>

{/* Tabela de itens */}
{items.length > 0 && (
  <table className={styles.itemsTable}>
    <thead>
      <tr>
        <th>Ref</th><th>Produto</th><th>Grade</th><th>Classe</th>
        <th>ICMS</th><th>Valor unit.</th><th>Peças</th><th></th>
      </tr>
    </thead>
    <tbody>
      {items.map(it => {
        const total = totalQtdItem(it.localId)
        return (
          <tr
            key={it.localId}
            className={`${styles.itemRow} ${it.localId === activeId ? styles.itemRowActive : ''}`}
            onClick={() => { setActiveId(it.localId); setLojaIdx(0) }}
          >
            <td>{it.ref || '—'}</td>
            <td>{it.tipo_produto}</td>
            <td>{it.tipo_grade}</td>
            <td>{it.classe}</td>
            <td>{it.icms_pct || 0}%</td>
            <td>R$ {it.valor || '0,00'}</td>
            <td>{total > 0 ? <><strong>{total}</strong> <span className={styles.itemDot}>●</span></> : '—'}</td>
            <td>
              <button
                className={styles.btnRemoveItem}
                onClick={e => { e.stopPropagation(); setItems(prev => prev.filter(x => x.localId !== it.localId)) }}
                title="Remover"
              >✕</button>
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
)}

{/* Grade de preenchimento */}
{activeItem && tamanhos.length > 0 && (
  <div className={styles.gradeSection}>
    <div className={styles.gradeCaption}>
      {activeItem.ref && <span className={styles.gradeCaptionRef}>{activeItem.ref}</span>}
      <span>{activeItem.tipo_produto} · {activeItem.tipo_grade} · {activeItem.classe}</span>
    </div>

    <div className={styles.lojaTabs}>
      {visitas.map((v, i) => (
        <button
          key={v.id}
          className={`${styles.lojaTab} ${i === lojaIdx ? styles.lojaTabActive : ''} ${totalQtdLoja(activeItem.localId, v.id) > 0 ? styles.lojaTabHasData : ''}`}
          onClick={() => setLojaIdx(i)}
        >
          {v.comprador_nome}
          {totalQtdLoja(activeItem.localId, v.id) > 0 && (
            <span className={styles.lojaTabCount}>{totalQtdLoja(activeItem.localId, v.id)}</span>
          )}
        </button>
      ))}
    </div>

    <div className={styles.gradeGrid}>
      <div className={styles.gradeHeader}>
        <div className={styles.gradeHeaderLabel} />
        {tamanhos.map(tam => <div key={tam} className={styles.gradeHeaderCell}>{tam}</div>)}
        <div className={styles.gradeHeaderCell}>Total</div>
      </div>
      <div className={styles.gradeRow}>
        <div className={styles.gradeRowLabel}>{visita?.comprador_nome}</div>
        {tamanhos.map((tam, tamIdx) => (
          <input
            key={tam}
            ref={tamIdx === 0 ? firstInputRef : null}
            type="number"
            min="0"
            className={styles.qtyInput}
            value={getQtd(activeItem.localId, visita?.id, tam)}
            onChange={e => setQtd(activeItem.localId, visita?.id, tam, e.target.value)}
            onKeyDown={e => handleEnterOnInput(e, tamIdx)}
            placeholder="0"
          />
        ))}
        <div className={styles.gradeTotal}>{totalQtdLoja(activeItem.localId, visita?.id)}</div>
      </div>
      {visitas.length > 1 && (
        <div className={`${styles.gradeRow} ${styles.gradeTotaisRow}`}>
          <div className={styles.gradeRowLabel}>Total lojas</div>
          {tamanhos.map(tam => {
            const tot = visitas.reduce((s, v) =>
              s + (parseInt(qtds[activeItem.localId]?.[v.id]?.[tam]) || 0), 0)
            return <div key={tam} className={styles.gradeTotalCell}>{tot || ''}</div>
          })}
          <div className={styles.gradeTotal}>{totalQtdItem(activeItem.localId)}</div>
        </div>
      )}
    </div>
  </div>
)}

{activeItem && tamanhos.length === 0 && (
  <div className={styles.placeholder}>Grade {activeItem.tipo_grade} sem tamanhos definidos.</div>
)}
{!activeItem && items.length === 0 && (
  <div className={styles.placeholder}>Adicione o primeiro produto acima para começar.</div>
)}
```

- [ ] **Step 10: Importar TIPOS_PRODUTO e GRADE_DEFINITIONS**

No topo do arquivo, adicionar:

```js
import { tamanhosDeTipoGrade, GRADE_DEFINITIONS } from '../constants/grades'
import { TIPOS_PRODUTO } from '../constants/tipoProduto'
```

E garantir que `tipoProduto.js` exporta `TIPOS_PRODUTO` (array de strings). Se só exporta default, adicionar:

```js
// Em tipoProduto.js — adicionar no final:
export const TIPOS_PRODUTO = tipoProduto // ou o array que já está definido
```

- [ ] **Step 11: Adicionar CSS para os novos elementos**

Em `src/renderer/src/screens/Compras.module.css`, adicionar ao final:

```css
.addItemForm {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-end;
  padding: 0.75rem;
  background: var(--surface-2, #f8f8f8);
  border-radius: 6px;
  margin-bottom: 1rem;
}
.addItemRef   { width: 80px; }
.addItemProd  { width: 140px; }
.addItemIcms  { width: 60px; }
.addItemValor { width: 90px; }
.btnAdd {
  padding: 0.4rem 0.9rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}
.btnAdd:disabled { opacity: 0.4; cursor: not-allowed; }

.itemsTable { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.85rem; }
.itemsTable th { background: var(--surface-2, #f0f0f0); padding: 6px 10px; text-align: left; }
.itemsTable td { padding: 6px 10px; border-bottom: 1px solid var(--border, #e0e0e0); }
.itemRow { cursor: pointer; }
.itemRow:hover { background: var(--surface-hover, #f5f5f5); }
.itemRowActive { background: var(--accent-light, #e8f0fe) !important; }
.itemDot { color: var(--accent); }
.btnRemoveItem {
  background: none;
  border: none;
  color: var(--red, #c00);
  cursor: pointer;
  padding: 2px 6px;
  font-size: 0.8rem;
}

.gradeSection { margin-top: 0.5rem; }
.gradeCaption { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center; }
.gradeCaptionRef { background: var(--surface-2, #eee); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 700; }
```

- [ ] **Step 12: Adaptar recuperação de sessão (recovery)**

Em `handleRecover` no orquestrador, a estrutura de recovery mudou. Atualizar para restaurar `items`, `qtds`, `activeId`:

```js
function handleRecover() {
  const { sessao, visitas, items, qtds, activeId, lojaIdx } = recoveryData
  setSessao(sessao)
  setVisitas(visitas)
  setRecoveryInitial({ items: items ?? [], qtds: qtds ?? {}, activeId: activeId ?? null, lojaIdx: lojaIdx ?? 0 })
  setRecoveryData(null)
  setPhase(2)
}
```

E as props de `RegistrarPedidoSessao` mudam:

```jsx
{phase === 2 && sessao && (
  <RegistrarPedidoSessao
    sessao={sessaoDisplay}
    visitas={visitas}
    colId={active.id}
    onFechar={handleFechar}
    initialItems={recoveryInitial?.items ?? []}
    initialQtds={recoveryInitial?.qtds ?? {}}
    initialActiveId={recoveryInitial?.activeId ?? null}
    initialLojaIdx={recoveryInitial?.lojaIdx ?? 0}
  />
)}
```

Remover `segs={segs}` — segmentações não são mais passadas para Fase 2.

- [ ] **Step 13: Atualizar FecharSessao para mostrar referencia no resumo**

Em `FecharSessao`, a linha que mostra o produto deve incluir a referencia se disponível:

```jsx
<span>
  {p.referencia ? <strong>{p.referencia}</strong> : null}
  {p.referencia ? ' · ' : ''}
  {seg ? `${seg.tipo_produto} ${seg.classe}` : `Seg #${p.segmentacao_id}`}
</span>
```

> O `seg` em `FecharSessao` vem de `segs.find(s => s.id === p.segmentacao_id)`. O `segs` ainda é carregado no orquestrador (`window.api.segmentacoes.list()`), mas os pedidos salvos agora também trazem `classificacao`, `tipo_produto`, etc. no `meta[]`. Usar os campos do meta diretamente em vez de `segs.find(...)`:

```jsx
{visPedidos.map((p, i) => {
  const totalQ = p.itens.reduce((s, i) => s + i.qtd, 0)
  return (
    <div key={i} className={styles.resumoItem}>
      <span>
        {p.referencia ? `[${p.referencia}] ` : ''}
        {p.tipo_produto ? `${p.tipo_produto} ${p.classe}` : `Seg #${p.segmentacao_id}`}
      </span>
      <span>{totalQ} pç</span>
    </div>
  )
})}
```

- [ ] **Step 14: Atualizar gerarPDFSessao para incluir referencia**

No `segLabel` dentro de `pedidosHtml`:

```js
const segLabel = p.referencia
  ? `${p.referencia} — ${p.tipo_produto ?? ''} — ${p.classe ?? ''} (Grade ${p.tipo_grade ?? ''})`
  : p.classificacao
    ? `${p.classificacao} — ${p.tipo_produto} — ${p.classe} (Grade ${p.tipo_grade})`
    : `Segmentação #${p.segmentacao_id}`
```

- [ ] **Step 15: Rodar app em dev e testar o golden path**

```bash
cd "C:\Users\eduke\Solução Compras"
npm run dev
```

Testar:
1. Abrir Compras → Nova sessão → Iniciar sessão (selecionar fornecedor + 2 lojas)
2. Na Fase 2: adicionar 3 produtos com refs diferentes
3. Para cada produto: preencher grade usando Enter para navegar entre tamanhos
4. Verificar que Tab no último input do último tamanho vai para próxima loja
5. Fechar sessão → Fase 3 mostra totais corretos
6. Gerar PDF: verificar que Ref aparece no cabeçalho de cada produto

- [ ] **Step 16: Commit**

```bash
git add src/renderer/src/screens/Compras.jsx src/renderer/src/screens/Compras.module.css
git commit -m "feat(compras): redesign fase 2 — tabela de itens com Ref+Produto+Grade+ICMS, Enter na grade"
```

---

## Task 5 — Corrigir total no demo + sincronizar demo com nova API

**Files:**
- Modify: `demo/src/mockApi.js`
- Modify: `demo/src/screens/Compras.jsx`

**Diagnóstico do bug:** O demo usa `window.api.pedidos.salvar()` individualmente em `handleFechar`, mas a versão principal usa `salvarBatch`. O problema é que a demo `handleFechar` empurra `{ ...pedido, comprador_nome, seg }` mas `FecharSessao` espera os campos `classificacao`, `tipo_produto`, `classe`, `tipo_grade` achatados (não em `.seg`). `enrichPedido` no mockApi coloca esses campos corretamente, mas o novo design não usa mais `segs` pré-carregados.

- [ ] **Step 1: Adicionar `salvarBatch` no mockApi.js**

No objeto `pedidos` do mockApi:

```js
async salvarBatch(pedidosData) {
  await delay()
  return pedidosData.map(({ visita_id, comprador_id, segmentacao_id, valor_unitario,
                             desconto_pct = 0, referencia = '', icms_pct = 0, obs = '', itens }) => {
    const id = uid()
    pedidosList.push({ id, visita_id, comprador_id, segmentacao_id, valor_unitario,
                       desconto_pct, referencia, icms_pct, obs })
    for (const item of itens) {
      pedidoItensList.push({ id: uid(), pedido_id: id, tamanho: item.tamanho, qtd: item.qtd })
    }
    return enrichPedido(pedidosList.find(p => p.id === id))
  })
},
```

- [ ] **Step 2: Adicionar `segmentacoes.findOrCreate` no mockApi.js**

Dentro do objeto `segmentacoes`:

```js
async findOrCreate({ classificacao, tipo_produto, classe, tipo_grade, estacao }) {
  await delay()
  const existing = segmentacoesList.find(s =>
    s.classificacao === classificacao &&
    s.tipo_produto  === tipo_produto  &&
    s.classe        === classe        &&
    s.tipo_grade    === tipo_grade
  )
  if (existing) return existing.id
  const nova = { id: uid(), classificacao, tipo_produto, classe, tipo_grade, estacao: estacao ?? 'inverno' }
  segmentacoesList.push(nova)
  return nova.id
},
```

- [ ] **Step 3: Adicionar `referencia` e `icms_pct` ao `enrichPedido` no mockApi.js**

```js
function enrichPedido(p) {
  const comp = compradoresList.find(c => c.id === p.comprador_id)
  const seg  = segmentacoesList.find(s => s.id === p.segmentacao_id)
  const itens = pedidoItensList.filter(i => i.pedido_id === p.id)
  return {
    ...p,
    comprador_nome: comp?.nome ?? '',
    cnpj:           comp?.cnpj ?? '',
    cidade:         comp?.cidade ?? '',
    classificacao:  seg?.classificacao ?? '',
    tipo_produto:   seg?.tipo_produto ?? '',
    classe:         seg?.classe ?? '',
    tipo_grade:     seg?.tipo_grade ?? '',
    referencia:     p.referencia ?? '',
    icms_pct:       p.icms_pct ?? 0,
    itens,
  }
}
```

- [ ] **Step 4: Sincronizar demo/src/screens/Compras.jsx com o novo design**

O `demo/src/screens/Compras.jsx` deve usar a mesma lógica do principal. A forma mais segura é copiar o componente `RegistrarPedidoSessao` do principal para o demo (são idênticos a não ser pelo `window.api` que já está mockado).

Verificar que o demo `Compras.jsx` importa de `../constants/grades` (já correto) e `../constants/tipoProduto`.

- [ ] **Step 5: Testar o demo localmente**

```bash
cd "C:\Users\eduke\Solução Compras\demo"
npm run dev
```

Ir para `/app` → Compras. Verificar:
1. Formulário de adição de produto aparece
2. Adicionar um produto com Ref + CALCA + AD + FEM + 79,00
3. Preencher grade → Total da loja aparece corretamente
4. Fechar sessão → Fase 3 mostra total correto (não R$ 0)

- [ ] **Step 6: Deploy do demo**

```bash
cd "C:\Users\eduke\Solução Compras"
npx vercel --cwd demo --yes --prod
```

- [ ] **Step 7: Commit**

```bash
git add demo/src/mockApi.js demo/src/screens/Compras.jsx demo/src/constants/grades.js
git commit -m "fix(demo): salvarBatch, findOrCreate, corrigir total na fase 3, sync grades"
```

---

## Task 6 — Testes + commit final

- [ ] **Step 1: Rodar suite completa**

```bash
cd "C:\Users\eduke\Solução Compras"
npm test -- --run
```

Expected: 90+ testes passando. Se algum teste quebrou por conta de mudanças no schema do pedido ou na interface do `RegistrarPedidoSessao`, atualizar os testes para refletir a nova assinatura.

- [ ] **Step 2: Checar se algum teste usa `skuConfig` ou `segs` diretamente**

```bash
grep -r "skuConfig\|initialSkuConfig\|segs=" src/tests/ --include="*.test.*"
```

Se encontrar, atualizar para a nova estrutura (`items`, `initialItems`).

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "test: atualizar testes para novo formato de RegistrarPedidoSessao"
```

---

## Self-Review

**Spec coverage:**
- ✅ F/M/U como tamanhos → grade `U: ['F','M','U']` (Task 1)
- ✅ CASAL/KING/QUEEN/SOLT/LAR/GERAL → `['U']` (Task 1)
- ✅ NF e transportadora removidos da UI (Task 2 — INSERT não inclui mais, UI removida em Task 4)
- ✅ Enter como atalho na grade → `handleEnterOnInput` (Task 4, Step 5)
- ✅ Total correto no demo → `salvarBatch` + `enrichPedido` com itens (Task 5)
- ✅ Ref + Tipo por fornecedor, múltiplas referências → tabela de itens (Task 4)
- ✅ Valor líquido = Valor unitário mostrado na tabela (ICMS e desconto não alterados por ora)

**Gaps / decisões:**
- `desconto_pct` continua existindo no schema mas não é editável na nova UI (removido para simplificar; pode ser re-adicionado depois se necessário)
- O `sessao.colecao_estacao` usado no `findOrCreate` precisa ser passado no objeto `sessao` via `sessoes.list()`. Confirmar que `sessoes.byId` inclui `colecao_estacao` ou usar `active.estacao` do contexto.
- Recovery de sessão interrompida mantém a estrutura `items`/`qtds` — retrocompatibilidade com recoveries antigas (com `skuConfig`) é perdida, o que é aceitável (sessões em andamento são raras).

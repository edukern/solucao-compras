# Registrar Pedidos — UX Improvements Spec

**Data:** 2026-05-21
**Escopo:** Melhorias de UX na tela Fase 2 (Registrar Pedidos) em `Compras.jsx`. Sem alterações de banco, IPC ou API.

---

## Objetivo

Tornar o fluxo de registro de pedidos mais limpo e menos propenso a erros, com quatro mudanças puramente de UI:

1. Esconder o StepBar na fase 2
2. Colapsar o formulário de adição após o primeiro item
3. Permitir editar itens já adicionados via ícone `✎`
4. Mover a coluna "Auto Distribuir" para antes das grades e removê-la do fluxo Tab

---

## Comportamentos

### 1. StepBar — oculto na fase 2

O `stepBar` (`.stepBar`) só é renderizado quando `phase === 1`. Na fase 2 o banner de sessão (`visitaBanner`) já fornece o contexto necessário.

**Alteração:** no componente pai (a função `Compras` ou equivalente), condicionar o `stepBar` a `phase === 1`.

---

### 2. Formulário de adição colapsável

**Estado novo:**
```js
const [showAddForm, setShowAddForm] = useState(true)
```

- `showAddForm = true` → estado inicial e quando `items.length === 0` (não há itens)
- Ao chamar `addItem()` com sucesso → `setShowAddForm(false)`
- O form sempre fica visível enquanto `items.length === 0` (não pode colapsar sem ter nenhum item)

**Renderização:**
```jsx
{(showAddForm || items.length === 0) && <div className={styles.addItemForm}>…</div>}
```

**Botão "+ Novo item"** — aparece na área de ações do rodapé quando `!showAddForm`:
```jsx
{!showAddForm && (
  <button className={styles.btnSecondary} onClick={() => { setShowAddForm(true) }}>
    + Novo item
  </button>
)}
```

Ao clicar "+ Novo item", o form reaparece e o foco vai automaticamente para o input Ref (via `useEffect` ou `ref`).

---

### 3. Edição inline de itens (`✎`)

**Estado novo:**
```js
const [editingId, setEditingId] = useState(null)
const [editForm,  setEditForm]  = useState(null)
```

**Ícone na linha da tabela** — ao lado do `✕` existente:
```jsx
<button
  className={styles.btnEditItem}
  onClick={e => { e.stopPropagation(); startEdit(it) }}
  title="Editar item"
>✎</button>
```

**`startEdit(item)`:**
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
  setActiveId(null) // fecha expansão de grade
}
```

**`confirmEdit()`:**
```js
function confirmEdit() {
  const gradeChanged = editForm.tipo_grade !== items.find(it => it.localId === editingId)?.tipo_grade
  setItems(prev => prev.map(it =>
    it.localId === editingId ? { ...it, ...editForm } : it
  ))
  if (gradeChanged) {
    setQtds(prev => { const n = { ...prev }; delete n[editingId]; return n })
  }
  setEditingId(null)
  setEditForm(null)
}
```

**`cancelEdit()`:**
```js
function cancelEdit() {
  setEditingId(null)
  setEditForm(null)
}
```

**Renderização da linha em modo edição** — quando `editingId === it.localId`, a linha da tabela mostra os campos editáveis em vez do texto estático:

- Os mesmos inputs do form de adição (Ref, Produto, Grade, Classe, ICMS, Valor), pré-preenchidos com `editForm`
- Botão `✓` para confirmar (`confirmEdit()`), botão `✕` para cancelar (`cancelEdit()`)
- `onKeyDown`: Enter → `confirmEdit()`, Escape → `cancelEdit()`
- A expansão de grade (`gradeExpansionRow`) **não** renderiza enquanto `editingId === it.localId`

**Regra de grade:** se `editForm.tipo_grade !== item.tipo_grade`, as quantidades do item são zeradas ao confirmar.

---

### 4. Coluna "Dist." antes das grades

**Layout novo da linha de grade expandida:**

```
| Loja           | Dist. | PP | P  | M  | G  | GG | XG | Total |
| Irmãos Backes  | [ ]   | [ ]| [ ]| …  |    |    |    | 6     |
```

**Ordem das colunas:**
1. Loja (label)
2. **Dist.** — input `totalDistribInput`, `tabIndex={-1}`
3. Tamanhos (PP, P, M, G, GG, XG…) — inputs normais, em Tab order
4. **Total** — texto somente-leitura (valor calculado), não é input

**Comportamento do input Dist.:**
- `tabIndex={-1}` → não entra no fluxo Tab
- Placeholder: `—` (mostra total atual quando não está editando)
- Título/tooltip: `"Digite o total e pressione Enter para distribuir pela projeção"`
- Enter → chama `handleDistribuirTotal(...)`, limpa `distribTargets`
- Escape → limpa `distribTargets` (cancela edição)
- onBlur → limpa `distribTargets`
- onClick → `e.stopPropagation()`

**Total somente-leitura** no final da linha:
```jsx
<div className={styles.gradeInlineTotalReadonly}>
  {computedTotal || '—'}
</div>
```

**Header da coluna Dist.:**
```jsx
<div className={styles.gradeInlineDist} title="Auto Distribuir pela projeção">Dist.</div>
```

**Rodapé "Total Lojas"** (quando `visitas.length > 1`): a coluna Dist. fica vazia no rodapé; o total geral aparece na coluna Total somente-leitura.

---

## Fluxo Tab resultante

Antes (problemático):
```
PP → P → M → G → GG → XG → Total (input!) → próxima loja
```

Depois (correto):
```
PP → P → M → G → GG → XG → próxima loja (Tab pula Dist. e Total)
```

---

## State necessário (adições ao `RegistrarPedidoSessao`)

```js
const [showAddForm, setShowAddForm] = useState(true)  // colapso do form
const [editingId,   setEditingId]   = useState(null)  // id do item em edição
const [editForm,    setEditForm]    = useState(null)  // campos do item em edição
```

Estado existente (`distribTargets`, `qtds`, etc.) sem alteração.

---

## Arquivos a modificar

| Arquivo | O que muda |
|---------|------------|
| `src/renderer/src/screens/Compras.jsx` | Componente pai: oculta `stepBar` na fase 2. `RegistrarPedidoSessao`: adiciona `showAddForm`, `editingId`, `editForm`; modifica `addItem()`; adiciona `startEdit/confirmEdit/cancelEdit`; refatora renderização do form, linha da tabela, e expansão de grade |
| `src/renderer/src/screens/Compras.module.css` | Classes novas: `.btnEditItem`, `.gradeInlineDist`, `.gradeInlineTotalReadonly`, `.editItemRow` |

**Sem alterações em:** banco, IPC, preload, contextos, componentes externos.

---

## O que não muda

- `handleDistribuirTotal` — lógica de distribuição proporcional inalterada
- `handleFechar` — salvamento dos pedidos inalterado
- `handleEnterOnInput` — navegação entre inputs de grade inalterada (Tab dentro dos tamanhos)
- Botão "Fechar sessão e gerar PDFs →" — posição e comportamento inalterados
- Auto-save (`localStorage`) — inalterado

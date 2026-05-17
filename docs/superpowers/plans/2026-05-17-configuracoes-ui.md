# Solução Compras — Sessão 3: Tela de Configurações

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Criar a tela "Configurações" que permite ao Samuel gerenciar coleções, segmentações e compradores sem precisar tocar no banco diretamente. Hoje essas entidades só podem ser criadas via scripts.

**Architecture:** Nova tela `Configuracoes.jsx` com navegação interna por abas (Coleções / Segmentações / Compradores). Cada aba é um componente próprio. Todos os IPC handlers necessários já existem — é trabalho de UI apenas, exceto a adição de `delete` para segmentações e `update/delete` para compradores.

**Tech Stack:** React 18 · CSS Modules · IPC via `window.api` (padrão existente)

---

## File Map

| File | Action |
|---|---|
| `src/renderer/src/screens/Configuracoes.jsx` | Create |
| `src/renderer/src/screens/Configuracoes.module.css` | Create |
| `electron/main/db/segmentacoes.js` | Modify — add `remove(id)` |
| `electron/main/db/compradores.js` | Modify — add `update(id, d)` e `remove(id)` |
| `electron/main/index.js` | Modify — add IPC handlers para delete/update |
| `electron/preload/index.js` | Modify — expose novos handlers |
| `src/renderer/src/App.jsx` | Modify — adicionar Configuracoes ao nav |

---

## IPC existente (não precisa criar)

```js
// colecoes — já existe
window.api.colecoes.list()
window.api.colecoes.create({ nome, estacao, ano })
window.api.colecoes.setStatus(id, status) // 'planejamento' | 'em_compra' | 'finalizada'

// segmentacoes — já existe
window.api.segmentacoes.list()
window.api.segmentacoes.create({ classificacao, tipo_produto, classe, tipo_grade, estacao })

// compradores — já existe
window.api.compradores.list()
window.api.compradores.create({ nome, cnpj, cidade })

// fornecedores — já existe
window.api.fornecedores.list()
window.api.fornecedores.create({ nome, contato, categoria })
window.api.fornecedores.update(id, { nome, contato, categoria })
```

## IPC a criar (novo)

```js
window.api.segmentacoes.remove(id)
window.api.compradores.update(id, { nome, cnpj, cidade })
window.api.compradores.remove(id)
```

---

## Schema relevante

```sql
colecoes: id, nome, estacao CHECK('verao','inverno'), ano INTEGER, status CHECK('planejamento','em_compra','finalizada')

segmentacoes: id, classificacao TEXT (AD|EX|INF), tipo_produto TEXT, classe TEXT (MASC|FEM|UNI),
              tipo_grade TEXT (AD|EX|INF), estacao TEXT, UNIQUE(classificacao, tipo_produto, classe, tipo_grade)

compradores: id, nome, cnpj, cidade
-- As 3 empresas do Samuel: Irmãos Backes, Samuel Paulo Backes, PSM Backes
```

---

## Task 1: Adicionar remove/update faltantes na DB layer + IPC

**Files:**
- Modify: `electron/main/db/segmentacoes.js`
- Modify: `electron/main/db/compradores.js`
- Modify: `electron/main/index.js`
- Modify: `electron/preload/index.js`

- [ ] **Step 1: Adicionar `remove` em segmentacoes.js**

```js
// Adicionar dentro do objeto retornado por makeSegmentacoes:
remove(id) {
  db.prepare(`DELETE FROM segmentacoes WHERE id = ?`).run(id)
}
```

- [ ] **Step 2: Adicionar `update` e `remove` em compradores.js**

```js
// Adicionar dentro do objeto retornado por makeCompradores:
update(id, { nome, cnpj = '', cidade = '' }) {
  db.prepare(`UPDATE compradores SET nome = ?, cnpj = ?, cidade = ? WHERE id = ?`)
    .run(nome, cnpj, cidade, id)
  return byId.get(id)
},
remove(id) {
  db.prepare(`DELETE FROM compradores WHERE id = ?`).run(id)
}
```

- [ ] **Step 3: Adicionar handlers em index.js**

```js
ipcMain.handle('segmentacoes:remove',  (_, id) => seg.remove(id))
ipcMain.handle('compradores:update',   (_, id, d) => comp.update(id, d))
ipcMain.handle('compradores:remove',   (_, id) => comp.remove(id))
```

- [ ] **Step 4: Expor em preload/index.js**

```js
// Dentro de segmentacoes:
remove: (id) => ipcRenderer.invoke('segmentacoes:remove', id),

// Dentro de compradores:
update: (id, d) => ipcRenderer.invoke('compradores:update', id, d),
remove: (id)    => ipcRenderer.invoke('compradores:remove', id),
```

- [ ] **Step 5: Testes**

Adicionar em `tests/segmentacoes.test.js`:
```js
test('remove deletes segmentacao by id', () => {
  const seg = setup()
  const id = seg.create({ classificacao: 'AD', tipo_produto: 'CALCA', classe: 'MASC', tipo_grade: 'AD', estacao: 'inverno' })
  seg.remove(id)
  expect(seg.list()).toHaveLength(0)
})
```

Adicionar em `tests/compradores.test.js` (criar se não existir):
```js
import Database from 'better-sqlite3'
import { runMigrations } from '../electron/main/db/schema.js'
import { makeCompradores } from '../electron/main/db/compradores.js'

function setup() {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
  return makeCompradores(db)
}

test('update changes comprador fields', () => {
  const comp = setup()
  const c = comp.create({ nome: 'Irmãos Backes', cnpj: '00.000.000/0001-00', cidade: 'SC' })
  comp.update(c.id, { nome: 'Irmãos Backes Ltda', cnpj: '00.000.000/0001-00', cidade: 'Chapecó' })
  expect(comp.list()[0].nome).toBe('Irmãos Backes Ltda')
})

test('remove deletes comprador', () => {
  const comp = setup()
  const c = comp.create({ nome: 'PSM Backes', cnpj: '', cidade: '' })
  comp.remove(c.id)
  expect(comp.list()).toHaveLength(0)
})
```

- [ ] **Step 6: Commit**

```
git add electron/main/db/segmentacoes.js electron/main/db/compradores.js electron/main/index.js electron/preload/index.js tests/
git commit -m "feat(db+ipc): add remove/update for segmentacoes and compradores"
```

---

## Task 2: Tela Configuracoes.jsx

**Files:**
- Create: `src/renderer/src/screens/Configuracoes.jsx`
- Create: `src/renderer/src/screens/Configuracoes.module.css`

### Aba Coleções

Lista todas as coleções. Formulário inline para criar nova (nome, estação radio, ano). Dropdown de status ao lado de cada coleção (planejamento → em_compra → finalizada).

Campos do formulário:
- `nome`: text input, ex: "Inverno 2026"
- `estacao`: radio — Verão / Inverno
- `ano`: number input

### Aba Segmentações

Lista todas as segmentações agrupadas por classificação (AD / EX / INF). Formulário para criar nova:
- `classificacao`: select — AD / EX / INF
- `tipo_produto`: text input, ex: "CALCA", "CAMISETA", "VESTIDO"
- `classe`: select — MASC / FEM / UNI
- `tipo_grade`: select — AD (P/M/G/GG/EXG) / EX (36/38/40/42/44/46) / INF (2/4/6/8/10/12)
- `estacao`: select — verao / inverno

Botão de remover ao lado de cada segmentação.

### Aba Compradores

Lista os compradores (as 3 empresas do Samuel). Formulário para criar/editar:
- `nome`: text input
- `cnpj`: text input, ex: "00.000.000/0001-00"
- `cidade`: text input

Botão editar (inline editing) e remover ao lado de cada comprador.

### Estrutura do componente

```jsx
// Configuracoes.jsx — estrutura geral
export default function Configuracoes() {
  const [aba, setAba] = useState('colecoes') // 'colecoes' | 'segmentacoes' | 'compradores'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configurações</h1>
      <div className={styles.tabs}>
        <button className={aba === 'colecoes'     ? styles.tabActive : styles.tab} onClick={() => setAba('colecoes')}>Coleções</button>
        <button className={aba === 'segmentacoes' ? styles.tabActive : styles.tab} onClick={() => setAba('segmentacoes')}>Segmentações</button>
        <button className={aba === 'compradores'  ? styles.tabActive : styles.tab} onClick={() => setAba('compradores')}>Compradores</button>
      </div>
      {aba === 'colecoes'     && <AbaColecoes />}
      {aba === 'segmentacoes' && <AbaSegmentacoes />}
      {aba === 'compradores'  && <AbaCompradores />}
    </div>
  )
}
```

- [ ] **Step 1: Implementar Configuracoes.jsx completo com as 3 abas**

- [ ] **Step 2: Implementar Configuracoes.module.css**

Reutilizar variáveis CSS existentes (`var(--bg-card)`, `var(--border)`, `var(--text)`, `var(--purple)`, etc.).
Classes necessárias: `page`, `title`, `tabs`, `tab`, `tabActive`, `section`, `form`, `field`, `label`, `btnPrimary`, `btnSecondary`, `btnDanger`, `list`, `listItem`, `listItemLabel`, `listItemActions`, `badge` (para status da coleção).

- [ ] **Step 3: Commit**

```
git commit -m "feat(ui): add Configuracoes screen (colecoes, segmentacoes, compradores)"
```

---

## Task 3: Adicionar Configurações ao menu de navegação

**Files:**
- Modify: `src/renderer/src/App.jsx`

- [ ] **Step 1: Adicionar 'configuracoes' como opção de nav no App.jsx**

Localizar o array de telas/nav no App.jsx e adicionar:
```js
{ key: 'configuracoes', label: 'Configurações', icon: '⚙️' }
```

Adicionar ao render:
```jsx
{tela === 'configuracoes' && <Configuracoes />}
```

- [ ] **Step 2: Commit**

```
git commit -m "feat(nav): add Configuracoes to sidebar navigation"
```

---

## Critérios de aceitação

- Samuel consegue criar uma nova coleção pela interface
- Samuel consegue criar/remover segmentações pela interface
- Samuel consegue criar/editar/remover compradores pela interface
- Todos os testes passando

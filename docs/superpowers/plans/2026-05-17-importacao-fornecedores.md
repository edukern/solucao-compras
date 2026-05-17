# Solução Compras — Sessão 4: Importação de Fornecedores

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Permitir que Samuel importe a lista de fornecedores (marcas) do ERP de uma vez, em vez de cadastrar um a um. O ERP exporta uma planilha "Análise de Vendas agrupado por Marca" com ~150 marcas. A importação deve ser idempotente (re-rodar não duplica).

**Architecture:** Dois caminhos:
1. **Script Node.js** (`scripts/import-fornecedores.cjs`) — para a primeira carga, roda fora do Electron
2. **Botão na UI** — na aba Fornecedores (nova aba em Configuracoes.jsx) abre dialog de arquivo, lê o CSV/XLSX e importa via IPC

**Tech Stack:** `xlsx` npm package para leitura de Excel · IPC existente (`fornecedores:create`, `fornecedores:list`) · `dialog:openFile` (já exposto no preload)

---

## IMPORTANTE — Dados de entrada

**Antes de implementar, o usuário deve fornecer:**
1. Um arquivo de exemplo do ERP exportado (CSV ou XLSX)
2. Confirmação de quais colunas contêm: nome da marca, categoria (opcional)

**Formato esperado** (baseado no que foi descrito):
- Arquivo: Análise de Vendas agrupado por Marca
- Coluna principal: nome da marca/fornecedor
- Possível coluna: categoria (ex: feminino, masculino, infantil)

---

## File Map

| File | Action |
|---|---|
| `scripts/import-fornecedores.cjs` | Create — script standalone para primeira carga |
| `src/renderer/src/screens/Configuracoes.jsx` | Modify — adicionar aba Fornecedores |
| `electron/main/index.js` | Modify — adicionar handler `fornecedores:importar` |
| `electron/preload/index.js` | Modify — expor `fornecedores.importar` |

---

## Task 1: Script de importação standalone

**Files:**
- Create: `scripts/import-fornecedores.cjs`

O script:
1. Recebe o caminho do arquivo como argumento: `node scripts/import-fornecedores.cjs "C:\path\to\analise-vendas.xlsx"`
2. Lê o XLSX com `xlsx` package
3. Para cada linha com nome de marca válido, faz `INSERT OR IGNORE INTO fornecedores (nome, contato, categoria)`
4. Imprime um resumo: "X fornecedores importados, Y já existiam"

```js
// scripts/import-fornecedores.cjs
const XLSX = require('xlsx')
const Database = require('better-sqlite3')
const path = require('path')
const os = require('os')

const DB_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'solucao-compras', 'solucao-compras.db')
const FILE_PATH = process.argv[2]

if (!FILE_PATH) {
  console.error('Uso: node scripts/import-fornecedores.cjs "caminho/para/arquivo.xlsx"')
  process.exit(1)
}

const db = new Database(DB_PATH)
const stmt = db.prepare(`INSERT OR IGNORE INTO fornecedores (nome, contato, categoria) VALUES (?, '', ?)`)

const workbook = XLSX.readFile(FILE_PATH)
const sheet = workbook.Sheets[workbook.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(sheet)

// ADAPTAR conforme colunas reais do arquivo ERP
// rows.forEach(row => { ... })

let inserted = 0, skipped = 0
// ... implementar após ver o arquivo real
```

- [ ] **Step 1: Instalar xlsx se necessário**
```
npm list xlsx || npm install xlsx --save-dev
```

- [ ] **Step 2: Ver a estrutura real do arquivo ERP**

Antes de implementar, rodar:
```js
const XLSX = require('xlsx')
const wb = XLSX.readFile(process.argv[2])
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws)
console.log('Colunas:', Object.keys(rows[0]))
console.log('Primeiras 3 linhas:', rows.slice(0, 3))
```

- [ ] **Step 3: Implementar o parser baseado na estrutura real**

- [ ] **Step 4: Testar com o arquivo real**

```
node scripts/import-fornecedores.cjs "C:\caminho\para\analise-vendas.xlsx"
```

- [ ] **Step 5: Commit**

```
git commit -m "feat(scripts): add import-fornecedores.cjs for ERP bulk import"
```

---

## Task 2: Aba Fornecedores em Configuracoes.jsx

**Files:**
- Modify: `src/renderer/src/screens/Configuracoes.jsx`
- Modify: `electron/main/index.js`
- Modify: `electron/preload/index.js`

### Nova aba: Fornecedores

- Lista todos os fornecedores com busca por nome
- Botão "Importar do ERP" — abre dialog de arquivo (`.xlsx` ou `.csv`), lê e importa
- Formulário para adicionar fornecedor manualmente (nome, categoria)
- Editar/remover fornecedor individual

### IPC a adicionar

```js
// main/index.js
ipcMain.handle('fornecedores:importar', (_, rows) => {
  // rows = [{ nome, categoria }]
  const stmt = db.prepare(`INSERT OR IGNORE INTO fornecedores (nome, contato, categoria) VALUES (@nome, '', @categoria)`)
  const importar = db.transaction((rows) => rows.forEach(r => stmt.run(r)))
  importar(rows)
  return forn.list()
})

ipcMain.handle('fornecedores:remove', (_, id) => {
  db.prepare(`DELETE FROM fornecedores WHERE id = ?`).run(id)
})
```

```js
// preload/index.js — dentro de fornecedores:
importar: (rows) => ipcRenderer.invoke('fornecedores:importar', rows),
remove:   (id)   => ipcRenderer.invoke('fornecedores:remove', id),
```

O renderer lê o arquivo com `FileReader` (API web nativa), parseia com `xlsx` (importado como módulo no renderer), e envia os dados via IPC.

- [ ] **Step 1: Adicionar handlers IPC**
- [ ] **Step 2: Implementar AbaFornecedores component**
- [ ] **Step 3: Adicionar aba ao Configuracoes.jsx**
- [ ] **Step 4: Commit**

```
git commit -m "feat(ui): add Fornecedores tab to Configuracoes with ERP import"
```

---

## Critérios de aceitação

- Samuel consegue importar ~150 fornecedores de uma vez via arquivo do ERP
- Reimportar o mesmo arquivo não duplica registros (idempotente)
- Samuel consegue adicionar/editar/remover fornecedores individualmente
- A tela Compras mostra os fornecedores importados

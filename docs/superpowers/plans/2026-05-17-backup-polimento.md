# Solução Compras — Sessão 6: Backup + Polimento

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Adicionar backup do banco com um clique antes de ir para produção, e aplicar os ajustes visuais que forem levantados no uso real.

**Architecture:** Backup via `fs.copyFileSync` no processo main (já tem acesso ao arquivo SQLite). Dialog nativo do Electron para escolher destino. Botão na tela de Configurações.

**Tech Stack:** Electron `dialog` (já importado) · Node `fs` · CSS ajustes no CSS Modules existente

---

## File Map

| File | Action |
|---|---|
| `electron/main/index.js` | Modify — implementar handlers `backup:export` e `backup:import` |
| `src/renderer/src/screens/Configuracoes.jsx` | Modify — adicionar seção Backup |
| `src/renderer/src/screens/Configuracoes.module.css` | Modify — estilos da seção backup |

---

## IPC já exposto no preload (não precisa criar)

```js
// Já existe no preload/index.js:
backup: {
  export: () => ipcRenderer.invoke('backup:export'),
  import: () => ipcRenderer.invoke('backup:import'),
},
dialog: {
  openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
}
```

Falta apenas implementar os handlers no `main/index.js`.

---

## Task 1: Implementar backup:export e backup:import

**Files:**
- Modify: `electron/main/index.js`

```js
import fs from 'fs'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'

const DB_PATH = path.join(app.getPath('userData'), 'solucao-compras.db')

// Backup export — copia o .db para local escolhido pelo usuário
ipcMain.handle('backup:export', async () => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Exportar backup',
    defaultPath: `backup-solucao-compras-${new Date().toISOString().slice(0,10)}.db`,
    filters: [{ name: 'SQLite Database', extensions: ['db'] }]
  })
  if (canceled || !filePath) return { ok: false }
  fs.copyFileSync(DB_PATH, filePath)
  return { ok: true, path: filePath }
})

// Backup import — restaura a partir de um .db escolhido pelo usuário
ipcMain.handle('backup:import', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Restaurar backup',
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    properties: ['openFile']
  })
  if (canceled || !filePaths[0]) return { ok: false }
  // AVISO: isso sobrescreve o banco atual
  fs.copyFileSync(filePaths[0], DB_PATH)
  return { ok: true }
})
```

- [ ] **Step 1: Implementar os dois handlers**
- [ ] **Step 2: Verificar que DB_PATH está correto** (comparar com `app.getPath('userData')`)
- [ ] **Step 3: Commit**

```
git commit -m "feat(backup): implement export/import handlers via Electron dialog"
```

---

## Task 2: Seção Backup em Configuracoes.jsx

**Files:**
- Modify: `src/renderer/src/screens/Configuracoes.jsx`

Adicionar uma seção "Backup" (pode ser uma aba ou uma seção no rodapé):

```jsx
function AbaBackup() {
  const [status, setStatus] = useState(null)

  async function handleExport() {
    const result = await window.api.backup.export()
    setStatus(result.ok ? `Backup salvo em: ${result.path}` : 'Cancelado.')
  }

  async function handleImport() {
    if (!confirm('ATENÇÃO: Isso vai sobrescrever todos os dados atuais com o backup. Tem certeza?')) return
    const result = await window.api.backup.import()
    setStatus(result.ok ? 'Backup restaurado. Reinicie o app.' : 'Cancelado.')
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Backup do banco de dados</h2>
      <p className={styles.hint}>
        O banco fica em: <code>%APPDATA%\solucao-compras\solucao-compras.db</code>
      </p>
      <div className={styles.backupActions}>
        <button className={styles.btnPrimary} onClick={handleExport}>
          ↓ Exportar backup
        </button>
        <button className={styles.btnDanger} onClick={handleImport}>
          ↑ Restaurar backup
        </button>
      </div>
      {status && <div className={styles.backupStatus}>{status}</div>}
    </div>
  )
}
```

- [ ] **Step 1: Implementar AbaBackup**
- [ ] **Step 2: Adicionar ao Configuracoes.jsx (aba ou seção separada)**
- [ ] **Step 3: Commit**

```
git commit -m "feat(ui): add backup export/import section to Configuracoes"
```

---

## Task 3: Polimento visual

**A definir no uso real.** Itens típicos a revisar:

- [ ] Alinhamentos e espaçamentos inconsistentes entre telas
- [ ] Responsividade da janela (min-width 1024px já configurado)
- [ ] Feedback visual de loading em operações lentas
- [ ] Empty states nas listas (quando não tem fornecedores, segmentações, etc.)
- [ ] Mensagens de erro mais descritivas
- [ ] Cor de destaque menos genérica (identidade visual do Samuel)

**Para cada ajuste:**
- Identificar o arquivo CSS Module específico
- Fazer a alteração diretamente (sem subagente para ajustes de 2-3 linhas)
- Commit por contexto: `style(dashboard): improve spacing and empty state`

---

## Critérios de aceitação

- Samuel consegue fazer backup com um clique em "Exportar backup"
- O backup é um arquivo `.db` válido (pode abrir com DB Browser for SQLite)
- Restaurar sobrescreve corretamente após confirmação
- Ajustes visuais aplicados conforme lista levantada no uso real

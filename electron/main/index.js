// electron/main/index.js
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
import XLSX from 'xlsx'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // sandbox: false required — preload uses ESM imports; renderer has no Node access
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
  ipcMain.handle('segmentacoes:list',    () => seg.list())
  ipcMain.handle('segmentacoes:create',  (_, d) => seg.create(d))
  ipcMain.handle('segmentacoes:upsert',  (_, d) => seg.upsert(d))
  ipcMain.handle('segmentacoes:remove',  (_, id) => seg.remove(id))

  // Grades
  ipcMain.handle('grades:save',  (_, segId, colId, rows) => gr.saveGrade(segId, colId, rows))
  ipcMain.handle('grades:get',   (_, segId, colId) => gr.getGrade(segId, colId))

  // Projecoes
  ipcMain.handle('projecoes:calcular',  (_, segId, colId, baseIds, metodo) => proj.calcular(segId, colId, baseIds, metodo))
  ipcMain.handle('projecoes:salvar',    (_, segId, colId, rows, metodo) => proj.salvar(segId, colId, rows, metodo))
  ipcMain.handle('projecoes:get',       (_, segId, colId) => proj.getProjecao(segId, colId))
  ipcMain.handle('projecoes:ajustar',   (_, segId, colId, tamanho, qtd) => proj.ajustar(segId, colId, tamanho, qtd))
  ipcMain.handle('projecoes:restaurar', (_, segId, colId, tamanho) => proj.restaurar(segId, colId, tamanho))

  // Fornecedores
  ipcMain.handle('fornecedores:list',   () => forn.list())
  ipcMain.handle('fornecedores:create', (_, d) => forn.create(d))
  ipcMain.handle('fornecedores:update', (_, id, d) => forn.update(id, d))
  ipcMain.handle('fornecedores:remove', (_, id) => forn.remove(id))
  ipcMain.handle('fornecedores:importarArquivo', async (_, filePath) => {
    // ERP export: 'Confirma seleção' = category header, '__EMPTY' = brand name
    const workbook = XLSX.readFile(filePath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    let currentCategoria = ''
    const marcas = []
    rows.forEach(row => {
      const cat = row['Confirma seleção']?.toString().trim()
      const nome = row['__EMPTY']?.toString().trim()
      if (cat) {
        currentCategoria = cat
      } else if (nome && nome !== 'Descrição') {
        marcas.push({ nome, categoria: currentCategoria })
      }
    })

    const stats = forn.importar(marcas)
    return { ...stats, fornecedores: forn.list() }
  })

  // Compradores
  ipcMain.handle('compradores:list',   () => comp.list())
  ipcMain.handle('compradores:create', (_, d) => comp.create(d))
  ipcMain.handle('compradores:update', (_, id, d) => comp.update(id, d))
  ipcMain.handle('compradores:remove', (_, id) => comp.remove(id))

  // Visitas
  ipcMain.handle('visitas:create', (_, d)     => vis.create(d))
  ipcMain.handle('visitas:list',   (_, colId) => vis.list(colId))
  ipcMain.handle('visitas:byId',   (_, id)    => vis.getById(id))

  // Pedidos
  ipcMain.handle('pedidos:salvar',             (_, d)            => ped.salvar(d))
  ipcMain.handle('pedidos:byVisita',           (_, visitaId)     => ped.byVisita(visitaId))
  ipcMain.handle('pedidos:totaisPorTamanho',   (_, segId, colId) => ped.totaisPorTamanho(segId, colId))
  ipcMain.handle('pedidos:totaisPorFornecedor',(_, colId, segId) => ped.totaisPorFornecedor(colId, segId))
  ipcMain.handle('pedidos:itensPorFornecedor', (_, fornId, colId)=> ped.itensPorFornecedor(fornId, colId))

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

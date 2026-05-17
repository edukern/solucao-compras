const XLSX = require('xlsx')
const Database = require('better-sqlite3')
const path = require('path')
const os = require('os')
const fs = require('fs')

const DB_PATH = path.join(os.homedir(), 'AppData', 'Roaming', 'solucao-compras', 'solucao-compras.db')
const FILE_PATH = process.argv[2] || 'C:/Users/eduke/Downloads/Marcas 2025_2026.xlsx'

try {
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`Erro: arquivo não encontrado: ${FILE_PATH}`)
    process.exit(1)
  }

  const db = new Database(DB_PATH)

  // Ensure unique index exists so INSERT OR IGNORE works correctly
  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_fornecedores_nome ON fornecedores(nome)`)

  const stmt = db.prepare(`INSERT OR IGNORE INTO fornecedores (nome, contato, categoria) VALUES (?, '', ?)`)

  const workbook = XLSX.readFile(FILE_PATH)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  let currentCategoria = ''
  let inserted = 0
  let skipped = 0

  // ERP export structure: 'Confirma seleção' = category header row, '__EMPTY' = brand name under last category
  const importar = db.transaction(() => {
    rows.forEach(row => {
      const cat = row['Confirma seleção']?.toString().trim()
      const nome = row['__EMPTY']?.toString().trim()

      if (cat) {
        currentCategoria = cat
      } else if (nome && nome !== 'Descrição') {
        const result = stmt.run(nome, currentCategoria)
        if (result.changes > 0) inserted++
        else skipped++
      }
    })
  })

  importar()

  console.log(`Importação concluída: ${inserted} fornecedores importados, ${skipped} já existiam`)
  db.close()
  process.exit(0)
} catch (err) {
  console.error(`Erro durante a importação: ${err.message}`)
  process.exit(1)
}

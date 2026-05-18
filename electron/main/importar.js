import * as XLSX from 'xlsx'
import { readFileSync } from 'fs'

const GRADE_RANGES = [
  { tipo_grade: 'PP',  tamanhos: ['RN','P','M','G','GG'],                                          cols: [3,4,5,6,7] },
  { tipo_grade: 'BB',  tamanhos: ['1','2','3','4'],                                                 cols: [8,9,10,11] },
  { tipo_grade: 'INF', tamanhos: ['2','4','6','8','10','12'],                                       cols: [12,13,14,15,16,17] },
  { tipo_grade: 'JUV', tamanhos: ['10','12','14','16','18','20'],                                    cols: [18,19,20,21,22,23] },
  { tipo_grade: 'AD',  tamanhos: ['PP','P','M','G','GG','XG'],                                      cols: [24,25,26,27,28,29] },
  { tipo_grade: 'EX',  tamanhos: ['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10'],              cols: [30,31,32,33,34,35,36,37,38,39] },
  { tipo_grade: 'AD1', tamanhos: ['34','36','38','40','42','44','46','48','50','52'],                cols: [40,41,42,43,44,45,46,47,48,49] },
  { tipo_grade: 'EX1', tamanhos: ['46','48','50','52','54','56','58','60','62','64'],                cols: [50,51,52,53,54,55,56,57,58,59] },
  { tipo_grade: 'AD2', tamanhos: ['1','2','3','4','5'],                                              cols: [60,61,62,63,64] },
  { tipo_grade: 'EX2', tamanhos: ['6','7','8','9','10'],                                             cols: [65,66,67,68,69] },
  { tipo_grade: 'U',   tamanhos: ['F','M','U'],                                                      cols: [70,71,72] },
]

const GRADE_CLASSIFICACAO = {
  PP:  'PP',
  BB:  'BB',
  INF: 'INF',
  JUV: 'JUV',
  AD:  'AD', AD1: 'AD',  AD2: 'AD',
  EX:  'EX', EX1: 'EX',  EX2: 'EX',
  U:   'U',
}

export function parseProdutoNome(nome) {
  if (!nome) return null
  const parts = String(nome).trim().toUpperCase().split(/\s+/)
  if (parts.length === 0) return null
  const last = parts[parts.length - 1]
  if (['FEM', 'MASC', 'UNI'].includes(last)) {
    return { tipo_produto: parts.slice(0, -1).join(' '), classe: last }
  }
  return { tipo_produto: parts.join(' '), classe: 'UNI' }
}

export function detectGrade(row) {
  for (const range of GRADE_RANGES) {
    if (range.cols.some(c => (Number(row[c]) || 0) > 0)) return range
  }
  return null
}

export function parsePlanilhaRows(rows) {
  const blocks = []
  let i = 3 // skip 3 header rows

  while (i < rows.length) {
    const tipo = String(rows[i]?.[2] ?? '').trim().toLowerCase()
    if (tipo === 'compra' && rows[i][1]) {
      const nome      = rows[i][1]
      const compraRow = rows[i]

      const nextTipo1 = String(rows[i + 1]?.[2] ?? '').trim().toLowerCase()
      const nextTipo2 = String(rows[i + 2]?.[2] ?? '').trim().toLowerCase()

      const vendaRow   = nextTipo1 === 'venda'   ? rows[i + 1] : null
      const estoqueRow = vendaRow && nextTipo2 === 'estoque' ? rows[i + 2] : null

      blocks.push({ nome, compraRow, vendaRow, estoqueRow })

      // Advance past compra (1) + optional venda (1) + optional estoque (1) + optional pedido (1)
      if (!vendaRow) {
        i += 1 // only skip compra; next row is another Compra or something else
      } else if (!estoqueRow) {
        i += 2 // skip compra + venda
      } else {
        i += 4 // skip compra + venda + estoque + pedido
      }
      continue
    }
    i++
  }

  return blocks
}

export function parsePlanilha(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: 0 })
  return parsePlanilhaRows(rows)
}

export function importarPlanilha({ filePath, colecaoId, estacao, seg, gr }) {
  const buffer = readFileSync(filePath)
  const blocks = parsePlanilha(buffer)

  let imported = 0
  let skipped  = 0
  const errors = []
  const batchItems = []

  for (const block of blocks) {
    const parsed = parseProdutoNome(block.nome)
    if (!parsed) { skipped++; continue }
    const { tipo_produto, classe } = parsed

    const range = detectGrade(block.compraRow)
    if (!range) { skipped++; continue }

    const { tipo_grade, tamanhos, cols } = range
    const classificacao = GRADE_CLASSIFICACAO[tipo_grade]
    if (!classificacao) { skipped++; continue }

    let segId
    try {
      segId = seg.findOrCreate({ classificacao, tipo_produto, classe, tipo_grade, estacao: estacao ?? 'inverno' })
    } catch (e) {
      errors.push(`${block.nome}: ${e.message}`)
      continue
    }

    const gradeRows = tamanhos
      .map((tamanho, idx) => ({
        tamanho,
        ordem:        idx,
        qtd_comprada: Number(block.compraRow[cols[idx]])     || 0,
        qtd_vendida:  Number(block.vendaRow?.[cols[idx]])    || 0,
        qtd_estoque:  Number(block.estoqueRow?.[cols[idx]])  || 0,
      }))
      .filter(r => r.qtd_comprada > 0 || r.qtd_vendida > 0 || r.qtd_estoque > 0)

    if (!gradeRows.length) { skipped++; continue }

    batchItems.push({ segmentacao_id: segId, colecao_id: colecaoId, rows: gradeRows })
    imported++
  }

  if (batchItems.length > 0) {
    gr.importBatch(batchItems)
  }

  return { imported, skipped, errors }
}

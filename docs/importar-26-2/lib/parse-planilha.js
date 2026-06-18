// parse-planilha.js — parseia 1 arquivo .xlsx → itens normalizados por loja.
// Cobre Formato A (T/Q intercalado, ex. Elite) e Formato B/C (colunas fixas, ex. FEMMINART).
// Detecção por landmarks (acha a linha "Referencia"), não offsets fixos.

const XLSX = require('xlsx')
const path = require('path')
const { mapAba, isExtra } = require('./lojas')
const { detectarGrade } = require('./grades')

const TAMANHOS_CONHECIDOS = new Set([
  'RN', 'P', 'M', 'G', 'GG', 'XG', 'PP',
  'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '14', '16', '18', '20',
  '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56', '58', '60', '62', '64',
])

function detectarFormato(sheetNames) {
  if (sheetNames.includes('CAD_GRADE')) return 'A'
  return 'B' // B e C compartilham a estrutura de colunas fixas
}

function acharHeaderItens(rows) {
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    const c0 = String((rows[i] || [])[0] ?? '').trim().toLowerCase()
    if (c0 === 'referencia' || c0 === 'referência') return i
  }
  return -1
}

// --- Formato A: pares (T,Q) a partir da col 2; col 23 = valor_unit, col 27 = preco_venda ---
function extrairItensFormatoA(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' })
  const h = acharHeaderItens(rows)
  if (h < 0) return []
  const itens = []
  for (let r = h + 1; r < rows.length; r++) {
    const row = rows[r] || []
    const ref = String(row[0] ?? '').trim()
    const produto = String(row[1] ?? '').trim()
    if (!ref && !produto) break
    if (!ref || !produto) continue
    if (/^total|^soma/i.test(ref)) break
    const grade = {}
    let soma = 0
    for (let i = 0; i < 10; i++) {
      const t = String(row[2 + i * 2] ?? '').trim().toUpperCase()
      const q = Number(row[2 + i * 2 + 1] ?? 0)
      if (t && t !== '--' && t !== '0' && q > 0 && Number.isInteger(q)) { grade[t] = (grade[t] || 0) + q; soma += q }
    }
    if (soma === 0) continue
    const g = detectarGrade(Object.keys(grade))
    itens.push({
      referencia: ref, produto,
      valor_unitario: Number(row[23]) || 0, preco_venda: Number(row[27]) || 0,
      tipo_grade: g.tipo_grade, classificacao: g.classificacao, grade, pecas: soma,
    })
  }
  return itens
}

// --- Formato B/C: colunas fixas; tamanhos no header da linha "Referencia" (ou logo acima) ---
// modo 'header' (default): rótulo de tamanho está na própria linha "Referencia".
// modo 'acima': usa a linha imediatamente acima do cabeçalho (ex. FEMMINART, onde
//   as mesmas colunas têm P/M/G/GG no header e 46/48/50/52 na linha de cima — para
//   sutiã o número da banda é o tamanho correto, e mapeia para grade AD, não PP).
function acharColunasTamanhoB(rows, headerRow, modo = 'header') {
  const start = modo === 'acima' ? headerRow - 1 : headerRow
  for (let i = start; i >= Math.max(0, headerRow - 3); i--) {
    const row = rows[i] || []
    const cols = []
    for (let c = 2; c < row.length; c++) {
      const v = String(row[c] ?? '').trim().toUpperCase()
      if (TAMANHOS_CONHECIDOS.has(v)) cols.push({ col: c, tamanho: v })
    }
    if (cols.length >= 1) return cols
  }
  return []
}

function extrairItensFormatoB(ws, modo = 'header') {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' })
  const h = acharHeaderItens(rows)
  if (h < 0) return []
  const colsTam = acharColunasTamanhoB(rows, h, modo)
  if (!colsTam.length) return []
  // col "Quant" como oráculo (se existir) — total por linha
  const header = rows[h] || []
  let colQuant = -1
  for (let c = 0; c < header.length; c++) if (/^quant/i.test(String(header[c] ?? '').trim())) { colQuant = c; break }

  const itens = []
  for (let r = h + 1; r < rows.length; r++) {
    const row = rows[r] || []
    const ref = String(row[0] ?? '').trim()
    const produto = String(row[1] ?? '').trim()
    if (!ref && !produto) break
    if (!ref) continue
    if (/^total|^soma/i.test(ref)) break
    const grade = {}
    let soma = 0
    for (const { col, tamanho } of colsTam) {
      const q = Number(row[col] ?? 0)
      if (q > 0 && Number.isInteger(q)) { grade[tamanho] = (grade[tamanho] || 0) + q; soma += q }
    }
    if (soma === 0) continue
    const g = detectarGrade(Object.keys(grade))
    const it = { referencia: ref, produto, tipo_grade: g.tipo_grade, classificacao: g.classificacao, grade, pecas: soma }
    if (colQuant >= 0) { const qz = Number(row[colQuant] ?? 0); if (Number.isInteger(qz)) it.quant_oraculo = qz }
    itens.push(it)
  }
  return itens
}

function fornecedorDoArquivo(filePath) {
  return path.basename(filePath)
    .replace(/\.xlsx$/i, '')
    .replace(/\s*\d{2}-\d{2}-\d{2,4}$/i, '')
    .trim()
}

function parsePlanilha(filePath, opts = {}) {
  const modoB = opts.rotuloTamanhoB === 'acima' ? 'acima' : 'header'
  const wb = XLSX.readFile(filePath, { cellDates: false })
  const formato = detectarFormato(wb.SheetNames)
  const fornecedor_nome = fornecedorDoArquivo(filePath)

  const itens = []
  const totaisPorLoja = {}
  const abasExtrasComDados = []

  for (const sn of wb.SheetNames) {
    if (/^SOMA_/i.test(sn)) continue
    const cid = mapAba(sn)
    if (cid == null) { if (isExtra(sn)) abasExtrasComDados.push(sn); continue }
    const abaItens = formato === 'A' ? extrairItensFormatoA(wb.Sheets[sn]) : extrairItensFormatoB(wb.Sheets[sn], modoB)
    for (const it of abaItens) {
      itens.push({ ...it, fornecedor_nome, comprador_id: cid })
      totaisPorLoja[cid] = (totaisPorLoja[cid] || 0) + it.pecas
    }
  }

  return { arquivo: path.basename(filePath), fornecedor_nome, formato, itens, totaisPorLoja, abasExtras: abasExtrasComDados }
}

module.exports = { parsePlanilha, fornecedorDoArquivo }

/**
 * Extrai dados de fornecedores das planilhas das coleções 2025-2, 2026-1, 2026-2.
 * Estrutura esperada na aba PEDIDO:
 *   Row 0: ["Fornecedor:", NOME, "Vendedor:", VENDEDOR]
 *   Row 1: ["Data:", DATE,  "Fone:",    PHONE]
 *   Row 2: ["Entrega:", ENTREGA]
 *   Row 3: ["Cond. Pag:", COND_PAG, "Nota Fiscal:", ...]
 *   Row 4: ["Frete", FRETE, "Crédito:", ICMS_PCT]
 *   Row 5: ["Transportadora:", TRANSP]
 *   Row 7: ["Obs:", TEXT?]   (às vezes nas linhas seguintes)
 *
 * Uso: node docs/importar-fornecedores.js > docs/fornecedores-seed.sql
 */

const xlsx = require('xlsx')
const fs   = require('fs')
const path = require('path')

const BASE        = 'C:\\Users\\eduke\\Solução Compras\\Pedidos'
const COLLECTIONS = [
  '2015-1','2015-2','2016-1','2016-2','2017-1','2017-2',
  '2018-1','2018-2','2019-1','2019-2','2020-1','2020-2',
  '2021-1','2021-2','2022-1','2022-2','2023-1','2023-2',
  '2024-1','2024-2','2025-1','2025-2','2026-1','2026-2',
]

// Known label strings to reject as values
const LABELS = new Set([
  'fone:', 'vendedor:', 'fornecedor:', 'data:', 'entrega:', 'cond. pag:',
  'cond.pag:', 'nota fiscal:', 'frete:', 'frete', 'crédito:', 'credito:',
  'transportadora:', 'obs:', 'descrição:', 'descricao:',
])

function cell(row, idx) {
  const v = String(row?.[idx] ?? '').trim()
  if (!v || v === '0' || v.toLowerCase() === 'nan') return null
  // Reject bare label strings (e.g. "Fone:", "Vendedor:")
  if (LABELS.has(v.toLowerCase())) return null
  // Reject any value that looks like a pure label (only letters/spaces/dots ending in ':')
  if (/^[A-Za-zÀ-ÿ\s.]+:$/.test(v)) return null
  return v
}

function extrairFornecedor(filePath) {
  let wb
  try { wb = xlsx.readFile(filePath, { cellDates: false, sheetStubs: true }) }
  catch { return null }

  const sheetName = wb.SheetNames.find(n => /^pedido$/i.test(n))
                 ?? wb.SheetNames.find(n => !/^cad_/i.test(n))
                 ?? wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  if (!ws) return null

  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' })

  // Row 0: Fornecedor + Vendedor  (labels at col 0,4 — values at col 1,5)
  const nome     = cell(rows[0], 1)?.toUpperCase() ?? null
  const vendedor = cell(rows[0], 5)

  // Row 1: Data + Fone  (same col layout)
  const fone = cell(rows[1], 5)

  // Row 2: Entrega
  // (data de entrega varia por sessão, não guardamos como default)

  // Row 3: Cond. Pag + Nota Fiscal
  const condPag = cell(rows[3], 1)

  // Row 4: Frete + Crédito ICMS  (Crédito label at col 4, value at col 5)
  const frete = cell(rows[4], 1)
  const icmsRaw = cell(rows[4], 5)
  const icmsCredito = icmsRaw ? parseFloat(icmsRaw.replace(',', '.')) || null : null

  // Row 5: Transportadora
  const transp = cell(rows[5], 1)

  // Obs: busca nas linhas 7-12 algo que não seja só label ou zeros
  let obs = null
  for (let i = 7; i <= 12 && i < rows.length; i++) {
    const row = rows[i]
    const rowStr = String(row[0] ?? '').trim()
    if (/^Obs:/i.test(rowStr)) {
      const resto = cell(rows[i], 1)
      if (resto) { obs = resto; break }
    }
    // linha pura de texto (não é loja nem ref numérico)
    if (row.length === 1 && rowStr && !/^\d/.test(rowStr) && !/^Obs/i.test(rowStr)
        && !/^Trocas/i.test(rowStr) && !/^Desc/i.test(rowStr)) {
      if (!obs) obs = rowStr
    }
  }

  return { nome, vendedor_padrao: vendedor, telefone: fone, cond_pag_padrao: condPag,
           frete_padrao: frete, transportadora_padrao: transp, obs_padrao: obs,
           icms_credito_pct: icmsCredito }
}

// ── Varredura: 2025-2 → 2026-1 → 2026-2 (último ganha) ───────────────────
const mapa = new Map()

for (const col of COLLECTIONS) {
  const dir = path.join(BASE, col)
  if (!fs.existsSync(dir)) continue

  const arquivos = fs.readdirSync(dir)
    .filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
    .sort()

  for (const arquivo of arquivos) {
    const dados = extrairFornecedor(path.join(dir, arquivo))
    const nome  = dados?.nome
    // Skip if too short, starts with a product-ref pattern (e.g. "2.7407 - BLUSINHA"), or is all-numeric
    if (!nome || nome.length < 3) continue
    if (/^\d+\.\d/.test(nome)) continue

    const ant = mapa.get(nome) ?? {}
    mapa.set(nome, {
      nome,
      vendedor_padrao:       dados.vendedor_padrao       ?? ant.vendedor_padrao       ?? null,
      telefone:              dados.telefone              ?? ant.telefone              ?? null,
      cond_pag_padrao:       dados.cond_pag_padrao       ?? ant.cond_pag_padrao       ?? null,
      frete_padrao:          dados.frete_padrao          ?? ant.frete_padrao          ?? null,
      transportadora_padrao: dados.transportadora_padrao ?? ant.transportadora_padrao ?? null,
      obs_padrao:            dados.obs_padrao            ?? ant.obs_padrao            ?? null,
      icms_credito_pct:      dados.icms_credito_pct      ?? ant.icms_credito_pct      ?? null,
    })
  }
}

// ── SQL ───────────────────────────────────────────────────────────────────
const esc = v => (v ?? '').replace(/'/g, "''")
const sql = v => v != null ? `'${esc(String(v))}'` : 'NULL'
const num = v => v != null && !isNaN(v) ? String(v) : 'NULL'

const lista = [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome))

const OUTPUT = path.join(BASE, '..', 'docs', 'fornecedores-seed2.sql')
const lines = []

lines.push('-- Fornecedores extraídos de todas as coleções históricas')
lines.push(`-- Total: ${lista.length} fornecedores`)
lines.push(`-- Gerado em: ${new Date().toISOString()}`)
lines.push('')

for (const f of lista) {
  lines.push(`INSERT INTO fornecedores (nome, vendedor_padrao, telefone, cond_pag_padrao, frete_padrao, transportadora_padrao, obs_padrao, icms_credito_pct, categoria)`)
  lines.push(`  VALUES (${sql(f.nome)}, ${sql(f.vendedor_padrao)}, ${sql(f.telefone)}, ${sql(f.cond_pag_padrao)}, ${sql(f.frete_padrao)}, ${sql(f.transportadora_padrao)}, ${sql(f.obs_padrao)}, ${num(f.icms_credito_pct)}, 'CONFECCOES')`)
  lines.push(`  ON CONFLICT (nome) DO UPDATE SET`)
  lines.push(`    vendedor_padrao       = COALESCE(EXCLUDED.vendedor_padrao,       fornecedores.vendedor_padrao),`)
  lines.push(`    telefone              = COALESCE(EXCLUDED.telefone,              fornecedores.telefone),`)
  lines.push(`    cond_pag_padrao       = COALESCE(EXCLUDED.cond_pag_padrao,       fornecedores.cond_pag_padrao),`)
  lines.push(`    frete_padrao          = COALESCE(EXCLUDED.frete_padrao,          fornecedores.frete_padrao),`)
  lines.push(`    transportadora_padrao = COALESCE(EXCLUDED.transportadora_padrao, fornecedores.transportadora_padrao),`)
  lines.push(`    obs_padrao            = COALESCE(EXCLUDED.obs_padrao,            fornecedores.obs_padrao),`)
  lines.push(`    icms_credito_pct      = COALESCE(EXCLUDED.icms_credito_pct,      fornecedores.icms_credito_pct);`)
  lines.push('')
}

fs.writeFileSync(OUTPUT, lines.join('\n'), 'utf8')
console.log(`Escrito: ${OUTPUT}`)
console.log(`Total: ${lista.length} fornecedores`)

// Resumo no console
console.log('\nNome | Telefone | Vendedor | Cond.Pag | Frete | ICMS%')
for (const f of lista) {
  console.log(`  ${f.nome} | ${f.telefone??'-'} | ${f.vendedor_padrao??'-'} | ${f.cond_pag_padrao??'-'} | ${f.frete_padrao??'-'} | ${f.icms_credito_pct??'-'}`)
}

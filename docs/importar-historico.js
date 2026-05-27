// docs/importar-historico.js
// Extrai histórico de pedidos de todos os xlsx de coleções e gera SQL para as tabelas hist_*.
//
// Uso:
//   node docs/importar-historico.js > docs/historico-seed.sql 2>docs/historico-log.txt
//
// ─── ESTRUTURA DOS XLSX (dois formatos detectados) ────────────────────────────
//
// FORMATO MODERNO (2019+) — detectado quando row[10][0] ≠ 'referencia':
//   Row 0:  [Fornecedor:, NOME, , , Vendedor:, VENDEDOR]
//   Row 4:  [Frete, TIPO, , , Crédito:, ICMS_PCT]
//   Row 6:  [Desc. X%,  fator_desconto]  ← fator de desconto composto (ex: 0.39225)
//   Row 10: nomes das lojas (col 7, depois a cada 20 cols: 27, 47, 67, 87, 107, 127, 147)
//   Row 11: ["Ref","Produto","Grade","Classe","ICMS","Valor unitário","Valor líquido","T1","","T2","",...]
//   Row 12+: itens [ref, tipo_prod, tipo_grade, classe, icms, val_unit, val_liq,
//             (tamanho1,qty1, tamanho2,qty2, ... ×10 por loja)]
//   Fim de itens: quando row[r][0] é vazio/0 E row[r][1] é vazio
//
// FORMATO LEGADO (2015-2018) — detectado quando row[10][0].lower === 'referencia':
//   Row 8:  nomes das lojas (na coluna correspondente ao primeiro tamanho de cada loja)
//   Row 9:  (opcional) quantidades mínimas ou vazio
//   Row 10: header dos itens [Referencia, Produto, (ICMS,) R$ un., R$ Liq., TAM1, TAM2, ...]
//   Row 11+: itens [ref, produto, (icms,) val_unit, val_liq, qty_tam1, qty_tam2, ...]
//   Obs: sem Grade/Classe → só gera hist_fornecedor e hist_comprador_fornecedor

const xlsx = require('xlsx')
const fs   = require('fs')
const path = require('path')

const BASE = 'C:\\Users\\eduke\\Solução Compras\\Pedidos'

const COLECOES = [
  '2015-1','2015-2','2016-1','2016-2','2017-1','2017-2',
  '2018-1','2018-2','2019-1','2019-2','2020-1','2020-2',
  '2021-1','2021-2','2022-1','2022-2','2023-1','2023-2',
  '2024-1','2024-2','2025-1','2025-2','2026-1','2026-2',
]

// FMV deve aparecer ANTES de Streit (ambos têm 'streit' no nome)
const LOJA_MAP = [
  { id: 8, patterns: [/fmv/i] },
  { id: 7, patterns: [/streit/i] },
  { id: 1, patterns: [/backes/i, /irm[aã]os/i, /\bib\b/i] },
  { id: 2, patterns: [/samuel/i, /\bsam\b/i] },
  { id: 3, patterns: [/psm/i, /peterson/i] },
  { id: 4, patterns: [/alexandre/i, /\balex\b/i] },
  { id: 5, patterns: [/elisangela/i, /elisa/i] },
  { id: 6, patterns: [/\brafael/i, /\braf\b/i] },
]

function mapLoja(nome) {
  const n = String(nome ?? '').trim()
  if (!n) return null
  for (const { id, patterns } of LOJA_MAP)
    if (patterns.some(p => p.test(n))) return id
  return null
}

// Heurística de estação para segmentacoes (sem Grade/Classe não há dados suficientes)
function produtoEstacao(tipoProduto) {
  if (/jaqueta|agasalho|moletom|cardigan|vest|casaco|suet[eê]/i.test(tipoProduto))
    return 'inverno'
  return 'verao'
}

function esc(s) { return String(s ?? '').replace(/'/g, "''") }
function num(v, dec = 2) {
  const n = parseFloat(v)
  return isNaN(n) ? 0 : parseFloat(n.toFixed(dec))
}

// ── Agregadores ──────────────────────────────────────────────────────────────
// Chave usa '|' como separador (seguro para nossos dados)
const segmentacoesMap    = new Map()  // segKey → {classificacao, tipo_produto, classe, tipo_grade, estacao}
const fornecedoresMap    = new Map()  // FORNECEDOR_NOME_UPPER → nome original
const histFornecedor     = new Map()  // 'colecao|forn' → {total_bruto, total_liquido, refs: Set}
const histComprForn      = new Map()  // 'colecao|comprador_id|forn' → {total_bruto, total_liquido}
const histComprProduto   = new Map()  // 'colecao|comprador_id|segKey' → {qtd_total, valor_total}
const histGrade          = new Map()  // 'colecao|segKey|tamanho' → qtd_total

let totalFiles = 0
let totalItems = 0
let legacyFiles = 0
const unmapped = new Set()

function segKey(classificacao, tipo_produto, classe, tipo_grade) {
  return `${classificacao}|${tipo_produto}|${classe}|${tipo_grade}`
}

// ── Processamento de arquivo MODERNO (2019+) ─────────────────────────────────
function processarModerno(rows, colecao, fornNome) {
  // Detectar lojas da linha 10 (col 7, depois +20)
  const lojaRow = rows[10] ?? []
  const lojas = []
  for (let c = 7; c < lojaRow.length; c += 20) {
    const nome = String(lojaRow[c] ?? '').trim()
    if (!nome) continue
    const comprador_id = mapLoja(nome)
    if (!comprador_id) unmapped.add(`${colecao}/${fornNome} col${c}: "${nome}"`)
    lojas.push({ comprador_id, startCol: c, nome })
  }

  if (!lojas.length) {
    process.stderr.write(`WARN ${colecao}/${fornNome}: nenhuma loja detectada (moderna)\n`)
    return
  }

  // Itens a partir da linha 12
  const fornHfKey   = `${colecao}|${fornNome}`
  const refs = new Set()

  for (let r = 12; r < rows.length; r++) {
    const row = rows[r]
    const refRaw  = String(row[0] ?? '').trim()
    const tipoProd = String(row[1] ?? '').trim().toUpperCase()

    // Fim dos itens: ref vazio/zero E tipo_produto vazio
    if ((!refRaw || refRaw === '0') && !tipoProd) break
    if (!tipoProd) continue

    const tipoGrade = String(row[2] ?? '').trim().toUpperCase()
    const classe    = String(row[3] ?? '').trim().toUpperCase()
    const valUnit   = num(row[5])
    const valLiq    = num(row[6])

    if (!tipoGrade || !classe) continue
    if (valUnit <= 0 && valLiq <= 0) continue

    refs.add(refRaw)
    totalItems++

    const sk    = segKey('CONFECCOES', tipoProd, classe, tipoGrade)
    const estac = produtoEstacao(tipoProd)
    if (!segmentacoesMap.has(sk))
      segmentacoesMap.set(sk, { classificacao: 'CONFECCOES', tipo_produto: tipoProd, classe, tipo_grade: tipoGrade, estacao: estac })

    for (const { comprador_id, startCol, nome: lojaNome } of lojas) {
      let qtdLoja = 0
      const tamanhos = []

      for (let pair = 0; pair < 10; pair++) {
        const tc  = startCol + pair * 2
        const tam = String(row[tc] ?? '').trim()
        const qty = parseInt(row[tc + 1] ?? 0) || 0
        if (tam && tam !== '--' && tam !== '0' && qty > 0) {
          qtdLoja += qty
          tamanhos.push({ tam, qty })
        }
      }

      if (qtdLoja === 0) continue

      const bruto = qtdLoja * valUnit
      const liq   = qtdLoja * (valLiq > 0 ? valLiq : valUnit)

      // hist_fornecedor (por arquivo)
      const hf = histFornecedor.get(fornHfKey) ?? { total_bruto: 0, total_liquido: 0, refs: new Set() }
      hf.total_bruto  += bruto
      hf.total_liquido += liq
      hf.refs.add(refRaw)
      histFornecedor.set(fornHfKey, hf)

      if (!comprador_id) continue

      // hist_comprador_fornecedor
      const hcfKey = `${colecao}|${comprador_id}|${fornNome}`
      const hcf    = histComprForn.get(hcfKey) ?? { total_bruto: 0, total_liquido: 0 }
      hcf.total_bruto  += bruto
      hcf.total_liquido += liq
      histComprForn.set(hcfKey, hcf)

      // hist_comprador_produto
      const hcpKey = `${colecao}|${comprador_id}|${sk}`
      const hcp    = histComprProduto.get(hcpKey) ?? { qtd_total: 0, valor_total: 0 }
      hcp.qtd_total  += qtdLoja
      hcp.valor_total += liq
      histComprProduto.set(hcpKey, hcp)

      // hist_grade (agregado de TODOS os compradores)
      for (const { tam, qty } of tamanhos) {
        const hgKey = `${colecao}|${sk}|${tam}`
        histGrade.set(hgKey, (histGrade.get(hgKey) ?? 0) + qty)
      }
    }
  }
}

// ── Processamento de arquivo LEGADO (2015-2018) ──────────────────────────────
function processarLegado(rows, colecao, fornNome) {
  legacyFiles++

  const headerRow = rows[10] ?? []

  // Encontrar índice de val_unit e val_liq pelo rótulo
  const lRaw = headerRow.map(v => String(v).trim().toLowerCase())
  const valUnitCol = lRaw.findIndex(v => v.includes('un.') || v.includes('unit'))
  const valLiqCol  = lRaw.findIndex((v, i) => i > (valUnitCol ?? 0) && (v.includes('liq') || v.includes('líq')))
  const firstSizeCol = valLiqCol >= 0 ? valLiqCol + 1 : (valUnitCol >= 0 ? valUnitCol + 1 : -1)

  if (firstSizeCol < 0) {
    process.stderr.write(`SKIP LEGADO ${colecao}/${fornNome}: não detectou cols de valor\n`)
    return
  }

  // Lojas de Row 8 — detectar nomes não-numéricos em colunas >= firstSizeCol
  const lojaRow8 = rows[8] ?? []
  const lojas = []
  for (let c = firstSizeCol; c < lojaRow8.length; c++) {
    const nome = String(lojaRow8[c] ?? '').trim()
    if (nome && !/^\d+$/.test(nome) && nome.length > 2) {
      const comprador_id = mapLoja(nome)
      if (!comprador_id) unmapped.add(`${colecao}/${fornNome} (leg) col${c}: "${nome}"`)
      // Calcular número de colunas desta loja = distância até próxima loja
      const nextLojaCol = lojaRow8.findIndex((v, i) => i > c && String(v).trim().length > 2 && !/^\d+$/.test(String(v).trim()))
      const colsPerLoja = nextLojaCol > c ? nextLojaCol - c : headerRow.length - c
      lojas.push({ comprador_id, startCol: c, colsPerLoja, nome })
      c = nextLojaCol > c ? nextLojaCol - 1 : lojaRow8.length
    }
  }

  if (!lojas.length) {
    process.stderr.write(`WARN LEGADO ${colecao}/${fornNome}: nenhuma loja detectada\n`)
    return
  }

  // Tamanho labels por loja (de row 10, no bloco de colunas da loja)
  const sizeLabelsPerLoja = lojas.map(({ startCol, colsPerLoja }) => {
    const labels = []
    for (let c = startCol; c < startCol + colsPerLoja; c++) {
      const lbl = String(headerRow[c] ?? '').trim()
      if (lbl && !/^0+$/.test(lbl)) labels.push({ col: c, lbl })
    }
    return labels
  })

  const fornHfKey = `${colecao}|${fornNome}`

  for (let r = 11; r < rows.length; r++) {
    const row = rows[r]
    const refRaw  = String(row[0] ?? '').trim()
    const tipoProd = String(row[1] ?? '').trim().toUpperCase()
    if ((!refRaw || refRaw === '0') && !tipoProd) break
    if (!tipoProd) continue

    const valUnit = num(row[valUnitCol] ?? 0)
    const valLiq  = num(row[valLiqCol]  ?? 0)
    if (valUnit <= 0) continue

    totalItems++

    for (let li = 0; li < lojas.length; li++) {
      const { comprador_id } = lojas[li]
      const sizeLabels = sizeLabelsPerLoja[li]
      let qtdLoja = 0

      for (const { col } of sizeLabels) {
        qtdLoja += parseInt(row[col] ?? 0) || 0
      }
      if (qtdLoja === 0) continue

      const bruto = qtdLoja * valUnit
      const liq   = qtdLoja * (valLiq > 0 ? valLiq : valUnit)

      // hist_fornecedor
      const hf = histFornecedor.get(fornHfKey) ?? { total_bruto: 0, total_liquido: 0, refs: new Set() }
      hf.total_bruto  += bruto
      hf.total_liquido += liq
      hf.refs.add(refRaw)
      histFornecedor.set(fornHfKey, hf)

      if (!comprador_id) continue

      // hist_comprador_fornecedor
      const hcfKey = `${colecao}|${comprador_id}|${fornNome}`
      const hcf    = histComprForn.get(hcfKey) ?? { total_bruto: 0, total_liquido: 0 }
      hcf.total_bruto  += bruto
      hcf.total_liquido += liq
      histComprForn.set(hcfKey, hcf)

      // (sem hist_grade / hist_comprador_produto para formato legado — sem Grade/Classe)
    }
  }
}

// ── Loop principal ────────────────────────────────────────────────────────────
for (const colecao of COLECOES) {
  const colDir = path.join(BASE, colecao)
  if (!fs.existsSync(colDir)) {
    process.stderr.write(`SKIP ${colecao}: diretório não encontrado\n`)
    continue
  }

  const files = fs.readdirSync(colDir)
    .filter(f => /\.xlsx$/i.test(f) && !f.startsWith('~$'))

  for (const fname of files) {
    const fpath = path.join(colDir, fname)
    let wb
    try { wb = xlsx.readFile(fpath, { cellDates: false, sheetRows: 280 }) }
    catch (e) { process.stderr.write(`ERROR ${colecao}/${fname}: ${e.message}\n`); continue }

    const sheetName = wb.SheetNames.find(n => /^pedido$/i.test(n)) ?? wb.SheetNames[0]
    if (!sheetName) { process.stderr.write(`SKIP ${colecao}/${fname}: nenhuma aba\n`); continue }

    const ws   = wb.Sheets[sheetName]
    const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' })

    if (rows.length < 12) {
      process.stderr.write(`SKIP ${colecao}/${fname}: poucas linhas (${rows.length})\n`)
      continue
    }

    const fornNome = String(rows[0]?.[1] ?? '').trim().toUpperCase()
    if (!fornNome || fornNome.length < 2) {
      process.stderr.write(`SKIP ${colecao}/${fname}: fornecedor vazio\n`)
      continue
    }
    fornecedoresMap.set(fornNome, fornNome)

    // Detectar formato pelo conteúdo de row 10, col 0
    const r10_0 = String(rows[10]?.[0] ?? '').trim().toLowerCase()
    const formato = r10_0.startsWith('ref') ? 'legado' : 'moderno'

    if (formato === 'moderno') processarModerno(rows, colecao, fornNome)
    else                       processarLegado(rows, colecao, fornNome)

    totalFiles++
  }
}

// ── Relatório de diagnóstico ──────────────────────────────────────────────────
process.stderr.write('\n' + '='.repeat(60) + '\n')
process.stderr.write(`Total arquivos:        ${totalFiles} (${legacyFiles} legados, ${totalFiles - legacyFiles} modernos)\n`)
process.stderr.write(`Total itens:           ${totalItems}\n`)
process.stderr.write(`Segmentações:          ${segmentacoesMap.size}\n`)
process.stderr.write(`Fornecedores:          ${fornecedoresMap.size}\n`)
process.stderr.write(`hist_fornecedor:       ${histFornecedor.size}\n`)
process.stderr.write(`hist_comprador_forn:   ${histComprForn.size}\n`)
process.stderr.write(`hist_comprador_prod:   ${histComprProduto.size}\n`)
process.stderr.write(`hist_grade:            ${histGrade.size}\n`)
if (unmapped.size) {
  process.stderr.write('\nLOJAS NÃO MAPEADAS:\n')
  for (const u of unmapped) process.stderr.write(`  ${u}\n`)
}
process.stderr.write('='.repeat(60) + '\n')

// ── Geração do SQL ────────────────────────────────────────────────────────────
const out = []
out.push('-- historico-seed.sql — gerado por docs/importar-historico.js')
out.push('-- NÃO commitar este arquivo; aplicar via Supabase SQL Editor em lotes\n')

// 1. segmentacoes
out.push('-- ════════════════ segmentacoes ════════════════')
for (const [, s] of segmentacoesMap) {
  out.push(
    `INSERT INTO segmentacoes (classificacao, tipo_produto, classe, tipo_grade, estacao)` +
    ` VALUES ('${esc(s.classificacao)}','${esc(s.tipo_produto)}','${esc(s.classe)}','${esc(s.tipo_grade)}','${esc(s.estacao)}')` +
    ` ON CONFLICT (classificacao, tipo_produto, classe, tipo_grade) DO NOTHING;`
  )
}

// 2. fornecedores (garantir existência mínima)
out.push('\n-- ════════════════ fornecedores ════════════════')
for (const [, nome] of fornecedoresMap) {
  out.push(
    `INSERT INTO fornecedores (nome, categoria) VALUES ('${esc(nome)}','CONFECCOES')` +
    ` ON CONFLICT (nome) DO NOTHING;`
  )
}

// 3. hist_fornecedor
out.push('\n-- ════════════════ hist_fornecedor ════════════════')
for (const [key, hf] of histFornecedor) {
  const [colecao, fornNome] = key.split('|')
  out.push(
    `INSERT INTO hist_fornecedor (colecao_id, fornecedor_id, total_bruto, total_liquido, num_referencias)` +
    ` SELECT '${esc(colecao)}', id, ${num(hf.total_bruto)}, ${num(hf.total_liquido)}, ${hf.refs.size}` +
    ` FROM fornecedores WHERE nome='${esc(fornNome)}'` +
    ` ON CONFLICT (colecao_id, fornecedor_id) DO UPDATE SET` +
    ` total_bruto=EXCLUDED.total_bruto, total_liquido=EXCLUDED.total_liquido, num_referencias=EXCLUDED.num_referencias;`
  )
}

// 4. hist_comprador_fornecedor
out.push('\n-- ════════════════ hist_comprador_fornecedor ════════════════')
for (const [key, hcf] of histComprForn) {
  const [colecao, comprador_id, fornNome] = key.split('|')
  out.push(
    `INSERT INTO hist_comprador_fornecedor (colecao_id, comprador_id, fornecedor_id, total_bruto, total_liquido)` +
    ` SELECT '${esc(colecao)}', ${comprador_id}, id, ${num(hcf.total_bruto)}, ${num(hcf.total_liquido)}` +
    ` FROM fornecedores WHERE nome='${esc(fornNome)}'` +
    ` ON CONFLICT (colecao_id, comprador_id, fornecedor_id) DO UPDATE SET` +
    ` total_bruto=EXCLUDED.total_bruto, total_liquido=EXCLUDED.total_liquido;`
  )
}

// 5. hist_comprador_produto (somente formato moderno)
out.push('\n-- ════════════════ hist_comprador_produto ════════════════')
for (const [key, hcp] of histComprProduto) {
  // key: colecao|comprador_id|classificacao|tipo_produto|classe|tipo_grade
  const parts = key.split('|')
  const colecao      = parts[0]
  const comprador_id = parts[1]
  const [classificacao, tipo_produto, classe, tipo_grade] = parts.slice(2)
  out.push(
    `INSERT INTO hist_comprador_produto (colecao_id, comprador_id, segmentacao_id, qtd_total, valor_total)` +
    ` SELECT '${esc(colecao)}', ${comprador_id}, id, ${hcp.qtd_total}, ${num(hcp.valor_total)}` +
    ` FROM segmentacoes WHERE classificacao='${esc(classificacao)}' AND tipo_produto='${esc(tipo_produto)}' AND classe='${esc(classe)}' AND tipo_grade='${esc(tipo_grade)}'` +
    ` ON CONFLICT (colecao_id, comprador_id, segmentacao_id) DO UPDATE SET` +
    ` qtd_total=EXCLUDED.qtd_total, valor_total=EXCLUDED.valor_total;`
  )
}

// 6. hist_grade (somente formato moderno, soma de TODOS os compradores)
out.push('\n-- ════════════════ hist_grade ════════════════')
for (const [key, qtd] of histGrade) {
  // key: colecao|classificacao|tipo_produto|classe|tipo_grade|tamanho
  const parts = key.split('|')
  const colecao  = parts[0]
  const tamanho  = parts[parts.length - 1]
  const [classificacao, tipo_produto, classe, tipo_grade] = parts.slice(1, -1)
  out.push(
    `INSERT INTO hist_grade (colecao_id, segmentacao_id, tamanho, qtd_total_comprada)` +
    ` SELECT '${esc(colecao)}', id, '${esc(tamanho)}', ${qtd}` +
    ` FROM segmentacoes WHERE classificacao='${esc(classificacao)}' AND tipo_produto='${esc(tipo_produto)}' AND classe='${esc(classe)}' AND tipo_grade='${esc(tipo_grade)}'` +
    ` ON CONFLICT (colecao_id, segmentacao_id, tamanho) DO UPDATE SET qtd_total_comprada=EXCLUDED.qtd_total_comprada;`
  )
}

console.log(out.join('\n'))

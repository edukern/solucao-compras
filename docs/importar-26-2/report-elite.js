// report-elite.js — RELATÓRIO READ-ONLY (não grava nada).
// Compara a planilha Elite (Formato A) com o que já está no Bolt (colecao 1),
// lado a lado por (loja, referência-base), expondo:
//   - peças na planilha vs peças no Bolt
//   - quais "apelidos" (sufixos EX/cor) o Bolt usa para a mesma ref-base
//   - grade detectada de cada lado
// Saída: console (resumo) + out/report-elite.csv (detalhe).

const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')
const { makeClient, fetchBoltColecao } = require('./lib/db')
const { detectarGrade } = require('./lib/grades')
const { ABAS_A } = require('./lib/lojas')

const COLECAO_ID = 1
const FORNECEDOR_ELITE = 32
const ARQUIVO = path.resolve(__dirname, '..', '..', 'Pedidos', '26-2-import', 'Elite 28-05-26.xlsx')
const OUT = path.resolve(__dirname, 'out')

const refBase = r => String(r ?? '').trim().split(/[\s_]/)[0]

// --- parse Formato A (T/Q intercalado), espelhando importar-elite.js ---
function acharHeader(rows) {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const c0 = String((rows[i] || [])[0] ?? '').trim().toLowerCase()
    if (c0 === 'referencia' || c0 === 'referência') return i
  }
  return -1
}

function parseAbaA(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' })
  const h = acharHeader(rows)
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
    itens.push({ referencia: ref, produto, grade, pecas: soma, tipo_grade: g.tipo_grade })
  }
  return itens
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })

  // 1) Planilha → agrega por (comprador, ref_base)
  const wb = XLSX.readFile(ARQUIVO, { cellDates: false })
  const plan = new Map() // key cid|base → { pecas, grades:Set, refs:Set }
  for (const [aba, cid] of Object.entries(ABAS_A)) {
    const ws = wb.Sheets[aba]
    if (!ws) continue
    for (const it of parseAbaA(ws)) {
      const k = `${cid}|${refBase(it.referencia)}`
      if (!plan.has(k)) plan.set(k, { cid, base: refBase(it.referencia), pecas: 0, grades: new Set(), refs: new Set() })
      const e = plan.get(k)
      e.pecas += it.pecas
      if (it.tipo_grade) e.grades.add(it.tipo_grade)
      e.refs.add(it.referencia)
    }
  }

  // 2) Bolt → agrega por (comprador, ref_base)
  const bolt = await fetchBoltColecao(client, COLECAO_ID)
  const sForn = new Map(bolt.sessoes.map(s => [s.id, s.fornecedor_id]))
  const vForn = new Map(bolt.visitas.map(v => [v.id, sForn.get(v.sessao_id)]))
  const bo = new Map()
  for (const p of bolt.pedidos) {
    if (vForn.get(p.visita_id) !== FORNECEDOR_ELITE) continue
    const k = `${p.comprador_id}|${refBase(p.referencia)}`
    if (!bo.has(k)) bo.set(k, { cid: p.comprador_id, base: refBase(p.referencia), pecas: 0, grades: new Set(), refs: new Set() })
    const e = bo.get(k)
    const soma = (p.itens || []).reduce((a, it) => a + (it.qtd || 0), 0)
    e.pecas += soma
    const g = detectarGrade((p.itens || []).map(it => it.tamanho))
    if (g.tipo_grade) e.grades.add(g.tipo_grade)
    e.refs.add(p.referencia)
  }

  // 3) Join
  const keys = new Set([...plan.keys(), ...bo.keys()])
  const rows = []
  for (const k of keys) {
    const p = plan.get(k), b = bo.get(k)
    const cid = (p || b).cid, base = (p || b).base
    let status
    if (p && !b) status = 'SO_PLANILHA'
    else if (!p && b) status = 'SO_BOLT'
    else if (p.pecas === b.pecas) status = 'OK_PECAS'
    else status = 'DIVERGENTE'
    rows.push({
      comprador_id: cid, ref_base: base, status,
      pecas_planilha: p ? p.pecas : 0, pecas_bolt: b ? b.pecas : 0,
      grade_planilha: p ? [...p.grades].join('/') : '',
      grade_bolt: b ? [...b.grades].join('/') : '',
      refs_bolt: b ? [...b.refs].join(' ; ') : '',
    })
  }
  rows.sort((a, b) => a.comprador_id - b.comprador_id || String(a.ref_base).localeCompare(String(b.ref_base)))

  // CSV
  const head = 'comprador_id,ref_base,status,pecas_planilha,pecas_bolt,grade_planilha,grade_bolt,refs_bolt'
  const csv = [head, ...rows.map(r => [r.comprador_id, r.ref_base, r.status, r.pecas_planilha, r.pecas_bolt, r.grade_planilha, r.grade_bolt, r.refs_bolt]
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
  fs.writeFileSync(path.join(OUT, 'report-elite.csv'), csv)

  // Resumo
  const cont = {}
  for (const r of rows) cont[r.status] = (cont[r.status] || 0) + 1
  const pecasPlan = rows.reduce((a, r) => a + r.pecas_planilha, 0)
  const pecasBolt = rows.reduce((a, r) => a + r.pecas_bolt, 0)
  console.log('=== RELATÓRIO ELITE (read-only) ===')
  console.log('Linhas (loja x ref-base):', rows.length)
  console.table(cont)
  console.log('Peças totais  → planilha:', pecasPlan, '| bolt:', pecasBolt)
  // por loja
  const porLoja = {}
  for (const r of rows) {
    porLoja[r.comprador_id] = porLoja[r.comprador_id] || { plan: 0, bolt: 0 }
    porLoja[r.comprador_id].plan += r.pecas_planilha
    porLoja[r.comprador_id].bolt += r.pecas_bolt
  }
  console.log('\nPeças por loja (comprador_id):')
  console.table(porLoja)
  console.log('\nCSV detalhado:', path.join(OUT, 'report-elite.csv'))
}

const { client } = makeClient()
main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })

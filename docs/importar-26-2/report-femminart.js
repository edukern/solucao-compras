// report-femminart.js — VALIDAÇÃO DE AMOSTRA read-only do FEMMINART (Formato B).
// Mostra: cada aba -> loja mapeada, total de peças, e 3 refs de amostra com a grade,
// + cruzamento com a coluna "Quant" da planilha (oráculo de total por linha).

const path = require('path')
const XLSX = require('xlsx')
const { parsePlanilha } = require('./lib/parse-planilha')
const { mapAba } = require('./lib/lojas')

const ARQ = path.resolve(__dirname, '..', '..', 'Pedidos', '26-2-import', 'FEMMINART 09-06-26.xlsx')
const NOME_LOJA = { 1: 'Backes Art', 2: 'Backes Prog 1', 3: 'Backes Prog 2', 4: 'Rafael Filial 2', 5: 'Rafael Filial 1', 6: 'Rafael J. Backes', 7: 'Streit Conf', 8: 'FMV Streit Conf' }

const wb = XLSX.readFile(ARQ, { cellDates: false })
console.log('Abas do arquivo:', wb.SheetNames.join(' | '))
console.log('\n=== MAPEAMENTO aba -> loja (CONFIRMAR pessoa->loja) ===')
for (const sn of wb.SheetNames) {
  const cid = mapAba(sn)
  console.log(`  "${sn}"`.padEnd(20), '->', cid != null ? `loja ${cid} (${NOME_LOJA[cid]})` : '(ignorada)')
}

const r = parsePlanilha(ARQ)
console.log('\n=== PEÇAS POR LOJA (parser) ===')
const porLoja = {}
for (const it of r.itens) porLoja[it.comprador_id] = (porLoja[it.comprador_id] || 0) + it.pecas
for (const [cid, p] of Object.entries(porLoja)) console.log(`  loja ${cid} (${NOME_LOJA[cid]}):`, p, 'peças')
console.log('  TOTAL:', Object.values(porLoja).reduce((a, b) => a + b, 0))

console.log('\n=== AMOSTRA: 3 primeiras refs por loja (ref | grade | peças | quant_oraculo) ===')
const porLojaItens = {}
for (const it of r.itens) (porLojaItens[it.comprador_id] ||= []).push(it)
for (const cid of Object.keys(porLojaItens).sort((a, b) => a - b)) {
  console.log(`\n  -- loja ${cid} (${NOME_LOJA[cid]}) --`)
  for (const it of porLojaItens[cid].slice(0, 3)) {
    const grade = Object.entries(it.grade).map(([t, q]) => `${t}:${q}`).join(' ')
    console.log(`     ${it.referencia} | ${it.produto} | ${it.tipo_grade} | ${grade} | soma=${it.pecas}${it.quant_oraculo != null ? ' | Quant=' + it.quant_oraculo : ''}`)
  }
}

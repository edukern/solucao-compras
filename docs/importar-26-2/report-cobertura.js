// report-cobertura.js — RELATÓRIO READ-ONLY (não grava nada).
// Para cada arquivo: peças na planilha vs peças no Bolt (colecao 1), por fornecedor.
// Status: JA_IMPORTADO (peças batem) | GAP_TOTAL (0 no bolt) | PARCIAL | SEM_CADASTRO.

const fs = require('fs')
const path = require('path')
const { makeClient, fetchBoltColecao } = require('./lib/db')
const { parsePlanilha } = require('./lib/parse-planilha')
const { COLECAO_ID } = require('./lib/colecao')
const DIR = path.resolve(__dirname, '..', '..', 'Pedidos', '26-2-import')
const OUT = path.resolve(__dirname, 'out')
const norm = s => String(s ?? '').trim().toUpperCase().replace(/\s+/g, ' ')

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const { client } = makeClient()

  const { data: forns } = await client.from('fornecedores').select('id, nome')
  const fornPorNome = new Map(forns.map(f => [norm(f.nome), f.id]))

  // Bolt: peças por fornecedor_id na coleção 1
  const bolt = await fetchBoltColecao(client, COLECAO_ID)
  const sForn = new Map(bolt.sessoes.map(s => [s.id, s.fornecedor_id]))
  const vForn = new Map(bolt.visitas.map(v => [v.id, sForn.get(v.sessao_id)]))
  const boltPecasPorForn = {}
  for (const p of bolt.pedidos) {
    const fid = vForn.get(p.visita_id)
    const soma = (p.itens || []).reduce((a, it) => a + (it.qtd || 0), 0)
    boltPecasPorForn[fid] = (boltPecasPorForn[fid] || 0) + soma
  }

  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
  const rows = []
  for (const f of files) {
    let r
    try { r = parsePlanilha(path.join(DIR, f)) }
    catch (e) { rows.push({ arquivo: f, formato: '?', fornecedor: '(erro)', fid: '', pecas_planilha: 0, pecas_bolt: 0, status: 'ERRO_PARSE', obs: e.message }); continue }
    const pecasPlan = Object.values(r.totaisPorLoja).reduce((a, b) => a + b, 0)
    const fid = fornPorNome.get(norm(r.fornecedor_nome))
    const pecasBolt = fid != null ? (boltPecasPorForn[fid] || 0) : 0
    let status
    if (fid == null) status = 'SEM_CADASTRO'
    else if (pecasBolt === 0 && pecasPlan > 0) status = 'GAP_TOTAL'
    else if (pecasBolt === pecasPlan) status = 'JA_IMPORTADO'
    else status = 'PARCIAL'
    rows.push({
      arquivo: r.arquivo, formato: r.formato, fornecedor: r.fornecedor_nome,
      fid: fid ?? '', pecas_planilha: pecasPlan, pecas_bolt: pecasBolt, status,
      obs: r.abasExtras.length ? ('extras:' + r.abasExtras.join('/')) : '',
    })
  }
  rows.sort((a, b) => a.status.localeCompare(b.status) || a.fornecedor.localeCompare(b.fornecedor))

  const head = 'arquivo,formato,fornecedor,fornecedor_id,pecas_planilha,pecas_bolt,status,obs'
  const csv = [head, ...rows.map(r => [r.arquivo, r.formato, r.fornecedor, r.fid, r.pecas_planilha, r.pecas_bolt, r.status, r.obs]
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
  fs.writeFileSync(path.join(OUT, 'report-cobertura.csv'), csv)

  const cont = {}
  for (const r of rows) cont[r.status] = (cont[r.status] || 0) + 1
  console.log('=== COBERTURA (read-only) — ', files.length, 'arquivos ===')
  console.table(cont)
  console.log('\n--- detalhe por arquivo ---')
  console.table(rows.map(r => ({ fornecedor: r.fornecedor, fmt: r.formato, plan: r.pecas_planilha, bolt: r.pecas_bolt, status: r.status, obs: r.obs })))
  console.log('CSV:', path.join(OUT, 'report-cobertura.csv'))
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })

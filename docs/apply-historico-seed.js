/**
 * apply-historico-seed.js
 * Reads historico-seed-backup.sql, resolves FK IDs locally,
 * and applies all inserts via supabase-js in batches.
 *
 * Prereq: RLS must be disabled on hist_* tables (migration 008).
 * Run:    node docs/apply-historico-seed.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs   = require('fs')
const path = require('path')

const SUPABASE_URL  = 'https://bhxpkysueyoblizkvomb.supabase.co'
const SUPABASE_ANON = 'sb_publishable_Pe-o7iG5jjV0n0qTTKQI-Q_DUZ8-tHm'
const SQL_FILE      = path.join(__dirname, 'historico-seed-backup.sql')
const BATCH_SIZE    = 200

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Regex patterns ───────────────────────────────────────────────────────────
const RE_SEG   = /INSERT INTO segmentacoes [^)]+\) VALUES \('([^']+)','([^']+)','([^']+)','([^']+)','([^']+)'\)/
const RE_FORN  = /INSERT INTO fornecedores [^)]+\) VALUES \('([^']*?)','([^']+)'\)/
const RE_HFORN = /INSERT INTO hist_fornecedor [^)]+\) SELECT '([^']+)', id, ([^,]+), ([^,]+), (\d+) FROM fornecedores WHERE nome='([^']+)'/
const RE_HCF   = /INSERT INTO hist_comprador_fornecedor [^)]+\) SELECT '([^']+)', (\d+), id, ([^,]+), ([^ ]+) FROM fornecedores WHERE nome='([^']+)'/
const RE_HCP   = /INSERT INTO hist_comprador_produto [^)]+\) SELECT '([^']+)', (\d+), id, ([^,]+), ([^ ]+) FROM segmentacoes WHERE classificacao='([^']+)' AND tipo_produto='([^']+)' AND classe='([^']+)' AND tipo_grade='([^']+)'/
const RE_HG    = /INSERT INTO hist_grade [^)]+\) SELECT '([^']+)', id, '([^']+)', (\d+) FROM segmentacoes WHERE classificacao='([^']+)' AND tipo_produto='([^']+)' AND classe='([^']+)' AND tipo_grade='([^']+)'/

// ── Helpers ──────────────────────────────────────────────────────────────────
async function fetchAll(table, select) {
  let all = []
  let from = 0
  const pageSize = 1000
  while (true) {
    const { data, error } = await supabase
      .from(table).select(select).range(from, from + pageSize - 1)
    if (error) throw new Error(`fetchAll ${table}: ${error.message}`)
    if (!data || data.length === 0) break
    all = all.concat(data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return all
}

async function upsertBatch(table, rows, onConflict, ignore) {
  if (rows.length === 0) return
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict, ignoreDuplicates: ignore })
  if (error) {
    console.error(`  ERROR ${table}: ${error.message}`)
    console.error('  Sample:', JSON.stringify(rows[0]))
  }
}

async function flushBatch(section, rows) {
  if (rows.length === 0) return
  process.stdout.write(`  flush ${rows.length} rows → ${section}...`)
  switch (section) {
    case 'segmentacoes':
      await upsertBatch('segmentacoes', rows, 'classificacao,tipo_produto,classe,tipo_grade', true); break
    case 'fornecedores':
      await upsertBatch('fornecedores', rows, 'nome', true); break
    case 'hist_fornecedor':
      await upsertBatch('hist_fornecedor', rows, 'colecao_id,fornecedor_id', false); break
    case 'hist_comprador_fornecedor':
      await upsertBatch('hist_comprador_fornecedor', rows, 'colecao_id,comprador_id,fornecedor_id', false); break
    case 'hist_comprador_produto':
      await upsertBatch('hist_comprador_produto', rows, 'colecao_id,comprador_id,segmentacao_id', false); break
    case 'hist_grade':
      await upsertBatch('hist_grade', rows, 'colecao_id,segmentacao_id,tamanho', false); break
  }
  console.log(' ok')
}

// ── Parse one INSERT line into a row object ───────────────────────────────────
function parseLine(trimmed, section, fornMap, segMap) {
  let m
  if (section === 'segmentacoes') {
    m = trimmed.match(RE_SEG)
    if (!m) return null
    return { classificacao: m[1], tipo_produto: m[2], classe: m[3], tipo_grade: m[4], estacao: m[5] }
  }
  if (section === 'fornecedores') {
    m = trimmed.match(RE_FORN)
    if (!m) return null
    return { nome: m[1], categoria: m[2] }
  }
  if (section === 'hist_fornecedor') {
    m = trimmed.match(RE_HFORN)
    if (!m) return null
    const fid = fornMap.get(m[5])
    if (fid == null) return 'SKIP'
    return { colecao_id: m[1], fornecedor_id: fid, total_bruto: parseFloat(m[2]), total_liquido: parseFloat(m[3]), num_referencias: parseInt(m[4]) }
  }
  if (section === 'hist_comprador_fornecedor') {
    m = trimmed.match(RE_HCF)
    if (!m) return null
    const fid = fornMap.get(m[5])
    if (fid == null) return 'SKIP'
    return { colecao_id: m[1], comprador_id: parseInt(m[2]), fornecedor_id: fid, total_bruto: parseFloat(m[3]), total_liquido: parseFloat(m[4]) }
  }
  if (section === 'hist_comprador_produto') {
    m = trimmed.match(RE_HCP)
    if (!m) return null
    const sid = segMap.get(`${m[6]}|${m[7]}|${m[8]}`)
    if (sid == null) return 'SKIP'
    return { colecao_id: m[1], comprador_id: parseInt(m[2]), segmentacao_id: sid, qtd_total: parseFloat(m[3]), valor_total: parseFloat(m[4]) }
  }
  if (section === 'hist_grade') {
    m = trimmed.match(RE_HG)
    if (!m) return null
    const sid = segMap.get(`${m[5]}|${m[6]}|${m[7]}`)
    if (sid == null) return 'SKIP'
    return { colecao_id: m[1], segmentacao_id: sid, tamanho: m[2], qtd_total_comprada: parseInt(m[3]) }
  }
  return null
}

// ── Parse SQL file, keeping only the requested sections ──────────────────────
function* iterLines(sections) {
  const lines = fs.readFileSync(SQL_FILE, 'utf8').split('\n')
  let section = null
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('-- ═')) {
      if      (t.includes('hist_comprador_produto'))    section = 'hist_comprador_produto'
      else if (t.includes('hist_comprador_fornecedor')) section = 'hist_comprador_fornecedor'
      else if (t.includes('hist_fornecedor'))           section = 'hist_fornecedor'
      else if (t.includes('hist_grade'))                section = 'hist_grade'
      else if (t.includes('segmentacoes'))              section = 'segmentacoes'
      else if (t.includes('fornecedores'))              section = 'fornecedores'
      else section = null
      continue
    }
    if (!section || !sections.includes(section)) continue
    if (!t.startsWith('INSERT')) continue
    yield [section, t]
  }
}

async function applyPhase(sections, fornMap, segMap) {
  let section = null
  let batch   = []
  const stats = {}
  let skipped = 0

  for (const [sec, t] of iterLines(sections)) {
    if (sec !== section) {
      if (section && batch.length > 0) { await flushBatch(section, batch); batch = [] }
      section = sec
      console.log(`\n--- Section: ${section}`)
    }

    let row
    try { row = parseLine(t, section, fornMap, segMap) }
    catch (e) { console.error('PARSE ERR:', e.message, t.substring(0, 100)); skipped++; continue }

    if (!row)           { skipped++; continue }
    if (row === 'SKIP') { skipped++; continue }

    stats[section] = (stats[section] || 0) + 1
    batch.push(row)
    if (batch.length >= BATCH_SIZE) { await flushBatch(section, batch); batch = [] }
  }
  if (section && batch.length > 0) await flushBatch(section, batch)
  return { stats, skipped }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== apply-historico-seed.js ===')
  const t0 = Date.now()

  // PHASE 1: Insert base tables (segmentacoes + fornecedores) — no FK lookups needed
  console.log('\n=== PHASE 1: base tables ===')
  const p1 = await applyPhase(['segmentacoes', 'fornecedores'], new Map(), new Map())

  // Re-fetch reference maps now that base tables are populated
  console.log('\nFetching fornecedores for FK resolution...')
  const fornecedores = await fetchAll('fornecedores', 'id,nome')
  const fornMap = new Map(fornecedores.map(f => [f.nome, f.id]))
  console.log(`  ${fornecedores.length} loaded`)

  console.log('Fetching segmentacoes for FK resolution...')
  const segmentacoes = await fetchAll('segmentacoes', 'id,tipo_produto,classe,tipo_grade')
  const segMap = new Map(segmentacoes.map(s => [`${s.tipo_produto}|${s.classe}|${s.tipo_grade}`, s.id]))
  console.log(`  ${segmentacoes.length} loaded`)

  // PHASE 2: Insert hist tables using resolved FK maps
  console.log('\n=== PHASE 2: hist tables ===')
  const HIST = ['hist_fornecedor', 'hist_comprador_fornecedor', 'hist_comprador_produto', 'hist_grade']
  const p2 = await applyPhase(HIST, fornMap, segMap)

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log('\n=== DONE ===')
  const allStats = Object.assign({}, p1.stats, p2.stats)
  console.log('Rows by section:', JSON.stringify(allStats, null, 2))
  console.log('Skipped phase1:', p1.skipped, '  phase2:', p2.skipped)
  console.log(`Elapsed: ${elapsed}s`)
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1) })

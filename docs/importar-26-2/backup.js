// backup.js — SNAPSHOT read-only da coleção 1 (e segmentacoes) para JSON em disco.
// Não grava nada no banco. Cria out/backup-<timestamp>/ com um arquivo por tabela.
// Rede de segurança reversível antes de qualquer --apply.
//
// Uso: node backup.js
//
// Complemento: as tabelas-snapshot SQL (*_backup_2622) são criadas à parte no
// Supabase (CREATE TABLE ... AS SELECT). Este script é a cópia portátil em disco.

const fs = require('fs')
const path = require('path')
const { makeClient, fetchBoltColecao } = require('./lib/db')

const COLECAO_ID = 1

async function fetchPage(client, table, select, filterCol, idChunk) {
  // Paginação defensiva por range (PostgREST corta em 1000).
  const out = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    let q = client.from(table).select(select).range(from, from + PAGE - 1)
    if (filterCol && idChunk) q = q.in(filterCol, idChunk)
    const { data, error } = await q
    if (error) throw error
    out.push(...data)
    if (data.length < PAGE) break
  }
  return out
}

// Busca tudo; quando filtra por uma lista de ids, fatia o IN (URL estoura com milhares).
async function fetchAll(client, table, select, filterCol, filterVals) {
  if (!filterCol) return fetchPage(client, table, select)
  const out = []
  const IDS = 200
  for (let i = 0; i < filterVals.length; i += IDS) {
    out.push(...await fetchPage(client, table, select, filterCol, filterVals.slice(i, i + IDS)))
  }
  return out
}

async function main() {
  const { client, usingServiceRole } = makeClient()
  if (!usingServiceRole) {
    console.error('ERRO: backup exige service_role (RLS bloqueia leitura completa). Configure SUPABASE_SERVICE_KEY no .env.local.')
    process.exit(1)
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = path.resolve(__dirname, 'out', `backup-${ts}`)
  fs.mkdirSync(dir, { recursive: true })

  // Estrutura da coleção 1: sessoes → visitas → pedidos → pedido_itens
  const { sessoes, visitas, pedidos } = await fetchBoltColecao(client, COLECAO_ID)
  const visitaIds = visitas.map(v => v.id)
  const pedidoIds = pedidos.map(p => p.id)

  // pedido_itens completos (não só o agregado que fetchBoltColecao traz embutido)
  const pedidoItens = pedidoIds.length
    ? await fetchAll(client, 'pedido_itens', 'id, pedido_id, tamanho, qtd, updated_at', 'pedido_id', pedidoIds)
    : []

  // pedidos completos (todas as colunas), não só as do fetch resumido
  const pedidosFull = visitaIds.length
    ? await fetchAll(client, 'pedidos', '*', 'visita_id', visitaIds)
    : []

  // segmentacoes inteiras (compartilhadas entre coleções — backup global)
  const segmentacoes = await fetchAll(client, 'segmentacoes', '*')

  const dump = {
    'sessoes.json': sessoes,
    'visitas.json': visitas,
    'pedidos.json': pedidosFull,
    'pedido_itens.json': pedidoItens,
    'segmentacoes.json': segmentacoes,
  }
  for (const [file, data] of Object.entries(dump)) {
    fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 0))
  }

  const totalPecas = pedidoItens.reduce((s, it) => s + (it.qtd || 0), 0)
  const manifest = {
    timestamp: ts,
    colecao_id: COLECAO_ID,
    counts: {
      sessoes: sessoes.length,
      visitas: visitas.length,
      pedidos: pedidosFull.length,
      pedido_itens: pedidoItens.length,
      segmentacoes: segmentacoes.length,
      total_pecas: totalPecas,
    },
  }
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  console.log('=== BACKUP (read-only) coleção', COLECAO_ID, '===')
  console.table(manifest.counts)
  console.log('Gravado em:', dir)
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })

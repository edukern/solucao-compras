const { createClient } = require('@supabase/supabase-js')
const { loadEnv } = require('./env')

function makeClient() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY
  const key = serviceKey || env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Faltam VITE_SUPABASE_URL e uma key no .env.local')
  const client = createClient(url, key, { auth: { persistSession: false } })
  return { client, usingServiceRole: !!serviceKey }
}

// Lê todas as sessoes→visitas→pedidos→itens de uma coleção, em memória.
async function fetchBoltColecao(client, colecaoId) {
  const { data: sessoes, error: e1 } = await client
    .from('sessoes').select('id, fornecedor_id, data_visita, colecao_id')
    .eq('colecao_id', colecaoId)
  if (e1) throw e1
  const sessaoIds = sessoes.map(s => s.id)
  if (!sessaoIds.length) return { sessoes, visitas: [], pedidos: [] }

  const { data: visitas, error: e2 } = await client
    .from('visitas').select('id, sessao_id, comprador_id').in('sessao_id', sessaoIds)
  if (e2) throw e2
  const visitaIds = visitas.map(v => v.id)
  if (!visitaIds.length) return { sessoes, visitas, pedidos: [] }

  // Paginação defensiva: pedidos podem passar de 1000 (limite default do PostgREST).
  const pedidos = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client
      .from('pedidos')
      .select('id, visita_id, comprador_id, referencia, variante_key, valor_unitario, itens:pedido_itens(tamanho, qtd)')
      .in('visita_id', visitaIds)
      .range(from, from + PAGE - 1)
    if (error) throw error
    pedidos.push(...data)
    if (data.length < PAGE) break
  }
  return { sessoes, visitas, pedidos }
}

module.exports = { makeClient, fetchBoltColecao }

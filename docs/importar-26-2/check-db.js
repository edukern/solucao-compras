const { makeClient, fetchBoltColecao } = require('./lib/db')
const { COLECAO_ID } = require('./lib/colecao')

async function main() {
  const { client, usingServiceRole } = makeClient()
  console.log('Key em uso:', usingServiceRole ? 'service_role (bypassa RLS)' : 'anon (sujeito a RLS)')

  const { sessoes, visitas, pedidos } = await fetchBoltColecao(client, COLECAO_ID)
  const totalPecas = pedidos.reduce((acc, p) =>
    acc + (p.itens || []).reduce((s, it) => s + (it.qtd || 0), 0), 0)

  console.log(`Coleção ${COLECAO_ID}:`)
  console.log('  sessões :', sessoes.length, '(fornecedores distintos:', new Set(sessoes.map(s => s.fornecedor_id)).size, ')')
  console.log('  visitas :', visitas.length)
  console.log('  pedidos :', pedidos.length)
  console.log('  peças   :', totalPecas)
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })

const { sb } = require('./_rh-lib')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id } = req.query || {}
  if (!id) return res.status(400).json({ error: 'id obrigatório.' })

  try {
    const { data } = await sb().get(
      `vagas?id=eq.${id}&status=eq.aberta&select=id,titulo,descricao,local,empresa_id,empresas(nome)&limit=1`
    )
    if (!data[0]) return res.status(404).json({ error: 'Vaga não encontrada ou encerrada.' })
    const v = data[0]
    return res.json({
      id:           v.id,
      titulo:       v.titulo,
      descricao:    v.descricao || null,
      local:        v.local || null,
      empresa_nome: v.empresas?.nome || null,
    })
  } catch (err) {
    console.error('[vaga-publica] GET:', err.message)
    return res.status(500).json({ error: 'Erro ao buscar vaga.' })
  }
}

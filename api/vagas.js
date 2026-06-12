const { authenticate, sb } = require('./_rh-lib')

module.exports = async function handler(req, res) {
  const session = authenticate(req)
  if (!session) return res.status(401).json({ error: 'Não autenticado.' })

  const { empresa_id } = session
  const client = sb()

  if (req.method === 'GET') {
    try {
      const { id } = req.query || {}
      if (id) {
        const { data } = await client.get(`vagas?id=eq.${id}&empresa_id=eq.${empresa_id}&select=*&limit=1`)
        if (!data[0]) return res.status(404).json({ error: 'Vaga não encontrada.' })
        return res.json(data[0])
      }
      const { data } = await client.get(`vagas?empresa_id=eq.${empresa_id}&order=criado_em.desc&select=*,candidaturas(count)`)
      return res.json(data)
    } catch (err) {
      console.error('[vagas] GET:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao buscar vagas.' })
    }
  }

  if (req.method === 'POST') {
    const { titulo, descricao, local, status } = req.body || {}
    if (!titulo) return res.status(400).json({ error: 'Título obrigatório.' })
    try {
      const { data } = await client.post('vagas', {
        empresa_id, titulo, descricao: descricao || null, local: local || null,
        status: status || 'aberta',
      })
      return res.json(data[0])
    } catch (err) {
      console.error('[vagas] POST:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao criar vaga.' })
    }
  }

  if (req.method === 'PATCH') {
    const { id, titulo, descricao, local, status } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id obrigatório.' })
    try {
      const body = { atualizado_em: new Date().toISOString() }
      if (titulo    !== undefined) body.titulo    = titulo
      if (descricao !== undefined) body.descricao = descricao
      if (local     !== undefined) body.local     = local
      if (status    !== undefined) body.status    = status
      const { data } = await client.patch(`vagas?id=eq.${id}&empresa_id=eq.${empresa_id}`, body)
      return res.json(data[0])
    } catch (err) {
      console.error('[vagas] PATCH:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao atualizar vaga.' })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {}
    if (!id) return res.status(400).json({ error: 'id obrigatório.' })
    try {
      await client.delete(`vagas?id=eq.${id}&empresa_id=eq.${empresa_id}`)
      return res.json({ ok: true })
    } catch (err) {
      console.error('[vagas] DELETE:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao excluir vaga.' })
    }
  }

  res.status(405).end()
}

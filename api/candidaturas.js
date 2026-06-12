const { authenticate, sb } = require('./_rh-lib')

module.exports = async function handler(req, res) {
  const session = authenticate(req)
  if (!session) return res.status(401).json({ error: 'Não autenticado.' })

  const { empresa_id } = session
  const client = sb()

  if (req.method === 'GET') {
    const { vaga_id, candidato_id } = req.query || {}
    let url = `candidaturas?empresa_id=eq.${empresa_id}&order=atualizado_em.desc`
    if (vaga_id)      url += `&vaga_id=eq.${vaga_id}`
    if (candidato_id) url += `&candidato_id=eq.${candidato_id}`
    url += '&select=*,candidatos(id,nome,cpf,email,telefone)'
    try {
      const { data } = await client.get(url)
      return res.json(data)
    } catch (err) {
      console.error('[candidaturas] GET:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao buscar candidaturas.' })
    }
  }

  if (req.method === 'POST') {
    const { vaga_id, candidato_id, etapa, notas } = req.body || {}
    if (!vaga_id || !candidato_id) {
      return res.status(400).json({ error: 'vaga_id e candidato_id são obrigatórios.' })
    }
    try {
      const { data } = await client.post('candidaturas', {
        empresa_id, vaga_id, candidato_id,
        etapa: etapa || 'triagem',
        notas: notas || null,
      })
      return res.json(data[0])
    } catch (err) {
      if (err.response?.data?.code === '23505') {
        return res.status(409).json({ error: 'Candidato já inscrito nesta vaga.' })
      }
      console.error('[candidaturas] POST:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao criar candidatura.' })
    }
  }

  if (req.method === 'PATCH') {
    const { id, etapa, notas } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id obrigatório.' })
    try {
      const body = { atualizado_em: new Date().toISOString() }
      if (etapa !== undefined) body.etapa = etapa
      if (notas !== undefined) body.notas = notas
      const { data } = await client.patch(
        `candidaturas?id=eq.${id}&empresa_id=eq.${empresa_id}`,
        body
      )
      return res.json(data[0])
    } catch (err) {
      console.error('[candidaturas] PATCH:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao atualizar candidatura.' })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {}
    if (!id) return res.status(400).json({ error: 'id obrigatório.' })
    try {
      await client.delete(`candidaturas?id=eq.${id}&empresa_id=eq.${empresa_id}`)
      return res.json({ ok: true })
    } catch (err) {
      console.error('[candidaturas] DELETE:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao excluir candidatura.' })
    }
  }

  res.status(405).end()
}

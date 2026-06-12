const { authenticate, sb, auditLog } = require('./_rh-lib')
const { tryEncrypt, tryDecrypt, tryHmac } = require('./_rh-crypto')

function decCandidato(c) {
  if (!c) return c
  return { ...c, cpf: tryDecrypt(c.cpf) }
}

module.exports = async function handler(req, res) {
  const session = authenticate(req)
  if (!session) return res.status(401).json({ error: 'Não autenticado.' })

  const { empresa_id, id: usuario_id } = session
  const client = sb()

  if (req.method === 'GET') {
    const { id, q } = req.query || {}
    try {
      if (id) {
        const [{ data: arr }, { data: candidaturas }, { data: checks }] = await Promise.all([
          client.get(`candidatos?id=eq.${id}&empresa_id=eq.${empresa_id}&select=*&limit=1`),
          client.get(`candidaturas?candidato_id=eq.${id}&empresa_id=eq.${empresa_id}&select=*,vagas(id,titulo)&order=atualizado_em.desc`),
          client.get(`background_checks?candidato_id=eq.${id}&empresa_id=eq.${empresa_id}&order=criado_em.desc&limit=5&select=id,cpf,status,restricao,resumo_texto,criado_em,expira_em`),
        ])
        if (!arr[0]) return res.status(404).json({ error: 'Candidato não encontrado.' })
        return res.json({ ...decCandidato(arr[0]), candidaturas, checks })
      }

      // Busca: se q parece CPF (só dígitos), busca por hash; senão busca por nome
      let url = `candidatos?empresa_id=eq.${empresa_id}&order=criado_em.desc`
      if (q) {
        const cleaned = q.replace(/\D/g, '')
        if (cleaned.length === 11) {
          const h = tryHmac(cleaned)
          if (h) url += `&cpf_hash=eq.${h}`
        } else {
          url += `&nome=ilike.*${encodeURIComponent(q)}*`
        }
      }
      const { data } = await client.get(url)
      return res.json(data.map(decCandidato))
    } catch (err) {
      console.error('[candidatos] GET:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao buscar candidatos.' })
    }
  }

  if (req.method === 'POST') {
    const { nome, cpf: cpfRaw, email, telefone } = req.body || {}
    const cpf      = cpfRaw ? cpfRaw.replace(/\D/g, '') : null
    const cpf_enc  = tryEncrypt(cpf)
    const cpf_hash = tryHmac(cpf)
    try {
      const { data } = await client.post('candidatos', {
        empresa_id,
        nome:     nome     || null,
        cpf:      cpf_enc,
        cpf_hash,
        email:    email    || null,
        telefone: telefone || null,
      })
      return res.json(decCandidato(data[0]))
    } catch (err) {
      if (err.response?.data?.code === '23505') {
        return res.status(409).json({ error: 'CPF já cadastrado para esta empresa.' })
      }
      console.error('[candidatos] POST:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao criar candidato.' })
    }
  }

  if (req.method === 'PATCH') {
    const { id, nome, cpf: cpfRaw, email, telefone } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id obrigatório.' })
    try {
      const body = {}
      if (nome     !== undefined) body.nome     = nome
      if (cpfRaw   !== undefined) {
        const cpf      = cpfRaw?.replace(/\D/g, '') || null
        body.cpf       = tryEncrypt(cpf)
        body.cpf_hash  = tryHmac(cpf)
      }
      if (email    !== undefined) body.email    = email
      if (telefone !== undefined) body.telefone = telefone
      const { data } = await client.patch(`candidatos?id=eq.${id}&empresa_id=eq.${empresa_id}`, body)
      return res.json(decCandidato(data[0]))
    } catch (err) {
      console.error('[candidatos] PATCH:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao atualizar candidato.' })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query || {}
    if (!id) return res.status(400).json({ error: 'id obrigatório.' })
    try {
      await client.delete(`candidatos?id=eq.${id}&empresa_id=eq.${empresa_id}`)
      return res.json({ ok: true })
    } catch (err) {
      console.error('[candidatos] DELETE:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao excluir candidato.' })
    }
  }

  res.status(405).end()
}

// LGPD Art. 18 — Direito ao esquecimento / exclusão total de dados de um candidato.
// DELETE /api/rh-apagar-candidato?id={candidato_id}
// Apaga: candidaturas, curriculos, background_checks e o candidato em si.
const { authenticate, sb, auditLog } = require('./_rh-lib')

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const session = authenticate(req)
  if (!session) return res.status(401).json({ error: 'Não autenticado.' })

  const { id } = req.query || {}
  if (!id) return res.status(400).json({ error: 'id do candidato obrigatório.' })

  const { empresa_id } = session
  const client = sb()

  // Confirma que o candidato pertence à empresa (prevenção de IDOR)
  try {
    const { data } = await client.get(`candidatos?id=eq.${id}&empresa_id=eq.${empresa_id}&select=id&limit=1`)
    if (!data[0]) return res.status(404).json({ error: 'Candidato não encontrado.' })
  } catch {
    return res.status(500).json({ error: 'Erro ao verificar candidato.' })
  }

  try {
    // Cascade via FK remove candidaturas, curriculos, background_checks automaticamente
    // mas fazemos explícito para clareza de auditoria
    await Promise.all([
      client.delete(`background_checks?candidato_id=eq.${id}&empresa_id=eq.${empresa_id}`),
      client.delete(`curriculos?candidato_id=eq.${id}&empresa_id=eq.${empresa_id}`),
      client.delete(`candidaturas?candidato_id=eq.${id}&empresa_id=eq.${empresa_id}`),
    ])
    await client.delete(`candidatos?id=eq.${id}&empresa_id=eq.${empresa_id}`)

    auditLog(req, session, 'apagar_candidato_lgpd', { alvo_id: id })

    return res.json({ ok: true, mensagem: 'Todos os dados do candidato foram removidos.' })
  } catch (err) {
    console.error('[rh-apagar] erro:', err.message, err.response?.data)
    return res.status(500).json({ error: 'Erro ao apagar dados.' })
  }
}

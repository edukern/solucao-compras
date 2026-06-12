const bcrypt = require('bcryptjs')
const { signToken, setCookieHeader, authenticate, sb } = require('./_rh-lib')

module.exports = async function handler(req, res) {
  // GET — verificar sessão
  if (req.method === 'GET') {
    const session = authenticate(req)
    if (!session) return res.status(401).json({ error: 'Não autenticado.' })
    try {
      const { data } = await sb().get(`usuarios?id=eq.${session.id}&select=id,nome,email,empresa_id&limit=1`)
      const user = data[0]
      if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' })
      return res.json({ user })
    } catch (err) {
      console.error('[auth-rh] GET error:', err.message)
      return res.status(500).json({ error: 'Erro ao verificar sessão.' })
    }
  }

  // POST — login
  if (req.method === 'POST') {
    const { email, senha } = req.body || {}
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios.' })

    try {
      const emailNorm = email.toLowerCase().trim()
      const { data } = await sb().get(
        `usuarios?email=eq.${encodeURIComponent(emailNorm)}&select=id,nome,email,senha_hash,empresa_id&limit=1`
      )
      const user = data[0]

      if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
        return res.status(401).json({ error: 'Email ou senha incorretos.' })
      }

      const token  = signToken({ id: user.id, empresa_id: user.empresa_id })
      const cookie = setCookieHeader('hr_session', token)
      res.setHeader('Set-Cookie', cookie)
      return res.json({ user: { id: user.id, nome: user.nome, email: user.email, empresa_id: user.empresa_id } })
    } catch (err) {
      console.error('[auth-rh] POST error:', err.message, err.response?.data)
      return res.status(500).json({ error: 'Erro ao fazer login.' })
    }
  }

  // DELETE — logout
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', setCookieHeader('hr_session', '', { clear: true }))
    return res.json({ ok: true })
  }

  res.status(405).end()
}

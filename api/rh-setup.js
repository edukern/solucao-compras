// Bootstrap: cria a primeira empresa + usuário admin.
// Protegido por RH_ACCESS_KEY. Só funciona se a tabela empresas estiver vazia.
const bcrypt = require('bcryptjs')
const { sb } = require('./_rh-lib')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { accessKey, empresa: empresaNome, email, nome, senha } = req.body || {}

  if (!process.env.RH_ACCESS_KEY || accessKey !== process.env.RH_ACCESS_KEY) {
    return res.status(401).json({ error: 'Acesso negado.' })
  }
  if (!empresaNome || !email || !nome || !senha) {
    return res.status(400).json({ error: 'empresa, email, nome e senha são obrigatórios.' })
  }

  const client = sb()

  try {
    const { data: existing } = await client.get('empresas?select=id&limit=1')
    if (existing?.length > 0) {
      return res.status(409).json({ error: 'Setup já realizado. Empresa já existe.' })
    }

    const { data: empresaArr } = await client.post('empresas', { nome: empresaNome })
    const empresa = empresaArr[0]

    const senha_hash = await bcrypt.hash(senha, 12)

    const { data: usuarioArr } = await client.post('usuarios', {
      empresa_id: empresa.id,
      email:      email.toLowerCase().trim(),
      nome,
      senha_hash,
    })

    return res.json({ ok: true, empresa_id: empresa.id, usuario_id: usuarioArr[0].id })
  } catch (err) {
    console.error('[rh-setup] erro:', err.message, err.response?.data)
    return res.status(500).json({ error: 'Erro ao criar empresa/usuário.' })
  }
}

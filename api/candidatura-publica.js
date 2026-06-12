const axios = require('axios')
const { sb } = require('./_rh-lib')
const { tryEncrypt, tryHmac } = require('./_rh-crypto')

// Rate limiter local: 5 submissões por IP a cada 24h
const _rl = new Map()
function checkRL(ip) {
  const now = Date.now(), window = 24 * 60 * 60 * 1000, max = 5
  const times = (_rl.get(ip) || []).filter(t => now - t < window)
  if (times.length >= max) return false
  _rl.set(ip, [...times, now])
  return true
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  if (!checkRL(ip)) return res.status(429).json({ error: 'Muitas tentativas. Tente novamente amanhã.' })

  const {
    vaga_id,
    nome, cpf: cpfRaw, email, telefone, cidade,
    data_nascimento, estado_civil, filhos, filhos_qtd,
    facebook, instagram, endereco, deslocamento,
    escolaridade, estudando, curso_prof, curso_prof_qual,
    experiencia, experiencia_desc, conhece_empresa, motivacao,
    curriculo_base64, curriculo_nome, curriculo_mime,
    aceite_lgpd,
  } = req.body || {}

  if (!vaga_id)     return res.status(400).json({ error: 'Vaga inválida.' })
  if (!nome?.trim()) return res.status(400).json({ error: 'Nome obrigatório.' })
  if (!email?.trim()) return res.status(400).json({ error: 'Email obrigatório.' })
  if (!aceite_lgpd)  return res.status(400).json({ error: 'Aceite dos termos obrigatório.' })

  const cpf = cpfRaw ? String(cpfRaw).replace(/\D/g, '') : null
  if (cpf && cpf.length !== 11) return res.status(400).json({ error: 'CPF deve ter 11 dígitos.' })

  const client = sb()

  // Verifica vaga e obtém empresa_id
  let empresa_id
  try {
    const { data } = await client.get(`vagas?id=eq.${vaga_id}&status=eq.aberta&select=id,empresa_id&limit=1`)
    if (!data[0]) return res.status(404).json({ error: 'Vaga não encontrada ou encerrada.' })
    empresa_id = data[0].empresa_id
  } catch {
    return res.status(500).json({ error: 'Erro ao verificar vaga.' })
  }

  // Cria candidato (ou recupera se CPF já existe)
  let candidato_id
  try {
    const { data } = await client.post('candidatos', {
      empresa_id,
      nome:      nome.trim(),
      email:     email.trim().toLowerCase(),
      telefone:  telefone || null,
      cidade:    cidade?.trim() || null,
      cpf:       tryEncrypt(cpf),
      cpf_hash:  tryHmac(cpf),
    })
    candidato_id = data[0]?.id
  } catch (err) {
    if (err.response?.data?.code === '23505' && cpf) {
      const h = tryHmac(cpf)
      const { data } = await client.get(
        `candidatos?empresa_id=eq.${empresa_id}&cpf_hash=eq.${h}&select=id&limit=1`
      ).catch(() => ({ data: [] }))
      candidato_id = data[0]?.id
    }
    if (!candidato_id) {
      console.error('[candidatura-publica] candidato:', err.message)
      return res.status(500).json({ error: 'Erro ao registrar candidato.' })
    }
  }

  // Upload de currículo (opcional)
  let curriculo_path = null
  if (curriculo_base64 && candidato_id) {
    try {
      const buf = Buffer.from(curriculo_base64, 'base64')
      const ext = (curriculo_nome || 'curriculo.pdf').split('.').pop().toLowerCase().slice(0, 4)
      const path = `${empresa_id}/${candidato_id}/curriculo.${ext}`
      await axios.post(
        `${process.env.SUPABASE_URL}/storage/v1/object/curriculos/${path}`,
        buf,
        {
          headers: {
            Authorization:  `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': curriculo_mime || 'application/pdf',
            'x-upsert':     'true',
          },
          maxBodyLength: 5_000_000,
        }
      )
      curriculo_path = path
      await client.post('curriculos', {
        candidato_id, empresa_id,
        storage_path: curriculo_path,
        nome_arquivo: curriculo_nome || `curriculo.${ext}`,
      }).catch(e => console.error('[curriculo] save:', e.message))
    } catch (e) {
      console.error('[curriculo] upload:', e.message)
    }
  }

  // Cria candidatura com formulário completo
  try {
    await client.post('candidaturas', {
      vaga_id, candidato_id, empresa_id,
      etapa: 'triagem',
      formulario: {
        data_nascimento:  data_nascimento || null,
        estado_civil:     estado_civil || null,
        filhos:           filhos || false,
        filhos_qtd:       filhos ? (filhos_qtd || null) : null,
        facebook:         facebook?.trim() || null,
        instagram:        instagram?.trim() || null,
        endereco:         endereco?.trim() || null,
        deslocamento:     deslocamento || null,
        escolaridade:     escolaridade || null,
        estudando:        estudando || false,
        curso_prof:       curso_prof || false,
        curso_prof_qual:  curso_prof ? (curso_prof_qual?.trim() || null) : null,
        experiencia:      experiencia || false,
        experiencia_desc: experiencia ? (experiencia_desc?.trim() || null) : null,
        conhece_empresa:  conhece_empresa?.trim() || null,
        motivacao:        motivacao?.trim() || null,
        curriculo_path,
        aceite_lgpd:      true,
        enviado_em:       new Date().toISOString(),
        ip,
      },
    })
  } catch (err) {
    if (err.response?.data?.code === '23505') {
      return res.status(409).json({ error: 'Você já se candidatou para esta vaga.' })
    }
    console.error('[candidatura-publica] candidatura:', err.message)
    return res.status(500).json({ error: 'Erro ao registrar candidatura.' })
  }

  // Notifica RH por email (Path B — não bloqueia resposta)
  notificarRH({ nome: nome.trim(), email: email.trim(), vaga_id })
    .catch(e => console.error('[email] rh:', e.message))

  // Envia link do PI para o candidato (Path B — se PI_OPEN_LINK configurado)
  if (process.env.PI_OPEN_LINK) {
    enviarPI({ nome: nome.trim(), email: email.trim() })
      .catch(e => console.error('[email] pi:', e.message))
  }

  return res.json({ ok: true, pi_link: process.env.PI_OPEN_LINK || null })
}

async function notificarRH({ nome, email, vaga_id }) {
  if (!process.env.RESEND_API_KEY || !process.env.RH_EMAIL_NOTIFICACAO) return
  const rhUrl = `https://bolt-compras.pages.dev/rh`
  await axios.post('https://api.resend.com/emails', {
    from:    'Ponto E Vagas <vagas@pontoevagas.com.br>',
    to:      [process.env.RH_EMAIL_NOTIFICACAO],
    subject: `Nova candidatura: ${nome}`,
    html:    `<p>Nova candidatura recebida pelo portal.</p>
              <p><strong>Candidato:</strong> ${nome} (${email})</p>
              <p><a href="${rhUrl}">Abrir Bolt RH</a></p>`,
  }, { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` } })
}

async function enviarPI({ nome, email }) {
  if (!process.env.RESEND_API_KEY) return
  await axios.post('https://api.resend.com/emails', {
    from:    'Ponto E Vagas <vagas@pontoevagas.com.br>',
    to:      [email],
    subject: 'Complete seu teste comportamental',
    html:    `<p>Olá, ${nome}!</p>
              <p>Recebemos sua candidatura. Para continuar o processo seletivo, pedimos que você complete o teste comportamental:</p>
              <p><a href="${process.env.PI_OPEN_LINK}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Fazer o teste agora</a></p>
              <p>O teste leva cerca de 10 minutos. Qualquer dúvida, entre em contato.</p>`,
  }, { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` } })
}

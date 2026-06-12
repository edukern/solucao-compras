const { authenticate, sb, auditLog } = require('./_rh-lib')
const { tryEncrypt, tryHmac } = require('./_rh-crypto')
const { consultarBoaVista, consultarSPCBrasil, extrairBoaVista, extrairSPC } = require('./_rh-bureaus')

const RETENCAO_DIAS = 90 // LGPD: dados expiram em 90 dias

async function verificarCPF(cpf) {
  try {
    const [xmlBV, xmlSPC] = await Promise.all([consultarBoaVista(cpf), consultarSPCBrasil(cpf)])
    const [bv, spc] = await Promise.all([extrairBoaVista(xmlBV), extrairSPC(xmlSPC)])
    return { cpf, ok: true, bv, spc, erro: null }
  } catch (err) {
    return { cpf, ok: false, bv: null, spc: null, erro: err.message }
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = authenticate(req)
  if (!session) return res.status(401).json({ error: 'Não autenticado.' })

  const { cpfs, candidato_ids } = req.body || {}
  if (!Array.isArray(cpfs) || cpfs.length === 0) {
    return res.status(400).json({ error: 'cpfs deve ser um array não vazio.' })
  }
  if (cpfs.length > 20) {
    return res.status(400).json({ error: 'Máximo 20 CPFs por batch.' })
  }

  const cleanCpfs = cpfs.map(c => String(c).replace(/\D/g, '')).filter(c => c.length === 11)
  const resultados = await Promise.all(cleanCpfs.map(verificarCPF))

  const expira_em = new Date(Date.now() + RETENCAO_DIAS * 86_400_000).toISOString()
  const client = sb()

  // Salvar no banco (com CPF criptografado + minimização de dados)
  if (Array.isArray(candidato_ids) && candidato_ids.length) {
    await Promise.all(
      resultados.map((r, i) => {
        const cid = candidato_ids[i]
        if (!cid || !r.ok) return null

        // Audit log: registra quem consultou qual CPF (hash, não plain)
        auditLog(req, session, 'background_check', {
          alvo_id:   cid,
          alvo_hash: tryHmac(r.cpf),
        })

        // LGPD: não armazenamos o JSON completo do bureau (minimização)
        // Só salvamos o resumo necessário para a decisão de contratação
        return client.post('background_checks', {
          empresa_id:   session.empresa_id,
          candidato_id: cid,
          cpf:          tryEncrypt(r.cpf),      // CPF cifrado
          status:       'ok',
          restricao:    r.spc?.restricao || false,
          resumo_texto: [
            `Score BV: ${r.bv?.score} (${r.bv?.scoreClassif})`,
            `Score SPC 3m: ${r.spc?.score3m} (${r.spc?.score3mClasse})`,
            `Débitos BV: ${r.bv?.totalDebitos} — R$ ${r.bv?.valorDebitos}`,
            `Protestos BV: ${r.bv?.totalProtestos}`,
            `SPC: ${r.spc?.totalSPC} ocorrência(s) — R$ ${r.spc?.valorSPC}`,
          ].join(' | '),
          // resultado_bv / resultado_spc: não armazenados (minimização de dados LGPD)
          expira_em,    // retenção: expira em 90 dias
        }).catch(e => console.error('[batch] save error:', e.message))
      })
    )
  } else {
    // Batch avulso (sem vínculo com candidato): só audit log
    cleanCpfs.forEach(cpf => auditLog(req, session, 'batch_check_avulso', { alvo_hash: tryHmac(cpf) }))
  }

  // Resposta para o frontend — dados necessários para decisão, sem salvar
  const tabela = resultados.map(r => ({
    cpf:           r.cpf,
    nome:          r.ok ? (r.spc?.nome !== 'N/D' ? r.spc.nome : r.bv?.nome) : 'ERRO',
    restricao:     r.spc?.restricao     || false,
    scoreBV:       r.bv?.score          || 'N/D',
    scoreClassifBV: r.bv?.scoreClassif  || 'N/D',
    score3m:       r.spc?.score3m       || 'N/D',
    score3mClasse: r.spc?.score3mClasse || 'N/D',
    temDebito:     r.bv?.temDebito      || false,
    totalDebitos:  r.bv?.totalDebitos   || '0',
    valorDebitos:  r.bv?.valorDebitos   || '0,00',
    temProtesto:   r.bv?.temProtesto    || false,
    totalProtestos: r.bv?.totalProtestos || '0',
    totalSPC:      r.spc?.totalSPC      || 0,
    valorSPC:      r.spc?.valorSPC      || '0',
    situacaoCPF:   r.bv?.situacaoCPF   || 'N/D',
    erro:          r.erro,
  }))

  res.json(tabela)
}

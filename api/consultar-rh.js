const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx')
const { consultarBoaVista, consultarSPCBrasil, extrairBoaVista, extrairSPC, fmt } = require('./_rh-bureaus')

async function gerarDocx(bv, spc, cpf) {
  const linha = (label, valor) => new Paragraph({
    children: [new TextRun({ text: `${label}: `, bold: true }), new TextRun({ text: String(valor) })],
    spacing: { after: 100 },
  })
  const alerta = (texto, ok) => new Paragraph({
    children: [new TextRun({ text: `${ok ? '✔' : '✘'} ${texto}`, color: ok ? '2E7D32' : 'C62828', bold: true })],
    spacing: { after: 100 },
  })
  const h2 = (texto) => new Paragraph({ text: texto, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 150 } })
  const nomeConsumidor = (spc?.nome && spc.nome !== 'N/D') ? spc.nome : bv.nome

  const children = [
    new Paragraph({ text: 'Relatório de Background Check — RH', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
    new Paragraph({ text: `Gerado em: ${new Date().toLocaleString('pt-BR')}`, spacing: { after: 300 } }),
    h2('Dados Cadastrais'),
    linha('Nome',         nomeConsumidor),
    linha('CPF',          bv.cpf || spc?.cpfNumero || cpf),
    linha('Nascimento',   spc?.nascimento !== 'N/D' ? spc.nascimento : bv.nascimento),
    linha('Mãe',          spc?.nomeMae !== 'N/D' ? spc.nomeMae : bv.mae),
    ...(spc?.nomePai && spc.nomePai !== 'N/D' ? [linha('Pai', spc.nomePai)] : []),
    linha('Estado civil', spc?.estadoCivil || 'N/D'),
    linha('Situação CPF', bv.situacaoCPF === '1' ? 'Regular' : (spc?.cpfSituacao || bv.situacaoCPF)),
    linha('Endereço (BV)',  bv.endereco),
    ...(spc?.endereco ? [linha('Endereço (SPC)', spc.endereco)] : []),
    linha('Telefones', bv.telefones || spc?.telefones || 'N/D'),
    h2('Score — Boa Vista (Cadastro Positivo)'),
    linha('Status',        bv.statusPositivo),
    linha('Score',         `${bv.score} (Classificação ${bv.scoreClassif})`),
    linha('Probabilidade', bv.probabilidade),
    linha('Renda estimada',bv.renda),
    ...(spc ? [
      h2('Score — SPC Brasil'),
      linha('Score 3 meses',          `${spc.score3m} (Classe ${spc.score3mClasse})`),
      linha('Risco Cadastro Positivo', `${spc.scoreCPRisco} (score ${spc.scoreCPValor})`),
    ] : []),
    h2('Resumo de Pendências'),
    alerta('Débitos / Inadimplência — Boa Vista', !bv.temDebito),
    alerta('Protestos — Boa Vista',               !bv.temProtesto),
    alerta('Ações cíveis — Boa Vista',            !bv.temAcao),
    ...(spc ? [
      alerta(`Débitos SPC Brasil (${spc.totalSPC} ocorrência(s) — R$ ${spc.valorSPC})`,          spc.totalSPC === 0),
      alerta(`Protestos SPC Brasil (${spc.totalProtest} ocorrência(s) — R$ ${spc.valorProtest})`, spc.totalProtest === 0),
      alerta(`Pendências financeiras SPC (${spc.totalPend} ocorrência(s) — R$ ${spc.valorPend})`, spc.totalPend === 0),
    ] : []),
    ...(bv.temDebito ? [
      h2(`Débitos Boa Vista — ${bv.totalDebitos} ocorrência(s) | Total: R$ ${bv.valorDebitos}`),
      ...bv.debitos.map(d => linha(`${d.dataOcorrencia} — ${d.informante}`, `R$ ${d.valor} (contrato: ${d.contrato})`))
    ] : []),
    ...(bv.temProtesto ? [
      h2(`Protestos Boa Vista — ${bv.totalProtestos} ocorrência(s) | Total: R$ ${bv.valorProtestos}`),
      ...bv.protestos.map(p => linha(`${p.dataOcorrencia} — ${p.cidade}/${p.uf}`, `R$ ${p.valor}`))
    ] : []),
    ...(spc && spc.totalSPC > 0 ? [
      h2(`Débitos SPC Brasil — ${spc.totalSPC} ocorrência(s) | Total: R$ ${spc.valorSPC}`),
      ...spc.spcDebitos.map(d => linha(`${d.dataInclusao} — ${d.credor}`, `R$ ${d.valor} | venc. ${d.dataVenc} | contrato: ${d.contrato}`))
    ] : []),
    ...(spc && spc.totalProtest > 0 ? [
      h2(`Protestos SPC Brasil — ${spc.totalProtest} ocorrência(s) | Total: R$ ${spc.valorProtest}`),
      ...spc.protestoLista.map(p => linha(`${p.data} — ${p.cidade}/${p.uf}`, `R$ ${p.valor} | Cartório: ${p.cartorio}`))
    ] : []),
  ]

  const doc = new Document({ sections: [{ properties: {}, children }] })
  return Packer.toBuffer(doc)
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { cpf: cpfRaw, accessKey } = req.body || {}

  if (!process.env.RH_ACCESS_KEY || accessKey !== process.env.RH_ACCESS_KEY) {
    return res.status(401).json({ error: 'Acesso negado.' })
  }

  const cpf = (cpfRaw || '').replace(/\D/g, '')
  if (cpf.length !== 11) {
    return res.status(400).json({ error: 'CPF inválido.' })
  }

  try {
    const [xmlBV, xmlSPC] = await Promise.all([
      consultarBoaVista(cpf),
      consultarSPCBrasil(cpf),
    ])

    const [dadosBV, dadosSPC] = await Promise.all([
      extrairBoaVista(xmlBV),
      extrairSPC(xmlSPC),
    ])

    const buffer = await gerarDocx(dadosBV, dadosSPC, cpf)
    const nome   = (dadosSPC.nome !== 'N/D' ? dadosSPC.nome : dadosBV.nome).replace(/\s+/g, '_')

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="RH_${nome}_${cpf}.docx"`)
    res.send(buffer)
  } catch (err) {
    console.error('[rh] erro:', err.message, err.response?.data)
    res.status(500).json({ error: 'Erro ao consultar os bureaus. Tente novamente.' })
  }
}

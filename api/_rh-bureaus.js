const axios  = require('axios')
const xml2js = require('xml2js')

function montarSoapBoaVista(cpf) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultaFamiliaPositivo xmlns="http://sis.spcrs.org.br/webservices/FamiliaPositivo/">
      <codigoEntidade>${process.env.SCPC_ENTIDADE}</codigoEntidade>
      <codigoAssociado>${process.env.SCPC_ASSOCIADO}</codigoAssociado>
      <codigoFilial>${process.env.SCPC_FILIAL}</codigoFilial>
      <senhaAcesso>${process.env.SCPC_SENHA}</senhaAcesso>
      <documento>${cpf}</documento>
      <tipoConsulta>${process.env.SCPC_TIPO}</tipoConsulta>
    </ConsultaFamiliaPositivo>
  </soap:Body>
</soap:Envelope>`
}

function montarSoapSPC(cpf) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:tns="http://webservice.consulta.spcjava.spcbrasil.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:filtro>
      <codigo-produto>1042</codigo-produto>
      <tipo-consumidor>F</tipo-consumidor>
      <documento-consumidor>${cpf}</documento-consumidor>
      <codigo-insumo-opcional>17</codigo-insumo-opcional>
      <codigo-insumo-opcional>55</codigo-insumo-opcional>
      <codigo-insumo-opcional>77</codigo-insumo-opcional>
    </tns:filtro>
  </soapenv:Body>
</soapenv:Envelope>`
}

async function consultarBoaVista(cpf) {
  const resp = await axios.post(process.env.SCPC_URL, montarSoapBoaVista(cpf), {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: 'http://sis.spcrs.org.br/webservices/FamiliaPositivo/ConsultaFamiliaPositivo',
    },
    timeout: 25000,
  })
  return resp.data
}

async function consultarSPCBrasil(cpf) {
  const resp = await axios.post(process.env.SPC_URL, montarSoapSPC(cpf), {
    auth:    { username: process.env.SPC_OPERADOR, password: process.env.SPC_SENHA },
    headers: { 'Content-Type': 'text/xml; charset=UTF-8', SOAPAction: '' },
    timeout: 25000,
  })
  return resp.data
}

async function extrairBoaVista(xmlStr) {
  const parsed = await xml2js.parseStringPromise(xmlStr, { explicitArray: false })
  const body    = parsed['soap:Envelope']?.['soap:Body'] || {}
  const respKey = Object.keys(body)[0]
  const wrapper = body[respKey]?.ConsultaFamiliaPositivoResult || body[respKey] || {}
  const result  = wrapper?.essencial || wrapper?.mais || wrapper?.completo || wrapper || {}
  const ident   = result?.identificacao || {}
  const loc     = result?.localizacao   || {}
  const status  = result?.status_consumidor?.mensagem || 'N/D'
  const scores     = [].concat(result?.score_classificacao_varios_modelos || [])
  const scorePos   = scores.find(s => s?.descricaoNatureza?.includes('POSITIVO')) || {}
  const scoreRenda = scores.find(s => s?.descricaoNatureza?.includes('RENDA'))    || {}
  const debitos    = [].concat(result?.debitos || []).filter(d => d?.registro === 'S')
  const resumoDeb  = result?.resumo_ocorrencias_de_debitos || {}
  const protestos  = [].concat(result?.titulos_protestados || []).filter(p => p?.registro === 'S')
  const resumoProt = result?.resumo_titulos_protestados    || {}
  return {
    nome:           ident?.nome            || 'N/D',
    cpf:            ident?.documento       || '',
    nascimento:     ident?.dataNascimento  || 'N/D',
    mae:            ident?.nomeMae         || 'N/D',
    situacaoCPF:    ident?.situacaoReceita || 'N/D',
    endereco:       `${loc?.tipoLogradouro || ''} ${loc?.nomeLogradouro || ''}, ${loc?.numeroLogradouro || ''} ${loc?.complemento || ''} - ${loc?.bairro || ''}, ${loc?.cidade || ''} - ${loc?.unidadeFederativa || ''}, CEP ${loc?.cep || ''}`.trim(),
    telefones:      [
      loc?.ddd_1 && loc?.telefone_1 ? `(${String(loc.ddd_1).replace(/^0+/,'')}) ${loc.telefone_1}` : null,
      loc?.ddd_2 && loc?.telefone_2 ? `(${String(loc.ddd_2).replace(/^0+/,'')}) ${loc.telefone_2}` : null,
    ].filter(Boolean).join(' | '),
    statusPositivo: status,
    score:          scorePos?.score       || 'N/D',
    scoreClassif:   scorePos?.classificacaoAlfabetica || 'N/D',
    probabilidade:  scorePos?.texto       || 'N/D',
    renda:          scoreRenda?.texto     || 'N/D',
    totalDebitos:   resumoDeb?.totalDevedor     || '0',
    valorDebitos:   resumoDeb?.valorAcomulado   || '0,00',
    debitos,
    totalProtestos: resumoProt?.total     || '0',
    valorProtestos: resumoProt?.valorAcumulado || '0,00',
    protestos,
    temDebito:   resumoDeb?.registro  === 'S',
    temProtesto: resumoProt?.registro === 'S',
    temAcao:     result?.resumo_de_acoes_civeis?.registro === 'S',
  }
}

function fmt(dataIso) {
  if (!dataIso) return 'N/D'
  return dataIso.substring(0, 10).split('-').reverse().join('/')
}

async function extrairSPC(xmlStr) {
  const parsed   = await xml2js.parseStringPromise(xmlStr, { explicitArray: false })
  const resultado = parsed['S:Envelope']?.['S:Body']?.['ns2:resultado'] || {}
  const attrs     = resultado['$'] || {}
  const pf        = resultado?.consumidor?.['consumidor-pessoa-fisica'] || {}
  const pfAttrs   = pf['$'] || {}
  const cpfAttrs  = pf?.cpf?.['$'] || {}
  const sitAttrs  = pf?.['situacao-cpf']?.['$'] || {}
  const end       = pf?.endereco || {}
  const endAttrs  = end['$'] || {}
  const cidAttrs  = end?.cidade?.['$'] || {}
  const ufAttrs   = end?.cidade?.estado?.['$'] || {}
  const telRes    = pf?.['telefone-residencial']?.['$'] || {}
  const telCel    = pf?.['telefone-celular']?.['$'] || {}
  const spcEl     = resultado?.spc || {}
  const spcResumo = spcEl?.resumo?.['$'] || {}
  const spcDebitos = [].concat(spcEl?.['detalhe-spc'] || []).map(d => {
    const a = d['$'] || {}
    return { credor: a['nome-associado']||'N/D', dataInclusao: fmt(a['data-inclusao']), dataVenc: fmt(a['data-vencimento']), valor: a.valor||'0', contrato: a.contrato||'N/D' }
  })
  const protestoEl     = resultado?.protesto || {}
  const protestoResumo = protestoEl?.resumo?.['$'] || {}
  const protestoLista  = [].concat(protestoEl?.['detalhe-protesto'] || []).map(d => {
    const a = d['$'] || {}; const cart = d?.cartorio?.['$']||{}; const cidP = d?.cartorio?.cidade?.['$']||{}; const ufP = d?.cartorio?.cidade?.estado?.['$']||{}
    return { data: fmt(a['data-protesto']), valor: a.valor||'0', cartorio: cart.nome||'N/D', cidade: cidP.nome||'N/D', uf: ufP['sigla-uf']||'' }
  })
  const score3m  = resultado?.['spc-score-3-meses']?.['detalhe-spc-score-3-meses']?.['$'] || {}
  const scoreCP  = resultado?.['score-cadastro-positivo']?.['detalhe-score-cadastro-positivo']?.['$'] || {}
  const pendEl   = resultado?.['pendencia-financeira'] || {}
  const pendRes  = pendEl?.resumo?.['$'] || {}
  return {
    restricao:    attrs.restricao === 'true',
    nome:         pfAttrs.nome||'N/D',
    nascimento:   fmt(pfAttrs['data-nascimento']),
    estadoCivil:  pfAttrs['estado-civil']||'N/D',
    nomeMae:      pfAttrs['nome-mae']||'N/D',
    nomePai:      pfAttrs['nome-pai']||'N/D',
    cpfNumero:    cpfAttrs.numero||'',
    cpfSituacao:  sitAttrs['descricao-situacao']||'N/D',
    endereco:     `${endAttrs.logradouro||''}, ${endAttrs.numero||''} - ${endAttrs.bairro||''}, ${cidAttrs.nome||''} - ${ufAttrs['sigla-uf']||''}, CEP ${endAttrs.cep||''}`.trim(),
    telefones:    [telRes['numero-ddd']?`(${telRes['numero-ddd']}) ${telRes.numero}`:null, telCel['numero-ddd']?`(${telCel['numero-ddd']}) ${telCel.numero}`:null].filter(Boolean).join(' | '),
    totalSPC:     parseInt(spcResumo['quantidade-total']||'0'),
    valorSPC:     spcResumo['valor-total']||'0',
    spcDebitos,
    totalProtest: parseInt(protestoResumo['quantidade-total']||'0'),
    valorProtest: protestoResumo['valor-total']||'0',
    protestoLista,
    totalPend:    parseInt(pendRes['quantidade-total']||'0'),
    valorPend:    pendRes['valor-total']||'0',
    score3m:      score3m.score||'N/D',
    score3mClasse:score3m.classe||'N/D',
    scoreCPRisco: scoreCP['indice-risco-credito-score']||'N/D',
    scoreCPValor: scoreCP.score||'N/D',
  }
}

module.exports = { consultarBoaVista, consultarSPCBrasil, extrairBoaVista, extrairSPC, fmt }

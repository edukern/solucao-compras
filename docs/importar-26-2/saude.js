// saude.js — RELATÓRIO DE SAÚDE read-only do Bolt (coleção 26/2 = colecao_id 1).
// Não grava nada. Roda quando quiser: node saude.js
// Mostra, de uma vez: volume, reconciliação planilha×Bolt por fornecedor,
// e riscos com gravidade (duplicados, divergências, cadastros faltando).
// Gera também out/SAUDE-BOLT.md (legível, pra encaminhar).

const fs = require('fs')
const path = require('path')
const { makeClient, fetchBoltColecao } = require('./lib/db')
const { parsePlanilha, fornecedorDoArquivo } = require('./lib/parse-planilha')

const COLECAO_ID = 1
const DIR = path.resolve(__dirname, '..', '..', 'Pedidos', '26-2-import')
const OUT = path.resolve(__dirname, 'out')

// normaliza sem acento/pontuação (RAKEL`S == RAKELS, BEBÊ == BEBE)
const strip = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '')

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const { client } = makeClient()

  const { data: forns } = await client.from('fornecedores').select('id, nome')
  const bolt = await fetchBoltColecao(client, COLECAO_ID)

  // peças por fornecedor na coleção 1
  const sForn = new Map(bolt.sessoes.map(s => [s.id, s.fornecedor_id]))
  const vForn = new Map(bolt.visitas.map(v => [v.id, sForn.get(v.sessao_id)]))
  const pecasPorForn = {}
  for (const p of bolt.pedidos) {
    const fid = vForn.get(p.visita_id)
    const soma = (p.itens || []).reduce((a, it) => a + (it.qtd || 0), 0)
    pecasPorForn[fid] = (pecasPorForn[fid] || 0) + soma
  }
  const nomeForn = new Map(forns.map(f => [f.id, f.nome]))

  const totalPecasBolt = Object.values(pecasPorForn).reduce((a, b) => a + b, 0)

  // candidatos de fornecedor por nome (accent/punct-insensitive, com prefixo)
  function candidatos(nome) {
    const k = strip(nome)
    const out = []
    for (const f of forns) {
      const fk = strip(f.nome)
      if (fk === k || fk.startsWith(k) || k.startsWith(fk)) out.push(f)
    }
    return [...new Map(out.map(c => [c.id, c])).values()]
  }

  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
  const linhas = []
  for (const file of files) {
    let planPecas = 0, erro = null
    try {
      const r = parsePlanilha(path.join(DIR, file))
      planPecas = Object.values(r.totaisPorLoja).reduce((a, b) => a + b, 0)
    } catch (e) { erro = e.message }
    const nome = fornecedorDoArquivo(file)
    const cands = candidatos(nome)
    const comDados = cands.filter(c => (pecasPorForn[c.id] || 0) > 0)
    const boltPecas = comDados.reduce((a, c) => a + (pecasPorForn[c.id] || 0), 0)

    let status, grav
    if (erro) { status = 'ERRO_LEITURA'; grav = 'ALTO' }
    else if (cands.length === 0) { status = 'FALTA_CADASTRO'; grav = 'BAIXO' }
    else if (boltPecas === 0) { status = 'NAO_IMPORTADO'; grav = 'MEDIO' }
    else if (boltPecas === planPecas && comDados.length === 1 && cands.length === 1) { status = 'OK'; grav = '-' }
    else if (boltPecas === planPecas) { status = 'OK_MAS_DUP'; grav = 'ALTO' }
    else { status = 'DIVERGE'; grav = 'MEDIO' }

    linhas.push({
      arquivo: file, fornecedor: nome, plan: planPecas, bolt: boltPecas,
      diff: boltPecas - planPecas, status, grav,
      cadastros: cands.map(c => `${c.nome}#${c.id}${pecasPorForn[c.id] ? '=' + pecasPorForn[c.id] : ''}`).join(' | '),
      dup: cands.length > 1,
    })
  }

  const ordemStatus = { ERRO_LEITURA: 0, OK_MAS_DUP: 1, DIVERGE: 2, NAO_IMPORTADO: 3, FALTA_CADASTRO: 4, OK: 5 }
  linhas.sort((a, b) => (ordemStatus[a.status] - ordemStatus[b.status]) || a.fornecedor.localeCompare(b.fornecedor))

  const cont = {}
  for (const l of linhas) cont[l.status] = (cont[l.status] || 0) + 1
  const planTotal = linhas.reduce((a, l) => a + l.plan, 0)

  // ── console ──
  console.log('═'.repeat(64))
  console.log('SAÚDE DO BOLT — coleção 26/2 (id', COLECAO_ID + ') —', new Date().toLocaleString('pt-BR'))
  console.log('═'.repeat(64))
  console.log('Volume no Bolt:', bolt.sessoes.length, 'sessões |', bolt.visitas.length, 'visitas |',
    bolt.pedidos.length, 'pedidos |', totalPecasBolt, 'peças')
  console.log('Planilhas (origem):', files.length, 'arquivos |', planTotal, 'peças')
  console.log('\nStatus por arquivo:')
  console.table(cont)
  console.log('\nDetalhe (pior primeiro):')
  console.table(linhas.map(l => ({ fornecedor: l.fornecedor, plan: l.plan, bolt: l.bolt, diff: l.diff, status: l.status, grav: l.grav })))

  // ── markdown ──
  const md = []
  md.push(`# Saúde do Bolt — coleção 26/2`)
  md.push(`_Gerado em ${new Date().toLocaleString('pt-BR')} · read-only, nada foi alterado._\n`)
  md.push(`## Volume`)
  md.push(`- **No Bolt:** ${bolt.sessoes.length} sessões · ${bolt.visitas.length} visitas · ${bolt.pedidos.length} pedidos · **${totalPecasBolt} peças**`)
  md.push(`- **Nas planilhas:** ${files.length} arquivos · ${planTotal} peças\n`)
  md.push(`## Resumo por situação`)
  md.push(`| Situação | Qtd | O que significa |`)
  md.push(`|---|---|---|`)
  const legenda = {
    OK: 'fecha com a planilha, sem duplicado — saudável',
    OK_MAS_DUP: 'fecha, mas há cadastro duplicado (risco de subir em dobro)',
    DIVERGE: 'está no Bolt com total diferente da planilha',
    NAO_IMPORTADO: 'cadastrado mas sem pedidos na coleção',
    FALTA_CADASTRO: 'fornecedor da planilha não existe no cadastro',
    ERRO_LEITURA: 'não consegui ler a planilha',
  }
  for (const [s, n] of Object.entries(cont)) md.push(`| ${s} | ${n} | ${legenda[s] || ''} |`)
  md.push('')
  md.push(`## Riscos a tratar (gravidade)`)
  const alto = linhas.filter(l => l.grav === 'ALTO')
  const medio = linhas.filter(l => l.grav === 'MEDIO')
  md.push(`### 🔴 Alto (${alto.length}) — cadastro duplicado ou erro de leitura`)
  for (const l of alto) md.push(`- **${l.fornecedor}** (${l.status}) — planilha ${l.plan} / Bolt ${l.bolt}. Cadastros: ${l.cadastros}`)
  md.push(`\n### 🟡 Médio (${medio.length}) — divergência ou não importado`)
  for (const l of medio) md.push(`- **${l.fornecedor}** (${l.status}) — planilha ${l.plan} / Bolt ${l.bolt} (diff ${l.diff})`)
  md.push(`\n## Tabela completa`)
  md.push(`| Fornecedor | Planilha | Bolt | Diff | Situação | Cadastros encontrados |`)
  md.push(`|---|---|---|---|---|---|`)
  for (const l of linhas) md.push(`| ${l.fornecedor} | ${l.plan} | ${l.bolt} | ${l.diff} | ${l.status} | ${l.cadastros} |`)
  md.push('')
  const outFile = path.join(OUT, 'SAUDE-BOLT.md')
  fs.writeFileSync(outFile, md.join('\n'))
  console.log('\nRelatório legível:', outFile)
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })

// apply.js — grava UM fornecedor GAP_TOTAL da planilha 26/2 no Bolt (coleção 17 = 26/2).
// DRY-RUN por padrão; só escreve com --apply. Espelha a transformação canônica
// de docs/importar-elite.js (segmentacao por classificacao|tipo_produto|classe|
// tipo_grade, sufixo _tipo_grade em refs multi-grade, valor col23 / preço col27
// no Formato A; Formato B não traz valor/preço → 0).
//
// Uso:
//   node apply.js --fornecedor="FEMMINART"            # dry-run (não grava)
//   node apply.js --fornecedor="FEMMINART" --apply    # grava de verdade
//
// Salvaguardas:
//   - exige service_role (senão RLS bloquearia a escrita silenciosamente)
//   - GAP_TOTAL: aborta se o fornecedor já tiver QUALQUER sessão na coleção alvo
//   - dry-run confere total de peças (parser == payload) antes de liberar --apply

const fs = require('fs')
const path = require('path')
const { makeClient } = require('./lib/db')
const { parsePlanilha, fornecedorDoArquivo } = require('./lib/parse-planilha')
const { COLECAO_ID } = require('./lib/colecao')

const ESTACAO = 'verao' // estação da coleção 1 (colecoes.estacao); segmentacoes.estacao é NOT NULL
const DIR = path.resolve(__dirname, '..', '..', 'Pedidos', '26-2-import')
const NOME_LOJA = { 1: 'Backes Art', 2: 'Backes Prog 1', 3: 'Backes Prog 2', 4: 'Rafael Filial 2', 5: 'Rafael Filial 1', 6: 'Rafael J. Backes', 7: 'Streit Conf', 8: 'FMV Streit Conf' }
const norm = s => String(s ?? '').trim().toUpperCase().replace(/\s+/g, ' ')

// ── args ──────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { apply: false, fornecedor: null, rotuloAcima: false }
  for (const arg of argv.slice(2)) {
    if (arg === '--apply') a.apply = true
    else if (arg === '--rotulo-acima') a.rotuloAcima = true
    else if (arg.startsWith('--fornecedor=')) a.fornecedor = arg.slice('--fornecedor='.length).replace(/^["']|["']$/g, '')
    else { console.error('Argumento desconhecido:', arg); process.exit(1) }
  }
  if (!a.fornecedor) { console.error('Uso: node apply.js --fornecedor="NOME" [--apply]'); process.exit(1) }
  return a
}

// ── transformação (espelho de importar-elite.js) ────────────────────────────────
function parseClasse(produto) {
  if (/\bFEM\b/i.test(produto)) return 'FEM'
  if (/\bMASC\b/i.test(produto)) return 'MASC'
  return 'UNI'
}
function parseTipoProduto(produto) {
  return String(produto || '').toUpperCase()
    .replace(/\b(MASC|FEM|UNI)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'INDEFINIDO'
}
function segKeyOf(it) {
  const classificacao = it.classificacao || 'AD'
  const tipo_grade = it.tipo_grade || 'AD'
  const classe = parseClasse(it.produto)
  const tipo_produto = parseTipoProduto(it.produto)
  return { key: `${classificacao}|${tipo_produto}|${classe}|${tipo_grade}`, classificacao, tipo_produto, classe, tipo_grade }
}

// dd-mm-yy(yy) do nome do arquivo → 'YYYY-MM-DD'
function dataVisitaDoArquivo(arquivo) {
  const m = arquivo.match(/(\d{2})-(\d{2})-(\d{2,4})/)
  if (!m) return null
  let [, dd, mm, yy] = m
  if (yy.length === 2) yy = '20' + yy
  return `${yy}-${mm}-${dd}`
}

function acharArquivo(fornecedor) {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
  const alvo = norm(fornecedor)
  const hit = files.find(f => norm(fornecedorDoArquivo(f)) === alvo)
  if (!hit) { console.error(`Arquivo não encontrado para "${fornecedor}" em ${DIR}`); process.exit(1) }
  return path.join(DIR, hit)
}

// Constrói os pedidos finais a partir dos itens parseados:
//  - sufixa referencia com _tipo_grade quando a (comprador, ref) aparece em >1 grade
//  - funde grades quando (comprador, refFinal) colide (preserva peças; avisa)
function montarPedidos(itens) {
  const warnings = []
  const refCount = new Map()
  for (const it of itens) {
    const k = `${it.comprador_id}|${it.referencia}`
    refCount.set(k, (refCount.get(k) || 0) + 1)
  }
  const map = new Map() // (comprador|refFinal) → pedido
  for (const it of itens) {
    const seg = segKeyOf(it)
    const baseKey = `${it.comprador_id}|${it.referencia}`
    const refFinal = refCount.get(baseKey) > 1 ? `${it.referencia}_${seg.tipo_grade}` : it.referencia
    const k = `${it.comprador_id}|${refFinal}`
    if (map.has(k)) {
      // colisão real (mesma ref+grade p/ mesma loja) → funde grades, soma qtds
      const ex = map.get(k)
      for (const [t, q] of Object.entries(it.grade)) ex.grade[t] = (ex.grade[t] || 0) + q
      ex.pecas += it.pecas
      warnings.push(`Ref fundida comprador=${it.comprador_id} ref=${refFinal} (+${it.pecas} pç)`)
    } else {
      map.set(k, {
        comprador_id: it.comprador_id,
        referencia: refFinal,
        valor_unitario: it.valor_unitario || 0,
        preco_venda: it.preco_venda || 0,
        seg,
        grade: { ...it.grade },
        pecas: it.pecas,
      })
    }
  }
  return { pedidos: [...map.values()], warnings }
}

async function main() {
  const args = parseArgs(process.argv)
  const { client, usingServiceRole } = makeClient()
  if (!usingServiceRole) {
    console.error('ERRO: --apply/dry-run exige service_role. Configure SUPABASE_SERVICE_KEY no .env.local.')
    process.exit(1)
  }

  // 1. arquivo + parser
  const filePath = acharArquivo(args.fornecedor)
  const arquivo = path.basename(filePath)
  const parsed = parsePlanilha(filePath, { rotuloTamanhoB: args.rotuloAcima ? 'acima' : 'header' })
  const data_visita = dataVisitaDoArquivo(arquivo)
  if (!data_visita) { console.error('Não consegui extrair data do nome do arquivo:', arquivo); process.exit(1) }

  // 2. fornecedor_id
  const { data: forns, error: ef } = await client.from('fornecedores').select('id, nome')
  if (ef) throw ef
  const fid = new Map(forns.map(f => [norm(f.nome), f.id])).get(norm(parsed.fornecedor_nome))
  if (fid == null) { console.error(`Fornecedor "${parsed.fornecedor_nome}" não está cadastrado (SEM_CADASTRO). Abortando.`); process.exit(1) }

  // 3. GUARD GAP_TOTAL: o fornecedor não pode ter sessão na coleção 1
  const { data: sessExist, error: es } = await client
    .from('sessoes').select('id').eq('fornecedor_id', fid).eq('colecao_id', COLECAO_ID)
  if (es) throw es
  if (sessExist.length) {
    console.error(`ABORTADO: fornecedor ${fid} já tem ${sessExist.length} sessão(ões) na coleção ${COLECAO_ID} (ids ${sessExist.map(s => s.id).join(',')}). Isto NÃO é GAP_TOTAL — use o fluxo de apagar-e-reinserir, não o apply puro.`)
    process.exit(1)
  }

  // 4. montar pedidos + segmentações
  const { pedidos, warnings } = montarPedidos(parsed.itens)
  const segMap = new Map()
  for (const p of pedidos) if (!segMap.has(p.seg.key)) segMap.set(p.seg.key, p.seg)
  const compradores = [...new Set(pedidos.map(p => p.comprador_id))].sort((a, b) => a - b)
  const totalPares = pedidos.reduce((s, p) => s + Object.keys(p.grade).length, 0)
  const totalPecasPayload = pedidos.reduce((s, p) => s + p.pecas, 0)
  const totalPecasParser = Object.values(parsed.totaisPorLoja).reduce((a, b) => a + b, 0)

  // ── RELATÓRIO ──
  console.log('═'.repeat(64))
  console.log(`${args.apply ? '🟥 APPLY (GRAVA)' : '🟦 DRY-RUN (não grava)'} — ${parsed.fornecedor_nome} [fornecedor_id ${fid}]`)
  console.log('═'.repeat(64))
  console.log('arquivo      :', arquivo, '| formato', parsed.formato)
  console.log('data_visita  :', data_visita)
  console.log('coleção      :', COLECAO_ID, '(estação', ESTACAO + ')')
  if (parsed.formato !== 'A') console.log('rótulo tam.  :', args.rotuloAcima ? 'linha ACIMA do cabeçalho (ex. 46/48/50/52)' : 'cabeçalho (P/M/G/GG) [default]')
  console.log('lojas/visitas:', compradores.map(c => `${c}=${NOME_LOJA[c] || '?'}`).join(', '))
  console.log('segmentações :', segMap.size, '| pedidos:', pedidos.length, '| pares tam/qtd:', totalPares)
  console.log('peças payload :', totalPecasPayload, '| peças parser:', totalPecasParser)
  console.table(compradores.map(c => ({
    loja: `${c} ${NOME_LOJA[c] || ''}`.trim(),
    pedidos: pedidos.filter(p => p.comprador_id === c).length,
    pecas: pedidos.filter(p => p.comprador_id === c).reduce((s, p) => s + p.pecas, 0),
  })))
  if (parsed.abasExtras.length) console.log('⚠ abas extras ignoradas:', parsed.abasExtras.join(', '))
  if (warnings.length) { console.log('\n⚠ avisos:'); for (const w of warnings) console.log('  ', w) }

  // checagem de integridade dura
  if (totalPecasPayload !== totalPecasParser) {
    console.error(`\n❌ DIVERGÊNCIA de peças (payload ${totalPecasPayload} ≠ parser ${totalPecasParser}). Abortando antes de qualquer escrita.`)
    process.exit(1)
  }
  if (!pedidos.length) { console.error('\n❌ 0 pedidos. Nada a fazer.'); process.exit(1) }

  if (!args.apply) {
    console.log('\n✅ DRY-RUN ok. Nada gravado. Rode de novo com --apply para gravar.')
    return
  }

  // ── ESCRITA ──
  console.log('\n→ gravando...')

  // 4a. sessão
  const { data: sRow, error: e1 } = await client.from('sessoes')
    .insert({ fornecedor_id: fid, colecao_id: COLECAO_ID, data_visita }).select('id').single()
  if (e1) throw e1
  const sessao_id = sRow.id
  console.log('  sessão criada id', sessao_id)

  // 4b. visitas (uma por comprador)
  const { data: vRows, error: e2 } = await client.from('visitas')
    .insert(compradores.map(cid => ({ sessao_id, comprador_id: cid }))).select('id, comprador_id')
  if (e2) throw e2
  const visitaPorComprador = new Map(vRows.map(v => [v.comprador_id, v.id]))
  console.log('  visitas criadas:', vRows.length)

  // 4c. segmentações (insert do que faltar; depois lê todas p/ pegar ids)
  const segRows = [...segMap.values()].map(s => ({
    classificacao: s.classificacao, tipo_produto: s.tipo_produto, classe: s.classe, tipo_grade: s.tipo_grade, estacao: ESTACAO,
  }))
  const { error: e3 } = await client.from('segmentacoes')
    .upsert(segRows, { onConflict: 'classificacao,tipo_produto,classe,tipo_grade', ignoreDuplicates: true })
  if (e3) throw e3
  // ler ids
  const { data: allSegs, error: e3b } = await client.from('segmentacoes')
    .select('id, classificacao, tipo_produto, classe, tipo_grade')
  if (e3b) throw e3b
  const segIdByKey = new Map(allSegs.map(s => [`${s.classificacao}|${s.tipo_produto}|${s.classe}|${s.tipo_grade}`, s.id]))
  for (const k of segMap.keys()) if (!segIdByKey.has(k)) { console.error('❌ segmentação não encontrada após upsert:', k); process.exit(1) }
  console.log('  segmentações garantidas:', segMap.size)

  // 4d. pedidos
  const pedRows = pedidos.map(p => ({
    visita_id: visitaPorComprador.get(p.comprador_id),
    comprador_id: p.comprador_id,
    segmentacao_id: segIdByKey.get(p.seg.key),
    referencia: p.referencia,
    variante_key: '',
    valor_unitario: p.valor_unitario,
    preco_venda: p.preco_venda,
  }))
  const pedIdByKey = new Map() // (visita_id|referencia) → pedido_id
  const CHUNK = 500
  for (let i = 0; i < pedRows.length; i += CHUNK) {
    const { data, error } = await client.from('pedidos')
      .insert(pedRows.slice(i, i + CHUNK)).select('id, visita_id, referencia')
    if (error) throw error
    for (const r of data) pedIdByKey.set(`${r.visita_id}|${r.referencia}`, r.id)
  }
  console.log('  pedidos inseridos:', pedIdByKey.size)

  // 4e. pedido_itens
  const itemRows = []
  for (const p of pedidos) {
    const vid = visitaPorComprador.get(p.comprador_id)
    const pid = pedIdByKey.get(`${vid}|${p.referencia}`)
    if (pid == null) { console.error('❌ pedido_id ausente p/', vid, p.referencia); process.exit(1) }
    for (const [tamanho, qtd] of Object.entries(p.grade)) {
      if (qtd > 0) itemRows.push({ pedido_id: pid, tamanho, qtd })
    }
  }
  let inseridosItens = 0
  for (let i = 0; i < itemRows.length; i += CHUNK) {
    const { data, error } = await client.from('pedido_itens').insert(itemRows.slice(i, i + CHUNK)).select('id')
    if (error) throw error
    inseridosItens += data.length
  }
  console.log('  pedido_itens inseridos:', inseridosItens)

  const pecasGravadas = itemRows.reduce((s, it) => s + it.qtd, 0)
  console.log('\n✅ GRAVADO. peças:', pecasGravadas, pecasGravadas === totalPecasParser ? '(confere com parser)' : `❌ DIVERGE do parser ${totalPecasParser}`)
  console.log('   Confira com: node report-cobertura.js  (esperado:', parsed.fornecedor_nome, '→ JA_IMPORTADO)')
}

main().catch(e => { console.error('ERRO:', e.message); process.exit(1) })

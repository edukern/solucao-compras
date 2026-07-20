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
const readline = require('readline')
const { makeClient } = require('./lib/db')
const { parsePlanilha, fornecedorDoArquivo } = require('./lib/parse-planilha')
const { COLECAO_ID } = require('./lib/colecao')

// pergunta(msg, opcoes) → índice escolhido (0-based). Mostra a lista, pede número.
function pergunta(msg, opcoes) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    console.log('\n' + msg)
    opcoes.forEach((o, i) => console.log(`  ${i + 1}. ${o}`))
    rl.question(`\nDigite o número (1–${opcoes.length}): `, ans => {
      rl.close()
      const n = parseInt(ans, 10)
      if (n >= 1 && n <= opcoes.length) { resolve(n - 1) }
      else { console.error('Número inválido.'); process.exitCode = 1; resolve(null) }
    })
  })
}

// Erro-sentinela: aborto controlado (mensagem já impressa). Top-level só seta exitCode.
class Abort extends Error {}

const ESTACAO = 'verao' // estação da coleção 1 (colecoes.estacao); segmentacoes.estacao é NOT NULL
const DIR = path.resolve(__dirname, '..', '..', 'Pedidos', '26-2-import')
const NOME_LOJA = { 1: 'Backes Art', 2: 'Backes Prog 1', 3: 'Backes Prog 2', 4: 'Rafael Filial 2', 5: 'Rafael Filial 1', 6: 'Rafael J. Backes', 7: 'Streit Conf', 8: 'FMV Streit Conf' }
const norm = s => String(s ?? '').trim().toUpperCase().replace(/\s+/g, ' ')

// strip: normaliza sem acento/pontuação (RAKEL`S == RAKELS, BEBÊ == BEBE).
// Espelha saude.js — é o matching robusto que evita falsos GAP_TOTAL.
const strip = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '')

// candidatos: todas as linhas de fornecedores que são "a mesma marca" do nome dado
// (igual, prefixo, ou contém-como-prefixo após strip). Pega duplicados/variantes.
function candidatos(nome, forns) {
  const k = strip(nome)
  const out = []
  for (const f of forns) {
    const fk = strip(f.nome)
    if (fk === k || fk.startsWith(k) || k.startsWith(fk)) out.push(f)
  }
  return [...new Map(out.map(c => [c.id, c])).values()]
}

// peças totais (na coleção alvo) das sessões dadas, agrupadas por fornecedor_id.
async function pecasPorFornecedorDeSessoes(client, sessoes) {
  const sessForn = new Map(sessoes.map(s => [s.id, s.fornecedor_id]))
  const sessIds = sessoes.map(s => s.id)
  if (!sessIds.length) return {}
  const { data: vis, error: ev } = await client.from('visitas').select('id, sessao_id').in('sessao_id', sessIds)
  if (ev) throw ev
  const visForn = new Map((vis || []).map(v => [v.id, sessForn.get(v.sessao_id)]))
  const visIds = (vis || []).map(v => v.id)
  const acc = {}
  if (!visIds.length) return acc
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client.from('pedidos')
      .select('visita_id, itens:pedido_itens(qtd)').in('visita_id', visIds).range(from, from + 999)
    if (error) throw error
    for (const p of data) {
      const fid = visForn.get(p.visita_id)
      acc[fid] = (acc[fid] || 0) + (p.itens || []).reduce((a, i) => a + (i.qtd || 0), 0)
    }
    if (data.length < 1000) break
  }
  return acc
}

// ── args ──────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { apply: false, fornecedor: null, rotuloAcima: false }
  for (const arg of argv.slice(2)) {
    if (arg === '--apply') a.apply = true
    else if (arg === '--rotulo-acima') a.rotuloAcima = true
    else if (arg.startsWith('--fornecedor=')) a.fornecedor = arg.slice('--fornecedor='.length).replace(/^["']|["']$/g, '')
    else { console.error('Argumento desconhecido:', arg); throw new Abort() }
  }
  if (!a.fornecedor) { console.error('Uso: node apply.js --fornecedor="NOME" [--apply]'); throw new Abort() }
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
  if (!hit) { console.error(`Arquivo não encontrado para "${fornecedor}" em ${DIR}`); throw new Abort() }
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
    throw new Abort()
  }

  // 1. arquivo + parser
  const filePath = acharArquivo(args.fornecedor)
  const arquivo = path.basename(filePath)
  const parsed = parsePlanilha(filePath, { rotuloTamanhoB: args.rotuloAcima ? 'acima' : 'header' })
  const data_visita = dataVisitaDoArquivo(arquivo)
  if (!data_visita) { console.error('Não consegui extrair data do nome do arquivo:', arquivo); throw new Abort() }

  // 2. fornecedor: candidatos robustos (sem acento/pontuação, com prefixo) — espelha saude.js.
  //    Pega TODAS as linhas-irmãs (duplicados/variantes), não só o nome exato.
  const { data: forns, error: ef } = await client.from('fornecedores').select('id, nome')
  if (ef) throw ef
  const cands = candidatos(parsed.fornecedor_nome, forns)
  if (!cands.length) { console.error(`Fornecedor "${parsed.fornecedor_nome}" não está cadastrado (SEM_CADASTRO). Abortando.`); throw new Abort() }

  // alvo da inserção: match exato (strip) único preferido; se ambíguo, pergunta qual usar.
  const exatos = cands.filter(c => strip(c.nome) === strip(parsed.fornecedor_nome))
  let alvo = exatos.length === 1 ? exatos[0] : (cands.length === 1 ? cands[0] : null)
  if (!alvo) {
    console.log(`\nAMBÍGUO: "${parsed.fornecedor_nome}" casa com ${cands.length} cadastros no sistema.`)
    const opcoes = [...cands.map(c => `${c.nome}  (id ${c.id})`), 'Pular — deixar para depois']
    const idx = await pergunta('Qual usar para esta importação?', opcoes)
    if (idx === null || idx === cands.length) {
      console.log('→ Pulado. Nada gravado.')
      return
    }
    alvo = cands[idx]
    console.log(`→ Usando: ${alvo.nome} (id ${alvo.id})`)
  }
  const fid = alvo.id

  // 3. GUARD GAP_TOTAL robusto: NENHUMA linha-irmã pode ter sessão na coleção alvo.
  //    (o guard antigo só olhava o fid exato → deixava passar Aconchego/Rakels/Mormaii duplicados)
  const candIds = cands.map(c => c.id)
  const { data: sessIrmas, error: es } = await client
    .from('sessoes').select('id, fornecedor_id').in('fornecedor_id', candIds).eq('colecao_id', COLECAO_ID)
  if (es) throw es
  if (sessIrmas.length) {
    const pecasForn = await pecasPorFornecedorDeSessoes(client, sessIrmas)
    const nomePorId = new Map(cands.map(c => [c.id, c.nome]))
    const resumo = [...new Set(sessIrmas.map(s => s.fornecedor_id))].map(f =>
      `${nomePorId.get(f) || '?'}#${f}: ${sessIrmas.filter(s => s.fornecedor_id === f).length} sessão(ões), ${pecasForn[f] || 0} peças`).join(' | ')
    console.error(`ABORTADO: "${parsed.fornecedor_nome}" NÃO é GAP_TOTAL — já há dados de linha(s)-irmã(s) na coleção ${COLECAO_ID}: ${resumo}.`)
    console.error('Use o fluxo apagar-e-reinserir (ou consolide os cadastros duplicados), não o apply puro.')
    throw new Abort()
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
    throw new Abort()
  }
  if (!pedidos.length) { console.error('\n❌ 0 pedidos. Nada a fazer.'); throw new Abort() }

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
  for (const k of segMap.keys()) if (!segIdByKey.has(k)) { console.error('❌ segmentação não encontrada após upsert:', k); throw new Abort() }
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
    if (pid == null) { console.error('❌ pedido_id ausente p/', vid, p.referencia); throw new Abort() }
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

// Aborts sobem como Abort (mensagem já impressa no ponto da falha). Setamos
// process.exitCode em vez de process.exit() para não disparar a assertion do
// libuv no Windows (socket do Supabase ainda aberto) — saída limpa, sem ruído.
main().catch(e => {
  if (!(e instanceof Abort)) console.error('ERRO:', e.message)
  process.exitCode = 1
})

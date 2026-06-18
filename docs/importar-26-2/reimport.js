// reimport.js — APAGA e REINSERE um fornecedor inteiro pela planilha 26/2.
//
// Uso (grupo "Bolt < planilha", perda real — planilha é a fonte da verdade):
//   node reimport.js --fornecedor="SCHRAMM"            # DRY-RUN (não grava)
//   node reimport.js --fornecedor="SCHRAMM" --apply    # backup + apaga + reinsere
//
// Diferença para apply.js: o apply só faz GAP_TOTAL (aborta se já existe sessão).
// Aqui o fornecedor JÁ EXISTE — apagamos as sessões dele na coleção e reinserimos
// do zero pela planilha. Backup em JSON é obrigatório antes de qualquer delete.
//
// A transformação (segmentação, sufixo _tipo_grade, montagem de pedidos) é a MESMA
// do apply.js — copiada aqui de propósito p/ não tocar no apply (que está testado).
// TODO: extrair p/ lib/transform.js e fazer apply.js + reimport.js usarem o mesmo.

const fs = require('fs')
const path = require('path')
const { makeClient } = require('./lib/db')
const { parsePlanilha, fornecedorDoArquivo } = require('./lib/parse-planilha')
const { COLECAO_ID } = require('./lib/colecao')

class Abort extends Error {}

const ESTACAO = 'verao'
const DIR = path.resolve(__dirname, '..', '..', 'Pedidos', '26-2-import')
const NOME_LOJA = { 1: 'Backes Art', 2: 'Backes Prog 1', 3: 'Backes Prog 2', 4: 'Rafael Filial 2', 5: 'Rafael Filial 1', 6: 'Rafael J. Backes', 7: 'Streit Conf', 8: 'FMV Streit Conf' }
const OUT = path.resolve(__dirname, 'out')

const strip = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '')

function candidatos(nome, forns) {
  const k = strip(nome)
  const out = []
  for (const f of forns) {
    const fk = strip(f.nome)
    if (fk === k || fk.startsWith(k) || k.startsWith(fk)) out.push(f)
  }
  return [...new Map(out.map(c => [c.id, c])).values()]
}

// ── transformação (espelho de apply.js / importar-elite.js) ───────────────────
function parseClasse(produto) {
  if (/\bFEM\b/i.test(produto)) return 'FEM'
  if (/\bMASC\b/i.test(produto)) return 'MASC'
  return 'UNI'
}
function parseTipoProduto(produto) {
  return String(produto || '').toUpperCase().replace(/\b(MASC|FEM|UNI)\b/g, '').replace(/\s+/g, ' ').trim() || 'INDEFINIDO'
}
function segKeyOf(it) {
  const classificacao = it.classificacao || 'AD'
  const tipo_grade = it.tipo_grade || 'AD'
  const classe = parseClasse(it.produto)
  const tipo_produto = parseTipoProduto(it.produto)
  return { key: `${classificacao}|${tipo_produto}|${classe}|${tipo_grade}`, classificacao, tipo_produto, classe, tipo_grade }
}
function dataVisitaDoArquivo(arquivo) {
  const m = arquivo.match(/(\d{2})-(\d{2})-(\d{2,4})/)
  if (!m) return null
  let [, dd, mm, yy] = m
  if (yy.length === 2) yy = '20' + yy
  return `${yy}-${mm}-${dd}`
}
function montarPedidos(itens) {
  const warnings = []
  const refCount = new Map()
  for (const it of itens) {
    const k = `${it.comprador_id}|${it.referencia}`
    refCount.set(k, (refCount.get(k) || 0) + 1)
  }
  const map = new Map()
  for (const it of itens) {
    const seg = segKeyOf(it)
    const baseKey = `${it.comprador_id}|${it.referencia}`
    const refFinal = refCount.get(baseKey) > 1 ? `${it.referencia}_${seg.tipo_grade}` : it.referencia
    const k = `${it.comprador_id}|${refFinal}`
    if (map.has(k)) {
      const ex = map.get(k)
      for (const [t, q] of Object.entries(it.grade)) ex.grade[t] = (ex.grade[t] || 0) + q
      ex.pecas += it.pecas
      warnings.push(`Ref fundida comprador=${it.comprador_id} ref=${refFinal} (+${it.pecas} pç)`)
    } else {
      map.set(k, { comprador_id: it.comprador_id, referencia: refFinal, valor_unitario: it.valor_unitario || 0, preco_venda: it.preco_venda || 0, seg, grade: { ...it.grade }, pecas: it.pecas })
    }
  }
  return { pedidos: [...map.values()], warnings }
}

function parseArgs(argv) {
  const a = { apply: false, fornecedor: null, rotuloAcima: false }
  for (const arg of argv.slice(2)) {
    if (arg === '--apply') a.apply = true
    else if (arg === '--rotulo-acima') a.rotuloAcima = true
    else if (arg.startsWith('--fornecedor=')) a.fornecedor = arg.slice('--fornecedor='.length).replace(/^["']|["']$/g, '')
    else { console.error('Argumento desconhecido:', arg); throw new Abort() }
  }
  if (!a.fornecedor) { console.error('Uso: node reimport.js --fornecedor="NOME" [--apply]'); throw new Abort() }
  return a
}

function acharArquivo(fornecedor) {
  const k = strip(fornecedor)
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$'))
  const hit = files.find(f => { const fk = strip(fornecedorDoArquivo(f)); return fk === k || fk.startsWith(k) || k.startsWith(fk) })
  if (!hit) { console.error(`Arquivo não encontrado para "${fornecedor}" em ${DIR}`); throw new Abort() }
  return path.join(DIR, hit)
}

async function main() {
  const args = parseArgs(process.argv)
  const { client, usingServiceRole } = makeClient()
  if (!usingServiceRole) { console.error('ERRO: exige service_role. Configure SUPABASE_SERVICE_KEY no .env.local.'); throw new Abort() }

  // 1. planilha
  const filePath = acharArquivo(args.fornecedor)
  const arquivo = path.basename(filePath)
  const parsed = parsePlanilha(filePath, { rotuloTamanhoB: args.rotuloAcima ? 'acima' : 'header' })
  const data_visita = dataVisitaDoArquivo(arquivo)
  if (!data_visita) { console.error('Não consegui extrair data do nome do arquivo:', arquivo); throw new Abort() }

  // 2. fornecedor: alvo único (reimport não lida com ambiguidade)
  const { data: forns, error: ef } = await client.from('fornecedores').select('id, nome')
  if (ef) throw ef
  const cands = candidatos(parsed.fornecedor_nome, forns)
  const exatos = cands.filter(c => strip(c.nome) === strip(parsed.fornecedor_nome))
  const alvo = exatos.length === 1 ? exatos[0] : (cands.length === 1 ? cands[0] : null)
  if (!alvo) {
    console.error(`AMBÍGUO/ausente: "${parsed.fornecedor_nome}" casa com ${cands.length} cadastros: ${cands.map(c => `${c.nome}#${c.id}`).join(' | ') || '(nenhum)'}. Resolva o cadastro antes de reimportar.`)
    throw new Abort()
  }
  const fid = alvo.id

  // 3. estado ATUAL no Bolt (o que será apagado)
  const { data: sessoesAtuais, error: es } = await client
    .from('sessoes').select('id, data_visita').eq('fornecedor_id', fid).eq('colecao_id', COLECAO_ID)
  if (es) throw es
  const sessaoIds = sessoesAtuais.map(s => s.id)
  let visitasAtuais = [], pedidosAtuais = [], itensAtuais = []
  if (sessaoIds.length) {
    const r1 = await client.from('visitas').select('id, sessao_id, comprador_id').in('sessao_id', sessaoIds)
    if (r1.error) throw r1.error
    visitasAtuais = r1.data
    const visitaIds = visitasAtuais.map(v => v.id)
    if (visitaIds.length) {
      for (let from = 0; ; from += 1000) {
        const r2 = await client.from('pedidos')
          .select('id, visita_id, referencia, itens:pedido_itens(id, tamanho, qtd)')
          .in('visita_id', visitaIds).range(from, from + 999)
        if (r2.error) throw r2.error
        pedidosAtuais.push(...r2.data)
        if (r2.data.length < 1000) break
      }
      for (const p of pedidosAtuais) for (const it of (p.itens || [])) itensAtuais.push({ ...it, pedido_id: p.id })
    }
  }
  const pecasAtuais = itensAtuais.reduce((s, it) => s + (it.qtd || 0), 0)

  // 4. payload NOVO (da planilha)
  const { pedidos, warnings } = montarPedidos(parsed.itens)
  const segMap = new Map()
  for (const p of pedidos) if (!segMap.has(p.seg.key)) segMap.set(p.seg.key, p.seg)
  const compradores = [...new Set(pedidos.map(p => p.comprador_id))].sort((a, b) => a - b)
  const totalPecasPayload = pedidos.reduce((s, p) => s + p.pecas, 0)
  const totalPecasParser = Object.values(parsed.totaisPorLoja).reduce((a, b) => a + b, 0)

  // ── RELATÓRIO ──
  console.log('═'.repeat(70))
  console.log(`${args.apply ? '🟥 REIMPORT (APAGA E GRAVA)' : '🟦 DRY-RUN (não grava)'} — ${parsed.fornecedor_nome} [fornecedor_id ${fid}]`)
  console.log('═'.repeat(70))
  console.log('arquivo      :', arquivo, '| formato', parsed.formato, '| data', data_visita)
  console.log('\nVAI APAGAR (estado atual na coleção', COLECAO_ID + '):')
  console.log(`  sessões ${sessoesAtuais.length} (ids ${sessaoIds.join(',') || '-'}) | visitas ${visitasAtuais.length} | pedidos ${pedidosAtuais.length} | peças ${pecasAtuais}`)
  console.log('\nVAI INSERIR (da planilha):')
  console.log(`  sessão 1 nova | visitas ${compradores.length} | pedidos ${pedidos.length} | segmentações ${segMap.size} | peças ${totalPecasPayload}`)
  console.log(`\nNET de peças: ${pecasAtuais} → ${totalPecasPayload}  (${totalPecasPayload - pecasAtuais > 0 ? '+' : ''}${totalPecasPayload - pecasAtuais})`)
  console.table(compradores.map(c => ({
    loja: `${c} ${NOME_LOJA[c] || ''}`.trim(),
    pedidos_novos: pedidos.filter(p => p.comprador_id === c).length,
    pecas_novas: pedidos.filter(p => p.comprador_id === c).reduce((s, p) => s + p.pecas, 0),
  })))
  if (parsed.abasExtras.length) console.log('⚠ abas extras ignoradas:', parsed.abasExtras.join(', '))
  if (warnings.length) { console.log('\n⚠ avisos:'); for (const w of warnings) console.log('  ', w) }

  // integridade
  if (totalPecasPayload !== totalPecasParser) { console.error(`\n❌ payload ${totalPecasPayload} ≠ parser ${totalPecasParser}. Abortando.`); throw new Abort() }
  if (!pedidos.length) { console.error('\n❌ 0 pedidos na planilha. Abortando.'); throw new Abort() }

  if (!args.apply) {
    console.log('\n✅ DRY-RUN ok. Nada gravado. Rode com --apply para apagar-e-reinserir.')
    return
  }

  // ── BACKUP OBRIGATÓRIO ──
  fs.mkdirSync(OUT, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(OUT, `reimport-backup-${strip(parsed.fornecedor_nome)}-${ts}.json`)
  fs.writeFileSync(backupFile, JSON.stringify({ fornecedor_id: fid, colecao_id: COLECAO_ID, sessoes: sessoesAtuais, visitas: visitasAtuais, pedidos: pedidosAtuais }, null, 2))
  console.log('\n💾 backup salvo:', backupFile)

  // ── APAGAR (ordem FK: itens → pedidos → visitas → sessões) ──
  console.log('→ apagando estado atual...')
  if (pedidosAtuais.length) {
    const pedIds = pedidosAtuais.map(p => p.id)
    for (let i = 0; i < pedIds.length; i += 500) {
      const r = await client.from('pedido_itens').delete().in('pedido_id', pedIds.slice(i, i + 500))
      if (r.error) throw r.error
    }
    for (let i = 0; i < pedIds.length; i += 500) {
      const r = await client.from('pedidos').delete().in('id', pedIds.slice(i, i + 500))
      if (r.error) throw r.error
    }
  }
  if (visitasAtuais.length) {
    const r = await client.from('visitas').delete().in('id', visitasAtuais.map(v => v.id))
    if (r.error) throw r.error
  }
  if (sessaoIds.length) {
    const r = await client.from('sessoes').delete().in('id', sessaoIds)
    if (r.error) throw r.error
  }
  console.log('  apagado.')

  // ── REINSERIR (igual apply.js) ──
  console.log('→ inserindo da planilha...')
  const { data: sRow, error: e1 } = await client.from('sessoes')
    .insert({ fornecedor_id: fid, colecao_id: COLECAO_ID, data_visita }).select('id').single()
  if (e1) throw e1
  const sessao_id = sRow.id

  const { data: vRows, error: e2 } = await client.from('visitas')
    .insert(compradores.map(cid => ({ sessao_id, comprador_id: cid }))).select('id, comprador_id')
  if (e2) throw e2
  const visitaPorComprador = new Map(vRows.map(v => [v.comprador_id, v.id]))

  const segRows = [...segMap.values()].map(s => ({ classificacao: s.classificacao, tipo_produto: s.tipo_produto, classe: s.classe, tipo_grade: s.tipo_grade, estacao: ESTACAO }))
  const { error: e3 } = await client.from('segmentacoes').upsert(segRows, { onConflict: 'classificacao,tipo_produto,classe,tipo_grade', ignoreDuplicates: true })
  if (e3) throw e3
  const { data: allSegs, error: e3b } = await client.from('segmentacoes').select('id, classificacao, tipo_produto, classe, tipo_grade')
  if (e3b) throw e3b
  const segIdByKey = new Map(allSegs.map(s => [`${s.classificacao}|${s.tipo_produto}|${s.classe}|${s.tipo_grade}`, s.id]))
  for (const k of segMap.keys()) if (!segIdByKey.has(k)) { console.error('❌ segmentação não encontrada após upsert:', k); throw new Abort() }

  const pedRows = pedidos.map(p => ({ visita_id: visitaPorComprador.get(p.comprador_id), comprador_id: p.comprador_id, segmentacao_id: segIdByKey.get(p.seg.key), referencia: p.referencia, variante_key: '', valor_unitario: p.valor_unitario, preco_venda: p.preco_venda }))
  const pedIdByKey = new Map()
  const CHUNK = 500
  for (let i = 0; i < pedRows.length; i += CHUNK) {
    const { data, error } = await client.from('pedidos').insert(pedRows.slice(i, i + CHUNK)).select('id, visita_id, referencia')
    if (error) throw error
    for (const r of data) pedIdByKey.set(`${r.visita_id}|${r.referencia}`, r.id)
  }

  const itemRows = []
  for (const p of pedidos) {
    const vid = visitaPorComprador.get(p.comprador_id)
    const pid = pedIdByKey.get(`${vid}|${p.referencia}`)
    if (pid == null) { console.error('❌ pedido_id ausente p/', vid, p.referencia); throw new Abort() }
    for (const [tamanho, qtd] of Object.entries(p.grade)) if (qtd > 0) itemRows.push({ pedido_id: pid, tamanho, qtd })
  }
  let inseridosItens = 0
  for (let i = 0; i < itemRows.length; i += CHUNK) {
    const { data, error } = await client.from('pedido_itens').insert(itemRows.slice(i, i + CHUNK)).select('id')
    if (error) throw error
    inseridosItens += data.length
  }
  const pecasGravadas = itemRows.reduce((s, it) => s + it.qtd, 0)
  console.log('  pedidos:', pedIdByKey.size, '| itens:', inseridosItens, '| peças:', pecasGravadas)
  console.log('\n✅ REIMPORTADO.', pecasGravadas === totalPecasParser ? '(peças conferem com a planilha)' : `❌ DIVERGE do parser ${totalPecasParser}`)
  console.log('   Backup do estado anterior:', backupFile)
  console.log('   Confira: node saude.js')
}

main().catch(e => {
  if (!(e instanceof Abort)) console.error('ERRO:', e.message)
  process.exitCode = 1
})

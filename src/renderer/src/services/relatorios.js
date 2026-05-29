import { supabase } from '../lib/supabase'

export const relatorios = {
  async totaisPorFornecedor(colecao_id, segmentacao_id = null, comprador_id = null) {
    let visitasQuery = supabase
      .from('sessoes')
      .select(`
        fornecedor_id,
        fornecedor:fornecedores(id, nome),
        visitas(
          comprador_id,
          pedidos(
            segmentacao_id,
            valor_unitario,
            desconto_pct,
            pedido_itens(qtd)
          )
        )
      `)
      .eq('colecao_id', colecao_id)
    const { data: sessoes, error } = await visitasQuery
    if (error) throw error

    const byForn = new Map()
    for (const sessao of sessoes ?? []) {
      const fornId = sessao.fornecedor_id
      if (!byForn.has(fornId)) {
        byForn.set(fornId, {
          fornecedor_id: fornId,
          fornecedor_nome: sessao.fornecedor.nome,
          num_skus: 0,
          total_pecas: 0,
          total_valor: 0,
        })
      }
      const agg = byForn.get(fornId)
      for (const visita of sessao.visitas ?? []) {
        if (comprador_id != null && visita.comprador_id !== comprador_id) continue
        for (const pedido of visita.pedidos ?? []) {
          if (segmentacao_id != null && pedido.segmentacao_id !== segmentacao_id) continue
          const qtd = (pedido.pedido_itens ?? []).reduce((s, i) => s + i.qtd, 0)
          if (qtd === 0) continue
          agg.num_skus++
          agg.total_pecas += qtd
          agg.total_valor += pedido.valor_unitario * (1 - pedido.desconto_pct / 100) * qtd
        }
      }
    }

    return [...byForn.values()]
      .filter(r => r.num_skus > 0)
      .sort((a, b) => a.fornecedor_nome.localeCompare(b.fornecedor_nome))
  },

  async totaisPorComprador(colecao_id) {
    const { data: sessoes, error: se } = await supabase
      .from('sessoes')
      .select('id')
      .eq('colecao_id', colecao_id)
    if (se) throw se

    const sessaoIds = (sessoes ?? []).map(s => s.id)
    if (!sessaoIds.length) return []

    const { data, error } = await supabase
      .from('visitas')
      .select(`
        comprador_id,
        comprador:compradores(id, nome, ordem),
        pedidos(valor_unitario, desconto_pct, pedido_itens(qtd))
      `)
      .in('sessao_id', sessaoIds)
    if (error) throw error

    const mapa = new Map()
    for (const v of data ?? []) {
      const comp = v.comprador
      if (!comp) continue
      for (const p of v.pedidos ?? []) {
        const qtd = (p.pedido_itens ?? []).reduce((s, i) => s + (Number(i.qtd) || 0), 0)
        const bruto = qtd * (p.valor_unitario ?? 0)
        const desconto = p.desconto_pct ? bruto * p.desconto_pct / 100 : 0
        const cur = mapa.get(comp.id) ?? { id: comp.id, nome: comp.nome, ordem: comp.ordem, pecas: 0, valor: 0 }
        cur.pecas += qtd
        cur.valor += bruto - desconto
        mapa.set(comp.id, cur)
      }
    }
    return [...mapa.values()].sort((a, b) => a.ordem - b.ordem)
  },

  // Curva ABC: classifica segmentações ou fornecedores por valor total em uma coleção histórica
  async curvaABC(colecaoId, tipo = 'segmentacao') {
    let rows = []

    if (tipo === 'segmentacao') {
      const { data, error } = await supabase
        .from('hist_comprador_produto')
        .select('segmentacao_id, valor_total, segmentacoes(tipo_produto, classe, tipo_grade)')
        .eq('colecao_id', colecaoId)
      if (error) throw error
      const mapa = new Map()
      for (const r of data ?? []) {
        const cur = mapa.get(r.segmentacao_id) ?? {
          id: r.segmentacao_id,
          label: r.segmentacoes
            ? `${r.segmentacoes.tipo_produto} ${r.segmentacoes.classe} ${r.segmentacoes.tipo_grade}`
            : '?',
          valor: 0,
        }
        cur.valor += parseFloat(r.valor_total ?? 0)
        mapa.set(r.segmentacao_id, cur)
      }
      rows = [...mapa.values()]
    } else {
      const { data, error } = await supabase
        .from('hist_fornecedor')
        .select('fornecedor_id, total_liquido, fornecedores(nome)')
        .eq('colecao_id', colecaoId)
      if (error) throw error
      rows = (data ?? []).map(r => ({
        id: r.fornecedor_id,
        label: r.fornecedores?.nome ?? '?',
        valor: parseFloat(r.total_liquido ?? 0),
      }))
    }

    // Sort descending, compute cumulative %, assign A/B/C
    rows.sort((a, b) => b.valor - a.valor)
    const total = rows.reduce((s, r) => s + r.valor, 0)
    let acum = 0
    return rows.map((r, i) => {
      acum += r.valor
      const pct_acum = total > 0 ? acum / total : 0
      return {
        rank: i + 1,
        ...r,
        pct_proprio: total > 0 ? r.valor / total : 0,
        pct_acum,
        classe: pct_acum <= 0.8 ? 'A' : pct_acum <= 0.95 ? 'B' : 'C',
      }
    })
  },

  async totaisPorSegmentacao(colecao_id, comprador_id = null) {
    const { data: sessoes, error } = await supabase
      .from('sessoes')
      .select(`
        visitas(
          comprador_id,
          pedidos(
            valor_unitario,
            desconto_pct,
            segmentacao:segmentacoes(classificacao, tipo_produto, classe, tipo_grade),
            pedido_itens(tamanho, qtd)
          )
        )
      `)
      .eq('colecao_id', colecao_id)
    if (error) throw error

    // key: `classificacao|tipo_produto`
    const bySegTipo = new Map()

    for (const sessao of sessoes ?? []) {
      for (const visita of sessao.visitas ?? []) {
        if (comprador_id != null && visita.comprador_id !== comprador_id) continue
        for (const pedido of visita.pedidos ?? []) {
          const seg = pedido.segmentacao
          if (!seg) continue
          const key = `${seg.classificacao}|${seg.tipo_produto}`
          if (!bySegTipo.has(key)) {
            bySegTipo.set(key, {
              key,
              classificacao: seg.classificacao,
              tipo_produto: seg.tipo_produto,
              total_skus: 0,
              total_pecas: 0,
              total_valor: 0,
              classes: new Map(),
            })
          }
          const card = bySegTipo.get(key)
          const classe = seg.classe || 'GERAL'

          if (!card.classes.has(classe)) {
            card.classes.set(classe, {
              classe,
              tipo_grade: seg.tipo_grade,
              skus: 0,
              pecas: 0,
              valor: 0,
              grade: new Map(),
            })
          }
          const cl = card.classes.get(classe)

          const itens = pedido.pedido_itens ?? []
          const qtdTotal = itens.reduce((s, i) => s + i.qtd, 0)
          if (qtdTotal === 0) continue

          const precoLiq = pedido.valor_unitario * (1 - (pedido.desconto_pct ?? 0) / 100)
          card.total_skus++
          card.total_pecas += qtdTotal
          card.total_valor += precoLiq * qtdTotal
          cl.skus++
          cl.pecas += qtdTotal
          cl.valor += precoLiq * qtdTotal

          for (const item of itens) {
            if (item.qtd === 0) continue
            cl.grade.set(item.tamanho, (cl.grade.get(item.tamanho) ?? 0) + item.qtd)
          }
        }
      }
    }

    return [...bySegTipo.values()]
      .filter(c => c.total_skus > 0)
      .sort((a, b) => a.classificacao.localeCompare(b.classificacao) || a.tipo_produto.localeCompare(b.tipo_produto))
      .map(c => ({
        ...c,
        classes: [...c.classes.values()]
          .sort((a, b) => a.classe.localeCompare(b.classe))
          .map(cl => ({ ...cl, grade: Object.fromEntries(cl.grade) })),
      }))
  },

  async itensPorFornecedor(fornecedor_id, colecao_id, comprador_id = null) {
    const { data: sessoes, error } = await supabase
      .from('sessoes')
      .select(`
        visitas(
          comprador_id,
          pedidos(
            segmentacao_id,
            segmentacao:segmentacoes(id, classificacao, tipo_produto, classe),
            pedido_itens(qtd)
          )
        )
      `)
      .eq('colecao_id', colecao_id)
      .eq('fornecedor_id', fornecedor_id)
    if (error) throw error

    const bySeg = new Map()
    for (const sessao of sessoes ?? []) {
      for (const visita of sessao.visitas ?? []) {
        if (comprador_id != null && visita.comprador_id !== comprador_id) continue
        for (const pedido of visita.pedidos ?? []) {
          const segId = pedido.segmentacao_id
          const seg = pedido.segmentacao
          if (!bySeg.has(segId)) {
            bySeg.set(segId, {
              segmentacao_id: segId,
              classe: seg.classe,
              classificacao: seg.classificacao,
              tipo_produto: seg.tipo_produto,
              total_comprado: 0,
            })
          }
          const qtd = (pedido.pedido_itens ?? []).reduce((s, i) => s + i.qtd, 0)
          bySeg.get(segId).total_comprado += qtd
        }
      }
    }

    return [...bySeg.values()].filter(r => r.total_comprado > 0)
  },
}

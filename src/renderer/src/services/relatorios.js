import { supabase } from '../lib/supabase'

export const relatorios = {
  async totaisPorFornecedor(colecao_id, segmentacao_id = null) {
    const { data: sessoes, error } = await supabase
      .from('sessoes')
      .select(`
        fornecedor_id,
        fornecedor:fornecedores(id, nome),
        visitas(
          pedidos(
            segmentacao_id,
            valor_unitario,
            desconto_pct,
            pedido_itens(qtd)
          )
        )
      `)
      .eq('colecao_id', colecao_id)
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

  async itensPorFornecedor(fornecedor_id, colecao_id) {
    const { data: sessoes, error } = await supabase
      .from('sessoes')
      .select(`
        visitas(
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

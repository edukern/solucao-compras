import { supabase } from '../lib/supabase'

export const dashboard = {
  // Retorna sessões da coleção com totais de peças e valor,
  // filtradas por comprador_id se fornecido (null = todas as lojas)
  async sessoesPorLoja(colecao_id, compradorId = null) {
    const { data: sessoes, error: e1 } = await supabase
      .from('sessoes')
      .select('id, fornecedor_nome, data_visita, vendedor, fornecedor:fornecedores(nome)')
      .eq('colecao_id', colecao_id)
      .order('data_visita', { ascending: false })
    if (e1) throw e1
    const sessaoIds = (sessoes ?? []).map(s => s.id)
    if (!sessaoIds.length) return []

    let q = supabase.from('visitas').select('id, sessao_id').in('sessao_id', sessaoIds)
    if (compradorId) q = q.eq('comprador_id', compradorId)
    const { data: visitas, error: e2 } = await q
    if (e2) throw e2
    const visitaIds = (visitas ?? []).map(v => v.id)
    if (!visitaIds.length) return []

    const { data: pedidos, error: e3 } = await supabase
      .from('pedidos')
      .select('visita_id, valor_unitario, desconto_pct, pedido_itens(qtd)')
      .in('visita_id', visitaIds)
    if (e3) throw e3

    // Agregar por visita
    const visitaStats = {}
    for (const p of pedidos ?? []) {
      if (!visitaStats[p.visita_id]) visitaStats[p.visita_id] = { pecas: 0, valor: 0 }
      const qtd = (p.pedido_itens ?? []).reduce((s, i) => s + (i.qtd ?? 0), 0)
      visitaStats[p.visita_id].pecas += qtd
      visitaStats[p.visita_id].valor += qtd * (p.valor_unitario ?? 0) * (1 - (p.desconto_pct ?? 0) / 100)
    }

    // Agregar por sessão
    const sessaoStats = {}
    const sessaoIdsComVisita = new Set()
    for (const v of visitas ?? []) {
      sessaoIdsComVisita.add(v.sessao_id)
      if (!sessaoStats[v.sessao_id]) sessaoStats[v.sessao_id] = { pecas: 0, valor: 0 }
      const vs = visitaStats[v.id] ?? { pecas: 0, valor: 0 }
      sessaoStats[v.sessao_id].pecas += vs.pecas
      sessaoStats[v.sessao_id].valor += vs.valor
    }

    return (sessoes ?? [])
      .filter(s => sessaoIdsComVisita.has(s.id))
      .map(s => ({
        id:              s.id,
        fornecedor_nome: s.fornecedor?.nome || s.fornecedor_nome || '',
        data_visita:     s.data_visita,
        vendedor:        s.vendedor || '',
        pecas:           sessaoStats[s.id]?.pecas ?? 0,
        valor:           sessaoStats[s.id]?.valor ?? 0,
      }))
  },

  async pedidosColaborador(sessaoId, compradorId) {
    const { data: sessao, error: e1 } = await supabase
      .from('sessoes')
      .select('id, fornecedor_nome, data_visita, fornecedor:fornecedores(nome)')
      .eq('id', sessaoId)
      .single()
    if (e1) throw e1

    const { data: visita, error: e2 } = await supabase
      .from('visitas')
      .select('id, comprador_nome, comprador_cnpj')
      .eq('sessao_id', sessaoId)
      .eq('comprador_id', compradorId)
      .single()
    if (e2) throw e2

    const { data: pedidos, error: e3 } = await supabase
      .from('pedidos')
      .select('id, referencia, tipo_produto, tipo_grade, classe, preco_venda, cor, detalhe, pedido_itens(tamanho, qtd)')
      .eq('visita_id', visita.id)
    if (e3) throw e3

    return { sessao, visita, pedidos: pedidos ?? [] }
  },

  async data(colecao_id) {
    // Projecoes with segmentacao details
    const { data: proj, error: e1 } = await supabase
      .from('projecoes')
      .select(`
        segmentacao_id, tamanho, qtd_ajustada, ordem,
        segmentacoes(id, classificacao, tipo_produto, classe, tipo_grade, estacao)
      `)
      .eq('colecao_id', colecao_id)
    if (e1) throw e1

    // Flatten orders across 3 queries to avoid the 1000-row nested join limit
    const totals = new Map()

    const { data: sessoes, error: e2 } = await supabase
      .from('sessoes')
      .select('id')
      .eq('colecao_id', colecao_id)
    if (e2) throw e2

    const sessaoIds = (sessoes ?? []).map(s => s.id)
    if (sessaoIds.length) {
      const { data: visitas, error: e3 } = await supabase
        .from('visitas')
        .select('id')
        .in('sessao_id', sessaoIds)
      if (e3) throw e3

      const visitaIds = (visitas ?? []).map(v => v.id)
      if (visitaIds.length) {
        const { data: pedidos, error: e4 } = await supabase
          .from('pedidos')
          .select('segmentacao_id, pedido_itens(tamanho, qtd)')
          .in('visita_id', visitaIds)
        if (e4) throw e4

        for (const p of pedidos ?? []) {
          for (const item of p.pedido_itens ?? []) {
            const key = `${p.segmentacao_id}|${item.tamanho}`
            totals.set(key, (totals.get(key) ?? 0) + (item.qtd ?? 0))
          }
        }
      }
    }

    // Flat rows — one per (projecao, tamanho)
    return (proj ?? []).map(r => ({
      seg_id:        r.segmentacoes?.id ?? r.segmentacao_id,
      classificacao: r.segmentacoes?.classificacao ?? '',
      tipo_produto:  r.segmentacoes?.tipo_produto   ?? '',
      classe:        r.segmentacoes?.classe         ?? '',
      tipo_grade:    r.segmentacoes?.tipo_grade     ?? '',
      estacao:       r.segmentacoes?.estacao        ?? '',
      tamanho:       r.tamanho,
      qtd_ajustada:  r.qtd_ajustada,
      ordem:         r.ordem,
      total_pedido:  totals.get(`${r.segmentacao_id}|${r.tamanho}`) ?? 0,
    }))
  }
}

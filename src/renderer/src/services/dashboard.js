import { supabase } from '../lib/supabase'

export const dashboard = {
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

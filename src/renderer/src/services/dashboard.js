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

    // Orders nested via sessoes → visitas → pedidos → pedido_itens
    const { data: sessoes, error: e2 } = await supabase
      .from('sessoes')
      .select('visitas(pedidos(segmentacao_id, pedido_itens(tamanho, qtd)))')
      .eq('colecao_id', colecao_id)
    if (e2) throw e2

    // Aggregate total_pedido per (segmentacao_id, tamanho)
    const totals = new Map()
    for (const s of sessoes ?? []) {
      for (const v of s.visitas ?? []) {
        for (const p of v.pedidos ?? []) {
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

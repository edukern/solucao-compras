import { supabase } from '../lib/supabase'

export const pedidos = {
  async salvarBatch(batch, sessao_id) {
    const results = []
    for (const ped of batch) {
      if (!ped.comprador_id) continue
      let { data: visita } = await supabase
        .from('visitas')
        .select('id')
        .eq('sessao_id', sessao_id)
        .eq('comprador_id', ped.comprador_id)
        .single()
      if (!visita) {
        const { data: novaVisita, error: ve } = await supabase
          .from('visitas')
          .insert({ sessao_id, comprador_id: ped.comprador_id })
          .select()
          .single()
        if (ve) throw ve
        visita = novaVisita
      }
      const { itens, ...pedFields } = ped
      const { data: pedido, error: pe } = await supabase
        .from('pedidos')
        .upsert(
          { ...pedFields, visita_id: visita.id },
          { onConflict: 'visita_id,segmentacao_id' }
        )
        .select()
        .single()
      if (pe) throw pe
      await supabase.from('pedido_itens').delete().eq('pedido_id', pedido.id)
      if (itens?.length) {
        const rows = itens.map(it => ({ pedido_id: pedido.id, tamanho: it.tamanho, qtd: it.qtd }))
        const { error: ie } = await supabase.from('pedido_itens').insert(rows)
        if (ie) throw ie
      }
      results.push(pedido)
    }
    return results
  },

  async byVisita(visita_id) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`*, segmentacao:segmentacoes(*), itens:pedido_itens(tamanho,qtd)`)
      .eq('visita_id', visita_id)
    if (error) throw error
    return data
  },

  async cancelar(id) {
    const { error } = await supabase.from('pedidos').delete().eq('id', id)
    if (error) throw error
  },

  async itensPorFornecedor(sessao_id) {
    const { data, error } = await supabase
      .from('visitas')
      .select(`id, comprador_id, comprador:compradores(nome), pedidos(*, segmentacao:segmentacoes(*), itens:pedido_itens(tamanho,qtd))`)
      .eq('sessao_id', sessao_id)
    if (error) throw error
    return data
  },

  async totaisPorFornecedor(sessao_id) {
    const { data, error } = await supabase
      .from('visitas')
      .select(`comprador_id, comprador:compradores(nome), pedidos(valor_unitario, desconto_pct, icms_pct, pedido_itens(qtd))`)
      .eq('sessao_id', sessao_id)
    if (error) throw error
    return data
  }
}

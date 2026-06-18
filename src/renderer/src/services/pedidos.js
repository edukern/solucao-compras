import { supabase } from '../lib/supabase'

export const pedidos = {
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
  },

  // Maior updated_at (ms) entre pedidos da sessão; null se não houver pedidos.
  async maxUpdatedAt(sessao_id) {
    const { data, error } = await supabase
      .from('visitas')
      .select('pedidos(updated_at)')
      .eq('sessao_id', sessao_id)
    if (error) throw error
    let max = null
    for (const v of data ?? []) {
      for (const p of v.pedidos ?? []) {
        const t = new Date(p.updated_at).getTime()
        if (max === null || t > max) max = t
      }
    }
    return max
  },

  async updateVisita(id, fields) {
    const { error } = await supabase.from('visitas').update(fields).eq('id', id)
    if (error) throw error
  },

  async deleteVisita(id) {
    const { error } = await supabase.from('visitas').delete().eq('id', id)
    if (error) throw error
  },

  // Cria pedidos-template para todas as lojas sem sobrescrever dados já preenchidos
  async inicializarColaboracao(pedidoRows) {
    if (!pedidoRows.length) return 0
    const dedup = new Map()
    for (const r of pedidoRows) dedup.set(`${r.visita_id}|${r.referencia}|${r.variante_key ?? ''}`, { variante_key: '', ...r })
    const { error } = await supabase
      .from('pedidos')
      .upsert([...dedup.values()], { onConflict: 'visita_id,referencia,variante_key', ignoreDuplicates: true })
    if (error) throw error
    return pedidoRows.length
  },

  // Salva itens de rascunho para a visita do organizador (sem criar templates para outras lojas)
  async salvarRascunho(visitaId, pedidoRows) {
    if (!pedidoRows.length) return
    const dedup = new Map()
    for (const r of pedidoRows) dedup.set(`${r.referencia}|${r.variante_key ?? ''}`, { variante_key: '', ...r, visita_id: visitaId })
    const { error } = await supabase
      .from('pedidos')
      .upsert([...dedup.values()], { onConflict: 'visita_id,referencia,variante_key' })
    if (error) throw error
  },

  // Salva pedidos de uma visita específica de forma atômica (RPC transacional).
  // updates: array de { referencia, variante_key, segmentacao_id, valor_unitario,
  //   desconto_pct, icms_pct, markup_pct, preco_venda, cor, detalhe, obs, itens:[{tamanho,qtd}] }
  async salvarPedidosVisita(visitaId, updates) {
    const payload = updates.map(({ itens, ...fields }) => ({
      variante_key: '',
      ...fields,
      itens: (itens ?? []).filter(i => i.qtd > 0),
    }))
    const { error } = await supabase.rpc('salvar_pedidos_visita', {
      p_visita_id: visitaId,
      p_payload: payload,
    })
    if (error) throw error
  },

  // Grava apenas os pedidos (refs) que mudaram para esta visita, via RPC atômica.
  // Mesmo formato de updates de salvarPedidosVisita.
  async salvarQuantidadesDelta(visitaId, updatesAlterados) {
    if (!updatesAlterados.length) return
    return this.salvarPedidosVisita(visitaId, updatesAlterados)
  },

  async atualizarMarkupSessao(sessao_id, precosMap, idx1Str, idx2Str) {
    const idx1 = parseFloat(String(idx1Str ?? '').replace(',', '.'))
    const idx2 = parseFloat(String(idx2Str ?? '').replace(',', '.'))
    const { error: se } = await supabase.from('sessoes').update({
      markup_index1: (!idx1Str || isNaN(idx1)) ? null : idx1,
      markup_index2: (!idx2Str || isNaN(idx2)) ? null : idx2,
    }).eq('id', sessao_id)
    if (se) throw se

    const { data: visitas, error: ve } = await supabase.from('visitas').select('id').eq('sessao_id', sessao_id)
    if (ve) throw ve
    const visitaIds = (visitas ?? []).map(v => v.id)
    if (!visitaIds.length) return

    for (const [referencia, precoStr] of Object.entries(precosMap)) {
      const val = parseFloat(String(precoStr ?? '').replace(',', '.'))
      if (!precoStr || isNaN(val) || val <= 0) continue
      const { error } = await supabase
        .from('pedidos')
        .update({ preco_venda: val })
        .in('visita_id', visitaIds)
        .eq('referencia', referencia)
      if (error) throw error
    }
  }
}

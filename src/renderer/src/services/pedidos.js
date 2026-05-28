import { supabase } from '../lib/supabase'

export const pedidos = {
  async salvarBatch(batch, sessao_id) {
    const validBatch = batch.filter(ped => ped.comprador_id)
    if (!validBatch.length) return []

    // 1. Fetch all existing visitas for this session in one query
    const { data: existingVisitas, error: ve1 } = await supabase
      .from('visitas')
      .select('id, comprador_id')
      .eq('sessao_id', sessao_id)
    if (ve1) throw ve1

    const visitaMap = Object.fromEntries((existingVisitas ?? []).map(v => [v.comprador_id, v.id]))

    // 2. Create any missing visitas in one batch insert
    const neededIds = [...new Set(validBatch.map(p => p.comprador_id))]
    const missingIds = neededIds.filter(id => !visitaMap[id])
    if (missingIds.length) {
      const { data: newVisitas, error: ve2 } = await supabase
        .from('visitas')
        .insert(missingIds.map(id => ({ sessao_id, comprador_id: id })))
        .select('id, comprador_id')
      if (ve2) throw ve2
      for (const v of newVisitas ?? []) visitaMap[v.comprador_id] = v.id
    }

    // 3. Upsert all pedidos in one batch
    const pedidoRows = validBatch.map(({ itens: _itens, ...fields }) => ({
      ...fields,
      visita_id: visitaMap[fields.comprador_id],
    }))
    const { data: savedPedidos, error: pe } = await supabase
      .from('pedidos')
      .upsert(pedidoRows, { onConflict: 'visita_id,segmentacao_id' })
      .select()
    if (pe) throw pe

    // 4. Replace all items in one delete + one insert
    const pedidoIds = (savedPedidos ?? []).map(p => p.id)
    if (pedidoIds.length) {
      const { error: de } = await supabase.from('pedido_itens').delete().in('pedido_id', pedidoIds)
      if (de) throw de
    }

    const byKey = Object.fromEntries(
      (savedPedidos ?? []).map(p => [`${p.visita_id}|${p.segmentacao_id}`, p])
    )
    const allItems = []
    for (const ped of validBatch) {
      const saved = byKey[`${visitaMap[ped.comprador_id]}|${ped.segmentacao_id}`]
      if (saved && ped.itens?.length) {
        for (const it of ped.itens) {
          allItems.push({ pedido_id: saved.id, tamanho: it.tamanho, qtd: it.qtd })
        }
      }
    }
    if (allItems.length) {
      const { error: ie } = await supabase.from('pedido_itens').insert(allItems)
      if (ie) throw ie
    }

    // Return in same order as input so caller's index-based meta merge stays correct
    return validBatch
      .map(b => byKey[`${visitaMap[b.comprador_id]}|${b.segmentacao_id}`])
      .filter(Boolean)
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
    const { error } = await supabase
      .from('pedidos')
      .upsert(pedidoRows, { onConflict: 'visita_id,segmentacao_id', ignoreDuplicates: true })
    if (error) throw error
    return pedidoRows.length
  },

  // Salva pedidos de uma visita específica (uso no preenchimento colaborativo)
  async salvarPedidosVisita(visitaId, updates) {
    // updates: [{ segmentacao_id, valor_unitario, ..., itens: [{tamanho, qtd}] }]
    const pedidoRows = updates.map(({ itens: _itens, ...fields }) => ({
      ...fields,
      visita_id: visitaId,
    }))
    const { data: saved, error: pe } = await supabase
      .from('pedidos')
      .upsert(pedidoRows, { onConflict: 'visita_id,segmentacao_id' })
      .select()
    if (pe) throw pe

    const pedidoIds = (saved ?? []).map(p => p.id)
    if (pedidoIds.length) {
      const { error: de } = await supabase.from('pedido_itens').delete().in('pedido_id', pedidoIds)
      if (de) throw de
    }

    const bySegId = Object.fromEntries((saved ?? []).map(p => [p.segmentacao_id, p]))
    const allItems = []
    for (const upd of updates) {
      const ped = bySegId[upd.segmentacao_id]
      if (ped && upd.itens?.length) {
        for (const it of upd.itens) {
          allItems.push({ pedido_id: ped.id, tamanho: it.tamanho, qtd: it.qtd })
        }
      }
    }
    if (allItems.length) {
      const { error: ie } = await supabase.from('pedido_itens').insert(allItems)
      if (ie) throw ie
    }
  }
}

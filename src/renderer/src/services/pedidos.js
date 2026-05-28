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

    // 3. Upsert all pedidos in one batch (keyed by visita_id + referencia)
    // Deduplica por (visita_id, referencia) mantendo a última ocorrência
    const rowMap = new Map()
    for (const ped of validBatch) {
      const vid = visitaMap[ped.comprador_id]
      const { itens: _itens, ...fields } = ped
      rowMap.set(`${vid}|${ped.referencia}`, { ...fields, visita_id: vid })
    }
    const pedidoRows = [...rowMap.values()]
    const { data: savedPedidos, error: pe } = await supabase
      .from('pedidos')
      .upsert(pedidoRows, { onConflict: 'visita_id,referencia' })
      .select()
    if (pe) throw pe

    // 4. Replace all items in one delete + one insert
    const pedidoIds = (savedPedidos ?? []).map(p => p.id)
    if (pedidoIds.length) {
      const { error: de } = await supabase.from('pedido_itens').delete().in('pedido_id', pedidoIds)
      if (de) throw de
    }

    const byKey = Object.fromEntries(
      (savedPedidos ?? []).map(p => [`${p.visita_id}|${p.referencia}`, p])
    )
    const allItems = []
    for (const ped of validBatch) {
      const saved = byKey[`${visitaMap[ped.comprador_id]}|${ped.referencia}`]
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
      .map(b => byKey[`${visitaMap[b.comprador_id]}|${b.referencia}`])
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
    const dedup = new Map()
    for (const r of pedidoRows) dedup.set(`${r.visita_id}|${r.referencia}`, r)
    const { error } = await supabase
      .from('pedidos')
      .upsert([...dedup.values()], { onConflict: 'visita_id,referencia', ignoreDuplicates: true })
    if (error) throw error
    return pedidoRows.length
  },

  // Salva itens de rascunho para a visita do organizador (sem criar templates para outras lojas)
  async salvarRascunho(visitaId, pedidoRows) {
    if (!pedidoRows.length) return
    const dedup = new Map()
    for (const r of pedidoRows) dedup.set(r.referencia, { ...r, visita_id: visitaId })
    const { error } = await supabase
      .from('pedidos')
      .upsert([...dedup.values()], { onConflict: 'visita_id,referencia' })
    if (error) throw error
  },

  // Salva pedidos de uma visita específica (uso no preenchimento colaborativo)
  async salvarPedidosVisita(visitaId, updates) {
    const pedidoRows = updates.map(({ itens: _itens, ...fields }) => ({
      ...fields,
      visita_id: visitaId,
    }))
    const { data: saved, error: pe } = await supabase
      .from('pedidos')
      .upsert(pedidoRows, { onConflict: 'visita_id,referencia' })
      .select()
    if (pe) throw pe

    const pedidoIds = (saved ?? []).map(p => p.id)
    if (pedidoIds.length) {
      const { error: de } = await supabase.from('pedido_itens').delete().in('pedido_id', pedidoIds)
      if (de) throw de
    }

    const byRef = Object.fromEntries((saved ?? []).map(p => [p.referencia, p]))
    const allItems = []
    for (const upd of updates) {
      const ped = byRef[upd.referencia]
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

import { supabase } from '../lib/supabase'

function normalizeVisitas(visitas) {
  return (visitas ?? []).map(v => ({
    visita_id:        v.id,
    comprador_id:     v.comprador_id,
    comprador_nome:   v.comprador?.nome   ?? '',
    comprador_cnpj:   v.comprador?.cnpj   ?? '',
    comprador_cidade: v.comprador?.cidade  ?? '',
  }))
}

export const sessoes = {
  // compradores_ids: array de comprador IDs para criar as visitas junto
  async create(fields, compradores_ids = []) {
    const { data: sessao, error } = await supabase
      .from('sessoes')
      .insert(fields)
      .select()
      .single()
    if (error) throw error
    if (!compradores_ids.length) return { ...sessao, visitas: [] }
    const { error: ve } = await supabase
      .from('visitas')
      .insert(compradores_ids.map(id => ({ sessao_id: sessao.id, comprador_id: id })))
    if (ve) throw ve
    const { data: vis } = await supabase
      .from('visitas')
      .select('id, comprador_id, comprador:compradores(nome,cnpj,cidade)')
      .eq('sessao_id', sessao.id)
    return { ...sessao, visitas: normalizeVisitas(vis ?? []) }
  },

  async list(colecao_id) {
    const { data, error } = await supabase
      .from('sessoes')
      .select(`*, fornecedor:fornecedores(id,nome), visitas(id, comprador_id, comprador:compradores(nome,cnpj,cidade))`)
      .eq('colecao_id', colecao_id)
      .order('data_visita', { ascending: false })
    if (error) throw error
    return (data ?? []).map(s => ({ ...s, visitas: normalizeVisitas(s.visitas) }))
  },

  async byId(id) {
    const { data, error } = await supabase
      .from('sessoes')
      .select(`*, fornecedor:fornecedores(id,nome), visitas(id, comprador_id, comprador:compradores(nome,cnpj,cidade))`)
      .eq('id', id)
      .single()
    if (error) throw error
    return { ...data, visitas: normalizeVisitas(data.visitas) }
  },

  async update(id, fields) {
    const { data, error } = await supabase
      .from('sessoes')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async cancelar(id) {
    const { error } = await supabase.from('sessoes').delete().eq('id', id)
    if (error) throw error
  },

  // Loads piece count + order value totals for a set of sessao_ids in one query
  async statsPorSessoes(sessaoIds) {
    if (!sessaoIds.length) return []
    const { data, error } = await supabase
      .from('visitas')
      .select(`id, sessao_id, pedidos(valor_unitario, pedido_itens(qtd))`)
      .in('sessao_id', sessaoIds)
    if (error) throw error
    return data ?? []
  }
}

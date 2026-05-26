import { supabase } from '../lib/supabase'

export const sessoes = {
  async create({ fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs, transportadora }) {
    const { data, error } = await supabase
      .from('sessoes')
      .insert({ fornecedor_id, colecao_id, data_visita, vendedor, cond_pag, frete, obs, transportadora })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async list(colecao_id) {
    const { data, error } = await supabase
      .from('sessoes')
      .select(`*, fornecedor:fornecedores(id,nome), visitas(id, comprador_id)`)
      .eq('colecao_id', colecao_id)
      .order('data_visita', { ascending: false })
    if (error) throw error
    return data
  },
  async byId(id) {
    const { data, error } = await supabase
      .from('sessoes')
      .select(`*, fornecedor:fornecedores(id,nome), visitas(id, comprador_id)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
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
  }
}

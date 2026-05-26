import { supabase } from '../lib/supabase'

export const segmentacoes = {
  async list() {
    const { data, error } = await supabase.from('segmentacoes').select('*').order('classificacao')
    if (error) throw error
    return data
  },
  async findOrCreate({ classificacao, tipo_produto, classe, tipo_grade, estacao }) {
    const { data: existing } = await supabase
      .from('segmentacoes')
      .select('*')
      .eq('classificacao', classificacao)
      .eq('tipo_produto', tipo_produto)
      .eq('classe', classe)
      .eq('tipo_grade', tipo_grade)
      .single()
    if (existing) return existing
    const { data, error } = await supabase
      .from('segmentacoes')
      .insert({ classificacao, tipo_produto, classe, tipo_grade, estacao })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async create(fields) {
    const { data, error } = await supabase.from('segmentacoes').insert(fields).select().single()
    if (error) throw error
    return data
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('segmentacoes').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('segmentacoes').delete().eq('id', id)
    if (error) throw error
  }
}

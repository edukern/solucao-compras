import { supabase } from '../lib/supabase'

export const fornecedores = {
  async list() {
    const { data, error } = await supabase.from('fornecedores').select('*').order('nome')
    if (error) throw error
    return data
  },
  async create(fields) {
    const { data, error } = await supabase.from('fornecedores').insert(fields).select().single()
    if (error) throw error
    return data
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('fornecedores').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('fornecedores').delete().eq('id', id)
    if (error) throw error
  },
  async importarDados(rows) {
    const { data, error } = await supabase
      .from('fornecedores')
      .upsert(rows, { onConflict: 'nome' })
      .select()
    if (error) throw error
    return data
  }
}

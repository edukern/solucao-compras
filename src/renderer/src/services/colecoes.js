import { supabase } from '../lib/supabase'

export const colecoes = {
  async list() {
    const { data, error } = await supabase
      .from('colecoes')
      .select('*')
      .order('ano', { ascending: false })
      .order('estacao')
    if (error) throw error
    return data
  },
  async create({ nome, estacao, ano }) {
    const { data, error } = await supabase
      .from('colecoes')
      .insert({ nome, estacao, ano })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async setStatus(id, status) {
    const { error } = await supabase
      .from('colecoes')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  }
}

import { supabase } from '../lib/supabase'

export const compradores = {
  async list() {
    const { data, error } = await supabase.from('compradores').select('*').order('ordem')
    if (error) throw error
    return data ?? []
  },
  async create(fields) {
    const { data, error } = await supabase.from('compradores').insert(fields).select().single()
    if (error) throw error
    return data
  },
  async update(id, fields) {
    const { data, error } = await supabase.from('compradores').update(fields).eq('id', id).select().single()
    if (error) throw error
    return data
  },
  async remove(id) {
    const { error } = await supabase.from('compradores').delete().eq('id', id)
    if (error) throw error
  }
}

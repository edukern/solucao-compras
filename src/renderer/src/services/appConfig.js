import { supabase } from '../lib/supabase'

export const appConfig = {
  async get() {
    const { data, error } = await supabase
      .from('app_config').select('manutencao, mensagem').eq('id', 1).single()
    if (error) throw error
    return data
  },
}

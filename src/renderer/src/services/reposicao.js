import { supabase } from '../lib/supabase'

// Rascunhos de "pedido de reposição" (repor o que vendeu, sem projeção) enviados
// pelo ponto-e-stock via RPC salvar_pedido_reposicao (migração 030). Esta tela só
// LÊ e faz a transição de status — a gravação em si é sempre pela RPC, não daqui.
// Fonte da verdade: tabelas pedidos_reposicao / pedido_reposicao_itens no Supabase.

export const reposicao = {
  async list(status = null) {
    let query = supabase
      .from('pedidos_reposicao')
      .select('id, marca, janela_dias, status, gerado_por, gerado_em, revisado_por, revisado_em')
      .order('gerado_em', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async byId(id) {
    const { data: pedido, error } = await supabase
      .from('pedidos_reposicao')
      .select('id, marca, janela_dias, status, disclaimer_aceito, gerado_por, gerado_em, revisado_por, revisado_em, origem_key')
      .eq('id', id)
      .single()
    if (error) throw error

    const { data: itens, error: e2 } = await supabase
      .from('pedido_reposicao_itens')
      .select('id, referencia, tamanho, qtd, vendido_periodo, estoque_cd, ja_pedido')
      .eq('pedido_reposicao_id', id)
      .order('referencia')
      .order('tamanho')
    if (e2) throw e2

    return { ...pedido, itens: itens ?? [] }
  },

  async marcarStatus(id, status, revisadoPor) {
    const { data, error } = await supabase
      .from('pedidos_reposicao')
      .update({ status, revisado_por: revisadoPor, revisado_em: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

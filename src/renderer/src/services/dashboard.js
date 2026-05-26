import { supabase } from '../lib/supabase'

export const dashboard = {
  async data(colecao_id) {
    const [{ data: proj }, { data: pedidosPorSessao }] = await Promise.all([
      supabase
        .from('projecoes')
        .select('segmentacao_id, tamanho, qtd_ajustada')
        .eq('colecao_id', colecao_id),
      supabase
        .from('sessoes')
        .select(`id, visitas(pedidos(segmentacao_id, pedido_itens(tamanho, qtd)))`)
        .eq('colecao_id', colecao_id)
    ])
    return { projecoes: proj ?? [], sessoes: pedidosPorSessao ?? [] }
  }
}

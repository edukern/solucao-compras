import { supabase } from '../lib/supabase'

// Rascunhos de "pedido de reposição" (repor o que vendeu, sem projeção) enviados
// pelo ponto-e-stock via RPC salvar_pedido_reposicao (migrações 030 + 032). A
// gravação inicial é sempre pela RPC. Esta tela LÊ, edita a quantidade (qtd) de
// cada item enquanto o pedido está 'rascunho', e faz a transição de status.
// Fonte da verdade: tabelas pedidos_reposicao / pedido_reposicao_itens no Supabase.
// list() lê da view pedidos_reposicao_lista (migração 031/032), que agrega
// qtd_referencias/qtd_total por pedido — muda sozinha quando a qtd de um item é
// editada, então o total no card da lista não precisa ser recalculado à mão.

export const reposicao = {
  async list(status = null) {
    let query = supabase
      .from('pedidos_reposicao_lista')
      .select('id, marca, janela_dias, status, gerado_por, gerado_em, revisado_por, revisado_em, qtd_referencias, qtd_total')
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
      .select('id, pedido_reposicao_id, referencia, tamanho, qtd, qtd_sugerida, vendido_periodo, estoque_cd, ja_pedido, nome, tipo, classe, colecao, reffornecedor, codigo_ponto_e, foto_url, tipo_grade, valor_unitario')
      .eq('pedido_reposicao_id', id)
      .order('referencia')
      .order('tamanho')
    if (e2) throw e2

    return { ...pedido, itens: itens ?? [] }
  },

  // Grava a qtd de um conjunto de itens num único upsert (uma requisição, uma
  // transação no PostgREST) — não item a item, pra não deixar metade gravada se
  // a rede cair no meio. Conflito casado pela chave natural
  // (pedido_reposicao_id, referencia, tamanho): tamanho que já existe é
  // atualizado no lugar (mantém o id); tamanho novo (comprador completando a
  // grade além da sugestão) é inserido. `rows` traz a linha inteira porque as
  // colunas NOT NULL precisam estar presentes no caso de INSERT.
  async salvarQuantidades(rows) {
    if (!rows.length) return
    const { error } = await supabase
      .from('pedido_reposicao_itens')
      .upsert(rows, { onConflict: 'pedido_reposicao_id,referencia,tamanho' })
    if (error) throw error
  },

  // Transição de status. Guarda `eq('status', 'rascunho')` pra não "reabrir" um
  // rascunho que outra pessoa já revisou/descartou (duplo-clique, aba parada).
  async marcarStatus(id, status, revisadoPor) {
    const { data, error } = await supabase
      .from('pedidos_reposicao')
      .update({ status, revisado_por: revisadoPor, revisado_em: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'rascunho')
      .select()
      .maybeSingle()
    if (error) throw error
    if (!data) throw new Error('este rascunho não está mais disponível (já foi revisado ou descartado por outra pessoa)')
    return data
  },

  // Volta um pedido revisado/descartado para 'rascunho' (desfaz um "Descartar" ou
  // "Marcar como revisado"). Guarda `eq('status', statusAtual)` pra não brigar com
  // uma mudança concorrente. Limpa revisado_por/em — voltou a ser rascunho.
  async reabrir(id, statusAtual) {
    const { data, error } = await supabase
      .from('pedidos_reposicao')
      .update({ status: 'rascunho', revisado_por: null, revisado_em: null })
      .eq('id', id)
      .eq('status', statusAtual)
      .select()
      .maybeSingle()
    if (error) throw error
    if (!data) throw new Error('este pedido mudou de estado enquanto você olhava — recarregue a lista')
    return data
  },

  // Quantos rascunhos aguardando revisão (pro contador no menu). Uma linha só.
  async contarRascunhos() {
    const { count, error } = await supabase
      .from('pedidos_reposicao')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'rascunho')
    if (error) throw error
    return count ?? 0
  },
}

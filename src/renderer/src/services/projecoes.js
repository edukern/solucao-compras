import { supabase } from '../lib/supabase'

export const projecoes = {
  async get(segmentacao_id, colecao_id) {
    const { data, error } = await supabase
      .from('projecoes')
      .select('*')
      .eq('segmentacao_id', segmentacao_id)
      .eq('colecao_id', colecao_id)
      .order('ordem')
    if (error) throw error
    return data
  },

  async calcular(segmentacao_id, colecao_id, baseIds, metodo) {
    if (!baseIds?.length) return []
    const { data: historico } = await supabase
      .from('grade_historica')
      .select('tamanho, ordem, qtd_comprada')
      .eq('segmentacao_id', segmentacao_id)
      .in('colecao_id', baseIds)
    if (!historico?.length) return []
    const byTam = {}
    for (const row of historico) {
      if (!byTam[row.tamanho]) byTam[row.tamanho] = { qtds: [], ordem: row.ordem }
      byTam[row.tamanho].qtds.push(row.qtd_comprada)
    }
    return Object.entries(byTam).map(([tamanho, { qtds, ordem }]) => {
      let qtd_projetada
      if (metodo === 'media_simples') {
        qtd_projetada = Math.round(qtds.reduce((s, v) => s + v, 0) / qtds.length)
      } else if (metodo === 'media_ponderada') {
        const total = qtds.reduce((s, _, i) => s + (i + 1), 0)
        qtd_projetada = Math.round(qtds.reduce((s, v, i) => s + v * (i + 1), 0) / total)
      } else {
        qtd_projetada = qtds[qtds.length - 1] ?? 0
      }
      return { segmentacao_id, colecao_id, tamanho, ordem, qtd_projetada, qtd_ajustada: qtd_projetada, metodo }
    })
  },

  async salvar(segmentacao_id, colecao_id, rows, metodo) {
    const toUpsert = rows.map(r => ({
      segmentacao_id,
      colecao_id,
      tamanho: r.tamanho,
      ordem: r.ordem ?? 0,
      qtd_projetada: r.qtd_projetada,
      qtd_ajustada: r.qtd_ajustada,
      metodo
    }))
    const { error } = await supabase
      .from('projecoes')
      .upsert(toUpsert, { onConflict: 'segmentacao_id,colecao_id,tamanho' })
    if (error) throw error
  }
}

import { supabase } from '../lib/supabase'

// Converte nome de coleção ('26/1') para ID do hist_* ('2026-1')
function nomeToHistId(nome) {
  const [yr2d, s] = nome.split('/')
  return `${2000 + parseInt(yr2d, 10)}-${s}`
}

export const projecoes = {
  async get(segmentacao_id, colecao_id, comprador_id = null) {
    let q = supabase
      .from('projecoes')
      .select('*')
      .eq('segmentacao_id', segmentacao_id)
      .eq('colecao_id', colecao_id)
      .order('ordem')
    if (comprador_id) q = q.eq('comprador_id', comprador_id)
    const { data, error } = await q
    if (error) throw error
    return data ?? []
  },

  async calcular(segmentacao_id, colecao_id, baseIds, metodo, comprador_id = null) {
    if (!baseIds?.length) return []

    // Busca grade histórica agregada de todas as coleções base
    const { data: historico } = await supabase
      .from('grade_historica')
      .select('tamanho, ordem, qtd_comprada, colecao_id')
      .eq('segmentacao_id', segmentacao_id)
      .in('colecao_id', baseIds)
    if (!historico?.length) return []

    // Se comprador_id fornecido, calcula share por coleção base
    let shareMap = null // Map<intColId, share> onde share = compradorQtd/aggQtd
    if (comprador_id) {
      // Busca nomes das coleções base para converter em hist colecao_id
      const { data: cols } = await supabase
        .from('colecoes')
        .select('id, nome')
        .in('id', baseIds)

      if (cols?.length) {
        const histIds = cols.map(c => nomeToHistId(c.nome))
        const colNameById = Object.fromEntries(cols.map(c => [c.id, c.nome]))

        // Busca qtd do comprador e agregado para todas as coleções base em paralelo
        const [compradorRes, aggRes] = await Promise.all([
          supabase.from('hist_comprador_produto')
            .select('colecao_id, qtd_total')
            .eq('comprador_id', comprador_id)
            .eq('segmentacao_id', segmentacao_id)
            .in('colecao_id', histIds),
          supabase.from('hist_grade')
            .select('colecao_id, qtd_total_comprada')
            .eq('segmentacao_id', segmentacao_id)
            .in('colecao_id', histIds),
        ])

        // Agrega qtd total por histColId
        const compradorByHistId = Object.fromEntries(
          (compradorRes.data ?? []).map(r => [r.colecao_id, r.qtd_total])
        )
        const aggByHistId = {}
        for (const r of aggRes.data ?? []) {
          aggByHistId[r.colecao_id] = (aggByHistId[r.colecao_id] ?? 0) + r.qtd_total_comprada
        }

        // Monta shareMap indexado por intColId (colecao.id)
        shareMap = new Map()
        for (const col of cols) {
          const histId = colNameById[col.id] ? nomeToHistId(colNameById[col.id]) : null
          if (!histId) continue
          const compradorQtd = compradorByHistId[histId] ?? 0
          const aggQtd = aggByHistId[histId] ?? 0
          shareMap.set(col.id, compradorQtd && aggQtd ? compradorQtd / aggQtd : null)
        }
      }
    }

    // Agrupa grade por tamanho, associando coleção para ponderação
    const byTam = {}
    for (const row of historico) {
      if (!byTam[row.tamanho]) byTam[row.tamanho] = { entries: [], ordem: row.ordem }
      byTam[row.tamanho].entries.push({ qtd: row.qtd_comprada, col: row.colecao_id })
    }

    return Object.entries(byTam).map(([tamanho, { entries, ordem }]) => {
      const sorted = [...entries].sort((a, b) => a.col - b.col)

      // Aplica share por coleção se disponível
      const qtds = sorted.map(e => {
        const share = shareMap?.get(e.col)
        return share != null ? Math.round(e.qtd * share) : e.qtd
      })

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

  async salvar(segmentacao_id, colecao_id, rows, metodo, comprador_id = null, user_id = null) {
    const toUpsert = rows.map(r => ({
      segmentacao_id,
      colecao_id,
      tamanho:       r.tamanho,
      ordem:         r.ordem ?? 0,
      qtd_projetada: r.qtd_projetada,
      qtd_ajustada:  r.qtd_ajustada,
      metodo,
      ...(comprador_id != null && { comprador_id }),
      ...(user_id      != null && { user_id }),
    }))
    const { error } = await supabase
      .from('projecoes')
      .upsert(toUpsert, { onConflict: 'comprador_id,segmentacao_id,colecao_id,tamanho' })
    if (error) throw error
  }
}

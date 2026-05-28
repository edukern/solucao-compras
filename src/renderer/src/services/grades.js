import { supabase } from '../lib/supabase'

// Converte nome de coleção ('26/1') para ID do hist_* ('2026-1')
function nomeToHistId(nome) {
  const [yr2d, s] = nome.split('/')
  return `${2000 + parseInt(yr2d, 10)}-${s}`
}

export const grades = {
  // Retorna grade histórica de uma segmentação+coleção.
  // Se comprador_id fornecido e comprador tem histórico: escalona as quantidades
  // pelo share histórico daquele comprador (qtd_comprador / qtd_total).
  async get(segmentacao_id, colecao_id, comprador_id = null) {
    const { data: grade, error } = await supabase
      .from('grade_historica')
      .select('tamanho, ordem, qtd_comprada')
      .eq('segmentacao_id', segmentacao_id)
      .eq('colecao_id', colecao_id)
      .order('ordem')
    if (error) throw error
    if (!grade?.length || !comprador_id) return grade ?? []

    // Busca nome da coleção para converter ao formato hist
    const { data: col } = await supabase
      .from('colecoes').select('nome').eq('id', colecao_id).single()
    if (!col) return grade

    const histColId = nomeToHistId(col.nome)

    // Busca total do comprador e total agregado em paralelo
    const [compradorRes, aggRes] = await Promise.all([
      supabase.from('hist_comprador_produto')
        .select('qtd_total')
        .eq('comprador_id', comprador_id)
        .eq('segmentacao_id', segmentacao_id)
        .eq('colecao_id', histColId)
        .maybeSingle(),
      supabase.from('hist_grade')
        .select('qtd_total_comprada')
        .eq('segmentacao_id', segmentacao_id)
        .eq('colecao_id', histColId),
    ])

    const compradorQtd = compradorRes.data?.qtd_total ?? 0
    const aggQtd = (aggRes.data ?? []).reduce((s, r) => s + r.qtd_total_comprada, 0)

    // Sem histórico deste comprador → retorna agregado sem escalonamento
    if (!compradorQtd || !aggQtd) return grade

    const share = compradorQtd / aggQtd
    return grade.map(r => ({ ...r, qtd_comprada: Math.round(r.qtd_comprada * share) }))
  },

  async importar(file, segmentacao_id, colecao_id) {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws)
    const toInsert = rows.map((r, i) => ({
      segmentacao_id,
      colecao_id,
      tamanho: String(r.tamanho ?? r.Tamanho ?? ''),
      qtd_comprada: Number(r.qtd_comprada ?? r['Qtd Comprada'] ?? 0),
      qtd_vendida:  Number(r.qtd_vendida  ?? r['Qtd Vendida']  ?? 0),
      qtd_estoque:  Number(r.qtd_estoque  ?? r['Qtd Estoque']  ?? 0),
      ordem: i
    }))
    const { data, error } = await supabase
      .from('grade_historica')
      .upsert(toInsert, { onConflict: 'segmentacao_id,colecao_id,tamanho' })
      .select()
    if (error) throw error
    return data
  }
}

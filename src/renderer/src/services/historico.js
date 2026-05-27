import { supabase } from '../lib/supabase'

export const historico = {
  // Lista coleções com dados históricos (distinct de hist_grade)
  async colecoes() {
    const ids = new Set()
    let from = 0
    const PAGE = 2000
    while (true) {
      const { data, error } = await supabase
        .from('hist_grade')
        .select('colecao_id')
        .range(from, from + PAGE - 1)
      if (error) throw error
      for (const r of data ?? []) ids.add(r.colecao_id)
      if (!data || data.length < PAGE) break
      from += PAGE
    }
    return [...ids].sort((a, b) => b.localeCompare(a))
  },

  // Lista segmentações que têm dados históricos
  async segmentacoesComHistorico() {
    // Step 1: collect all distinct segmentacao_ids from hist_grade (two pages max)
    const ids = new Set()
    let from = 0
    const PAGE = 2000
    while (true) {
      const { data, error } = await supabase
        .from('hist_grade')
        .select('segmentacao_id')
        .range(from, from + PAGE - 1)
      if (error) throw error
      for (const r of data ?? []) ids.add(r.segmentacao_id)
      if (!data || data.length < PAGE) break
      from += PAGE
    }
    if (!ids.size) return []

    // Step 2: fetch segmentacoes by those IDs (738 rows max — always fits in one page)
    const { data, error } = await supabase
      .from('segmentacoes')
      .select('id, tipo_produto, classe, tipo_grade')
      .in('id', [...ids])
      .limit(1000)
    if (error) throw error
    return (data ?? []).sort((a, b) =>
      `${a.tipo_produto}${a.classe}${a.tipo_grade}`.localeCompare(
        `${b.tipo_produto}${b.classe}${b.tipo_grade}`
      )
    )
  },

  // Histórico de grade por coleção para uma segmentação
  // Retorna [{colecao_id, tamanho, qtd_total_comprada}] das últimas `limit` coleções
  async gradeHistorica(segmentacaoId, limit = 8) {
    const { data, error } = await supabase
      .from('hist_grade')
      .select('colecao_id, tamanho, qtd_total_comprada')
      .eq('segmentacao_id', segmentacaoId)
      .order('colecao_id', { ascending: false })
    if (error) throw error
    const rows = data ?? []
    // Filtrar apenas as últimas `limit` coleções distintas
    const colecoes = [...new Set(rows.map(r => r.colecao_id))].slice(0, limit)
    return rows.filter(r => colecoes.includes(r.colecao_id))
  },

  // Tendências por loja: totais por comprador por coleção para uma segmentação
  async tendenciasPorLoja(segmentacaoId, limit = 8) {
    const { data, error } = await supabase
      .from('hist_comprador_produto')
      .select(`
        colecao_id, qtd_total, valor_total,
        compradores(id, nome, ordem)
      `)
      .eq('segmentacao_id', segmentacaoId)
      .order('colecao_id', { ascending: false })
    if (error) throw error
    const rows = data ?? []
    const colecoes = [...new Set(rows.map(r => r.colecao_id))].slice(0, limit)
    return rows.filter(r => colecoes.includes(r.colecao_id))
  },

  // Totais por fornecedor em uma coleção
  async totaisPorFornecedor(colecaoId) {
    const { data, error } = await supabase
      .from('hist_fornecedor')
      .select('total_bruto, total_liquido, num_referencias, fornecedores(id, nome)')
      .eq('colecao_id', colecaoId)
      .order('total_liquido', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  // Projeção por tamanho: média simples das últimas nColecoes coleções
  async projecaoGrade(segmentacaoId, nColecoes = 4) {
    const rows = await this.gradeHistorica(segmentacaoId, nColecoes)
    if (!rows.length) return []

    // Agrupar por tamanho
    const mapa = new Map()
    const colecoesUsadas = new Set()
    for (const r of rows) {
      colecoesUsadas.add(r.colecao_id)
      const cur = mapa.get(r.tamanho) ?? { tamanho: r.tamanho, qtds: [] }
      cur.qtds.push(r.qtd_total_comprada)
      mapa.set(r.tamanho, cur)
    }

    return [...mapa.values()].map(({ tamanho, qtds }) => ({
      tamanho,
      qtd_projetada: Math.round(qtds.reduce((a, b) => a + b, 0) / qtds.length),
      colecoes_base: qtds.length,
    }))
  },
}

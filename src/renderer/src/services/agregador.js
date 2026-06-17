import { supabase } from '../lib/supabase'

export const agregador = {
  async compradores() {
    const { data, error } = await supabase
      .from('compradores')
      .select('id, nome, ordem')
      .order('ordem')
    if (error) throw error
    return data ?? []
  },

  // Returns { bySeg, byForn }
  // bySeg: Map<segId, { seg, itens: Map<tam, qtd>, valor }>
  // byForn: Map<fornId, { nome, bySeg: Map<segId, { seg, itens }> }>
  async pedidosPorComprador(comprador_id, colecao_id) {
    const { data: sessoes, error } = await supabase
      .from('sessoes')
      .select(`
        fornecedor_id,
        fornecedor:fornecedores(id, nome),
        visitas(
          comprador_id,
          pedidos(
            segmentacao_id,
            valor_unitario,
            desconto_pct,
            segmentacao:segmentacoes(id, tipo_produto, classificacao, classe, tipo_grade),
            pedido_itens(tamanho, qtd)
          )
        )
      `)
      .eq('colecao_id', colecao_id)
    if (error) throw error

    const bySeg = new Map()
    const byForn = new Map()

    for (const sessao of sessoes ?? []) {
      const fornId = sessao.fornecedor_id
      const fornNome = sessao.fornecedor?.nome ?? '?'

      for (const visita of sessao.visitas ?? []) {
        if (visita.comprador_id !== comprador_id) continue

        for (const pedido of visita.pedidos ?? []) {
          const segId = pedido.segmentacao_id
          const seg = pedido.segmentacao
          const precoLiq = (pedido.valor_unitario ?? 0) * (1 - (pedido.desconto_pct ?? 0) / 100)

          if (!bySeg.has(segId)) bySeg.set(segId, { seg, itens: new Map(), valor: 0 })
          if (!byForn.has(fornId)) byForn.set(fornId, { nome: fornNome, bySeg: new Map() })
          if (!byForn.get(fornId).bySeg.has(segId)) {
            byForn.get(fornId).bySeg.set(segId, { seg, itens: new Map() })
          }

          for (const item of pedido.pedido_itens ?? []) {
            const prev = bySeg.get(segId).itens.get(item.tamanho) ?? 0
            bySeg.get(segId).itens.set(item.tamanho, prev + item.qtd)
            bySeg.get(segId).valor += precoLiq * item.qtd

            const fEntry = byForn.get(fornId).bySeg.get(segId)
            fEntry.itens.set(item.tamanho, (fEntry.itens.get(item.tamanho) ?? 0) + item.qtd)
          }
        }
      }
    }

    return { bySeg, byForn }
  },

  // Returns Map<tipoGrade, Map<tamanho, { comprada, vendida, estoque }>>
  async historicoPorComprador(comprador_id, colecao_id) {
    const { data, error } = await supabase
      .from('hist_empresa_grade')
      .select('tipo_grade, tamanho, qtd_comprada, qtd_vendida, qtd_estoque')
      .eq('comprador_id', comprador_id)
      .eq('colecao_id', colecao_id)
    if (error) throw error

    const result = new Map()
    for (const row of data ?? []) {
      if (!result.has(row.tipo_grade)) result.set(row.tipo_grade, new Map())
      result.get(row.tipo_grade).set(row.tamanho, {
        comprada: row.qtd_comprada,
        vendida:  row.qtd_vendida,
        estoque:  row.qtd_estoque,
      })
    }
    return result
  },

  async importarHistorico(file, comprador_id, colecao_id) {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws)

    const toInsert = rows
      .filter(r => r.tipo_grade && r.tamanho)
      .map(r => ({
        comprador_id,
        colecao_id,
        tipo_grade:   String(r.tipo_grade),
        tamanho:      String(r.tamanho),
        qtd_comprada: Number(r.qtd_comprada ?? 0),
        qtd_vendida:  Number(r.qtd_vendida  ?? 0),
        qtd_estoque:  Number(r.qtd_estoque  ?? 0),
      }))

    const { error } = await supabase
      .from('hist_empresa_grade')
      .upsert(toInsert, { onConflict: 'comprador_id,tipo_grade,colecao_id,tamanho' })
    if (error) throw error
    return toInsert.length
  },
}

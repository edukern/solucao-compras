import { supabase } from '../lib/supabase'

export const grades = {
  async get(segmentacao_id, colecao_id) {
    const { data, error } = await supabase
      .from('grade_historica')
      .select('*')
      .eq('segmentacao_id', segmentacao_id)
      .eq('colecao_id', colecao_id)
      .order('ordem')
    if (error) throw error
    return data
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

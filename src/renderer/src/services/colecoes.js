import { supabase } from '../lib/supabase'

// Ordena coleções pelo NOME "AA/E" (ano/estação), mais nova primeiro.
// Importante: parseia o nome — NÃO usa as colunas estacao/ano (ficam NULL nas
// coleções criadas pelo app). Nomes fora do padrão vão para o fim, de forma
// estável (nunca retorna NaN no comparador).
function parseNome(nome) {
  const m = String(nome ?? '').trim().match(/^(\d+)\s*\/\s*(\d+)$/)
  return m ? { ok: true, ano: Number(m[1]), est: Number(m[2]) } : { ok: false }
}

export function sortColecoes(arr) {
  return [...arr].sort((a, b) => {
    const pa = parseNome(a?.nome), pb = parseNome(b?.nome)
    if (pa.ok && pb.ok) return pb.ano - pa.ano || pb.est - pa.est || (b.id - a.id)
    if (pa.ok) return -1            // válidas antes das custom
    if (pb.ok) return 1
    return String(b?.nome ?? '').localeCompare(String(a?.nome ?? '')) // ambas custom: estável
  })
}

export const colecoes = {
  async list() {
    const { data, error } = await supabase
      .from('colecoes')
      .select('*')
    if (error) throw error
    return sortColecoes(data)
  },
  async create({ nome }) {
    const { data, error } = await supabase
      .from('colecoes')
      .insert({ nome })
      .select()
      .single()
    if (error) throw error
    return data
  },
  async setStatus(id, status) {
    const { error } = await supabase
      .from('colecoes')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  }
}

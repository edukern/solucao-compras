// Helpers puros da grade de revisão de reposição (RevisaoReposicao.jsx).
// Sem React nem CSS de propósito: dá pra testar isolado em ambiente node.
import { GRADE_DEFINITIONS } from '../constants/grades'

export const METRICAS_LEITURA = [
  { key: 'vendido_periodo', label: 'Vendido no período' },
  { key: 'estoque_cd',      label: 'Estoque CD' },
  { key: 'ja_pedido',       label: 'Já pedido' },
]

// Ordena os tamanhos de UMA referência. Se todos couberem numa grade canônica de
// constants/grades.js, usa a ordem dela (P, M, G, GG…). Senão: numéricos em ordem
// crescente e o resto alfabético. Nunca a ordem de chave de objeto — o JS reordena
// chave numérica pra frente sozinho, o que embaralharia grades tipo "0"/"U".
export function ordenarTamanhos(tams) {
  for (const def of Object.values(GRADE_DEFINITIONS)) {
    if (tams.every(t => def.tamanhos.includes(t))) {
      return [...tams].sort((a, b) => def.tamanhos.indexOf(a) - def.tamanhos.indexOf(b))
    }
  }
  return [...tams].sort((a, b) => {
    const na = Number(a), nb = Number(b)
    const aNum = a !== '' && !Number.isNaN(na)
    const bNum = b !== '' && !Number.isNaN(nb)
    if (aNum && bNum) return na - nb
    if (aNum) return -1
    if (bNum) return 1
    return a.localeCompare(b, 'pt-BR')
  })
}

// Agrupa os itens do rascunho por referência, com a lista de tamanhos já ordenada
// e um índice tamanho -> item pra montar a grade em colunas.
export function agruparPorReferencia(itens) {
  const map = new Map()
  for (const it of itens) {
    if (!map.has(it.referencia)) {
      map.set(it.referencia, {
        referencia: it.referencia,
        nome:   it.nome   ?? null,
        tipo:   it.tipo   ?? null,
        classe: it.classe ?? null,
        porTamanho: {},
      })
    }
    map.get(it.referencia).porTamanho[it.tamanho] = it
  }
  return [...map.values()].map(g => ({
    ...g,
    tamanhos: ordenarTamanhos(Object.keys(g.porTamanho)),
  }))
}

// Estado de um campo editado: 'clean' (igual ao original / não tocado),
// 'dirty' (mudou e é inteiro de 1 a 9999), 'invalid' (mudou e não é).
export function editState(raw, original) {
  if (raw === undefined) return 'clean'
  const s = String(raw).trim()
  if (s === String(original)) return 'clean'
  if (!/^\d+$/.test(s)) return 'invalid'
  const n = parseInt(s, 10)
  if (n < 1 || n > 9999) return 'invalid'
  return 'dirty'
}

// Lógica pura de concorrência de quantidades. Sem dependência de Supabase/React.
// qtds shape: { [localId]: { [visitaId]: { [tamanho]: qty } } }

// Retorna a lista de localIds cujo mapa de itens mudou entre prev e next.
// Usado só como verificação booleana "há algo pendente?".
export function computeItensDelta(prev, next) {
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})])
  const changed = []
  for (const k of keys) {
    if (JSON.stringify(prev?.[k] ?? null) !== JSON.stringify(next?.[k] ?? null)) changed.push(k)
  }
  return changed
}

// Retorna { [visitaId]: [localId, ...] } — os pares (visita, ref) cujo mapa de tamanhos
// mudou. Granularidade que garante que gravar uma loja nunca toca outra: o organizador
// editando a loja B nunca regrava a loja A (mesmo sendo a mesma referência).
export function computeDeltaPorVisita(prev, next) {
  const result = {}
  const localIds = new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})])
  for (const localId of localIds) {
    const pv = prev?.[localId] ?? {}
    const nv = next?.[localId] ?? {}
    const visitaIds = new Set([...Object.keys(pv), ...Object.keys(nv)])
    for (const visitaId of visitaIds) {
      if (JSON.stringify(pv[visitaId] ?? null) !== JSON.stringify(nv[visitaId] ?? null)) {
        (result[visitaId] ??= []).push(localId)
      }
    }
  }
  return result
}

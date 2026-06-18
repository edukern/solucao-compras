// Lógica pura de concorrência de quantidades. Sem dependência de Supabase/React.
// qtds shape: { [localId]: { [visitaId]: { [tamanho]: qty } } }

// Retorna a lista de localIds cujo mapa de itens mudou entre prev e next.
// Base do auto-save por delta: grava só o que mudou, na granularidade (ref) por visita.
export function computeItensDelta(prev, next) {
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(next ?? {})])
  const changed = []
  for (const k of keys) {
    if (JSON.stringify(prev?.[k] ?? null) !== JSON.stringify(next?.[k] ?? null)) changed.push(k)
  }
  return changed
}

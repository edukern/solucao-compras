export function fmtColecao(id) {
  const [yr, s] = (id ?? '').split('-')
  return yr ? `${parseInt(yr) % 100}/${s}` : id
}

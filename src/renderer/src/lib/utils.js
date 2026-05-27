export function fmtColecao(id) {
  const [yr, s] = id.split('-')
  return `${parseInt(yr) % 100}/${s}`
}

export function findBaseColecoes(collections, targetColecao) {
  return collections
    .filter(c => c.estacao === targetColecao.estacao && c.ano < targetColecao.ano)
    .sort((a, b) => b.ano - a.ano)
    .slice(0, 2)
    .reverse()
}

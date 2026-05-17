export function aggregateSegmentacao(projRows, pedidoTotais) {
  const projecao = projRows.reduce((s, r) => s + r.qtd_ajustada, 0)
  const comprado = pedidoTotais.reduce((s, r) => s + r.total_pedido, 0)
  const saldo = Math.max(0, projecao - comprado)
  const pct = projecao > 0 ? Math.min(100, Math.round((comprado / projecao) * 100)) : 0
  return { projecao, comprado, saldo, pct }
}

export function aggregateDashboard(rows) {
  const totalProjecao = rows.reduce((s, r) => s + r.projecao, 0)
  const totalComprado = rows.reduce((s, r) => s + r.comprado, 0)
  const totalSaldo = rows.reduce((s, r) => s + r.saldo, 0)
  const pctGeral = totalProjecao > 0 ? Math.min(100, Math.round((totalComprado / totalProjecao) * 100)) : 0
  return { totalProjecao, totalComprado, totalSaldo, pctGeral }
}
